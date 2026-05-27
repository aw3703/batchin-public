# @batchin/sdk

TypeScript SDK for authenticated BatchIn API workflows.

## Install

This package is source-ready. Registry publication must be verified before
installing by package name.

    git clone https://github.com/aw3703/batchin-public.git
    cd batchin-public/packages/sdk-ts
    npm install
    npm run build

## Quickstart

    import { BatchInClient } from "@batchin/sdk";

    const client = new BatchInClient({
      apiKey: process.env.BATCHIN_API_KEY,
    });

    const models = await client.models();

Customer operations require API-key authentication and workspace entitlement
checks.
