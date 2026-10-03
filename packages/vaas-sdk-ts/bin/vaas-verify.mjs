#!/usr/bin/env node

/**
 * Verify a real VaaS record through the authenticated BatchIn API.
 * This command deliberately fails closed: it never constructs a receipt or
 * marks a record as verified from its ID alone.
 */
import process from "node:process";

const args = process.argv.slice(2);
const isJson = args.includes("--json");
const recordId = args[1];
const endpointIndex = args.indexOf("--endpoint");
const configuredEndpoint = endpointIndex !== -1 && args[endpointIndex + 1]
  ? args[endpointIndex + 1]
  : process.env.BATCHIN_API_BASE_URL || "https://api.batchin.tech";
const apiKey = process.env.BATCHIN_API_KEY;

function printHelp() {
  console.log(`
BatchIn VaaS verifier

Usage:
  npx @batchin/vaas verify <record_id> [options]

Options:
  --endpoint <url>  API endpoint (default: https://api.batchin.tech)
  --json            Print the API verification response as JSON
  --help, -h        Show this help

The command requires BATCHIN_API_KEY and verifies the record returned by the
authenticated API. It does not create synthetic receipts or anchors.
`);
}

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (!recordId) {
  printHelp();
  process.exit(1);
}

if (args[0] !== "verify") {
  console.error(`Unknown command: ${args[0]}`);
  printHelp();
  process.exit(1);
}

if (!apiKey) {
  console.error("BATCHIN_API_KEY is required to verify a hosted VaaS record.");
  process.exit(1);
}

const endpoint = configuredEndpoint.replace(/\/$/, "").replace(/\/v1$/, "");

async function main() {
  const response = await fetch(`${endpoint}/v1/audit/${encodeURIComponent(recordId)}/verify`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(`BatchIn API returned HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  if (isJson) {
    console.log(JSON.stringify(payload, null, 2));
    if (payload?.valid !== true) process.exitCode = 1;
    return;
  }

  const valid = payload?.valid === true;
  const checks = Array.isArray(payload?.checks)
    ? payload.checks.map((item) => `${item.name ?? "check"}: ${item.valid ? "valid" : "invalid"}`).join(", ")
    : "none returned";
  console.log(`${valid ? "VaaS receipt verified" : "VaaS receipt verification failed"}`);
  console.log(`Record ID: ${payload?.record_id ?? recordId}`);
  console.log(`Checks: ${checks}`);
  if (!valid) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
