import { createClient } from "@/lib/supabase/server";

export interface UsageLimits {
  users: { used: number; max: number; pct: number; canAdd: boolean };
  clients: { used: number; max: number; pct: number };
  meetings: { used: number; max: number; pct: number };
  aiRequests: { used: number; max: number; pct: number };
  workflows: { used: number; max: number; pct: number };
}

// Plan defaults — used as fallback when DB columns are null
const PLAN_DEFAULTS: Record<
  string,
  {
    max_users: number;
    max_clients: number;
    meetings_limit: number;
    max_ai_requests_per_month: number;
    max_workflows: number;
  }
> = {
  free: {
    max_users: 1,
    max_clients: 10,
    meetings_limit: 10,
    max_ai_requests_per_month: 100,
    max_workflows: 3,
  },
  pro: {
    max_users: 3,
    max_clients: 100,
    meetings_limit: 100,
    max_ai_requests_per_month: 500,
    max_workflows: 10,
  },
  enterprise: {
    max_users: 50,
    max_clients: 2000,
    meetings_limit: 9999,
    max_ai_requests_per_month: 5000,
    max_workflows: 999,
  },
};

function pct(used: number, max: number) {
  return max > 0 ? Math.round((used / max) * 100) : 0;
}

// ---------------------------------------------------------------------------
// Fetch full usage limits for an org
// ---------------------------------------------------------------------------
export async function getOrgUsageLimits(firmId: string): Promise<UsageLimits> {
  const supabase = await createClient();

  const [firmRes, userRes, clientRes, workflowRes] = await Promise.all([
    supabase
      .from("firms")
      .select(
        "plan, max_users, max_clients, meetings_used, meetings_limit, max_ai_requests_per_month, ai_requests_used_this_month, max_workflows"
      )
      .eq("id", firmId)
      .single(),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", firmId),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", firmId),
    supabase
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", firmId),
  ]);

  const firm = firmRes.data;
  const plan = firm?.plan ?? "free";
  const defaults = PLAN_DEFAULTS[plan] ?? PLAN_DEFAULTS.free;

  const maxUsers = firm?.max_users ?? defaults.max_users;
  const maxClients = firm?.max_clients ?? defaults.max_clients;
  const maxMeetings = firm?.meetings_limit ?? defaults.meetings_limit;
  const maxAI = firm?.max_ai_requests_per_month ?? defaults.max_ai_requests_per_month;
  const maxWorkflows = firm?.max_workflows ?? defaults.max_workflows;

  const usedUsers = userRes.count ?? 0;
  const usedClients = clientRes.count ?? 0;
  const usedMeetings = firm?.meetings_used ?? 0;
  const usedAI = firm?.ai_requests_used_this_month ?? 0;
  const usedWorkflows = workflowRes.count ?? 0;

  return {
    users: {
      used: usedUsers,
      max: maxUsers,
      pct: pct(usedUsers, maxUsers),
      canAdd: usedUsers < maxUsers,
    },
    clients: {
      used: usedClients,
      max: maxClients,
      pct: pct(usedClients, maxClients),
    },
    meetings: {
      used: usedMeetings,
      max: maxMeetings,
      pct: pct(usedMeetings, maxMeetings),
    },
    aiRequests: {
      used: usedAI,
      max: maxAI,
      pct: pct(usedAI, maxAI),
    },
    workflows: {
      used: usedWorkflows,
      max: maxWorkflows,
      pct: pct(usedWorkflows, maxWorkflows),
    },
  };
}

// ---------------------------------------------------------------------------
// Atomically increment AI request counter (called per AI response)
// ---------------------------------------------------------------------------
export async function incrementAIRequestCount(firmId: string): Promise<void> {
  const supabase = await createClient();
  await (supabase.rpc as any)("increment_ai_requests", { p_firm_id: firmId });
}
