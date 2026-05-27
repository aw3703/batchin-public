export type BatchInClientOptions = {
    baseUrl?: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
};
export type RequestBody = Record<string, unknown>;
export declare class BatchInClient {
    readonly baseUrl: string;
    private readonly apiKey?;
    private readonly fetchImpl;
    constructor(options?: BatchInClientOptions);
    request<T>(path: string, init?: RequestInit): Promise<T>;
    models<T = unknown>(): Promise<T>;
    chatCompletions<T = unknown>(body: RequestBody): Promise<T>;
    usage<T = unknown>(view?: string): Promise<T>;
    receipt<T = unknown>(recordId: string): Promise<T>;
}
