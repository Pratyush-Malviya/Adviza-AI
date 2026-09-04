import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { ArrowLeft, ShieldCheck, RefreshCw, Mail, AlertCircle, FileText } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Adviza AI",
  description:
    "Adviza AI's SaaS subscription cancellation terms, 14-day free trial, and pro-rata refund policies for registered wealth advisory practices.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Refund & Cancellation Policy | Adviza AI",
    description: "Adviza AI's SaaS subscription cancellation terms and 14-day free trial policies.",
    url: "https://adviza.ai/refund-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Refund & Cancellation Policy | Adviza AI",
    description: "Adviza AI's SaaS subscription cancellation terms and 14-day free trial policies.",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A544E] hover:text-[#121217] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SaaS Subscription Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#121217] tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-[#8E847C]">Last updated: September 3, 2026</p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-8 sm:p-12 space-y-8 text-xs sm:text-sm text-[#4A4540] leading-relaxed shadow-xs">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#121217]">
              1. Nature of the Digital Service
            </h2>
            <p>
              Adviza AI is a Software-as-a-Service (SaaS) platform providing digital workspace tools, real-time meeting transcription,
              deterministic portfolio analysis, and compliance documentation tools for wealth management professionals.
              <strong> There are no physical shipments or deliveries of tangible goods.</strong> All services, licensed seats,
              and storage allocations are granted immediately in digital format upon payment confirmation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#121217]">
              2. 14-Day Free Evaluation Period
            </h2>
            <p>
              We provide a full-featured 14-day free trial on our Advisor Pro tier so your organization can thoroughly test
              our meeting briefings, transcription engine, and CRM sync risk-free before any charge is made.
              No payment is processed during the free trial period.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#121217]">
              3. Subscription Cancellation Policy
            </h2>
            <p>
              Firms may cancel their recurring subscription at any time directly through the Organization Admin Billing Panel
              (<strong>/org-admin/billing</strong>) or by emailing our support team at{" "}
              <a href="mailto:billing@adviza.ai" className="text-violet-700 underline font-medium">
                billing@adviza.ai
              </a>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#5A544E]">
              <li>
                <strong>Monthly Plans:</strong> Cancellation takes effect at the end of the current monthly billing period.
                Your team will retain full access until the current paid period concludes.
              </li>
              <li>
                <strong>Annual Plans:</strong> Cancellation prevents renewal for the subsequent year. Access remains active through
                the end of the paid annual term.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#121217]">
              4. 7-Day Money-Back Guarantee (First Purchase)
            </h2>
            <p>
              If your firm is not completely satisfied with Adviza AI within the first <strong>7 days</strong> of your initial
              paid subscription charge, you may request a 100% full refund of that billing cycle.
            </p>
            <p>
              To claim a refund under the 7-day policy, send an email to{" "}
              <a href="mailto:billing@adviza.ai" className="text-violet-700 underline font-medium">
                billing@adviza.ai
              </a>{" "}
              from your Organization Admin email address with your firm name and payment reference ID.
              Refunds are reviewed and credited back to the original payment method (via Razorpay) within 5 to 7 business days.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#121217]">
              5. Non-Refundable Items
            </h2>
            <p>
              Beyond the initial 7-day guarantee window, recurring subscription fees are generally non-refundable, as computing
              infrastructure, AI quota reserves, and WORM storage resources are provisioned on an ongoing basis.
              Partial-month pro-rata refunds are not issued for mid-cycle voluntary cancellations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#121217]">
              6. Enterprise SLA & Billing Inquiries
            </h2>
            <p>
              For enterprise contracts, custom custody integration arrangements, or disputed billing events, please contact your
              dedicated Customer Success Manager or reach our financial operations desk:
            </p>
            <div className="p-4 rounded-xl bg-[#FAF5F0] border border-[#EADBCE] text-xs space-y-1 font-mono">
              <p>Adviza AI, Inc. — Billing Operations Desk</p>
              <p>Email: billing@adviza.ai</p>
              <p>Support: support@adviza.ai</p>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
