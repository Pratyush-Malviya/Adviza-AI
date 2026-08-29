"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Search,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  Check,
} from "lucide-react";

export interface ChatSessionItem {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  lastMessage?: string;
}

interface ChatSidebarProps {
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  loading?: boolean;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  loading = false,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupSessions = (items: ChatSessionItem[]) => {
    const today: ChatSessionItem[] = [];
    const yesterday: ChatSessionItem[] = [];
    const last7Days: ChatSessionItem[] = [];
    const earlier: ChatSessionItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = todayStart - 7 * 86400000;

    items.forEach((item) => {
      const itemTime = new Date(item.updated_at || item.created_at).getTime();
      if (itemTime >= todayStart) {
        today.push(item);
      } else if (itemTime >= yesterdayStart) {
        yesterday.push(item);
      } else if (itemTime >= sevenDaysAgo) {
        last7Days.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, last7Days, earlier };
  };

  const groups = groupSessions(filteredSessions);

  const renderGroup = (title: string, groupItems: ChatSessionItem[]) => {
    if (groupItems.length === 0) return null;

    return (
      <div className="space-y-1">
        <h4 className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8E847C]/80">
          {title}
        </h4>
        <div className="space-y-0.5">
          {groupItems.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition text-xs select-none ${
                  isActive
                    ? "bg-[#121217] text-white shadow-xs font-semibold"
                    : "hover:bg-[#FAF5F0] text-[#4A443E] hover:text-[#121217]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-rose-400" : "text-[#8E847C] group-hover:text-rose-500"
                    }`}
                  />
                  <span className="truncate leading-normal">{session.title || "Untitled Session"}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id, e);
                  }}
                  className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition shrink-0 ${
                    isActive
                      ? "hover:bg-white/20 text-rose-300 hover:text-white"
                      : "hover:bg-rose-50 text-[#8E847C] hover:text-rose-600"
                  }`}
                  title="Delete chat thread"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-[#EADBCE] p-3.5 shadow-sm space-y-3">
      {/* New Chat Primary Button */}
      <button
        onClick={onNewChat}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#121217] hover:bg-[#2A2A35] text-white rounded-2xl text-xs font-bold transition shadow-sm group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span>New Chat</span>
        </div>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Search Threads */}
      {sessions.length > 3 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8E847C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF5F0] border border-[#EADBCE]/60 text-xs text-[#121217] placeholder:text-[#8E847C] focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      )}

      {/* History List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {loading ? (
          <div className="py-10 text-center text-xs text-[#8E847C] space-y-2">
            <Clock className="w-5 h-5 animate-spin mx-auto text-rose-500" />
            <span>Loading chat history...</span>
          </div>
        ) : filteredSessions.length > 0 ? (
          <>
            {renderGroup("Today", groups.today)}
            {renderGroup("Yesterday", groups.yesterday)}
            {renderGroup("Previous 7 Days", groups.last7Days)}
            {renderGroup("Earlier", groups.earlier)}
          </>
        ) : (
          <div className="py-12 text-center text-xs text-[#8E847C] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF5F0] flex items-center justify-center mx-auto text-[#8E847C]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#5A544E]">No chat history yet</p>
            <p className="text-[11px]">Start a conversation to create your first thread.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#EADBCE]/60 px-2 flex items-center justify-between text-[11px] text-[#8E847C]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Adviza Gateway</span>
        </div>
        <span className="font-mono text-[10px]">{sessions.length} chats</span>
      </div>
    </div>
  );
}
