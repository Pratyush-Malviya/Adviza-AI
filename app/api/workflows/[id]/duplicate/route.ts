import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/workflows/[id]/duplicate
export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch existing workflow
    const { data: source, error: fetchError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !source) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Resolve firm_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { data: cloned, error: insertError } = await supabase
      .from("workflows")
      .insert({
        firm_id: profile.firm_id,
        creator_id: user.id,
        name: `${source.name} (Copy)`,
        description: source.description,
        status: "draft",
        trigger_type: source.trigger_type,
        nodes: source.nodes,
        edges: source.edges,
        connected_apps: source.connected_apps,
        ai_generated: source.ai_generated,
        ai_prompt: source.ai_prompt,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json({ workflow: cloned }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/workflows/[id]/duplicate]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
