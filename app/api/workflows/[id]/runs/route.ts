import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/workflows/[id]/runs — fetch execution history
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("workflow_runs")
      .select("id, status, started_at, finished_at, duration_ms, error_message, created_at")
      .eq("workflow_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ runs: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
