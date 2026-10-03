# Contributing to BatchIn Open-Source Resources

Thank you for your interest in contributing to the BatchIn developer ecosystem!

BatchIn is a verification-first developer platform. This repository hosts public SDKs, CLI tools, MCP servers, agent configurations, and cryptographic VaaS verification components. Hosted model and payment availability is owned by the private control plane and must never be inferred from a client fixture or a model name.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to `security@batchin.tech`.

---

## Development Workflow

### Prerequisites
- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0 (or pnpm >= 9.0)
- **Python**: >= 3.10
- **uv**: >= 0.1.0 (recommended for Python package management)

### Initial Setup
Clone the repository and install the locked workspace dependencies:
```bash
git clone https://github.com/aw3703/batchin-public.git
cd batchin-public
npm ci
```

### Building Packages
To build all TypeScript packages across the monorepo:
```bash
npm run build
```

To typecheck all TypeScript packages:
```bash
npm run typecheck
```

### Python Packages
For Python packages under `packages/sdk-python`, `packages/mcp-server`, and `packages/vaas-sdk-python`:
```bash
cd packages/mcp-server
python3 -m pip install -e .
```

---

## Strict Compliance & Product Scope Policy

1. **Verification-First Focus**: BatchIn is focused on verifiable AI inference (VaaS), cryptographic receipt validation, and high-availability API routing.
2. **Dedicated Capacity & Compliance**: All capacity is referenced via software terminology (`Dedicated Capacity`, `Reserved Throughput`, `Compute Nodes`). We do not reference physical compute hardware or engage in hardware reselling.
3. **No Fake Cryptographic Data**: Never write code or tests that mock or forge production cryptographic signatures or VaaS receipts as valid unless explicitly marked as a mock test fixture.
4. **Evidence boundary**: Keep provider smoke, pricing, billing, payment, and chain-anchoring claims tied to runtime evidence. Client tests may use fixtures, but documentation must label them as fixtures and must not call them production evidence.

---

## Submitting Pull Requests

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-enhancement
   ```
2. Ensure your changes compile and pass tests:
   ```bash
   npm ci
   npm run build
   npm run typecheck
   npm run test:ts
   npm run test:py
   npm run compliance
   ```
3. Commit with a concise conventional commit message:
   ```bash
   git commit -m "feat(sdk-ts): add async stream support"
   ```
4. Push to your fork and submit a Pull Request against `main`.
