import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { HeroContiant } from "@/components/marketing/hero-contiant";
import { MarqueeTicker } from "@/components/marketing/marquee-ticker";
import { PowerGrid } from "@/components/marketing/power-grid";
import { RoiCalculator } from "@/components/marketing/roi-calculator";
import {
  getWebsiteContent,
  AnnouncementBannerContent,
  HeroContent,
  TrustStatsContent,
  TestimonialsContent,
  FaqsContent,
} from "@/lib/cms/content";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  FileText,
  Shield,
  Sliders,
  Check,
  Building,
  Quote,
  Zap,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "Adviza AI | Autonomous Execution Grid for Wealth Advisory",
  description:
    "AI agents that handle client meeting dossiers, ambient audio transcription, deterministic portfolio drift, and SEC/FINRA compliance documentation — so advisors can focus 100% on clients.",
};

export default async function HomePage() {
  const [banner, hero, statsData, testimonialsData, faqsData] = await Promise.all([
    getWebsiteContent<AnnouncementBannerContent>("announcement_banner"),
    getWebsiteContent<HeroContent>("hero"),
    getWebsiteContent<TrustStatsContent>("trust_stats"),
    getWebsiteContent<TestimonialsContent>("testimonials"),
    getWebsiteContent<FaqsContent>("faqs"),
  ]);

  const BEFORE_AFTER = [
    {
      stage: "1. Pre-Meeting Briefing",
      before: "30–45 mins manually hunting through CRM notes, custodian balances, and email threads.",
      after: "Instant 1-page synthesized dossier with portfolio drift, open commitments, and life events.",
    },
    {
      stage: "2. During Meeting",
      before: "Advisor distracted taking frantic typed notes or scrambling to record details.",
      after: "Ambient dual-stream scribe listens passively, transcribing and extracting action items.",
    },
    {
      stage: "3. Post-Meeting Follow-up",
      before: "1–2 days delayed emails and manual copy-pasting into Salesforce or Wealthbox.",
      after: "Personalized follow-up email and two-way CRM sync drafted within 60 seconds of meeting end.",
    },
    {
      stage: "4. Portfolio Rebalancing",
      before: "Manual spreadsheets and prone to mathematical calculation errors during market stress.",
      after: "Deterministic calculation sandbox with tax-loss harvesting offset and HITL approval.",
    },
    {
      stage: "5. Compliance Audit",
      before: "Scrambling for weeks when SEC or FINRA examiners request communication records.",
      after: "Cryptographic SHA-256 WORM ledger provides instant 1-click signed exam packets.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-white selection:bg-[#8247FF] selection:text-white">
      {/* Floating Capsule Pill Navbar */}
      <MarketingNavbar banner={banner} />

      {/* Hero Section with Signature Animated Underline and Floating 3D Cards */}
      <HeroContiant
        badge={hero.badge}
        headline="Autonomous execution for"
        subheadline={hero.subheadline}
        primaryCtaText={hero.primaryCtaText}
        primaryCtaLink={hero.primaryCtaLink}
        secondaryCtaText={hero.secondaryCtaText}
        secondaryCtaLink={hero.secondaryCtaLink}
      />

      {/* Infinite Custodian, Brokerage & AI Gateway Marquee Ticker */}
      <MarqueeTicker />

      {/* Metrics Bar */}
      <section className="py-14 bg-[#13131A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-mono font-bold text-white/40 uppercase tracking-widest mb-8">
            {hero.trustMetric}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {statsData.stats.map((stat, i) => (
              <div key={i} className="pt-4 lg:pt-0 space-y-1.5">
                <p className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs font-mono text-[#9AA5B1]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature "One Advisory Execution Grid" in Contiant Layout */}
      <PowerGrid />

      {/* Comparative Matrix: Traditional RIA vs Adviza Autonomous Execution */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0D0C] border-t border-white/10 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-[#A9CECC] border border-white/10">
              The Advisory Evolution
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Eliminate administrative drag
            </h2>
            <p className="text-sm sm:text-base text-white/50">
              How Adviza transforms manual advisory busywork into autonomous execution.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#13131A] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1F2933]/70 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider">
                    <th className="p-5 font-bold text-white/80 w-1/4">Workflow Phase</th>
                    <th className="p-5 font-bold text-red-400 w-3/8">Traditional RIA Process</th>
                    <th className="p-5 font-bold text-[#A9CECC] bg-[#8247FF]/10 w-3/8">
                      With Adviza Autonomous Grid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {BEFORE_AFTER.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-5 font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8247FF]" />
                        {row.stage}
                      </td>
                      <td className="p-5 text-white/50 leading-relaxed">{row.before}</td>
                      <td className="p-5 font-medium text-emerald-200 bg-[#8247FF]/[0.04] leading-relaxed">
                        {row.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Wizard */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <RoiCalculator />
      </section>

      {/* Testimonials in Contiant Dark Card Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#13131A] border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#8247FF]/10 text-[#DFD1F4] border border-[#8247FF]/20">
              Institutional Proof
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Trusted by Leading Fiduciary RIAs
            </h2>
            <p className="text-sm text-white/50">
              Managing over $12B in combined client assets with Adviza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.items.map((item, idx) => (
              <div
                key={idx}
                className="contiant-card p-6 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex gap-1 text-[#8247FF]">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <span key={i} className="text-base">★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-white">{item.author}</p>
                  <p className="text-[11px] text-[#8247FF] font-medium mt-0.5">{item.title}</p>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">{item.firm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-[#A9CECC] border border-white/10">
            Fiduciary Guidance
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
            Everything you need to know about custodian security, SEC Reg BI audit trails, and onboarding.
          </p>
        </div>

        <div className="space-y-3">
          {faqsData.items.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#13131A] border border-white/10 space-y-2.5 transition-all hover:border-[#8247FF]/40"
            >
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8247FF]" />
                {faq.question}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed pl-3.5 border-l border-white/10">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-[#0D0D0C] border-t border-white/10 relative overflow-hidden">
        {/* Violet Mesh Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#8247FF]/20 blur-[130px] rounded-full" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-mono uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#8247FF]" />
            <span>Ready for Production Deployment</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.1]">
            Turn manual advisory drag into{" "}
            <span className="text-[#8247FF]">autonomous execution</span>
          </h2>

          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
            Eliminate hours of meeting prep, transcript drafting, and CRM data entry while locking in verifiable SEC/FINRA compliance records.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="btn-contiant-primary px-8 py-3.5 text-xs sm:text-sm font-semibold shadow-xl shadow-[#8247FF]/30 inline-flex items-center gap-2"
            >
              <span>Start 14-Day Firm Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="btn-contiant-secondary px-8 py-3.5 text-xs sm:text-sm font-semibold"
            >
              Book Institutional Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Contiant Multi-Column Footer */}
      <MarketingFooter />
    </div>
  );
}
