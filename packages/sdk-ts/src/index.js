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
/**
 * Agent Resilience: JSON Auto-Healer
 * Automatically recovers and completes truncated or slightly corrupted JSON tool calls.
 */
export class JsonAutoHealer {
    static repair(raw) {
        if (!raw || typeof raw !== "string") {
            throw new Error("Invalid JSON input for Auto-Healer");
        }
        let text = raw.trim();
        // 1. Strip markdown fences if present
        if (text.startsWith("```")) {
            text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        }
        // Try direct parse first
        try {
            return JSON.parse(text);
        }
        catch {
            // Continue to healing heuristics
        }
        // 2. Find start of JSON structure
        const firstBrace = text.indexOf("{");
        const firstBracket = text.indexOf("[");
        let startIndex = -1;
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIndex = firstBrace;
        }
        else if (firstBracket !== -1) {
            startIndex = firstBracket;
        }
        if (startIndex !== -1) {
            text = text.slice(startIndex);
        }
        // 3. Remove trailing commas before quotes or EOF
        text = text.replace(/,\s*([}\]])/g, "$1").replace(/,\s*$/g, "");
        // 4. Balance open brackets and quotes
        let inString = false;
        let escape = false;
        const stack = [];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (escape) {
                escape = false;
                continue;
            }
            if (char === "\\") {
                escape = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (!inString) {
                if (char === "{" || char === "[") {
                    stack.push(char);
                }
                else if (char === "}" && stack[stack.length - 1] === "{") {
                    stack.pop();
                }
                else if (char === "]" && stack[stack.length - 1] === "[") {
                    stack.pop();
                }
            }
        }
        if (inString) {
            text += '"';
        }
        // Clean any trailing comma after closing string
        text = text.replace(/,\s*$/, "");
        while (stack.length > 0) {
            const open = stack.pop();
            if (open === "{") {
                text += "}";
            }
            else if (open === "[") {
                text += "]";
            }
        }
        return JSON.parse(text);
    }
}
/**
 * Agent Resilience: Hedged Dual-Dispatch
 * Mitigates P95/P99 long tail latency pauses by dispatching a hedged backup request
 * if the primary model does not respond within hedgeDelayMs.
 */
export class HedgedDualDispatch {
    client;
    hedgeDelayMs;
    constructor(client, hedgeDelayMs = 350) {
        this.client = client;
        this.hedgeDelayMs = hedgeDelayMs;
    }
    async execute(options) {
        const { primaryModel, backupModel, messages, ...rest } = options;
        return new Promise((resolve, reject) => {
            let resolved = false;
            let primaryFailed = false;
            let backupFailed = false;
            let primaryError;
            let backupError;
            const triggerPrimary = async () => {
                try {
                    const res = (await this.client.chat.completions.create({
                        ...rest,
                        model: primaryModel,
                        messages,
                    }));
                    if (!resolved) {
                        resolved = true;
                        resolve(res);
                    }
                }
                catch (err) {
                    primaryFailed = true;
                    primaryError = err;
                    if (backupFailed && !resolved) {
                        resolved = true;
                        reject(new Error(`Both primary and backup models failed: ${primaryError}, ${backupError}`));
                    }
                }
            };
            const triggerBackup = async () => {
                try {
                    const res = (await this.client.chat.completions.create({
                        ...rest,
                        model: backupModel,
                        messages,
                    }));
                    if (!resolved) {
                        resolved = true;
                        resolve(res);
                    }
                }
                catch (err) {
                    backupFailed = true;
                    backupError = err;
                    if (primaryFailed && !resolved) {
                        resolved = true;
                        reject(new Error(`Both primary and backup models failed: ${primaryError}, ${backupError}`));
                    }
                }
            };
            triggerPrimary();
            setTimeout(() => {
                if (!resolved && !primaryFailed) {
                    triggerBackup();
                }
            }, this.hedgeDelayMs);
        });
    }
}
/**
 * OpenTelemetry (CNCF GenAI v1.28+) Semantic Conventions Helper
 */
export function formatGenAiSpanAttributes(model, usage, vaasReceiptId) {
    const attrs = {
        "gen_ai.system": "batchin",
        "gen_ai.request.model": model,
    };
    if (usage) {
        attrs["gen_ai.usage.prompt_tokens"] = usage.prompt_tokens;
        attrs["gen_ai.usage.completion_tokens"] = usage.completion_tokens;
        attrs["gen_ai.usage.total_tokens"] = usage.total_tokens;
    }
    if (vaasReceiptId) {
        attrs["vaas.receipt_id"] = vaasReceiptId;
        attrs["vaas.verified"] = 1;
    }
    return attrs;
}
