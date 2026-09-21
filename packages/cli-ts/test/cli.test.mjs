import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL("../src/cli.js", import.meta.url));

test("CLI --help outputs usage information", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "--help"]);
  assert.match(stdout, /BatchIn Developer CLI/);
  assert.match(stdout, /models/);
  assert.match(stdout, /chat/);
  assert.match(stdout, /verify/);
});

test("CLI verify command outputs formatted receipt", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "verify", "rec_test_123", "--json"]);
  const json = JSON.parse(stdout);
  assert.equal(json.record_id, "rec_test_123");
  assert.equal(json.status, "verified");
  assert.equal(json.cryptographic_checks.ed25519_signature, "valid");
});
