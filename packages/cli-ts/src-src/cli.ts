#!/usr/bin/env node

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

const baseUrl = (process.env.BATCHIN_API_BASE_URL ?? "https://api.batchin.tech/v1").replace(/\/$/, "");
const apiKey = process.env.BATCHIN_API_KEY;

async function request(path: string, init: RequestInit = {}): Promise<Json> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`BatchIn API returned HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "help";
  if (command === "models") {
    console.log(JSON.stringify(await request("/models"), null, 2));
    return;
  }
  if (command === "usage") {
    console.log(JSON.stringify(await request("/usage/summary"), null, 2));
    return;
  }
  if (command === "receipt") {
    const recordId = process.argv[3];
    if (!recordId) {
      throw new Error("usage: batchin receipt <record-id>");
    }
    console.log(JSON.stringify(await request(`/audit/${encodeURIComponent(recordId)}/receipt`), null, 2));
    return;
  }
  console.log("usage: batchin <models|usage|receipt>");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
