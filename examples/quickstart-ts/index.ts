import { BatchIn } from "@batchin/sdk";

async function main() {
  const apiKey = process.env.BATCHIN_API_KEY || "test-demo-key";
  const client = new BatchIn({ apiKey });

  console.log("1. Fetching available models from BatchIn API...");
  try {
    const models = await client.models.list();
    console.log("Available models:", models.data?.slice(0, 5).map((m) => m.id));
  } catch (err) {
    console.log("Offline mode or demo key used:", (err as Error).message);
  }

  console.log("\n2. Sending chat completion request...");
  console.log("Example payload: { model: 'deepseek-v4-pro', messages: [...] }");
}

main().catch(console.error);
