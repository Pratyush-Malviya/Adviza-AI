"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Workflow,
  Plus,
  Wand2,
  Search,
  Loader2,
  Send,
  LayoutGrid,
  List,
  Play,
  Copy,
  Archive,
  Pencil,
  Clock,
  Zap,
  Calendar,
  Globe,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus = "draft" | "active" | "paused" | "archived";

interface WorkflowSummary {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  trigger_type: string | null;
  connected_apps: string[];
  ai_generated: boolean;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; icon: React.ReactNode; className: string }> = {
  draft: {
    label: "Draft",
    icon: <Pencil className="w-3 h-3" />,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  active: {
    label: "Active",
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  paused: {
    label: "Paused",
    icon: <PauseCircle className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  archived: {
    label: "Archived",
    icon: <Archive className="w-3 h-3" />,
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  "trigger-calendar": <Calendar className="w-3.5 h-3.5 text-blue-500" />,
  "trigger-webhook": <Globe className="w-3.5 h-3.5 text-purple-500" />,
  "trigger-portfolio-drift": <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  "trigger-audio-upload": <Zap className="w-3.5 h-3.5 text-pink-500" />,
  "trigger-schedule": <Clock className="w-3.5 h-3.5 text-teal-500" />,
};

const APP_COLORS: Record<string, string> = {
  salesforce: "#00A1E0",
  hubspot: "#FF7A59",
  gmail: "#EA4335",
  outlook: "#0078D4",
  slack: "#4A154B",
  googlecalendar: "#4285F4",
  wealthbox: "#2D6CDF",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SAMPLE_PROMPTS = [
  "When a client portfolio drifts by >5%, run risk audit and dispatch rebalance job",
  "After meeting audio upload, extract commitments and sync to Salesforce",
  "60 mins before Google Calendar review meeting, generate executive briefing",
  "Inbound HNW lead webhook → audit KYC and send welcome email",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkflowsLibraryPage() {
  const router = useRouter();

  // State
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [runningId, setRunningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // AI modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  // Cycle sample prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt((p) => (p + 1) % SAMPLE_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Local Storage Helper ──────────────────────────────────────────────────
  const syncLocalWorkflows = (updateFn: (prev: WorkflowSummary[]) => WorkflowSummary[]) => {
    try {
      const raw = localStorage.getItem("adviza_saved_workflows");
      const current: WorkflowSummary[] = raw ? JSON.parse(raw) : [];
      const next = updateFn(current);
      localStorage.setItem("adviza_saved_workflows", JSON.stringify(next));
      return next;
    } catch {
      return [];
    }
  };

  // ─── Fetch workflows ─────────────────────────────────────────────────────────
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Read local storage workflows
      let localWfs: WorkflowSummary[] = [];
      try {
        const raw = localStorage.getItem("adviza_saved_workflows");
        if (raw) localWfs = JSON.parse(raw);
      } catch {}

      // 2. Fetch DB workflows
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/workflows?${params}`);
      const data = res.ok ? await res.json() : { workflows: [] };
      const dbWfs: WorkflowSummary[] = Array.isArray(data.workflows) ? data.workflows : [];

      // 3. Merge: deduplicate by id, DB takes priority
      const map = new Map<string, WorkflowSummary>();
      localWfs.forEach((wf) => { if (wf && wf.id) map.set(wf.id, wf); });
      dbWfs.forEach((wf) => { if (wf && wf.id) map.set(wf.id, wf); });

      const allMerged = Array.from(map.values()).sort(
        (a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
      );

      // Keep local storage up to date with merged set
      try {
        localStorage.setItem("adviza_saved_workflows", JSON.stringify(allMerged));
      } catch {}

      // Apply client-side filter
      const filteredList = allMerged.filter((wf) => {
        if (statusFilter !== "all" && wf.status !== statusFilter) return false;
        if (search && !wf.name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });

      setWorkflows(filteredList);
    } catch {
      try {
        const raw = localStorage.getItem("adviza_saved_workflows");
        if (raw) {
          const list: WorkflowSummary[] = JSON.parse(raw);
          setWorkflows(list);
        }
      } catch {
        setWorkflows([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchWorkflows(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchWorkflows, search]);

  // ─── Create blank workflow ───────────────────────────────────────────────────
  const handleNewWorkflow = async () => {
    const newId = `wf_${Date.now()}`;
    const newWf: WorkflowSummary = {
      id: newId,
      name: "Untitled Workflow",
      description: "Custom visual automation pipeline",
      status: "draft",
      trigger_type: null,
      connected_apps: [],
      ai_generated: false,
      last_run_at: null,
      run_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    syncLocalWorkflows((prev) => [newWf, ...prev]);

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Workflow" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.workflow?.id) {
          router.push(`/dashboard/workflows/${data.workflow.id}`);
          return;
        }
      }
    } catch {}

    router.push(`/dashboard/workflows/${newId}`);
  };

  // ─── AI Enhance Prompt ────────────────────────────────────────────────────────
  const handleEnhancePrompt = async (customPrompt?: string) => {
    const promptToEnhance = (customPrompt || aiPrompt).trim();
    if (!promptToEnhance) return;
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/ai/workflow-enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToEnhance }),
      });
      if (!res.ok) throw new Error("Enhancement failed");
      const data = await res.json();
      if (data?.enhancedPrompt) {
        setAiPrompt(data.enhancedPrompt);
        showToast("success", "✨ Prompt enhanced with fiduciary & connector details!");
      }
    } catch {
      showToast("error", "Failed to enhance prompt. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // ─── AI Generate + Save ──────────────────────────────────────────────────────
  const handleGenerateAndSave = async (promptOverride?: string) => {
    const promptToUse = (promptOverride || aiPrompt).trim();
    if (!promptToUse) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/workflow-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (!data?.workflow) throw new Error("No workflow returned");

      const generatedWf = data.workflow;
      const wfId = `wf_${Date.now()}`;

      const newWorkflowItem: WorkflowSummary = {
        id: wfId,
        name: generatedWf.name || "AI Generated Workflow",
        description: generatedWf.description || `Generated for: "${promptToUse}"`,
        status: "draft",
        trigger_type: generatedWf.nodes?.[0]?.data?.typeId ?? null,
        connected_apps: [],
        ai_generated: true,
        last_run_at: null,
        run_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Immediately write to full list cache in localStorage
      syncLocalWorkflows((prev) => [newWorkflowItem, ...prev]);

      // 2. Also save full nodes/edges for immediate canvas loading
      try {
        localStorage.setItem("adviza_current_workflow", JSON.stringify({
          id: wfId,
          name: generatedWf.name,
          nodes: generatedWf.nodes,
          edges: generatedWf.edges,
          ai_generated: true,
          ai_prompt: promptToUse,
        }));
      } catch {}

      // 3. Save to DB
      let finalId = wfId;
      try {
        const saveRes = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: generatedWf.name ?? "AI Generated Workflow",
            description: generatedWf.description ?? `Generated for: "${promptToUse}"`,
            nodes: generatedWf.nodes ?? [],
            edges: generatedWf.edges ?? [],
            ai_generated: true,
            ai_prompt: promptToUse,
            trigger_type: generatedWf.nodes?.[0]?.data?.typeId ?? null,
            connected_apps: [],
          }),
        });

        if (saveRes.ok) {
          const saved = await saveRes.json();
          if (saved?.workflow?.id) {
            finalId = saved.workflow.id;
            // Update local ID if DB created one
            syncLocalWorkflows((prev) =>
              prev.map((w) => (w.id === wfId ? { ...w, id: finalId } : w))
            );
            try {
              localStorage.setItem("adviza_current_workflow", JSON.stringify({
                id: finalId,
                name: generatedWf.name,
                nodes: generatedWf.nodes,
                edges: generatedWf.edges,
                ai_generated: true,
                ai_prompt: promptToUse,
              }));
            } catch {}
          }
        }
      } catch {}

      setIsAiModalOpen(false);
      setAiPrompt("");
      showToast("success", `✨ "${generatedWf.name}" generated with ${generatedWf.nodes?.length ?? 0} nodes!`);
      fetchWorkflows();
      router.push(`/dashboard/workflows/${finalId}`);
    } catch (err: any) {
      showToast("error", "AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Quick run a workflow ────────────────────────────────────────────────────
  const handleRun = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRunningId(id);
    try {
      const res = await fetch(`/api/workflows/${id}/run`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", `✅ Workflow executed — ${data.run?.logs?.length ?? 0} steps completed`);
      syncLocalWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, run_count: (w.run_count || 0) + 1, last_run_at: new Date().toISOString() } : w))
      );
      fetchWorkflows();
    } catch (err: any) {
      showToast("error", err.message ?? "Execution failed");
    } finally {
      setRunningId(null);
    }
  };

  // ─── Duplicate ───────────────────────────────────────────────────────────────
  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sourceWf = workflows.find((w) => w.id === id);
    const newId = `wf_${Date.now()}`;
    if (sourceWf) {
      const cloned: WorkflowSummary = {
        ...sourceWf,
        id: newId,
        name: `${sourceWf.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      syncLocalWorkflows((prev) => [cloned, ...prev]);
    }

    try {
      const res = await fetch(`/api/workflows/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch {}

    showToast("success", "Workflow duplicated");
    fetchWorkflows();
  };

  // ─── Archive / Delete ────────────────────────────────────────────────────────
  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    syncLocalWorkflows((prev) => prev.filter((w) => w.id !== id));
    try {
      await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    } catch {}
    showToast("success", "Workflow removed");
    fetchWorkflows();
  };

  // ─── Filter display ───────────────────────────────────────────────────────────
  const filtered = workflows;

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const totalRuns = workflows.reduce((sum, w) => sum + (w.run_count ?? 0), 0);
  const activeCount = workflows.filter((w) => w.status === "active").length;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7 animate-fade-in max-w-7xl mx-auto">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium transition-all animate-fade-in",
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          )}
        >
          {toast.message}
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EADBCE]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Workflow className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
              Workflows
            </h1>
          </div>
          <p className="text-sm text-[#7A726A] max-w-2xl">
            Create, manage, and run automated advisory pipelines. Connect AI agents, compliance checks, and your CRM in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleNewWorkflow}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#EADBCE] text-[#121217] text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Blank Canvas
          </button>
        </div>
      </div>

      {/* ── AI Prompt Hero Bar ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-900/90 via-indigo-900/90 to-purple-900/90 border border-violet-700/50 rounded-3xl p-6 sm:p-7 shadow-lg text-white relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-300 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold font-heading">Generate New Workflow with AI</h2>
          </div>
          <p className="text-xs sm:text-sm text-violet-200/90 max-w-2xl">
            Describe the workflow you need in plain English. Adviza AI will generate the nodes, wire the connectors, and configure execution parameters.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
            <div className="relative flex-1">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGenerating) handleGenerateAndSave();
                }}
                placeholder="e.g. When a client portfolio drifts by >5%, audit risk with SEC compliance, require advisor sign-off, and rebalance"
                className="w-full pl-4 pr-10 py-3.5 text-sm bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-2xl text-white placeholder:text-violet-200/60 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all backdrop-blur-sm"
              />
              {aiPrompt && (
                <button
                  onClick={() => setAiPrompt("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-200/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleEnhancePrompt()}
              disabled={isEnhancing || !aiPrompt.trim()}
              title="Enhance prompt with AI to make it more detailed and production-ready"
              className="flex items-center justify-center gap-1.5 px-4 py-3.5 bg-white/15 hover:bg-white/25 text-violet-100 hover:text-white font-semibold text-xs rounded-2xl border border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  Make Better ✨
                </>
              )}
            </button>

            <button
              onClick={() => handleGenerateAndSave()}
              disabled={isGenerating || !aiPrompt.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-400 hover:to-rose-400 text-white font-semibold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Workflow
                </>
              )}
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-violet-300/80">Suggestions:</span>
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setAiPrompt(prompt);
                  handleGenerateAndSave(prompt);
                }}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-violet-100 border border-white/10 hover:border-white/30 px-3 py-1 rounded-xl transition-all cursor-pointer truncate max-w-xs"
                title={prompt}
              >
                {prompt.slice(0, 48)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Workflows", value: workflows.length, icon: <Workflow className="w-4 h-4 text-violet-500" /> },
          { label: "Active Pipelines", value: activeCount, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
          { label: "Total Runs", value: totalRuns, icon: <Zap className="w-4 h-4 text-amber-500" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl px-5 py-4 border border-[#EADBCE] shadow-sm flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F7F3EE] flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-[#121217] font-heading">{stat.value}</div>
              <div className="text-xs text-[#8E847C]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter + View toggle ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 text-[#9E978F] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your workflows..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#EADBCE] rounded-xl bg-white text-[#121217] placeholder:text-[#9E978F] focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 text-[#9E978F] hover:text-[#121217]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          {["all", "active", "draft", "paused"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer capitalize",
                statusFilter === s
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white border-[#EADBCE] text-[#5A544E] hover:border-violet-300"
              )}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}

          {/* View toggle */}
          <div className="flex items-center bg-[#F7F3EE] rounded-lg p-1 border border-[#EADBCE]">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-md transition-all cursor-pointer", viewMode === "grid" ? "bg-white shadow-sm text-violet-600" : "text-[#8E847C]")}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md transition-all cursor-pointer", viewMode === "list" ? "bg-white shadow-sm text-violet-600" : "text-[#8E847C]")}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Workflow List / Grid ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onNew={handleNewWorkflow} onAI={(prompt) => handleGenerateAndSave(prompt)} />
      ) : (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            : "flex flex-col gap-3"
        )}>
          {filtered.map((wf) => (
            <WorkflowCard
              key={wf.id}
              wf={wf}
              viewMode={viewMode}
              isRunning={runningId === wf.id}
              onOpen={() => router.push(`/dashboard/workflows/${wf.id}`)}
              onRun={(e) => handleRun(wf.id, e)}
              onDuplicate={(e) => handleDuplicate(wf.id, e)}
              onArchive={(e) => handleArchive(wf.id, e)}
            />
          ))}
        </div>
      )}

      {/* ── AI Modal ──────────────────────────────────────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-[#EADBCE] overflow-hidden">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-violet-50 to-rose-50 border-b border-[#EADBCE]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#121217] text-base">AI Workflow Generator</h3>
                  <p className="text-xs text-[#7A726A]">Describe your automation in plain English</p>
                </div>
                <button
                  onClick={() => { setIsAiModalOpen(false); setAiPrompt(""); }}
                  className="ml-auto p-1.5 rounded-xl hover:bg-white/70 text-[#8E847C] cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-7 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#3D3731]">Describe your workflow</label>
                  <button
                    type="button"
                    onClick={() => handleEnhancePrompt()}
                    disabled={isEnhancing || !aiPrompt.trim()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 hover:text-violet-800 px-3 py-1 rounded-xl border border-violet-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Use AI to refine and expand this prompt with fiduciary logic and connectors"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                        <span>Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        <span>Make Prompt Better with AI ✨</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerateAndSave(); }}
                    placeholder={SAMPLE_PROMPTS[0]}
                    rows={4}
                    className="w-full px-4 py-3 text-sm border border-[#EADBCE] rounded-xl bg-white text-[#121217] placeholder:text-[#C5BDB6] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 resize-none"
                  />
                  {aiPrompt.trim() && (
                    <button
                      type="button"
                      onClick={() => handleEnhancePrompt()}
                      disabled={isEnhancing}
                      className="absolute right-3 bottom-3 p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs transition cursor-pointer"
                      title="Make prompt better with AI"
                    >
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Enhance</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#9E978F]">Tip: ⌘+Enter to generate quickly</p>
              </div>

              {/* Sample prompts */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-[#9E978F] uppercase tracking-wider">Try one of these</div>
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
                onClick={() => handleGenerateAndSave()}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-rose-500 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Send className="w-4 h-4" /> Generate & Save Workflow</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workflow Card ─────────────────────────────────────────────────────────────

function WorkflowCard({
  wf,
  viewMode,
  isRunning,
  onOpen,
  onRun,
  onDuplicate,
  onArchive,
}: {
  wf: WorkflowSummary;
  viewMode: "grid" | "list";
  isRunning: boolean;
  onOpen: () => void;
  onRun: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
}) {
  const statusCfg = STATUS_CONFIG[wf.status] ?? STATUS_CONFIG.draft;

  if (viewMode === "list") {
    return (
      <div
        onClick={onOpen}
        className="bg-white border border-[#EADBCE] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
          {TRIGGER_ICONS[wf.trigger_type ?? ""] ?? <Workflow className="w-4 h-4 text-violet-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-[#121217] truncate">{wf.name}</h3>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border", statusCfg.className)}>
              {statusCfg.icon} {statusCfg.label}
            </span>
            {wf.ai_generated && (
              <span className="text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
                ✨ AI
              </span>
            )}
          </div>
          <p className="text-xs text-[#8E847C] truncate">{wf.description ?? "No description"}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8E847C] flex-shrink-0">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{wf.run_count} runs</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(wf.last_run_at)}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton onClick={onRun} loading={isRunning} title="Run" icon={<Play className="w-3.5 h-3.5" />} />
          <ActionButton onClick={onDuplicate} title="Duplicate" icon={<Copy className="w-3.5 h-3.5" />} />
          <ActionButton onClick={onArchive} title="Archive" icon={<Archive className="w-3.5 h-3.5" />} danger />
        </div>
        <ChevronRight className="w-4 h-4 text-[#C5BDB6] group-hover:text-violet-400 transition-colors flex-shrink-0" />
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      className="bg-white border border-[#EADBCE] rounded-2xl p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
          {TRIGGER_ICONS[wf.trigger_type ?? ""] ?? <Workflow className="w-4 h-4 text-violet-400" />}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border", statusCfg.className)}>
            {statusCfg.icon} {statusCfg.label}
          </span>
          {wf.ai_generated && (
            <span className="text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
              ✨ AI
            </span>
          )}
        </div>
      </div>

      {/* Name + description */}
      <div>
        <h3 className="text-sm font-bold text-[#121217] leading-tight mb-1">{wf.name}</h3>
        <p className="text-xs text-[#8E847C] leading-relaxed line-clamp-2">
          {wf.description ?? "No description — click to edit"}
        </p>
      </div>

      {/* Connected apps */}
      {wf.connected_apps.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {wf.connected_apps.slice(0, 5).map((app) => (
            <span
              key={app}
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
              style={{
                backgroundColor: `${APP_COLORS[app] ?? "#6366F1"}18`,
                color: APP_COLORS[app] ?? "#6366F1",
                border: `1px solid ${APP_COLORS[app] ?? "#6366F1"}40`,
              }}
            >
              {app}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE2]">
        <div className="flex items-center gap-3 text-[11px] text-[#9E978F]">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{wf.run_count} runs</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(wf.last_run_at)}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton onClick={onRun} loading={isRunning} title="Run" icon={<Play className="w-3.5 h-3.5" />} />
          <ActionButton onClick={onDuplicate} title="Duplicate" icon={<Copy className="w-3.5 h-3.5" />} />
          <ActionButton onClick={onArchive} title="Archive" icon={<Archive className="w-3.5 h-3.5" />} danger />
        </div>
      </div>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionButton({
  onClick,
  title,
  icon,
  loading,
  danger,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={loading}
      className={cn(
        "p-1.5 rounded-lg border transition-all cursor-pointer text-xs",
        danger
          ? "border-rose-200 text-rose-500 hover:bg-rose-50"
          : "border-[#EADBCE] text-[#5A544E] hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200"
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  onNew,
  onAI,
}: {
  onNew: () => void;
  onAI: (prompt?: string) => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 px-4 text-center bg-white rounded-3xl border border-[#EADBCE] shadow-sm">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center mb-5 shadow-inner">
        <Workflow className="w-8 h-8 text-violet-500" />
      </div>
      <h3 className="text-lg font-bold text-[#121217] mb-2 font-heading">No workflows created yet</h3>
      <p className="text-sm text-[#8E847C] max-w-md mb-7">
        Generate your custom pipeline with natural language using the generator above, or start with a blank canvas.
      </p>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => onNew()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#EADBCE] text-[#121217] text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Blank Canvas
        </button>
      </div>

      <div className="w-full max-w-xl text-left bg-[#F7F3EE] p-5 rounded-2xl border border-[#EADBCE]">
        <p className="text-xs font-semibold text-[#5A544E] mb-2.5">💡 Quick AI Generation Ideas (Click to generate):</p>
        <div className="space-y-2">
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onAI(prompt)}
              className="w-full text-left text-xs bg-white hover:bg-violet-50 hover:text-violet-700 p-3 rounded-xl border border-[#EADBCE] hover:border-violet-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <span className="text-[#3D3731] group-hover:text-violet-700 font-medium">{prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9E978F] group-hover:text-violet-600 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
