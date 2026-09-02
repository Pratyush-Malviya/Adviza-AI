"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Loader2 } from "lucide-react";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get("sessionId") || null;

  const handleSessionCreated = (newSession: { id: string; title: string }) => {
    // Notify primary sidebar to refresh sessions immediately
    window.dispatchEvent(new CustomEvent("adviza:chat-sessions-updated"));
    router.push(`/dashboard/chat?sessionId=${newSession.id}`);
  };

  return (
    <div className="w-full h-[calc(100vh-130px)] min-h-[550px] transition-all duration-300">
      <ChatPanel
        sessionId={sessionId}
        onSessionCreated={handleSessionCreated}
        onNewChat={() => router.push("/dashboard/chat")}
      />
    </div>
  );
}

export default function ChatDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-130px)] flex items-center justify-center bg-white rounded-3xl border border-[#EADBCE]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#8E847C]">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            <span>Loading Adviza Chat...</span>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
