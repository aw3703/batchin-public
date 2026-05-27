# @batchin/vaas

TypeScript integration client for authenticated BatchIn developer workflows.

## Install

This package is source-ready in the public BatchIn repository. Use the source
checkout until npm publication is verified:

    git clone https://github.com/aw3703/batchin-public.git
    cd batchin-public/packages/vaas-sdk-ts
    npm install
    npm run build

## Usage

    import { VaasClient } from "@batchin/vaas";

    const vaas = new VaasClient({
      baseUrl: "https://api.batchin.tech",
      apiKey: process.env.BATCHIN_API_KEY,
    });

The SDK performs real BatchIn API calls. Customer operations require API-key
authentication and workspace entitlement checks.
