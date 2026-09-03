"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  Activity,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";

export function SpecFeatures() {
  return (
    <section id="features" className="py-28 px-6 bg-white space-y-28 max-w-[1280px] mx-auto">
      {/* Block 1: Image Left, Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Visual / Mockup Left: 6 Cols */}
        <div className="lg:col-span-6 rounded-[28px] bg-[#F8F9FC] border border-[#E5E7EB] p-6 sm:p-8 shadow-spec-card">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4F6EF7]/10 flex items-center justify-center text-[#4F6EF7]">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Synthesized Client Briefing</h4>
                  <p className="text-[11px] text-[#6B7280]">Generated automatically at 8:00 AM</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E]">
                Ready in 1.4s
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#4B5563]">
              <div className="p-3 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                <strong className="text-[#111827] block mb-0.5">Custodian Holdings Drift:</strong>
                Equities at 68.4% vs 65.0% target. +$165,000 Large Growth drift across Schwab accounts.
              </div>
              <div className="p-3 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                <strong className="text-[#111827] block mb-0.5">Family Life Event:</strong>
                Son admitted to Stanford Graduate School of Business. Review 529 rollover schedule.
              </div>
              <div className="p-3 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                <strong className="text-[#111827] block mb-0.5">Open Advisor Commitment:</strong>
                Send municipal bond comparison for taxable trust accounts.
              </div>
            </div>
          </div>
        </div>

        {/* Content Right: 6 Cols */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pre-Meeting Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#111827] tracking-tight leading-[1.2]">
            Never spend 45 minutes hunting through notes again
          </h2>

          <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">
            Adviza interrogates your custodians, CRM records, and email archives before every client review, synthesizing an executive 1-page briefing before your morning coffee.
          </p>

          <ul className="space-y-3 text-sm sm:text-base text-[#111827]">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Real-time balance queries across Schwab, Fidelity, and Pershing</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Automatic extraction of open commitments and family milestones</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Pre-meeting briefing ready on your desktop and mobile device</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-base font-semibold text-[#4F6EF7] hover:text-[#3B54D4] transition"
            >
              <span>Explore Pre-Meeting Briefings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Block 2: Content Left, Image Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Content Left: 6 Cols */}
        <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Ambient Dual-Stream Scribe</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#111827] tracking-tight leading-[1.2]">
            Be 100% present while AI captures every commitment
          </h2>

          <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">
            An unobtrusive background listener captures high-fidelity audio, separates advisor and client voices, and drafts personalized client emails with two-way CRM sync within 60 seconds.
          </p>

          <ul className="space-y-3 text-sm sm:text-base text-[#111827]">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Zero distraction typing notes during sensitive financial conversations</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Automated task extraction pushed directly into Salesforce FSC or Wealthbox</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Personalized recap email waiting in your inbox for one-click approval</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-base font-semibold text-[#4F6EF7] hover:text-[#3B54D4] transition"
            >
              <span>See Ambient Transcription in Action</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Visual / Mockup Right: 6 Cols */}
        <div className="lg:col-span-6 rounded-[28px] bg-[#F8F9FC] border border-[#E5E7EB] p-6 sm:p-8 shadow-spec-card order-1 lg:order-2">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#111827]">Dual-Channel Scribe Active</span>
              </div>
              <span className="text-xs font-mono text-[#6B7280]">00:34:18</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <span className="font-bold text-[#4F6EF7] block mb-1">Advisor (Channel 1):</span>
                &ldquo;We reviewed the quarterly performance and agreed to reallocate 10% to short duration treasuries.&rdquo;
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <span className="font-bold text-slate-700 block mb-1">Client (Channel 2):</span>
                &ldquo;Yes, let&apos;s execute that before Friday. Also please confirm the wire instructions for our real estate deposit.&rdquo;
              </div>

              <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#15803D] font-medium flex items-center justify-between">
                <span>Action item verified & queued:</span>
                <span className="font-bold font-mono">2 CRM Updates Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block 3: Image Left, Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Visual / Mockup Left: 6 Cols */}
        <div className="lg:col-span-6 rounded-[28px] bg-[#F8F9FC] border border-[#E5E7EB] p-6 sm:p-8 shadow-spec-card">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4F6EF7]" />
                <span className="text-sm font-bold text-[#111827]">Deterministic Rebalance Sandbox</span>
              </div>
              <span className="text-xs font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full font-bold">
                0.00% Formula Error
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="font-medium text-[#111827]">Vanguard Total Stock Market (VTI)</span>
                <span className="font-mono text-red-600 font-semibold">Trim $85,000</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                <span className="font-medium text-[#111827]">iShares 1-3 Year Treasury (SHY)</span>
                <span className="font-mono text-[#22C55E] font-semibold">Buy $85,000</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <strong>Fiduciary Gate:</strong> Human-in-the-loop advisor signature required prior to execution.
              </div>
            </div>
          </div>
        </div>

        {/* Content Right: 6 Cols */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Quantitative Execution</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#111827] tracking-tight leading-[1.2]">
            Mathematical precision with fiduciary safeguards
          </h2>

          <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">
            Eliminate complex spreadsheet calculation errors. Adviza runs deterministic mathematical portfolio drift simulations with automatic tax-loss harvest offsets.
          </p>

          <ul className="space-y-3 text-sm sm:text-base text-[#111827]">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Zero hallucination: Math is evaluated in a sandboxed execution engine</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Tax-loss harvesting identification with wash-sale prevention logic</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
              <span>Mandatory advisor sign-off gate before any custodian order creation</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-base font-semibold text-[#4F6EF7] hover:text-[#3B54D4] transition"
            >
              <span>Learn About Deterministic Rebalancing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
