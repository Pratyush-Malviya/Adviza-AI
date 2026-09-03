"use client";

import React, { useState } from "react";
import {
  Brain,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Check,
  Zap,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

interface GridCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  icon: any;
  bullets: string[];
}

const CARDS: GridCard[] = [
  {
    id: "dossier",
    tag: "PRE-MEETING ORCHESTRATION",
    title: "Zero-Click Client Dossiers",
    description: "Before every client meeting, Adviza queries connected custodians, CRM threads, and previous commitments to generate a single-page synthesized executive briefing.",
    metric: "1.4s",
    metricLabel: "Dossier Synthesis Time",
    icon: Brain,
    bullets: [
      "Custodian balance & portfolio drift detection",
      "Recent life events & family office milestones",
      "Open action items and prior advisor commitments",
    ],
  },
  {
    id: "scribe",
    tag: "DURING & POST-MEETING",
    title: "Ambient Dual-Stream Scribe",
    description: "An unobtrusive AI scribe listens passively during advisor-client reviews, generating pristine verbatim transcripts and extracting verified follow-ups within 60 seconds.",
    metric: "60s",
    metricLabel: "Follow-up Draft Turnaround",
    icon: Activity,
    bullets: [
      "Speaker-diarized advisor & client audio tracks",
      "Two-way push to Salesforce FSC, Wealthbox & Redtail",
      "Personalized follow-up draft ready for approval",
    ],
  },
  {
    id: "rebalance",
    tag: "QUANTITATIVE EXECUTION",
    title: "Deterministic Rebalance Sandbox",
    description: "Eliminate spreadsheet formula errors. Adviza runs deterministic mathematical portfolio drift calculations with tax-loss harvesting offsets under strict fiduciary boundaries.",
    metric: "0.00%",
    metricLabel: "Calculation Discrepancy",
    icon: TrendingUp,
    bullets: [
      "Real-time asset class & sector drift thresholds",
      "Tax-loss harvesting identification & wash-sale checks",
      "Human-In-The-Loop mandatory execution gate",
    ],
  },
  {
    id: "compliance",
    tag: "REGULATORY INTEGRITY",
    title: "Cryptographic WORM Audit Trail",
    description: "Every advisor meeting, generated brief, recommendation, and trade approval is stamped with a SHA-256 cryptographic hash on an immutable write-once read-many ledger.",
    metric: "100%",
    metricLabel: "SEC & FINRA Exam Readiness",
    icon: ShieldCheck,
    bullets: [
      "SEC Rule 204-2 books and records compliance",
      "FINRA Rule 2111 suitability justification records",
      "1-Click verified regulatory exam export package",
    ],
  },
];

export function PowerGrid() {
  const [activeCard, setActiveCard] = useState<string>("dossier");

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0D0C] border-t border-white/10 relative overflow-hidden">
      {/* Background Accent Mesh */}
      <div className="pointer-events-none absolute right-0 top-1/4 w-[500px] h-[500px] bg-[#8247FF]/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#A9CECC]">
            <Sparkles className="w-3.5 h-3.5 text-[#8247FF]" />
            <span>One Unified Power Grid</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-[1.15]">
            One execution grid for all advisory operations
          </h2>
          <p className="text-base sm:text-lg text-white/50 leading-relaxed">
            Eliminate fragmented wealthtech tools. Adviza turns your existing custodians, CRMs, and trading engines into a high-speed autonomous execution pipeline.
          </p>
        </div>

        {/* 4-Card Grid in Contiant Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((card) => {
            const Icon = card.icon;
            const isActive = activeCard === card.id;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setActiveCard(card.id)}
                className={`power-grid-card p-6 sm:p-8 flex flex-col justify-between cursor-pointer ${
                  isActive ? "border-[#8247FF]/60 shadow-xl shadow-[#8247FF]/15" : ""
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#8247FF]/15 border border-[#8247FF]/30 flex items-center justify-center text-[#8247FF]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-heading text-white block">
                        {card.metric}
                      </span>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wide">
                        {card.metricLabel}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/5 inline-block mb-3">
                    {card.tag}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                    {card.title}
                  </h3>

                  <p className="text-sm text-white/60 leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Bullets */}
                <div className="pt-6 border-t border-white/10 space-y-2.5">
                  {card.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-white/70">
                      <div className="w-4 h-4 rounded-full bg-[#8247FF]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#8247FF]" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
