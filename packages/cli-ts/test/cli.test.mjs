import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL("../src/cli.js", import.meta.url));

test("CLI --help outputs usage information", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "--help"]);
  assert.match(stdout, /BatchIn Developer CLI/);
  assert.match(stdout, /models/);
  assert.match(stdout, /chat/);
  assert.match(stdout, /verify/);
});

test("CLI verify command reports the authenticated API response", async () => {
  const server = createServer((req, res) => {
    assert.equal(req.url, "/v1/audit/rec_test_123/verify");
    assert.equal(req.headers.authorization, "Bearer test-key");
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      record_id: "rec_test_123",
      valid: true,
      checks: [
        { name: "signature", valid: true },
        { name: "chain", valid: true },
      ],
    }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const { stdout } = await execFileAsync("node", [cliPath, "verify", "rec_test_123", "--json"], {
    env: {
      ...process.env,
      BATCHIN_API_KEY: "test-key",
      BATCHIN_API_BASE_URL: `http://127.0.0.1:${port}/v1`,
    },
  });
  await new Promise((resolve) => server.close(resolve));
  const json = JSON.parse(stdout);
  assert.equal(json.record_id, "rec_test_123");
  assert.equal(json.valid, true);
  assert.equal(json.checks[0].valid, true);
});
