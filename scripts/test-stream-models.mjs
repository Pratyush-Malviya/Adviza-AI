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

async function testStream(modelName) {
  console.log(`Testing stream on ${modelName}...`);
  const start = Date.now();
  try {
    const res = await fetch(NVIDIA_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 64,
        temperature: 0.5,
        stream: true,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      console.log(`❌ ${modelName} returned status ${res.status}: ${await res.text()}`);
      return false;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let firstChunkTime = null;
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!firstChunkTime) firstChunkTime = ((Date.now() - start) / 1000).toFixed(2);
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const p = JSON.parse(line.slice(6));
            const delta = p.choices?.[0]?.delta?.content;
            if (delta) text += delta;
          } catch {}
        }
      }
    }

    const totalTime = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ ${modelName} streamed! First chunk: ${firstChunkTime}s, Total: ${totalTime}s`);
    console.log(`   Output: "${text.trim()}"`);
    return true;
  } catch (err) {
    console.log(`❌ ${modelName} stream error:`, err.message);
    return false;
  }
}

async function run() {
  await testStream("moonshotai/kimi-k3");
  await testStream("deepseek-ai/deepseek-v4-flash-0731");
}

run().catch(console.error);
