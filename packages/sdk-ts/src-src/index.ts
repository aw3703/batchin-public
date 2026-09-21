/**
 * BatchIn Official TypeScript SDK
 * High-performance, OpenAI-compatible client for BatchIn AI Inference Control Plane.
 */

export interface BatchInClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  fetchImpl?: typeof fetch;
}

export class BatchInError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "BatchInError";
    this.status = status;
    this.payload = payload;
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<{ type: string; [key: string]: unknown }>;
  name?: string;
  tool_call_id?: string;
}

export interface ChatCompletionCreateParams {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string | string[];
  tools?: Array<{ type: string; function: Record<string, unknown> }>;
  tool_choice?: string | Record<string, unknown>;
  [key: string]: unknown;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string | null;
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletion {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: ChatCompletionUsage;
  vaas_record_id?: string;
}

export interface ChatCompletionChunkChoice {
  index: number;
  delta: Partial<ChatMessage>;
  finish_reason: string | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
}

export interface ModelInfo {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
}

export interface ModelListResponse {
  object: "list";
  data: ModelInfo[];
}

declare const process: { env: Record<string, string | undefined> } | undefined;

export class BatchIn {
  readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;

  readonly chat: {
    completions: {
      create(params: ChatCompletionCreateParams & { stream: true }): Promise<AsyncIterable<ChatCompletionChunk>>;
      create(params: ChatCompletionCreateParams & { stream?: false }): Promise<ChatCompletion>;
      create(params: ChatCompletionCreateParams): Promise<ChatCompletion | AsyncIterable<ChatCompletionChunk>>;
    };
  };

  readonly models: {
    list(): Promise<ModelListResponse>;
  };

  readonly usage: {
    get(view?: string): Promise<Record<string, unknown>>;
  };

  readonly vaas: {
    getReceipt(recordId: string): Promise<Record<string, unknown>>;
    getBundle(recordId: string): Promise<Record<string, unknown>>;
  };

  constructor(options: BatchInClientOptions = {}) {
    this.apiKey = options.apiKey ?? (typeof process !== "undefined" ? process?.env?.BATCHIN_API_KEY : undefined);
    this.baseUrl = (
      options.baseUrl ??
      (typeof process !== "undefined" ? process?.env?.BATCHIN_API_BASE_URL : undefined) ??
      "https://api.batchin.tech/v1"
    ).replace(/\/$/, "");
    this.timeout = options.timeout ?? 60000;
    this.fetchImpl = options.fetchImpl ?? fetch;

    this.chat = {
      completions: {
        create: (async (params: ChatCompletionCreateParams): Promise<any> => {
          if (params.stream) {
            return this.createChatStream(params);
          }
          return this.request<ChatCompletion>("/chat/completions", {
            method: "POST",
            body: JSON.stringify(params),
          });
        }) as BatchIn["chat"]["completions"]["create"],
      },
    };

    this.models = {
      list: () => this.request<ModelListResponse>("/models"),
    };

    this.usage = {
      get: (view = "summary") => this.request<Record<string, unknown>>(`/usage/${encodeURIComponent(view)}`),
    };

    this.vaas = {
      getReceipt: (recordId: string) =>
        this.request<Record<string, unknown>>(`/audit/${encodeURIComponent(recordId)}/receipt`),
      getBundle: (recordId: string) =>
        this.request<Record<string, unknown>>(`/vaas/${encodeURIComponent(recordId)}/bundle`),
    };
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });

      const text = await response.text();
      let payload: unknown;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text;
      }

      if (!response.ok) {
        throw new BatchInError(
          `BatchIn API error (HTTP ${response.status}): ${typeof payload === "string" ? payload : JSON.stringify(payload)}`,
          response.status,
          payload
        );
      }
      return payload as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private async *createChatStream(params: ChatCompletionCreateParams): AsyncIterable<ChatCompletionChunk> {
    const headers = new Headers();
    headers.set("Accept", "text/event-stream");
    headers.set("Content-Type", "application/json");
    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }

    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...params, stream: true }),
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new BatchInError(`Stream request failed (${response.status}): ${text}`, response.status);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") return;
            try {
              yield JSON.parse(data) as ChatCompletionChunk;
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Backward-compatible alias
export const BatchInClient = BatchIn;
export default BatchIn;
