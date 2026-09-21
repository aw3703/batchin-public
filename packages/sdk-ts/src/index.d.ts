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
export declare class BatchInError extends Error {
    status?: number;
    payload?: unknown;
    constructor(message: string, status?: number, payload?: unknown);
}
export interface ChatMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string | Array<{
        type: string;
        [key: string]: unknown;
    }>;
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
    tools?: Array<{
        type: string;
        function: Record<string, unknown>;
    }>;
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
export declare class BatchIn {
    readonly baseUrl: string;
    private readonly apiKey?;
    private readonly timeout;
    private readonly fetchImpl;
    readonly chat: {
        completions: {
            create(params: ChatCompletionCreateParams & {
                stream: true;
            }): Promise<AsyncIterable<ChatCompletionChunk>>;
            create(params: ChatCompletionCreateParams & {
                stream?: false;
            }): Promise<ChatCompletion>;
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
    constructor(options?: BatchInClientOptions);
    request<T>(path: string, init?: RequestInit): Promise<T>;
    private createChatStream;
}
export declare const BatchInClient: typeof BatchIn;
export default BatchIn;
/**
 * Agent Resilience: JSON Auto-Healer
 * Automatically recovers and completes truncated or slightly corrupted JSON tool calls.
 */
export declare class JsonAutoHealer {
    static repair<T = any>(raw: string): T;
}
/**
 * Agent Resilience: Hedged Dual-Dispatch
 * Mitigates P95/P99 long tail latency pauses by dispatching a hedged backup request
 * if the primary model does not respond within hedgeDelayMs.
 */
export declare class HedgedDualDispatch {
    private readonly client;
    private readonly hedgeDelayMs;
    constructor(client: BatchIn, hedgeDelayMs?: number);
    execute(options: {
        primaryModel: string;
        backupModel: string;
        messages: ChatMessage[];
        [key: string]: unknown;
    }): Promise<ChatCompletion>;
}
/**
 * OpenTelemetry (CNCF GenAI v1.28+) Semantic Conventions Helper
 */
export declare function formatGenAiSpanAttributes(model: string, usage?: ChatCompletionUsage, vaasReceiptId?: string): Record<string, string | number>;
