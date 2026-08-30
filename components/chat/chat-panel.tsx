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
  Minimize2,
  Maximize2,
  ShieldAlert,
  Calendar,
  PanelLeftOpen,
} from "lucide-react";
import { MissingConnectorCard } from "./missing-connector-card";
import { HITLApprovalCard } from "./hitl-approval-card";
import { BriefingCard } from "./briefing-card";
import { ExecutionPreviewCard } from "./execution-preview-card";
import { WorkflowProgressStepper } from "./workflow-progress-stepper";

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

  // Keep ref in sync
  useEffect(() => {
    currentSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Sync external sessionId prop
  useEffect(() => {
    // If we're currently in the middle of sending a message in this session, don't reset state
    if (isSendingRef.current && sessionId && sessionId === currentSessionIdRef.current) {
      return;
    }

    setActiveSessionId(sessionId || null);
    currentSessionIdRef.current = sessionId || null;

    if (sessionId) {
      // 1. Instant check from localStorage
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

      // 2. Fetch saved messages for this session from DB
      fetch(`/api/ai/chat-sessions/${sessionId}`)
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

    if (pathname?.includes("/clients/")) {
      clientId = pathname.split("/clients/")[1]?.split("/")[0] || "";
      clientName = "Active Client Dossier";
    }
    if (pathname?.includes("/workflows/")) {
      workflowId = pathname.split("/workflows/")[1]?.split("/")[0] || "";
    }

    return {
      clientId,
      clientName,
      workflowId,
      page: pathname || "dashboard",
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
          const createRes = await fetch("/api/ai/chat-sessions", {
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

      // If still no session (e.g. offline or unauthenticated), generate local fallback session
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

      const res = await fetch("/api/ai/chat-orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          sessionId: currentSession,
          ambientContext,
          history: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Chat Orchestrator returned an error");
      }

      const data = await res.json();

      // If orchestrator created or assigned a new UUID session
      if (data.sessionId && data.sessionId !== currentSession) {
        currentSession = data.sessionId;
        currentSessionIdRef.current = data.sessionId;
        setActiveSessionId(data.sessionId);
        onSessionCreated?.({
          id: data.sessionId,
          title: query.length > 36 ? query.slice(0, 36) + "..." : query,
        });
      }

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.intro || data.text || "Here is what I found for you:",
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

          // Also update session list in local cache
          const rawSessions = localStorage.getItem("adviza_chat_sessions");
          let sessionsList = rawSessions ? JSON.parse(rawSessions) : [];
          if (!Array.isArray(sessionsList)) sessionsList = [];

          const existingIdx = sessionsList.findIndex((s: any) => s.id === currentSession);
          const sessionObj = {
            id: currentSession,
            title: query.length > 36 ? query.slice(0, 36) + "..." : query,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            lastMessage: assistantMsg.content.slice(0, 60),
          };

          if (existingIdx >= 0) {
            sessionsList[existingIdx] = {
              ...sessionsList[existingIdx],
              updated_at: new Date().toISOString(),
              lastMessage: assistantMsg.content.slice(0, 60),
            };
          } else {
            sessionsList.unshift(sessionObj);
          }
          localStorage.setItem("adviza_chat_sessions", JSON.stringify(sessionsList));
        } catch (storageErr) {
          console.warn("Local storage cache write error:", storageErr);
        }
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

  return (
    <div
      className={`flex flex-col bg-white border border-[#EADBCE] rounded-3xl shadow-sm transition-all duration-300 overflow-hidden ${
        isFloating
          ? isExpanded
            ? "w-[560px] h-[750px] max-h-[88vh]"
            : "w-[420px] h-[600px] max-h-[80vh]"
          : "w-full h-full"
      }`}
    >
      {/* Header */}
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
                Active
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[#8E847C] truncate">Fiduciary Agent Fleet & Composio Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#8E847C]">
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

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#121217]">Adviza AI Assistant</h3>
            <p className="text-xs text-[#8E847C] max-w-xs leading-relaxed">
              Start a new conversation by typing a prompt below.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-br-sm shadow-sm"
                  : "bg-[#FAF5F0] text-[#121217] border border-[#EADBCE] rounded-bl-sm shadow-2xs"
              }`}
            >
              <div className="leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Render Missing Connector Cards */}
              {msg.missingConnectors && msg.missingConnectors.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E847C]">
                    Available Connectors ({msg.missingConnectors.length})
                  </div>
                  {msg.missingConnectors.map((mc, idx) => (
                    <MissingConnectorCard
                      key={idx}
                      connectorId={mc.connectorId || mc.appSlug}
                      connectorName={mc.connectorName || mc.appName}
                      category={mc.category}
                      description={mc.description || `Connect ${mc.appName || mc.appSlug} to enable this capability.`}
                      reason={mc.reason}
                      capabilityId={mc.capabilityId || mc.appSlug}
                      authUrl={mc.authUrl}
                      onConnectedAndResume={() => {
                        handleSendMessage(`Resume request: ${mc.reason || mc.connectorName || mc.appName}`);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Render HITL Approval Cards */}
              {msg.hitlPrompts && msg.hitlPrompts.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.hitlPrompts.map((hp, idx) => (
                    <HITLApprovalCard
                      key={idx}
                      capabilityId={hp.capabilityId || hp.payload?.capabilityId}
                      capabilityName={hp.capabilityName || hp.title}
                      reason={hp.reason || hp.description}
                      parameters={hp.parameters || hp.payload?.parameters}
                      riskLevel={hp.riskLevel || "high"}
                      summary={hp.summary || hp.description}
                      onDecision={(dec) => {
                        if (dec === "approved") {
                          setMessages((m) => [
                            ...m,
                            {
                              id: `hitl_appr_${Date.now()}`,
                              role: "assistant",
                              content: `Approved: ${hp.capabilityName || hp.title}. Action queued for execution.`,
                              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            },
                          ]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Render Executed Structured Results & Rich Previews */}
              {msg.executedResults && msg.executedResults.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E847C]">
                    Execution Output & Preview
                  </div>
                  {msg.executedResults.map((er, idx) => (
                    <div key={idx}>
                      {er.category === "briefing" && (
                        <BriefingCard data={er.result || er.data} type="briefing" />
                      )}
                      {er.category === "compliance" && (
                        <BriefingCard data={er.result || er.data} type="compliance" />
                      )}
                      {er.category !== "briefing" && er.category !== "compliance" && (
                        <ExecutionPreviewCard execution={er} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`text-[9px] block mt-1.5 ${
                  msg.role === "user" ? "text-rose-200 text-right" : "text-[#8E847C]"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Animated Multi-Step Execution Loader */}
        {loading && (
          <WorkflowProgressStepper statusMessage={statusMessage} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-[#EADBCE] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or request workflow actions..."
            disabled={loading}
            className="flex-1 bg-[#FAF5F0] border border-[#EADBCE] rounded-2xl px-4 py-2.5 text-xs text-[#121217] placeholder:text-[#8E847C] focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-400 disabled:opacity-50 transition shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-[#121217] hover:bg-[#2A2A35] disabled:opacity-30 text-white rounded-2xl transition shadow-sm group"
            title="Send message"
          >
            <Send className="w-4 h-4 text-rose-400 group-hover:scale-105 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
