# @batchin/cli

Official command-line interface for the **BatchIn AI Inference Control Plane**.

---

## Installation

```bash
npm install -g @batchin/cli
```

Or run without installing using `npx`:

```bash
npx @batchin/cli <command>
```

---

## Commands

### 1. List Available Models & Routes

```bash
batchin models
```

### 2. Interactive Terminal Chat Testing

```bash
batchin chat "Explain optimistic rollups in one sentence" --model deepseek-v4-pro
```

### 3. Cryptographic VaaS Receipt Verification

```bash
batchin verify rec_98bf12
```

Outputs verified Ed25519 signature status, SHA-256 leaf hash, and Base L2 settlement anchor.

### 4. Diagnostics & Connectivity Check

```bash
batchin doctor
```

Tests API endpoint connectivity, authentication status, and network latency.

---

## Configuration

Set environment variables:

```bash
export BATCHIN_API_KEY="your-api-key"
export BATCHIN_API_BASE_URL="https://api.batchin.tech/v1" # optional
```
