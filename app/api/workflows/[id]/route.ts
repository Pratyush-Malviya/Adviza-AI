import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/workflows/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }
    return NextResponse.json({ workflow: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/workflows/[id]
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updates: {
      name?: string;
      description?: string;
      status?: "draft" | "active" | "paused" | "archived";
      trigger_type?: string;
      nodes?: WorkflowNode[];
      edges?: WorkflowEdge[];
      connected_apps?: string[];
    } = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.trigger_type !== undefined) updates.trigger_type = body.trigger_type;
    if (body.nodes !== undefined) updates.nodes = body.nodes;
    if (body.edges !== undefined) updates.edges = body.edges;
    if (body.connected_apps !== undefined) updates.connected_apps = body.connected_apps;

    const { data, error } = await supabase
      .from("workflows")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ workflow: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/workflows/[id] — archive the workflow
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("workflows")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
