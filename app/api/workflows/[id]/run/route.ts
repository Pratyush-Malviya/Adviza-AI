import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeWorkflow } from "@/lib/workflow-executor";
import { getComposioConnections } from "@/lib/composio";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/workflows/[id]/run
export async function POST(_req: NextRequest, { params }: RouteContext) {
  const startedAt = new Date().toISOString();
  const wallStart = Date.now();

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch the workflow
    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (wfError || !workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Create a pending run record
    const { data: run, error: runCreateError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: id,
        firm_id: profile.firm_id,
        triggered_by: user.id,
        status: "running",
        started_at: startedAt,
      })
      .select()
      .single();

    if (runCreateError || !run) {
      throw new Error("Failed to create workflow run record");
    }

    // Fetch live Composio connections for connector-awareness
    const connections = await getComposioConnections(user.id);
    const connectedApps = new Set(
      connections
        .filter((c) => c.status === "CONNECTED" || c.status === "ACTIVE")
        .map((c) => c.appName.toLowerCase())
    );

    // Execute the workflow
    const nodes = (workflow.nodes as WorkflowNode[]) ?? [];
    const edges = (workflow.edges as WorkflowEdge[]) ?? [];

    const result = await executeWorkflow(nodes, edges, {
      workflowId: id,
      firmId: profile.firm_id,
      triggeredBy: user.id,
      connectedApps,
    });

    const finishedAt = new Date().toISOString();
    const durationMs = Date.now() - wallStart;

    // Update the run record with results
    await supabase
      .from("workflow_runs")
      .update({
        status: result.status === "success" ? "success" : result.status === "partial" ? "success" : "failed",
        finished_at: finishedAt,
        duration_ms: durationMs,
        logs: result.logs,
        node_outputs: result.nodeOutputs,
        error_message: result.errorMessage ?? null,
      })
      .eq("id", run.id);

    // Update workflow aggregate stats
    await supabase
      .from("workflows")
      .update({
        last_run_at: finishedAt,
        run_count: (workflow.run_count ?? 0) + 1,
      })
      .eq("id", id);

    return NextResponse.json({
      run: {
        id: run.id,
        status: result.status,
        durationMs,
        logs: result.logs,
        nodeOutputs: result.nodeOutputs,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/workflows/[id]/run]", err);
    return NextResponse.json({ error: err.message ?? "Execution failed" }, { status: 500 });
  }
}
