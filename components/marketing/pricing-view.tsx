"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { TrustGrid } from "@/components/marketing/trust-grid";
import {
  Check,
  Zap,
  ArrowRight,
  Shield,
  HelpCircle,
  Sparkles,
  Users,
  Building,
  CheckCircle2,
} from "lucide-react";
import { RazorpayPaymentButton } from "@/components/payment/razorpay-checkout";

export function PricingView() {
  const [annual, setAnnual] = useState(true);
  const [seats, setSeats] = useState(5);

  const proPerSeat = annual ? 79 : 99;
  const proTotal = seats * proPerSeat;

  const enterprisePerSeat = annual ? 199 : 249;
  const enterpriseTotal = seats * enterprisePerSeat;

  const COMPARISON = [
    { feature: "Advisor Seats Included", starter: "1 Advisor", pro: "Scalable per seat", enterprise: "Unlimited / Custom" },
    { feature: "Client Profiles Managed", starter: "Up to 10", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Client Meeting Intelligence Pack", starter: "10 / month", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Dual-Stream Audio Transcription", starter: "Basic", pro: "Real-Time 99.4%", enterprise: "Real-Time 99.8% with Custom Vocab" },
    { feature: "Automated Follow-up Email Drafting", starter: "Standard", pro: "Personalized AI", enterprise: "Multi-language & Custom Firm Templates" },
    { feature: "Deterministic Portfolio Drift Engine", starter: "—", pro: "Included", enterprise: "Included with Custom Constraints" },
    { feature: "Salesforce / Wealthbox / Redtail Sync", starter: "—", pro: "Two-Way Direct", enterprise: "Two-Way Direct + Webhooks & API" },
    { feature: "SEC 204-2 / FINRA 17a-4 Exam Export", starter: "—", pro: "Standard PDF", enterprise: "Cryptographically Signed WORM Packet" },
    { feature: "Multi-Model AI Routing (Bedrock, Vertex, NIM)", starter: "Standard", pro: "All 5 Providers", enterprise: "Custom Model Pinning & Fallbacks" },
    { feature: "Dedicated Customer Success Manager", starter: "Community", pro: "Priority Email & Chat", enterprise: "Dedicated SLA & CCO Onboarding" },
    { feature: "Custom Domain & White-Labeling", starter: "—", pro: "—", enterprise: "Included" },
  ];

  const FAQS = [
    {
      q: "Can we add or remove advisor seats at any time?",
      a: "Yes. Your Organization Admin can add or remove advisor seats anytime directly in your Org Admin billing panel. Changes are pro-rated automatically to the day.",
    },
    {
      q: "Is there a long-term contract required?",
      a: "No long-term commitments are required for Monthly plans. You can cancel at any time with zero penalties. Annual plans offer a 20% discount and are billed annually.",
    },
    {
      q: "How does the 14-day free trial work?",
      a: "You get full access to Advisor Pro features for 14 days without requiring immediate credit card verification. You can test meeting briefings, ambient transcription, and CRM sync with your team risk-free.",
    },
    {
      q: "Does Adviza sign Business Associate Agreements (BAA) and Security Addendums?",
      a: "Yes. For Enterprise RIA and Pro plans, we provide comprehensive Data Processing Agreements (DPA), Zero-Data Retention addendums, and compliance audit documentation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar />

      {/* Header */}
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent, Fiduciary-Grade Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight leading-tight">
            Invest in Advisor Productivity, Not Administrative Busywork
          </h1>
          <p className="text-sm sm:text-base text-[#7A726A] max-w-2xl mx-auto leading-relaxed">
            Predictable per-seat pricing designed for growing RIAs and enterprise wealth management institutions.
            All plans include continuous compliance documentation.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!annual ? "text-[#121217]" : "text-[#7A726A]"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              aria-label="Toggle annual or monthly billing"
              className="w-12 h-6 bg-[#121217] rounded-full p-0.5 flex items-center transition cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${annual ? "translate-x-6 bg-rose-400" : "translate-x-0"}`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${annual ? "text-[#121217]" : "text-[#7A726A]"}`}>Annual</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Starter Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-[#8E847C] bg-[#FAF5F0] px-2.5 py-1 rounded-full">
                Independent / Solo
              </span>
              <h2 className="text-xl font-heading font-bold text-[#121217]">Starter</h2>
              <p className="text-xs text-[#7A726A]">
                For independent advisors beginning their journey with automated meeting preparation.
              </p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-[#121217]">$0</span>
                <span className="text-xs text-[#7A726A] ml-1.5">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#5A544E] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>1 Advisor Workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>10 Client Meetings / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Automated Pre-Meeting Dossiers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Basic Compliance Notes</span>
                </li>
              </ul>
            </div>
            <Link
              href="/auth/signup?plan=free"
              className="w-full text-center py-3 rounded-xl border border-[#EADBCE] text-xs font-bold text-[#121217] hover:bg-[#FAF5F0] transition"
            >
              Start Free
            </Link>
          </div>

          {/* Advisor Pro Card (Featured) */}
          <div className="p-8 rounded-3xl bg-[#121217] text-white border-2 border-violet-500/50 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
              Most Popular for RIAs
            </div>
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-violet-300 bg-violet-900/40 px-2.5 py-1 rounded-full">
                Growing Practices
              </span>
              <h2 className="text-xl font-heading font-bold text-white">Advisor Pro</h2>
              <p className="text-xs text-zinc-400">
                Full-featured execution workspace for high-performing wealth teams and RIAs.
              </p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-white">${proPerSeat}</span>
                <span className="text-xs text-zinc-400 ml-1.5">/ advisor / month</span>
                {annual && <p className="text-[10px] text-emerald-400 mt-1">Billed annually (${proTotal * 12}/yr for {seats} seats)</p>}
              </div>

              {/* Dynamic Seat Count Slider inside Pro card */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Advisors: <strong>{seats}</strong></span>
                  <span className="text-violet-300 font-bold">${proTotal}/mo total</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={seats}
                  aria-label="Select number of advisor seats"
                  onChange={(e) => setSeats(parseInt(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited client meetings & briefings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Real-time ambient scribe & transcription</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Deterministic portfolio drift calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Two-way CRM sync (Salesforce, Wealthbox, Redtail)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>All 5 AI Models with intelligent routing</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <RazorpayPaymentButton
                planId="pro"
                amount={proTotal * 85}
                label={`Instant Checkout (₹${(proTotal * 85).toLocaleString()}/mo)`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer"
              />
              <Link
                href={`/auth/signup?plan=pro&seats=${seats}`}
                className="w-full block text-center py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Or Start 14-Day Free Trial →
              </Link>
            </div>
          </div>

          {/* Enterprise RIA Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
                Multi-Office / Institutional
              </span>
              <h2 className="text-xl font-heading font-bold text-[#121217]">Enterprise RIA</h2>
              <p className="text-xs text-[#7A726A]">
                Tailored security, custom custodian integrations, and dedicated compliance architecture.
              </p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-[#121217]">${enterprisePerSeat}</span>
                <span className="text-xs text-[#7A726A] ml-1.5">/ advisor / month</span>
                <p className="text-[10px] text-[#8E847C] mt-1">Or custom firm-wide institutional licensing</p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#5A544E] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>All Advisor Pro features included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>SEC 204-2 / FINRA 17a-4 WORM exam export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Custom model version pinning & fallbacks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Dedicated Customer Success & CCO onboarding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Custom domain & branded advisor workspaces</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <RazorpayPaymentButton
                planId="enterprise"
                amount={enterpriseTotal * 85}
                label={`Subscribe Enterprise (₹${(enterpriseTotal * 85).toLocaleString()}/mo)`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#121217] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer"
              />
              <Link
                href="/contact?plan=enterprise"
                className="w-full block text-center py-2 text-xs font-semibold text-[#7A726A] hover:text-[#121217] transition"
              >
                Contact Enterprise Sales Desk →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
            Full Feature Comparison Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            Compare capabilities across tiers to find the exact fit for your advisory practice.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADBCE] bg-[#FAF5F0]">
                  <th className="p-4 font-bold text-[#121217]">Platform Capability</th>
                  <th className="p-4 font-bold text-[#121217]">Starter</th>
                  <th className="p-4 font-bold text-violet-700 bg-violet-50/50">Advisor Pro</th>
                  <th className="p-4 font-bold text-[#121217]">Enterprise RIA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF5F0]/50 transition">
                    <td className="p-4 font-semibold text-[#121217]">{row.feature}</td>
                    <td className="p-4 text-[#7A726A]">{row.starter}</td>
                    <td className="p-4 font-bold text-violet-800 bg-violet-50/30">{row.pro}</td>
                    <td className="p-4 font-medium text-[#121217]">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-heading font-extrabold text-[#121217]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#7A726A]">Common questions regarding billing, security, and setup.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#EADBCE] space-y-1.5">
              <h3 className="text-sm font-bold text-[#121217]">{faq.q}</h3>
              <p className="text-xs text-[#7A726A] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <TrustGrid />

      <MarketingFooter />
    </div>
  );
}
