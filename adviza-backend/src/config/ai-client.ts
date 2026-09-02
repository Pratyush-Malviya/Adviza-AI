import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { env } from './env.js';

function getBedrockClient() {
  return new BedrockRuntimeClient({
    region: env.AWS_REGION || 'us-east-1',
  });
}

const BEDROCK_MODEL_ID =
  process.env.AWS_BEDROCK_MODEL_ID ||
  'anthropic.claude-3-5-sonnet-20241022-v2:0';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'model' | 'system';
  content: string;
}

const DEFAULT_NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_NVIDIA_MODEL = 'moonshotai/kimi-k3';

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
    throw new Error('NVIDIA_API_KEY is not configured');
  }

  const endpoint = process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_URL;
  const model = process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL;

  const formattedMessages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: forceJson
        ? `${systemPrompt}\n\nIMPORTANT: You MUST respond ONLY with a single valid, well-formed JSON object. Do not include markdown code blocks, backticks, or any explanatory text outside the JSON.`
        : systemPrompt,
    });
  }

  for (const m of messages) {
    formattedMessages.push({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content,
    });
  }

  const payload = {
    model,
    messages: formattedMessages,
    max_tokens: forceJson ? 2048 : 4096,
    temperature: forceJson ? 0.1 : 0.6,
    stream: false,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA Kimi-k3 API error (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error(`No content returned from NVIDIA model ${model}`);
    }

    return content;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[nvidia-kimi-client] Invocation error:`, err.message || err);
    throw err;
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
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: systemPrompt,
    messages: bedrockMessages,
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  const client = getBedrockClient();
  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
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
      console.warn('[ai-client] NVIDIA invocation failed, attempting Bedrock fallback:', nvidiaErr);
    }
  }

  return invokeBedrock(messages, systemPrompt);
}

/**
 * Structured JSON model invocation gateway
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
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      const startIdx = Math.min(
        cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity,
        cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity
      );
      const endIdx = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

      if (startIdx !== Infinity && endIdx !== -1 && endIdx > startIdx) {
        const jsonSubstring = cleaned.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonSubstring) as T;
      }

      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.warn('[ai-client] JSON generation error, attempting fallback:', err);
    }
  }

  const jsonSystemPrompt = `${systemPrompt || ''}\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, just raw JSON.`;
  const text = await invokeBedrock(messages, jsonSystemPrompt);
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  return JSON.parse(cleaned) as T;
}

/**
 * Generates a 768-dimensional normalized dense vector embedding for text.
 * Uses Gemini text-embedding-004 when available, or high-entropy deterministic hashing fallback.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const clean = text.trim().slice(0, 8000);
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && !geminiKey.includes('your_')) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: clean }] },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const values = data.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          return values;
        }
      }
    } catch (embErr) {
      console.warn('[ai-client] Gemini embedding failed, using local dense vector fallback:', embErr);
    }
  }

  // Deterministic local 768-dim embedding generator
  const dimensions = 768;
  const vector = new Array(dimensions).fill(0);
  const words = clean.toLowerCase().split(/\s+/);

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    for (let i = 0; i < word.length; i++) {
      const code = word.charCodeAt(i);
      const idx = (code * 31 + i * 17 + w * 7) % dimensions;
      vector[idx] += 1.0 / (1.0 + Math.log(w + 1));
    }
  }

  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;
  return vector.map((v) => v / norm);
}

/**
 * Calculates cosine similarity between two dense vectors: (A . B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return Math.max(0, Math.min(1, dotProduct / denominator));
}
