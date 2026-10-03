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
batchin models
batchin chat "Explain optimistic rollups in one sentence" --model <model-id-from-catalog>
```

### 3. Cryptographic VaaS Receipt Verification

```bash
batchin verify rec_98bf12
```

Outputs the evidence returned by the API. A chain anchor is shown only when the hosted readiness and receipt responses confirm one; a local fixture or HTTP 200 is not proof of settlement.

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
