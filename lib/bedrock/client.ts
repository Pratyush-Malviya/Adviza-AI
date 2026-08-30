import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

function getBedrockClient() {
  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "placeholder_key",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "placeholder_secret",
    },
  });
}

const BEDROCK_MODEL_ID =
  process.env.AWS_BEDROCK_MODEL_ID ||
  "anthropic.claude-3-5-sonnet-20241022-v2:0";

export interface LLMMessage {
  role: "user" | "assistant" | "model" | "system";
  content: string;
}

const DEFAULT_NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_NVIDIA_MODEL = "moonshotai/kimi-k3";

/**
 * Invokes NVIDIA Moonshot Kimi-k3 API directly.
 */
export async function invokeNvidia(
  messages: LLMMessage[],
  systemPrompt?: string,
  forceJson = false
): Promise<string> {
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const endpoint = process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_URL;
  const model = process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL;

  const formattedMessages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    formattedMessages.push({
      role: "system",
      content: forceJson
        ? `${systemPrompt}\n\nIMPORTANT: You MUST respond ONLY with a single valid, well-formed JSON object. Do not include markdown code blocks, backticks, or any explanatory text outside the JSON.`
        : systemPrompt,
    });
  }

  for (const m of messages) {
    formattedMessages.push({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.content,
    });
  }

  const payload = {
    model,
    messages: formattedMessages,
    max_tokens: 16384,
    temperature: forceJson ? 0.2 : 0.7,
    seed: 0,
    stream: false,
    reasoning_effort: "max",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA Kimi-k3 API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error(`No content returned from NVIDIA model ${model}`);
    }

    return content;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[nvidia-kimi-client] Invocaton error:`, err.message || err);
    throw err;
  }
}

/**
 * Streams response chunks from NVIDIA Moonshot Kimi-k3 API.
 */
export async function invokeNvidiaStream(
  messages: LLMMessage[],
  systemPrompt?: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const endpoint = process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_URL;
  const model = process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL;

  const formattedMessages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    formattedMessages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  for (const m of messages) {
    formattedMessages.push({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.content,
    });
  }

  const payload = {
    model,
    messages: formattedMessages,
    max_tokens: 16384,
    temperature: 0.7,
    seed: 0,
    stream: true,
    reasoning_effort: "max",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NVIDIA API stream error (${res.status}): ${errText}`);
  }

  if (!res.body) {
    throw new Error("No response stream body available from NVIDIA API");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const dataStr = trimmed.slice(6).trim();
      if (dataStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(dataStr);
        const deltaText = parsed.choices?.[0]?.delta?.content;
        if (deltaText) {
          fullText += deltaText;
          onChunk?.(deltaText);
        }
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  return fullText;
}

/**
 * Invokes AWS Bedrock Claude runtime.
 */
async function invokeBedrock(
  messages: LLMMessage[],
  systemPrompt?: string
): Promise<string> {
  const bedrockMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: bedrockMessages,
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const client = getBedrockClient();
  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

/**
 * Compatibility alias for invokeGemini -> now routes to Moonshot Kimi-k3 via NVIDIA
 */
export async function invokeGemini(
  messages: LLMMessage[],
  systemPrompt?: string,
  forceJson = false
): Promise<string> {
  return invokeNvidia(messages, systemPrompt, forceJson);
}

/**
 * Primary model invocation gateway (NVIDIA Moonshot Kimi-k3 with Bedrock fallback)
 */
export async function invokeModel(
  messages: LLMMessage[],
  systemPrompt?: string
): Promise<string> {
  const hasNvidia = !!(process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY);

  if (hasNvidia) {
    try {
      return await invokeNvidia(messages, systemPrompt);
    } catch (nvidiaErr) {
      console.warn("[ai-client] NVIDIA Kimi-k3 invocation failed, attempting Bedrock fallback:", nvidiaErr);
    }
  }

  // 2. Fall back to AWS Bedrock
  return invokeBedrock(messages, systemPrompt);
}

/**
 * Primary streaming model invocation gateway (NVIDIA Moonshot Kimi-k3 with Bedrock fallback)
 */
export async function invokeModelStream(
  messages: LLMMessage[],
  systemPrompt?: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const hasNvidia = !!(process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY);

  if (hasNvidia) {
    try {
      return await invokeNvidiaStream(messages, systemPrompt, onChunk);
    } catch (nvidiaErr) {
      console.warn("[ai-client] NVIDIA Kimi-k3 stream failed, attempting Bedrock fallback:", nvidiaErr);
    }
  }

  const bedrockMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: bedrockMessages,
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const client = getBedrockClient();
  const response = await client.send(command);
  let fullText = "";

  if (response.body) {
    for await (const chunk of response.body) {
      if (chunk.chunk?.bytes) {
        const decoded = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
        if (decoded.type === "content_block_delta" && decoded.delta?.text) {
          fullText += decoded.delta.text;
          onChunk?.(decoded.delta.text);
        }
      }
    }
  }

  return fullText;
}

/**
 * Structured JSON model invocation gateway with robust parsing
 */
export async function invokeModelJSON<T>(
  messages: LLMMessage[],
  systemPrompt?: string
): Promise<T> {
  const hasNvidia = !!(process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY);

  if (hasNvidia) {
    try {
      const text = await invokeNvidia(messages, systemPrompt, true);
      const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Try finding the first '{' or '[' and matching to the last '}' or ']'
      const startIdx = Math.min(
        cleaned.indexOf("{") !== -1 ? cleaned.indexOf("{") : Infinity,
        cleaned.indexOf("[") !== -1 ? cleaned.indexOf("[") : Infinity
      );
      const endIdx = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));

      if (startIdx !== Infinity && endIdx !== -1 && endIdx > startIdx) {
        const jsonSubstring = cleaned.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonSubstring) as T;
      }

      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.warn("[ai-client] NVIDIA Kimi-k3 JSON generation error, attempting fallback:", err);
    }
  }

  // 2. AWS Bedrock Fallback
  const jsonSystemPrompt = `${systemPrompt || ""}\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, just raw JSON.`;
  const text = await invokeBedrock(messages, jsonSystemPrompt);
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
