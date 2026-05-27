export type BatchInClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

export type RequestBody = Record<string, unknown>;

export class BatchInClient {
  readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: BatchInClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://api.batchin.tech/v1").replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
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
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { ...init, headers });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = new Error(`BatchIn API returned HTTP ${response.status}`);
      (error as Error & { status?: number; payload?: unknown }).status = response.status;
      (error as Error & { status?: number; payload?: unknown }).payload = payload;
      throw error;
    }
    return payload as T;
  }

  models<T = unknown>(): Promise<T> {
    return this.request<T>("/models");
  }

  chatCompletions<T = unknown>(body: RequestBody): Promise<T> {
    return this.request<T>("/chat/completions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  usage<T = unknown>(view = "summary"): Promise<T> {
    return this.request<T>(`/usage/${encodeURIComponent(view)}`);
  }

  receipt<T = unknown>(recordId: string): Promise<T> {
    return this.request<T>(`/audit/${encodeURIComponent(recordId)}/receipt`);
  }
}
