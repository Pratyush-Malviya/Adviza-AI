"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Lock,
  Search,
  CheckCircle2,
  Zap,
} from "lucide-react";

export function SpecDashboardShowcase() {
  const [activeTab, setActiveTab] = useState("briefing");

  return (
    <section id="dashboard" className="py-28 px-6 bg-[#F8F9FC] border-y border-[#E5E7EB] relative overflow-hidden">
      {/* Soft Radial Lighting Gradients */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-[700px] h-[350px] bg-[#4F6EF7]/10 blur-[130px] rounded-full" />

      <div className="max-w-[1280px] mx-auto space-y-12 relative z-10 text-center">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-xs font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Unified Execution Interface</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#111827] tracking-tight">
            Designed for institutional wealth workflows
          </h2>

          <p className="text-base sm:text-lg text-[#6B7280]">
            Everything your fiduciary advisors and compliance officers need in a single pane of glass.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-xs gap-2">
            {[
              { id: "briefing", label: "Client Dossiers" },
              { id: "transcripts", label: "Ambient Transcription" },
              { id: "drift", label: "Portfolio Drift" },
              { id: "compliance", label: "SEC WORM Audit" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#4F6EF7] text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Large Centered Dashboard Mockup with 28px Radius & Soft Shadow */}
        <div className="relative max-w-5xl mx-auto rounded-[28px] bg-white border border-[#E5E7EB] shadow-spec-card p-6 sm:p-8 text-left transition-all duration-300">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F6EF7] to-[#7A8DFF] flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Adviza Institutional Suite</h4>
                <p className="text-[11px] text-[#6B7280]">Fiduciary RIA Workspace v2.6 · Production</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[#6B7280]">
                <Search className="w-3.5 h-3.5" />
                <span>Search clients, accounts, or audit records...</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Inner Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Client Profile */}
            <div className="p-5 rounded-2xl bg-[#F8F9FC] border border-[#E5E7EB] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Client Context</span>
                <span className="text-[11px] font-mono text-[#4F6EF7] font-semibold">Tier 1 AUM</span>
              </div>

              <div>
                <h5 className="text-base font-bold text-[#111827]">Marcus & Sarah Vance</h5>
                <p className="text-xs text-[#6B7280]">Family Office & Taxable Trust</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Total Custodied AUM:</span>
                  <span className="font-bold text-[#111827] font-mono">$6,420,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Primary Custodian:</span>
                  <span className="font-medium text-[#111827]">Fidelity Institutional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Risk Tolerance:</span>
                  <span className="font-medium text-[#111827]">Moderate Growth (65/35)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Live AI Model Output */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">AI Executive Brief</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] font-semibold">
                  Claude 3.5 Sonnet
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#4B5563]">
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                  ✓ Portfolio drift detected in Core Equity (+4.1%). Rebalance proposal drafted with $32k harvested loss.
                </p>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                  ✓ Meeting scheduled for today at 2:00 PM EST. Ambient audio transcription stream primed.
                </p>
              </div>
            </div>

            {/* Column 3: WORM Audit Status */}
            <div className="p-5 rounded-2xl bg-[#F8F9FC] border border-[#E5E7EB] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Compliance Seal</span>
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] text-xs font-mono space-y-1.5">
                <div className="text-[#22C55E] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SEC Rule 204-2 Verified
                </div>
                <div className="truncate text-[11px] text-[#6B7280]">
                  SHA-256: d4a7...992f8e
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  Stored on Cryptographic WORM Vault
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#111827] text-white hover:bg-slate-800 transition">
                Export 1-Click Exam Packet
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
