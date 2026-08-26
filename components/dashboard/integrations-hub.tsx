"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Zap,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  type ComposioConnection,
  type ComposioToolkit,
} from "@/lib/composio";

const CATEGORIES = [
  { id: "all", label: "All 1,400+ Tools" },
  { id: "featured", label: "Featured (Wealth & RIA)" },
  { id: "calendar", label: "Calendar & Scheduling" },
  { id: "email", label: "Email & Outreach" },
  { id: "crm", label: "CRM & Wealth" },
  { id: "communication", label: "Communication & Alerts" },
  { id: "storage", label: "Storage & Documents" },
  { id: "productivity", label: "Productivity & Tasks" },
  { id: "finance", label: "Finance & Billing" },
  { id: "developer tools", label: "Developer & API" },
  { id: "ai agents", label: "AI & Automation" },
];

export function IntegrationsHub() {
  const [toolkits, setToolkits] = useState<ComposioToolkit[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [connections, setConnections] = useState<ComposioConnection[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchTools = useCallback(
    async (page = 1, search = "", category = "") => {
      setLoadingTools(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "24");
        if (search) params.set("search", search);
        if (category && category !== "all") {
          params.set("category", category === "featured" ? "featured" : category);
        }

        const res = await fetch(`/api/integrations/composio/toolkits?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load toolkits");

        const data = await res.json();
        setToolkits(data.toolkits || []);
        setTotalItems(data.totalItems || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || page);
      } catch (err) {
        console.error("Failed to load toolkits:", err);
      } finally {
        setLoadingTools(false);
      }
    },
    []
  );

  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    try {
      const res = await fetch("/api/integrations/composio/connections");
      const data = await res.json();
      if (data.connections) {
        setConnections(data.connections);
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Debounced search / filter update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTools(1, searchQuery, selectedCategory);
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, fetchTools]);

  async function handleConnect(slug: string) {
    setConnectingApp(slug);
    setFeedback(null);

    try {
      const res = await fetch("/api/integrations/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: slug }),
      });

      const data = await res.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || "Failed to get authorization URL");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate connection";
      setFeedback({ type: "error", message });
      setConnectingApp(null);
    }
  }

  async function handleSyncCalendar() {
    setSyncingCalendar(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/integrations/composio/sync-calendar", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: "success",
          message: data.mock
            ? "Calendar sync test completed."
            : `Synced ${data.meetingsImported} upcoming meetings from Google Calendar.`,
        });
      } else {
        throw new Error(data.error || "Calendar sync failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Calendar sync failed";
      setFeedback({ type: "error", message });
    } finally {
      setSyncingCalendar(false);
    }
  }

  function isConnected(appSlug: string) {
    return connections.some(
      (c) =>
        (c.appName.toLowerCase() === appSlug.toLowerCase() ||
          appSlug.toLowerCase().includes(c.appName.toLowerCase())) &&
        c.status === "CONNECTED"
    );
  }

  const connectedCount = connections.filter((c) => c.status === "CONNECTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-heading font-extrabold text-[#121217] tracking-tight">
              Composio Tool Integrations
            </h2>
            <span className="text-xs font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-500" />
              {totalItems > 0 ? totalItems.toLocaleString() : "1,400+"} Available
            </span>
          </div>
          <p className="text-xs text-[#7A726A] mt-1">
            Connect any of the 1,400+ Composio tools for calendar sync, email dispatch, CRM export, and automated advisory execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {connectedCount > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {connectedCount} Connected
            </span>
          )}
          <button
            onClick={() => {
              fetchConnections();
              fetchTools(currentPage, searchQuery, selectedCategory);
            }}
            disabled={loadingTools || loadingConnections}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF5F0] text-xs font-bold text-[#121217] rounded-full transition-colors border border-[#EADBCE] shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${loadingTools || loadingConnections ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
          <input
            id="integrations-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all 1,400+ tools (e.g., Salesforce, Google Calendar, Slack, HubSpot, GitHub, Jira, Notion, QuickBooks)..."
            className="w-full pl-11 pr-10 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-2xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E847C] hover:text-[#121217] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#8E847C] flex-shrink-0 mr-1 hidden sm:block" />
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#121217] border-[#121217] text-white shadow-sm"
                    : "bg-[#FAF5F0] border-[#EADBCE] text-[#5A544E] hover:text-[#121217] hover:bg-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Count Indicator */}
      <div className="flex items-center justify-between text-xs text-[#7A726A] px-1">
        <span>
          Showing <span className="text-[#121217] font-bold">{toolkits.length}</span> of{" "}
          <span className="text-[#121217] font-bold">{totalItems.toLocaleString()}</span> tools (Page {currentPage} of {totalPages})
        </span>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-rose-600 hover:text-rose-700 font-bold hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tools Grid */}
      {loadingTools ? (
        <div className="bg-[#FAF5F0]/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-[#EADBCE]">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
          <p className="text-sm font-heading font-bold text-[#121217]">Loading Composio Tools...</p>
          <p className="text-xs text-[#7A726A] mt-1">Retrieving 1,400+ tool directory from Composio API</p>
        </div>
      ) : toolkits.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {toolkits.map((tool) => {
              const connected = isConnected(tool.slug);
              const isConnecting = connectingApp === tool.slug;

              return (
                <div
                  key={tool.slug}
                  className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all hover:shadow-md ${
                    connected
                      ? "border-emerald-300 bg-emerald-50/20"
                      : "border-[#EADBCE] hover:border-[#D8CCC2]"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] flex items-center justify-center overflow-hidden flex-shrink-0 p-1.5">
                          {tool.logo ? (
                            <img
                              src={tool.logo}
                              alt={tool.name}
                              className="w-full h-full object-contain rounded"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Zap className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-heading font-bold text-[#121217] truncate">{tool.name}</h3>
                            {tool.isPopular && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {tool.toolsCount > 0 && (
                              <span className="text-[10px] font-mono text-[#7A726A] flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5 text-[#8E847C]" />
                                {tool.toolsCount} actions
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${
                          connected
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-[#FAF5F0] border-[#EADBCE] text-[#7A726A]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            connected ? "bg-emerald-500" : "bg-zinc-400"
                          }`}
                        />
                        {connected ? "Connected" : "Not Linked"}
                      </span>
                    </div>

                    <p className="text-xs text-[#5A544E] mb-4 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#EADBCE]/80">
                    <button
                      onClick={() => handleConnect(tool.slug)}
                      disabled={isConnecting}
                      className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        connected
                          ? "bg-white hover:bg-[#FAF5F0] text-[#121217] border border-[#EADBCE]"
                          : "btn-hero-gradient text-white shadow-sm"
                      }`}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>{connected ? "Reconnect" : "Connect"}</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </>
                      )}
                    </button>

                    {tool.slug === "googlecalendar" && (
                      <button
                        onClick={handleSyncCalendar}
                        disabled={syncingCalendar}
                        className="py-2 px-3.5 bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] text-xs font-bold text-[#121217] rounded-full transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Sync upcoming meetings from Google Calendar"
                      >
                        <RefreshCw className={`w-3 h-3 text-rose-500 ${syncingCalendar ? "animate-spin" : ""}`} />
                        <span>Sync</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[#EADBCE]">
              <button
                onClick={() => fetchTools(Math.max(1, currentPage - 1), searchQuery, selectedCategory)}
                disabled={currentPage <= 1 || loadingTools}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-[#EADBCE] text-xs font-bold text-[#121217] hover:bg-[#FAF5F0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-mono text-[#7A726A]">
                Page <strong className="text-[#121217]">{currentPage}</strong> of <strong className="text-[#121217]">{totalPages}</strong>
              </span>

              <button
                onClick={() => fetchTools(Math.min(totalPages, currentPage + 1), searchQuery, selectedCategory)}
                disabled={currentPage >= totalPages || loadingTools}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-[#EADBCE] text-xs font-bold text-[#121217] hover:bg-[#FAF5F0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#FAF5F0] rounded-3xl p-12 text-center border border-[#EADBCE]">
          <Search className="w-8 h-8 text-[#A89E95] mx-auto mb-3" />
          <h3 className="text-sm font-heading font-bold text-[#121217] mb-1">No integration tools found</h3>
          <p className="text-xs text-[#7A726A] mb-4 max-w-sm mx-auto">
            No tools matched &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 bg-[#121217] hover:bg-zinc-800 text-xs font-bold text-white rounded-full transition-colors cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
}
