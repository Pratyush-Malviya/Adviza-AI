"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  FileText,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface HeroProps {
  badge?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function HeroContiant({
  badge = "Enterprise AI Operating System",
  headline = "Autonomous execution for",
  subheadline = "Adviza orchestrates client meeting dossiers, ambient dual-stream audio transcription, deterministic portfolio drift rebalancing, and SEC Rule 204-2 compliance documentation — so advisors can focus 100% on high-net-worth clients.",
  primaryCtaText = "Start Free Advisor Trial",
  primaryCtaLink = "/auth/signup",
  secondaryCtaText = "Book Institutional Demo",
  secondaryCtaLink = "/contact",
}: HeroProps) {
  return (
    <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0D0D0C]">
      {/* Subtle Radial Glow in Contiant Purple */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-[650px] h-[350px] bg-[#8247FF]/15 blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
        {/* Contiant Micro Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F2933]/80 border border-white/10 text-white text-[11px] font-mono tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-[#8247FF] animate-pulse" />
          <span className="text-white/90 font-semibold">{badge}</span>
        </div>

        {/* Hero Title with Signature Animated Underline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.1]">
          {headline}{" "}
          <span className="title-underline-wrapper text-white">
            Wealth Advisory
            <svg
              className="title-underline-svg"
              viewBox="0 0 320 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 6 13 Q 160 3 314 15"
                stroke="#8247FF"
                strokeWidth="4.5"
                strokeLinecap="round"
                className="title-underline-path"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-[#9AA5B1] max-w-3xl mx-auto leading-relaxed font-normal">
          {subheadline}
        </p>

        {/* CTA Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primaryCtaLink}
            className="btn-contiant-primary inline-flex items-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-semibold shadow-lg shadow-[#8247FF]/25"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={secondaryCtaLink}
            className="btn-contiant-secondary inline-flex items-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-semibold"
          >
            <span>{secondaryCtaText}</span>
          </Link>
        </div>

        {/* Floating 3D Simulated Advisory Interface Cards */}
        <div className="pt-12 relative max-w-5xl mx-auto">
          {/* Main Terminal Window */}
          <div className="relative rounded-3xl bg-[#13131A] border border-white/10 p-4 sm:p-6 text-left shadow-2xl ds-contiant overflow-hidden">
            {/* Top window bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-white/40 ml-3">
                  adviza-agent-grid · session: live-fiduciary-09
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SEC Reg BI Compliant
              </div>
            </div>

            {/* Content grid simulating real-time wealth management intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Live Meeting Dossier */}
              <div className="p-4 rounded-2xl bg-[#1F2933]/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#8247FF]" />
                    Pre-Meeting Dossier
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    Ready in 1.4s
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dr. Aris & Elena Thorne</h4>
                  <p className="text-[11px] text-white/50">$4.85M AUM · High Net Worth</p>
                </div>
                <div className="text-[11px] space-y-1 text-white/60 bg-black/30 p-2.5 rounded-xl font-mono">
                  <div className="flex justify-between">
                    <span>Portfolio Drift:</span>
                    <span className="text-amber-400 font-semibold">+3.4% Large Growth</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Open Commitment:</span>
                    <span className="text-white font-medium">529 rollover verification</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Ambient Dual-Stream Scribe */}
              <div className="p-4 rounded-2xl bg-[#1F2933]/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Ambient Dual Scribe
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8247FF]/20 text-[#DFD1F4]">
                    Active Stream
                  </span>
                </div>
                <div className="text-xs text-white/70 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                  &ldquo;...agreed to rebalance 12% into short-duration municipal bonds to harvest tax losses before year-end.&rdquo;
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>Action item extracted:</span>
                  <span className="text-[#8247FF] font-semibold">2-Way Salesforce Push</span>
                </div>
              </div>

              {/* Card 3: Cryptographic Audit Trail */}
              <div className="p-4 rounded-2xl bg-[#1F2933]/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A9CECC]" />
                    WORM Audit Ledger
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                    SHA-256
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-white/50">
                  <div className="truncate text-emerald-300/80">
                    Hash: 8f9b...3c12d4a
                  </div>
                  <div>SEC Rule 204-2: Signed & Sealed</div>
                  <div className="text-white/40">Custodian ACK: Pershing / Schwab OK</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge 1: Left */}
          <div className="hidden sm:flex absolute -left-6 -bottom-5 p-3.5 rounded-2xl bg-[#1F2933] border border-white/15 shadow-2xl animate-float items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-[#8247FF]/20 flex items-center justify-center text-[#8247FF]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">4.2 Hours Saved</p>
              <p className="text-[10px] text-white/50">Per advisor daily on meeting prep</p>
            </div>
          </div>

          {/* Floating badge 2: Right */}
          <div className="hidden sm:flex absolute -right-6 -top-5 p-3.5 rounded-2xl bg-[#1F2933] border border-white/15 shadow-2xl animate-float-reverse items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">100% Audit Readiness</p>
              <p className="text-[10px] text-white/50">Instant 1-click exam packet export</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
