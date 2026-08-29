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
import { PREBUILT_WORKFLOW_TEMPLATES } from "@/components/workflows/workflow-templates";

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

  // ─── Fetch workflows ─────────────────────────────────────────────────────────
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/workflows?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWorkflows(data.workflows ?? []);
    } catch {
      // On error (e.g. no Supabase), show nothing — no crash
      setWorkflows([]);
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
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Workflow" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const data = await res.json();
      router.push(`/dashboard/workflows/${data.workflow.id}`);
    } catch {
      // Fallback: navigate to a local new workflow page
      router.push("/dashboard/workflows/new");
    }
  };

  // ─── AI Generate + Save ──────────────────────────────────────────────────────
  const handleGenerateAndSave = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/workflow-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (!data?.workflow) throw new Error("No workflow returned");

      // Save to DB
      const saveRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.workflow.name ?? "AI Workflow",
          nodes: data.workflow.nodes ?? [],
          edges: data.workflow.edges ?? [],
          ai_generated: true,
          ai_prompt: aiPrompt.trim(),
          trigger_type: data.workflow.nodes?.[0]?.data?.typeId ?? null,
          connected_apps: [],
        }),
      });

      setIsAiModalOpen(false);
      setAiPrompt("");

      if (saveRes.ok) {
        const saved = await saveRes.json();
        showToast("success", `✨ "${data.workflow.name}" created with ${data.workflow.nodes?.length} nodes`);
        fetchWorkflows();
        setTimeout(() => router.push(`/dashboard/workflows/${saved.workflow.id}`), 800);
      } else {
        // No Supabase — navigate to new page with localStorage
        showToast("success", `✨ "${data.workflow.name}" generated! Opening editor...`);
        router.push("/dashboard/workflows/new");
      }
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
    try {
      const res = await fetch(`/api/workflows/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", "Workflow duplicated");
      fetchWorkflows();
    } catch (err: any) {
      showToast("error", err.message ?? "Duplication failed");
    }
  };

  // ─── Archive ─────────────────────────────────────────────────────────────────
  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showToast("success", "Workflow archived");
      fetchWorkflows();
    } catch {
      showToast("error", "Archive failed");
    }
  };

  // ─── Load template as new workflow ───────────────────────────────────────────
  const handleLoadTemplate = async (tpl: (typeof PREBUILT_WORKFLOW_TEMPLATES)[0]) => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tpl.name,
          description: tpl.description,
          nodes: tpl.nodes,
          edges: tpl.edges,
          trigger_type: tpl.nodes?.[0]?.data?.typeId ?? null,
          connected_apps: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast("success", `Template "${tpl.name}" loaded`);
        fetchWorkflows();
        setTimeout(() => router.push(`/dashboard/workflows/${data.workflow.id}`), 500);
      } else {
        router.push("/dashboard/workflows/new");
      }
    } catch {
      router.push("/dashboard/workflows/new");
    }
  };

  // ─── Filter display ───────────────────────────────────────────────────────────
  const filtered = workflows.filter((w) => w.status !== "archived");

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
            Create, manage, and run automated pipelines. Connect AI agents, compliance checks, and your CRM — all in one visual canvas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            Generate with AI
          </button>
          <button
            onClick={handleNewWorkflow}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#EADBCE] text-[#121217] text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
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
            placeholder="Search workflows..."
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
        <EmptyState onNew={handleNewWorkflow} onAI={() => setIsAiModalOpen(true)} onTemplate={handleLoadTemplate} />
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

      {/* ── Templates Section ─────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-[#EADBCE]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#121217]">Quick Start Templates</h2>
          <span className="text-xs text-[#9E978F]">Click to load into a new workflow</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PREBUILT_WORKFLOW_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleLoadTemplate(tpl)}
              className="text-left bg-white border border-[#EADBCE] rounded-2xl p-5 hover:border-violet-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                    {tpl.category}
                  </span>
                  <h4 className="font-semibold text-xs text-[#121217] mt-2">{tpl.name}</h4>
                  <p className="text-[11px] text-[#645F5A] mt-1 leading-relaxed">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {tpl.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[9px] bg-[#F7F3EE] border border-[#EADBCE] text-[#8E847C] px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C5BDB6] group-hover:text-violet-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

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
                <label className="text-xs font-semibold text-[#3D3731]">Describe your workflow</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerateAndSave(); }}
                  placeholder={SAMPLE_PROMPTS[currentPrompt]}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-[#EADBCE] rounded-xl bg-white text-[#121217] placeholder:text-[#C5BDB6] focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                />
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
                onClick={handleGenerateAndSave}
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
  onTemplate,
}: {
  onNew: () => void;
  onAI: () => void;
  onTemplate: (tpl: (typeof PREBUILT_WORKFLOW_TEMPLATES)[0]) => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center mb-5 shadow-inner">
        <Workflow className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-lg font-bold text-[#121217] mb-2">No workflows yet</h3>
      <p className="text-sm text-[#8E847C] max-w-sm mb-7">
        Create your first automation pipeline using AI, a blank canvas, or a pre-built template.
      </p>
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={onAI}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all cursor-pointer"
        >
          <Wand2 className="w-4 h-4" /> Generate with AI
        </button>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#EADBCE] text-[#121217] text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Blank Canvas
        </button>
      </div>
      <div className="w-full max-w-2xl">
        <p className="text-xs font-semibold text-[#9E978F] uppercase tracking-wider mb-3">Or start from a template</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PREBUILT_WORKFLOW_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onTemplate(tpl)}
              className="text-left bg-white border border-[#EADBCE] rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="text-[10px] font-semibold text-violet-600 mb-1">{tpl.category}</div>
              <div className="text-xs font-semibold text-[#121217]">{tpl.name}</div>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#9E978F]">
                <ArrowRight className="w-3 h-3" /> Load template
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
