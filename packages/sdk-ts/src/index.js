export class BatchInClient {
    baseUrl;
    apiKey;
    fetchImpl;
    constructor(options = {}) {
        this.baseUrl = (options.baseUrl ?? "https://api.batchin.tech/v1").replace(/\/$/, "");
        this.apiKey = options.apiKey;
        this.fetchImpl = options.fetchImpl ?? fetch;
    }
    async request(path, init = {}) {
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
            error.status = response.status;
            error.payload = payload;
            throw error;
        }
        return payload;
    }
    models() {
        return this.request("/models");
    }
    chatCompletions(body) {
        return this.request("/chat/completions", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }
    usage(view = "summary") {
        return this.request(`/usage/${encodeURIComponent(view)}`);
    }
    receipt(recordId) {
        return this.request(`/audit/${encodeURIComponent(recordId)}/receipt`);
    }
}
