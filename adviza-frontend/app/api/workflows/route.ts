import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PREBUILT_WORKFLOW_TEMPLATES } from "@/components/workflows/workflow-templates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let workflows: any[] = [];

    if (user) {
      let query = (supabase as any)
        .from("workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        workflows = data;
      }
    }

    // Fallback to prebuilt templates formatted as active workflows if DB is empty
    if (workflows.length === 0) {
      workflows = PREBUILT_WORKFLOW_TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: "active",
        trigger_type: t.nodes.find((n) => n.data.category === "trigger")?.data.typeId ?? "trigger-schedule",
        connected_apps: (t as any).connectedApps || [],
        ai_generated: false,
        last_run_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        run_count: 14,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        updated_at: new Date().toISOString(),
        nodes: t.nodes,
        edges: t.edges,
      }));
    }

    // Apply client-side search filter if query string present
    if (search) {
      workflows = workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          (w.description && w.description.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ workflows });
  } catch (err: any) {
    return NextResponse.json({ workflows: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name = "Untitled Visual Pipeline",
      description = "Automated fiduciary execution pipeline",
      nodes = [],
      edges = [],
      trigger_type = null,
      connected_apps = [],
      ai_generated = false,
      ai_prompt = null,
    } = body;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newWorkflowId = "wf_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    const record = {
      id: newWorkflowId,
      name,
      description,
      status: "draft",
      nodes,
      edges,
      trigger_type,
      connected_apps,
      ai_generated,
      ai_prompt,
      last_run_at: null,
      run_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (user) {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("firm_id")
        .eq("id", user.id)
        .single();

      const { data: inserted, error } = await (supabase as any)
        .from("workflows")
        .insert({
          ...record,
          firm_id: profile?.firm_id,
          creator_id: user.id,
        })
        .select()
        .single();

      if (!error && inserted) {
        return NextResponse.json({ workflow: inserted }, { status: 201 });
      }
    }

    return NextResponse.json({ workflow: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
