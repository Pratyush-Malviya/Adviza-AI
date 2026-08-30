/**
 * Mem0 Universal Long-Term Memory & Adaptive Persona Layer
 * Compatible with Mem0 Cloud API (https://api.mem0.ai/v1) and Native Supabase Storage.
 */

import { createClient } from "@/lib/supabase/server";
import { invokeModelJSON, LLMMessage } from "@/lib/bedrock/client";

export interface MemoryItem {
  id: string;
  memory: string;
  category: "preference" | "persona" | "fact" | "client_context" | "workflow_habit" | "general";
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface ExtractedMemory {
  memory: string;
  category: "preference" | "persona" | "fact" | "client_context" | "workflow_habit" | "general";
}

interface ExtractionResponse {
  memories: ExtractedMemory[];
}

const MEM0_API_BASE = process.env.MEM0_API_BASE || "https://api.mem0.ai/v1";

/**
 * Checks if Mem0 Cloud API Key is configured
 */
function getMem0ApiKey(): string | null {
  const key = process.env.MEM0_API_KEY;
  if (!key || key.includes("your_") || key === "placeholder") return null;
  return key;
}

/**
 * Automatically extracts new core facts, user preferences, client habits, and persona cues from a conversation turn
 */
export async function addMemories(
  userId: string,
  messages: Array<{ role: string; content: string }>,
  options?: { sessionId?: string; agentId?: string; firmId?: string }
): Promise<MemoryItem[]> {
  if (!userId || messages.length === 0) return [];

  const apiKey = getMem0ApiKey();

  // 1. Mem0 Cloud API Integration
  if (apiKey) {
    try {
      const response = await fetch(`${MEM0_API_BASE}/memories/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          user_id: userId,
          agent_id: options?.agentId || "adviza_orchestrator",
          metadata: {
            session_id: options?.sessionId,
            firm_id: options?.firmId,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data) ? data : data.results || [];
        return results.map((item: any) => ({
          id: item.id || `mem_${Date.now()}`,
          memory: item.memory || item.text || "",
          category: item.metadata?.category || "general",
          metadata: item.metadata || {},
          created_at: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (apiErr) {
      console.warn("[mem0] Mem0 cloud API call failed, using native memory extraction:", apiErr);
    }
  }

  // 2. Native AI Extraction & Supabase Storage Engine
  try {
    const extractionPrompt: LLMMessage[] = [
      {
        role: "user",
        content: `You are Mem0's Intelligent Memory Extraction Agent for Adviza AI.
Analyze the following conversation turn and extract any enduring facts, user preferences, working habits, client portfolio details, or persona attributes that should be remembered for future interactions.

Rules:
- Extract only clear, meaningful facts or preferences (e.g. "User prefers conservative municipal bonds", "Client Sarah Jenkins has $1.85M portfolio", "User prefers direct concise updates", "Default report format is PDF").
- Do NOT extract transient greetings or trivial one-time queries.
- Categorize each memory into: "preference", "persona", "fact", "client_context", "workflow_habit", or "general".
- Output JSON format: { "memories": [ { "memory": "...", "category": "preference" } ] }
- If nothing enduring is found, return { "memories": [] }

Conversation:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}`,
      },
    ];

    const result = await invokeModelJSON<ExtractionResponse>(
      extractionPrompt,
      "You are Mem0's memory extraction engine. Respond with valid JSON only."
    );

    if (!result?.memories || result.memories.length === 0) {
      return [];
    }

    const supabase = await createClient();
    const savedItems: MemoryItem[] = [];

    for (const mem of result.memories) {
      if (!mem.memory || mem.memory.trim().length < 5) continue;

      // Check if memory already exists to prevent duplicate spam
      const { data: existing } = await supabase
        .from("user_memories")
        .select("id")
        .eq("user_id", userId)
        .ilike("memory", `%${mem.memory.slice(0, 30)}%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Compute 768-dimensional vector embedding for semantic similarity search
      const memoryEmbedding = await generateEmbedding(mem.memory.trim());

      const { data: inserted, error } = await supabase
        .from("user_memories")
        .insert({
          user_id: userId,
          firm_id: options?.firmId,
          agent_id: options?.agentId || "adviza_orchestrator",
          session_id: options?.sessionId,
          category: mem.category || "general",
          memory: mem.memory.trim(),
          metadata: {
            extracted_at: new Date().toISOString(),
            ...(memoryEmbedding ? { embedding: memoryEmbedding } : {}),
          },
        })
        .select()
        .single();

      if (!error && inserted) {
        savedItems.push({
          id: inserted.id,
          memory: inserted.memory,
          category: inserted.category,
          metadata: inserted.metadata,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at,
        });
      }
    }

    return savedItems;
  } catch (extractErr) {
    console.warn("[mem0] Native memory extraction skipped:", extractErr);
    return [];
  }
}

/**
 * Generates text embeddings using Google Gemini text-embedding-004 model (768 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !text || text.trim().length === 0) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text: text.trim().slice(0, 2048) }],
        },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.embedding?.values || null;
  } catch (err) {
    console.warn("[mem0-embeddings] Embedding generation failed:", err);
    return null;
  }
}

/**
 * Calculates mathematical cosine similarity between two vector embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Searches and retrieves top relevant long-term memories for a user given a query using pgvector / cosine hybrid ranking
 */
export async function searchMemories(
  userId: string,
  query: string,
  limit = 5
): Promise<MemoryItem[]> {
  if (!userId) return [];

  const apiKey = getMem0ApiKey();

  // 1. Mem0 Cloud Search
  if (apiKey) {
    try {
      const response = await fetch(`${MEM0_API_BASE}/memories/search/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          user_id: userId,
          limit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data) ? data : data.results || [];
        return results.map((item: any) => ({
          id: item.id,
          memory: item.memory || item.text || "",
          category: item.metadata?.category || "general",
          metadata: item.metadata || {},
          created_at: item.created_at,
        }));
      }
    } catch (searchErr) {
      console.warn("[mem0] Mem0 cloud search fallback to database:", searchErr);
    }
  }

  // 2. Native Database pgvector RPC Search
  try {
    const supabase = await createClient();
    const queryEmbedding = await generateEmbedding(query);

    if (queryEmbedding) {
      const { data: rpcResults, error: rpcError } = await (supabase.rpc as any)("match_user_memories", {
        query_embedding: queryEmbedding,
        match_threshold: 0.45,
        match_count: limit,
        target_user_id: userId,
      });

      if (!rpcError && Array.isArray(rpcResults) && rpcResults.length > 0) {
        return rpcResults.map((r: any) => ({
          id: r.id,
          memory: r.memory,
          category: r.category,
          metadata: r.metadata,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }));
      }
    }

    // 3. In-memory cosine & keyword hybrid fallback
    const cleanQuery = query.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const keywords = cleanQuery.split(/\s+/).filter((w) => w.length > 3);

    const { data: memories, error } = await supabase
      .from("user_memories")
      .select("id, memory, category, metadata, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit * 3);

    if (error || !memories) return [];

    const scored = memories.map((m) => {
      let score = 0;
      const memText = m.memory.toLowerCase();

      // Keyword match score (weight: 1.5)
      for (const kw of keywords) {
        if (memText.includes(kw)) score += 1.5;
      }

      // Stored vector cosine similarity (weight: 3.0)
      if (queryEmbedding && m.metadata?.embedding && Array.isArray(m.metadata.embedding)) {
        const sim = cosineSimilarity(queryEmbedding, m.metadata.embedding);
        score += sim * 3.0;
      }

      return { item: m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => ({
      id: s.item.id,
      memory: s.item.memory,
      category: s.item.category,
      metadata: s.item.metadata,
      created_at: s.item.created_at,
      updated_at: s.item.updated_at,
    }));
  } catch (dbErr) {
    console.warn("[mem0] Search memories error:", dbErr);
    return [];
  }
}

/**
 * Retrieves all stored long-term memories for a user
 */
export async function getAllMemories(userId: string): Promise<MemoryItem[]> {
  if (!userId) return [];

  const apiKey = getMem0ApiKey();

  if (apiKey) {
    try {
      const response = await fetch(`${MEM0_API_BASE}/memories/?user_id=${userId}`, {
        headers: { "Authorization": `Token ${apiKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data) ? data : data.results || [];
        return results.map((item: any) => ({
          id: item.id,
          memory: item.memory || item.text || "",
          category: item.metadata?.category || "general",
          metadata: item.metadata || {},
          created_at: item.created_at,
        }));
      }
    } catch {}
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_memories")
      .select("id, memory, category, metadata, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      memory: d.memory,
      category: d.category,
      metadata: d.metadata,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  } catch (err) {
    console.error("[mem0] getAllMemories error:", err);
    return [];
  }
}

/**
 * Deletes a memory item by ID
 */
export async function deleteMemory(userId: string, memoryId: string): Promise<boolean> {
  const apiKey = getMem0ApiKey();
  if (apiKey) {
    try {
      await fetch(`${MEM0_API_BASE}/memories/${memoryId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${apiKey}` },
      });
    } catch {}
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_memories")
      .delete()
      .eq("id", memoryId)
      .eq("user_id", userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Formats a list of memory items into a structured prompt injection block
 */
export function formatMemoriesForPrompt(memories: MemoryItem[]): string {
  if (!memories || memories.length === 0) return "";

  const items = memories.map((m) => `- [${m.category.toUpperCase()}] ${m.memory}`).join("\n");

  return `\n\n### 🧠 Long-Term Memory Context (Mem0):
The following persistent facts, preferences, and persona attributes were recalled for this advisor/client:
${items}
(Use these memories naturally to personalize your planning, actions, and tone without explicitly repeating this raw list unless relevant.)`;
}
