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
} from "lucide-react";
import { MissingConnectorCard } from "./missing-connector-card";
import { HITLApprovalCard } from "./hitl-approval-card";
import { BriefingCard } from "./briefing-card";

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
}

export function ChatPanel({ onClose, isFloating = false }: ChatPanelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Welcome to Adviza Chat Orchestrator. Ask for client briefings, calendar lookups, compliance checks, or automated workflow runs.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, []);

  // Handle return from connector authorization
  useEffect(() => {
    const connectedParam = searchParams.get("connected");
    if (connectedParam) {
      fetch("/api/integrations/composio/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug: connectedParam, appName: connectedParam }),
      })
        .then(() => {
          handleSendMessage(`How many client meetings do I have scheduled?`);
        })
        .catch((err) => console.error("Auto-resume error:", err));
    }
  }, [searchParams]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

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
    setStatusMessage("Resolving intent against Capability Registry...");

    try {
      const ambientContext = getAmbientContext();

      const res = await fetch("/api/ai/chat-orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
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

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "I encountered an issue connecting to the orchestrator. Please verify network credentials and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  const handleClearHistory = () => {
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
      className={`flex flex-col bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
        isFloating
          ? isExpanded
            ? "w-[560px] h-[750px] max-h-[88vh]"
            : "w-[420px] h-[600px] max-h-[80vh]"
          : "w-full h-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              Adviza AI Assistant
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 font-semibold rounded-full">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">Fiduciary Agent Fleet & Composio Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
            className="p-1.5 hover:bg-muted rounded-lg hover:text-foreground transition"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClearHistory}
            title="Clear Chat"
            className="p-1.5 hover:bg-muted rounded-lg hover:text-foreground transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 hover:bg-muted rounded-lg hover:text-foreground transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === "user"
                  ? "bg-rose-600 text-white rounded-br-none shadow-sm"
                  : "bg-muted/60 text-foreground border border-border/50 rounded-bl-none"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

              {/* Render Missing Connector Cards */}
              {msg.missingConnectors && msg.missingConnectors.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.missingConnectors.map((mc, idx) => (
                    <MissingConnectorCard
                      key={idx}
                      connectorId={mc.connectorId}
                      connectorName={mc.connectorName}
                      description={mc.description}
                      reason={mc.reason}
                      capabilityId={mc.capabilityId}
                      onConnectedAndResume={() => {
                        handleSendMessage(`Resume request: ${mc.reason || mc.connectorName}`);
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
                      capabilityId={hp.capabilityId}
                      capabilityName={hp.capabilityName}
                      reason={hp.reason}
                      parameters={hp.parameters}
                      riskLevel={hp.riskLevel}
                      summary={hp.summary}
                      onDecision={(dec) => {
                        if (dec === "approved") {
                          setMessages((m) => [
                            ...m,
                            {
                              id: `appr_${Date.now()}`,
                              role: "assistant",
                              content: `Action Approved and Logged to Compliance WORM Trail: ${hp.capabilityName}`,
                              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            },
                          ]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Render Executed Structured Results */}
              {msg.executedResults && msg.executedResults.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.executedResults.map((er, idx) => (
                    <div key={idx}>
                      {er.category === "briefing" && (
                        <BriefingCard data={er.result} type="briefing" />
                      )}
                      {er.category === "compliance" && (
                        <BriefingCard data={er.result} type="compliance" />
                      )}
                      {er.category !== "briefing" && er.category !== "compliance" && (
                        <div className="p-2.5 bg-background/80 rounded-xl border border-border/50 text-[11px]">
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {er.name}
                          </div>
                          <pre className="mt-1 p-2 bg-muted/40 rounded text-[10px] overflow-x-auto">
                            {JSON.stringify(er.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`text-[9px] block mt-1.5 ${
                  msg.role === "user" ? "text-rose-200 text-right" : "text-muted-foreground"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 p-2 bg-rose-500/5 rounded-xl border border-rose-500/20 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{statusMessage || "Adviza AI is orchestrating..."}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex flex-wrap gap-1.5">
          {[
            "How many client meetings do I have today?",
            "Prepare briefing dossier for Sarah Jenkins",
            "Run compliance suitability check",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] px-2.5 py-1 bg-background hover:bg-muted border border-border/60 rounded-lg text-muted-foreground hover:text-foreground transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t border-border/60 bg-muted/20">
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
            placeholder="Ask anything or request workflow actions..."
            disabled={loading}
            className="flex-1 bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
