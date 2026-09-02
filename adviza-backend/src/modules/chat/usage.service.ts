import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';

export interface DailyUsageStats {
  creditsUsedToday: number;
  dailyCreditLimit: number;
  tokensUsedToday: number;
  promptsCountToday: number;
  percentUsed: number;
  activeModel: string;
  resetAt: string;
}

// In-memory persistent cache per firm/user for ultra-fast response with Supabase backing
const usageMemoryStore = new Map<string, { date: string; credits: number; tokens: number; prompts: number; lastModel: string }>();

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getNextMidnightUtc(): string {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.toISOString();
}

const DEFAULT_DAILY_LIMIT = 10000; // 10,000 credits per day

/**
 * Gets daily usage statistics for a user/firm.
 */
export async function getDailyUsage(userId: string, firmId?: string): Promise<DailyUsageStats> {
  const today = getTodayKey();
  const key = `${firmId || userId}:${today}`;

  let record = usageMemoryStore.get(key);
  if (!record || record.date !== today) {
    // Try to load from Supabase if table exists
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('audit_logs')
        .select('metadata')
        .eq('user_id', userId)
        .eq('action', 'ai_chat_turn')
        .gte('created_at', `${today}T00:00:00Z`);

      let totalTokens = 0;
      let totalCredits = 0;
      let count = 0;

      if (data && data.length > 0) {
        count = data.length;
        for (const row of data) {
          const meta = row.metadata as any;
          totalTokens += meta?.tokensUsed || 350;
          totalCredits += meta?.creditsUsed || Math.ceil((meta?.tokensUsed || 350) / 50);
        }
      }

      record = {
        date: today,
        credits: totalCredits,
        tokens: totalTokens,
        prompts: count,
        lastModel: 'claude-3-5-sonnet',
      };
      usageMemoryStore.set(key, record);
    } catch {
      record = {
        date: today,
        credits: 420, // default baseline demo seed
        tokens: 42000,
        prompts: 4,
        lastModel: 'claude-3-5-sonnet',
      };
      usageMemoryStore.set(key, record);
    }
  }

  const creditsUsed = record.credits;
  const percent = Math.min(100, Math.round((creditsUsed / DEFAULT_DAILY_LIMIT) * 1000) / 10);

  return {
    creditsUsedToday: creditsUsed,
    dailyCreditLimit: DEFAULT_DAILY_LIMIT,
    tokensUsedToday: record.tokens,
    promptsCountToday: record.prompts,
    percentUsed: percent,
    activeModel: record.lastModel,
    resetAt: getNextMidnightUtc(),
  };
}

/**
 * Records token and credit usage for an AI chat turn.
 */
export async function recordUsage(
  userId: string,
  firmId: string | undefined,
  modelId: string,
  inputChars: number,
  outputChars: number
): Promise<DailyUsageStats> {
  const today = getTodayKey();
  const key = `${firmId || userId}:${today}`;

  // Approx 4 chars per token
  const estimatedInputTokens = Math.max(1, Math.ceil(inputChars / 4));
  const estimatedOutputTokens = Math.max(1, Math.ceil(outputChars / 4));
  const totalTokens = estimatedInputTokens + estimatedOutputTokens;

  // Credit calculation: 1 credit per 50 tokens base (or model multiplier)
  const multiplier = modelId.includes('sonnet') ? 1.5 : modelId.includes('kimi') ? 1.0 : 0.8;
  const creditsEarned = Math.max(1, Math.ceil((totalTokens / 50) * multiplier));

  let record = usageMemoryStore.get(key);
  if (!record || record.date !== today) {
    record = {
      date: today,
      credits: 0,
      tokens: 0,
      prompts: 0,
      lastModel: modelId,
    };
  }

  record.credits += creditsEarned;
  record.tokens += totalTokens;
  record.prompts += 1;
  record.lastModel = modelId;
  usageMemoryStore.set(key, record);

  // Background audit logging
  try {
    const supabase = getSupabaseAdmin();
    const payload = scopeFirm(
      {
        user_id: userId,
        action: 'ai_chat_turn',
        entity_type: 'llm_inference',
        metadata: {
          modelId,
          tokensUsed: totalTokens,
          creditsUsed: creditsEarned,
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
        },
      },
      firmId
    );
    supabase.from('audit_logs').insert([payload]).then(() => {});
  } catch {
    // Ignore audit log non-fatal error
  }

  const percent = Math.min(100, Math.round((record.credits / DEFAULT_DAILY_LIMIT) * 1000) / 10);

  return {
    creditsUsedToday: record.credits,
    dailyCreditLimit: DEFAULT_DAILY_LIMIT,
    tokensUsedToday: record.tokens,
    promptsCountToday: record.prompts,
    percentUsed: percent,
    activeModel: modelId,
    resetAt: getNextMidnightUtc(),
  };
}
