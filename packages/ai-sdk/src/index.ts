/**
 * @batchin/ai-sdk
 * Official Vercel AI SDK Provider for BatchIn 2026 Golden Models and VaaS Verification.
 */

export type BatchInModelId =
  | "deepseek-v4-pro"
  | "deepseek-v4-flash"
  | "deepseek-v4.1-flash"
  | "qwen3.8-max"
  | "hy4-preview"
  | "glm-5.3"
  | "glm-5.3-flash"
  | "kimi-k3"
  | "kimi-k2.7-code"
  | "minimax-m3"
  | (string & {});

export interface BatchInProviderSettings {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>;
}

export interface BatchInModelSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface BatchInLanguageModel {
  readonly specificationVersion: "v1";
  readonly provider: string;
  readonly modelId: string;
  readonly defaultObjectGenerationMode?: "json" | "tool";
  doGenerate(options: any): Promise<any>;
  doStream(options: any): Promise<any>;
}

export class BatchInProvider {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly headers: Record<string, string>;

  constructor(settings: BatchInProviderSettings = {}) {
    this.apiKey = settings.apiKey || (typeof process !== "undefined" ? process.env?.BATCHIN_API_KEY || "" : "");
    this.baseURL = (settings.baseURL || (typeof process !== "undefined" ? process.env?.BATCHIN_BASE_URL : "") || "https://api.batchin.tech/v1").replace(/\/$/, "");
    this.headers = settings.headers || {};
  }

  languageModel(modelId: BatchInModelId, settings: BatchInModelSettings = {}): BatchInLanguageModel {
    const apiKey = this.apiKey;
    const baseURL = this.baseURL;
    const extraHeaders = this.headers;

    return {
      specificationVersion: "v1",
      provider: "batchin",
      modelId,
      defaultObjectGenerationMode: "json",

      async doGenerate(options: any) {
        const messages = options.prompt || [];
        const payload = {
          model: modelId,
          messages: Array.isArray(messages) ? messages : [{ role: "user", content: String(messages) }],
          temperature: settings.temperature ?? options.temperature,
          max_tokens: settings.maxTokens ?? options.maxTokens,
          top_p: settings.topP ?? options.topP,
        };

        const res = await fetch(`${baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...extraHeaders,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`BatchIn API error (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        const text = choice?.message?.content || "";
        const vaasReceiptId = res.headers.get("x-vaas-receipt-id");

        return {
          text,
          finishReason: choice?.finish_reason || "stop",
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
          },
          rawCall: { rawPrompt: payload, rawSettings: settings },
          response: {
            id: data.id,
            timestamp: new Date(),
            modelId: data.model || modelId,
            headers: Object.fromEntries(res.headers.entries()),
            vaasReceiptId: vaasReceiptId || undefined,
          },
        };
      },

      async doStream(options: any) {
        const messages = options.prompt || [];
        const payload = {
          model: modelId,
          messages: Array.isArray(messages) ? messages : [{ role: "user", content: String(messages) }],
          stream: true,
          temperature: settings.temperature ?? options.temperature,
          max_tokens: settings.maxTokens ?? options.maxTokens,
        };

        const res = await fetch(`${baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...extraHeaders,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`BatchIn stream API error (${res.status}): ${errorText}`);
        }

        return {
          stream: res.body,
          response: {
            headers: Object.fromEntries(res.headers.entries()),
          },
        };
      },
    };
  }
}

export function createBatchIn(settings?: BatchInProviderSettings) {
  const provider = new BatchInProvider(settings);
  const modelFactory = (modelId: BatchInModelId, modelSettings?: BatchInModelSettings) =>
    provider.languageModel(modelId, modelSettings);

  modelFactory.languageModel = (modelId: BatchInModelId, modelSettings?: BatchInModelSettings) =>
    provider.languageModel(modelId, modelSettings);

  return modelFactory;
}

export const batchin = createBatchIn();
