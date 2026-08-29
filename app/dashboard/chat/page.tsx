"use client";

import React from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { MessageSquare, Sparkles, Shield, Zap, FileText } from "lucide-react";
import { CAPABILITY_REGISTRY } from "@/lib/capabilities/registry";

export default function ChatDashboardPage() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* Left Sidebar: Capabilities & Quick Context */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-[#EADBCE] p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#121217]">Chat Orchestrator</h2>
              <p className="text-xs text-[#8E847C]">Autonomous AI Agent Gateway</p>
            </div>
          </div>
          <p className="text-xs text-[#5A544E] leading-relaxed">
            Adviza Chat connects directly to your Fiduciary Agent Fleet and 150+ Composio connectors. Actions execute with strict compliance audit logging.
          </p>
        </div>

        {/* Capability Roster */}
        <div className="flex-1 bg-white rounded-2xl border border-[#EADBCE] p-4 shadow-sm overflow-y-auto">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#8E847C] mb-3">
            Active Capabilities ({CAPABILITY_REGISTRY.length})
          </h3>
          <div className="space-y-2">
            {CAPABILITY_REGISTRY.slice(0, 8).map((cap) => (
              <div
                key={cap.id}
                className="p-2.5 rounded-xl bg-[#FAF5F0] border border-[#EADBCE]/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#121217]">{cap.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 font-medium rounded-md uppercase">
                    {cap.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#5A544E] line-clamp-2">{cap.description}</p>
                {cap.requiresHITL && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium pt-0.5">
                    <Shield className="w-3 h-3" />
                    <span>Requires Advisor HITL Sign-Off</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Full-Size Chat Panel */}
      <div className="flex-1 h-full min-h-[500px]">
        <ChatPanel />
      </div>
    </div>
  );
}
