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
    getAnchorReadiness(): Promise<unknown>;
    anchorBase(recordId: string): Promise<unknown>;
    anchorSolana(recordId: string): Promise<unknown>;
    requestTestnetAnchor(chain: "base" | "solana", network: "base-sepolia" | "solana-devnet", payload: {
        receipt_hash?: string;
        merkle_root?: string;
    }): Promise<unknown>;
    verifyMerkleProofOnServer(payload: {
        leaf_hash: string;
        proof: string[];
        root: string;
    }): Promise<unknown>;
}
/**
 * Client-side Merkle inclusion proof verification helper.
 */
export declare function verifyMerkleProof(leafHash: string, proof: Array<{
    position: "left" | "right";
    hash: string;
} | string>, expectedRoot: string, hashFn?: (combined: string) => string): boolean;
export declare const BatchInVaaSClient: typeof VaasClient;
/**
 * Lightweight Base L2 on-chain attestation reader (Viem v2 compatible structure)
 */
export declare function queryBaseL2Attestation(recordId: string, options?: {
    contractAddress?: string;
    rpcUrl?: string;
    fetchImpl?: typeof fetch;
}): Promise<{
    recordId: string;
    verified: boolean;
    contract: string;
    verification: "receipt_not_checked" | "rpc_unavailable";
}>;
