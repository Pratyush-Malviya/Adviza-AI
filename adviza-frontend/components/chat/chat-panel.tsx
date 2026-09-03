"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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
  Zap,
  Flame,
  Paperclip,
  Image as ImageIcon,
  File as FileIcon,
  Mic,
  MicOff,
  Lightbulb,
  Link2,
  Share2,
  MoreHorizontal,
  Plus,
  ArrowUp,
  FileText,
  TrendingUp,
  Compass,
  Check,
  Volume2,
  Globe,
  FlaskConical,
} from "lucide-react";
import { MissingConnectorCard } from "./missing-connector-card";
import { HITLApprovalCard } from "./hitl-approval-card";
import { BriefingCard } from "./briefing-card";
import { ExecutionPreviewCard } from "./execution-preview-card";
import { WorkflowProgressStepper } from "./workflow-progress-stepper";
import { CitationSourcesCard } from "./citation-sources-card";
import { MarkdownContent } from "./markdown-content";
import { MessageActions } from "./message-actions";
import { performLiveSearch, type SearchCitation } from "@/lib/search-service";
import { parseUploadedDocument } from "@/lib/document-parser";

export interface ModelOption {
  id: string;
  name: string;
  shortName: string;
  provider: "AWS Bedrock" | "NVIDIA NIM" | "Anthropic" | "DeepSeek" | "Google Cloud";
  badge: string;
  description: string;
  icon: string;
  multiplier: number;
}

export const CHAT_MODELS: ModelOption[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet v2",
    shortName: "Claude 3.5 Sonnet",
    provider: "AWS Bedrock",
    badge: "Fiduciary Flagship",
    description: "Highest reasoning accuracy, complex fiduciary orchestration, and audit depth.",
    icon: "🟣",
    multiplier: 1.5,
  },
  {
    id: "moonshot-kimi-k3",
    name: "Moonshot Kimi-k3",
    shortName: "Kimi-k3 Turbo",
    provider: "NVIDIA NIM",
    badge: "Ultra Fast",
    description: "NVIDIA NIM accelerated high-throughput inference for rapid client drafts.",
    icon: "⚡",
    multiplier: 1.0,
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    shortName: "Claude 3.5 Haiku",
    provider: "AWS Bedrock",
    badge: "Low Latency",
    description: "Lightweight, instant speed for rapid meeting summaries and quick lookups.",
    icon: "🚀",
    multiplier: 0.8,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    shortName: "DeepSeek V3",
    provider: "NVIDIA NIM",
    badge: "Quant Math",
    description: "Open quantitative reasoning and numerical portfolio analysis.",
    icon: "🧠",
    multiplier: 1.2,
  },
  {
    id: "gemini-2.5-flash",
    name: "Google Gemini 2.5 Flash",
    shortName: "Gemini 2.5 Flash",
    provider: "Google Cloud",
    badge: "Multimodal AI",
    description: "Google's ultra-fast multimodal intelligence engine with 1M token context window.",
    icon: "✨",
    multiplier: 1.0,
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
  citations?: SearchCitation[];
  isDeepResearch?: boolean;
  isWebSearch?: boolean;
  thinkLonger?: boolean;
  attachedFiles?: { name: string; size?: number; type?: string }[];
}

interface ChatPanelProps {
  onClose?: () => void;
  isFloating?: boolean;
  sessionId?: string | null;
  onSessionCreated?: (session: { id: string; title: string }) => void;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
}

export function ChatPanel({
  onClose,
  isFloating = false,
  sessionId,
  onSessionCreated,
  onNewChat,
  onOpenHistory,
}: ChatPanelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // File Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep Reasoning / Think Longer state
  const [thinkLonger, setThinkLonger] = useState(false);

  // Deep Research state
  const [deepResearch, setDeepResearch] = useState(false);

  // Web Search state
  const [webSearch, setWebSearch] = useState(false);

  // Voice recording simulation / web speech
  const [isListening, setIsListening] = useState(false);

  // Options popover & Share toast
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Daily Credit Usage state
  const [usageStats, setUsageStats] = useState<DailyUsageStats>({
    creditsUsedToday: 20,
    dailyCreditLimit: 100,
    tokensUsedToday: 42000,
    promptsCountToday: 4,
    percentUsed: 20,
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

  // Auto-scroll to latest message without blocking animations or freezing during stream
  const lastScrollTimeRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (loading) {
      if (now - lastScrollTimeRef.current >= 120) {
        lastScrollTimeRef.current = now;
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, statusMessage]);

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    currentSessionIdRef.current = null;
    setMessages([]);
    setInput("");
    setSelectedFiles([]);
    if (onNewChat) {
      onNewChat();
    } else {
      router.push("/dashboard/chat");
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = textToSend || input.trim();
    if ((!rawQuery && selectedFiles.length === 0) || loading) return;

    let query = rawQuery;
    const directives: string[] = [];

    // Parse attached documents and financial statements
    let documentContext = "";
    if (selectedFiles.length > 0) {
      try {
        const parsedDocs = await Promise.all(selectedFiles.map((f) => parseUploadedDocument(f)));
        for (const doc of parsedDocs) {
          if (doc.structuredHoldings && doc.structuredHoldings.length > 0) {
            documentContext += `\n[Extracted Holdings from ${doc.fileName} (Total Value: $${doc.totalPortfolioValue?.toLocaleString() || "N/A"})]:\n${JSON.stringify(doc.structuredHoldings, null, 2)}\n`;
          } else if (doc.extractedText) {
            documentContext += `\n[Extracted Content from ${doc.fileName}]:\n${doc.extractedText.slice(0, 2000)}\n`;
          }
        }
      } catch (err) {
        console.warn("Document parsing note:", err);
      }
    }

    // Perform live search or deep research
    let searchCitations: SearchCitation[] = [];
    if ((webSearch || deepResearch) && !textToSend) {
      try {
        const searchRes = await performLiveSearch(rawQuery, { deepResearch });
        searchCitations = searchRes.citations;
        if (searchCitations.length > 0) {
          directives.push(`[Verified Live Web Search Sources (${searchCitations.length} Sources)]:\n${searchCitations.map((c, i) => `[${i + 1}] ${c.title} (${c.url}): ${c.snippet}`).join("\n")}`);
        }
      } catch (err) {
        console.warn("Search retrieval note:", err);
      }
    }

    if (thinkLonger && !textToSend) {
      directives.push("[Deep Reasoning Mode: Elaborate and perform step-by-step fiduciary audit analysis]");
    }
    if (deepResearch && !textToSend) {
      directives.push("[Deep Research Mode: Perform comprehensive, multi-angle fiduciary and market investigation with detailed data points, structured breakdown, and citations]");
    }
    if (webSearch && !textToSend) {
      directives.push("[Live Web Search: Gather current live web intelligence, recent market updates, and regulatory filings]");
    }

    if (documentContext) {
      directives.push(documentContext);
    }

    if (directives.length > 0) {
      query = `${directives.join("\n")}\n\n${rawQuery}`;
    }

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: rawQuery || (selectedFiles.length > 0 ? "Attached financial files for analysis." : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isDeepResearch: deepResearch,
      isWebSearch: webSearch,
      thinkLonger: thinkLonger,
      attachedFiles: selectedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedFiles([]);
    setLoading(true);
    setStatusMessage(
      deepResearch
        ? "Conducting Deep Fiduciary Research..."
        : webSearch
        ? "Searching Live Web & Market Feeds..."
        : "Adviza OS Orchestrating..."
    );
    isSendingRef.current = true;

    const ambient = getAmbientContext();

    try {
      let targetSessionId = currentSessionIdRef.current;

      // Create session on server if this is a new conversation
      if (!targetSessionId) {
        try {
          const title = rawQuery.slice(0, 36) || "Wealth Advisory Session";
          const res = await fetch("/api/ai/chat-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
          const data = await res.json();
          if (data.session && data.session.id) {
            targetSessionId = String(data.session.id);
            setActiveSessionId(targetSessionId);
            currentSessionIdRef.current = targetSessionId;
            if (targetSessionId && onSessionCreated) {
              onSessionCreated({ id: targetSessionId, title });
            }
          }
        } catch (err) {
          console.warn("Session auto-create fallback:", err);
          targetSessionId = "sess_" + Date.now();
          setActiveSessionId(targetSessionId);
          currentSessionIdRef.current = targetSessionId;
        }

        // Cache session list
        try {
          const rawSessions = localStorage.getItem("adviza_chat_sessions");
          let sessionsList = rawSessions ? JSON.parse(rawSessions) : [];
          if (!Array.isArray(sessionsList)) sessionsList = [];
          if (!sessionsList.some((s: any) => s.id === targetSessionId)) {
            sessionsList = [
              {
                id: targetSessionId,
                title: rawQuery.slice(0, 36) || "Wealth Advisory Session",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              ...sessionsList,
            ];
          }
          localStorage.setItem("adviza_chat_sessions", JSON.stringify(sessionsList));
          window.dispatchEvent(new CustomEvent("adviza:chat-sessions-updated"));
        } catch {}
      }

      // Prepare multi-turn history (last 8 messages)
      const chatHistory = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Stream response using SSE
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          modelId: selectedModel,
          sessionId: targetSessionId,
          ambientContext: ambient,
          history: chatHistory,
          deepResearch,
          webSearch,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat request failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsgId = "ast-" + Date.now();
      let assistantText = "";
      let isFirstChunk = true;
      let executedResults: any[] = [];
      let missingConnectors: any[] = [];
      let hitlPrompts: any[] = [];
      let buffer = "";
      let lastRenderTime = 0;

      // Throttle rendering updates to ~25fps (every 40ms) to prevent freezing main thread
      const syncAssistantMessage = (force = false) => {
        const now = Date.now();
        if (force || now - lastRenderTime >= 40) {
          lastRenderTime = now;
          if (isFirstChunk) {
            isFirstChunk = false;
            setMessages((prev) => [
              ...prev,
              {
                id: assistantMsgId,
                role: "assistant",
                content: assistantText,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                citations: searchCitations.length > 0 ? searchCitations : undefined,
                isDeepResearch: deepResearch,
                isWebSearch: webSearch,
                executedResults: executedResults.length > 0 ? executedResults : undefined,
                missingConnectors: missingConnectors.length > 0 ? missingConnectors : undefined,
                hitlPrompts: hitlPrompts.length > 0 ? hitlPrompts : undefined,
              },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: assistantText,
                      executedResults: executedResults.length > 0 ? executedResults : m.executedResults,
                      missingConnectors: missingConnectors.length > 0 ? missingConnectors : m.missingConnectors,
                      hitlPrompts: hitlPrompts.length > 0 ? hitlPrompts : m.hitlPrompts,
                    }
                  : m
              )
            );
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process all complete SSE messages delimited by "\n\n"
        let boundaryIndex: number;
        while ((boundaryIndex = buffer.indexOf("\n\n")) !== -1) {
          const completeMessage = buffer.slice(0, boundaryIndex);
          buffer = buffer.slice(boundaryIndex + 2);

          const lines = completeMessage.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);

              if (parsed.status) {
                setStatusMessage(parsed.status);
              }

              const deltaText = parsed.delta ?? parsed.choices?.[0]?.delta?.content ?? "";

              if (deltaText) {
                assistantText += deltaText;
                syncAssistantMessage(false);
              }

              if (parsed.executedResults) {
                executedResults = [...executedResults, ...parsed.executedResults];
                syncAssistantMessage(false);
              }

              if (parsed.missingConnectors) {
                missingConnectors = [...missingConnectors, ...parsed.missingConnectors];
                syncAssistantMessage(false);
              }

              if (parsed.hitlPrompts) {
                hitlPrompts = [...hitlPrompts, ...parsed.hitlPrompts];
                syncAssistantMessage(false);
              }

              if (parsed.usage) {
                setUsageStats(parsed.usage);
              }
            } catch (err) {
              console.error("SSE parse error:", err, jsonStr);
            }
          }
        }
      }

      // Final force sync at end of stream
      syncAssistantMessage(true);

      // Persist messages in local storage asynchronously (non-blocking)
      if (targetSessionId) {
        try {
          const finalAssistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: "assistant",
            content: assistantText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            citations: searchCitations.length > 0 ? searchCitations : undefined,
            isDeepResearch: deepResearch,
            isWebSearch: webSearch,
            executedResults: executedResults.length > 0 ? executedResults : undefined,
            missingConnectors: missingConnectors.length > 0 ? missingConnectors : undefined,
            hitlPrompts: hitlPrompts.length > 0 ? hitlPrompts : undefined,
          };
          const rawExisting = localStorage.getItem("adviza_chat_msg_" + targetSessionId);
          let existingMsgs: ChatMessage[] = [];
          if (rawExisting) {
            try {
              existingMsgs = JSON.parse(rawExisting);
            } catch {}
          }
          const filtered = existingMsgs.filter((m) => m.id !== userMsg.id && m.id !== assistantMsgId);
          const toSave = [...filtered, userMsg, finalAssistantMsg];
          localStorage.setItem("adviza_chat_msg_" + targetSessionId, JSON.stringify(toSave));
        } catch {}
      }
    } catch (err) {
      console.error("Chat orchestration error:", err);
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content:
          "I encountered an issue connecting to the AI inference provider. Please check your API keys or select an alternate model from the engine dropdown above.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setStatusMessage(null);
      isSendingRef.current = false;
    }
  };

  const handleClearHistory = () => {
    if (activeSessionId) {
      try {
        localStorage.removeItem("adviza_chat_msg_" + activeSessionId);
      } catch {}
    }
    setMessages([]);
    setShowOptionsMenu(false);
  };

  const activeModelObj =
    CHAT_MODELS.find((m) => m.id === selectedModel) || CHAT_MODELS[0];

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#EADBCE] shadow-xl overflow-hidden relative transition-all duration-300 ${
        isFloating
          ? isExpanded
            ? "w-[580px] h-[780px] max-h-[90vh]"
            : "w-[440px] h-[620px] max-h-[82vh]"
          : "w-full h-full"
      }`}
    >
      {/* Lightweight GPU-friendly ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(244,63,94,0.04),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.04),transparent_50%)] pointer-events-none -z-10" />

      {/* TOP HEADER BAR */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#EADBCE]/80 bg-white/95 z-20">
        {/* Left: Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-[#FAF5F0] hover:bg-[#F2ECE4] border border-[#EADBCE] text-xs font-bold text-[#121217] transition shadow-2xs group"
          >
            <div className="w-5 h-5 rounded-full bg-[#121217] flex items-center justify-center text-white text-[10px] shadow-xs shrink-0">
              <Sparkles className="w-3 h-3 text-rose-400" />
            </div>
            <span className="font-heading font-extrabold text-xs tracking-tight truncate max-w-[110px] sm:max-w-none">
              <span className="sm:hidden">{activeModelObj.shortName}</span>
              <span className="hidden sm:inline">{activeModelObj.name}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E847C] group-hover:text-[#121217] transition-transform shrink-0" />
          </button>

          {/* Model Selection Dropdown Menu */}
          {isModelDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white border border-[#EADBCE] rounded-3xl shadow-2xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8E847C]">
                Select AI Engine
              </div>
              {CHAT_MODELS.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`w-full text-left p-2.5 rounded-2xl flex items-start gap-2.5 transition ${
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
                          {model.multiplier}x
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-rose-600">{model.provider}</span>
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

        {/* Right: Daily Limits, Share, Copy Link, New Chat */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Daily Limits Meter Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUsageModal(!showUsageModal)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#FAF5F0] hover:bg-[#F2ECE4] border border-[#EADBCE] text-xs font-semibold text-[#121217] transition shadow-2xs"
              title="Daily Credit Consumption"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-xs text-[#5A544E]">Daily Limits:</span>
              <span className="font-bold text-amber-700">
                {usageStats.creditsUsedToday}/{usageStats.dailyCreditLimit} Credits
              </span>
            </button>

            {/* Usage Popover */}
            {showUsageModal && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#EADBCE] rounded-2xl shadow-xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE]">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#121217]">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Daily Credit Consumption</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    {usageStats.percentUsed}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#8E847C]">
                    <span>Used: {usageStats.creditsUsedToday}</span>
                    <span>Limit: {usageStats.dailyCreditLimit}</span>
                  </div>
                  <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden border border-[#EADBCE]">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, usageStats.percentUsed)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* More Options `...` */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-1.5 sm:p-2 rounded-2xl text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE] transition"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#EADBCE] rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleClearHistory}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Conversation</span>
                </button>
              </div>
            )}
          </div>

          {/* Copy Shareable Link */}
          <button
            onClick={handleCopyShareLink}
            className="p-1.5 sm:p-2 rounded-2xl text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0] border border-[#EADBCE] transition shadow-2xs"
            title="Copy Chat Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
          </button>

          {/* Share Button */}
          <button
            onClick={handleCopyShareLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] text-xs font-bold text-[#121217] transition shadow-2xs"
          >
            <span>Share</span>
            <Share2 className="w-3.5 h-3.5 text-[#8E847C]" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:opacity-90 text-white text-xs font-bold shadow-sm transition group"
          >
            <span className="hidden xs:inline sm:inline">New Chat</span>
            <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
          </button>
        </div>
      </div>

      {/* MAIN CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 scrollbar-thin">
        {/* HERO / STARTER SCREEN (Clean Executive Interface) */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-8 sm:py-12 px-3 space-y-6">
            {/* Elegant Header Emblem */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#121217] via-[#26201D] to-[#121217] border border-[#EADBCE] shadow-sm flex items-center justify-center text-white transition-transform hover:scale-105">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1.5 px-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#121217] tracking-tight">
                  How can Adviza assist you today?
                </h1>
                <p className="text-xs sm:text-sm text-[#8E847C] max-w-md mx-auto leading-relaxed">
                  Real-time portfolio intelligence, automated workflows, and meeting dossiers.
                </p>
              </div>
            </div>

            {/* Central Floating Elevated Input Box */}
            <div className="w-full max-w-xl space-y-3.5">
              <div className="bg-white rounded-2xl border border-[#EADBCE] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.07)] p-3.5 sm:p-4 space-y-3 transition-all">
                {/* Selected Files Preview Wrap */}
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-1">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2.5 py-1 bg-[#FAF5F0] border border-[#EADBCE] rounded-xl text-xs"
                      >
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <FileIcon className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="max-w-[120px] truncate text-[#121217] font-medium">{file.name}</span>
                        <button
                          onClick={() => {
                            const newFiles = [...selectedFiles];
                            newFiles.splice(idx, 1);
                            setSelectedFiles(newFiles);
                          }}
                          className="text-[#8E847C] hover:text-rose-500 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Seamless Borderless Text Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onPaste={(e) => {
                    if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
                      const filesArray = Array.from(e.clipboardData.files);
                      setSelectedFiles((prev) => [...prev, ...filesArray]);
                    }
                  }}
                  placeholder="Ask about clients, drift analysis, upcoming meetings, or draft a memo..."
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full text-base sm:text-sm text-[#121217] placeholder:text-[#A0958C] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 !outline-none !ring-0"
                />

                {/* Action Bar Inside Input Box */}
                <div className="flex items-center justify-between pt-2 border-t border-[#FAF5F0] gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100vw-115px)] sm:max-w-none flex-nowrap sm:flex-wrap shrink min-w-0">
                    {/* Attach File Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0] transition shrink-0"
                      title="Attach Image or Document"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Think Longer / Deep Reasoning Toggle */}
                    <button
                      type="button"
                      onClick={() => setThinkLonger(!thinkLonger)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                        thinkLonger
                          ? "bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                          : "text-[#7D736A] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE]"
                      }`}
                      title={thinkLonger ? "Deep Reasoning Active" : "Enable Deep Reasoning"}
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${thinkLonger ? "text-amber-600 fill-amber-500/20" : "text-[#8E847C]"}`} />
                      <span>Think Longer</span>
                    </button>

                    {/* Deep Research Toggle */}
                    <button
                      type="button"
                      onClick={() => setDeepResearch(!deepResearch)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                        deepResearch
                          ? "bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-2xs"
                          : "text-[#7D736A] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE]"
                      }`}
                      title={deepResearch ? "Deep Research Active (Multi-source evidence synthesis)" : "Enable Deep Research"}
                    >
                      <FlaskConical className={`w-3.5 h-3.5 ${deepResearch ? "text-indigo-600 fill-indigo-500/20" : "text-[#8E847C]"}`} />
                      <span>Deep Research</span>
                    </button>

                    {/* Web Search Toggle */}
                    <button
                      type="button"
                      onClick={() => setWebSearch(!webSearch)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                        webSearch
                          ? "bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs"
                          : "text-[#7D736A] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE]"
                      }`}
                      title={webSearch ? "Live Web Search Active" : "Enable Live Web Search"}
                    >
                      <Globe className={`w-3.5 h-3.5 ${webSearch ? "text-sky-600" : "text-[#8E847C]"}`} />
                      <span>Web Search</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Voice Dictation Button */}
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`p-1.5 rounded-lg transition ${
                        isListening
                          ? "bg-rose-50 text-rose-600 animate-pulse"
                          : "text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0]"
                      }`}
                      title="Voice Dictation"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Send Button */}
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={(!input.trim() && selectedFiles.length === 0) || loading}
                      className="w-8 h-8 rounded-xl bg-[#121217] hover:bg-[#2A2421] disabled:opacity-30 text-white flex items-center justify-center shadow-xs transition-all hover:scale-105 shrink-0"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Curated Action Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-1">
                <button
                  onClick={() =>
                    handleSendMessage("Audit our client portfolio asset allocation drift against target benchmarks.")
                  }
                  className="p-3 rounded-xl bg-white/90 hover:bg-white border border-[#EADBCE]/80 hover:border-[#D0C0B0] shadow-2xs hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-xs text-[#121217]">Portfolio Drift</span>
                  </div>
                  <p className="text-[11px] text-[#8E847C] line-clamp-1">Audit asset allocations vs benchmarks</p>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage("Prepare a comprehensive client briefing dossier ahead of today's review meeting.")
                  }
                  className="p-3 rounded-xl bg-white/90 hover:bg-white border border-[#EADBCE]/80 hover:border-[#D0C0B0] shadow-2xs hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-xs text-[#121217]">Meeting Dossier</span>
                  </div>
                  <p className="text-[11px] text-[#8E847C] line-clamp-1">Synthesize client notes & holdings</p>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage("What are my open action items and pending fiduciary follow-ups?")
                  }
                  className="p-3 rounded-xl bg-white/90 hover:bg-white border border-[#EADBCE]/80 hover:border-[#D0C0B0] shadow-2xs hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-xs text-[#121217]">Action Items</span>
                  </div>
                  <p className="text-[11px] text-[#8E847C] line-clamp-1">Track priority tasks and deadlines</p>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage("Summarize the status and recent runs of all active workflows.")
                  }
                  className="p-3 rounded-xl bg-white/90 hover:bg-white border border-[#EADBCE]/80 hover:border-[#D0C0B0] shadow-2xs hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-xs text-[#121217]">Active Workflows</span>
                  </div>
                  <p className="text-[11px] text-[#8E847C] line-clamp-1">Monitor automated onboarding & reviews</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE MESSAGE STREAM */
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 sm:gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-[#121217] flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
                  </div>
                )}

                <div className={`max-w-[95%] sm:max-w-[85%] space-y-2`}>
                  {m.role === "user" ? (
                    <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl leading-relaxed text-xs sm:text-sm bg-[#121217] text-white rounded-tr-xs shadow-sm space-y-2">
                      {/* Active Prompt Mode Badges */}
                      {(m.isDeepResearch || m.isWebSearch || m.thinkLonger || (m.attachedFiles && m.attachedFiles.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-zinc-700/60">
                          {m.isDeepResearch && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                              <FlaskConical className="w-3 h-3 text-indigo-400" />
                              <span>Deep Research</span>
                            </span>
                          )}
                          {m.isWebSearch && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                              <Globe className="w-3 h-3 text-sky-400" />
                              <span>Live Search</span>
                            </span>
                          )}
                          {m.thinkLonger && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              <Lightbulb className="w-3 h-3 text-amber-400" />
                              <span>Think Longer</span>
                            </span>
                          )}
                          {m.attachedFiles?.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700">
                              <Paperclip className="w-2.5 h-2.5" />
                              <span className="max-w-[120px] truncate">{f.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      <div className="text-[10px] text-zinc-400 text-right">{m.timestamp}</div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FAF5F0] text-[#121217] border border-[#EADBCE] rounded-tl-xs shadow-2xs space-y-3">
                      {/* Enterprise Markdown Rendered Content */}
                      <MarkdownContent content={m.content} />

                      {/* Interactive Bottom Action Toolbar */}
                      <div className="pt-2 border-t border-[#EADBCE]/60">
                        <MessageActions
                          content={m.content}
                          timestamp={m.timestamp}
                          isDeepResearch={m.isDeepResearch}
                        />
                      </div>
                    </div>
                  )}

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
                            handleSendMessage(
                              `${decision === "approved" ? "Approved" : "Rejected"} action ${p.actionId}.`
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Search / Deep Research Citation Sources */}
                  {m.citations && m.citations.length > 0 && (
                    <CitationSourcesCard
                      citations={m.citations}
                      isDeepResearch={m.isDeepResearch}
                    />
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5 font-bold text-xs">
                    U
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-2xl bg-[#121217] flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
                  <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                </div>
                <div className="max-w-[85%] p-4 rounded-3xl bg-[#FAF5F0] text-[#121217] border border-[#EADBCE] rounded-tl-xs space-y-2 shadow-2xs">
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
        )}
      </div>

      {/* DOCKED BOTTOM INPUT BAR (Active Chat Mode) */}
      {messages.length > 0 && (
        <div className="p-2 sm:p-4 border-t border-[#EADBCE] bg-white/95 backdrop-blur-md z-20">
          <div className="max-w-3xl mx-auto space-y-1.5 sm:space-y-2">
            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2.5 py-1 bg-[#FAF5F0] border border-[#EADBCE] rounded-xl text-xs"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <FileIcon className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="max-w-[120px] truncate text-[#121217] font-medium">{file.name}</span>
                    <button
                      onClick={() => {
                        const newFiles = [...selectedFiles];
                        newFiles.splice(idx, 1);
                        setSelectedFiles(newFiles);
                      }}
                      className="text-[#8E847C] hover:text-rose-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Elevated Input Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EADBCE] shadow-sm hover:shadow-md p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                onPaste={(e) => {
                  if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
                    const filesArray = Array.from(e.clipboardData.files);
                    setSelectedFiles((prev) => [...prev, ...filesArray]);
                  }
                }}
                placeholder={`Ask Adviza (${activeModelObj.shortName})...`}
                disabled={loading}
                style={{ outline: "none", boxShadow: "none", border: "none" }}
                className="w-full text-base sm:text-sm text-[#121217] placeholder:text-[#8E847C] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 !outline-none !ring-0"
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#FAF5F0] gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100vw-115px)] sm:max-w-none flex-nowrap sm:flex-wrap shrink min-w-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0] transition shrink-0"
                    title="Attach Image or Document"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setThinkLonger(!thinkLonger)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      thinkLonger
                        ? "bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                        : "text-[#7D736A] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE]"
                    }`}
                    title={thinkLonger ? "Deep Reasoning Active" : "Enable Deep Reasoning"}
                  >
                    <Lightbulb className={`w-3.5 h-3.5 ${thinkLonger ? "text-amber-600 fill-amber-500/20" : "text-[#8E847C]"}`} />
                    <span>Think Longer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeepResearch(!deepResearch)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      deepResearch
                        ? "bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-2xs"
                        : "text-[#7D736A] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE]"
                    }`}
                    title={deepResearch ? "Deep Research Active (Multi-source evidence synthesis)" : "Enable Deep Research"}
                  >
                    <FlaskConical className={`w-3.5 h-3.5 ${deepResearch ? "text-indigo-600 fill-indigo-500/20 animate-pulse" : "text-[#8E847C]"}`} />
                    <span>Deep Research</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWebSearch(!webSearch)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      webSearch
                        ? "bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs"
                        : "text-[#7D736A] hover:text-[#121217] hover:bg-[#FAF5F0] border border-transparent hover:border-[#EADBCE]"
                    }`}
                    title={webSearch ? "Live Web Search Active" : "Enable Live Web Search"}
                  >
                    <Globe className={`w-3.5 h-3.5 ${webSearch ? "text-sky-600" : "text-[#8E847C]"}`} />
                    <span>Web Search</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`p-1.5 rounded-lg transition ${
                      isListening
                        ? "bg-rose-50 text-rose-600 animate-pulse"
                        : "text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0]"
                    }`}
                    title="Voice Dictation"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={(!input.trim() && selectedFiles.length === 0) || loading}
                    className="w-8 h-8 rounded-xl bg-[#121217] hover:bg-[#2A2421] disabled:opacity-30 text-white flex items-center justify-center shadow-xs transition-all hover:scale-105 shrink-0"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="text-center text-[10px] text-[#8E847C] pt-0.5 sm:pt-1">
              Adviza generates AI-based answers. Review key details for accuracy.
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Picker */}
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />
    </div>
  );
}
