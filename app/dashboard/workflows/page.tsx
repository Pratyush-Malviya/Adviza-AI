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
  Plus,
  Wand2,
  Loader2,
  Send,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_PROMPTS = [
  "When a client portfolio drifts by > 5%, run risk audit, require advisor sign-off, and dispatch Inngest rebalance",
  "After client meeting audio upload, extract commitments with Claude, run FINRA/SEC compliance check, and sync tasks to Salesforce",
  "60 minutes before Google Calendar review meeting, generate executive briefing memo and sync prep note to CRM",
  "Inbound webhook for High Net Worth lead, audit KYC requirements, and send automated welcome follow-up email via Resend"
];

export default function WorkflowsPage() {
  // Workflow State
  const [workflowName, setWorkflowName] = useState("Pre-Meeting Executive Briefing Pipeline");
  const [nodes, setNodes] = useState<WorkflowNode[]>(PREBUILT_WORKFLOW_TEMPLATES[0].nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(PREBUILT_WORKFLOW_TEMPLATES[0].edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // UI Drawer states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<WorkflowExecutionLog[]>([]);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

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
      setSaveSuccessToast("Workflow pipeline successfully saved to local vault.");
      setTimeout(() => setSaveSuccessToast(null), 2500);
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

  // AI Workflow Generator Handler
  const handleGenerateWorkflow = async (promptOverride?: string) => {
    const targetPrompt = promptOverride || aiPrompt;
    if (!targetPrompt || targetPrompt.trim().length === 0) return;

    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/ai/workflow-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workflow via AI");
      }

      const data = await response.json();
      if (data?.workflow) {
        setWorkflowName(data.workflow.name || "AI Generated Workflow");
        setNodes(data.workflow.nodes || []);
        setEdges(data.workflow.edges || []);
        setSelectedNodeId(data.workflow.nodes?.[0]?.id || null);
        setIsAiModalOpen(false);
        setAiPrompt("");
        setSaveSuccessToast(`✨ Generated "${data.workflow.name}" with ${data.workflow.nodes?.length} nodes!`);
        setTimeout(() => setSaveSuccessToast(null), 3500);
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("Failed to generate workflow. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
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
        outputSnippet = JSON.stringify({ event: "Trigger_Activated", client: "David & Sarah Henderson", portfolio_value: "$4,250,000" }, null, 2);
      } else if (node.data.category === "agent") {
        outputSnippet = `Intelligence Memo:\n- Client Sentiment: High alignment\n- Strategy: Tax-loss harvesting & municipal re-allocation\n- Compliance: Fiduciary certified`;
      } else if (node.data.category === "logic") {
        outputSnippet = `Fiduciary Advisor Signature Verified: Cryptographic Hash #9fa4c-8821d`;
      } else if (node.data.category === "action") {
        outputSnippet = `Dispatched action step & synced to CRM (Status: 200 OK)`;
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
              className="font-bold text-sm text-[#121217] bg-transparent hover:bg-[#FAF5F0] focus:bg-white px-2 py-1 rounded-lg border border-transparent hover:border-[#EADBCE] focus:border-rose-400 focus:outline-none transition max-w-[240px] sm:max-w-md truncate"
            />
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-flex">
              Active Pipeline
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* AI Workflow Generator Trigger */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            <span className="hidden sm:inline">Generate with AI</span>
          </button>

          {/* Prebuilt Templates Modal Trigger */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#645F5A] hover:text-[#121217] bg-[#FAF5F0] hover:bg-[#EADBCE]/60 border border-[#EADBCE] rounded-xl transition shadow-xs cursor-pointer"
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
            className="p-1.5 text-[#645F5A] hover:text-[#121217] bg-[#FAF5F0] hover:bg-[#EADBCE]/60 border border-[#EADBCE] rounded-xl transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            title="Export JSON"
            className="p-1.5 text-[#645F5A] hover:text-[#121217] bg-[#FAF5F0] hover:bg-[#EADBCE]/60 border border-[#EADBCE] rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Save Workflow */}
          <button
            onClick={handleSaveWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#121217] bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] rounded-xl shadow-xs transition cursor-pointer"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition transform active:scale-95 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Pipeline</span>
          </button>
        </div>
      </header>

      {/* AI Natural Language Prompt Header Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#EADBCE] px-4 py-2.5 flex flex-col md:flex-row items-stretch md:items-center gap-3 z-10 shrink-0">
        <div className="flex items-center gap-2 text-violet-700 font-semibold text-xs shrink-0">
          <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center">
            <Wand2 className="w-3 h-3 text-violet-600" />
          </div>
          <span className="hidden lg:inline">AI Builder:</span>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateWorkflow();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to automate (e.g. 'When portfolio drifts > 5%, request advisor sign-off and dispatch Inngest rebalance')..."
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-[#FAF5F0]/80 hover:bg-white focus:bg-white border border-[#EADBCE] focus:border-violet-500 rounded-xl focus:outline-none transition placeholder:text-[#8E847C]"
            />
            {aiPrompt && (
              <button
                type="button"
                onClick={() => setAiPrompt("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E847C] hover:text-[#121217] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isGeneratingAI || !aiPrompt.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Chip */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#8E847C] shrink-0">
          <span>Try:</span>
          <button
            onClick={() => handleGenerateWorkflow(SAMPLE_PROMPTS[0])}
            className="px-2 py-0.5 bg-[#FAF5F0] hover:bg-violet-50 hover:text-violet-700 border border-[#EADBCE] rounded-lg transition text-left truncate max-w-[200px] cursor-pointer"
          >
            Portfolio Drift Rebalance
          </button>
          <button
            onClick={() => handleGenerateWorkflow(SAMPLE_PROMPTS[1])}
            className="px-2 py-0.5 bg-[#FAF5F0] hover:bg-violet-50 hover:text-violet-700 border border-[#EADBCE] rounded-lg transition text-left truncate max-w-[200px] cursor-pointer"
          >
            Post-Meeting Compliance
          </button>
        </div>
      </div>

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

      {/* Save / AI Success Toast */}
      {saveSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#121217] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {saveSuccessToast}
        </div>
      )}

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#EADBCE] shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#121217]">
                    AI Workflow Generator
                  </h3>
                  <p className="text-[11px] text-[#8E847C]">
                    Describe your automated pipeline and AI will construct the full node graph.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-[#8E847C] hover:text-[#121217] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#121217]">
                What should this workflow do?
              </label>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: When an upcoming meeting is 1 hour away, trigger the briefing agent to pull portfolio data, check open action items, require advisor sign-off, and update Salesforce CRM..."
                className="w-full p-3 text-xs bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none placeholder:text-[#8E847C]"
              />
            </div>

            {/* Prompt Inspiration Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#8E847C]">
                Suggested Prompts:
              </span>
              <div className="space-y-1.5">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(sample)}
                    className="w-full text-left p-2 rounded-xl text-xs bg-[#FAF5F0] hover:bg-violet-50 hover:text-violet-900 border border-[#EADBCE] hover:border-violet-300 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate pr-2">{sample}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8E847C] group-hover:text-violet-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADBCE]">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#645F5A] hover:bg-[#FAF5F0] border border-[#EADBCE] rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => handleGenerateWorkflow()}
                disabled={isGeneratingAI || !aiPrompt.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Nodes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate & Build Canvas</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
                className="p-1 text-[#8E847C] hover:text-[#121217] rounded-lg cursor-pointer"
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
                      className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition cursor-pointer"
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
