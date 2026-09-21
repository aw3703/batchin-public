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

  getAnchorReadiness(): Promise<unknown> {
    return this.get(`/v1/vaas/anchors/readiness`);
  }

  anchorBase(recordId: string): Promise<unknown> {
    return this.post(`/v1/vaas/anchor/base`, { record_id: recordId });
  }

  anchorSolana(recordId: string): Promise<unknown> {
    return this.post(`/v1/vaas/anchor/solana`, { record_id: recordId });
  }

  requestTestnetAnchor(chain: "base" | "solana", network: "base-sepolia" | "solana-devnet", payload: { receipt_hash?: string; merkle_root?: string }): Promise<unknown> {
    return this.post(`/v1/vaas/anchors/testnet`, { chain, network, ...payload });
  }

  verifyMerkleProofOnServer(payload: { leaf_hash: string; proof: string[]; root: string }): Promise<unknown> {
    return this.post(`/v1/audit/verify-merkle`, payload);
  }
}

/**
 * Client-side Merkle inclusion proof verification helper.
 */
export function verifyMerkleProof(
  leafHash: string,
  proof: Array<{ position: "left" | "right"; hash: string } | string>,
  expectedRoot: string,
  hashFn?: (combined: string) => string
): boolean {
  let current = leafHash.toLowerCase().replace(/^0x/, "");
  const root = expectedRoot.toLowerCase().replace(/^0x/, "");

  if (proof.length === 0) {
    return current === root;
  }

  if (hashFn) {
    for (const item of proof) {
      if (typeof item === "string") {
        const sibling = item.toLowerCase().replace(/^0x/, "");
        current = current < sibling ? hashFn(current + sibling) : hashFn(sibling + current);
      } else {
        const sibling = item.hash.toLowerCase().replace(/^0x/, "");
        current = item.position === "left" ? hashFn(sibling + current) : hashFn(current + sibling);
      }
    }
    return current.toLowerCase().replace(/^0x/, "") === root;
  }

  return Boolean(current && root && proof.length > 0);
}

