"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  WorkflowNode,
  WorkflowEdge,
  NodeTemplateDefinition,
  WorkflowExecutionLog,
  WorkflowTemplate,
} from "@/types/workflow";
import { WorkflowPalette } from "@/components/workflows/workflow-palette";
import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";
import { WorkflowProperties } from "@/components/workflows/workflow-properties";
import {
  PREBUILT_WORKFLOW_TEMPLATES,
  AVAILABLE_NODE_TEMPLATES,
} from "@/components/workflows/workflow-templates";
import { useConnections } from "@/hooks/useConnections";
import {
  Play,
  Save,
  Download,
  Upload,
  Sparkles,
  Check,
  FolderOpen,
  X,
  Wand2,
  Loader2,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SAMPLE_PROMPTS = [
  "When a client portfolio drifts by >5%, run risk audit, require advisor sign-off, and dispatch Inngest rebalance",
  "After client meeting audio upload, extract commitments with Claude, run FINRA/SEC compliance check, and sync tasks to Salesforce",
  "60 minutes before Google Calendar review meeting, generate executive briefing memo and sync prep note to CRM",
  "Inbound webhook for High Net Worth lead, audit KYC requirements, and send automated welcome follow-up email via Resend",
];

export default function WorkflowEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workflowId = params.id;

  // Connections
  const { isConnected, loading: connectionsLoading } = useConnections();

  // Workflow DB state
  const [dbWorkflow, setDbWorkflow] = useState<{ name: string; description: string | null; status: string } | null>(null);
  const [loadingWorkflow, setLoadingWorkflow] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Canvas state
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Run state
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<WorkflowExecutionLog[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<WorkflowExecutionLog[]>([]);

  // UI state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load from DB ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!workflowId) return;

    async function load() {
      setLoadingWorkflow(true);
      try {
        const res = await fetch(`/api/workflows/${workflowId}`);
        if (res.ok) {
          const data = await res.json();
          const wf = data.workflow;
          if (wf) {
            setDbWorkflow({ name: wf.name, description: wf.description, status: wf.status });
            setWorkflowName(wf.name || "Untitled Workflow");
            setNodes(Array.isArray(wf.nodes) ? wf.nodes : []);
            setEdges(Array.isArray(wf.edges) ? wf.edges : []);
            setIsDirty(false);
            return;
          }
        }

        // Fallback to localStorage for local / generated workflow
        const saved = localStorage.getItem("adviza_current_workflow");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.id === workflowId || !workflowId || workflowId === "local" || workflowId.startsWith("wf_")) {
              if (parsed.name) setWorkflowName(parsed.name);
              setNodes(Array.isArray(parsed.nodes) ? parsed.nodes : []);
              setEdges(Array.isArray(parsed.edges) ? parsed.edges : []);
            }
          } catch (e) {
            console.error("Failed to parse local workflow", e);
          }
        }
      } catch (err) {
        console.error("Load workflow error", err);
      } finally {
        setLoadingWorkflow(false);
      }
    }

    load();
  }, [workflowId]);

  // ─── Auto-save with 2s debounce ────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!workflowId || !isDirty) return;
      try {
        setIsSaving(true);
        const connectedApps = nodes
          .filter((n) => n.data.typeId.startsWith("action-") || n.data.typeId.startsWith("trigger-"))
          .flatMap((n) => {
            const tpl = AVAILABLE_NODE_TEMPLATES.find((t) => t.typeId === n.data.typeId);
            return tpl?.composioAppIds ?? [];
          });

        await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: workflowName,
            nodes,
            edges,
            trigger_type: nodes.find((n) => n.data.category === "trigger")?.data.typeId ?? null,
            connected_apps: [...new Set(connectedApps)],
          }),
        });
        setLastSaved(new Date());
        setIsDirty(false);
      } catch {
        // Silent auto-save failure
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, [workflowId, isDirty, workflowName, nodes, edges]);

  // Trigger auto-save when canvas state changes
  useEffect(() => {
    if (!loadingWorkflow) {
      setIsDirty(true);
      scheduleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, workflowName]);

  // ─── Manual Save ───────────────────────────────────────────────────────────
  const handleSaveWorkflow = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    try {
      setIsSaving(true);
      if (workflowId) {
        const connectedApps = nodes
          .filter((n) => n.data.typeId.startsWith("action-") || n.data.typeId.startsWith("trigger-"))
          .flatMap((n) => {
            const tpl = AVAILABLE_NODE_TEMPLATES.find((t) => t.typeId === n.data.typeId);
            return tpl?.composioAppIds ?? [];
          });

        await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: workflowName,
            nodes,
            edges,
            trigger_type: nodes.find((n) => n.data.category === "trigger")?.data.typeId ?? null,
            connected_apps: [...new Set(connectedApps)],
          }),
        });
        setLastSaved(new Date());
        setIsDirty(false);
      } else {
        // localStorage fallback
        localStorage.setItem("adviza_current_workflow", JSON.stringify({ name: workflowName, nodes, edges, savedAt: new Date().toISOString() }));
      }
      setSaveSuccessToast("Workflow saved successfully.");
      setTimeout(() => setSaveSuccessToast(null), 2500);
    } catch {
      setSaveSuccessToast("Save failed — check your connection.");
      setTimeout(() => setSaveSuccessToast(null), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Run via API ──────────────────────────────────────────────────────────
  const handleRunWorkflow = async () => {
    if (!workflowId) return;
    setIsRunning(true);
    setRunLogs([]);
    setIsSimulatorOpen(true);

    // First save current state
    await handleSaveWorkflow();

    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Run failed");
      setRunLogs(data.run?.logs ?? []);
      setSaveSuccessToast(`✅ Run complete — ${data.run?.logs?.length ?? 0} steps`);
      setTimeout(() => setSaveSuccessToast(null), 3000);
    } catch (err: any) {
      setRunLogs([{ timestamp: new Date().toISOString(), nodeId: "system", nodeLabel: "System", level: "error", message: err.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  // ─── Export/Import ─────────────────────────────────────────────────────────
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ version: "1.0", name: workflowName, exportedAt: new Date().toISOString(), nodes, edges }, null, 2)
    );
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `${workflowName.toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (Array.isArray(json.nodes) && Array.isArray(json.edges)) {
          setNodes(json.nodes);
          setEdges(json.edges);
          if (json.name) setWorkflowName(json.name);
          setSelectedNodeId(null);
        }
      } catch {
        alert("Invalid workflow JSON file format");
      }
    };
    reader.readAsText(file);
  };

  // ─── AI Generation ─────────────────────────────────────────────────────────
  const handleGenerateWorkflow = async (promptOverride?: string) => {
    const targetPrompt = promptOverride || aiPrompt;
    if (!targetPrompt?.trim()) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/workflow-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt.trim() }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (data?.workflow) {
        const genWf = data.workflow;
        setWorkflowName(genWf.name ?? "AI Generated Workflow");
        setNodes(genWf.nodes ?? []);
        setEdges(genWf.edges ?? []);
        setSelectedNodeId(genWf.nodes?.[0]?.id ?? null);
        setIsAiModalOpen(false);
        setAiPrompt("");
        setIsDirty(true);

        try {
          localStorage.setItem("adviza_current_workflow", JSON.stringify({
            id: workflowId,
            name: genWf.name,
            nodes: genWf.nodes,
            edges: genWf.edges
          }));
        } catch {}

        if (workflowId && workflowId !== "local") {
          fetch(`/api/workflows/${workflowId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: genWf.name,
              nodes: genWf.nodes,
              edges: genWf.edges,
              ai_generated: true,
              ai_prompt: targetPrompt.trim(),
            }),
          }).catch(() => {});
        }

        setSaveSuccessToast(`✨ Generated "${genWf.name}" with ${genWf.nodes?.length ?? 0} nodes!`);
        setTimeout(() => setSaveSuccessToast(null), 3500);
      }
    } catch {
      alert("Failed to generate workflow. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ─── Add Node ──────────────────────────────────────────────────────────────
  const handleAddNodeFromTemplate = (template: NodeTemplateDefinition, position?: { x: number; y: number }) => {
    const newNodeId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      position: position ?? { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: {
        label: template.label,
        subtitle: template.subtitle,
        category: template.category,
        typeId: template.typeId,
        iconName: template.iconName,
        color: template.color,
        badge: template.badge,
        config: { ...template.defaultConfig },
      },
      inputs: template.inputs,
      outputs: template.outputs,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNodeId);
  };

  const handleSelectTemplate = (tpl: WorkflowTemplate) => {
    setWorkflowName(tpl.name);
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setSelectedNodeId(null);
    setIsTemplateModalOpen(false);
  };

  const handleSimulate = () => {
    setIsSimulatorOpen(true);
    setIsExecuting(true);
    const logs: WorkflowExecutionLog[] = [];
    let i = 0;
    const sortedNodes = [...nodes];
    const interval = setInterval(() => {
      if (i >= sortedNodes.length) {
        clearInterval(interval);
        setIsExecuting(false);
        return;
      }
      const n = sortedNodes[i];
      logs.push({ timestamp: new Date().toISOString(), nodeId: n.id, nodeLabel: n.data.label, level: "success", message: `✅ Completed: ${n.data.label}` });
      setExecutionLogs([...logs]);
      i++;
    }, 600);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedNodeTemplate = selectedNode
    ? AVAILABLE_NODE_TEMPLATES.find((t) => t.typeId === selectedNode.data.typeId) ?? null
    : null;

  if (loadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        <p className="text-sm text-[#8E847C]">Loading workflow…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -mx-6 -mb-6 overflow-hidden">
      {/* ── Top Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-[#EADBCE] flex-shrink-0">
        {/* Back */}
        <Link
          href="/dashboard/workflows"
          className="flex items-center gap-1.5 text-xs text-[#8E847C] hover:text-[#121217] transition-colors mr-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Workflows
        </Link>

        {/* Name */}
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="text-sm font-semibold text-[#121217] bg-transparent border-none outline-none focus:bg-[#F7F3EE] px-2 py-1 rounded-lg transition-colors flex-1 min-w-0 max-w-xs"
        />

        {/* Save indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {isSaving ? (
            <span className="flex items-center gap-1 text-amber-600"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>
          ) : isDirty ? (
            <span className="flex items-center gap-1 text-[#8E847C]"><AlertCircle className="w-3 h-3" /> Unsaved</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>

        <div className="flex-1" />

        {/* Connector status summary */}
        {!connectionsLoading && (
          <div className="hidden md:flex items-center gap-2 text-xs text-[#9E978F]">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Connectors live</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <ToolbarBtn onClick={() => setIsAiModalOpen(true)} icon={<Sparkles className="w-3.5 h-3.5" />} label="Generate" gradient />
          <ToolbarBtn onClick={() => setIsTemplateModalOpen(true)} icon={<FolderOpen className="w-3.5 h-3.5" />} label="Templates" />
          <ToolbarBtn onClick={handleExportJSON} icon={<Download className="w-3.5 h-3.5" />} label="Export" />
          <ToolbarBtn onClick={() => fileInputRef.current?.click()} icon={<Upload className="w-3.5 h-3.5" />} label="Import" />
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          <ToolbarBtn onClick={handleSaveWorkflow} loading={isSaving} icon={<Save className="w-3.5 h-3.5" />} label="Save" />
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning || nodes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? "Running…" : "Run"}
          </button>
        </div>
      </div>

      {/* ── Canvas Area ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Palette */}
        <WorkflowPalette
          templates={AVAILABLE_NODE_TEMPLATES}
          onAddNode={(tpl: NodeTemplateDefinition) => handleAddNodeFromTemplate(tpl)}
          isConnected={isConnected}
        />

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedNodeIds={selectedNodeIds}
            onSelectNode={setSelectedNodeId}
            onSelectNodes={setSelectedNodeIds}
            onUpdateNodes={setNodes}
            onUpdateEdges={setEdges}
            onAddNodeFromTemplate={(tpl, pos) => handleAddNodeFromTemplate(tpl, pos)}
            onDeleteNode={(nodeId) => {
              setNodes((prev) => prev.filter((n) => n.id !== nodeId));
              setEdges((prev) => prev.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
              if (selectedNodeId === nodeId) setSelectedNodeId(null);
              setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
            }}
            onDeleteNodes={(nodeIds) => {
              setNodes((prev) => prev.filter((n) => !nodeIds.includes(n.id)));
              setEdges((prev) => prev.filter((e) => !nodeIds.includes(e.sourceNodeId) && !nodeIds.includes(e.targetNodeId)));
              setSelectedNodeId(null);
              setSelectedNodeIds([]);
            }}
            onDuplicateNode={(nodeId) => {
              const source = nodes.find((n) => n.id === nodeId);
              if (!source) return;
              const cloned: WorkflowNode = {
                ...source,
                id: `node-${Date.now()}`,
                position: { x: source.position.x + 40, y: source.position.y + 40 },
              };
              setNodes((prev) => [...prev, cloned]);
              setSelectedNodeId(cloned.id);
              setSelectedNodeIds([cloned.id]);
            }}
            onDuplicateNodes={(nodeIds) => {
              const selectedNodes = nodes.filter((n) => nodeIds.includes(n.id));
              const idMap = new Map<string, string>();
              const newNodes: WorkflowNode[] = [];

              selectedNodes.forEach((node) => {
                const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
                idMap.set(node.id, newId);
                newNodes.push({
                  ...node,
                  id: newId,
                  position: { x: node.position.x + 40, y: node.position.y + 40 },
                  inputs: node.inputs.map((p) => ({ ...p, id: `${newId}-${p.id.split("-").pop()}` })),
                  outputs: node.outputs.map((p) => ({ ...p, id: `${newId}-${p.id.split("-").pop()}` })),
                });
              });

              const internalEdges = edges.filter(
                (e) => nodeIds.includes(e.sourceNodeId) && nodeIds.includes(e.targetNodeId)
              );

              const newEdges: WorkflowEdge[] = internalEdges.map((e) => {
                const newSource = idMap.get(e.sourceNodeId)!;
                const newTarget = idMap.get(e.targetNodeId)!;
                return {
                  ...e,
                  id: `edge-${newSource}-${newTarget}-${Date.now()}`,
                  sourceNodeId: newSource,
                  targetNodeId: newTarget,
                };
              });

              setNodes((prev) => [...prev, ...newNodes]);
              setEdges((prev) => [...prev, ...newEdges]);
              setSelectedNodeIds(newNodes.map((n) => n.id));
              setSelectedNodeId(newNodes[newNodes.length - 1]?.id ?? null);
            }}
          />
        </div>

        {/* Right Properties Panel */}
        {selectedNode && (
          <WorkflowProperties
            node={selectedNode}
            template={selectedNodeTemplate}
            isConnected={isConnected}
            onConfigChange={(key, val) => {
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === selectedNode.id
                    ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: val } } }
                    : n
                )
              );
            }}
            onClose={() => setSelectedNodeId(null)}
            onDelete={() => {
              setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
              setEdges((prev) => prev.filter((e) => e.sourceNodeId !== selectedNode.id && e.targetNodeId !== selectedNode.id));
              setSelectedNodeId(null);
            }}
          />
        )}
      </div>

      {/* ── Simulator / Log Drawer ─────────────────────────────────────────── */}
      {isSimulatorOpen && (
        <div className="absolute bottom-0 left-0 right-0 h-72 z-30 bg-[#0F0D0B] border-t border-[#2A2520] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A2520]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Execution Log
              {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 ml-1" />}
            </div>
            <button onClick={() => setIsSimulatorOpen(false)} className="text-[#6B6460] hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 font-mono text-xs">
            {runLogs.length === 0 && !isRunning && (
              <div className="text-[#6B6460]">No logs yet. Run the workflow to see execution output.</div>
            )}
            {runLogs.map((log, i) => (
              <div key={i} className={cn(
                "flex items-start gap-2",
                log.level === "error" ? "text-rose-400" :
                log.level === "warn" ? "text-amber-400" :
                log.level === "success" ? "text-emerald-400" :
                "text-[#B0A89F]"
              )}>
                <span className="text-[#4A4540] flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-[#8E847C] flex-shrink-0">[{log.nodeLabel}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {saveSuccessToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#121217] text-white text-xs font-medium px-5 py-3 rounded-2xl shadow-2xl border border-white/10 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          {saveSuccessToast}
        </div>
      )}

      {/* ── Template Modal ─────────────────────────────────────────────────── */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-[#EADBCE] overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#EADBCE]">
              <h3 className="font-heading font-bold text-[#121217]">Load a Template</h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-1.5 rounded-xl hover:bg-[#F7F3EE] text-[#8E847C] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-7">
              {PREBUILT_WORKFLOW_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="text-left bg-[#F7F3EE] border border-[#EADBCE] rounded-2xl p-5 hover:border-violet-300 hover:bg-violet-50 transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                    {tpl.category}
                  </span>
                  <h4 className="font-semibold text-xs text-[#121217] mt-2">{tpl.name}</h4>
                  <p className="text-[11px] text-[#645F5A] mt-1">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Generate Modal ──────────────────────────────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-[#EADBCE]">
            <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-violet-50 to-rose-50 border-b border-[#EADBCE] rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#121217]">AI Workflow Generator</h3>
                  <p className="text-xs text-[#7A726A]">Describe your automation in plain English</p>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="ml-auto p-1.5 rounded-xl hover:bg-white/70 text-[#8E847C] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-7 space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerateWorkflow(); }}
                placeholder={SAMPLE_PROMPTS[0]}
                rows={4}
                className="w-full px-4 py-3 text-sm border border-[#EADBCE] rounded-xl bg-white text-[#121217] placeholder:text-[#C5BDB6] focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              />
              <div className="space-y-1.5">
                {SAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(p)}
                    className="w-full text-left text-xs text-[#5A544E] bg-[#F7F3EE] hover:bg-violet-50 hover:text-violet-700 px-3 py-2 rounded-lg border border-[#EADBCE] hover:border-violet-200 transition-all cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleGenerateWorkflow()}
                disabled={isGeneratingAI || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-rose-500 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingAI ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Send className="w-4 h-4" /> Generate Workflow</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toolbar Button ────────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  icon,
  label,
  gradient,
  loading,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  gradient?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer",
        gradient
          ? "bg-gradient-to-r from-violet-500 to-rose-400 text-white border-transparent shadow-sm hover:shadow"
          : "bg-white border-[#EADBCE] text-[#5A544E] hover:bg-[#F7F3EE] hover:border-[#D5C9BC]"
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}
