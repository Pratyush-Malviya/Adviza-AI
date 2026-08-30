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
}

export function ChatPanel({
  onClose,
  isFloating = false,
  sessionId,
  onSessionCreated,
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
          }
        }
      } catch {}

      // 2. Fetch saved messages for this session from DB
      fetch(`/api/ai/chat-sessions/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
            try {
              localStorage.setItem("adviza_chat_msg_" + sessionId, JSON.stringify(data.messages));
            } catch {}
          } else if (!localStorage.getItem("adviza_chat_msg_" + sessionId)) {
            // Pre-seed starter thread messages if applicable
            let seedMessages: ChatMessage[] = [];
            if (sessionId === "sess_calendar_today") {
              seedMessages = [
                {
                  id: "msg_u1",
                  role: "user",
                  content: "How many client meetings do I have scheduled for today?",
                  timestamp: "01:09 AM",
                },
                {
                  id: "msg_a1",
                  role: "assistant",
                  content: "I checked **malviya.pratyush26@gmail.com**. You have 3 meetings scheduled for today:\n\n1. **Train to NEW DELHI (NDLS)** (10:30 PM)\n2. **Effective Communication as a PM : Part 1** (11:00 AM)\n3. **Pallavi Dhamapurkar: Mentor Session** (05:00 PM)",
                  timestamp: "01:09 AM",
                },
              ];
            } else if (sessionId === "sess_july_audit") {
              seedMessages = [
                {
                  id: "msg_u2",
                  role: "user",
                  content: "How many meetings did I have in the month of July?",
                  timestamp: "Yesterday",
                },
                {
                  id: "msg_a2",
                  role: "assistant",
                  content: "I checked **malviya.pratyush26@gmail.com** and found **10 meetings** in July 2026 including Portfolio Reviews and Discovery calls.",
                  timestamp: "Yesterday",
                },
              ];
            } else if (sessionId === "sess_briefing_sarah") {
              seedMessages = [
                {
                  id: "msg_u3",
                  role: "user",
                  content: "Prepare pre-meeting briefing dossier for Sarah Jenkins",
                  timestamp: "2 days ago",
                },
                {
                  id: "msg_a3",
                  role: "assistant",
                  content: "Generated Pre-Meeting Executive Briefing for Sarah Jenkins (Portfolio: $1,850,000 | Growth & Income).\n\n### 🔗 Document Deliverables & Direct Links\n📄 **Live Document Dossier:** [Open Full Dossier](/api/documents/export?type=briefing&clientName=Sarah%20Jenkins)\n📥 **PDF Export:** [Download / Save as PDF](/api/documents/export?type=briefing&format=pdf&clientName=Sarah%20Jenkins)",
                  timestamp: "2 days ago",
                  executedResults: [
                    {
                      capabilityId: "agent_meeting_briefing",
                      name: "Pre-Meeting Briefing Dossier",
                      category: "briefing",
                      success: true,
                      data: {
                        clientName: "Sarah Jenkins",
                        executiveSummary: "Pre-meeting briefing dossier compiled for comprehensive fiduciary review. High-net-worth portfolio analysis indicates strong performance (+4.2% QTD).",
                        portfolioHighlights: [
                          { metric: "Total Portfolio Value", value: "$1,850,000" },
                          { metric: "Equity Allocation", value: "68.4%" },
                        ],
                        keyTalkingPoints: [
                          "Municipal Bond Ladder deployment",
                          "Tax-loss harvesting on emerging market positions",
                        ],
                        documentUrl: "/api/documents/export?type=briefing&clientName=Sarah%20Jenkins",
                        pdfUrl: "/api/documents/export?type=briefing&format=pdf&clientName=Sarah%20Jenkins",
                      },
                    },
                  ],
                },
              ];
            }

            if (seedMessages.length > 0) {
              setMessages(seedMessages);
              try {
                localStorage.setItem("adviza_chat_msg_" + sessionId, JSON.stringify(seedMessages));
              } catch {}
            } else {
              setMessages([
                {
                  id: "welcome",
                  role: "assistant",
                  content: "Welcome to Adviza Chat Orchestrator. Ask for client briefings, calendar lookups, compliance checks, or automated workflow runs.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]);
            }
          }
        })
        .catch((err) => console.error("Failed to load session messages:", err));
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Welcome to Adviza Chat Orchestrator. Ask for client briefings, calendar lookups, compliance checks, or automated workflow runs.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
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
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "Conversation history cleared. How can I assist you with your advisory workflow?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
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
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EADBCE] bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#121217] flex items-center gap-1.5">
              Adviza AI Assistant
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-semibold rounded-full">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-[#8E847C]">Fiduciary Agent Fleet & Composio Gateway</p>
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
