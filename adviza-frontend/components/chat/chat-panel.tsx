"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  X,
  Bot,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Minimize2,
  Maximize2,
  ShieldAlert,
  Calendar,
  PanelLeftOpen,
  Zap,
  Gauge,
  Cpu,
  Flame,
  Info,
} from "lucide-react";
import { MissingConnectorCard } from "./missing-connector-card";
import { HITLApprovalCard } from "./hitl-approval-card";
import { BriefingCard } from "./briefing-card";
import { ExecutionPreviewCard } from "./execution-preview-card";
import { WorkflowProgressStepper } from "./workflow-progress-stepper";

export interface ModelOption {
  id: string;
  name: string;
  provider: "AWS Bedrock" | "NVIDIA NIM" | "Anthropic" | "DeepSeek";
  badge: string;
  description: string;
  icon: string;
  multiplier: number;
}

export const CHAT_MODELS: ModelOption[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet v2",
    provider: "AWS Bedrock",
    badge: "Fiduciary Flagship",
    description: "Highest reasoning accuracy, complex fiduciary orchestration, and audit depth.",
    icon: "🟣",
    multiplier: 1.5,
  },
  {
    id: "moonshot-kimi-k3",
    name: "Moonshot Kimi-k3",
    provider: "NVIDIA NIM",
    badge: "Ultra Fast",
    description: "NVIDIA NIM accelerated high-throughput inference for rapid client drafts.",
    icon: "⚡",
    multiplier: 1.0,
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "AWS Bedrock",
    badge: "Low Latency",
    description: "Lightweight, instant speed for rapid meeting summaries and quick lookups.",
    icon: "🚀",
    multiplier: 0.8,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "NVIDIA NIM",
    badge: "Quant Math",
    description: "Open quantitative reasoning and numerical portfolio analysis.",
    icon: "🧠",
    multiplier: 1.2,
  },
];

export interface DailyUsageStats {
  creditsUsedToday: number;
  dailyCreditLimit: number;
  tokensUsedToday: number;
  promptsCountToday: number;
  percentUsed: number;
  activeModel: string;
  resetAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  executedResults?: any[];
  missingConnectors?: any[];
  hitlPrompts?: any[];
  isThinking?: boolean;
}

interface ChatPanelProps {
  onClose?: () => void;
  isFloating?: boolean;
  sessionId?: string | null;
  onSessionCreated?: (session: { id: string; title: string }) => void;
  onOpenHistory?: () => void;
}

export function ChatPanel({
  onClose,
  isFloating = false,
  sessionId,
  onSessionCreated,
  onOpenHistory,
}: ChatPanelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const currentSessionIdRef = useRef<string | null>(sessionId || null);

  // Model Selector state
  const [selectedModel, setSelectedModel] = useState<string>("claude-3-5-sonnet");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Daily Credit Usage state
  const [usageStats, setUsageStats] = useState<DailyUsageStats>({
    creditsUsedToday: 420,
    dailyCreditLimit: 10000,
    tokensUsedToday: 42000,
    promptsCountToday: 4,
    percentUsed: 4.2,
    activeModel: "claude-3-5-sonnet",
    resetAt: new Date(Date.now() + 86400000).toISOString(),
  });
  const [showUsageModal, setShowUsageModal] = useState(false);

  // Load preferred model from localStorage
  useEffect(() => {
    try {
      const savedModel = localStorage.getItem("adviza_preferred_llm");
      if (savedModel && CHAT_MODELS.some((m) => m.id === savedModel)) {
        setSelectedModel(savedModel);
      }
    } catch {}
  }, []);

  // Fetch initial usage stats from API
  const fetchUsageStats = async () => {
    try {
      const res = await fetch("/api/chat/usage");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.creditsUsedToday === "number") {
          setUsageStats(data);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelDropdownOpen(false);
    try {
      localStorage.setItem("adviza_preferred_llm", modelId);
    } catch {}
  };

  // Keep ref in sync
  useEffect(() => {
    currentSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Sync external sessionId prop
  useEffect(() => {
    if (isSendingRef.current && sessionId && sessionId === currentSessionIdRef.current) {
      return;
    }

    setActiveSessionId(sessionId || null);
    currentSessionIdRef.current = sessionId || null;

    if (sessionId) {
      try {
        const cached = localStorage.getItem("adviza_chat_msg_" + sessionId);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }

      fetch(`/api/chat/sessions/${sessionId}/messages`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
            try {
              localStorage.setItem("adviza_chat_msg_" + sessionId, JSON.stringify(data.messages));
            } catch {}
          }
        })
        .catch((err) => console.warn("Session lookup note:", err));
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  // Derive ambient context from current page route
  const getAmbientContext = () => {
    let clientName = "";
    let clientId = "";
    let workflowId = "";
    let userName = "";

    if (pathname?.includes("/clients/")) {
      clientId = pathname.split("/clients/")[1]?.split("/")[0] || "";
      clientName = "Active Client Dossier";
    }
    if (pathname?.includes("/workflows/")) {
      workflowId = pathname.split("/workflows/")[1]?.split("/")[0] || "";
    }

    try {
      userName = localStorage.getItem("adviza_user_name") || "";
    } catch {}

    return {
      clientId,
      clientName,
      workflowId,
      page: pathname || "dashboard",
      userName: userName || undefined,
    };
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, statusMessage]);

  // Handle return from connector authorization
  useEffect(() => {
    const connectedParam = searchParams.get("connected");
    if (connectedParam) {
      let pendingPrompt: string | null = null;
      try {
        pendingPrompt = sessionStorage.getItem("adviza_pending_chat_prompt");
      } catch {}

      fetch("/api/integrations/composio/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug: connectedParam, appName: connectedParam }),
      })
        .then(() => {
          if (pendingPrompt) {
            try {
              sessionStorage.removeItem("adviza_pending_chat_prompt");
            } catch {}
            setStatusMessage(`Connected ${connectedParam}! Auto-resuming your task...`);
            handleSendMessage(pendingPrompt);
          } else {
            handleSendMessage(`I have connected ${connectedParam}. Please proceed with the action.`);
          }
        })
        .catch((err) => console.error("Auto-resume error:", err));
    }
  }, [searchParams]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    try {
      sessionStorage.setItem("adviza_pending_chat_prompt", query);
    } catch {}

    const userMsgId = `user_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, newMsg];
    setMessages(newHistory);
    if (!textToSend) setInput("");
    setLoading(true);
    isSendingRef.current = true;
    setStatusMessage("Resolving intent against Capability Registry...");

    try {
      let currentSession = activeSessionId || currentSessionIdRef.current;

      // Auto-create session on first prompt if none selected
      if (!currentSession) {
        try {
          const createRes = await fetch("/api/chat/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: query.length > 36 ? query.slice(0, 36) + "..." : query,
            }),
          });
          const createData = await createRes.json();
          if (createData.session?.id) {
            currentSession = createData.session.id;
            currentSessionIdRef.current = currentSession;
            setActiveSessionId(currentSession);
            onSessionCreated?.(createData.session);
          }
        } catch (sessErr) {
          console.warn("Session auto-create error (non-fatal):", sessErr);
        }
      }

      if (!currentSession) {
        currentSession = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        currentSessionIdRef.current = currentSession;
        setActiveSessionId(currentSession);
        onSessionCreated?.({
          id: currentSession,
          title: query.length > 36 ? query.slice(0, 36) + "..." : query,
        });
      }

      if (currentSession) {
        try {
          localStorage.setItem("adviza_chat_msg_" + currentSession, JSON.stringify(newHistory));
        } catch {}
      }

      const ambientContext = getAmbientContext();

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          sessionId: currentSession,
          ambientContext,
          modelId: selectedModel,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Chat Stream returned an error status");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = "";
      let finalState: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n\n");
        streamBuffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);

          const eventName = eventMatch ? eventMatch[1].trim() : "message";
          const rawData = dataMatch ? dataMatch[1].trim() : "";

          try {
            const parsedData = rawData ? JSON.parse(rawData) : {};

            if (eventName === "status") {
              setStatusMessage(parsedData.message || "Processing...");
            } else if (eventName === "usage_update") {
              if (parsedData && typeof parsedData.creditsUsedToday === "number") {
                setUsageStats(parsedData);
              }
            } else if (eventName === "node_event") {
              const nodeLabels: Record<string, string> = {
                intent_planner: "🧭 Planning workflow capabilities...",
                connector_validator: "🔌 Verifying connected Composio integrations...",
                hitl_gate: "🛡️ Assessing fiduciary risk & HITL policy...",
                tool_executor: "⚙️ Executing enterprise actions...",
                synthesizer: "✍️ Synthesizing advisory response...",
                compliance_audit: "📜 SEC/FINRA Compliance Audit verification...",
              };
              setStatusMessage(nodeLabels[parsedData.node] || `Node: ${parsedData.node}...`);
            } else if (eventName === "final_response") {
              finalState = parsedData;
              if (parsedData.usage) {
                setUsageStats(parsedData.usage);
              }
            }
          } catch {
            // raw string fallback
          }
        }
      }

      const data = finalState || {};
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.finalResponse || data.intro || data.text || "Execution complete.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        executedResults: data.executedResults || [],
        missingConnectors: data.missingConnectors || [],
        hitlPrompts: data.hitlPrompts || [],
      };

      const updatedMessages = [...newHistory, assistantMsg];
      setMessages(updatedMessages);

      if (currentSession) {
        try {
          localStorage.setItem("adviza_chat_msg_" + currentSession, JSON.stringify(updatedMessages));

          const rawSessions = localStorage.getItem("adviza_chat_sessions");
          let sessionsList = rawSessions ? JSON.parse(rawSessions) : [];
          if (!Array.isArray(sessionsList)) sessionsList = [];

          const existingIdx = sessionsList.findIndex((s: any) => s.id === currentSession);
          const sessionObj = {
            id: currentSession,
            title: query.length > 36 ? query.slice(0, 36) + "..." : query,
            updated_at: new Date().toISOString(),
          };

          if (existingIdx >= 0) {
            sessionsList[existingIdx] = { ...sessionsList[existingIdx], updated_at: new Date().toISOString() };
          } else {
            sessionsList.unshift(sessionObj);
          }
          localStorage.setItem("adviza_chat_sessions", JSON.stringify(sessionsList));
        } catch {}
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Encountered an issue executing your request. Please check connections or retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      isSendingRef.current = false;
      setStatusMessage(null);
    }
  };

  const handleClearHistory = () => {
    if (activeSessionId) {
      try {
        localStorage.removeItem("adviza_chat_msg_" + activeSessionId);
      } catch {}
    }
    setMessages([]);
  };

  const activeModelObj = CHAT_MODELS.find((m) => m.id === selectedModel) || CHAT_MODELS[0];

  return (
    <div
      className={`flex flex-col bg-white border border-[#EADBCE] rounded-3xl shadow-sm transition-all duration-300 overflow-hidden ${
        isFloating
          ? isExpanded
            ? "w-[580px] h-[780px] max-h-[90vh]"
            : "w-[440px] h-[620px] max-h-[82vh]"
          : "w-full h-full"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-[#EADBCE] bg-white">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5F0] hover:bg-[#EADBCE]/50 border border-[#EADBCE] text-xs font-semibold text-[#5A544E] hover:text-[#121217] transition shadow-2xs shrink-0"
              title="Open Chat History"
            >
              <PanelLeftOpen className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[11px]">Chats</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-[#121217] flex items-center gap-1.5 truncate">
              <span className="truncate">Adviza AI Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-semibold rounded-full shrink-0">
                Live
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[#8E847C] truncate">Multi-LLM Enterprise Orchestration</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#8E847C]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
            className="p-1.5 hover:bg-[#FAF5F0] rounded-xl hover:text-[#121217] transition"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClearHistory}
            title="Clear Chat"
            className="p-1.5 hover:bg-[#FAF5F0] rounded-xl hover:text-[#121217] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 hover:bg-[#FAF5F0] rounded-xl hover:text-[#121217] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Model Selector & Credit Tracker Sub-Bar */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-[#FAF5F0]/80 border-b border-[#EADBCE]/80 text-xs">
        {/* Model Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#EADBCE] font-semibold text-[#121217] text-[11px] sm:text-xs transition shadow-2xs"
            title="Switch Active LLM"
          >
            <span className="text-xs">{activeModelObj.icon}</span>
            <span className="truncate max-w-[130px] sm:max-w-[170px]">{activeModelObj.name}</span>
            <ChevronDown className="w-3 h-3 text-[#8E847C] shrink-0" />
          </button>

          {/* Model Dropdown Menu */}
          {isModelDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-[#EADBCE] rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8E847C]">
                Select AI Engine
              </div>
              {CHAT_MODELS.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition ${
                      isSelected
                        ? "bg-[#FAF5F0] border border-rose-200 text-[#121217]"
                        : "hover:bg-[#FAF5F0]/60 text-[#5A544E] hover:text-[#121217]"
                    }`}
                  >
                    <span className="text-base shrink-0 mt-0.5">{model.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#121217]">{model.name}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 shrink-0">
                          {model.multiplier}x Credits
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium text-rose-600">{model.provider}</span>
                        <span className="text-[10px] text-[#8E847C]">•</span>
                        <span className="text-[10px] text-[#8E847C]">{model.badge}</span>
                      </div>
                      <p className="text-[10px] text-[#8E847C] leading-snug mt-1">{model.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Credit Usage Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUsageModal(!showUsageModal)}
            className="flex items-center gap-2 px-2.5 py-1.2 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#EADBCE] text-[11px] sm:text-xs font-semibold text-[#121217] transition shadow-2xs"
            title="View Daily Credit Consumption"
          >
            <div className="flex items-center gap-1 text-amber-600">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{usageStats.creditsUsedToday.toLocaleString()}</span>
            </div>
            <span className="text-[#8E847C] text-[10px]">/ {usageStats.dailyCreditLimit.toLocaleString()}</span>
            <div className="w-12 h-1.5 bg-[#EADBCE] rounded-full overflow-hidden shrink-0 hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, usageStats.percentUsed)}%` }}
              />
            </div>
          </button>

          {/* Usage Breakdown Popover */}
          {showUsageModal && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-[#EADBCE] rounded-2xl shadow-xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#121217]">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Today's Credit Usage</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {usageStats.percentUsed}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#8E847C]">
                  <span>Used: {usageStats.creditsUsedToday.toLocaleString()} credits</span>
                  <span>Limit: {usageStats.dailyCreditLimit.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden border border-[#EADBCE]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, usageStats.percentUsed)}%` }}
                  />
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#FAF5F0] border border-[#EADBCE]/60">
                  <div className="text-[10px] text-[#8E847C]">Tokens Processed</div>
                  <div className="font-bold text-[#121217] mt-0.5">{usageStats.tokensUsedToday.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF5F0] border border-[#EADBCE]/60">
                  <div className="text-[10px] text-[#8E847C]">Queries Today</div>
                  <div className="font-bold text-[#121217] mt-0.5">{usageStats.promptsCountToday} turns</div>
                </div>
              </div>

              <div className="text-[10px] text-[#8E847C] flex items-center justify-between pt-1">
                <span>Resets Midnight UTC</span>
                <span className="font-medium text-[#121217]">Pro Tier Limit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#121217]">Adviza AI Assistant</h3>
            <p className="text-xs text-[#8E847C] max-w-xs leading-relaxed">
              Powered by <span className="font-semibold text-[#121217]">{activeModelObj.name}</span>. Run autonomous workflows, client briefings, portfolio rebalancing, and compliance audits across connected apps.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-sm pt-2">
              {[
                "Prepare meeting dossier for Sarah Jenkins",
                "Audit portfolio drift against 60/40 target",
                "Reconcile Schwab custodian FIX trades",
                "Draft quarterly performance email",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF5F0] hover:bg-[#F2ECE4] border border-[#EADBCE] text-[11px] text-[#5A544E] hover:text-[#121217] transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5`}>
              <div
                className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#121217] text-white rounded-tr-xs"
                    : "bg-[#FAF5F0] text-[#121217] border border-[#EADBCE] rounded-tl-xs"
                }`}
              >
                {m.content}
              </div>

              {/* Execution Results Previews */}
              {m.executedResults && m.executedResults.length > 0 && (
                <div className="space-y-2">
                  {m.executedResults.map((res: any, idx: number) => (
                    <ExecutionPreviewCard key={idx} execution={res} />
                  ))}
                </div>
              )}

              {/* Missing Connector Prompts */}
              {m.missingConnectors && m.missingConnectors.length > 0 && (
                <div className="space-y-2">
                  {m.missingConnectors.map((c: any, idx: number) => (
                    <MissingConnectorCard
                      key={idx}
                      connectorId={c.appSlug || c.appName || "connector"}
                      connectorName={c.appName || c.appSlug || "App"}
                      category={c.category}
                      capabilityId={c.pendingAction?.capabilityId || "action"}
                      authUrl={c.authUrl}
                      onConnectedAndResume={() => {
                        handleSendMessage(`I have authorized ${c.appName || c.appSlug}. Please proceed.`);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* HITL Fiduciary Risk Approvals */}
              {m.hitlPrompts && m.hitlPrompts.length > 0 && (
                <div className="space-y-2">
                  {m.hitlPrompts.map((p: any, idx: number) => (
                    <HITLApprovalCard
                      key={idx}
                      capabilityId={p.actionId || "action"}
                      capabilityName={p.title || "Action Authorization"}
                      parameters={p.payload || {}}
                      summary={p.description || "Action requires fiduciary approval."}
                      onDecision={(decision: "approved" | "rejected") => {
                        handleSendMessage(`${decision === "approved" ? "Approved" : "Rejected"} action ${p.actionId}.`);
                      }}
                    />
                  ))}
                </div>
              )}

              <div className={`text-[10px] text-[#8E847C] px-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {m.timestamp}
              </div>
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-xl bg-[#121217] flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="max-w-[85%] p-3.5 rounded-2xl bg-[#FAF5F0] text-[#121217] border border-[#EADBCE] rounded-tl-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{statusMessage || "Adviza OS Orchestrating..."}</span>
              </div>
              <WorkflowProgressStepper statusMessage={statusMessage || "Planning..."} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 border-t border-[#EADBCE] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Adviza (${activeModelObj.name})...`}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs bg-[#FAF5F0] border border-[#EADBCE] rounded-2xl text-[#121217] placeholder:text-[#8E847C] focus:outline-none focus:border-rose-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 hover:opacity-90 disabled:opacity-40 text-white rounded-2xl shadow-sm transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
