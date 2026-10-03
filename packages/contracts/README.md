# @batchin/contracts

Public Solidity interfaces for **BatchIn VaaS (Verifiable AI as a Service)** receipt registries and Merkle proof verification.

---

## Deployment status

The addresses below are historical testnet references from the public package and are not a production availability claim. Verify the current network, bytecode, deployment owner, and API readiness before sending a transaction. The private control plane decides whether anchoring or settlement is enabled.

| Network | Contract | Address | Explorer |
| :--- | :--- | :--- | :--- |
| **Base Sepolia** | `BatchInVaaSRegistry` | `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` | [Basescan](https://sepolia.basescan.org/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e) |
| **Base Sepolia** | `BatchInEnterpriseTreasury` | `0xaF898246C697F63d5963959145625D3457591605` | [Basescan](https://sepolia.basescan.org/address/0xaF898246C697F63d5963959145625D3457591605) |

---

## Contract Interfaces

### 1. `BatchInVaaSRegistry.sol`
- Anchors periodic Merkle roots of AI inference receipts onto Base L2.
- Stores Ed25519 signer attestations and PCR0 enclave measurements.
- Verifies Merkle inclusion proofs on-chain for zero-knowledge or optimistic dispute resolution.

### 2. `IERC8004.sol`
- Proposed Ethereum standard interface for verifiable AI inference attribution.

### 3. `BatchInEnterpriseTreasury.sol`
- Treasury and settlement interfaces are experimental and must not be treated as a live payment rail without verifier, entitlement, ledger, refund, and reconciliation evidence.

---

## Integration

Use Foundry or Hardhat:

```solidity
import { IBatchInVaaSRegistry } from "@batchin/contracts/src/BatchInVaaSRegistry.sol";

contract MyAuditor {
    IBatchInVaaSRegistry public registry;

    constructor(address _registry) {
        registry = IBatchInVaaSRegistry(_registry);
    }

    function verifyInference(bytes32 leaf, bytes32[] calldata proof, bytes32 root) external view returns (bool) {
        return registry.verifyMerkleProof(leaf, proof, root);
    }
}
```
