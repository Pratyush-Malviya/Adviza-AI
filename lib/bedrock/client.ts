import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL_ID =
  process.env.AWS_BEDROCK_MODEL_ID ||
  "anthropic.claude-3-5-sonnet-20241022-v2:0";

interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

export async function invokeModel(
  messages: BedrockMessage[],
  systemPrompt?: string
): Promise<string> {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

export async function invokeModelStream(
  messages: BedrockMessage[],
  systemPrompt?: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

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
  messages: BedrockMessage[],
  systemPrompt?: string
): Promise<T> {
  const jsonSystemPrompt = `${systemPrompt || ""}\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, just raw JSON.`;
  const text = await invokeModel(messages, jsonSystemPrompt);
  
  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  
  return JSON.parse(cleaned) as T;
}
