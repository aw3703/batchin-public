export interface VaasClientOptions {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

export class VaasClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: VaasClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async get(path: string): Promise<unknown> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : undefined
    });
    return response.json();
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    return response.json();
  }

  verifySignature(recordId: string): Promise<unknown> {
    return this.get(`/v1/audit/${encodeURIComponent(recordId)}/verify`);
  }

  getAudit(recordId: string): Promise<unknown> {
    return this.get(`/v1/audit/${encodeURIComponent(recordId)}`);
  }

  getEvidence(recordId: string): Promise<unknown> {
    return this.get(`/v1/audit/${encodeURIComponent(recordId)}/evidence`);
  }

  getReceipt(recordId: string): Promise<unknown> {
    return this.get(`/v1/audit/${encodeURIComponent(recordId)}/receipt`);
  }

  getBundle(recordId: string): Promise<unknown> {
    return this.get(`/v1/audit/${encodeURIComponent(recordId)}/bundle`);
  }

  verifyBundle(bundle: { receipt: unknown; evidence: unknown }): Promise<unknown> {
    return this.post(`/v1/audit/verify-bundle`, bundle);
  }

  getChain(): Promise<unknown> {
    return this.get(`/v1/audit/chain/integrity`);
  }

  getPubkeyCurrent(): Promise<unknown> {
    return this.get(`/v1/audit/pubkey/current`);
  }
}
