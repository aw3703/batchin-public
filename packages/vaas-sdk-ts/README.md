# @batchin/vaas

Official TypeScript SDK and standalone CLI verifier for **BatchIn VaaS (Verifiable AI as a Service)**.

Provides client-side verification of AI inference receipt evidence, input/output SHA-256 hashes, Ed25519 signatures, and Merkle inclusion proofs. Anchor requests are readiness-gated by the hosted API.

---

## Installation

```bash
npm install @batchin/vaas
```

Or run the CLI verifier directly via `npx`:

```bash
npx @batchin/vaas verify <record_id>
```

---

## Usage

### 1. Cryptographic Receipt Verification

```typescript
import { BatchInVaaSClient, verifyMerkleProof } from "@batchin/vaas";

const vaas = new BatchInVaaSClient({
  baseUrl: "https://api.batchin.tech",
  apiKey: process.env.BATCHIN_API_KEY,
});

// Fetch and verify cryptographic bundle
const recordId = "rec_98bf12";
const receipt = await vaas.getReceipt(recordId);
const evidence = await vaas.getEvidence(recordId);

const result = await vaas.verifyBundle({ receipt, evidence });
console.log("Bundle verification status:", result);
```

### 2. Anchor readiness (gated)

```typescript
// Query anchor readiness
const readiness = await vaas.getAnchorReadiness();
console.log("Anchor readiness:", readiness);

// Request an anchor only when the readiness response permits it.
const baseAnchor = await vaas.anchorBase(recordId);
console.log("Base L2 anchor:", baseAnchor);
```

`queryBaseL2Attestation(recordId)` only checks whether the configured registry
contract is deployed. It deliberately returns `verified: false` until a receipt
hash, Merkle proof, and registry verification call are supplied; contract bytecode
presence alone is not evidence that a particular record is anchored.

### 3. Client-Side Merkle Inclusion Proof

```typescript
import { verifyMerkleProof } from "@batchin/vaas";

const isValid = verifyMerkleProof(
  "0xleaf_hash...",
  [{ position: "left", hash: "0xsibling_hash..." }],
  "0xexpected_root..."
);

console.log("Merkle proof valid:", isValid);
```

---

## Standalone CLI Verifier

```bash
# Human-readable visual verification
npx @batchin/vaas verify rec_98bf12

# Raw JSON output for automated CI pipelines
npx @batchin/vaas verify rec_98bf12 --json
```
