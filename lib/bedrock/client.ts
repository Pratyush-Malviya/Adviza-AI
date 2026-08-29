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
  role: "user" | "assistant" | "model";
  content: string;
}

/**
 * Invokes Google Gemini API directly using native fetch.
 */
export async function invokeGemini(
  messages: LLMMessage[],
  systemPrompt?: string,
  forceJson = false
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      ...(forceJson ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (systemPrompt) {
    body.system_instruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No text response returned from Gemini API");
    }
    return text;
  } catch (fetchErr: any) {
    clearTimeout(timeoutId);
    throw fetchErr;
  }
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

export async function invokeModel(
  messages: LLMMessage[],
  systemPrompt?: string
): Promise<string> {
  // 1. Prioritize Google Gemini API if key is present
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_")) {
    try {
      return await invokeGemini(messages, systemPrompt);
    } catch (geminiErr) {
      console.warn("[ai-client] Gemini invocation failed, attempting Bedrock fallback:", geminiErr);
    }
  }

  // 2. Fall back to AWS Bedrock
  return invokeBedrock(messages, systemPrompt);
}

export async function invokeModelStream(
  messages: LLMMessage[],
  systemPrompt?: string,
  onChunk?: (text: string) => void
): Promise<string> {
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_")) {
    const fullText = await invokeGemini(messages, systemPrompt);
    onChunk?.(fullText);
    return fullText;
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

export async function invokeModelJSON<T>(
  messages: LLMMessage[],
  systemPrompt?: string
): Promise<T> {
  // 1. Google Gemini Native Structured JSON Generation
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_")) {
    try {
      const text = await invokeGemini(messages, systemPrompt, true);
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.warn("[ai-client] Gemini JSON generation error:", err);
      throw err;
    }
  }

  // 2. AWS Bedrock Fallback
  const jsonSystemPrompt = `${systemPrompt || ""}\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, just raw JSON.`;
  const text = await invokeBedrock(messages, jsonSystemPrompt);
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
