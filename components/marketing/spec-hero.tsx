"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  TrendingUp,
  FileText,
  Clock,
  Sliders,
  Sparkles,
} from "lucide-react";

export function SpecHero() {
  return (
    <section className="relative pt-36 pb-24 px-6 overflow-hidden bg-gradient-to-b from-[#F8F9FC] via-white to-white">
      {/* Background Soft Lighting Gradients */}
      <div className="pointer-events-none absolute -top-24 right-0 w-[600px] h-[600px] bg-[#4F6EF7]/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -left-36 w-[500px] h-[500px] bg-[#6C8DFF]/10 blur-[120px] rounded-full" />

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        {/* Left Column: 6 Columns */}
        <div className="lg:col-span-6 space-y-7 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-xs font-semibold tracking-wide border border-[#4F6EF7]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#4F6EF7]" />
            <span>Autonomous Execution for Wealth Advisory</span>
          </div>

          {/* 72px Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-heading font-extrabold text-[#111827] tracking-tight leading-[1.1]">
            Turn manual advisor drag into{" "}
            <span className="text-[#4F6EF7]">instant execution</span>
          </h1>

          {/* 20px Subtitle */}
          <p className="text-lg sm:text-[20px] text-[#6B7280] font-normal leading-relaxed max-w-xl">
            AI agents that prepare client meeting dossiers, record ambient minutes, calculate portfolio drift, and seal SEC/FINRA compliance records in real time.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/signup"
              className="btn-spec-primary px-8 py-4 text-base font-semibold inline-flex items-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="btn-spec-secondary px-8 py-4 text-base font-semibold inline-flex items-center gap-2"
            >
              <span>Schedule Demo</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              SOC 2 Type II Certified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              15-minute onboarding
            </span>
          </div>
        </div>

        {/* Right Column: 6 Columns - Floating Dashboard Preview */}
        <div className="lg:col-span-6 relative">
          {/* Main Dashboard Container */}
          <div className="relative rounded-[28px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-spec-card hover:shadow-spec-card-hover transition-shadow duration-300">
            {/* Top Mockup Header Bar */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-xs font-mono text-[#6B7280] ml-3">
                  adviza.app/workspace/client-dossier
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Live Custodian Feed
              </div>
            </div>

            {/* Dashboard Inner View */}
            <div className="space-y-4">
              {/* Client Briefing Header */}
              <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#111827]">Thorne Family Trust</h4>
                  <p className="text-xs text-[#6B7280]">Charles Schwab Custody · Account #8941</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#111827] block font-mono">$4,850,000</span>
                  <span className="text-[11px] font-semibold text-[#22C55E]">+6.4% YTD Growth</span>
                </div>
              </div>

              {/* Grid with 2 Mini Analytics Widgets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1 shadow-xs">
                  <span className="text-[11px] font-medium text-[#6B7280] block">Portfolio Drift Margin</span>
                  <span className="text-sm font-bold text-[#F59E0B] font-mono">+3.4% Large Growth</span>
                  <p className="text-[10px] text-[#6B7280]">Rebalance trigger at 3.0%</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-1 shadow-xs">
                  <span className="text-[11px] font-medium text-[#6B7280] block">Tax-Loss Harvesting</span>
                  <span className="text-sm font-bold text-[#22C55E] font-mono">$24,800 Offset</span>
                  <p className="text-[10px] text-[#6B7280]">Municipal swap ready</p>
                </div>
              </div>

              {/* Live Scribe Feed Preview */}
              <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#4F6EF7]" />
                    Ambient Meeting Audio Stream
                  </span>
                  <span className="text-[10px] font-mono text-[#4F6EF7] font-semibold">
                    Live Recording
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] italic">
                  &ldquo;Client approved shifting $580k from equities into short-duration treasuries before Q4.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Floating Widget 1 (Top Right) - Looping Floating Animation */}
          <div className="hidden sm:flex absolute -right-6 -top-6 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-spec-card items-center gap-3 animate-floating-dashboard z-20">
            <div className="w-10 h-10 rounded-xl bg-[#4F6EF7]/10 flex items-center justify-center text-[#4F6EF7]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">4.2 Hours Saved Daily</p>
              <p className="text-[11px] text-[#6B7280]">Automated CRM memo push</p>
            </div>
          </div>

          {/* Floating Widget 2 (Bottom Left) */}
          <div className="hidden sm:flex absolute -left-6 -bottom-6 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-spec-card items-center gap-3 animate-floating-dashboard z-20">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">SEC Reg BI Verified</p>
              <p className="text-[11px] text-[#6B7280]">WORM SHA-256 sealed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
