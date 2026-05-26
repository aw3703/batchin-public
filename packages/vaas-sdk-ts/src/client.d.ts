export interface VaasClientOptions {
    baseUrl: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
}
export declare class VaasClient {
    private readonly baseUrl;
    private readonly apiKey?;
    private readonly fetchImpl;
    constructor(options: VaasClientOptions);
    private get;
    private post;
    verifySignature(recordId: string): Promise<unknown>;
    getAudit(recordId: string): Promise<unknown>;
    getEvidence(recordId: string): Promise<unknown>;
    getReceipt(recordId: string): Promise<unknown>;
    getBundle(recordId: string): Promise<unknown>;
    verifyBundle(bundle: {
        receipt: unknown;
        evidence: unknown;
    }): Promise<unknown>;
    getChain(): Promise<unknown>;
    getPubkeyCurrent(): Promise<unknown>;
}
