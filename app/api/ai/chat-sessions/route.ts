import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: sessions, error } = await supabase
        .from("chat_sessions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error && sessions && sessions.length > 0) {
        return NextResponse.json({ sessions });
      }
    }
  } catch {}

  return NextResponse.json({ sessions: [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body?.title || "Wealth Advisory Session";
    const sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("chat_sessions" as any)
          .insert({
            id: sessionId,
            user_id: user.id,
            title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ session: data });
        }
      }
    } catch {}

    return NextResponse.json({
      session: {
        id: sessionId,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      session: {
        id: "sess_" + Date.now(),
        title: "Wealth Advisory Session",
        created_at: new Date().toISOString(),
      },
    });
  }
}
