"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export function SpecCta() {
  return (
    <section className="py-28 px-6 bg-[#0F172A] text-white relative overflow-hidden text-center">
      {/* Soft Blue Radial Glow Animation */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#4F6EF7]/20 blur-[140px] rounded-full" />

      <div className="max-w-[1280px] mx-auto space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#6C8DFF]">
          <Zap className="w-3.5 h-3.5 fill-[#6C8DFF]" />
          <span>Deploy in 15 Minutes</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-heading font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Ready to scale your advisory practice with autonomous AI?
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Join 450+ wealth advisory practices saving 4.2 hours per advisor daily while maintaining 100% SEC & FINRA audit readiness.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="btn-spec-primary px-9 py-4 text-base font-semibold inline-flex items-center gap-2"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="px-8 py-4 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white text-base font-semibold transition"
          >
            <span>Schedule Institutional Demo</span>
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            Dedicated RIA compliance support
          </span>
        </div>
      </div>
    </section>
  );
}
