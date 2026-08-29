"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Power,
  Trash2,
  ShieldCheck,
  Calendar,
  Mail,
  Database,
  MessageSquare,
  Folder,
  CheckSquare,
  CreditCard,
} from "lucide-react";
import {
  type ComposioConnection,
  type ComposioToolkit,
  SUPPORTED_COMPOSIO_APPS,
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const [toolkits, setToolkits] = useState<ComposioToolkit[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [connections, setConnections] = useState<ComposioConnection[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [disconnectingApp, setDisconnectingApp] = useState<string | null>(null);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    try {
      const res = await fetch("/api/integrations/composio/connections");
      const data = await res.json();
      if (data.connections) {
        setConnections(data.connections);
        try {
          localStorage.setItem("adviza_connected_tools", JSON.stringify(data.connections));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
      // Load from local storage cache
      try {
        const cached = localStorage.getItem("adviza_connected_tools");
        if (cached) setConnections(JSON.parse(cached));
      } catch {}
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  // Handle URL callback param `?connected=googlecalendar`
  useEffect(() => {
    const connectedParam = searchParams.get("connected");
    if (connectedParam) {
      const appName = connectedParam;
      // Immediately activate connection in DB
      fetch("/api/integrations/composio/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug: appName, appName }),
      })
        .then((res) => res.json())
        .then(() => {
          setFeedback({
            type: "success",
            message: `Successfully connected ${appName}! Tool is now active in AI Chat & Workflows.`,
          });
          fetchConnections();
          // Clean up URL without reload
          router.replace("/dashboard/connectors");
        })
        .catch((err) => console.error("Auto-connect callback error:", err));
    }
  }, [searchParams, fetchConnections, router]);

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

  async function handleConnect(slug: string, name?: string) {
    setConnectingApp(slug);
    setFeedback(null);

    try {
      // 1. Register connection immediately
      const postRes = await fetch("/api/integrations/composio/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug: slug, appName: name || slug }),
      });
      const postData = await postRes.json();

      if (postData.success) {
        setConnections((prev) => {
          const exists = prev.some((c) => c.appName.toLowerCase() === slug.toLowerCase());
          if (exists) return prev;
          const updated = [...prev, postData.connection];
          try {
            localStorage.setItem("adviza_connected_tools", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        setFeedback({
          type: "success",
          message: `Successfully connected ${name || slug}! Tool is now ready for autonomous execution.`,
        });
      }

      // 2. Fetch OAuth link
      const res = await fetch("/api/integrations/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: slug, source: "connectors" }),
      });

      const data = await res.json();

      if (data.redirectUrl && !data.redirectUrl.includes("mock=true")) {
        window.location.href = data.redirectUrl;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate connection";
      setFeedback({ type: "error", message });
    } finally {
      setConnectingApp(null);
      fetchConnections();
    }
  }

  async function handleDisconnect(slug: string, name?: string) {
    setDisconnectingApp(slug);
    setFeedback(null);

    try {
      const res = await fetch("/api/integrations/composio/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug: slug }),
      });

      if (!res.ok) throw new Error("Failed to disconnect app");

      setConnections((prev) => {
        const updated = prev.filter((c) => c.appName.toLowerCase() !== slug.toLowerCase());
        try {
          localStorage.setItem("adviza_connected_tools", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setFeedback({
        type: "success",
        message: `Disconnected ${name || slug}. Access revoked from advisor agents.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to disconnect";
      setFeedback({ type: "error", message });
    } finally {
      setDisconnectingApp(null);
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
            ? "Calendar sync test completed successfully."
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

  const isConnected = (slug: string) => {
    return connections.some(
      (c) =>
        c.status === "CONNECTED" &&
        (c.appName.toLowerCase() === slug.toLowerCase() ||
          slug.toLowerCase().includes(c.appName.toLowerCase()) ||
          c.appName.toLowerCase().includes(slug.toLowerCase()))
    );
  };

  const getAppMeta = (slug: string) => {
    return (
      SUPPORTED_COMPOSIO_APPS.find(
        (a) =>
          a.id.toLowerCase() === slug.toLowerCase() ||
          slug.toLowerCase().includes(a.id.toLowerCase())
      ) || {
        name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, " "),
        description: "Custom connected integration tool.",
        category: "productivity",
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* SEPARATE SECTION: CONNECTED TOOLS (PRIMARY TOP SECTION)       */}
      {/* ============================================================ */}
      <div className="bg-[#FAF5F0] rounded-3xl p-6 sm:p-7 border border-[#EADBCE] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE]/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base text-[#121217]">
                  Connected Tools & Active Pipelines
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {connections.length} ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#7A726A]">
                Tools authorized for autonomous execution in AI Chat and Visual Workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncCalendar}
              disabled={syncingCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-[#EADBCE] text-xs font-semibold text-[#121217] transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingCalendar ? "animate-spin" : ""}`} />
              <span>{syncingCalendar ? "Syncing..." : "Sync Calendar"}</span>
            </button>
            <button
              onClick={fetchConnections}
              disabled={loadingConnections}
              className="p-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-[#EADBCE] text-[#7A726A] hover:text-[#121217] transition shadow-xs"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingConnections ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Connected Tools Grid */}
        {loadingConnections ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#7A726A]">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            <span>Loading active tool authorizations...</span>
          </div>
        ) : connections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {connections.map((conn) => {
              const meta = getAppMeta(conn.appName);
              const isDisconnecting = disconnectingApp === conn.appName;

              return (
                <div
                  key={conn.id || conn.appName}
                  className="bg-white rounded-2xl p-4 border-2 border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-heading font-bold text-sm text-[#121217]">
                          {meta.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#7A726A] mt-0.5 line-clamp-1">
                        {meta.description}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                      CONNECTED
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EADBCE]/50 text-[11px]">
                    <span className="text-[#8E847C] font-mono text-[10px]">
                      {conn.email || "Active Authorization"}
                    </span>

                    <button
                      onClick={() => handleDisconnect(conn.appName, meta.name)}
                      disabled={isDisconnecting}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold transition disabled:opacity-50"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Connected State with Quick Connect Suggestions */
          <div className="bg-white rounded-2xl p-6 border border-dashed border-[#EADBCE] text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#121217]">
                No Tools Connected Yet
              </h3>
              <p className="text-xs text-[#7A726A] max-w-md mx-auto mt-1">
                Connect your Google Calendar, CRM, or email mailbox below to enable autonomous client intelligence.
              </p>
            </div>

            {/* Quick 1-Click Connect Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {[
                { slug: "googlecalendar", name: "Google Calendar", icon: Calendar },
                { slug: "gmail", name: "Gmail", icon: Mail },
                { slug: "salesforce", name: "Salesforce FSC", icon: Database },
                { slug: "wealthbox", name: "Wealthbox", icon: Database },
                { slug: "slack", name: "Slack", icon: MessageSquare },
              ].map((quick) => {
                const Icon = quick.icon;
                const isConnecting = connectingApp === quick.slug;

                return (
                  <button
                    key={quick.slug}
                    onClick={() => handleConnect(quick.slug, quick.name)}
                    disabled={isConnecting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF5F0] hover:bg-rose-50 border border-[#EADBCE] hover:border-rose-300 rounded-xl text-xs font-semibold text-[#121217] transition shadow-xs disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>Connect {quick.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 1,400+ COMPOSIO INTEGRATIONS CATALOG                          */}
      {/* ============================================================ */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#121217]">
              Available Tools & Connectors Catalog
            </h3>
            <p className="text-xs text-[#7A726A]">
              Search and authorize tools across 1,400+ financial, CRM, and communication platforms
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8E847C]">
              {totalItems} total tools available
            </span>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E847C] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, actions (e.g., Salesforce, Google Drive, DocuSign)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#EADBCE] text-xs text-[#121217] placeholder:text-[#8E847C] focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition shadow-xs"
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

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-[#121217] text-white shadow-xs"
                    : "bg-white hover:bg-[#FAF5F0] text-[#5A544E] border border-[#EADBCE]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {loadingTools ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-[#7A726A]">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span>Searching 1,400+ Composio Toolkits...</span>
          </div>
        ) : toolkits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {toolkits.map((tool) => {
              const connected = isConnected(tool.slug || tool.id);
              const isConnecting = connectingApp === tool.slug;
              const isDisconnecting = disconnectingApp === tool.slug;

              return (
                <div
                  key={tool.id || tool.slug}
                  className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between space-y-3 bg-white ${
                    connected
                      ? "border-emerald-500 ring-1 ring-emerald-400/40 shadow-xs"
                      : "border-[#EADBCE] hover:border-rose-300 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {tool.logo ? (
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className="w-7 h-7 rounded-lg object-contain bg-zinc-50 p-0.5 border border-zinc-100"
                            onError={(e) => {
                              // fallback to icon
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                            <Zap className="w-4 h-4" />
                          </div>
                        )}
                        <h4 className="font-heading font-bold text-xs text-[#121217] truncate">
                          {tool.name}
                        </h4>
                      </div>

                      {connected ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                          ACTIVE
                        </span>
                      ) : tool.isPopular ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold">
                          POPULAR
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[11px] text-[#7A726A] line-clamp-2 leading-relaxed">
                      {tool.description || `Connect ${tool.name} actions and autonomous triggers.`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EADBCE]/50 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#8E847C] font-mono">
                      {tool.toolsCount || 1} actions
                    </span>

                    {connected ? (
                      <button
                        onClick={() => handleDisconnect(tool.slug, tool.name)}
                        disabled={isDisconnecting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-600 text-[11px] font-semibold transition"
                      >
                        {isDisconnecting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>Disconnect</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(tool.slug, tool.name)}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#121217] hover:bg-rose-600 text-white text-[11px] font-semibold transition shadow-xs disabled:opacity-50"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <span>Connect</span>
                            <ExternalLink className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 bg-white rounded-2xl border border-[#EADBCE] text-center space-y-2">
            <p className="text-sm font-bold text-[#121217]">No tools matched your filter</p>
            <p className="text-xs text-[#7A726A]">Try searching for &quot;Calendar&quot;, &quot;Salesforce&quot;, or &quot;Gmail&quot;</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#EADBCE]/60">
            <button
              onClick={() => {
                const next = Math.max(1, currentPage - 1);
                fetchTools(next, searchQuery, selectedCategory);
              }}
              disabled={currentPage <= 1 || loadingTools}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#EADBCE] text-xs font-semibold text-[#121217] disabled:opacity-40 hover:bg-[#FAF5F0] transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-[#7A726A] font-mono">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                fetchTools(next, searchQuery, selectedCategory);
              }}
              disabled={currentPage >= totalPages || loadingTools}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#EADBCE] text-xs font-semibold text-[#121217] disabled:opacity-40 hover:bg-[#FAF5F0] transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
