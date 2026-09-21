/**
 * BatchIn Official TypeScript SDK
 * High-performance, OpenAI-compatible client for BatchIn AI Inference Control Plane.
 */
export class BatchInError extends Error {
    status;
    payload;
    constructor(message, status, payload) {
        super(message);
        this.name = "BatchInError";
        this.status = status;
        this.payload = payload;
    }
}
export class BatchIn {
    baseUrl;
    apiKey;
    timeout;
    fetchImpl;
    chat;
    models;
    usage;
    vaas;
    constructor(options = {}) {
        this.apiKey = options.apiKey ?? (typeof process !== "undefined" ? process?.env?.BATCHIN_API_KEY : undefined);
        this.baseUrl = (options.baseUrl ??
            (typeof process !== "undefined" ? process?.env?.BATCHIN_API_BASE_URL : undefined) ??
            "https://api.batchin.tech/v1").replace(/\/$/, "");
        this.timeout = options.timeout ?? 60000;
        this.fetchImpl = options.fetchImpl ?? fetch;
        this.chat = {
            completions: {
                create: (async (params) => {
                    if (params.stream) {
                        return this.createChatStream(params);
                    }
                    return this.request("/chat/completions", {
                        method: "POST",
                        body: JSON.stringify(params),
                    });
                }),
            },
        };
        this.models = {
            list: () => this.request("/models"),
        };
        this.usage = {
            get: (view = "summary") => this.request(`/usage/${encodeURIComponent(view)}`),
        };
        this.vaas = {
            getReceipt: (recordId) => this.request(`/audit/${encodeURIComponent(recordId)}/receipt`),
            getBundle: (recordId) => this.request(`/vaas/${encodeURIComponent(recordId)}/bundle`),
        };
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
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
                ...init,
                headers,
                signal: controller.signal,
            });
            const text = await response.text();
            let payload;
            try {
                payload = text ? JSON.parse(text) : null;
            }
            catch {
                payload = text;
            }
            if (!response.ok) {
                throw new BatchInError(`BatchIn API error (HTTP ${response.status}): ${typeof payload === "string" ? payload : JSON.stringify(payload)}`, response.status, payload);
            }
            return payload;
        }
        finally {
            clearTimeout(timer);
        }
    }
    async *createChatStream(params) {
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
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith(":"))
                        continue;
                    if (trimmed.startsWith("data: ")) {
                        const data = trimmed.slice(6);
                        if (data === "[DONE]")
                            return;
                        try {
                            yield JSON.parse(data);
                        }
                        catch {
                            // Ignore partial JSON chunks
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
// Backward-compatible alias
export const BatchInClient = BatchIn;
export default BatchIn;
