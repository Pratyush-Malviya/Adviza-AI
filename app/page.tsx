import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { TrustGrid } from "@/components/marketing/trust-grid";
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
} from "lucide-react";

export const metadata = {
  title: "Adviza AI | Autonomous Execution Workspace for Wealth Advisors",
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
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar banner={banner} />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EADBCE]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>{hero.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#121217] tracking-tight leading-[1.15]">
            {hero.headline}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#7A726A] max-w-3xl mx-auto leading-relaxed">
            {hero.subheadline}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={hero.primaryCtaLink}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#121217] hover:bg-zinc-800 shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{hero.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 text-rose-400" />
            </Link>
            <Link
              href={hero.secondaryCtaLink}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-[#121217] bg-white border border-[#EADBCE] hover:bg-[#FAF5F0] transition"
            >
              <span>{hero.secondaryCtaText}</span>
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs text-[#8E847C] font-medium pt-2">
            ✓ 14-day free trial &nbsp;•&nbsp; No credit card required &nbsp;•&nbsp; SOC 2 Type II Certified
          </p>
        </div>
      </section>

      {/* Dynamic Trust Stats Bar */}
      <section className="py-10 bg-white border-b border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-[#8E847C] uppercase tracking-wider mb-6">
            {hero.trustMetric}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#EADBCE]">
            {statsData.stats.map((stat, i) => (
              <div key={i} className="pt-4 lg:pt-0 space-y-1">
                <p className="text-3xl sm:text-4xl font-heading font-extrabold text-[#121217]">{stat.value}</p>
                <p className="text-xs text-[#7A726A]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
            Autonomous Advisory Loop
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#121217] tracking-tight">
            Designed for Every Stage of the Client Relationship
          </h2>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            Four interconnected agent capabilities that work together silently in the background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: "Pre-Meeting Dossiers",
              desc: "Automated 1-page intelligence briefings synthesized from CRM history, custodian balances, and recent client emails.",
              href: "/platform#briefings",
            },
            {
              icon: FileText,
              title: "Ambient Scribe & Minutes",
              desc: "Dual-stream audio transcription extracting client commitments, portfolio adjustments, and personalized follow-up drafts.",
              href: "/platform#intelligence",
            },
            {
              icon: Sliders,
              title: "Portfolio Drift Sandbox",
              desc: "Deterministic mathematical allocation analysis with tax-loss harvesting offsets and human-in-the-loop trade sign-off.",
              href: "/platform#portfolio",
            },
            {
              icon: ShieldCheck,
              title: "CCO Continuous Compliance",
              desc: "Cryptographic SHA-256 WORM storage satisfying SEC Rule 204-2 and FINRA 17a-4 with 1-click exam exports.",
              href: "/platform#compliance",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#EADBCE] flex flex-col justify-between hover:border-violet-300 transition hover:shadow-xs space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] flex items-center justify-center text-violet-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-heading font-bold text-[#121217]">{item.title}</h3>
                  <p className="text-xs text-[#7A726A] leading-relaxed">{item.desc}</p>
                </div>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 transition pt-2"
                >
                  <span>Explore Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Before vs. After Transformation Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#EADBCE]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
              Advisory Practice Transformation
            </h2>
            <p className="text-xs sm:text-sm text-[#7A726A]">
              How Adviza transforms manual administrative drag into autonomous execution.
            </p>
          </div>

          <div className="rounded-3xl border border-[#EADBCE] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF5F0] border-b border-[#EADBCE]">
                  <th className="p-4 font-bold text-[#121217] w-1/4">Workflow Stage</th>
                  <th className="p-4 font-bold text-red-600 w-3/8">Traditional RIA Process</th>
                  <th className="p-4 font-bold text-emerald-700 bg-emerald-50/50 w-3/8">With Adviza AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {BEFORE_AFTER.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF5F0]/40 transition">
                    <td className="p-4 font-bold text-[#121217]">{row.stage}</td>
                    <td className="p-4 text-[#7A726A]">{row.before}</td>
                    <td className="p-4 font-semibold text-emerald-900 bg-emerald-50/30">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Embedded Interactive ROI Calculator */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <RoiCalculator />
      </section>

      {/* Dynamic Testimonials Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Verified Advisor Reviews</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
              Trusted by Leading Fiduciary RIAs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.items.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#FAF5F0] border border-[#EADBCE] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#2A2420] italic leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-[#EADBCE]">
                  <p className="text-xs font-bold text-[#121217]">{item.author}</p>
                  <p className="text-[11px] text-violet-700 font-medium">{item.title}</p>
                  <p className="text-[10px] text-[#7A726A]">{item.firm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Integrations Grid */}
      <TrustGrid />

      {/* FAQs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#7A726A]">Everything you need to know about security, compliance, and onboarding.</p>
        </div>

        <div className="space-y-4">
          {faqsData.items.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#EADBCE] space-y-2">
              <h3 className="text-sm font-bold text-[#121217]">{faq.question}</h3>
              <p className="text-xs text-[#7A726A] leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-[#121217] text-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
            Accelerate Your Advisory Practice with Adviza AI
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Eliminate hours of meeting prep and CRM documentation while protecting your firm with tamper-proof compliance evidence.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold transition shadow-md"
            >
              Start 14-Day Firm Trial
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition"
            >
              Book Institutional Demo
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
