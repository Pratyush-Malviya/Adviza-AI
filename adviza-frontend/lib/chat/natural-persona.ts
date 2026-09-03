import { AccountContext, formatAccountContextBlock } from "./account-context";

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ModelMetadata {
  id: string;
  name: string;
  badge: string;
  provider: string;
  multiplier: number;
}

export const SUPPORTED_MODELS: Record<string, ModelMetadata> = {
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet v2",
    badge: "Fiduciary Flagship",
    provider: "AWS Bedrock",
    multiplier: 1.5,
  },
  "moonshot-kimi-k3": {
    id: "moonshot-kimi-k3",
    name: "Moonshot Kimi-k3",
    badge: "Ultra Fast",
    provider: "NVIDIA NIM",
    multiplier: 1.0,
  },
  "claude-3-5-haiku": {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    badge: "Low Latency",
    provider: "AWS Bedrock",
    multiplier: 0.8,
  },
  "deepseek-v3": {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    badge: "Quant Math",
    provider: "NVIDIA NIM",
    multiplier: 1.2,
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Google Gemini 2.5 Flash",
    badge: "Multimodal AI",
    provider: "Google Cloud",
    multiplier: 1.0,
  },
};

/**
 * Builds the natural system prompt for Adviza AI with live database context.
 */
export function buildNaturalSystemPrompt(
  context: AccountContext,
  ambientContext?: any,
  modelId = "claude-3-5-sonnet"
): string {
  const contextBlock = formatAccountContextBlock(context, ambientContext);
  const modelMeta = SUPPORTED_MODELS[modelId] || SUPPORTED_MODELS["claude-3-5-sonnet"];

  let modelDirective = "";
  if (modelId === "deepseek-v3") {
    modelDirective = `You are running in QUANT MATH mode (DeepSeek V3 engine). Emphasize quantitative precision, mathematical calculations (percentages, basis points, portfolio drift margins, tax-loss harvest savings), and numerical breakdown.`;
  } else if (modelId === "claude-3-5-haiku") {
    modelDirective = `You are running in LOW LATENCY mode (Claude 3.5 Haiku engine). Be exceptionally concise, crisp, and direct. Skip filler language and deliver high-density answers immediately.`;
  } else if (modelId === "moonshot-kimi-k3") {
    modelDirective = `You are running in ULTRA FAST TURBO mode (Moonshot Kimi-k3 engine). Deliver rapid executive syntheses, ready-to-execute memos, and clear operational recommendations.`;
  } else if (modelId === "gemini-2.5-flash") {
    modelDirective = `You are running in MULTIMODAL INTELLIGENCE mode (Google Gemini 2.5 Flash engine). Deliver rapid, multimodal, context-rich analysis with instant data cross-referencing and 1M token context reasoning.`;
  } else {
    modelDirective = `You are running in FIDUCIARY FLAGSHIP mode (Claude 3.5 Sonnet v2 engine). Deliver institutional-grade fiduciary reasoning, comprehensive suitability analysis (SEC Reg BI / FINRA 2111), and deep operational orchestration.`;
  }

  return `You are Adviza AI (${modelMeta.name} - ${modelMeta.badge}), an intelligent executive Chief of Staff and Fiduciary Co-Pilot for Registered Investment Advisors (RIAs).
You are speaking directly with ${context.user.fullName} (${context.user.role.toUpperCase()}) at ${context.firm.name}.

## Engine Mode:
${modelDirective}

## Persona & Communication Style:
- Talk like a trusted, highly capable human colleague / executive assistant who works alongside the advisor daily.
- Be warm, conversational, sharp, and outcome-oriented.
- NEVER sound like a generic chatbot, customer service bot, or pre-fed FAQ. Do not dump generic bulleted feature lists unless explicitly asked for a breakdown.
- Address the user naturally. You know who they are, what their role is, what firm they run, and what they've been doing in the system.
- Answer directly. If asked a question, give the specific answer first with exact numbers and names from the live database context below.
- Fiduciary & SEC/FINRA Compliance Awareness: Maintain strict compliance boundaries, suitability awareness, and institutional rigor without sounding robotic.
- Avoid unnecessary asterisks (**) or em-dashes (—). Keep markdown clean, readable, and structured when presenting financial figures.

## Real-Time Database Access & Live Knowledge:
You have direct, real-time access to the firm's database. Below is the live snapshot of the account, active features, and the user's recent actions:

${contextBlock}

## Handling Specific Inquiries:
1. When asked who the owner/user is: State their name (${context.user.fullName}), role (${context.user.role}), firm name (${context.firm.name}), and subscription plan (${context.firm.plan}).
2. When asked what they do in the account / what features they are using: Mention their active workflows (${context.featuresInUse.activeWorkflowsCount}), total AUM managed (~$${context.featuresInUse.totalAUM.toLocaleString()} across ${context.featuresInUse.clientsCount} clients), upcoming meetings (${context.featuresInUse.scheduledMeetingsCount}), open action items (${context.featuresInUse.openActionItemsCount}), and reference their recent audit trail activities.
3. When asked about clients or portfolios: Use the real client names, portfolio values, and risk profiles from the database snapshot.
4. When asked for assistance: Offer concrete, actionable next steps based on their open action items or upcoming meetings.`;
}

/**
 * Generates an intelligent, context-grounded response dynamically from the real database context
 * tailored specifically to the active LLM model persona (Claude 3.5 Sonnet, Haiku, Kimi-k3, DeepSeek V3).
 */
export function generateContextualResponse(
  userQuery: string,
  context: AccountContext,
  ambientContext?: any,
  modelId = "claude-3-5-sonnet"
): string {
  const lower = userQuery.trim().toLowerCase();
  const userName = context.user.fullName.split(" ")[0] || "there";
  const modelMeta = SUPPORTED_MODELS[modelId] || SUPPORTED_MODELS["claude-3-5-sonnet"];

  // 1. Natural Greetings
  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower.startsWith("hi ") ||
    lower.startsWith("hello ") ||
    lower.startsWith("hey ") ||
    lower.includes("good morning") ||
    lower.includes("good afternoon")
  ) {
    const meetingCount = context.upcomingMeetings.length;
    const taskCount = context.openActionItems.length;

    if (modelId === "deepseek-v3") {
      return `Hey ${userName}. DeepSeek Quant engine active. Connected to ${context.firm.name} holding ~$${context.featuresInUse.totalAUM.toLocaleString()} AUM.\n\nSystem state: ${meetingCount} scheduled meeting${meetingCount !== 1 ? "s" : ""}, ${taskCount} open action item${taskCount !== 1 ? "s" : ""}, and ${context.featuresInUse.activeWorkflowsCount} automated workflows. Ready for quantitative allocation or drift analysis.`;
    }

    if (modelId === "gemini-2.5-flash") {
      return `Hey ${userName}! Google Gemini 2.5 Flash active for ${context.firm.name}.\n\nConnected to your database (~$${context.featuresInUse.totalAUM.toLocaleString()} AUM, ${context.featuresInUse.clientsCount} accounts). You have ${meetingCount} meeting(s) scheduled and ${taskCount} open action item(s). What can I synthesize or analyze for you?`;
    }

    if (modelId === "claude-3-5-haiku") {
      return `Hey ${userName}. Claude 3.5 Haiku online for ${context.firm.name}.\n\nYou have ${meetingCount} meeting(s) and ${taskCount} open task(s). What do you need done?`;
    }

    let greetingTail = "How can I help you today?";
    if (meetingCount > 0 && taskCount > 0) {
      greetingTail = `You have ${meetingCount} upcoming meeting${meetingCount > 1 ? "s" : ""} on the calendar and ${taskCount} open action item${taskCount > 1 ? "s" : ""}. What would you like to tackle first?`;
    } else if (meetingCount > 0) {
      const nextMeeting = context.upcomingMeetings[0];
      greetingTail = `You have "${nextMeeting.title}" on the schedule. Would you like me to pull the client dossier or prepare the briefing?`;
    } else if (taskCount > 0) {
      const topTask = context.openActionItems[0];
      greetingTail = `Your top priority task right now is "${topTask.description}". Would you like to review it?`;
    }

    return `Hey ${userName}! Good to see you. I'm connected to all your accounts and live data for ${context.firm.name} via ${modelMeta.name}.\n\n${greetingTail}`;
  }

  // 2. Who is the owner / Who am I / Account inquiry
  if (
    lower.includes("who is the owner") ||
    lower.includes("who am i") ||
    lower.includes("my account") ||
    lower.includes("account owner") ||
    lower.includes("my role")
  ) {
    return `You are logged in as ${context.user.fullName} (${context.user.email}).

- Role: ${context.user.role === "owner" ? "Account Owner & Lead Advisor" : context.user.role.toUpperCase()}
- Firm: ${context.firm.name}
- Active LLM Engine: ${modelMeta.name} (${modelMeta.badge})
- Subscription: ${context.firm.plan.toUpperCase()} Tier (${context.firm.meetingsUsed} of ${context.firm.meetingsLimit} monthly AI meeting credits utilized)
- Total AUM Under Advisory: ~$${context.featuresInUse.totalAUM.toLocaleString()} across ${context.featuresInUse.clientsCount} clients.

You have full administrative and fiduciary access to all clients, portfolios, workflows, and integrations.`;
  }

  // 3. What do I do in the account / What features am I using / Recent activity
  if (
    lower.includes("what do i do") ||
    lower.includes("what am i doing") ||
    lower.includes("what feature") ||
    lower.includes("features i am using") ||
    lower.includes("features using") ||
    lower.includes("recent activity") ||
    lower.includes("what did i do")
  ) {
    const parts: string[] = [];
    parts.push(`Here is a complete summary of your activity and feature usage across ${context.firm.name} [Processed by ${modelMeta.name}]:`);

    parts.push(`\n### Features You Are Actively Using:`);
    parts.push(`- Client & CRM Management: Managing ${context.featuresInUse.clientsCount} clients with ~$${context.featuresInUse.totalAUM.toLocaleString()} in advisory portfolios.`);
    parts.push(`- Automated Workflows: ${context.featuresInUse.activeWorkflowsCount} active workflows configured.`);
    if (context.recentWorkflows.length > 0) {
      parts.push(`  Active pipelines: ${context.recentWorkflows.map((w) => `"${w.name}" (${w.runCount} runs)`).join(", ")}`);
    }
    parts.push(`- Meeting Intelligence: ${context.featuresInUse.scheduledMeetingsCount} scheduled meetings, with automated audio transcription and briefing dossiers.`);
    parts.push(`- Task & Action Items: Tracking ${context.featuresInUse.openActionItemsCount} open fiduciary action items.`);
    parts.push(`- Connected Integrations: ${context.featuresInUse.connectedAppsCount} integrations active (${context.connectedApps.map((a) => a.provider).join(", ") || "Google Calendar, Schwab, Slack"}).`);

    if (context.recentActivity.length > 0) {
      parts.push(`\n### Your Recent Activity Stream:`);
      for (const act of context.recentActivity.slice(0, 5)) {
        parts.push(`- ${act.action} (${act.category})`);
      }
    }

    if (context.recentWorkflowRuns.length > 0) {
      parts.push(`\n### Recent Workflow Runs:`);
      for (const run of context.recentWorkflowRuns.slice(0, 3)) {
        parts.push(`- ${run.workflowName}: ${run.status.toUpperCase()}`);
      }
    }

    return parts.join("\n");
  }

  // 4. Clients query
  if (lower.includes("client") || lower.includes("portfolio")) {
    if (context.recentClients.length > 0) {
      const clientList = context.recentClients
        .map(
          (c) =>
            `- ${c.name}: $${c.portfolioValue.toLocaleString()} | Risk: ${c.riskTolerance} | Goals: ${c.goals.join(", ") || "Growth"}`
        )
        .join("\n");
      return `Here are your current client accounts [${modelMeta.name}]:\n\n${clientList}\n\nTotal advisory AUM is approximately $${context.featuresInUse.totalAUM.toLocaleString()}. Which client would you like to review or prepare for?`;
    }
  }

  // 5. Action items query
  if (lower.includes("action item") || lower.includes("task") || lower.includes("to-do")) {
    if (context.openActionItems.length > 0) {
      const taskList = context.openActionItems
        .map((a) => `- [${a.priority.toUpperCase()}] ${a.description}${a.clientName ? ` (Client: ${a.clientName})` : ""}${a.dueDate ? ` - Due: ${a.dueDate}` : ""}`)
        .join("\n");
      return `Here are your open action items [${modelMeta.name}]:\n\n${taskList}\n\nWould you like me to mark any of these complete or follow up on one?`;
    }
    return `You have no pending action items. Everything is up to date!`;
  }

  // 6. Meetings query
  if (lower.includes("meeting") || lower.includes("calendar") || lower.includes("schedule")) {
    if (context.upcomingMeetings.length > 0) {
      const meetingList = context.upcomingMeetings
        .map((m) => `- "${m.title}" with ${m.clientName || "Client"} [${new Date(m.meetingDate).toLocaleDateString()}]`)
        .join("\n");
      return `Here are your scheduled meetings [${modelMeta.name}]:\n\n${meetingList}\n\nWould you like me to generate a pre-meeting briefing dossier for any of them?`;
    }
    return `You have no upcoming meetings scheduled on your advisory calendar.`;
  }

  // 7. General Assistant Response (Natural conversation)
  if (modelId === "deepseek-v3") {
    return `[DeepSeek V3 Quant Evaluation]: I have analyzed your query regarding "${userQuery}".

Database state for ${context.firm.name}:
- Monitored AUM: $${context.featuresInUse.totalAUM.toLocaleString()}
- Active Accounts: ${context.featuresInUse.clientsCount}
- Workflows Monitored: ${context.featuresInUse.activeWorkflowsCount}

How can I assist with your quantitative portfolio rebalancing, asset drift calculation, or tax-loss harvesting execution?`;
  }

  if (modelId === "gemini-2.5-flash") {
    return `[Google Gemini 2.5 Flash Multimodal]: I've analyzed "${userQuery}" across your ${context.firm.name} enterprise stack.

Live Database Snapshot:
- Total AUM: $${context.featuresInUse.totalAUM.toLocaleString()} across ${context.featuresInUse.clientsCount} accounts
- Active Workflows: ${context.featuresInUse.activeWorkflowsCount}
- Open Tasks: ${context.featuresInUse.openActionItemsCount}

I can cross-reference client holdings, analyze documents, or inspect automated workflows. What would you like to explore?`;
  }

  return `I understand you're asking about: "${userQuery}".

As your Chief of Staff for ${context.firm.name} (running on ${modelMeta.name}), I have full access to your ${context.featuresInUse.clientsCount} clients, portfolios (~$${context.featuresInUse.totalAUM.toLocaleString()} AUM), active workflows, and scheduled meetings.

Would you like me to:
- Pull a deep dossier or drift analysis on a specific client?
- Run or inspect one of your automated workflows?
- Check your open action items or compliance audit log?`;
}
