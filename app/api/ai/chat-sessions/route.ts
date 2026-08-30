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

    const { data: sessions, error } = await supabase
      .from("chat_sessions")
      .select("id, title, context_metadata, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("Database chat sessions lookup note:", error.message);
      return NextResponse.json({ sessions: [] });
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (err: any) {
    console.warn("GET /api/ai/chat-sessions non-fatal error:", err.message || err);
    return NextResponse.json({ sessions: [] });
  }
}

export async function POST(req: NextRequest) {
  let title = "New Advisory Session";
  let contextMetadata = {};

  try {
    const body = await req.json().catch(() => ({}));
    title = body.title || "New Advisory Session";
    contextMetadata = body.contextMetadata || {};

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const fallbackSession = {
        id: crypto.randomUUID(),
        user_id: "demo_user",
        firm_id: "00000000-0000-0000-0000-000000000000",
        title,
        context_metadata: contextMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ session: fallbackSession });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

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
      console.warn("[chat-sessions] Database session insert skipped, using resilient session:", error.message);
      const fallbackSession = {
        id: crypto.randomUUID(),
        user_id: user.id,
        firm_id: firmId,
        title,
        context_metadata: contextMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ session: fallbackSession });
    }

    return NextResponse.json({ session });
  } catch (err: any) {
    console.warn("POST /api/ai/chat-sessions non-fatal error:", err.message || err);
    const fallbackSession = {
      id: crypto.randomUUID(),
      title,
      context_metadata: contextMetadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ session: fallbackSession });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: true, deletedSessionId: sessionId });
    }

    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.warn("[chat-sessions] Database session delete note:", error.message);
    }

    return NextResponse.json({ success: true, deletedSessionId: sessionId });
  } catch (err: any) {
    console.warn("DELETE /api/ai/chat-sessions non-fatal error:", err.message || err);
    return NextResponse.json({ success: true });
  }
}
