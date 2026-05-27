# @batchin/vaas

TypeScript SDK for BatchIn VaaS receipt, evidence, bundle, and audit-chain APIs.

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

    const receipt = await vaas.getReceipt("request_or_record_id");
    const evidence = await vaas.getEvidence("request_or_record_id");
    const result = await vaas.verifyBundle({ receipt, evidence });
    console.log(result);

The SDK performs real BatchIn API calls. It does not create synthetic receipts.
