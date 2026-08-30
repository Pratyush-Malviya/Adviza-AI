import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ sessions: [] });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    const firmId = profile?.firm_id;

    const { data: sessions, error } = await supabase
      .from("chat_sessions")
      .select("id, title, context_metadata, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("Error fetching chat sessions from Supabase:", error);
      return NextResponse.json({ sessions: [] });
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (err: any) {
    console.error("GET /api/ai/chat-sessions error:", err);
    return NextResponse.json({ sessions: [] });
  }
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

    let firmId = profile?.firm_id;
    if (!firmId) {
      const { data: firms } = await supabase.from("firms").select("id").limit(1);
      firmId = firms?.[0]?.id || "00000000-0000-0000-0000-000000000000";
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || "New Advisory Session";
    const contextMetadata = body.contextMetadata || {};

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        firm_id: firmId,
        title,
        context_metadata: contextMetadata,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat session:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error("POST /api/ai/chat-sessions error:", err);
    return NextResponse.json({ error: err.message || "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting session:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedSessionId: sessionId });
  } catch (err: any) {
    console.error("DELETE /api/ai/chat-sessions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
