import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, capability_calls, metadata, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching session messages:", error);
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      sessionId,
      messages: (messages || []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        executedResults: m.metadata?.executedResults || [],
        missingConnectors: m.metadata?.missingConnectors || [],
        hitlPrompts: m.metadata?.hitlPrompts || [],
      })),
    });
  } catch (err: any) {
    console.error("GET /api/ai/chat-sessions/[sessionId] error:", err);
    return NextResponse.json({ messages: [] });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title;

    if (!title) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating session title:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error("PATCH /api/ai/chat-sessions/[sessionId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
