# RFC-0001: Verifiable AI as a Service (VaaS) Protocol Specification v1.0

- **RFC Number**: 0001
- **Title**: Verifiable AI as a Service (VaaS) Protocol Specification
- **Authors**: BatchIn Architecture Working Group (`architect@batchin.tech`)
- **Status**: Implemented / Standard
- **Created**: 2026-03-15
- **Updated**: 2026-10-03
- **Smart Contract Target**: Base Sepolia L2 (`0x742d35Cc6634C0532925a3b844Bc454e4438f44e`)

---

## 1. Abstract

As autonomous agents execute mission-critical workflows in finance, healthcare, legal compliance, and smart contracts, the lack of non-repudiation and cryptographic auditability creates existential risks. Traditional API gateways offer only ephemeral logs that can be manipulated or denied by either the model provider or the user.

**VaaS (Verifiable AI as a Service)** defines an open cryptographic protocol for generating verifiable, tamper-evident Proof-of-Inference receipts. Each inference invocation produces an RFC 8032 Ed25519 digital signature and an inclusion proof in a SHA-256 binary Merkle tree, periodically rolled up and anchored into an immutable EVM-compatible L2 smart contract.

---

## 2. Terminology & Standards

- **RFC 8032**: Edwards-Curve Digital Signature Algorithm (Ed25519).
- **RFC 8785**: JSON Canonicalization Scheme (JCS) ensuring deterministic serialization.
- **Leaf Hash ($H_{leaf}$)**: Double SHA-256 digest of canonically serialized inference metadata.
- **Merkle Root ($R$)**: Root hash of the balanced binary Merkle tree aggregating a batch of inference leaves.
- **Proof Vector ($\vec{P}$)**: Sequence of 32-byte sibling hashes and position flags demonstrating $H_{leaf} \in R$.

---

## 3. Cryptographic Formulation

### 3.1 Canonical Payload Serialization
To guarantee deterministic hashing regardless of JSON key ordering, whitespace, or floating point formatting, all payloads MUST be serialized according to **RFC 8785 (JCS)** prior to hashing:

$$P_{canonical} = \text{JCS}(\{ \text{"record\_id"}, \text{"model"}, \text{"prompt\_hash"}, \text{"completion\_hash"}, \text{"timestamp"}, \text{"provider\_id"} \})$$

### 3.2 Leaf Hashing
The prompt and completion contents are never stored on-chain to protect confidentiality. Instead, their cryptographic digests are combined into the leaf:

$$H_{prompt} = \text{SHA256}(\text{PromptBytes})$$
$$H_{completion} = \text{SHA256}(\text{CompletionBytes})$$
$$H_{leaf} = \text{SHA256}(\text{SHA256}(P_{canonical}))$$

### 3.3 Merkle Roll-up & Tree Formation
Let $\mathcal{B} = [H_{leaf}^{(0)}, H_{leaf}^{(1)}, \dots, H_{leaf}^{(N-1)}]$ be a batch of $N$ inference records. The balanced binary tree is constructed where parent nodes are computed as:

$$\text{Parent}(L, R) = \text{SHA256}(L \mathbin{\Vert} R)$$

If the number of leaves at depth $d$ is odd, the final leaf is duplicated.

### 3.4 On-Chain Settlement
BatchIn periodically commits the Merkle Root $R$ to the `VaaSRegistry` contract on Base Sepolia L2:

```solidity
interface IVaaSRegistry {
    event BatchCommitted(
        bytes32 indexed merkleRoot,
        uint256 batchId,
        uint256 timestamp,
        uint32 leafCount
    );

    function commitBatch(
        bytes32 merkleRoot,
        uint32 leafCount,
        bytes calldata signature
    ) external;

    function verifyProof(
        bytes32 merkleRoot,
        bytes32 leafHash,
        bytes32[] calldata proof,
        bool[] calldata isLeft
    ) external view returns (bool);
}
```

---

## 4. Threat Model & Security Properties

| Attack Vector | Mitigation |
| :--- | :--- |
| **Provider Impersonation** | Hardware-secured Ed25519 signing key registered on-chain. |
| **Prompt Tampering** | Changing a single character in the prompt invalidates $H_{prompt}$ and breaks the Merkle leaf. |
| **Timestamp Backdating** | Merkle roots are anchored within Base L2 block times ($t_{anchor} - t_{gen} \le 60\text{s}$). |
| **Sybil Merkle Forgery** | Proof vectors must resolve to a root explicitly committed by the authenticated registrar. |

---

## 5. Offline Verification Workflow

Any client can verify a VaaS receipt completely offline without trusting BatchIn:
1. Recompute $H_{prompt} = \text{SHA256}(\text{raw\_prompt})$ and $H_{completion} = \text{SHA256}(\text{raw\_completion})$.
2. Form the canonical JSON payload and compute $H_{leaf}$.
3. Traverse the sibling path $\vec{P}$ to verify $R = \text{Fold}(\vec{P}, H_{leaf})$.
4. Query the public Base Sepolia RPC to confirm that $R$ was committed at block height $B$.
