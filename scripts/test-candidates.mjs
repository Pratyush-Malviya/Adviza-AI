import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[match[1]] = value.trim();
  }
});

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const candidateModels = [
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "mistralai/mistral-large-2-instruct",
  "deepseek-ai/deepseek-v4-flash-0731",
  "moonshotai/kimi-k2.6",
  "moonshotai/kimi-k3",
];

async function testModel(model) {
  const start = Date.now();
  try {
    const res = await fetch(NVIDIA_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Say hello in 5 words." }],
        max_tokens: 32,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      console.log(`✅ ${model} -> ${elapsed}s: "${reply}"`);
      return true;
    } else {
      console.log(`❌ ${model} -> ${res.status}: ${await res.text()}`);
      return false;
    }
  } catch (err) {
    console.log(`⏱️ ${model} -> error: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const m of candidateModels) {
    await testModel(m);
  }
}

run().catch(console.error);
