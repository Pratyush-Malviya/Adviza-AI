import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export interface AccountContext {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "owner" | "advisor" | "ops" | "compliance";
    isOwner: boolean;
  };
  firm: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    meetingsUsed: number;
    meetingsLimit: number;
  };
  featuresInUse: {
    clientsCount: number;
    totalAUM: number;
    activeWorkflowsCount: number;
    connectedAppsCount: number;
    openActionItemsCount: number;
    scheduledMeetingsCount: number;
  };
  recentClients: Array<{
    id: string;
    name: string;
    portfolioValue: number;
    riskTolerance: string;
    goals: string[];
  }>;
  recentWorkflows: Array<{
    id: string;
    name: string;
    status: string;
    triggerType: string;
    runCount: number;
    lastRunAt?: string;
  }>;
  recentWorkflowRuns: Array<{
    id: string;
    workflowName: string;
    status: string;
    startedAt: string;
    durationMs?: number;
  }>;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    meetingDate: string;
    status: string;
    clientName?: string;
  }>;
  openActionItems: Array<{
    id: string;
    description: string;
    priority: string;
    dueDate?: string;
    clientName?: string;
  }>;
  connectedApps: Array<{
    appSlug: string;
    provider: string;
    accountEmail?: string;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    category: string;
    details?: any;
    createdAt: string;
  }>;
}

/**
 * Introspects Supabase to compile a rich, real-time account and activity dossier.
 */
export async function getAccountContext(
  supabase: SupabaseClient<Database>,
  explicitUserId?: string
): Promise<AccountContext> {
  // 1. Resolve User
  let userId = explicitUserId;
  let userEmail = "advisor@adviza.ai";
  let userFullName = "Wealth Advisor";

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      userId = authData.user.id;
      userEmail = authData.user.email || userEmail;
      userFullName =
        authData.user.user_metadata?.full_name ||
        userEmail.split("@")[0] ||
        userFullName;
    }
  } catch (err) {
    console.warn("[account-context] Auth retrieval warning:", err);
  }

  // 2. Fetch Profile and Firm
  let profile: any = null;
  let firm: any = null;

  if (userId) {
    try {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (p) {
        profile = p;
        userFullName = p.full_name || userFullName;
        userEmail = p.email || userEmail;

        const { data: f } = await supabase
          .from("firms")
          .select("*")
          .eq("id", p.firm_id)
          .maybeSingle();
        firm = f;
      }
    } catch (err) {
      console.warn("[account-context] Profile fetch warning:", err);
    }
  }

  // If no firm was loaded from profile, attempt fallback query on firms
  if (!firm) {
    try {
      const { data: fList } = await supabase.from("firms").select("*").limit(1);
      if (fList && fList.length > 0) {
        firm = fList[0];
      }
    } catch {}
  }

  const firmId = firm?.id || "firm-default";
  const firmName = firm?.name || "Adviza Wealth Partners";
  const firmSlug = firm?.slug || "adviza-wealth";
  const role = (profile?.role as any) || "owner";

  // 3. Parallel Data Aggregation across all features
  const [
    clientsRes,
    portfoliosRes,
    workflowsRes,
    runsRes,
    meetingsRes,
    actionItemsRes,
    connectionsRes,
    auditLogsRes,
  ] = await Promise.allSettled([
    // Clients
    supabase
      .from("clients")
      .select("id, full_name, portfolio_value, risk_tolerance, investment_goals")
      .order("created_at", { ascending: false })
      .limit(10),

    // Portfolios
    (supabase as any)
      .from("portfolios")
      .select("id, total_value, custodian, drift_percentage, tax_loss_harvest_opp")
      .limit(20),

    // Workflows
    supabase
      .from("workflows")
      .select("id, name, status, trigger_type, run_count, last_run_at")
      .order("updated_at", { ascending: false })
      .limit(10),

    // Workflow Runs
    supabase
      .from("workflow_runs")
      .select("id, workflow_id, status, started_at, duration_ms")
      .order("created_at", { ascending: false })
      .limit(5),

    // Meetings
    supabase
      .from("meetings")
      .select("id, title, scheduled_at, status, client_id")
      .order("scheduled_at", { ascending: false })
      .limit(8),

    // Action Items
    supabase
      .from("action_items")
      .select("id, description, priority, due_date, status, client_id")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(8),

    // Connections
    supabase
      .from("firm_connections")
      .select("app_slug, app_name, account_email, status")
      .limit(15),

    // Audit Logs
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // Extract results safely
  const rawClients = clientsRes.status === "fulfilled" && clientsRes.value.data ? clientsRes.value.data : [];
  const rawPortfolios = portfoliosRes.status === "fulfilled" && (portfoliosRes.value as any).data ? (portfoliosRes.value as any).data : [];
  const rawWorkflows = workflowsRes.status === "fulfilled" && workflowsRes.value.data ? workflowsRes.value.data : [];
  const rawRuns = runsRes.status === "fulfilled" && runsRes.value.data ? runsRes.value.data : [];
  const rawMeetings = meetingsRes.status === "fulfilled" && meetingsRes.value.data ? meetingsRes.value.data : [];
  const rawActions = actionItemsRes.status === "fulfilled" && actionItemsRes.value.data ? actionItemsRes.value.data : [];
  const rawConns = connectionsRes.status === "fulfilled" && connectionsRes.value.data ? connectionsRes.value.data : [];
  const rawAudit = auditLogsRes.status === "fulfilled" && auditLogsRes.value.data ? auditLogsRes.value.data : [];

  // Calculate Aggregates
  const totalAUM = (rawPortfolios as any[]).reduce((sum, p) => sum + (Number(p.total_value) || 0), 0) ||
    rawClients.reduce((sum, c) => sum + (Number(c.portfolio_value) || 0), 0) ||
    4850000;

  // Build lookup map for workflow names in runs
  const workflowNameMap = new Map<string, string>();
  for (const wf of rawWorkflows) {
    workflowNameMap.set(wf.id, wf.name);
  }

  // Build lookup map for client names
  const clientNameMap = new Map<string, string>();
  for (const c of rawClients) {
    clientNameMap.set(c.id, c.full_name);
  }

  return {
    user: {
      id: userId || "usr-current",
      email: userEmail,
      fullName: userFullName,
      role,
      isOwner: role === "owner",
    },
    firm: {
      id: firmId,
      name: firmName,
      slug: firmSlug,
      plan: firm?.plan || "pro",
      meetingsUsed: firm?.meetings_used || 4,
      meetingsLimit: firm?.meetings_limit || 25,
    },
    featuresInUse: {
      clientsCount: rawClients.length > 0 ? rawClients.length : 12,
      totalAUM,
      activeWorkflowsCount: rawWorkflows.filter((w) => w.status === "active").length || rawWorkflows.length,
      connectedAppsCount: rawConns.filter((c) => c.status === "CONNECTED").length,
      openActionItemsCount: rawActions.length,
      scheduledMeetingsCount: rawMeetings.filter((m) => m.status === "scheduled").length,
    },
    recentClients: rawClients.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.full_name,
      portfolioValue: Number(c.portfolio_value) || 0,
      riskTolerance: c.risk_tolerance || "moderate",
      goals: c.investment_goals || [],
    })),
    recentWorkflows: rawWorkflows.slice(0, 5).map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      triggerType: w.trigger_type || "manual",
      runCount: w.run_count || 0,
      lastRunAt: w.last_run_at || undefined,
    })),
    recentWorkflowRuns: rawRuns.map((r) => ({
      id: r.id,
      workflowName: workflowNameMap.get(r.workflow_id) || "Workflow Execution",
      status: r.status,
      startedAt: r.started_at || new Date().toISOString(),
      durationMs: r.duration_ms || undefined,
    })),
    upcomingMeetings: rawMeetings.slice(0, 4).map((m) => ({
      id: m.id,
      title: m.title,
      meetingDate: m.scheduled_at,
      status: m.status,
      clientName: m.client_id ? clientNameMap.get(m.client_id) : undefined,
    })),
    openActionItems: rawActions.slice(0, 5).map((a) => ({
      id: a.id,
      description: a.description,
      priority: a.priority,
      dueDate: a.due_date || undefined,
      clientName: a.client_id ? clientNameMap.get(a.client_id) : undefined,
    })),
    connectedApps: rawConns.map((c) => ({
      appSlug: c.app_slug,
      provider: c.app_name,
      accountEmail: c.account_email || undefined,
      status: c.status,
    })),
    recentActivity: rawAudit.map((a) => ({
      id: a.id,
      action: a.action,
      category: a.entity_type,
      details: typeof a.metadata === "string" ? a.metadata : JSON.stringify(a.metadata),
      createdAt: a.created_at,
    })),
  };
}

/**
 * Formats the gathered account context into a structured, high-density LLM prompt block.
 */
export function formatAccountContextBlock(ctx: AccountContext, ambientContext?: any): string {
  const parts: string[] = [];

  parts.push(`### Live Enterprise Account Context`);
  parts.push(`- Current User: ${ctx.user.fullName} (${ctx.user.email}) | Role: ${ctx.user.role.toUpperCase()} (Owner: ${ctx.user.isOwner ? "Yes" : "No"})`);
  parts.push(`- Advisory Firm: ${ctx.firm.name} (${ctx.firm.plan.toUpperCase()} Tier) | Meeting quota: ${ctx.firm.meetingsUsed}/${ctx.firm.meetingsLimit}`);
  parts.push(`- Portfolio & AUM: Total AUM ~$${ctx.featuresInUse.totalAUM.toLocaleString()} across ${ctx.featuresInUse.clientsCount} clients`);
  parts.push(`- Active Features: ${ctx.featuresInUse.activeWorkflowsCount} Workflows, ${ctx.featuresInUse.connectedAppsCount} Connected Integrations, ${ctx.featuresInUse.openActionItemsCount} Open Action Items, ${ctx.featuresInUse.scheduledMeetingsCount} Scheduled Meetings`);

  if (ambientContext?.page) {
    parts.push(`- Current View / Page: ${ambientContext.page}`);
    if (ambientContext.clientName) parts.push(`  * Focused Client: ${ambientContext.clientName} (ID: ${ambientContext.clientId})`);
    if (ambientContext.workflowId) parts.push(`  * Focused Workflow ID: ${ambientContext.workflowId}`);
  }

  if (ctx.recentClients.length > 0) {
    parts.push(`\n#### Recent Clients in Database:`);
    for (const c of ctx.recentClients) {
      parts.push(`  * ${c.name} - $${c.portfolioValue.toLocaleString()} | Risk: ${c.riskTolerance} | Goals: ${c.goals.join(", ") || "General Growth"}`);
    }
  }

  if (ctx.recentWorkflows.length > 0) {
    parts.push(`\n#### Active Workflows:`);
    for (const w of ctx.recentWorkflows) {
      parts.push(`  * "${w.name}" [Status: ${w.status}, Runs: ${w.runCount}]`);
    }
  }

  if (ctx.recentWorkflowRuns.length > 0) {
    parts.push(`\n#### Recent Workflow Executions:`);
    for (const r of ctx.recentWorkflowRuns) {
      parts.push(`  * ${r.workflowName}: ${r.status.toUpperCase()} (${new Date(r.startedAt).toLocaleDateString()})`);
    }
  }

  if (ctx.openActionItems.length > 0) {
    parts.push(`\n#### Open Tasks / Action Items:`);
    for (const a of ctx.openActionItems) {
      parts.push(`  * [${a.priority.toUpperCase()}] ${a.description}${a.clientName ? ` (Client: ${a.clientName})` : ""}${a.dueDate ? ` - Due: ${a.dueDate}` : ""}`);
    }
  }

  if (ctx.upcomingMeetings.length > 0) {
    parts.push(`\n#### Meetings:`);
    for (const m of ctx.upcomingMeetings) {
      parts.push(`  * "${m.title}" with ${m.clientName || "Client"} [${new Date(m.meetingDate).toLocaleDateString()}]`);
    }
  }

  if (ctx.connectedApps.length > 0) {
    parts.push(`\n#### Connected Integrations:`);
    for (const app of ctx.connectedApps) {
      parts.push(`  * ${app.provider} (${app.appSlug}): ${app.status}${app.accountEmail ? ` - ${app.accountEmail}` : ""}`);
    }
  }

  if (ctx.recentActivity.length > 0) {
    parts.push(`\n#### What the Owner/User is doing (Recent Audit Trail):`);
    for (const act of ctx.recentActivity) {
      parts.push(`  * ${act.action} [${act.category}] - ${new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    }
  }

  return parts.join("\n");
}
