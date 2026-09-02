import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';
import {
  invokeModelJSON,
  LLMMessage,
  generateEmbedding,
  calculateCosineSimilarity,
} from '../../config/ai-client.js';
import { env } from '../../config/env.js';

export interface MemoryItem {
  id: string;
  memory: string;
  category: 'preference' | 'persona' | 'fact' | 'client_context' | 'workflow_habit' | 'general';
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  similarityScore?: number;
}

interface ExtractedMemory {
  memory: string;
  category: 'preference' | 'persona' | 'fact' | 'client_context' | 'workflow_habit' | 'general';
}

interface ExtractionResponse {
  memories: ExtractedMemory[];
}

const MEM0_API_BASE = process.env.MEM0_API_BASE || 'https://api.mem0.ai/v1';

function getMem0ApiKey(): string | null {
  const key = env.MEM0_API_KEY || process.env.MEM0_API_KEY;
  if (!key || key.includes('your_') || key === 'placeholder') return null;
  return key;
}

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
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          user_id: userId,
          agent_id: options?.agentId || 'adviza_orchestrator',
          metadata: {
            session_id: options?.sessionId,
            firm_id: options?.firmId,
          },
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const results = Array.isArray(data) ? data : data.results || [];
        return results.map((item: any) => ({
          id: item.id || `mem_${Date.now()}`,
          memory: item.memory || item.text || '',
          category: item.metadata?.category || 'general',
          metadata: item.metadata || {},
          created_at: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (apiErr) {
      console.warn('[mem0] Cloud API call failed, using native extraction:', apiErr);
    }
  }

  // 2. Native AI Extraction & Dense Vector Supabase Storage
  try {
    const extractionPrompt: LLMMessage[] = [
      {
        role: 'user',
        content: `You are Mem0's Intelligent Memory Extraction Agent for Adviza AI.
Analyze the following conversation turn and extract any enduring facts, user preferences, working habits, client portfolio details, or persona attributes that should be remembered for future interactions.

Rules:
- Extract only clear, meaningful facts or preferences (e.g. "User prefers conservative municipal bonds", "Client Sarah Jenkins has $1.85M portfolio", "User prefers direct concise updates", "Default report format is PDF").
- Do NOT extract transient greetings or trivial one-time queries.
- Categorize each memory into: "preference", "persona", "fact", "client_context", "workflow_habit", or "general".
- Output JSON format: { "memories": [ { "memory": "...", "category": "preference" } ] }
- If nothing enduring is found, return { "memories": [] }

Conversation:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`,
      },
    ];

    const result = await invokeModelJSON<ExtractionResponse>(
      extractionPrompt,
      "You are Mem0's memory extraction engine. Respond with valid JSON only."
    );

    if (!result?.memories || result.memories.length === 0) {
      return [];
    }

    const supabase = getSupabaseAdmin();
    const savedItems: MemoryItem[] = [];

    for (const mem of result.memories) {
      if (!mem.memory || mem.memory.trim().length < 5) continue;

      const trimmedText = mem.memory.trim();

      const { data: existing } = await supabase
        .from('user_memories')
        .select('id')
        .eq('user_id', userId)
        .ilike('memory', `%${trimmedText.slice(0, 30)}%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Compute 768-dim dense embedding for semantic recall
      const embedding = await generateEmbedding(trimmedText);

      const payload = scopeFirm(
        {
          user_id: userId,
          agent_id: options?.agentId || 'adviza_orchestrator',
          session_id: options?.sessionId,
          category: mem.category || 'general',
          memory: trimmedText,
          metadata: {
            extracted_at: new Date().toISOString(),
            embedding,
            dimensions: embedding.length,
          },
        },
        options?.firmId || 'default-firm'
      );

      const { data: inserted, error } = await supabase
        .from('user_memories')
        .insert(payload)
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
    console.warn('[mem0] Native memory extraction skipped:', extractErr);
    return [];
  }
}

/**
 * Hybrid Semantic & Keyword Vector Memory Search
 */
export async function searchMemories(
  userId: string,
  query: string,
  limit = 5,
  category?: string
): Promise<MemoryItem[]> {
  if (!userId || !query?.trim()) return [];

  const apiKey = getMem0ApiKey();

  // 1. Mem0 Cloud Search
  if (apiKey) {
    try {
      const response = await fetch(`${MEM0_API_BASE}/memories/search/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, user_id: userId, limit }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const results = Array.isArray(data) ? data : data.results || [];
        return results.map((item: any) => ({
          id: item.id,
          memory: item.memory || item.text || '',
          category: item.metadata?.category || 'general',
          metadata: item.metadata || {},
          created_at: item.created_at,
          similarityScore: item.score || 0.95,
        }));
      }
    } catch (searchErr) {
      console.warn('[mem0] Cloud search fallback to database:', searchErr);
    }
  }

  // 2. Hybrid Dense Vector & BM25 Keyword Search
  try {
    const supabase = getSupabaseAdmin();
    const queryEmbedding = await generateEmbedding(query);
    const cleanQuery = query.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const keywords = cleanQuery.split(/\s+/).filter((w) => w.length > 2);

    let queryBuilder = supabase
      .from('user_memories')
      .select('id, memory, category, metadata, created_at, updated_at')
      .eq('user_id', userId);

    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data: memories, error } = await queryBuilder.limit(100);

    if (error || !memories || memories.length === 0) return [];

    const scoredItems: Array<{ item: any; hybridScore: number; cosineSim: number }> = [];

    for (const mem of memories) {
      const memText = (mem.memory || '').toLowerCase();

      // Vector Cosine Similarity
      let cosineSim = 0;
      if (Array.isArray(mem.metadata?.embedding) && mem.metadata.embedding.length > 0) {
        cosineSim = calculateCosineSimilarity(queryEmbedding, mem.metadata.embedding);
      } else {
        // Fallback: on-the-fly similarity
        const memEmb = await generateEmbedding(mem.memory);
        cosineSim = calculateCosineSimilarity(queryEmbedding, memEmb);
      }

      // Keyword BM25-style frequency
      let keywordScore = 0;
      for (const kw of keywords) {
        if (memText.includes(kw)) {
          keywordScore += 1.0;
        }
      }
      const normalizedKeywordScore = Math.min(1.0, keywordScore / Math.max(1, keywords.length));

      // Hybrid rank: 75% vector semantics + 25% exact keyword match
      const hybridScore = cosineSim * 0.75 + normalizedKeywordScore * 0.25;

      scoredItems.push({
        item: mem,
        hybridScore,
        cosineSim,
      });
    }

    // Sort descending by hybrid score
    scoredItems.sort((a, b) => b.hybridScore - a.hybridScore);

    return scoredItems.slice(0, limit).map((s) => ({
      id: s.item.id,
      memory: s.item.memory,
      category: s.item.category,
      metadata: s.item.metadata,
      created_at: s.item.created_at,
      updated_at: s.item.updated_at,
      similarityScore: Math.round(s.hybridScore * 100) / 100,
    }));
  } catch (dbErr) {
    console.warn('[mem0] Search memories error:', dbErr);
    return [];
  }
}

export async function getAllMemories(userId: string): Promise<MemoryItem[]> {
  if (!userId) return [];

  const apiKey = getMem0ApiKey();
  if (apiKey) {
    try {
      const response = await fetch(`${MEM0_API_BASE}/memories/?user_id=${userId}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });
      if (response.ok) {
        const data = (await response.json()) as any;
        const results = Array.isArray(data) ? data : data.results || [];
        return results.map((item: any) => ({
          id: item.id,
          memory: item.memory || item.text || '',
          category: item.metadata?.category || 'general',
          metadata: item.metadata || {},
          created_at: item.created_at,
        }));
      }
    } catch {}
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_memories')
      .select('id, memory, category, metadata, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
    console.error('[mem0] getAllMemories error:', err);
    return [];
  }
}

export async function deleteMemory(userId: string, memoryId: string): Promise<boolean> {
  const apiKey = getMem0ApiKey();
  if (apiKey) {
    try {
      await fetch(`${MEM0_API_BASE}/memories/${memoryId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${apiKey}` },
      });
    } catch {}
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('user_memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Builds an advisor executive memory dossier grouped by category.
 */
export async function exportAdvisorMemoryDossier(userId: string) {
  const memories = await getAllMemories(userId);

  const categories: Record<string, string[]> = {
    preference: [],
    client_context: [],
    workflow_habit: [],
    fact: [],
    persona: [],
    general: [],
  };

  memories.forEach((m) => {
    const cat = categories[m.category] ? m.category : 'general';
    categories[cat].push(m.memory);
  });

  return {
    userId,
    totalMemories: memories.length,
    lastUpdated: new Date().toISOString(),
    dossier: categories,
  };
}

export function formatMemoriesForPrompt(memories: MemoryItem[]): string {
  if (!memories || memories.length === 0) return '';
  const items = memories.map((m) => `- [${m.category.toUpperCase()}] ${m.memory}`).join('\n');
  return `\n\n### 🧠 Long-Term Memory Context (Mem0 pgvector):\nThe following persistent facts, preferences, and persona attributes were recalled for this advisor/client:\n${items}\n(Use these memories naturally to personalize your planning, actions, and tone without explicitly repeating this raw list unless relevant.)`;
}
