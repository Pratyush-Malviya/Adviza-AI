import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { advizaChatGraph } from "@/lib/agent-graph/graph";
import { findCapability } from "@/lib/capabilities/registry";
import { executeComposioAction } from "@/lib/composio";

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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    const firmId = profile?.firm_id;

    const body: ChatOrchestratorPayload = await req.json();
    const { message, sessionId, ambientContext, actionType = "user_message", hitlActionData, history = [] } = body;

    // Handle HITL Action Approval Execution
    if (actionType === "approve_hitl" && hitlActionData) {
      const cap = findCapability(hitlActionData.capabilityId);

      if (cap?.source === "composio_connector") {
        await executeComposioAction(user.id, hitlActionData.capabilityId, hitlActionData.parameters);
      }

      if (sessionId && firmId) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          firm_id: firmId,
          user_id: user.id,
          role: "assistant",
          content: `Advisor Approved & Executed: ${cap?.name || hitlActionData.capabilityId}`,
          capability_calls: [
            {
              capability_id: hitlActionData.capabilityId,
              parameters: hitlActionData.parameters,
              status: "executed",
            },
          ],
          metadata: {
            hitl_approved_by: user.id,
            hitl_approved_at: new Date().toISOString(),
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

    // Persist User Message to DB
    if (sessionId && firmId) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        firm_id: firmId,
        user_id: user.id,
        role: "user",
        content: message,
      });
    }

    // Execute Adviza Fiduciary LangGraph Multi-Agent State Machine
    const graphState = await advizaChatGraph.invoke({
      sessionId,
      userId: user.id,
      firmId,
      message,
      messages: history,
      ambientContext,
    });

    return NextResponse.json({
      type: "orchestrated_response",
      intro: graphState.finalResponse,
      text: graphState.finalResponse,
      executedResults: graphState.executedResults || [],
      missingConnectors: graphState.missingConnectors || [],
      hitlPrompts: graphState.hitlPrompts || [],
      capabilityCalls: graphState.capabilityCalls || [],
    });
  } catch (error: any) {
    console.error("Chat orchestrator LangGraph error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
