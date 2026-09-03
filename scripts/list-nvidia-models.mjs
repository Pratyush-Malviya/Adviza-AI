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

async function listModels() {
  console.log("Fetching NVIDIA models list...");
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Accept": "application/json",
    },
  });

  if (res.ok) {
    const data = await res.json();
    const modelIds = (data.data || []).map(m => m.id);
    console.log(`Found ${modelIds.length} models.`);
    const matched = modelIds.filter(id => id.includes("kimi") || id.includes("deepseek") || id.includes("llama") || id.includes("mistral") || id.includes("claude"));
    console.log("Matching models:", matched);
  } else {
    console.log("Error fetching models:", res.status, await res.text());
  }
}

listModels().catch(console.error);
