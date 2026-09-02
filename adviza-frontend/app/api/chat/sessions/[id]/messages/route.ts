import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: messages, error } = await supabase
      .from("chat_messages" as any)
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (!error && messages) {
      return NextResponse.json({ messages });
    }
  } catch {}

  return NextResponse.json({ messages: [] });
}
