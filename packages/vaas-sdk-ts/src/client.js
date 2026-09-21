export class VaasClient {
    baseUrl;
    apiKey;
    fetchImpl;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, "");
        this.apiKey = options.apiKey;
        this.fetchImpl = options.fetchImpl ?? fetch;
    }
    async get(path) {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
            headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : undefined
        });
        return response.json();
    }
    async post(path, body) {
        const headers = {
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
    verifySignature(recordId) {
        return this.get(`/v1/audit/${encodeURIComponent(recordId)}/verify`);
    }
    getAudit(recordId) {
        return this.get(`/v1/audit/${encodeURIComponent(recordId)}`);
    }
    getEvidence(recordId) {
        return this.get(`/v1/audit/${encodeURIComponent(recordId)}/evidence`);
    }
    getReceipt(recordId) {
        return this.get(`/v1/audit/${encodeURIComponent(recordId)}/receipt`);
    }
    getBundle(recordId) {
        return this.get(`/v1/audit/${encodeURIComponent(recordId)}/bundle`);
    }
    verifyBundle(bundle) {
        return this.post(`/v1/audit/verify-bundle`, bundle);
    }
    getChain() {
        return this.get(`/v1/audit/chain/integrity`);
    }
    getPubkeyCurrent() {
        return this.get(`/v1/audit/pubkey/current`);
    }
    getAnchorReadiness() {
        return this.get(`/v1/vaas/anchors/readiness`);
    }
    anchorBase(recordId) {
        return this.post(`/v1/vaas/anchor/base`, { record_id: recordId });
    }
    anchorSolana(recordId) {
        return this.post(`/v1/vaas/anchor/solana`, { record_id: recordId });
    }
    requestTestnetAnchor(chain, network, payload) {
        return this.post(`/v1/vaas/anchors/testnet`, { chain, network, ...payload });
    }
    verifyMerkleProofOnServer(payload) {
        return this.post(`/v1/audit/verify-merkle`, payload);
    }
}
/**
 * Client-side Merkle inclusion proof verification helper.
 */
export function verifyMerkleProof(leafHash, proof, expectedRoot, hashFn) {
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
            }
            else {
                const sibling = item.hash.toLowerCase().replace(/^0x/, "");
                current = item.position === "left" ? hashFn(sibling + current) : hashFn(current + sibling);
            }
        }
        return current.toLowerCase().replace(/^0x/, "") === root;
    }
    return Boolean(current && root && proof.length > 0);
}
