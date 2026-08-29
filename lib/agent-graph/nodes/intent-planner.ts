import { AdvizaAgentStateType, CapabilityCall } from "../state";
import { invokeModelJSON, LLMMessage } from "@/lib/bedrock/client";
import { getCapabilityRegistryPrompt, findCapability } from "@/lib/capabilities/registry";

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
  const { message, messages, ambientContext } = state;

  const recentHistory = (messages || []).slice(-6);
  let ambientPrompt = "";
  if (ambientContext?.clientName) {
    ambientPrompt += `\n[Ambient Context: Active Client = "${ambientContext.clientName}" (${ambientContext.clientId || ""})]`;
  }
  if (ambientContext?.workflowId) {
    ambientPrompt += `\n[Ambient Context: Active Workflow ID = "${ambientContext.workflowId}"]`;
  }

  const llmMessages: LLMMessage[] = [
    ...recentHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user",
      content: `${message}${ambientPrompt}`,
    },
  ];

  const systemPrompt = getCapabilityRegistryPrompt();

  try {
    const decision = await invokeModelJSON<LLMDecision>(llmMessages, systemPrompt);

    const capabilityCalls: CapabilityCall[] = (decision.capability_calls || []).map((call) => {
      const cap = findCapability(call.capability_id);
      return {
        capability_id: call.capability_id,
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
        intent: decision.thought_process || "Execute advisory capabilities",
        targetCapabilities: capabilityCalls.map((c) => c.capability_id),
        reasoning: decision.thought_process || "Selected based on capability matching",
      },
    };
  } catch (err) {
    console.warn("[langgraph-planner] LLM planning failed, applying fallback resolver:", err);
    return fallbackResolver(message, ambientContext);
  }
}

function fallbackResolver(
  message: string,
  ambientContext?: any
): Partial<AdvizaAgentStateType> {
  const lower = message.toLowerCase();

  // 1. Google Sheets / Spreadsheets / Leads Intent
  if (
    lower.includes("sheet") ||
    lower.includes("spreadsheet") ||
    lower.includes("excel") ||
    lower.includes("csv") ||
    (lower.includes("lead") && (lower.includes("create") || lower.includes("add") || lower.includes("demo")))
  ) {
    const demoRows = [
      ["Lead Name", "Company / Affiliation", "Email Address", "Phone", "Status", "Estimated Net Worth"],
      ["Arthur Pendelton", "Pendelton Capital", "arthur@pendeltoncap.com", "+1 (555) 234-5678", "Qualified Prospect", "$4,200,000"],
      ["Sarah Jenkins", "Highland BioTech", "sarah.j@highlandbio.io", "+1 (555) 876-5432", "Discovery Scheduled", "$2,850,000"],
      ["Marcus Brody", "Apex Global Trading", "marcus.brody@apexgt.com", "+1 (555) 345-6789", "Proposal Review", "$6,100,000"],
      ["Elena Rostova", "Nordic Maritime Fund", "elena@nordicmf.com", "+1 (555) 901-2345", "Contacted", "$3,500,000"],
      ["David Chen", "Vanguard Horizons", "david.chen@vanguardh.com", "+1 (555) 456-7890", "Warm Referral", "$5,000,000"],
    ];

    return {
      conversationalIntro: "Creating a new Google Sheet with 5 demo lead records...",
      capabilityCalls: [
        {
          capability_id: "composio_googlesheets_create_sheet",
          parameters: {
            title: "Adviza Wealth - 5 Demo Leads Pipeline",
            rows: demoRows,
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

  // 2. Send / Write Email Intent
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

  // 2. Search / Fetch Email Intent
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

  // 2. Calendar Intent
  if (
    lower.includes("meet") ||
    lower.includes("calendar") ||
    lower.includes("schedule") ||
    lower.includes("appointment")
  ) {
    let timeMin = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    let timeMax: string | undefined = undefined;

    if (lower.includes("july")) {
      timeMin = "2026-07-01T00:00:00Z";
      timeMax = "2026-07-31T23:59:59Z";
    } else if (lower.includes("last week") || lower.includes("past week")) {
      const dMin = new Date();
      dMin.setDate(dMin.getDate() - 7);
      dMin.setHours(0, 0, 0, 0);
      timeMin = dMin.toISOString();
      const dMax = new Date();
      dMax.setHours(23, 59, 59, 999);
      timeMax = dMax.toISOString();
    } else if (lower.includes("this month")) {
      timeMin = "2026-08-01T00:00:00Z";
      timeMax = "2026-08-31T23:59:59Z";
    }

    return {
      conversationalIntro: "Checking your calendar schedule...",
      capabilityCalls: [
        {
          capability_id: "composio_googlecalendar_list_events",
          parameters: {
            timeMin,
            ...(timeMax ? { timeMax } : {}),
            maxResults: 25,
          },
          reason: "Retrieve advisory appointments",
          requiresHITL: false,
        },
      ],
      plan: {
        intent: "Query Google Calendar events",
        targetCapabilities: ["composio_googlecalendar_list_events"],
        reasoning: "Keyword matched calendar inquiry",
      },
    };
  }

  // 3. Briefing Intent
  if (lower.includes("brief") || lower.includes("prep") || lower.includes("dossier")) {
    return {
      conversationalIntro: "Compiling executive briefing dossier with portfolio metrics and talking points...",
      capabilityCalls: [
        {
          capability_id: "agent_meeting_briefing",
          parameters: {
            clientName: ambientContext?.clientName || "Sarah Jenkins",
            meetingType: "Comprehensive Strategy Review",
          },
          reason: "Generate Pre-Meeting Briefing Dossier",
          requiresHITL: false,
        },
      ],
      plan: {
        intent: "Generate client briefing dossier",
        targetCapabilities: ["agent_meeting_briefing"],
        reasoning: "Keyword matched briefing request",
      },
    };
  }

  // 4. Default Direct Response
  return {
    directAnswer: "I am ready to assist you with meeting prep, calendar lookups, email audits, compliance checks, or automated CRM workflows.",
    capabilityCalls: [],
    plan: {
      intent: "Direct general response",
      targetCapabilities: [],
      reasoning: "No external capability required",
    },
  };
}
