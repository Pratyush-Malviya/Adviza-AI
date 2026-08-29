import { SUPPORTED_COMPOSIO_APPS } from "@/lib/composio";

export interface CapabilityParameter {
  type: string;
  description: string;
  required?: boolean;
}

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  source: "agent_fleet" | "composio_connector" | "saved_workflow";
  category: "briefing" | "meeting" | "compliance" | "calendar" | "crm" | "email" | "communication" | "portfolio" | "workflow";
  requiredConnector?: string; // e.g. "googlecalendar", "gmail", "salesforce"
  requiresHITL: boolean; // Outbound communications or trade-adjacent actions require advisor sign-off
  executionType: "sync" | "async_inngest" | "agent_fleet";
  parameters: Record<string, CapabilityParameter>;
}

export const CAPABILITY_REGISTRY: CapabilityDefinition[] = [
  // ============================================================
  // 1. FIDUCIARY AGENT FLEET CAPABILITIES
  // ============================================================
  {
    id: "agent_meeting_briefing",
    name: "Pre-Meeting Briefing Agent",
    description: "Generates an executive briefing dossier, talking points, portfolio metrics, open action items, and risk flags for an upcoming client meeting.",
    source: "agent_fleet",
    category: "briefing",
    requiresHITL: false,
    executionType: "agent_fleet",
    parameters: {
      clientName: { type: "string", description: "Name of the client", required: true },
      meetingType: { type: "string", description: "Type of meeting (e.g. Annual Review, Discovery, Strategy)", required: false },
      timeframe: { type: "string", description: "Date or time context for the meeting", required: false },
    },
  },
  {
    id: "agent_compliance_audit",
    name: "SEC / FINRA Compliance Auditor",
    description: "Evaluates fiduciary suitability, Form ADV Part 2A disclosures, and generates audit-ready compliance records with WORM retention markers.",
    source: "agent_fleet",
    category: "compliance",
    requiresHITL: true,
    executionType: "agent_fleet",
    parameters: {
      clientName: { type: "string", description: "Name of the client", required: true },
      advisorName: { type: "string", description: "Name of the advisor", required: false },
      meetingSummary: { type: "string", description: "Summary of meeting discussions or trade recommendations", required: true },
      clientRiskProfile: { type: "string", description: "Stated risk profile (e.g. Moderate Growth, Conservative)", required: false },
    },
  },
  {
    id: "agent_meeting_intelligence",
    name: "Meeting Intelligence & Action Item Extractor",
    description: "Analyzes client meeting transcripts/audio, generates structured minutes, extracts follow-up deliverables, and flags advisory sentiment.",
    source: "agent_fleet",
    category: "meeting",
    requiresHITL: false,
    executionType: "agent_fleet",
    parameters: {
      clientName: { type: "string", description: "Name of the client", required: true },
      rawNotesOrTranscript: { type: "string", description: "Meeting notes or audio transcript", required: true },
    },
  },
  {
    id: "agent_portfolio_rebalance",
    name: "Portfolio Drift & Allocation Auditor",
    description: "Calculates asset allocation drift against target mandates and proposes tax-loss harvesting or rebalancing trade orders.",
    source: "agent_fleet",
    category: "portfolio",
    requiresHITL: true, // Trade adjacent requires HITL
    executionType: "agent_fleet",
    parameters: {
      clientName: { type: "string", description: "Name of the client", required: true },
      targetEquityPercent: { type: "number", description: "Target equity allocation percentage", required: false },
    },
  },

  // ============================================================
  // 2. COMPOSIO CONNECTOR CAPABILITIES
  // ============================================================
  {
    id: "composio_googlecalendar_list_events",
    name: "Google Calendar: List Upcoming Events",
    description: "Fetches scheduled client appointments, reviews, and discovery calls from Google Calendar.",
    source: "composio_connector",
    category: "calendar",
    requiredConnector: "googlecalendar",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      timeMin: { type: "string", description: "ISO timestamp or relative date (e.g. 'today')", required: false },
      maxResults: { type: "number", description: "Maximum number of events to fetch", required: false },
    },
  },
  {
    id: "composio_outlook_get_events",
    name: "Microsoft Outlook: List Calendar Events",
    description: "Fetches scheduled advisory meetings and portfolio reviews from Office 365 Outlook Calendar.",
    source: "composio_connector",
    category: "calendar",
    requiredConnector: "outlook_calendar",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      timeMin: { type: "string", description: "Date filter for meetings", required: false },
    },
  },
  {
    id: "composio_salesforce_get_client",
    name: "Salesforce Financial Services: Query Client",
    description: "Retrieves client account details, net worth, risk profile, and open opportunities from Salesforce FSC.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "salesforce",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      clientName: { type: "string", description: "Client or Household name in Salesforce", required: true },
    },
  },
  {
    id: "composio_wealthbox_get_contact",
    name: "Wealthbox CRM: Query Contact Record",
    description: "Looks up RIA client contact cards, relationship history, and recent activity streams from Wealthbox.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "wealthbox",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      contactName: { type: "string", description: "Name of the client contact in Wealthbox", required: true },
    },
  },
  {
    id: "composio_hubspot_get_contact",
    name: "HubSpot CRM: Query Prospect / Client",
    description: "Fetches lead stages, deal pipelines, and client correspondence history from HubSpot.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "hubspot",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      clientEmailOrName: { type: "string", description: "Email or name of the contact in HubSpot", required: true },
    },
  },
  {
    id: "composio_gmail_send_email",
    name: "Gmail: Send Client Follow-Up",
    description: "Dispatches a post-meeting summary, suitability memo, or onboarding email to the client via Gmail.",
    source: "composio_connector",
    category: "email",
    requiredConnector: "gmail",
    requiresHITL: true, // Outbound client communication requires advisor sign-off
    executionType: "sync",
    parameters: {
      recipientEmail: { type: "string", description: "Client email address", required: true },
      subject: { type: "string", description: "Email subject line", required: true },
      body: { type: "string", description: "Compliance-approved email body", required: true },
    },
  },
  {
    id: "composio_slack_send_alert",
    name: "Slack: Send Team Notification",
    description: "Posts an urgent compliance alert, meeting debrief, or paraplanner task into a Slack channel.",
    source: "composio_connector",
    category: "communication",
    requiredConnector: "slack",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      channel: { type: "string", description: "Target Slack channel name or ID", required: true },
      message: { type: "string", description: "Notification text or briefing card", required: true },
    },
  },
  {
    id: "composio_notion_create_page",
    name: "Notion: Create Client Dossier Page",
    description: "Publishes investment policy statements and meeting briefing notes to the firm's Notion workspace.",
    source: "composio_connector",
    category: "communication",
    requiredConnector: "notion",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      title: { type: "string", description: "Page title", required: true },
      contentMarkdown: { type: "string", description: "Markdown content to write to Notion", required: true },
    },
  },
  {
    id: "composio_googlesheets_append_data",
    name: "Google Sheets: Append Portfolio Row",
    description: "Logs portfolio asset allocation or rebalance trade orders into a central spreadsheet.",
    source: "composio_connector",
    category: "portfolio",
    requiredConnector: "googlesheets",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      spreadsheetId: { type: "string", description: "Google Sheets spreadsheet ID", required: false },
      rowData: { type: "string", description: "JSON array or CSV row to append", required: true },
    },
  },

  // ============================================================
  // 3. WORKFLOW INVOCATION
  // ============================================================
  {
    id: "workflow_run_by_name",
    name: "Execute Stored Pipeline Workflow",
    description: "Triggers a saved visual automation workflow by name or ID (e.g. 'Quarterly Review Pipeline').",
    source: "saved_workflow",
    category: "workflow",
    requiresHITL: false,
    executionType: "async_inngest",
    parameters: {
      workflowNameOrId: { type: "string", description: "Name or UUID of the saved workflow", required: true },
      clientContext: { type: "string", description: "Optional client context or meeting date", required: false },
    },
  },
];

/**
 * Generates prompt formatting for LLM tool selection
 */
export function getCapabilityRegistryPrompt(): string {
  const toolsFormatted = CAPABILITY_REGISTRY.map((cap) => {
    const paramsList = Object.entries(cap.parameters)
      .map(([k, v]) => `    - ${k} (${v.type}${v.required ? ", required" : ""}): ${v.description}`)
      .join("\n");
    return `### Capability: ${cap.id}
- Name: ${cap.name}
- Description: ${cap.description}
- Source: ${cap.source}
- Requires Advisor Sign-off (HITL): ${cap.requiresHITL}
- Required Connector App: ${cap.requiredConnector || "None (Built-in)"}
- Parameters:
${paramsList}`;
  }).join("\n\n");

  return `You are Adviza AI's Chat Orchestrator. You have access to the following typed Capability Registry:

${toolsFormatted}

When a user asks a question or gives an instruction:
1. Determine which capability or capabilities from the registry should be invoked to satisfy the user's intent.
2. If multiple capabilities are needed (e.g. calendar fetch + briefing generation), list all required tool calls.
3. If no external tool is needed (e.g. general advisory question or greeting), answer directly with natural conversational guidance.
4. Output your plan as structured JSON with:
   - "conversational_intro": String explaining what you are doing (e.g. "Checking your calendar and compiling the briefing...")
   - "capability_calls": Array of objects:
     - "capability_id": ID from registry
     - "parameters": Key-value dictionary matching capability parameters
     - "reason": Why this tool is being invoked
   - "direct_answer": String containing the direct response if no tool call is needed.`;
}

export function findCapability(id: string): CapabilityDefinition | undefined {
  return CAPABILITY_REGISTRY.find((c) => c.id === id);
}

export function getAppForConnector(connectorId?: string) {
  if (!connectorId) return undefined;
  return SUPPORTED_COMPOSIO_APPS.find((app) => app.id.toLowerCase() === connectorId.toLowerCase());
}
