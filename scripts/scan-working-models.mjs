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

async function findFastWorkingModels() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { "Authorization": `Bearer ${NVIDIA_API_KEY}` }
  });
  const data = await res.json();
  const models = (data.data || []).map(m => m.id);

  console.log(`Scanning ${models.length} NVIDIA models for fast response...`);
  const working = [];

  for (const m of models) {
    try {
      const start = Date.now();
      const chatRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 16,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (chatRes.ok) {
        const json = await chatRes.json();
        const text = json.choices?.[0]?.message?.content?.trim();
        const time = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`🎯 WORKING: ${m} (${time}s) -> "${text}"`);
        working.push({ model: m, time, text });
      }
    } catch {}
  }

  console.log("\nFinished scanning. Working models count:", working.length);
}

findFastWorkingModels().catch(console.error);
