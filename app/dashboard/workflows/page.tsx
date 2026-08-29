"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  WorkflowNode,
  WorkflowEdge,
  NodeTemplateDefinition,
  WorkflowTemplate,
  WorkflowExecutionLog
} from "@/types/workflow";
import { WorkflowPalette } from "@/components/workflows/workflow-palette";
import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";
import { WorkflowProperties } from "@/components/workflows/workflow-properties";
import { WorkflowSimulator } from "@/components/workflows/workflow-simulator";
import {
  PREBUILT_WORKFLOW_TEMPLATES,
  AVAILABLE_NODE_TEMPLATES
} from "@/components/workflows/workflow-templates";
import {
  Play,
  Save,
  Download,
  Upload,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
  FolderOpen,
  X,
  FileCode2,
  Share2,
  Workflow,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkflowsPage() {
  // Workflow State
  const [workflowName, setWorkflowName] = useState("Pre-Meeting Executive Briefing Pipeline");
  const [nodes, setNodes] = useState<WorkflowNode[]>(PREBUILT_WORKFLOW_TEMPLATES[0].nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(PREBUILT_WORKFLOW_TEMPLATES[0].edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // UI Drawer states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<WorkflowExecutionLog[]>([]);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount if saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adviza_current_workflow");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          if (parsed.name) setWorkflowName(parsed.name);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  // Save to localStorage
  const handleSaveWorkflow = () => {
    try {
      const payload = {
        name: workflowName,
        nodes,
        edges,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("adviza_current_workflow", JSON.stringify(payload));
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Export Workflow JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          version: "1.0",
          name: workflowName,
          exportedAt: new Date().toISOString(),
          nodes,
          edges,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${workflowName.toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Workflow JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.nodes) && Array.isArray(json.edges)) {
          setNodes(json.nodes);
          setEdges(json.edges);
          if (json.name) setWorkflowName(json.name);
          setSelectedNodeId(null);
        }
      } catch (err) {
        alert("Invalid workflow JSON file format");
      }
    };
    reader.readAsText(file);
  };

  // Add node from template
  const handleAddNodeFromTemplate = (template: NodeTemplateDefinition, position?: { x: number; y: number }) => {
    const newNodeId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      position: position || {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
      },
      data: {
        label: template.label,
        subtitle: template.subtitle,
        category: template.category,
        typeId: template.typeId,
        iconName: template.iconName,
        color: template.color,
        badge: template.badge,
        config: { ...template.defaultConfig },
        status: "idle",
      },
      inputs: template.inputs.map((p) => ({ ...p, id: `${newNodeId}-${p.id}` })),
      outputs: template.outputs.map((p) => ({ ...p, id: `${newNodeId}-${p.id}` })),
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNodeId);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Duplicate node
  const handleDuplicateNode = (nodeId: string) => {
    const original = nodes.find((n) => n.id === nodeId);
    if (!original) return;

    const dupId = `node-${Date.now()}`;
    const dupNode: WorkflowNode = {
      ...original,
      id: dupId,
      position: {
        x: original.position.x + 30,
        y: original.position.y + 30,
      },
      data: {
        ...original.data,
        label: `${original.data.label} (Copy)`,
        status: "idle",
      },
      inputs: original.inputs.map((p) => ({ ...p, id: `${dupId}-${p.id.split("-").pop()}` })),
      outputs: original.outputs.map((p) => ({ ...p, id: `${dupId}-${p.id.split("-").pop()}` })),
    };

    setNodes((prev) => [...prev, dupNode]);
    setSelectedNodeId(dupId);
  };

  // Update Node Config
  const handleUpdateNodeConfig = (nodeId: string, updatedConfig: Record<string, any>) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                config: updatedConfig,
              },
            }
          : n
      )
    );
  };

  // Load Template
  const handleSelectTemplate = (tpl: WorkflowTemplate) => {
    setWorkflowName(tpl.name);
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setSelectedNodeId(null);
    setIsTemplateModalOpen(false);
  };

  // Simulation execution engine
  const handleStartSimulation = async () => {
    if (nodes.length === 0) return;
    setIsSimulatorOpen(true);
    setIsExecuting(true);
    setExecutionLogs([]);

    // Reset node statuses
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle", executionOutput: undefined },
      }))
    );

    const now = () => new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Step through nodes in topological or sequential order
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Mark Running
      setNodes((prev) =>
        prev.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: "running" } } : n
        )
      );

      setExecutionLogs((prev) => [
        ...prev,
        {
          timestamp: now(),
          nodeId: node.id,
          nodeLabel: node.data.label,
          level: "info",
          message: `Executing ${node.data.label}...`,
        },
      ]);

      // Delay for realistic processing
      await new Promise((r) => setTimeout(r, 900));

      // Generated Mock output based on category
      let outputSnippet = `Success: Output generated for ${node.data.label}`;
      if (node.data.category === "trigger") {
        outputSnippet = JSON.stringify({ event: "Calendar_Meeting_Scheduled", client: "David & Sarah Henderson", portfolio_value: "$4,250,000" }, null, 2);
      } else if (node.data.category === "agent") {
        outputSnippet = `Executive Briefing Memo:\n- Client Sentiment: Highly receptive to tax-loss harvesting\n- Key Goal: Estate transfer to children\n- Compliance Guardrail: Fiduciary verified`;
      } else if (node.data.category === "logic") {
        outputSnippet = `Fiduciary Advisor Signature Verified: Cryptographic Hash #9fa4c-8821d`;
      } else if (node.data.category === "action") {
        outputSnippet = `Synced to Salesforce FSC & Dispatched Resend Email (Message ID: #msg_88294a)`;
      }

      // Mark Success
      setNodes((prev) =>
        prev.map((n) =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: "success",
                  executionDurationMs: 420 + Math.round(Math.random() * 300),
                  executionOutput: outputSnippet,
                },
              }
            : n
        )
      );

      setExecutionLogs((prev) => [
        ...prev,
        {
          timestamp: now(),
          nodeId: node.id,
          nodeLabel: node.data.label,
          level: "success",
          message: `Completed successfully (${Math.round(400 + Math.random() * 200)}ms)`,
          payload: outputSnippet,
        },
      ]);
    }

    setIsExecuting(false);
  };

  const handleResetSimulation = () => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle", executionOutput: undefined },
      }))
    );
    setExecutionLogs([]);
    setIsExecuting(false);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-[#FAF5F0]">
      {/* Top Workflow Builder Toolbar */}
      <header className="h-14 border-b border-[#EADBCE] bg-white/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Title & Workflow Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
            <Workflow className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="font-bold text-sm text-[#121217] bg-transparent hover:bg-[#FAF5F0] focus:bg-white px-2 py-1 rounded-lg border border-transparent hover:border-[#EADBCE] focus:border-rose-400 focus:outline-none transition max-w-[280px] sm:max-w-md truncate"
            />
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-flex">
              Active Pipeline
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Prebuilt Templates Modal Trigger */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#645F5A] hover:text-[#121217] bg-[#FAF5F0] hover:bg-[#EADBCE]/60 border border-[#EADBCE] rounded-xl transition shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
            className="p-1.5 text-[#645F5A] hover:text-[#121217] bg-[#FAF5F0] hover:bg-[#EADBCE]/60 border border-[#EADBCE] rounded-xl transition"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            title="Export JSON"
            className="p-1.5 text-[#645F5A] hover:text-[#121217] bg-[#FAF5F0] hover:bg-[#EADBCE]/60 border border-[#EADBCE] rounded-xl transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Save Workflow */}
          <button
            onClick={handleSaveWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#121217] bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] rounded-xl shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5 text-violet-600" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Test & Run Simulation */}
          <button
            onClick={() => {
              setIsSimulatorOpen(true);
              handleStartSimulation();
            }}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition transform active:scale-95 disabled:opacity-60"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Pipeline</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area with 3-Column Layout */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Left Palette */}
        <WorkflowPalette onAddNode={handleAddNodeFromTemplate} />

        {/* Center Canvas */}
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodes={setNodes}
          onUpdateEdges={setEdges}
          onAddNodeFromTemplate={handleAddNodeFromTemplate}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
        />

        {/* Right Properties Drawer */}
        {selectedNode && (
          <WorkflowProperties
            node={selectedNode}
            onUpdateNodeConfig={handleUpdateNodeConfig}
            onClose={() => setSelectedNodeId(null)}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
          />
        )}

        {/* Bottom Simulator Panel */}
        {isSimulatorOpen && (
          <WorkflowSimulator
            nodes={nodes}
            isExecuting={isExecuting}
            logs={executionLogs}
            onStartSimulation={handleStartSimulation}
            onResetSimulation={handleResetSimulation}
            onClose={() => setIsSimulatorOpen(false)}
          />
        )}
      </div>

      {/* Save Success Toast */}
      {saveSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#121217] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Workflow pipeline successfully saved to local vault.
        </div>
      )}

      {/* Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#EADBCE] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-sm text-[#121217]">
                  Pre-Built Wealth Management Templates
                </h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 text-[#8E847C] hover:text-[#121217] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {PREBUILT_WORKFLOW_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl border border-[#EADBCE] hover:border-rose-300 hover:shadow-md transition bg-[#FAF5F0]/60 hover:bg-white flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                        {tpl.category}
                      </span>
                      <span className="text-[11px] text-[#8E847C] font-mono">
                        {tpl.nodes.length} Nodes • {tpl.edges.length} Connections
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-[#121217]">{tpl.name}</h4>
                    <p className="text-[11px] text-[#645F5A] mt-1">{tpl.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {tpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] bg-white border border-[#EADBCE] text-[#8E847C] px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSelectTemplate(tpl)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition"
                    >
                      Load Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
