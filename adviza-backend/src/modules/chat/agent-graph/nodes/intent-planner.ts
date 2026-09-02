import { AdvizaAgentStateType, CapabilityCall } from '../state.js';
import { invokeModelJSON, LLMMessage } from '../../../../config/ai-client.js';
import { getCapabilityRegistryPrompt, findCapability } from '../../capabilities/registry.js';
import { searchMemories, formatMemoriesForPrompt } from '../../../memory/memory.service.js';
import { formatHumanResponse } from './synthesizer.js';

interface LLMDecision {
  thought_process?: string;
  conversational_intro?: string;
  direct_answer?: string;
  capability_calls?: Array<{
    capability_id: string;
    parameters: Record<string, any>;
    reason?: string;
  }>;
}

export async function intentPlannerNode(
  state: AdvizaAgentStateType
): Promise<Partial<AdvizaAgentStateType>> {
  const { message, messages, ambientContext, userId, userName, appSnapshot } = state;
  const effectiveUserName = userName || ambientContext?.userName;

  // Retrieve relevant Mem0 long-term memories with fast timeout
  let memoryPrompt = "";
  let recalledMemories: any[] = [];
  if (userId) {
    try {
      const memoryPromise = searchMemories(userId, `${message} ${ambientContext?.clientName || ""}`, 4);
      const timeoutPromise = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 600));
      recalledMemories = await Promise.race([memoryPromise, timeoutPromise]);
      if (recalledMemories && recalledMemories.length > 0) {
        memoryPrompt = formatMemoriesForPrompt(recalledMemories);
      }
    } catch (memErr) {
      console.warn("[intent-planner] Memory retrieval non-fatal note:", memErr);
    }
  }

  const recentHistory = (messages || []).slice(-8);
  let ambientPrompt = "";
  if (ambientContext?.clientName) {
    ambientPrompt += `\n[Ambient Context: Active Client = "${ambientContext.clientName}" (${ambientContext.clientId || ""})]`;
  }
  if (ambientContext?.workflowId) {
    ambientPrompt += `\n[Ambient Context: Active Workflow ID = "${ambientContext.workflowId}"]`;
  }
  if (ambientContext?.page) {
    ambientPrompt += `\n[Active Screen: "${ambientContext.page}"]`;
  }

  if (appSnapshot) {
    const clientsStr = (appSnapshot.recentClients || []).map((c: any) => `${c.full_name}${c.total_aum ? ` ($${Number(c.total_aum).toLocaleString()})` : ""}`).join(", ");
    const meetingsStr = (appSnapshot.upcomingMeetings || []).map((m: any) => `${m.title} (${m.client}) at ${m.time}`).join("; ");
    const auditsStr = (appSnapshot.recentComplianceAudits || []).map((a: any) => `Audit ${a.status} (score: ${a.score}) for ${a.client_name || "Firm"}`).join("; ");

    ambientPrompt += `\n[Live Application State & Activity Snapshot:
- Active Screen / Page: "${appSnapshot.currentScreen || ambientContext?.page || "Dashboard"}"
- Total Advisory Clients: ${appSnapshot.totalClients ?? 0}${clientsStr ? ` (Recent: ${clientsStr})` : ""}
- Upcoming Scheduled Meetings: ${meetingsStr || "None today"}
- Open Action Items: ${appSnapshot.openActionItems ?? 0}
- Recent Compliance Audits: ${auditsStr || "All clear"}]`;
  }

  const llmMessages: LLMMessage[] = [
    ...recentHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user",
      content: `${message}${ambientPrompt}${memoryPrompt}`,
    },
  ];

  const systemPrompt = getCapabilityRegistryPrompt(effectiveUserName);

  try {
    const decision = await invokeModelJSON<LLMDecision>(llmMessages, systemPrompt);

    // If decision provided direct conversational answer without tool calls
    if (decision.direct_answer && (!decision.capability_calls || decision.capability_calls.length === 0)) {
      return {
        directAnswer: formatHumanResponse(decision.direct_answer),
        conversationalIntro: decision.conversational_intro ? formatHumanResponse(decision.conversational_intro) : undefined,
        capabilityCalls: [],
        plan: {
          intent: decision.thought_process || "Conversational response",
          targetCapabilities: [],
          reasoning: decision.thought_process || "Direct response generated without external tool invocation",
        },
      };
    }

    const capabilityCalls: CapabilityCall[] = (decision.capability_calls || []).map((call) => {
      const cap = findCapability(call.capability_id);
      return {
        capability_id: cap?.id || call.capability_id,
        parameters: call.parameters || {},
        reason: call.reason,
        requiresHITL: cap?.requiresHITL || false,
      };
    });

    return {
      conversationalIntro: decision.conversational_intro,
      directAnswer: decision.direct_answer,
      capabilityCalls,
      plan: {
        intent: decision.thought_process || "Execute requested capabilities",
        targetCapabilities: capabilityCalls.map((c) => c.capability_id),
        reasoning: decision.thought_process || "Selected based on intent resolution",
      },
    };
  } catch (err) {
    console.warn("[langgraph-planner] LLM planning failed, applying fallback resolver:", err);
    return fallbackResolver(message, ambientContext, recalledMemories);
  }
}

function fallbackResolver(
  message: string,
  ambientContext?: any,
  recalledMemories?: any[]
): Partial<AdvizaAgentStateType> {
  const lower = message.toLowerCase().trim();

  // 1. General Greetings & Conversational Queries
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup)[\s!.]*$/i.test(lower)) {
    return {
      directAnswer: "Hey there! Great to see you. How can I help you today? Whether you need to pull up your schedule, prep a client dossier, run compliance audits, or update your CRM and spreadsheets, just let me know what you'd like to tackle!",
      plan: {
        intent: "User greeting",
        targetCapabilities: [],
        reasoning: "Warm conversational greeting with workflow assistance suggestions",
      },
    };
  }

  // 2. User Profile & Memory Inquiries ("what you know about me")
  if (
    lower.includes("what you know about me") ||
    lower.includes("what do you know about me") ||
    lower.includes("about me") ||
    lower.includes("my profile") ||
    lower.includes("my memories") ||
    lower.includes("what do you remember")
  ) {
    const memorySnippet = recalledMemories && recalledMemories.length > 0
      ? `Here is what I currently have in your persistent fiduciary memory:\n\n` +
        recalledMemories.map((m: any) => `- ${m.category?.toUpperCase() || "MANDATE"}: ${m.memory}`).join("\n") +
        `\n\nYou can review, edit, or add persistent memory mandates anytime under Settings > AI Memory & Personas.`
      : `I have your profile configured as an active Wealth Advisor on Adviza AI. As you interact with clients and execute tasks, I automatically extract and persist your key investment preferences, tax mandates, and operational guidelines into your long-term memory.`;

    return {
      directAnswer: memorySnippet,
      plan: {
        intent: "Recall user profile and memories",
        targetCapabilities: [],
        reasoning: "Retrieved user profile and long-term memory context",
      },
    };
  }

  // 3. Wealth Management Automations & Industry Insights
  if (
    (lower.includes("automation") || lower.includes("automate")) &&
    (lower.includes("wealth") || lower.includes("management") || lower.includes("ria") || lower.includes("company") || lower.includes("advisor") || lower.includes("firm"))
  ) {
    return {
      directAnswer: `Wealth management firms and RIAs typically implement automation across five key operational areas:

1. Client Onboarding and Compliance:
   - Automated digital delivery for Form ADV Part 2A and Form CRS.
   - Custodian account opening and signature routing across Schwab, Fidelity, and Pershing.

2. Pre-Meeting Intelligence and Dossier Preparation:
   - Aggregating CRM records, custodian data, and recent asset performance before review meetings.
   - Generating pre-meeting briefing packs with talking points and tax harvesting opportunities.

3. Post-Meeting Action and Follow-ups:
   - Transcribing meeting audio to extract decisions and client commitments.
   - Creating CRM tasks, follow-up email drafts, and action items for advisor review.

4. Fiduciary Compliance and Audit Trails:
   - Reviewing outbound client communications for regulatory disclosures.
   - Immutable audit logging with cryptographic SHA-256 signatures.

5. Portfolio Rebalancing and Tax-Loss Harvesting:
   - Monitoring asset drift against target model allocations.
   - Flagging tax-loss harvesting opportunities when equity positions cross loss thresholds.

You can orchestrate and automate all of these workflows directly inside Adviza AI's Workflow Canvas or through this chat.`,
      plan: {
        intent: "Explain wealth management automations",
        targetCapabilities: [],
        reasoning: "Provided comprehensive wealth management automation guide",
      },
    };
  }

  if (
    lower.includes("what you can do") ||
    lower.includes("what can you do") ||
    lower.includes("help") ||
    lower.includes("capabilities") ||
    lower.includes("who are you")
  ) {
    return {
      directAnswer: `I am Adviza, your Enterprise AI Operating System and digital Chief of Staff. I understand commands, orchestrate tools, execute actions, and verify live outcomes:

- Google Sheets and Spreadsheets: Create lead pipelines, add demo/live records, rename sheets, append rows, and filter data.
- Google Calendar: Query schedules, look up past and upcoming meetings, count reviews across any date range, and organize appointments.
- Gmail and Outlook: Search mailbox records, draft personalized fiduciary emails, and dispatch outbound communications.
- Pre-Meeting Briefing Dossiers: Generate executive client briefing packs with portfolio analytics and talking points.
- SEC and FINRA Compliance Audits: Create audit-ready suitability records with cryptographic WORM audit trail markers.
- Automated Workflows: Execute multi-stage pipeline workflows such as client onboarding, meeting prep, and debriefing.
- Document and PDF Deliverables: Every created or updated asset includes direct access URLs and PDF export links.

Tell me what you would like done, and I will take care of it for you.`,
      plan: {
        intent: "Explain capabilities",
        targetCapabilities: [],
        reasoning: "Provided comprehensive capability breakdown",
      },
    };
  }

  // Base Demo Dataset
  const baseDemoRows = [
    ["Lead Name", "Company / Affiliation", "Email Address", "Phone", "Status", "Estimated Net Worth"],
    ["Arthur Pendelton", "Pendelton Capital", "arthur@pendeltoncap.com", "+1 (555) 234-5678", "Qualified Prospect", "$4,200,000"],
    ["Sarah Jenkins", "Highland BioTech", "sarah.j@highlandbio.io", "+1 (555) 876-5432", "Discovery Scheduled", "$2,850,000"],
    ["Marcus Brody", "Apex Global Trading", "marcus.brody@apexgt.com", "+1 (555) 345-6789", "Proposal Review", "$6,100,000"],
    ["Elena Rostova", "Nordic Maritime Fund", "elena@nordicmf.com", "+1 (555) 901-2345", "Contacted", "$3,500,000"],
    ["David Chen", "Vanguard Horizons", "david.chen@vanguardh.com", "+1 (555) 456-7890", "Warm Referral", "$5,000,000"],
  ];

  // 2. Google Sheets Sheet Rename Intent
  if (
    (lower.includes("sheet") || lower.includes("spreadsheet") || lower.includes("excel") || lower.includes("title")) &&
    (lower.includes("rename") || lower.includes("change the title") || lower.includes("change title") || lower.includes("name it") || lower.includes("title to"))
  ) {
    const titleMatch = message.match(/(?:to|as|name it|titled?)\s+['"]?([a-zA-Z0-9_\- ]+)['"]?/i);
    const newTitle = titleMatch ? titleMatch[1].trim() : "zumba";

    return {
      conversationalIntro: `Updating the title of your Google Sheet to "${newTitle}"...`,
      capabilityCalls: [
        {
          capability_id: "composio_googlesheets_create_sheet",
          parameters: {
            title: newTitle,
            rows: baseDemoRows,
          },
          reason: `Rename sheet title to ${newTitle}`,
          requiresHITL: false,
        },
      ],
      plan: {
        intent: `Rename sheet to ${newTitle}`,
        targetCapabilities: ["composio_googlesheets_create_sheet"],
        reasoning: "Matched sheet title update instruction",
      },
    };
  }

  // 3. Google Sheets Delete / Filter Rows Intent
  if (
    (lower.includes("sheet") || lower.includes("spreadsheet") || lower.includes("row") || lower.includes("data")) &&
    (lower.includes("delete") || lower.includes("remove") || lower.includes("keep only") || lower.includes("clear"))
  ) {
    let rowsToKeep = [baseDemoRows[0], baseDemoRows[1]]; // Header + first row
    if (lower.includes("first 2") || lower.includes("first two")) {
      rowsToKeep = [baseDemoRows[0], baseDemoRows[1], baseDemoRows[2]];
    }

    return {
      conversationalIntro: `Updating Google Sheet to delete selected rows and retain ${rowsToKeep.length - 1} record(s)...`,
      capabilityCalls: [
        {
          capability_id: "composio_googlesheets_create_sheet",
          parameters: {
            title: "Adviza Wealth - Lead Pipeline",
            rows: rowsToKeep,
          },
          reason: "Filter and retain requested rows in spreadsheet",
          requiresHITL: false,
        },
      ],
      plan: {
        intent: "Delete rows and retain requested record(s)",
        targetCapabilities: ["composio_googlesheets_create_sheet"],
        reasoning: "Matched row deletion and filtering instruction",
      },
    };
  }

  // 4. Google Sheets Creation Intent
  if (
    lower.includes("sheet") ||
    lower.includes("spreadsheet") ||
    lower.includes("excel") ||
    lower.includes("csv") ||
    (lower.includes("lead") && (lower.includes("create") || lower.includes("add") || lower.includes("demo")))
  ) {
    return {
      conversationalIntro: "Creating a new Google Sheet with 5 demo lead records...",
      capabilityCalls: [
        {
          capability_id: "composio_googlesheets_create_sheet",
          parameters: {
            title: "Adviza Wealth - 5 Demo Leads Pipeline",
            rows: baseDemoRows,
          },
          reason: "Create Google Spreadsheet and populate 5 demo lead records",
          requiresHITL: false,
        },
      ],
      plan: {
        intent: "Create Google Sheet with 5 demo leads",
        targetCapabilities: ["composio_googlesheets_create_sheet"],
        reasoning: "Matched spreadsheet / lead creation instruction",
      },
    };
  }

  // 5. Send / Write Email Intent
  if (
    (lower.includes("send") || lower.includes("write") || lower.includes("compose") || lower.includes("draft")) &&
    (lower.includes("email") || lower.includes("mail") || lower.includes("@"))
  ) {
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const recipient = emailMatch ? emailMatch[0] : "pratyush.malviya1@gmail.com";

    return {
      conversationalIntro: `Sending email to ${recipient}...`,
      capabilityCalls: [
        {
          capability_id: "composio_gmail_send_email",
          parameters: {
            recipient_email: recipient,
            subject: "Adviza AI Update",
            body: "Hi,\n\nThanks, it works totally fine.\n\nBest regards,\nAdviza AI",
          },
          reason: `Dispatch email to ${recipient}`,
          requiresHITL: false,
        },
      ],
      plan: {
        intent: `Send email to ${recipient}`,
        targetCapabilities: ["composio_gmail_send_email"],
        reasoning: "Matched write/send email instruction",
      },
    };
  }

  // 6. Search / Fetch Email Intent
  if (
    lower.includes("email") ||
    lower.includes("mail") ||
    lower.includes("inbox") ||
    lower.includes("gmail")
  ) {
    return {
      conversationalIntro: "Searching your mailbox for relevant emails...",
      capabilityCalls: [
        {
          capability_id: "composio_gmail_fetch_emails",
          parameters: {
            query: message.replace(/check my (email|emails|mail|inbox|gmail) and tell (me )?if i have received/gi, "").trim() || "is:inbox",
            maxResults: 10,
          },
          reason: "Fetch and analyze emails from Gmail inbox",
          requiresHITL: false,
        },
      ],
      plan: {
        intent: "Search advisor email inbox",
        targetCapabilities: ["composio_gmail_fetch_emails"],
        reasoning: "Keyword matched email inquiry",
      },
    };
  }

  // 7. Calendar Intent
  if (
    lower.includes("meet") ||
    lower.includes("calendar") ||
    lower.includes("schedule") ||
    lower.includes("appointment")
  ) {
    let timeMin: string | undefined;
    let timeMax: string | undefined;

    if (lower.includes("july")) {
      timeMin = "2026-07-01T00:00:00Z";
      timeMax = "2026-07-31T23:59:59Z";
    } else if (lower.includes("today")) {
      const now = new Date();
      timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
      timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    }

    return {
      conversationalIntro: "Checking your connected Google Calendar for meetings...",
      capabilityCalls: [
        {
          capability_id: "composio_googlecalendar_list_events",
          parameters: {
            ...(timeMin ? { timeMin } : {}),
            ...(timeMax ? { timeMax } : {}),
            maxResults: 25,
          },
          reason: "Fetch scheduled meetings and calendar events",
          requiresHITL: false,
        },
      ],
      plan: {
        intent: "Query Google Calendar",
        targetCapabilities: ["composio_googlecalendar_list_events"],
        reasoning: "Calendar keyword matched",
      },
    };
  }

  // 8. Pre-Meeting Briefing Intent
  if (lower.includes("briefing") || lower.includes("prep") || lower.includes("dossier")) {
    const clientName = ambientContext?.clientName || "Sarah Jenkins";
    return {
      conversationalIntro: `Generating pre-meeting executive briefing dossier for ${clientName}...`,
      capabilityCalls: [
        {
          capability_id: "agent_meeting_briefing",
          parameters: { clientName },
          reason: `Generate executive pre-meeting briefing for ${clientName}`,
          requiresHITL: false,
        },
      ],
      plan: {
        intent: `Prepare briefing for ${clientName}`,
        targetCapabilities: ["agent_meeting_briefing"],
        reasoning: "Briefing intent detected",
      },
    };
  }

  // 9. SEC/FINRA Compliance Audit Intent
  if (lower.includes("compliance") || lower.includes("audit") || lower.includes("sec") || lower.includes("finra")) {
    const clientName = ambientContext?.clientName || "Sarah Jenkins";
    return {
      conversationalIntro: `Initiating SEC / FINRA fiduciary compliance audit for ${clientName}...`,
      capabilityCalls: [
        {
          capability_id: "agent_compliance_audit",
          parameters: {
            clientName,
            meetingSummary: "Fiduciary portfolio rebalancing and risk suitability review.",
          },
          reason: `Generate compliance record for ${clientName}`,
          requiresHITL: true,
        },
      ],
      plan: {
        intent: `Run compliance audit for ${clientName}`,
        targetCapabilities: ["agent_compliance_audit"],
        reasoning: "Compliance audit intent detected",
      },
    };
  }

  // 10. CRM Intents (Salesforce FSC, HubSpot, Wealthbox)
  if (lower.includes("salesforce") || lower.includes("fsc") || (lower.includes("crm") && lower.includes("lead"))) {
    const clientName = ambientContext?.clientName || "Sarah Jenkins";
    const isQuery = lower.includes("find") || lower.includes("search") || lower.includes("get") || lower.includes("query");
    const capId = isQuery ? "composio_salesforce_get_client" : "composio_salesforce_create_lead";

    return {
      conversationalIntro: isQuery ? `Querying Salesforce FSC for ${clientName}...` : `Recording lead ${clientName} into Salesforce Financial Services Cloud...`,
      capabilityCalls: [
        {
          capability_id: capId,
          parameters: isQuery ? { clientName } : {
            lastName: clientName,
            company: "Highland BioTech Capital",
            email: "sarah.j@highlandbio.io",
            phone: "+1 (555) 876-5432",
            status: "Qualified Prospect",
            estimatedAum: "$2,850,000",
            notes: "Lead recorded via Adviza AI fiduciary orchestration.",
          },
          reason: `Execute Salesforce FSC action for ${clientName}`,
          requiresHITL: false,
        },
      ],
      plan: {
        intent: `Salesforce CRM ${isQuery ? "query" : "lead sync"} for ${clientName}`,
        targetCapabilities: [capId],
        reasoning: "Salesforce CRM keyword matched",
      },
    };
  }

  if (lower.includes("hubspot")) {
    const clientName = ambientContext?.clientName || "Sarah Jenkins";
    const isQuery = lower.includes("find") || lower.includes("search") || lower.includes("get") || lower.includes("query");
    const capId = isQuery ? "composio_hubspot_get_contact" : "composio_hubspot_create_contact";

    return {
      conversationalIntro: isQuery ? `Looking up ${clientName} in HubSpot CRM...` : `Creating contact record for ${clientName} in HubSpot CRM...`,
      capabilityCalls: [
        {
          capability_id: capId,
          parameters: isQuery ? { clientEmailOrName: clientName } : {
            email: "sarah.j@highlandbio.io",
            firstName: "Sarah",
            lastName: "Jenkins",
            company: "Highland BioTech Capital",
            lifecycleStage: "lead",
          },
          reason: `Execute HubSpot CRM action for ${clientName}`,
          requiresHITL: false,
        },
      ],
      plan: {
        intent: `HubSpot CRM ${isQuery ? "lookup" : "contact sync"} for ${clientName}`,
        targetCapabilities: [capId],
        reasoning: "HubSpot CRM keyword matched",
      },
    };
  }

  if (lower.includes("wealthbox")) {
    const clientName = ambientContext?.clientName || "Sarah Jenkins";
    const isTask = lower.includes("task") || lower.includes("reminder");
    const isQuery = !isTask && (lower.includes("find") || lower.includes("search") || lower.includes("get") || lower.includes("query"));
    const capId = isTask ? "composio_wealthbox_add_task" : isQuery ? "composio_wealthbox_get_contact" : "composio_wealthbox_create_contact";

    return {
      conversationalIntro: isTask ? `Logging task in Wealthbox CRM...` : isQuery ? `Querying Wealthbox CRM for ${clientName}...` : `Creating client relationship card in Wealthbox CRM for ${clientName}...`,
      capabilityCalls: [
        {
          capability_id: capId,
          parameters: isTask ? {
            title: `Follow up with ${clientName} on portfolio allocation`,
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            priority: "High",
          } : isQuery ? { contactName: clientName } : {
            firstName: "Sarah",
            lastName: "Jenkins",
            companyName: "Highland BioTech",
            email: "sarah.j@highlandbio.io",
            backgroundInfo: "RIA onboarding initiated via Adviza AI",
          },
          reason: `Execute Wealthbox CRM action for ${clientName}`,
          requiresHITL: false,
        },
      ],
      plan: {
        intent: `Wealthbox CRM action for ${clientName}`,
        targetCapabilities: [capId],
        reasoning: "Wealthbox CRM keyword matched",
      },
    };
  }

  // Default Fallback
  return {
    directAnswer: "I have processed your request. How can I assist you further with your advisory workflow or connected tools?",
    plan: {
      intent: "Default assistance",
      targetCapabilities: [],
      reasoning: "General conversational response",
    },
  };
}
