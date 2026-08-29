import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

// GET /api/workflows — List all workflows for the current firm
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("workflows")
      .select("id, name, description, status, trigger_type, connected_apps, ai_generated, last_run_at, run_count, created_at, updated_at, creator_id")
      .order("updated_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status as "draft" | "active" | "paused" | "archived");
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ workflows: data ?? [] });
  } catch (err: any) {
    console.error("[GET /api/workflows]", err);
    return NextResponse.json({ error: err.message ?? "Failed to fetch workflows" }, { status: 500 });
  }
}

// POST /api/workflows — Create a new workflow
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Resolve firm_id from the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name = "Untitled Workflow",
      description,
      nodes = [],
      edges = [],
      trigger_type,
      connected_apps = [],
      ai_generated = false,
      ai_prompt,
    }: {
      name?: string;
      description?: string;
      nodes?: WorkflowNode[];
      edges?: WorkflowEdge[];
      trigger_type?: string;
      connected_apps?: string[];
      ai_generated?: boolean;
      ai_prompt?: string;
    } = body;

    const { data, error } = await supabase
      .from("workflows")
      .insert({
        firm_id: profile.firm_id,
        creator_id: user.id,
        name,
        description,
        nodes,
        edges,
        trigger_type,
        connected_apps,
        ai_generated,
        ai_prompt,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ workflow: data }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/workflows]", err);
    return NextResponse.json({ error: err.message ?? "Failed to create workflow" }, { status: 500 });
  }
}
