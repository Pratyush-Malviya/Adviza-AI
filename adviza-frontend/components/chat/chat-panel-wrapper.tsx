"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, MessageSquare, X } from "lucide-react";
import { ChatPanel } from "./chat-panel";
import { usePathname } from "next/navigation";

export function ChatPanelWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Keyboard shortcut Ctrl+J / Cmd+J to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't render floating widget if user is on the dedicated full-screen /dashboard/chat route
  if (pathname === "/dashboard/chat") {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-full shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white animate-pulse" />
            </div>
            <span className="font-semibold text-xs tracking-wide">Ask Adviza AI</span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 bg-white/20 text-white/90 rounded font-mono">
              ⌘J
            </span>
          </button>
        )}
      </div>

      {/* Slide-over / Floating Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ChatPanel isFloating onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
