import { AdvizaAgentStateType } from "../state";
import { createClient } from "@/lib/supabase/server";

export async function complianceAuditNode(
  state: AdvizaAgentStateType
): Promise<Partial<AdvizaAgentStateType>> {
  const { sessionId, firmId, userId, capabilityCalls, executedResults, hitlPrompts, finalResponse } = state;

  if (!sessionId || !firmId) {
    return {};
  }

  try {
    const supabase = await createClient();

    // Persist assistant response & capability execution log
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      firm_id: firmId,
      user_id: userId,
      role: "assistant",
      content: finalResponse,
      capability_calls: capabilityCalls || [],
      metadata: {
        executedResults: executedResults || [],
        hitlPrompts: hitlPrompts || [],
        auditedAt: new Date().toISOString(),
        engine: "langgraph-multi-agent-v1",
      },
    });
  } catch (err) {
    console.warn("[langgraph-compliance-audit] Non-fatal Supabase persistence warning:", err);
  }

  return {};
}
