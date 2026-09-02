import Link from "next/link";
import { Scale, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Adviza AI",
  description: "Terms of service and enterprise SaaS license agreement for Adviza AI.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      {/* Top Header */}
      <header className="border-b border-[#EADBCE] bg-[#FAF5F0]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#121217] flex items-center justify-center text-white shadow-xs">
              <div className="w-3 h-3 rounded-full border-2 border-white" />
            </div>
            <span className="font-heading font-extrabold text-base tracking-tight text-[#121217]">
              Adviza AI
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5A544E] hover:text-[#121217] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[11px] font-bold text-amber-800">
            <Scale className="w-3.5 h-3.5" />
            <span>Enterprise Terms & SaaS Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#121217] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-[#8E847C]">
            Effective Date: September 2026 • Governing Fiduciary & Operational Software Use
          </p>
        </div>

        <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-xs sm:text-sm leading-relaxed text-[#5A544E]">
          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              1. Fiduciary Disclaimer & Advisor Accountability
            </h2>
            <p>
              Adviza AI provides AI-assisted orchestration, research synthesis, and workflow automation for Registered Investment Advisors (RIAs). <strong>Adviza AI is not an investment advisor, broker-dealer, or fiduciary.</strong> All rebalance recommendations, tax-loss harvest suggestions, and client communications must be reviewed and approved by a licensed advisor before execution.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              2. Acceptable Use & Security Obligations
            </h2>
            <p>
              Subscribers agree not to reverse engineer, scrape, or probe system vulnerabilities. Access tokens must be securely stored, and any suspected unauthorized access must be reported to our security operations center immediately.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217]">
              3. Service Level & Support
            </h2>
            <p>
              Enterprise accounts receive 99.9% uptime SLA commitments, automated disaster recovery failover, and priority support. Contact{" "}
              <a href="mailto:legal@adviza.ai" className="font-semibold text-rose-600 hover:underline">
                legal@adviza.ai
              </a>{" "}
              for master service agreements or custom enterprise addenda.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
