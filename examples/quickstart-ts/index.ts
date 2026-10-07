import { BatchIn } from "@batchin/sdk";

async function main() {
  const apiKey = process.env.BATCHIN_API_KEY;
  if (!apiKey) {
    throw new Error("Set BATCHIN_API_KEY before running this example.");
  }
  const client = new BatchIn({ apiKey });

  console.log("1. Fetching available models from BatchIn API...");
  try {
    const models = await client.models.list();
    console.log("Available models:", models.data?.slice(0, 5).map((m) => m.id));
  } catch (err) {
    console.error("Model discovery failed:", (err as Error).message);
    throw err;
  }

  console.log("\n2. Sending chat completion request...");
  console.log("Example payload: { model: 'deepseek-v4-pro', messages: [...] }");
}

main().catch(console.error);
