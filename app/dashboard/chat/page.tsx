"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatSidebar, ChatSessionItem } from "@/components/chat/chat-sidebar";

export default function ChatDashboardPage() {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all chat sessions
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/chat-sessions");
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/ai/chat-sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSessionCreated = (newSession: { id: string; title: string }) => {
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === newSession.id);
      if (exists) return prev;
      return [
        {
          id: newSession.id,
          title: newSession.title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-5">
      {/* Left Sidebar: Claude & Gemini style Chat History */}
      <div className="w-full md:w-72 lg:w-80 h-full shrink-0">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          loading={loading}
        />
      </div>

      {/* Main Full-Size Chat Panel */}
      <div className="flex-1 h-full min-h-[500px]">
        <ChatPanel
          sessionId={activeSessionId}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}
