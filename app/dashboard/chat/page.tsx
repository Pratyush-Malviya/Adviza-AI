"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatSidebar, ChatSessionItem } from "@/components/chat/chat-sidebar";

const INITIAL_STARTER_SESSIONS: ChatSessionItem[] = [
  {
    id: "sess_calendar_today",
    title: "Google Calendar meetings query",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sess_july_audit",
    title: "July client meeting audit",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "sess_briefing_sarah",
    title: "Sarah Jenkins Briefing Dossier",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function ChatDashboardPage() {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all chat sessions with localStorage caching
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Instant load from local storage
      try {
        const cached = localStorage.getItem("adviza_chat_sessions");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
          }
        }
      } catch {}

      // 2. Fetch from DB
      const res = await fetch("/api/ai/chat-sessions");
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        setSessions(data.sessions);
        try {
          localStorage.setItem("adviza_chat_sessions", JSON.stringify(data.sessions));
        } catch {}
      } else {
        setSessions((prev) => {
          if (prev.length > 0) return prev;
          try {
            localStorage.setItem("adviza_chat_sessions", JSON.stringify(INITIAL_STARTER_SESSIONS));
          } catch {}
          return INITIAL_STARTER_SESSIONS;
        });
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
      setSessions((prev) => (prev.length > 0 ? prev : INITIAL_STARTER_SESSIONS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsMobileDrawerOpen(false);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setIsMobileDrawerOpen(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem("adviza_chat_sessions", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }

    try {
      await fetch("/api/ai/chat-sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error("Failed to delete session on server:", err);
    }
  };

  const handleSessionCreated = (newSession: { id: string; title: string }) => {
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === newSession.id);
      if (exists) return prev;
      const updated = [
        {
          id: newSession.id,
          title: newSession.title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ];
      try {
        localStorage.setItem("adviza_chat_sessions", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] flex flex-row gap-5 transition-all duration-300">
      {/* Mobile Backdrop Overlay */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Slide-in Side Drawer (Side Navigation) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white p-3 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          loading={loading}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />
      </div>

      {/* Desktop Left Sidebar: Collapsible Claude & Gemini style Side History */}
      <div
        className={`hidden md:flex h-full shrink-0 transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-72 lg:w-80"
        }`}
      >
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          loading={loading}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main Full-Size Chat Panel */}
      <div className="flex-1 h-full w-full min-h-[500px] transition-all duration-300">
        <ChatPanel
          sessionId={activeSessionId}
          onSessionCreated={handleSessionCreated}
          onOpenHistory={() => setIsMobileDrawerOpen(true)}
        />
      </div>
    </div>
  );
}
