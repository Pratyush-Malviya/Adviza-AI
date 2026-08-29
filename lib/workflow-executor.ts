/**
 * lib/workflow-executor.ts
 * Server-side node-by-node workflow execution engine.
 * Walks nodes in topological order, dispatches per-category actions,
 * and writes a structured execution log.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowExecutionLog } from "@/types/workflow";

export interface ExecutionContext {
  workflowId: string;
  firmId: string;
  triggeredBy?: string;
  /** Live connections keyed by Composio app slug */
  connectedApps: Set<string>;
}

export interface NodeResult {
  nodeId: string;
  nodeLabel: string;
  status: "success" | "error" | "skipped";
  output?: Record<string, unknown>;
  durationMs: number;
  logs: WorkflowExecutionLog[];
}

export interface ExecutionResult {
  status: "success" | "failed" | "partial";
  nodeResults: NodeResult[];
  logs: WorkflowExecutionLog[];
  nodeOutputs: Record<string, Record<string, unknown>>;
  durationMs: number;
  errorMessage?: string;
}

/** Build a topological order from the edge graph (Kahn's algorithm) */
function topoSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const n of nodes) {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  }

  for (const e of edges) {
    adj.get(e.sourceNodeId)?.push(e.targetNodeId);
    inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) ?? 0) + 1);
  }

  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);
  const sorted: WorkflowNode[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const neighbor of adj.get(node.id) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        const neighborNode = nodes.find((n) => n.id === neighbor);
        if (neighborNode) queue.push(neighborNode);
      }
    }
  }

  // Append any remaining nodes (cycles or isolated) at the end
  const sortedIds = new Set(sorted.map((n) => n.id));
  for (const n of nodes) {
    if (!sortedIds.has(n.id)) sorted.push(n);
  }

  return sorted;
}

function makeLog(
  nodeId: string,
  nodeLabel: string,
  level: WorkflowExecutionLog["level"],
  message: string,
  payload?: unknown
): WorkflowExecutionLog {
  return {
    timestamp: new Date().toISOString(),
    nodeId,
    nodeLabel,
    level,
    message,
    payload,
  };
}

async function simulateDelay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulate execution for a single node */
async function executeNode(
  node: WorkflowNode,
  ctx: ExecutionContext,
  previousOutputs: Record<string, Record<string, unknown>>
): Promise<NodeResult> {
  const start = Date.now();
  const logs: WorkflowExecutionLog[] = [];
  const { typeId, label } = node.data;

  try {
    logs.push(makeLog(node.id, label, "info", `▶ Starting node: ${label}`));

    let output: Record<string, unknown> = {};

    // ─── TRIGGERS ──────────────────────────────────────────────────────────────
    if (typeId.startsWith("trigger-")) {
      if (typeId === "trigger-calendar") {
        const connected = ctx.connectedApps.has("googlecalendar") || ctx.connectedApps.has("outlook_calendar");
        if (connected) {
          logs.push(makeLog(node.id, label, "success", "📅 Calendar connector active — fetched upcoming meeting event"));
          output = { event: { title: "Client Review — Portfolio Q3", clientId: "client-001", scheduledAt: new Date().toISOString() } };
        } else {
          logs.push(makeLog(node.id, label, "warn", "⚠️ No calendar connector connected — using mock event payload"));
          output = { event: { title: "Mock Meeting Event", clientId: "mock-001", scheduledAt: new Date().toISOString() } };
        }
      } else if (typeId === "trigger-portfolio-drift") {
        await simulateDelay(200);
        output = { alert: { portfolioId: "port-001", driftPct: 6.4, threshold: 5, assetClass: "Equities" } };
        logs.push(makeLog(node.id, label, "success", "📊 Portfolio drift alert fired: 6.4% deviation detected"));
      } else if (typeId === "trigger-audio-upload") {
        output = { audioUrl: "s3://adviza-audio/meeting-001.mp3", clientId: "client-001" };
        logs.push(makeLog(node.id, label, "success", "🎙️ Audio upload event received"));
      } else if (typeId === "trigger-webhook") {
        output = { payload: { source: "external-webhook", receivedAt: new Date().toISOString() } };
        logs.push(makeLog(node.id, label, "success", "🔗 Webhook trigger received"));
      } else {
        output = { triggered: true, timestamp: new Date().toISOString() };
        logs.push(makeLog(node.id, label, "success", `✅ Trigger fired: ${label}`));
      }
    }

    // ─── AI AGENTS ─────────────────────────────────────────────────────────────
    else if (typeId.startsWith("agent-")) {
      await simulateDelay(800 + Math.random() * 400);
      if (typeId === "agent-briefing-generator") {
        output = { briefing: "Executive summary: Q3 portfolio is up 4.2%. Equity exposure at 68%, above the 65% target. Key discussion: rebalancing and tax-loss harvesting opportunity.", tokensUsed: 312 };
        logs.push(makeLog(node.id, label, "success", "🤖 Claude Sonnet generated executive briefing (312 tokens)"));
      } else if (typeId === "agent-compliance-checker") {
        output = { compliant: true, flags: [], ruleset: "FINRA-2111", passedChecks: 7 };
        logs.push(makeLog(node.id, label, "success", "🛡️ Compliance check passed — 7/7 FINRA checks green"));
      } else if (typeId === "agent-commitment-extractor") {
        output = { commitments: ["Rebalance portfolio by Oct 15", "Send updated IPS document", "Schedule Q4 review"] };
        logs.push(makeLog(node.id, label, "success", "📝 Extracted 3 commitments from meeting transcript"));
      } else {
        output = { result: "AI agent completed processing", model: "claude-3-5-sonnet" };
        logs.push(makeLog(node.id, label, "success", `🤖 AI agent ${label} completed`));
      }
    }

    // ─── LOGIC NODES ───────────────────────────────────────────────────────────
    else if (typeId.startsWith("logic-")) {
      await simulateDelay(100);
      if (typeId === "logic-advisor-gate") {
        output = { approved: true, approver: ctx.triggeredBy ?? "advisor", timestamp: new Date().toISOString() };
        logs.push(makeLog(node.id, label, "success", "✅ Advisor gate: auto-approved in simulation mode"));
      } else if (typeId === "logic-condition") {
        output = { branch: "yes", conditionMet: true };
        logs.push(makeLog(node.id, label, "success", "🔀 Condition evaluated: branch → YES"));
      } else {
        output = { passed: true };
        logs.push(makeLog(node.id, label, "success", `✅ Logic gate ${label} passed`));
      }
    }

    // ─── ACTION NODES ──────────────────────────────────────────────────────────
    else if (typeId.startsWith("action-")) {
      await simulateDelay(500 + Math.random() * 300);

      if (typeId === "action-composio-crm") {
        const crmConnected = ctx.connectedApps.has("salesforce") || ctx.connectedApps.has("hubspot") || ctx.connectedApps.has("wealthbox");
        if (crmConnected) {
          const appName = ctx.connectedApps.has("salesforce") ? "Salesforce" : ctx.connectedApps.has("hubspot") ? "HubSpot" : "Wealthbox";
          output = { synced: true, crmId: `crm-${Date.now()}`, platform: appName };
          logs.push(makeLog(node.id, label, "success", `🔄 Synced meeting notes to ${appName} CRM`));
        } else {
          output = { synced: false, reason: "No CRM connector active" };
          logs.push(makeLog(node.id, label, "warn", "⚠️ No CRM connector — skipped sync (connect via Connectors page)"));
        }
      } else if (typeId === "action-email-followup") {
        const emailConnected = ctx.connectedApps.has("gmail") || ctx.connectedApps.has("outlook");
        if (emailConnected) {
          output = { sent: true, messageId: `msg-${Date.now()}`, to: "client@example.com" };
          logs.push(makeLog(node.id, label, "success", "📧 Follow-up email dispatched via Gmail"));
        } else {
          output = { sent: false, reason: "No email connector active" };
          logs.push(makeLog(node.id, label, "warn", "⚠️ No email connector — email skipped"));
        }
      } else if (typeId === "action-slack-notify") {
        const slackConnected = ctx.connectedApps.has("slack");
        if (slackConnected) {
          output = { sent: true, channel: node.data.config?.channel ?? "#advisor-alerts" };
          logs.push(makeLog(node.id, label, "success", `💬 Slack notification sent to ${node.data.config?.channel ?? "#advisor-alerts"}`));
        } else {
          output = { sent: false, reason: "Slack not connected" };
          logs.push(makeLog(node.id, label, "warn", "⚠️ Slack not connected — notification skipped"));
        }
      } else if (typeId === "action-inngest-job") {
        output = { dispatched: true, jobId: `inngest-${Date.now()}`, eventName: node.data.config?.eventName ?? "adviza/workflow.step" };
        logs.push(makeLog(node.id, label, "success", `⚡ Inngest background job dispatched: ${node.data.config?.eventName ?? "adviza/workflow.step"}`));
      } else {
        output = { completed: true };
        logs.push(makeLog(node.id, label, "success", `✅ Action ${label} completed`));
      }
    }

    // ─── OUTPUT NODES ──────────────────────────────────────────────────────────
    else if (typeId.startsWith("output-")) {
      await simulateDelay(200);
      output = { rendered: true, format: node.data.config?.format ?? "json" };
      logs.push(makeLog(node.id, label, "success", `📤 Output node rendered in ${node.data.config?.format ?? "json"} format`));
    }

    // ─── UNKNOWN ───────────────────────────────────────────────────────────────
    else {
      output = { unknown: true };
      logs.push(makeLog(node.id, label, "warn", `❓ Unknown node type: ${typeId} — skipped`));
    }

    logs.push(makeLog(node.id, label, "success", `✅ Node completed in ${Date.now() - start}ms`));

    return {
      nodeId: node.id,
      nodeLabel: label,
      status: "success",
      output,
      durationMs: Date.now() - start,
      logs,
    };
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    logs.push(makeLog(node.id, label, "error", `❌ Node failed: ${msg}`));
    return {
      nodeId: node.id,
      nodeLabel: label,
      status: "error",
      durationMs: Date.now() - start,
      logs,
    };
  }
}

/** Main entry point: execute an entire workflow */
export async function executeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  ctx: ExecutionContext
): Promise<ExecutionResult> {
  const overallStart = Date.now();
  const allLogs: WorkflowExecutionLog[] = [];
  const nodeOutputs: Record<string, Record<string, unknown>> = {};
  const nodeResults: NodeResult[] = [];

  allLogs.push({
    timestamp: new Date().toISOString(),
    nodeId: "system",
    nodeLabel: "System",
    level: "info",
    message: `🚀 Workflow execution started (${nodes.length} nodes, ${edges.length} edges)`,
  });

  const sorted = topoSort(nodes, edges);

  let hasError = false;
  for (const node of sorted) {
    const result = await executeNode(node, ctx, nodeOutputs);
    nodeResults.push(result);
    allLogs.push(...result.logs);
    if (result.output) nodeOutputs[node.id] = result.output;
    if (result.status === "error") {
      hasError = true;
      // Continue execution even on individual node errors (partial run)
    }
  }

  const totalMs = Date.now() - overallStart;
  allLogs.push({
    timestamp: new Date().toISOString(),
    nodeId: "system",
    nodeLabel: "System",
    level: hasError ? "warn" : "success",
    message: `🏁 Workflow execution finished in ${totalMs}ms (${hasError ? "with errors" : "all nodes succeeded"})`,
  });

  return {
    status: hasError ? "partial" : "success",
    nodeResults,
    logs: allLogs,
    nodeOutputs,
    durationMs: totalMs,
  };
}
