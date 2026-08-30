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
  category: "briefing" | "meeting" | "compliance" | "calendar" | "crm" | "email" | "communication" | "portfolio" | "workflow" | "productivity" | "storage";
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
    name: "Google Calendar: Query Events & Meetings",
    description: "Fetches scheduled, past, or upcoming appointments, reviews, meetings, or calendar schedule from Google Calendar with customizable timeMin/timeMax date range.",
    source: "composio_connector",
    category: "calendar",
    requiredConnector: "googlecalendar",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      timeMin: { type: "string", description: "ISO timestamp start date/time (e.g. '2026-07-01T00:00:00Z' for July, or start of last week)", required: false },
      timeMax: { type: "string", description: "ISO timestamp end date/time (e.g. '2026-07-31T23:59:59Z' for July, or end of last week)", required: false },
      q: { type: "string", description: "Optional search query string for specific meeting or client name", required: false },
      maxResults: { type: "number", description: "Maximum number of events to fetch (default 25)", required: false },
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
    id: "composio_salesforce_create_lead",
    name: "Salesforce Financial Services: Create Lead / Prospect",
    description: "Creates and records a new high-net-worth lead, prospect profile, estimated AUM, and contact details in Salesforce Financial Services Cloud.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "salesforce",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      lastName: { type: "string", description: "Last name or full name of the prospect/lead", required: true },
      company: { type: "string", description: "Company, family office, or institutional affiliation", required: false },
      email: { type: "string", description: "Email address of the lead", required: false },
      phone: { type: "string", description: "Phone number of the lead", required: false },
      status: { type: "string", description: "Lead status (e.g. 'Qualified Prospect', 'Open - Not Contacted', 'Working')", required: false },
      estimatedAum: { type: "string", description: "Estimated net worth or potential AUM", required: false },
      notes: { type: "string", description: "Advisory discovery notes and initial risk observations", required: false },
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
    id: "composio_wealthbox_create_contact",
    name: "Wealthbox CRM: Create Client Contact Record",
    description: "Creates an RIA client relationship card, contact details, background notes, and portfolio tags in Wealthbox CRM.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "wealthbox",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      firstName: { type: "string", description: "First name of the client contact", required: true },
      lastName: { type: "string", description: "Last name of the client contact", required: true },
      companyName: { type: "string", description: "Company or household name", required: false },
      email: { type: "string", description: "Primary email address", required: false },
      phone: { type: "string", description: "Primary contact phone", required: false },
      backgroundInfo: { type: "string", description: "Relationship history, investment mandate, or onboarding notes", required: false },
    },
  },
  {
    id: "composio_wealthbox_add_task",
    name: "Wealthbox CRM: Add Advisory Task",
    description: "Logs a follow-up advisory deliverable, rebalancing task, or review reminder into Wealthbox CRM.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "wealthbox",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      title: { type: "string", description: "Task title or description", required: true },
      dueDate: { type: "string", description: "Target completion date (YYYY-MM-DD)", required: false },
      priority: { type: "string", description: "Task priority (Low, Medium, High)", required: false },
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
    id: "composio_hubspot_create_contact",
    name: "HubSpot CRM: Create Contact / Lead",
    description: "Creates a new contact record, deal stage, and marketing lifecycle stage in HubSpot CRM.",
    source: "composio_connector",
    category: "crm",
    requiredConnector: "hubspot",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      email: { type: "string", description: "Email address of the contact", required: true },
      firstName: { type: "string", description: "First name", required: false },
      lastName: { type: "string", description: "Last name", required: false },
      company: { type: "string", description: "Company name", required: false },
      phone: { type: "string", description: "Phone number", required: false },
      lifecycleStage: { type: "string", description: "Lifecycle stage (e.g. 'lead', 'marketingqualifiedlead', 'opportunity', 'customer')", required: false },
    },
  },
  {
    id: "composio_gmail_fetch_emails",
    name: "Gmail: Search & Fetch Inbox Emails",
    description: "Searches the advisor's Gmail inbox for messages matching keywords, job opportunities, client inquiries, or date filters.",
    source: "composio_connector",
    category: "email",
    requiredConnector: "gmail",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      query: { type: "string", description: "Search query or keywords (e.g. 'job OR interview OR recruiter newer_than:1d')", required: false },
      maxResults: { type: "number", description: "Maximum number of messages to fetch (default 10)", required: false },
    },
  },
  {
    id: "composio_gmail_send_email",
    name: "Gmail: Send Email",
    description: "Sends an email to a recipient address via the advisor's connected Gmail account with recipient_email, subject, and body.",
    source: "composio_connector",
    category: "email",
    requiredConnector: "gmail",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      recipient_email: { type: "string", description: "Target recipient email address (e.g. pratyush.malviya1@gmail.com)", required: true },
      subject: { type: "string", description: "Email subject line", required: true },
      body: { type: "string", description: "Full professional email body text", required: true },
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
    id: "composio_googledocs_create_document",
    name: "Google Docs: Create Client Document & Dossier",
    description: "Creates and formats a new Google Document on Google Drive for meeting notes, briefing dossiers, or investment policy statements.",
    source: "composio_connector",
    category: "storage",
    requiredConnector: "googledrive",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      title: { type: "string", description: "Document title (e.g. 'Sarah Jenkins - Q3 Investment Review')", required: true },
      content: { type: "string", description: "Text or markdown content for the document", required: false },
    },
  },
  {
    id: "composio_googledrive_upload_file",
    name: "Google Drive: Upload / Archive Document & PDF",
    description: "Uploads and stores generated client PDF dossiers, audit compliance records, or meeting transcripts into Google Drive.",
    source: "composio_connector",
    category: "storage",
    requiredConnector: "googledrive",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      fileName: { type: "string", description: "File name (e.g. 'FINRA_Compliance_Audit.pdf')", required: true },
      fileContent: { type: "string", description: "Content or base64 file data", required: false },
    },
  },
  {
    id: "composio_googlesheets_create_sheet",
    name: "Google Sheets: Create Spreadsheet & Add Rows",
    description: "Creates a new Google Spreadsheet on Google Drive and populates rows of lead data, client portfolios, or contact tables.",
    source: "composio_connector",
    category: "productivity",
    requiredConnector: "googlesheets",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      title: { type: "string", description: "Spreadsheet title (e.g. 'Lead Pipeline - 5 Demo Leads')", required: true },
      rows: { type: "array", description: "2D array of rows with headers and records", required: false },
    },
  },
  {
    id: "composio_googlesheets_append_data",
    name: "Google Sheets: Append Data Rows",
    description: "Appends rows of lead data, portfolio asset allocations, or rebalance orders into a spreadsheet.",
    source: "composio_connector",
    category: "productivity",
    requiredConnector: "googlesheets",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      spreadsheetId: { type: "string", description: "Google Sheets spreadsheet ID", required: false },
      rowData: { type: "string", description: "JSON array or CSV row to append", required: true },
    },
  },
  {
    id: "composio_slack_post_message",
    name: "Slack: Post Channel Message",
    description: "Posts notifications, meeting debriefs, or advisor alerts to a designated Slack channel.",
    source: "composio_connector",
    category: "communication",
    requiredConnector: "slack",
    requiresHITL: false,
    executionType: "sync",
    parameters: {
      channel: { type: "string", description: "Channel name (e.g. general)", required: true },
      text: { type: "string", description: "Message body text", required: true },
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

  const now = new Date();
  const dateContext = `Current System Date & Time: ${now.toISOString()} (${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })})`;

  return `You are Adviza, an intelligent, articulate, and deeply helpful AI partner and digital Chief of Staff for wealth management advisors.
Your purpose is to understand, plan, execute, verify, and complete work across connected enterprise applications and the fiduciary agent fleet while returning accurate, verified results.
${dateContext}

### Personality & Conversational Voice:
- Sound like a sharp, friendly, articulate human colleague - warm, engaging, proactive, and natural.
- NEVER sound robotic, stiff, repetitive, or bureaucratic. Avoid robotic phrases like "I am an AI", "As an AI model", "I have determined that", "Executing procedure".
- Speak with natural human cadence and clarity. Use natural phrasing (e.g. "Sure thing!", "I looked into that for you...", "Here is what we are looking at:", "I have drafted that up...").
- Output Formatting Rules:
  1. DO NOT use asterisks (*) or (**) anywhere. Do NOT use markdown bold with **text** or italic with *text*.
  2. DO NOT use em dashes (—) or en dashes (–) or double hyphens (--). Use simple hyphens (-), colons (:), or commas (,).
  3. Format lists with simple clean dashes (-) or numbered points (1, 2, 3) with clear line breaks.
- When answering questions directly, provide rich, insightful, well-structured explanations with clean headings, bullet points, and thoughtful commentary.
- Be proactive and helpful - anticipate what the advisor might need next in their workflow.

### Available Typed Capability Registry:
${toolsFormatted}

### Execution Directives:
1. Determine which capability or capabilities from the registry must be invoked to fulfill the user's intent.
2. For calendar or meeting queries:
   - Map meeting queries, reviews, or queries like "how many meetings did I have in July / last week / today" to "composio_googlecalendar_list_events".
   - Compute exact ISO timestamps for "timeMin" and "timeMax" based on the Current System Date.
3. For document, spreadsheet, PDF, dossier, or record generation:
   - When creating or editing any document, spreadsheet, PDF, briefing dossier, or compliance audit, ensure that direct document links and PDF download links are attached so the user can immediately open and download the file.
4. If no external tool is needed (e.g. general advisory concept, greeting, financial questions), provide a warm, direct, natural, conversational answer with clean formatting (no asterisks, no em dashes).
5. Output your plan as structured JSON with:
   - "conversational_intro": String explaining what you are doing in a friendly, conversational human tone (no asterisks or em dashes).
   - "capability_calls": Array of objects:
     - "capability_id": ID from registry
     - "parameters": Key-value dictionary matching capability parameters
     - "reason": Why this tool is being invoked
   - "direct_answer": String containing the direct response if no tool call is needed, formatted cleanly without asterisks or em dashes.`;
}

export function findCapability(id?: string): CapabilityDefinition | undefined {
  if (!id) return undefined;
  const exact = CAPABILITY_REGISTRY.find((c) => c.id.toLowerCase() === id.toLowerCase());
  if (exact) return exact;

  const lower = id.toLowerCase();
  if (lower.includes("sheet") || lower.includes("spreadsheet") || lower.includes("excel") || lower.includes("table")) {
    if (lower.includes("append") || lower.includes("row") || lower.includes("insert")) {
      return CAPABILITY_REGISTRY.find((c) => c.id === "composio_googlesheets_append_data");
    }
    return CAPABILITY_REGISTRY.find((c) => c.id === "composio_googlesheets_create_sheet");
  }
  if (lower.includes("doc") || lower.includes("drive") || lower.includes("file") || lower.includes("upload")) {
    return CAPABILITY_REGISTRY.find((c) => c.id === "composio_googledocs_create_document");
  }
  if (lower.includes("mail") || lower.includes("email") || lower.includes("message")) {
    return CAPABILITY_REGISTRY.find((c) => c.id === "composio_gmail_send_email");
  }
  if (lower.includes("calendar") || lower.includes("event") || lower.includes("schedule")) {
    return CAPABILITY_REGISTRY.find((c) => c.id === "composio_googlecalendar_list_events");
  }
  if (lower.includes("briefing") || lower.includes("dossier")) {
    return CAPABILITY_REGISTRY.find((c) => c.id === "agent_meeting_briefing");
  }
  if (lower.includes("compliance") || lower.includes("audit") || lower.includes("sec") || lower.includes("finra")) {
    return CAPABILITY_REGISTRY.find((c) => c.id === "agent_compliance_audit");
  }
  if (lower.includes("minute") || lower.includes("transcript")) {
    return CAPABILITY_REGISTRY.find((c) => c.id === "agent_meeting_intelligence");
  }

  return undefined;
}

export function getAppForConnector(connectorId?: string) {
  if (!connectorId) return undefined;
  return SUPPORTED_COMPOSIO_APPS.find((app) => app.id.toLowerCase() === connectorId.toLowerCase());
}
