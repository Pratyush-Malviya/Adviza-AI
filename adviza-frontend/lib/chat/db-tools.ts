import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export interface DBToolResult {
  toolName: string;
  success: boolean;
  data: any;
  summary: string;
}

const ALLOWED_READ_TABLES = [
  "clients",
  "portfolios",
  "holdings",
  "meetings",
  "action_items",
  "workflows",
  "workflow_runs",
  "firm_connections",
  "audit_logs",
  "compliance_logs",
  "client_memories",
  "profiles",
  "firms",
] as const;

type AllowedTable = (typeof ALLOWED_READ_TABLES)[number];

/**
 * Searches and retrieves clients from Supabase.
 */
export async function toolListClients(
  supabase: SupabaseClient<Database>,
  params: { search?: string; limit?: number } = {}
): Promise<DBToolResult> {
  try {
    let query = supabase
      .from("clients")
      .select("id, full_name, email, phone, portfolio_value, risk_tolerance, investment_goals, age, occupation, notes, created_at")
      .order("portfolio_value", { ascending: false });

    if (params.search) {
      query = query.ilike("full_name", `%${params.search}%`);
    }

    const { data, error } = await query.limit(params.limit || 15);

    if (error) throw error;

    return {
      toolName: "list_clients",
      success: true,
      data: data || [],
      summary: `Found ${data?.length || 0} clients matching query.`,
    };
  } catch (err: any) {
    return {
      toolName: "list_clients",
      success: false,
      data: [],
      summary: `Failed to query clients: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Retrieves comprehensive dossier for a specific client (including portfolio, holdings, and notes).
 */
export async function toolGetClientDossier(
  supabase: SupabaseClient<Database>,
  clientIdentifier: string
): Promise<DBToolResult> {
  try {
    // 1. Find Client by ID or Name
    let client: any = null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientIdentifier);

    if (isUUID) {
      const { data } = await supabase.from("clients").select("*").eq("id", clientIdentifier).maybeSingle();
      client = data;
    } else {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .ilike("full_name", `%${clientIdentifier}%`)
        .limit(1)
        .maybeSingle();
      client = data;
    }

    if (!client) {
      return {
        toolName: "get_client_dossier",
        success: false,
        data: null,
        summary: `No client found matching "${clientIdentifier}".`,
      };
    }

    // 2. Fetch Portfolios and Holdings for Client
    const { data: portfolios } = await supabase
      .from("portfolios")
      .select("*, holdings(*)")
      .eq("client_id", client.id);

    // 3. Fetch Recent Meetings for Client
    const { data: meetings } = await supabase
      .from("meetings")
      .select("id, title, meeting_date, status, notes, briefing")
      .eq("client_id", client.id)
      .order("meeting_date", { ascending: false })
      .limit(5);

    // 4. Fetch Client Ambient Memories
    const { data: memories } = await supabase
      .from("client_memories")
      .select("memory_type, content, created_at")
      .eq("client_id", client.id)
      .limit(10);

    return {
      toolName: "get_client_dossier",
      success: true,
      data: {
        client,
        portfolios: portfolios || [],
        recentMeetings: meetings || [],
        ambientMemories: memories || [],
      },
      summary: `Retrieved dossier for ${client.full_name} ($${Number(client.portfolio_value || 0).toLocaleString()} AUM, ${portfolios?.length || 0} portfolios).`,
    };
  } catch (err: any) {
    return {
      toolName: "get_client_dossier",
      success: false,
      data: null,
      summary: `Failed to retrieve client dossier: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Retrieves portfolio holdings and drift metrics.
 */
export async function toolGetPortfolioHoldings(
  supabase: SupabaseClient<Database>,
  identifier?: string
): Promise<DBToolResult> {
  try {
    let query = supabase.from("portfolios").select("*, holdings(*)");

    if (identifier) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      if (isUUID) {
        query = query.or(`id.eq.${identifier},client_id.eq.${identifier}`);
      } else {
        // Query client name first
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .ilike("full_name", `%${identifier}%`)
          .limit(1)
          .maybeSingle();

        if (client) {
          query = query.eq("client_id", client.id);
        }
      }
    }

    const { data: portfolios, error } = await query.limit(10);

    if (error) throw error;

    return {
      toolName: "get_portfolio_holdings",
      success: true,
      data: portfolios || [],
      summary: `Retrieved ${portfolios?.length || 0} portfolios with active holdings.`,
    };
  } catch (err: any) {
    return {
      toolName: "get_portfolio_holdings",
      success: false,
      data: [],
      summary: `Failed to retrieve portfolio holdings: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Retrieves workflows and recent execution runs.
 */
export async function toolGetWorkflowsAndRuns(
  supabase: SupabaseClient<Database>,
  workflowNameOrId?: string
): Promise<DBToolResult> {
  try {
    let wfQuery = supabase.from("workflows").select("*");

    if (workflowNameOrId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workflowNameOrId);
      if (isUUID) {
        wfQuery = wfQuery.eq("id", workflowNameOrId);
      } else {
        wfQuery = wfQuery.ilike("name", `%${workflowNameOrId}%`);
      }
    }

    const { data: workflows, error: wfErr } = await wfQuery.limit(10);
    if (wfErr) throw wfErr;

    const { data: runs, error: runErr } = await supabase
      .from("workflow_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (runErr) throw runErr;

    return {
      toolName: "get_workflows_and_runs",
      success: true,
      data: {
        workflows: workflows || [],
        recentRuns: runs || [],
      },
      summary: `Found ${workflows?.length || 0} workflows and ${runs?.length || 0} recent execution runs.`,
    };
  } catch (err: any) {
    return {
      toolName: "get_workflows_and_runs",
      success: false,
      data: null,
      summary: `Failed to query workflows: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Retrieves action items and tasks.
 */
export async function toolGetActionItems(
  supabase: SupabaseClient<Database>,
  params: { status?: "open" | "completed" | "in-progress" | "cancelled" | "all"; limit?: number } = {}
): Promise<DBToolResult> {
  try {
    let query = supabase.from("action_items").select("*, clients(full_name)");

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(params.limit || 15);

    if (error) throw error;

    return {
      toolName: "get_action_items",
      success: true,
      data: data || [],
      summary: `Found ${data?.length || 0} action items.`,
    };
  } catch (err: any) {
    return {
      toolName: "get_action_items",
      success: false,
      data: [],
      summary: `Failed to query action items: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Retrieves meetings, briefings, and transcripts.
 */
export async function toolGetMeetings(
  supabase: SupabaseClient<Database>,
  params: { limit?: number; upcomingOnly?: boolean } = {}
): Promise<DBToolResult> {
  try {
    let query = supabase.from("meetings").select("*, clients(full_name)");

    if (params.upcomingOnly) {
      query = query.gte("meeting_date", new Date().toISOString());
    }

    const { data, error } = await query
      .order("meeting_date", { ascending: params.upcomingOnly ? true : false })
      .limit(params.limit || 10);

    if (error) throw error;

    return {
      toolName: "get_meetings",
      success: true,
      data: data || [],
      summary: `Found ${data?.length || 0} meetings.`,
    };
  } catch (err: any) {
    return {
      toolName: "get_meetings",
      success: false,
      data: [],
      summary: `Failed to query meetings: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Retrieves user audit logs (what the user has been doing in the account).
 */
export async function toolGetAuditTrail(
  supabase: SupabaseClient<Database>,
  params: { limit?: number; category?: string } = {}
): Promise<DBToolResult> {
  try {
    let query = supabase.from("audit_logs").select("*");

    if (params.category) {
      query = query.eq("entity_type", params.category);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(params.limit || 15);

    if (error) throw error;

    return {
      toolName: "get_audit_trail",
      success: true,
      data: data || [],
      summary: `Retrieved ${data?.length || 0} recent audit log entries.`,
    };
  } catch (err: any) {
    return {
      toolName: "get_audit_trail",
      success: false,
      data: [],
      summary: `Failed to query audit logs: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Safe parameterized read-only query on whitelist tables.
 */
export async function toolSafeQueryDatabase(
  supabase: SupabaseClient<Database>,
  table: string,
  filterCol?: string,
  filterVal?: string,
  limit = 10
): Promise<DBToolResult> {
  if (!ALLOWED_READ_TABLES.includes(table as AllowedTable)) {
    return {
      toolName: "safe_query_database",
      success: false,
      data: [],
      summary: `Access to table "${table}" is restricted. Allowed tables: ${ALLOWED_READ_TABLES.join(", ")}`,
    };
  }

  try {
    let query = supabase.from(table as any).select("*");

    if (filterCol && filterVal) {
      query = query.eq(filterCol, filterVal);
    }

    const { data, error } = await query.limit(Math.min(limit, 25));

    if (error) throw error;

    return {
      toolName: "safe_query_database",
      success: true,
      data: data || [],
      summary: `Retrieved ${data?.length || 0} rows from "${table}".`,
    };
  } catch (err: any) {
    return {
      toolName: "safe_query_database",
      success: false,
      data: [],
      summary: `Failed to query table "${table}": ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * Dispatches a tool request automatically based on user query intent.
 */
export async function executeDatabaseTool(
  supabase: SupabaseClient<Database>,
  toolName: string,
  toolArgs: Record<string, any>
): Promise<DBToolResult> {
  switch (toolName) {
    case "list_clients":
      return toolListClients(supabase, toolArgs);
    case "get_client_dossier":
      return toolGetClientDossier(supabase, toolArgs.clientIdentifier || toolArgs.name || toolArgs.id || "");
    case "get_portfolio_holdings":
      return toolGetPortfolioHoldings(supabase, toolArgs.identifier || toolArgs.clientName);
    case "get_workflows_and_runs":
      return toolGetWorkflowsAndRuns(supabase, toolArgs.workflowNameOrId);
    case "get_action_items":
      return toolGetActionItems(supabase, toolArgs);
    case "get_meetings":
      return toolGetMeetings(supabase, toolArgs);
    case "get_audit_trail":
      return toolGetAuditTrail(supabase, toolArgs);
    case "safe_query_database":
      return toolSafeQueryDatabase(supabase, toolArgs.table, toolArgs.filterCol, toolArgs.filterVal, toolArgs.limit);
    default:
      return {
        toolName,
        success: false,
        data: null,
        summary: `Unknown database tool: ${toolName}`,
      };
  }
}
