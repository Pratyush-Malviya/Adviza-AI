export interface ComposioConnection {
  id: string;
  appName: string;
  status: "CONNECTED" | "INITIATED" | "FAILED" | "EXPIRED" | "ACTIVE";
  userUuid: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
}

export interface ComposioToolkit {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo?: string;
  categories: string[];
  toolsCount: number;
  isPopular?: boolean;
  authSchemes?: string[];
  noAuth?: boolean;
}

export interface ComposioToolkitsResponse {
  toolkits: ComposioToolkit[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface SupportedApp {
  id: string;
  name: string;
  description: string;
  category: "calendar" | "email" | "communication" | "crm" | "storage" | "productivity" | "finance";
  iconName: string;
  actions: string[];
  isPopular?: boolean;
}

export const SUPPORTED_COMPOSIO_APPS: SupportedApp[] = [
  // Calendar & Scheduling
  {
    id: "googlecalendar",
    name: "Google Calendar",
    description: "Auto-sync scheduled client reviews and meeting agendas into Adviza",
    category: "calendar",
    iconName: "Calendar",
    actions: ["GOOGLECALENDAR_FIND_EVENTS", "GOOGLECALENDAR_CREATE_EVENT"],
    isPopular: true,
  },
  {
    id: "outlook_calendar",
    name: "Microsoft Outlook Calendar",
    description: "Synchronize executive client calendar and appointment slots from Microsoft 365",
    category: "calendar",
    iconName: "Calendar",
    actions: ["OUTLOOK_CALENDAR_GET_EVENTS", "OUTLOOK_CALENDAR_CREATE_EVENT"],
    isPopular: true,
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Automatically import newly booked client consultation meetings and intake forms",
    category: "calendar",
    iconName: "Calendar",
    actions: ["CALENDLY_GET_SCHEDULED_EVENTS", "CALENDLY_GET_EVENT"],
  },
  {
    id: "calcom",
    name: "Cal.com",
    description: "Open-source appointment scheduling integration for advisor discovery calls",
    category: "calendar",
    iconName: "Calendar",
    actions: ["CALCOM_GET_BOOKINGS"],
  },

  // Email & Outreach
  {
    id: "gmail",
    name: "Gmail / Google Workspace",
    description: "Send AI-crafted suitability notes and follow-up emails from your advisor inbox",
    category: "email",
    iconName: "Mail",
    actions: ["GMAIL_SEND_MESSAGE", "GMAIL_CREATE_DRAFT"],
    isPopular: true,
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Dispatch compliance-approved client correspondence directly through Office 365",
    category: "email",
    iconName: "Mail",
    actions: ["OUTLOOK_SEND_EMAIL", "OUTLOOK_CREATE_DRAFT"],
    isPopular: true,
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Enterprise transactional email delivery and client notification gateway",
    category: "email",
    iconName: "Mail",
    actions: ["SENDGRID_SEND_EMAIL"],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync client segment lists for quarterly market commentary newsletters",
    category: "email",
    iconName: "Mail",
    actions: ["MAILCHIMP_ADD_MEMBER", "MAILCHIMP_GET_CAMPAIGNS"],
  },

  // CRM & Wealth Management
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Bidirectionally sync client risk profiles, meeting notes, and action items",
    category: "crm",
    iconName: "Database",
    actions: ["HUBSPOT_CREATE_CONTACT", "HUBSPOT_UPDATE_COMPANY"],
    isPopular: true,
  },
  {
    id: "salesforce",
    name: "Salesforce Financial Services",
    description: "Push audit-ready compliance records and meeting summaries into Financial Services Cloud",
    category: "crm",
    iconName: "Cloud",
    actions: ["SALESFORCE_CREATE_RECORD", "SALESFORCE_UPDATE_RECORD"],
    isPopular: true,
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "Export high-net-worth client lead notes and follow-up deliverables to Zoho",
    category: "crm",
    iconName: "Database",
    actions: ["ZOHO_CREATE_CONTACT", "ZOHO_UPDATE_RECORD"],
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Track prospect pipeline stages from initial briefing to onboarding",
    category: "crm",
    iconName: "Database",
    actions: ["PIPEDRIVE_CREATE_DEAL", "PIPEDRIVE_ADD_NOTE"],
  },
  {
    id: "wealthbox",
    name: "Wealthbox CRM",
    description: "Specialized RIA CRM integration for client relationship management & account notes",
    category: "crm",
    iconName: "Database",
    actions: ["WEALTHBOX_CREATE_CONTACT", "WEALTHBOX_ADD_TASK"],
    isPopular: true,
  },
  {
    id: "redtail",
    name: "Redtail Technology",
    description: "Leading financial advisor CRM for client records, notes, and activity scheduling",
    category: "crm",
    iconName: "Database",
    actions: ["REDTAIL_CREATE_CONTACT", "REDTAIL_ADD_NOTE"],
  },

  // Communication & Alerts
  {
    id: "slack",
    name: "Slack",
    description: "Receive instant compliance flags, meeting debriefs, and urgent task alerts",
    category: "communication",
    iconName: "MessageSquare",
    actions: ["SLACK_SEND_MESSAGE", "SLACK_SEND_CHANNEL_MESSAGE"],
    isPopular: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Post meeting intelligence briefings and suitability summaries into team channels",
    category: "communication",
    iconName: "MessageSquare",
    actions: ["TEAMS_SEND_MESSAGE"],
    isPopular: true,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Send operational bot notifications and system health webhooks",
    category: "communication",
    iconName: "MessageSquare",
    actions: ["DISCORD_SEND_MESSAGE"],
  },
  {
    id: "twilio",
    name: "Twilio SMS",
    description: "Send automated SMS appointment reminders and urgent advisory alerts to clients",
    category: "communication",
    iconName: "MessageSquare",
    actions: ["TWILIO_SEND_SMS"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Dispatch client meeting confirmations and encrypted advisory updates",
    category: "communication",
    iconName: "MessageSquare",
    actions: ["WHATSAPP_SEND_MESSAGE"],
  },

  // Document & Storage
  {
    id: "googledrive",
    name: "Google Drive",
    description: "Archive generated meeting transcripts, PDFs, and client suitability dossiers",
    category: "storage",
    iconName: "Folder",
    actions: ["GOOGLEDRIVE_UPLOAD_FILE", "GOOGLEDRIVE_SEARCH_FILES"],
    isPopular: true,
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    description: "Store client wealth planning documentation in enterprise OneDrive folders",
    category: "storage",
    iconName: "Folder",
    actions: ["ONEDRIVE_UPLOAD_FILE", "ONEDRIVE_GET_ITEM"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Backup compliance audit archives and signed advisory agreements",
    category: "storage",
    iconName: "Folder",
    actions: ["DROPBOX_UPLOAD_FILE"],
  },
  {
    id: "box",
    name: "Box",
    description: "FINRA / SEC compliant secure cloud content management for wealth firms",
    category: "storage",
    iconName: "Folder",
    actions: ["BOX_UPLOAD_FILE"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync client wiki dossiers, investment policy statements, and team meeting logs",
    category: "storage",
    iconName: "FileText",
    actions: ["NOTION_CREATE_PAGE", "NOTION_UPDATE_DATABASE"],
    isPopular: true,
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "Trigger advisory agreement e-signatures and track document execution status",
    category: "storage",
    iconName: "FileText",
    actions: ["DOCUSIGN_SEND_ENVELOPE", "DOCUSIGN_GET_ENVELOPE"],
    isPopular: true,
  },

  // Productivity & Tasks
  {
    id: "linear",
    name: "Linear",
    description: "Create and track advisory operations tickets and technical follow-ups",
    category: "productivity",
    iconName: "CheckSquare",
    actions: ["LINEAR_CREATE_ISSUE"],
  },
  {
    id: "asana",
    name: "Asana",
    description: "Assign client onboarding action items and compliance checklist tasks",
    category: "productivity",
    iconName: "CheckSquare",
    actions: ["ASANA_CREATE_TASK", "ASANA_GET_PROJECT"],
  },
  {
    id: "monday",
    name: "Monday.com",
    description: "Manage wealth advisory workflows, quarterly client reviews, and team boards",
    category: "productivity",
    iconName: "CheckSquare",
    actions: ["MONDAY_CREATE_ITEM"],
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "Track wealth planning deliverables, milestones, and client task dependencies",
    category: "productivity",
    iconName: "CheckSquare",
    actions: ["CLICKUP_CREATE_TASK"],
  },
  {
    id: "jira",
    name: "Jira Software",
    description: "Log compliance audit findings and enterprise wealth management workflows",
    category: "productivity",
    iconName: "CheckSquare",
    actions: ["JIRA_CREATE_ISSUE"],
  },
  {
    id: "trello",
    name: "Trello",
    description: "Visualize client onboarding pipeline cards and quarterly planning tasks",
    category: "productivity",
    iconName: "CheckSquare",
    actions: ["TRELLO_CREATE_CARD"],
  },
  {
    id: "googlesheets",
    name: "Google Sheets",
    description: "Export portfolio allocation tables and client meeting metrics to spreadsheets",
    category: "productivity",
    iconName: "FileSpreadsheet",
    actions: ["GOOGLESHEETS_APPEND_ROW", "GOOGLESHEETS_READ_SHEET"],
    isPopular: true,
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Relational database synchronization for client portfolios, tags, and meetings",
    category: "productivity",
    iconName: "Database",
    actions: ["AIRTABLE_CREATE_RECORD", "AIRTABLE_LIST_RECORDS"],
    isPopular: true,
  },

  // Finance & Accounting
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync advisory retainer invoicing, advisory fee tracking, and billing records",
    category: "finance",
    iconName: "CreditCard",
    actions: ["QUICKBOOKS_CREATE_INVOICE", "QUICKBOOKS_GET_PAYMENT"],
    isPopular: true,
  },
  {
    id: "xero",
    name: "Xero Accounting",
    description: "Manage wealth management advisory billing, expenses, and client accounts",
    category: "finance",
    iconName: "CreditCard",
    actions: ["XERO_CREATE_INVOICE"],
  },
  {
    id: "stripe",
    name: "Stripe Invoicing",
    description: "Accept retainer payments and manage wealth advisory recurring subscriptions",
    category: "finance",
    iconName: "CreditCard",
    actions: ["STRIPE_CREATE_CUSTOMER", "STRIPE_CREATE_INVOICE"],
    isPopular: true,
  },
  {
    id: "plaid",
    name: "Plaid",
    description: "Connect client bank accounts and retrieve real-time account balances",
    category: "finance",
    iconName: "CreditCard",
    actions: ["PLAID_GET_BALANCE", "PLAID_GET_TRANSACTIONS"],
  },
];

const COMPOSIO_V3_BASE = "https://backend.composio.dev/api/v3";
const COMPOSIO_V31_BASE = "https://backend.composio.dev/api/v3.1";

function getApiKey(): string | null {
  return process.env.COMPOSIO_API_KEY && process.env.COMPOSIO_API_KEY !== "your_composio_api_key"
    ? process.env.COMPOSIO_API_KEY
    : null;
}

/**
 * Initiate an OAuth connection for an app via Composio v3 link session.
 * Returns the hosted redirect URL for the user to authorize.
 */
export async function initiateComposioConnection(
  userId: string,
  appName: string,
  redirectUri: string
): Promise<{ redirectUrl: string; connectionId?: string }> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      redirectUrl: `${redirectUri}?integration_connected=${appName}&mock=true`,
      connectionId: `mock_conn_${appName}_${Date.now()}`,
    };
  }

  try {
    // 1. Resolve or Create auth config ID for the app
    const authConfigsRes = await fetch(`${COMPOSIO_V3_BASE}/auth_configs`, {
      headers: { "x-api-key": apiKey },
    });

    let authConfigId: string | null = null;
    if (authConfigsRes.ok) {
      const authConfigsData = await authConfigsRes.json();
      const match = authConfigsData.items?.find(
        (i: any) => i.toolkit?.slug?.toLowerCase() === appName.toLowerCase()
      );
      if (match) {
        authConfigId = match.id;
      }
    }

    if (!authConfigId) {
      // Create Composio-managed auth_config for this toolkit
      const createRes = await fetch(`${COMPOSIO_V3_BASE}/auth_configs`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolkit: { slug: appName.toLowerCase() },
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        authConfigId = createData.auth_config?.id || createData.id;
      }
    }

    if (!authConfigId) {
      throw new Error(`Could not generate auth configuration for toolkit ${appName}`);
    }

    // 2. Call link endpoint with resolved auth_config_id
    const response = await fetch(`${COMPOSIO_V3_BASE}/connected_accounts/link`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        auth_config_id: authConfigId,
        callback_url: redirectUri,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || `Failed to initiate link (${response.status})`);
    }

    return {
      redirectUrl: data.redirect_url,
      connectionId: data.connected_account_id,
    };
  } catch (error: any) {
    console.warn(`Error initiating connection for ${appName}, falling back to sandbox connection:`, error);
    return {
      redirectUrl: `${redirectUri}?integration_connected=${appName}&mock=true`,
      connectionId: `mock_conn_${appName}_${Date.now()}`,
    };
  }
}

/**
 * Fetch all connected accounts for a specific user ID.
 */
export async function getComposioConnections(userId?: string): Promise<ComposioConnection[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return [];
  }

  try {
    const url = `${COMPOSIO_V3_BASE}/connected_accounts`;
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`Failed to fetch connections (${response.status})`);
      return [];
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    return items.map((item: any) => ({
      id: item.id,
      appName: item.toolkit?.slug || item.word_id?.split("_")[0] || "tool",
      status: (item.status === "ACTIVE" ? "CONNECTED" : item.status) as any,
      userUuid: item.user_id || userId || "default_user",
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
      email: item.data?.email || item.alias || undefined,
    }));
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
}

/**
 * Execute a tool action through the integration gateway using Composio proxy execution.
 */
export async function executeComposioAction(
  userId: string,
  actionName: string,
  params: Record<string, any>
): Promise<any> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: true,
      mock: true,
      message: `Executed action ${actionName} in mock mode`,
      data: params,
    };
  }

  try {
    // 1. Resolve target app
    let targetApp = "googlecalendar";
    if (actionName.toLowerCase().includes("sheet") || actionName.toLowerCase().includes("googlesheets")) {
      targetApp = "googlesheets";
    } else if (actionName.toLowerCase().includes("gmail") || actionName.toLowerCase().includes("email") || actionName.toLowerCase().includes("mail")) {
      targetApp = "gmail";
    } else if (actionName.toLowerCase().includes("notion")) {
      targetApp = "notion";
    } else if (actionName.toLowerCase().includes("salesforce")) {
      targetApp = "salesforce";
    } else if (actionName.toLowerCase().includes("wealthbox")) {
      targetApp = "wealthbox";
    } else if (actionName.toLowerCase().includes("slack")) {
      targetApp = "slack";
    } else if (actionName.toLowerCase().includes("outlook")) {
      targetApp = "outlook_calendar";
    }

    // 2. Locate active connection for the target app
    const connections = await getComposioConnections(userId);
    const activeConnection = connections.find(
      (c) =>
        c.status === "CONNECTED" &&
        (c.appName.toLowerCase().includes(targetApp) || targetApp.includes(c.appName.toLowerCase()))
    );

    if (!activeConnection) {
      throw new Error(`No active connected account found for ${targetApp.toUpperCase()}. Please connect the account in Connectors.`);
    }

    // 3. Map capability to v3 tool slug
    let toolSlug = "GOOGLECALENDAR_EVENTS_LIST";
    let toolArgs: Record<string, any> = {};

    if (targetApp === "googlesheets") {
      toolSlug = "GOOGLESHEETS_CREATE_GOOGLE_SHEET1";
      toolArgs = {
        title: params.title || "Lead Management Demo - Adviza AI",
      };
    } else if (targetApp === "gmail") {
      if (
        actionName.toLowerCase().includes("send") ||
        actionName.toLowerCase().includes("draft") ||
        actionName.toLowerCase().includes("dispatch") ||
        params.recipient_email ||
        params.recipientEmail ||
        params.to
      ) {
        toolSlug = "GMAIL_SEND_EMAIL";
        toolArgs = {
          recipient_email: params.recipient_email || params.recipientEmail || params.to || "pratyush.malviya1@gmail.com",
          subject: params.subject || "Adviza AI Update",
          body: params.body || params.content || params.message || "Thank you. Everything is operating smoothly.",
        };
      } else {
        toolSlug = "GMAIL_FETCH_EMAILS";
        toolArgs = {
          query: params.query || "is:inbox",
          max_results: params.maxResults || 10,
        };
      }
    } else if (targetApp === "slack") {
      toolSlug = "SLACK_POST_MESSAGE";
      toolArgs = {
        channel: params.channel || "general",
        text: params.text || params.message || "Message from Adviza AI",
      };
    } else if (targetApp === "notion") {
      toolSlug = "NOTION_CREATE_PAGE";
      toolArgs = params;
    } else {
      toolArgs = {
        calendarId: "primary",
        singleEvents: true,
        orderBy: "startTime",
        maxResults: params.maxResults || 25,
      };

      if (params.timeMin) toolArgs.timeMin = params.timeMin;
      if (params.timeMax) toolArgs.timeMax = params.timeMax;
      if (params.q) toolArgs.q = params.q;
    }

    // 4. Execute via Composio v3 tool execution endpoint
    const response = await fetch(`${COMPOSIO_V3_BASE}/tools/execute/${toolSlug}`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: activeConnection.userUuid || userId,
        connected_account_id: activeConnection.id,
        arguments: toolArgs,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.message || `Failed to execute ${toolSlug}`);
    }

    const items = result.data?.items || result.data?.messages || result.items || [];
    const email = activeConnection.email || result.data?.summary || "Connected Account";

    return {
      success: true,
      app: targetApp,
      accountEmail: email,
      events: targetApp === "googlecalendar" ? items : [],
      messages: targetApp === "gmail" ? items : [],
      totalCount: items.length,
      raw: result.data,
    };
  } catch (error: any) {
    console.error(`Error executing action ${actionName}:`, error);
    throw error;
  }
}

/**
 * Fetch toolkits dynamically from Composio v3 API with pagination, search, and category filtering.
 * Falls back to curated list if API key is not configured or upstream fails.
 */
export async function fetchComposioToolkits(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<ComposioToolkitsResponse> {
  const apiKey = getApiKey();
  const page = options.page || 1;
  const limit = options.limit || 48;
  const search = options.search?.trim() || "";
  const category = options.category?.trim() || "";

  if (!apiKey) {
    // Return curated fallback
    const filtered = SUPPORTED_COMPOSIO_APPS.filter((app) => {
      const matchSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        !category || category === "all" || app.category.toLowerCase() === category.toLowerCase();
      return matchSearch && matchCat;
    });

    return {
      toolkits: filtered.map((a) => ({
        id: a.id,
        slug: a.id,
        name: a.name,
        description: a.description,
        categories: [a.category],
        toolsCount: a.actions.length,
        isPopular: a.isPopular,
      })),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      currentPage: 1,
    };
  }

  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (category && category !== "all") params.set("category", category);

    const res = await fetch(`${COMPOSIO_V3_BASE}/toolkits?${params.toString()}`, {
      headers: { "x-api-key": apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Composio toolkits returned status ${res.status}`);
    }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const popularSlugs = new Set(
      SUPPORTED_COMPOSIO_APPS.filter((a) => a.isPopular).map((a) => a.id.toLowerCase())
    );

    const toolkits: ComposioToolkit[] = items.map((item: any) => {
      const categories: string[] = Array.isArray(item.meta?.categories)
        ? item.meta.categories.map((c: any) => (typeof c === "string" ? c : c?.name || "other"))
        : [];

      return {
        id: item.slug || item.name?.toLowerCase().replace(/\s+/g, "_"),
        slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, "_"),
        name: item.name,
        description: item.meta?.description || `Connect ${item.name} actions and triggers.`,
        logo: item.meta?.logo,
        categories: categories.length > 0 ? categories : ["tools"],
        toolsCount: item.meta?.tools_count || 0,
        isPopular: popularSlugs.has((item.slug || "").toLowerCase()),
        authSchemes: item.auth_schemes,
        noAuth: item.no_auth,
      };
    });

    return {
      toolkits,
      totalItems: data.total_items || data.total || items.length,
      totalPages: data.total_pages || Math.ceil((data.total_items || items.length) / limit),
      currentPage: data.current_page || page,
    };
  } catch (err) {
    console.error("Failed to fetch toolkits from Composio API, falling back to curated list:", err);
    return {
      toolkits: SUPPORTED_COMPOSIO_APPS.map((a) => ({
        id: a.id,
        slug: a.id,
        name: a.name,
        description: a.description,
        categories: [a.category],
        toolsCount: a.actions.length,
        isPopular: a.isPopular,
      })),
      totalItems: SUPPORTED_COMPOSIO_APPS.length,
      totalPages: 1,
      currentPage: 1,
    };
  }
}
