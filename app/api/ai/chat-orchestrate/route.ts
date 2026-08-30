import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { advizaChatGraph } from "@/lib/agent-graph/graph";
import { findCapability } from "@/lib/capabilities/registry";
import { executeComposioAction } from "@/lib/composio";
import { addMemories } from "@/lib/memory/mem0";

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
      .select("firm_id, full_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : undefined);

    let firmId: string = profile?.firm_id || "";
    if (!firmId) {
      const { data: firms } = await supabase.from("firms").select("id").limit(1);
      if (firms && firms.length > 0 && firms[0].id) {
        firmId = firms[0].id;
      } else {
        const { data: newFirm } = await supabase
          .from("firms")
          .insert({ name: "Advisory Firm", slug: `firm-${Date.now()}` })
          .select()
          .single();
        firmId = newFirm?.id || "00000000-0000-0000-0000-000000000000";
      }
      if (firmId && firmId !== "00000000-0000-0000-0000-000000000000") {
        await supabase.from("profiles").update({ firm_id: firmId }).eq("id", user.id);
      }
    }

    const body: ChatOrchestratorPayload = await req.json();
    const { message, sessionId: rawSessionId, ambientContext, actionType = "user_message", hitlActionData, history = [] } = body;

    const effectiveUserName = userName || ambientContext?.userName;

    // Ensure we have a valid UUID chat_sessions record
    const isValidUUID = (str?: string | null) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str));

    let effectiveSessionId: string | null = null;

    if (isValidUUID(rawSessionId)) {
      effectiveSessionId = rawSessionId!;
      // Check if session exists in DB; if not, create it
      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", effectiveSessionId)
        .single();

      if (!existingSession) {
        await supabase.from("chat_sessions").insert({
          id: effectiveSessionId,
          firm_id: firmId,
          user_id: user.id,
          title: message.length > 36 ? message.slice(0, 36) + "..." : message,
          context_metadata: ambientContext || {},
        });
      }
    } else if (rawSessionId) {
      // Non-UUID session ID (e.g. from local storage fallback) - create a real UUID session
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({
          firm_id: firmId,
          user_id: user.id,
          title: message.length > 36 ? message.slice(0, 36) + "..." : message,
          context_metadata: { originalId: rawSessionId, ...(ambientContext || {}) },
        })
        .select()
        .single();

      effectiveSessionId = newSession?.id || null;
    } else {
      // Auto-create new session if none provided
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({
          firm_id: firmId,
          user_id: user.id,
          title: message.length > 36 ? message.slice(0, 36) + "..." : message,
          context_metadata: ambientContext || {},
        })
        .select()
        .single();

      effectiveSessionId = newSession?.id || null;
    }

    // Handle HITL Action Approval Execution
    if (actionType === "approve_hitl" && hitlActionData) {
      const cap = findCapability(hitlActionData.capabilityId);

      if (cap?.source === "composio_connector") {
        await executeComposioAction(user.id, hitlActionData.capabilityId, hitlActionData.parameters);
      }

      if (effectiveSessionId) {
        await supabase.from("chat_messages").insert({
          session_id: effectiveSessionId,
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
        sessionId: effectiveSessionId,
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
    if (effectiveSessionId) {
      try {
        await supabase.from("chat_messages").insert({
          session_id: effectiveSessionId,
          firm_id: firmId,
          user_id: user.id,
          role: "user",
          content: message,
        });
      } catch (insertErr) {
        console.warn("Failed to persist user message:", insertErr);
      }
    }

    // Execute Adviza Fiduciary LangGraph Multi-Agent State Machine
    const graphState = await advizaChatGraph.invoke({
      sessionId: effectiveSessionId || undefined,
      userId: user.id,
      userName: effectiveUserName,
      firmId,
      message,
      messages: history,
      ambientContext: {
        ...ambientContext,
        userName: effectiveUserName,
      },
    });

    // Persist Assistant Response to DB
    if (effectiveSessionId) {
      try {
        await supabase.from("chat_messages").insert({
          session_id: effectiveSessionId,
          firm_id: firmId,
          user_id: user.id,
          role: "assistant",
          content: graphState.finalResponse,
          capability_calls: graphState.capabilityCalls || [],
          metadata: {
            executedResults: graphState.executedResults || [],
            missingConnectors: graphState.missingConnectors || [],
            hitlPrompts: graphState.hitlPrompts || [],
          },
        });

        await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", effectiveSessionId);
      } catch (persistErr) {
        console.warn("Failed to persist assistant response:", persistErr);
      }
    }

    // Trigger Mem0 Universal Memory Extraction asynchronously (non-blocking)
    if (graphState.finalResponse && graphState.finalResponse.length > 5) {
      addMemories(
        user.id,
        [
          { role: "user", content: message },
          { role: "assistant", content: graphState.finalResponse },
        ],
        { sessionId: effectiveSessionId || undefined, firmId }
      ).catch((memErr) => console.warn("[mem0-auto-extract] Non-fatal memory extraction error:", memErr));
    }

    return NextResponse.json({
      type: "orchestrated_response",
      sessionId: effectiveSessionId,
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
