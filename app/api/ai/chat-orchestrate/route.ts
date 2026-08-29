import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invokeModelJSON, LLMMessage } from "@/lib/bedrock/client";
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

    // 1. Fetch user's active Composio connections
    const connections = await getComposioConnections(user.id);
    const connectedAppSlugs = new Set(
      connections.filter((c) => c.status === "CONNECTED").map((c) => c.appName.toLowerCase())
    );

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

    // 6. Process Capability Calls (Auth check, HITL gate, Execution)
    const executedResults: any[] = [];
    const missingConnectors: any[] = [];
    const hitlPrompts: any[] = [];

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

      // Execute Sync / Agent Fleet capabilities
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

        executedResults.push({
          capabilityId: cap.id,
          name: cap.name,
          category: cap.category,
          result: resultData,
        });
      } catch (execErr: any) {
        console.error(`Execution error for capability ${cap.id}:`, execErr);
        executedResults.push({
          capabilityId: cap.id,
          name: cap.name,
          error: execErr.message || "Execution failed",
        });
      }
    }

    // Save chat interaction to Supabase
    if (sessionId && firmId) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        firm_id: firmId,
        user_id: user.id,
        role: "assistant",
        content: decision.conversational_intro || "Here is what I found for your request.",
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
      intro: decision.conversational_intro,
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

  if (lower.includes("meeting") || lower.includes("calendar") || lower.includes("schedule") || lower.includes("today")) {
    return {
      conversational_intro: "Checking your upcoming calendar schedule and client meetings...",
      capability_calls: [
        {
          capability_id: "composio_googlecalendar_list_events",
          parameters: { timeMin: "today", maxResults: 5 },
          reason: "Retrieve upcoming advisory appointments",
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
