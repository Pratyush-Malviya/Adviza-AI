import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { RoiCalculator } from "@/components/marketing/roi-calculator";
import { TrustGrid } from "@/components/marketing/trust-grid";
import { getWebsiteContent, AnnouncementBannerContent } from "@/lib/cms/content";
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Building,
  Quote,
  ArrowRight,
  FileCheck2,
  CheckCircle,
} from "lucide-react";

export const metadata = {
  title: "RIA Case Studies & Measurable ROI | Adviza AI",
  description:
    "Discover how leading wealth management firms save 6.2 hours per advisor weekly, eliminate manual CRM documentation, and achieve 100% exam-ready compliance with Adviza AI.",
};

export default async function CaseStudiesPage() {
  const banner = await getWebsiteContent<AnnouncementBannerContent>("announcement_banner");

  const STORIES = [
    {
      firm: "Beacon Wealth Partners",
      aum: "$1.4 Billion AUM",
      advisors: "14 Advisors · San Francisco, CA",
      metric: "6.2 Hours",
      metricLabel: "Saved per Advisor Weekly",
      quote:
        "Before Adviza, our advisors dreaded Mondays and Fridays because of manual meeting prep and delayed CRM entry. Now, briefing dossiers are ready before they sit down, and follow-ups are drafted immediately. Our advisors spend an extra full day each week in front of clients.",
      author: "Eleanor Vance, CFP®",
      title: "Managing Principal",
      results: [
        "Eliminated 86 combined hours of weekly administrative manual preparation",
        "CRM data completion jumped from 61% to 99.4% in 30 days",
        "Added $140M in new net flows without increasing operational headcount",
      ],
    },
    {
      firm: "Apex Private Wealth",
      aum: "$820 Million AUM",
      advisors: "8 Advisors · Chicago, IL",
      metric: "100%",
      metricLabel: "Clean SEC Exam Report",
      quote:
        "During our recent SEC routine sweep, the staff requested all communications, meeting notes, and suitability rationales for 50 selected accounts over a 12-month period. With Adviza's WORM ledger, I exported the complete hash-verified compliance package in 2 minutes. The examiners were floored.",
      author: "Marcus Sterling, JD",
      title: "Chief Compliance Officer",
      results: [
        "Zero findings or deficiencies in annual regulatory examination",
        "CCO review time on communications reduced from 15 hours/week to 2.5 hours",
        "Tamper-proof SHA-256 audit chain protects firm against fiduciary disputes",
      ],
    },
    {
      firm: "Cascade Family Office",
      aum: "$2.6 Billion AUM",
      advisors: "18 Wealth Strategists · New York, NY",
      metric: "420 Accounts",
      metricLabel: "Rebalanced During Market Volatility",
      quote:
        "When market volatility hit in Q3, we needed to rebalance complex multi-entity trusts across equity and fixed income models. Adviza's deterministic sandbox calculated exact drift and tax-loss offsets without a single calculation error. It's the only AI we trust with allocation math.",
      author: "David Chen, CFA",
      title: "Chief Investment Officer",
      results: [
        "Rebalanced 420 complex household portfolios in 48 hours instead of 2 weeks",
        "Tax-efficient lot selection saved clients an estimated $420,000 in short-term capital gains",
        "Human-in-the-Loop signature trail verified every rebalance trade",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar banner={banner} />

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Proven Fiduciary Impact</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight leading-tight">
            Quantifiable Productivity and Compliance Gains Across 450+ RIAs
          </h1>
          <p className="text-sm sm:text-base text-[#7A726A] max-w-2xl mx-auto leading-relaxed">
            See how forward-thinking wealth managers eliminate meeting prep friction, accelerate client response times, and bulletproof their regulatory audit posture.
          </p>
        </div>
      </section>

      {/* 3 In-Depth Case Studies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        {STORIES.map((story, idx) => (
          <div
            key={idx}
            className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EADBCE] shadow-xs space-y-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EADBCE] pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#121217]">{story.firm}</h2>
                  <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
                    {story.aum}
                  </span>
                </div>
                <p className="text-xs text-[#7A726A]">{story.advisors}</p>
              </div>

              <div className="text-right">
                <p className="text-3xl sm:text-4xl font-extrabold text-violet-700 font-heading">{story.metric}</p>
                <p className="text-[11px] font-semibold text-[#8E847C] uppercase tracking-wider">{story.metricLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                <div className="relative pl-6 border-l-2 border-violet-400">
                  <Quote className="w-5 h-5 text-violet-300 absolute -top-2 -left-2.5 bg-white" />
                  <p className="text-sm sm:text-base text-[#2A2420] italic leading-relaxed">
                    "{story.quote}"
                  </p>
                </div>
                <p className="text-xs font-bold text-[#121217] pt-2">
                  {story.author} · <span className="text-[#7A726A] font-normal">{story.title}, {story.firm}</span>
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#121217]">Key Results Delivered:</p>
                <div className="space-y-2 text-xs text-[#5A544E]">
                  {story.results.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Interactive ROI Calculator Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <RoiCalculator />
      </section>

      <TrustGrid />

      <MarketingFooter />
    </div>
  );
}
