import fs from "fs";

// Load .env.local
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
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "moonshotai/kimi-k3";
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1/chat/completions";

console.log("==================================================");
console.log("🧪 TESTING NVIDIA MOONSHOT KIMI-K3 INTEGRATION");
console.log(`Endpoint: ${NVIDIA_BASE_URL}`);
console.log(`Model: ${NVIDIA_MODEL}`);
console.log(`Key Present: ${Boolean(NVIDIA_API_KEY && NVIDIA_API_KEY.startsWith("nvapi-"))}`);
console.log("==================================================\n");

async function testStandardCompletion() {
  console.log("▶ TEST 1: Standard Chat Completion (Wealth Analysis)...");
  const start = Date.now();
  const res = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: "system",
          content: "You are Adviza AI, a fiduciary wealth management assistant. Respond concisely in 2 sentences.",
        },
        {
          role: "user",
          content: "What is tax-loss harvesting and when should an RIA implement it?",
        },
      ],
      max_tokens: 512,
      temperature: 0.7,
      seed: 0,
      reasoning_effort: "max",
    }),
  });

  const data = await res.json();
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  if (!res.ok) {
    console.error(`❌ Standard Completion Failed (${res.status}):`, data);
    return false;
  }

  const content = data.choices?.[0]?.message?.content;
  console.log(`✅ Completed in ${elapsed}s`);
  console.log(`Response:\n"${content?.trim()}"\n`);
  return true;
}

async function testStructuredJSON() {
  console.log("▶ TEST 2: Structured JSON Extraction...");
  const start = Date.now();
  const res = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a financial entity extraction agent. Respond ONLY with valid JSON matching: {\"clientName\": string, \"aum\": number, \"riskProfile\": string, \"recommendedAction\": string}",
        },
        {
          role: "user",
          content: "Client Eleanor Vance holds $3.2M portfolio with moderate-aggressive risk tolerance. We need to rebalance her munis before Q4.",
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
      seed: 0,
    }),
  });

  const data = await res.json();
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  if (!res.ok) {
    console.error(`❌ Structured JSON Failed (${res.status}):`, data);
    return false;
  }

  const raw = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    console.log(`✅ Structured JSON Parsed Successfully in ${elapsed}s:`, parsed);
    return true;
  } catch (err) {
    console.warn(`⚠️ Failed to parse raw JSON: "${raw}"`, err);
    return false;
  }
}

async function testStreaming() {
  console.log("\n▶ TEST 3: Real-Time SSE Token Streaming...");
  const start = Date.now();
  const res = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: "user",
          content: "Give 3 quick tips for fiduciary compliance in numbered bullets.",
        },
      ],
      max_tokens: 256,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Streaming Failed (${res.status}):`, err);
    return false;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullStream = "";
  let chunkCount = 0;

  process.stdout.write("Stream output: ");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ") && !line.includes("[DONE]")) {
        try {
          const parsed = JSON.parse(line.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            process.stdout.write(delta);
            fullStream += delta;
            chunkCount++;
          }
        } catch {}
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n✅ Streaming Complete: ${chunkCount} chunks delivered in ${elapsed}s\n`);
  return true;
}

async function runAll() {
  const t1 = await testStandardCompletion();
  const t2 = await testStructuredJSON();
  const t3 = await testStreaming();

  console.log("==================================================");
  if (t1 && t2 && t3) {
    console.log("🎉 ALL TESTS PASSED: Moonshot Kimi-k3 is 100% operational!");
  } else {
    console.log("❌ SOME TESTS FAILED. See details above.");
  }
  console.log("==================================================");
}

runAll().catch(console.error);
