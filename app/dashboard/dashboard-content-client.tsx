"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Zap,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Calendar,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface DashboardContentClientProps {
  initialTab: string;
  profile: any;
  firm: any;
  clientCount: number;
  actionCount: number;
  upcomingMeetings: any[];
  recentMeetings: any[];
}

interface ContentItem {
  id: string;
  title: string;
  status: "Completed" | "Processing" | "Scheduled";
  template: string;
  updated: string;
  draftStatus: "Draft" | "Published" | "Review";
  platforms: ("meta" | "google" | "x" | "instagram" | "web")[];
}

const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: "cnt-1",
    title: "Stop Sore Feet: How to Break In Nike Football Boots Pain-Free",
    status: "Completed",
    template: "Blog Post",
    updated: "6 days ago",
    draftStatus: "Draft",
    platforms: ["web"],
  },
  {
    id: "cnt-2",
    title: "Outdoor Basketball Shoes Checklist: Durability, Traction, and Comfort Essentials",
    status: "Completed",
    template: "Blog Post",
    updated: "6 days ago",
    draftStatus: "Draft",
    platforms: ["web"],
  },
  {
    id: "cnt-3",
    title: "The Definitive Guide to Merging Soccer Aesthetics and High-End Streetwear",
    status: "Completed",
    template: "Blog Post",
    updated: "10 days ago",
    draftStatus: "Draft",
    platforms: ["meta", "x", "instagram", "google"],
  },
  {
    id: "cnt-4",
    title: "Why HOKAs are the best option",
    status: "Completed",
    template: "Blog Post",
    updated: "24 days ago",
    draftStatus: "Draft",
    platforms: ["meta", "x", "google"],
  },
];

export function DashboardContentClient({
  initialTab,
  profile,
  firm,
  clientCount,
  actionCount,
  upcomingMeetings,
  recentMeetings,
}: DashboardContentClientProps) {
  const [activeTopTab, setActiveTopTab] = useState<"generate" | "tools" | "overview">(
    initialTab === "overview" ? "overview" : "generate"
  );
  const [activeSubTab, setActiveSubTab] = useState<"generation" | "optimization">("generation");
  const [contentList, setContentList] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState("Blog Post");
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ContentItem = {
      id: `cnt-${Date.now()}`,
      title: newTitle.trim(),
      status: "Completed",
      template: newTemplate,
      updated: "Just now",
      draftStatus: "Draft",
      platforms: ["web", "google"],
    };

    setContentList([newItem, ...contentList]);
    setNewTitle("");
    setIsCreateModalOpen(false);
  };

  const handleOptimize = (id?: string) => {
    const targetId = id || contentList[0]?.id;
    if (!targetId) return;
    setOptimizingId(targetId);
    setTimeout(() => {
      setContentList((prev) =>
        prev.map((item) =>
          item.id === targetId ? { ...item, draftStatus: "Published", updated: "Just now" } : item
        )
      );
      setOptimizingId(null);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Page Header & Underline Tabs */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Content
        </h1>

        <div className="flex items-center gap-6 border-b border-zinc-200/80 mt-4">
          <button
            onClick={() => setActiveTopTab("generate")}
            className={cn(
              "pb-2.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer",
              activeTopTab === "generate"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent"
            )}
          >
            Generate Content
          </button>
          <button
            onClick={() => setActiveTopTab("tools")}
            className={cn(
              "pb-2.5 text-xs sm:text-sm font-medium transition-colors relative cursor-pointer",
              activeTopTab === "tools"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent"
            )}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTopTab("overview")}
            className={cn(
              "pb-2.5 text-xs sm:text-sm font-medium transition-colors relative cursor-pointer",
              activeTopTab === "overview"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent"
            )}
          >
            Overview
          </button>
        </div>
      </div>

      {activeTopTab === "generate" && (
        <>
          {/* Start a New Project Section */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
              Start a New Project
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Create */}
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs hover:border-zinc-300 transition-all flex items-start gap-6 group">
                {/* Visual Thumbnail */}
                <div className="w-20 h-24 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-2.5 flex flex-col justify-between shrink-0 shadow-2xs">
                  <div className="w-6 h-6 rounded border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 text-xs font-semibold shadow-2xs">
                    +
                  </div>
                  <div className="space-y-1.5 pb-1">
                    <div className="w-full h-1.5 bg-zinc-200/70 rounded" />
                    <div className="w-4/5 h-1.5 bg-zinc-200/70 rounded" />
                    <div className="w-3/5 h-1.5 bg-zinc-200/70 rounded" />
                  </div>
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-zinc-900">Create</h3>
                  <p className="text-xs text-zinc-500 mt-1 mb-4 leading-relaxed">
                    Generate high-performing AEO content in minutes.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Content</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Optimize */}
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs hover:border-zinc-300 transition-all flex items-start gap-6 group">
                {/* Visual Thumbnail */}
                <div className="w-20 h-24 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-2.5 flex flex-col justify-between shrink-0 shadow-2xs">
                  <div className="w-6 h-6 rounded border border-zinc-200 bg-white flex items-center justify-center text-zinc-700 text-xs shadow-2xs">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="space-y-1.5 pb-1">
                    <div className="w-full h-1.5 bg-zinc-200/70 rounded" />
                    <div className="w-4/5 h-1.5 bg-zinc-200/70 rounded" />
                    <div className="w-2/3 h-1.5 bg-zinc-200/70 rounded" />
                  </div>
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900">Optimize</h3>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                      Beta
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 mb-4 leading-relaxed">
                    Use Profound AI to enhance your content to boost visibility.
                  </p>
                  <button
                    onClick={() => handleOptimize()}
                    disabled={optimizingId !== null}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{optimizingId ? "Optimizing..." : "Optimize Existing Content"}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Table Controls & Filter Bar */}
          <section className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Segmented Pill Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100/70 p-1 rounded-xl border border-zinc-200/70 w-fit">
                <button
                  onClick={() => setActiveSubTab("generation")}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                    activeSubTab === "generation"
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Content Generation
                </button>
                <button
                  onClick={() => setActiveSubTab("optimization")}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                    activeSubTab === "optimization"
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <span>Content Optimization</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded-full font-semibold">
                    Beta
                  </span>
                </button>
              </div>

              {/* Right Controls: Refresh & Pagination */}
              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 font-medium transition-colors cursor-pointer"
                >
                  <RotateCw className={cn("w-3.5 h-3.5 text-zinc-500", isRefreshing && "animate-spin")} />
                  <span>Refresh table</span>
                </button>

                <div className="flex items-center gap-2 text-zinc-400">
                  <span>
                    Showing <strong className="font-semibold text-zinc-700">1 – {contentList.length}</strong> of{" "}
                    {contentList.length} items
                  </span>
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                      disabled
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                      disabled
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Modern SaaS Table */}
            <div className="bg-white border-t border-zinc-200/80 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/80 text-xs font-semibold text-zinc-400 select-none">
                    <th className="py-3.5 pl-1 pr-6 font-medium">Title</th>
                    <th className="py-3.5 px-4 font-medium w-36">Status</th>
                    <th className="py-3.5 px-4 font-medium w-32">Template</th>
                    <th className="py-3.5 px-4 font-medium w-32">Updated</th>
                    <th className="py-3.5 px-4 font-medium w-32 text-right">Draft</th>
                    <th className="py-3.5 pl-2 pr-1 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {contentList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors group">
                      {/* Title & Platforms */}
                      <td className="py-4 pl-1 pr-6">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 flex-shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 text-xs sm:text-sm tracking-tight group-hover:text-zinc-950">
                              {item.title}
                            </div>
                            {/* Platform Micro-Badges */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {item.platforms.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="w-4 h-4 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-600 uppercase"
                                  title={p}
                                >
                                  {p[0]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          {item.status}
                        </span>
                      </td>

                      {/* Template */}
                      <td className="py-4 px-4 text-zinc-500 font-medium align-top">
                        {item.template}
                      </td>

                      {/* Updated */}
                      <td className="py-4 px-4 text-zinc-400 align-top">
                        {item.updated}
                      </td>

                      {/* Draft Dropdown Pill */}
                      <td className="py-4 px-4 text-right align-top">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-xs font-medium ml-auto"
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              item.draftStatus === "Published" ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                          <span>{item.draftStatus}</span>
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </button>
                      </td>

                      {/* More Options */}
                      <td className="py-4 pl-2 pr-1 text-right align-top">
                        <button
                          type="button"
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Tools View */}
      {activeTopTab === "tools" && (
        <section className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-5">
            <Link
              href="/dashboard/workflows"
              className="bg-white rounded-2xl border border-zinc-200/80 p-5 hover:border-zinc-300 shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 mb-3">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900">AI Workflow Builder</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Automate follow-up emails, client portfolio updates, and CRM syncs.
              </p>
              <span className="text-xs font-semibold text-zinc-900 mt-3 inline-flex items-center gap-1 group-hover:underline">
                Open Workflows &rarr;
              </span>
            </Link>

            <Link
              href="/dashboard/compliance"
              className="bg-white rounded-2xl border border-zinc-200/80 p-5 hover:border-zinc-300 shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900">Compliance & Brand Hub</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Real-time SEC/FINRA guardrails, disclaimer verification, and audit trails.
              </p>
              <span className="text-xs font-semibold text-zinc-900 mt-3 inline-flex items-center gap-1 group-hover:underline">
                Audit Content &rarr;
              </span>
            </Link>

            <Link
              href="/dashboard/connectors"
              className="bg-white rounded-2xl border border-zinc-200/80 p-5 hover:border-zinc-300 shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900">Live Connectors</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Connect Salesforce, HubSpot, Gmail, Slack, and Google Calendar.
              </p>
              <span className="text-xs font-semibold text-zinc-900 mt-3 inline-flex items-center gap-1 group-hover:underline">
                Manage Connectors &rarr;
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Overview View (Advisor Operations, Stats, Live Meetings) */}
      {activeTopTab === "overview" && (
        <section className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/clients"
              className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-2xs hover:border-zinc-300 transition-all"
            >
              <div className="text-xs font-medium text-zinc-400">Total Clients</div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">{clientCount}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Active client relationships</div>
            </Link>

            <Link
              href="/dashboard/meetings"
              className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-2xs hover:border-zinc-300 transition-all"
            >
              <div className="text-xs font-medium text-zinc-400">Upcoming Meetings</div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
                {upcomingMeetings?.length ?? 0}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Scheduled with briefings</div>
            </Link>

            <Link
              href="/dashboard/actions"
              className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-2xs hover:border-zinc-300 transition-all"
            >
              <div className="text-xs font-medium text-zinc-400">Open Actions</div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">{actionCount}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Tasks requiring follow-up</div>
            </Link>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-2xs">
              <div className="text-xs font-medium text-zinc-400">AI Engine Monthly Quota</div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
                {firm?.meetings_used ?? 0} / {firm?.meetings_limit ?? 50}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">99.98% System Uptime</div>
            </div>
          </div>

          {/* Upcoming & Recent Meetings in Clean SaaS Style */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-700" />
                  <h3 className="font-bold text-sm text-zinc-900">Upcoming Briefings</h3>
                </div>
                <Link
                  href="/dashboard/meetings"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-zinc-100">
                {upcomingMeetings && upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/dashboard/meetings/${meeting.id}`}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-zinc-900 truncate">
                          {meeting.clients?.full_name || "Client Meeting"}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {new Date(meeting.scheduled_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                        {meeting.briefing ? "Briefed" : "Scheduled"}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-zinc-400">No upcoming meetings</div>
                )}
              </div>
            </div>

            {/* AI Engine Status */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-zinc-700" />
                  <h3 className="font-bold text-sm text-zinc-900">AI Agents Status</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="space-y-3 pt-3">
                {[
                  { name: "Content Generation Engine", desc: "AEO ranking models ready" },
                  { name: "Compliance & FINRA Auditor", desc: "Rule 2210 & 206(4)-1 active" },
                  { name: "Portfolio Intelligence Copilot", desc: "Real-time sync connected" },
                ].map((agent) => (
                  <div
                    key={agent.name}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900">{agent.name}</div>
                      <div className="text-[11px] text-zinc-500">{agent.desc}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      ONLINE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Create Content Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-900">Create New Content</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Content Title or Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Tax-Loss Harvesting Strategies for Q4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Template Format
                </label>
                <select
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-400"
                >
                  <option value="Blog Post">Blog Post</option>
                  <option value="Client Briefing">Client Briefing</option>
                  <option value="Market Commentary">Market Commentary</option>
                  <option value="Quarterly Portfolio Review">Quarterly Portfolio Review</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs"
                >
                  Generate Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
