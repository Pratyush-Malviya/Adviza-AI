import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { TrustGrid } from "@/components/marketing/trust-grid";
import { getWebsiteContent, AnnouncementBannerContent } from "@/lib/cms/content";
import {
  Brain,
  FileText,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
  Sparkles,
  BarChart3,
  Bot,
  Sliders,
  Check,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform & Execution Architecture | Adviza AI",
  description:
    "Explore Adviza's Agentic Execution Architecture for wealth managers: Pre-Meeting Briefings, Ambient Audio Scribe, Deterministic Portfolio Drift Sandbox, and CCO Compliance Guard.",
  alternates: {
    canonical: "/platform",
  },
  openGraph: {
    title: "Platform & Execution Architecture | Adviza AI",
    description:
      "Explore Adviza's Agentic Execution Architecture for wealth managers: Pre-Meeting Briefings, Ambient Audio Scribe, and CCO Compliance Guard.",
    url: "https://adviza.ai/platform",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Adviza AI Platform Architecture" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform & Execution Architecture | Adviza AI",
    description:
      "Explore Adviza's Agentic Execution Architecture for wealth managers and RIAs.",
    images: ["/og-image.png"],
  },
};

export default async function PlatformPage() {
  const banner = await getWebsiteContent<AnnouncementBannerContent>("announcement_banner");

  const MODULES = [
    {
      id: "briefings",
      badge: "Pre-Meeting Intelligence",
      title: "Automated Client Briefing Dossiers",
      subtitle: "30-second context synthesis before every client conversation",
      desc: "Adviza connects into your CRM, custodian account balances, and recent communication history to compile a structured 1-page intelligence dossier. Advisors enter meetings knowing open action items, portfolio allocation drift, recent life events, and cross-selling opportunities.",
      points: [
        "Consolidated household portfolio balances and historical return snapshots",
        "CRM interaction history and unfulfilled commitments flagged automatically",
        "Opportunity signals: liquidity events, scheduled RMDs, and tax-loss harvesting windows",
        "Risk flags: recent market drawdowns, concentrated stock exposure, and suitability review dates",
      ],
      mockup: {
        title: "Client Dossier: Harrison Family Trust ($4.2M)",
        items: [
          { label: "Asset Allocation Drift", value: "+4.8% Equity Overweight (Target 60/40)", alert: true },
          { label: "Upcoming Life Event", value: "Daughter starting Cornell Law School in Fall", alert: false },
          { label: "Unfulfilled Task", value: "Send updated estate tax memo discussed on Jan 14", alert: true },
        ],
      },
    },
    {
      id: "intelligence",
      badge: "Meeting Intelligence",
      title: "Ambient Scribe & Real-Time Decision Extraction",
      subtitle: "Never write post-meeting manual CRM notes again",
      desc: "Our dual-stream audio transcription engine listens to advisor-client discussions (in-person or virtual Zoom/Teams) and extracts factual decisions, sentiment shifts, action assignments, and client commitments in real-time with 99.4% accuracy.",
      points: [
        "Real-time audio transcription with domain-specific financial terminology recognition",
        "Deterministic extraction of client requests (e.g. 'withdraw $50k next Friday')",
        "Auto-drafted personalized follow-up email ready for advisor review within 60 seconds",
        "Direct two-way sync back into Salesforce FSC, Wealthbox, and Redtail CRM records",
      ],
      mockup: {
        title: "Meeting Transcript & Live Decision Extraction",
        items: [
          { label: "Extracted Action", value: "Liquidate $35,000 from Vanguard Muni Fund for home renovation", alert: false },
          { label: "Suitability Confirmation", value: "Client re-confirmed Moderate Growth risk tolerance", alert: false },
          { label: "Follow-Up Draft", value: "Generated personalized summary email ready for advisor send", alert: false },
        ],
      },
    },
    {
      id: "portfolio",
      badge: "Mathematical Rigor",
      title: "Deterministic Portfolio Drift & Rebalance Sandbox",
      subtitle: "Zero LLM hallucinations in allocation mathematics",
      desc: "Unlike standard conversational bots that guess trade amounts, Adviza separates language reasoning from quantitative execution. Drift calculations are executed in a deterministic mathematical sandbox with automated constraint validation and Human-in-the-Loop (HITL) approval.",
      points: [
        "Automated drift calculation against target household models (equities, fixed income, cash, alternatives)",
        "Tax-efficient lot selection and wash-sale rule constraint checking",
        "Trade simulation sandbox with before-and-after tracking error metrics",
        "Strict Human-in-the-Loop approval: no trades execute without explicit advisor signature",
      ],
      mockup: {
        title: "Portfolio Rebalancing Sandbox: Model 70/30",
        items: [
          { label: "Current Drift", value: "US Large Cap: 48.2% vs 40.0% Target (+8.2%)", alert: true },
          { label: "Proposed Adjustment", value: "Trim $82,400 SPY → Allocate to BND & Cash Reserves", alert: false },
          { label: "Estimated Tax Impact", value: "$1,840 Short-term capital gain offset by $3,200 loss carryforward", alert: false },
        ],
      },
    },
    {
      id: "compliance",
      badge: "Institutional Governance",
      title: "CCO Continuous Compliance & Exam Guard",
      subtitle: "SEC Rule 204-2 and FINRA 17a-4 compliance built into every step",
      desc: "Compliance should not be an afterthought reconstructed weeks after a client dispute. Adviza auto-generates suitability rationales, archives raw audio and transcribed evidence into an immutable Write-Once-Read-Many (WORM) ledger, and enables one-click exam exports for CCOs.",
      points: [
        "Automated suitability notes generated immediately following client portfolio adjustments",
        "Tamper-proof WORM storage backed by SHA-256 cryptographic hash-chaining",
        "Customizable firm approval thresholds (e.g. communications or trades requiring CCO sign-off)",
        "One-click signed regulatory exam packet export in audit-ready PDF format",
      ],
      mockup: {
        title: "CCO Compliance Evidence Chain: Log #84920",
        items: [
          { label: "Regulatory Profile", value: "SEC-Registered Investment Adviser (Rule 204-2)", alert: false },
          { label: "Integrity Hash", value: "SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677...", alert: false },
          { label: "CCO Status", value: "Approved by M. Sterling (CCO) on 2026-02-18 14:32 EST", alert: false },
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar banner={banner} />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic Execution Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight leading-tight">
            How Adviza Automates Advisory Workflows with Mathematical Rigor
          </h1>
          <p className="text-sm sm:text-base text-[#7A726A] max-w-2xl mx-auto leading-relaxed">
            A cohesive 4-stage execution pipeline connecting client meeting preparation, ambient transcription,
            deterministic portfolio rebalancing, and continuous CCO exam documentation.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#121217] hover:bg-zinc-800 shadow-xs transition"
            >
              <span>Start 14-Day Firm Trial</span>
              <ArrowRight className="w-4 h-4 text-rose-400" />
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-semibold text-[#121217] bg-white border border-[#EADBCE] hover:bg-[#FAF5F0] transition"
            >
              <span>Review Security Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Modules Deep Dive */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 space-y-24 max-w-7xl mx-auto">
        {MODULES.map((mod, idx) => {
          const isReversed = idx % 2 === 1;
          return (
            <div
              key={mod.id}
              id={mod.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isReversed ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Text side */}
              <div className={`space-y-4 ${isReversed ? "lg:order-2" : ""}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                  {mod.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
                  {mod.title}
                </h2>
                <p className="text-sm font-semibold text-rose-600">{mod.subtitle}</p>
                <p className="text-xs sm:text-sm text-[#7A726A] leading-relaxed">{mod.desc}</p>

                <div className="space-y-2.5 pt-3">
                  {mod.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[#5A544E]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup Card side */}
              <div className={`${isReversed ? "lg:order-1" : ""}`}>
                <div className="rounded-3xl bg-[#121217] text-white p-6 sm:p-8 border border-white/10 shadow-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-mono text-zinc-400 ml-2">{mod.mockup.title}</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                      Live Preview
                    </span>
                  </div>

                  <div className="space-y-3">
                    {mod.mockup.items.map((item, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          item.alert
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                            : "bg-white/5 border-white/10 text-zinc-200"
                        }`}
                      >
                        <p className="text-[10px] uppercase font-bold text-zinc-400">{item.label}</p>
                        <p className="font-mono text-xs">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/10">
                    <span>Deterministic execution layer</span>
                    <span className="text-emerald-400 font-semibold">100% Verified</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Trust Grid */}
      <TrustGrid />

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-[#FAF5F0]">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#121217]">
            Ready to Empower Your Advisors with Adviza?
          </h2>
          <p className="text-xs sm:text-sm text-[#7A726A] max-w-xl mx-auto">
            Join 450+ wealth management practices eliminating 6.2 hours of weekly administrative overhead while maintaining complete regulatory auditability.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-xl bg-[#121217] text-white text-xs font-bold hover:bg-zinc-800 transition shadow-xs"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white border border-[#EADBCE] text-[#121217] text-xs font-semibold hover:bg-[#FAF5F0] transition"
            >
              Request Institutional Demo
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
