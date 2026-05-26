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
}
