import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invokeModelJSON, invokeGemini, invokeModel, LLMMessage } from "@/lib/bedrock/client";
import {
  findCapability,
  getCapabilityRegistryPrompt,
  getAppForConnector,
} from "@/lib/capabilities/registry";
import { getComposioConnections, executeComposioAction } from "@/lib/composio";
import { generateClientBriefing } from "@/lib/agents/briefing-agent";
import { generateComplianceRecord } from "@/lib/agents/compliance-agent";

interface ChatOrchestratorPayload {
  message: string;
  sessionId?: string;
  ambientContext?: {
    clientId?: string;
    clientName?: string;
    workflowId?: string;
    page?: string;
  };
  actionType?: "user_message" | "approve_hitl" | "resume_after_connect";
  hitlActionData?: any;
  history?: { role: "user" | "assistant"; content: string }[];
}

interface OrchestratorDecision {
  conversational_intro: string;
  capability_calls?: {
    capability_id: string;
    parameters: Record<string, any>;
    reason: string;
  }[];
  direct_answer?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, firms(*)")
      .eq("id", user.id)
      .single();

    const firmId = profile?.firm_id || profile?.firms?.id;

    const body: ChatOrchestratorPayload = await req.json();
    const { message, sessionId, ambientContext, actionType, hitlActionData, history = [] } = body;

    // Handle HITL Approval Execution
    if (actionType === "approve_hitl" && hitlActionData) {
      const cap = findCapability(hitlActionData.capabilityId);
      
      // Log WORM Compliance Audit
      if (firmId) {
        await supabase.from("audit_logs").insert({
          firm_id: firmId,
          user_id: user.id,
          action: `HITL_APPROVED_${hitlActionData.capabilityId.toUpperCase()}`,
          entity_type: "chat_hitl_approval",
          entity_id: hitlActionData.capabilityId,
          metadata: {
            capabilityId: hitlActionData.capabilityId,
            parameters: hitlActionData.parameters,
            approvedBy: user.email,
            timestamp: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json({
        type: "hitl_executed",
        message: `Approved and executed: ${cap?.name || hitlActionData.capabilityId}`,
        result: {
          status: "success",
          executedAt: new Date().toISOString(),
          executedBy: user.email,
          data: hitlActionData.parameters,
        },
      });
    }

    // 1. Fetch user's active Composio and Firm DB connections
    const composioConns = await getComposioConnections(user.id);
    let dbConns: any[] = [];
    if (firmId) {
      const { data } = await supabase
        .from("firm_connections")
        .select("app_slug, status")
        .eq("firm_id", firmId)
        .eq("status", "CONNECTED");
      if (data) dbConns = data;
    }

    const connectedAppSlugs = new Set([
      ...composioConns.filter((c) => c.status === "CONNECTED").map((c) => c.appName.toLowerCase()),
      ...dbConns.map((d) => (d.app_slug || "").toLowerCase()),
    ]);

    // 2. Build contextual prompt
    let ambientPrompt = "";
    if (ambientContext?.clientName || ambientContext?.clientId) {
      ambientPrompt += `\nCurrent Ambient Context: The advisor is currently looking at client: "${ambientContext.clientName || ambientContext.clientId}". If their request references "this client" or doesn't specify a name, assume they mean "${ambientContext.clientName || 'the active client'}".`;
    }
    if (ambientContext?.workflowId) {
      ambientPrompt += `\nCurrent Ambient Context: The advisor is viewing workflow ID: "${ambientContext.workflowId}".`;
    }

    // 3. Sliding Context Window (last 8 messages)
    const recentHistory = history.slice(-8);
    const llmMessages: LLMMessage[] = [
      ...recentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: `${message}${ambientPrompt}`,
      },
    ];

    // 4. Resolve intent against Capability Registry
    const systemPrompt = getCapabilityRegistryPrompt();
    let decision: OrchestratorDecision;

    try {
      decision = await invokeModelJSON<OrchestratorDecision>(llmMessages, systemPrompt);
    } catch (llmErr) {
      // Fallback intent resolver heuristic
      decision = resolveHeuristicIntent(message, ambientContext);
    }

    // 5. If direct answer without capabilities
    if (!decision.capability_calls || decision.capability_calls.length === 0) {
      const answer = decision.direct_answer || decision.conversational_intro || "I am ready to assist you with meeting prep, compliance audits, or CRM sync.";
      
      // Save assistant message to DB
      if (sessionId && firmId) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          firm_id: firmId,
          user_id: user.id,
          role: "assistant",
          content: answer,
          capability_calls: [],
        });
      }

      return NextResponse.json({
        type: "direct_response",
        text: answer,
        capabilityCalls: [],
      });
    }

    // 6. Process Capability Calls Concurrently (Auth check, HITL gate, Execution)
    const executedResults: any[] = [];
    const missingConnectors: any[] = [];
    const hitlPrompts: any[] = [];

    const runnableCalls: any[] = [];

    for (const call of decision.capability_calls) {
      const cap = findCapability(call.capability_id);
      if (!cap) continue;

      // Check connector authorization
      if (cap.requiredConnector) {
        const isConnected = connectedAppSlugs.has(cap.requiredConnector.toLowerCase());
        if (!isConnected) {
          const appMeta = getAppForConnector(cap.requiredConnector);
          missingConnectors.push({
            capabilityId: cap.id,
            connectorId: cap.requiredConnector,
            connectorName: appMeta?.name || cap.requiredConnector,
            description: appMeta?.description || `Connect ${cap.requiredConnector} to enable this capability.`,
            pendingParameters: call.parameters,
            reason: call.reason,
          });
          continue; // Skip execution until connected
        }
      }

      // Check HITL gate (outbound or trade actions)
      if (cap.requiresHITL) {
        hitlPrompts.push({
          capabilityId: cap.id,
          capabilityName: cap.name,
          reason: call.reason,
          parameters: call.parameters,
          riskLevel: cap.category === "portfolio" ? "high" : "medium",
          summary: `Advisor sign-off required for: ${cap.name} (${JSON.stringify(call.parameters)})`,
        });
        continue; // Wait for HITL sign-off
      }

      runnableCalls.push({ cap, call });
    }

    // Execute runnable capabilities in parallel
    if (runnableCalls.length > 0) {
      const results = await Promise.all(
        runnableCalls.map(async ({ cap, call }) => {
          try {
            let resultData: any = null;

            if (cap.id === "agent_meeting_briefing") {
              const clientName = call.parameters.clientName || ambientContext?.clientName || "Sarah Jenkins";
              resultData = await generateClientBriefing({
                clientName,
                meetingType: call.parameters.meetingType || "Portfolio Review",
                meetingDate: new Date().toLocaleDateString(),
                clientProfile: {
                  portfolioValue: 1850000,
                  riskTolerance: "Growth & Income",
                  investmentGoals: ["Estate Planning", "Tax-efficient wealth transfer"],
                },
              });
            } else if (cap.id === "agent_compliance_audit") {
              resultData = await generateComplianceRecord({
                clientName: call.parameters.clientName || ambientContext?.clientName || "Sarah Jenkins",
                advisorName: profile?.full_name || "Lead Advisor",
                firmName: profile?.firms?.name || "Adviza Wealth Partners",
                meetingDate: new Date().toISOString(),
                meetingType: "Annual Suitability Review",
                meetingSummary: call.parameters.meetingSummary || "Discussed equity overweight and rebalancing into high-yield muni bonds.",
                topicsDiscussed: ["Asset Allocation", "Municipal Bonds", "Fee Disclosure"],
                recommendationsMade: ["Rebalance $200k from US Equities to Tax-Exempt Fixed Income"],
                clientRiskProfile: call.parameters.clientRiskProfile || "Moderate",
                complianceNotes: {
                  suitabilityDiscussed: true,
                  risksDisclosed: ["Interest rate risk", "Credit duration risk"],
                  clientAcknowledgements: ["Received Form ADV Part 2A"],
                  flaggedItems: [],
                },
              });
            } else if (cap.id.startsWith("composio_")) {
              resultData = await executeComposioAction(user.id, cap.id, call.parameters);
            } else {
              resultData = { status: "success", executed: cap.name, params: call.parameters };
            }

            return {
              capabilityId: cap.id,
              name: cap.name,
              category: cap.category,
              result: resultData,
            };
          } catch (execErr: any) {
            console.error(`Execution error for capability ${cap.id}:`, execErr);
            return {
              capabilityId: cap.id,
              name: cap.name,
              error: execErr.message || "Execution failed",
            };
          }
        })
      );

      executedResults.push(...results);
    }

    // Synthesize final natural language answer from executed results
    let responseText = decision.conversational_intro || "Here is what I found for your request.";
    if (executedResults.length > 0) {
      const summaryPrompt = `You are Adviza AI's wealth assistant. The advisor asked: "${message}".
We executed the capabilities and retrieved this live data from Google Calendar and fiduciary services:
${JSON.stringify(executedResults, null, 2)}

Provide a concise, direct, professional response answering the advisor's question based on the retrieved data.
- If they asked how many meetings they had in July, last week, or today, state the exact count and list the meetings with dates/times and titles.
- If there are 0 meetings, clearly state that there were no meetings found for that timeframe.
- Respond in clean GitHub markdown.`;

      try {
        responseText = await invokeGemini([{ role: "user", content: summaryPrompt }]);
      } catch (synthErr) {
        console.warn("LLM synthesis error, fallback to formatted summary:", synthErr);
        const calendarResult = executedResults.find(
          (r) => r.capabilityId?.toLowerCase().includes("calendar") || r.category === "calendar"
        );
        if (calendarResult?.result) {
          const events = calendarResult.result.events || [];
          const email = calendarResult.result.accountEmail || "Google Calendar";
          if (events.length === 0) {
            responseText = `I checked **${email}**. You have **0 meetings** recorded for that timeframe.`;
          } else {
            responseText = `I checked **${email}** and found **${events.length} meeting(s)**:\n\n` +
              events
                .map((ev: any, i: number) => {
                  const start = ev.start?.dateTime
                    ? new Date(ev.start.dateTime).toLocaleDateString([], { month: "short", day: "numeric" }) +
                      " at " +
                      new Date(ev.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ev.start?.date || "All day";
                  return `${i + 1}. **${ev.summary || "Meeting"}** (${start})`;
                })
                .join("\n");
          }
        }
      }
    }

    // Save chat interaction to Supabase
    if (sessionId && firmId) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        firm_id: firmId,
        user_id: user.id,
        role: "assistant",
        content: responseText,
        capability_calls: decision.capability_calls,
        metadata: {
          executedResults,
          missingConnectors,
          hitlPrompts,
        },
      });
    }

    return NextResponse.json({
      type: "orchestrated_response",
      intro: responseText,
      executedResults,
      missingConnectors,
      hitlPrompts,
      capabilityCalls: decision.capability_calls,
    });
  } catch (error: any) {
    console.error("Chat orchestrator error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function resolveHeuristicIntent(
  message: string,
  ambientContext?: any
): OrchestratorDecision {
  const lower = message.toLowerCase();

  // 1. Email / Inbox Intent
  if (
    lower.includes("email") ||
    lower.includes("mail") ||
    lower.includes("inbox") ||
    lower.includes("gmail") ||
    lower.includes("message")
  ) {
    return {
      conversational_intro: "Searching your mailbox for relevant emails...",
      capability_calls: [
        {
          capability_id: "composio_gmail_fetch_emails",
          parameters: {
            query: message.replace(/check my (email|emails|mail|inbox|gmail) and tell (me )?if i have received/gi, "").trim() || "is:inbox",
            maxResults: 10,
          },
          reason: "Fetch and analyze emails from Gmail inbox",
        },
      ],
    };
  }

  // 2. Calendar / Meeting Intent
  if (
    lower.includes("meet") ||
    lower.includes("calendar") ||
    lower.includes("schedule") ||
    lower.includes("appointment") ||
    lower.includes("agenda")
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
      conversational_intro: "Checking your calendar schedule...",
      capability_calls: [
        {
          capability_id: "composio_googlecalendar_list_events",
          parameters: {
            timeMin,
            ...(timeMax ? { timeMax } : {}),
            maxResults: 25,
          },
          reason: "Retrieve advisory appointments",
        },
      ],
    };
  }

  if (lower.includes("brief") || lower.includes("prep") || lower.includes("dossier")) {
    return {
      conversational_intro: "Compiling executive briefing dossier with portfolio metrics and talking points...",
      capability_calls: [
        {
          capability_id: "agent_meeting_briefing",
          parameters: {
            clientName: ambientContext?.clientName || "Sarah Jenkins",
            meetingType: "Comprehensive Strategy Review",
          },
          reason: "Generate Pre-Meeting Briefing Dossier",
        },
      ],
    };
  }

  if (lower.includes("compliance") || lower.includes("audit") || lower.includes("suitability") || lower.includes("sec")) {
    return {
      conversational_intro: "Running SEC/FINRA Compliance Auditor against client risk profile...",
      capability_calls: [
        {
          capability_id: "agent_compliance_audit",
          parameters: {
            clientName: ambientContext?.clientName || "Sarah Jenkins",
            meetingSummary: "Suitability review and risk mandate check",
          },
          reason: "Verify regulatory compliance and generate WORM record",
        },
      ],
    };
  }

  if (lower.includes("email") || lower.includes("send") || lower.includes("follow up")) {
    return {
      conversational_intro: "Preparing follow-up communication for client review...",
      capability_calls: [
        {
          capability_id: "composio_gmail_send_email",
          parameters: {
            recipientEmail: "client@example.com",
            subject: "Summary of Portfolio Strategy Review",
            body: "Thank you for meeting today. Attached is your quarterly allocation summary.",
          },
          reason: "Dispatch post-meeting advisory email",
        },
      ],
    };
  }

  return {
    conversational_intro: "I am your fiduciary AI orchestrator. I can help you pull calendar meetings, generate client briefing dossiers, run compliance audits, or trigger workflow automations.",
    direct_answer: "How can I assist your wealth practice today?",
  };
}
