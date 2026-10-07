#!/usr/bin/env node
/**
 * BatchIn Developer CLI
 * Official command-line interface for BatchIn AI Inference Control Plane.
 */
import process from "node:process";
const cliArgs = process.argv.slice(2);
const endpointIndex = cliArgs.indexOf("--endpoint");
const configuredEndpoint = endpointIndex >= 0 ? cliArgs[endpointIndex + 1] : undefined;
const baseUrl = (configuredEndpoint ?? process.env.BATCHIN_API_BASE_URL ?? "https://api.batchin.tech/v1").replace(/\/$/, "");
const apiKey = process.env.BATCHIN_API_KEY;
// ANSI Colors
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const gray = (s) => `\x1b[90m${s}\x1b[0m`;
function printBanner() {
    console.log(`
${bold(cyan("BatchIn Developer CLI"))} ${gray("v0.1.0")}
The Verification-First AI Inference & Agent Control Plane
`);
}
function printHelp() {
    printBanner();
    console.log(`${bold("USAGE:")}
  batchin <command> [arguments] [options]

${bold("COMMANDS:")}
  ${cyan("models")}                List models returned for the current API key
  ${cyan("chat")} <prompt>        Run an interactive chat completion test
  ${cyan("bench")} [model]        Measure one live request (not an SLA)
  ${cyan("verify")} <record-id>   Verify cryptographic VaaS receipt & Merkle proof
  ${cyan("trace")} <run-id>       Inspect multi-step autonomous agent trace and spend
  ${cyan("quote")} <model>        Estimate token pricing for a given model
  ${cyan("doctor")}               Test network latency, API connectivity & credentials
  ${cyan("help")}                 Show this help manual

${bold("OPTIONS:")}
  --model <name>          Specify a model returned by the catalog
  --json                  Output raw JSON instead of formatted text
  --endpoint <url>        Override default API base URL
`);
}
async function request(path, init = {}) {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (apiKey) {
        headers.set("Authorization", `Bearer ${apiKey}`);
    }
    if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const text = await response.text();
    let payload;
    try {
        payload = text ? JSON.parse(text) : null;
    }
    catch {
        payload = text;
    }
    if (!response.ok) {
        throw new Error(`BatchIn API returned HTTP ${response.status}: ${JSON.stringify(payload)}`);
    }
    return payload;
}
async function cmdModels(isJson) {
    const res = (await request("/models"));
    if (isJson) {
        console.log(JSON.stringify(res, null, 2));
        return;
    }
    console.log(bold(green("Models returned for this API key:")));
    const models = res.data ?? [];
    for (const m of models) {
        console.log(`  • ${bold(cyan(m.id.padEnd(28)))} ${gray(m.owned_by ?? "batchin")}`);
    }
    console.log(gray(`\nTotal catalog rows: ${models.length}`));
}
async function cmdChat(prompt, model, isJson) {
    if (!prompt) {
        throw new Error("usage: batchin chat \"Your prompt here\" [--model <model>]");
    }
    if (!model) {
        throw new Error("Choose --model from the authenticated `batchin models` catalog.");
    }
    console.log(gray(`Querying ${model}...`));
    const startTime = Date.now();
    const payload = {
        model,
        messages: [{ role: "user", content: prompt }],
    };
    const res = (await request("/chat/completions", {
        method: "POST",
        body: JSON.stringify(payload),
    }));
    const elapsedMs = Date.now() - startTime;
    if (isJson) {
        console.log(JSON.stringify(res, null, 2));
        return;
    }
    const content = res.choices?.[0]?.message?.content ?? "";
    console.log(`\n${bold("Response:")}\n${content}\n`);
    console.log(gray(`Latency: ${elapsedMs}ms | Tokens: ${res.usage?.total_tokens ?? "N/A"}`));
}
async function cmdVerify(recordId, isJson) {
    if (!recordId) {
        throw new Error("usage: batchin verify <record-id>");
    }
    const result = await request(`/audit/${encodeURIComponent(recordId)}/verify`);
    if (isJson) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    const checks = (result.checks ?? [])
        .map((check) => `${check.name ?? "check"}: ${check.valid ? "valid" : "invalid"}`)
        .join(", ");
    const valid = result.valid === true;
    console.log(`
${bold(valid ? green("VaaS Cryptographic Receipt Verified") : red("VaaS Cryptographic Receipt Verification Failed"))}
${gray("--------------------------------------------------------------------------------")}
  ${bold("Record ID:")}         ${recordId}
  ${bold("Status:")}            ${valid ? green("verified") : red("failed")}
  ${bold("Checks:")}            ${checks || "none returned"}
${gray("--------------------------------------------------------------------------------")}
`);
    if (!valid)
        process.exitCode = 1;
}
async function cmdDoctor() {
    console.log(bold("Running BatchIn Doctor Diagnostics..."));
    console.log(`  • API Endpoint: ${cyan(baseUrl)}`);
    console.log(`  • API Key:      ${apiKey ? green("Configured (Bearer " + apiKey.slice(0, 6) + "...)") : yellow("Missing (BATCHIN_API_KEY not set)")}`);
    const start = Date.now();
    try {
        await request("/models");
        const pingMs = Date.now() - start;
        console.log(`  • Network Ping: ${green(`${pingMs}ms (HTTP 200 OK)`)}`);
        console.log(bold(green("\nAPI connectivity check passed. Model and payment readiness were not tested.")));
    }
    catch (err) {
        console.log(`  • Network Ping: ${red("Failed: " + (err instanceof Error ? err.message : String(err)))}`);
        console.log(bold(red("\nDoctor found issues connecting to the API.")));
    }
}
async function cmdQuote(targetModel, isJson) {
    if (!targetModel) {
        throw new Error("usage: batchin quote <model> --input-tokens <n> --output-tokens <n>");
    }
    const inputIndex = cliArgs.indexOf("--input-tokens");
    const outputIndex = cliArgs.indexOf("--output-tokens");
    const estimatedInputTokens = Number(cliArgs[inputIndex + 1]);
    const estimatedOutputTokens = Number(cliArgs[outputIndex + 1]);
    if (!Number.isFinite(estimatedInputTokens) || !Number.isFinite(estimatedOutputTokens) || estimatedInputTokens < 0 || estimatedOutputTokens < 0) {
        throw new Error("quote requires non-negative --input-tokens and --output-tokens values");
    }
    const result = await request("/quote", {
        method: "POST",
        body: JSON.stringify({ model: targetModel, estimated_input_tokens: estimatedInputTokens, estimated_output_tokens: estimatedOutputTokens }),
    });
    if (isJson) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    console.log(JSON.stringify(result, null, 2));
}
async function cmdTrace(runId, isJson) {
    if (!runId) {
        throw new Error("usage: batchin trace <run-id>");
    }
    const result = await request(`/usage/logs?run_id=${encodeURIComponent(runId)}`);
    if (isJson) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    console.log(JSON.stringify(result, null, 2));
}
async function cmdBench(targetModel, isJson) {
    if (!targetModel) {
        throw new Error("Choose a model from the authenticated `batchin models` catalog.");
    }
    console.log(bold(cyan(`\nBenchmarking latency & throughput for ${targetModel}...`)));
    const t0 = performance.now();
    try {
        const res = (await request("/chat/completions", {
            method: "POST",
            body: JSON.stringify({
                model: targetModel,
                messages: [{ role: "user", content: "State 1 sentence." }],
                max_tokens: 32,
            }),
        }));
        const durationMs = Math.round(performance.now() - t0);
        const completionTokens = res.usage?.completion_tokens || 1;
        const tps = Math.round((completionTokens / (durationMs / 1000)) * 10) / 10;
        if (isJson) {
            console.log(JSON.stringify({ model: targetModel, durationMs, completionTokens, tps }));
            return;
        }
        console.log(`  • Model: ${bold(targetModel)}`);
        console.log(`  • Response Time: ${green(`${durationMs} ms`)}`);
        console.log(`  • Estimated Speed: ${green(`${tps} tokens/sec`)}`);
        console.log(`  • Sample Completion: ${gray(res.choices?.[0]?.message?.content?.trim() || "OK")}\n`);
    }
    catch (err) {
        console.log(red(`Benchmark failed: ${err instanceof Error ? err.message : String(err)}`));
    }
}
async function main() {
    const args = cliArgs;
    const isJson = args.includes("--json");
    const modelIdx = args.indexOf("--model");
    const model = modelIdx !== -1 && args[modelIdx + 1] ? args[modelIdx + 1] : "";
    const command = args[0] ?? "help";
    if (command === "help" || args.includes("-h") || args.includes("--help")) {
        printHelp();
        return;
    }
    if (command === "models") {
        await cmdModels(isJson);
        return;
    }
    if (command === "chat") {
        const prompt = args.slice(1).filter((a) => !a.startsWith("-")).join(" ");
        await cmdChat(prompt, model, isJson);
        return;
    }
    if (command === "bench") {
        const targetModel = args[1] && !args[1].startsWith("-") ? args[1] : model;
        await cmdBench(targetModel, isJson);
        return;
    }
    if (command === "verify") {
        const recordId = args[1];
        await cmdVerify(recordId, isJson);
        return;
    }
    if (command === "doctor") {
        await cmdDoctor();
        return;
    }
    if (command === "quote") {
        const targetModel = args[1] && !args[1].startsWith("-") ? args[1] : model;
        await cmdQuote(targetModel, isJson);
        return;
    }
    if (command === "trace") {
        await cmdTrace(args[1], isJson);
        return;
    }
    printHelp();
}
main().catch((error) => {
    console.error(red(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
});
