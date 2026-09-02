import Link from "next/link";
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Adviza AI",
  description: "Enterprise privacy, fiduciary data isolation, and encryption policies for Adviza AI.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-[11px] font-bold text-rose-700">
            <Shield className="w-3.5 h-3.5" />
            <span>Enterprise RIA Compliance & Trust</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#121217] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#8E847C]">
            Last Updated: September 2026 • Compliant with SEC Reg S-P & FINRA Books and Records
          </p>
        </div>

        <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-xs sm:text-sm leading-relaxed text-[#5A544E]">
          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217] flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600" />
              1. Zero Training on Fiduciary Client Data
            </h2>
            <p>
              Adviza AI enforces strict multi-tenant isolation. <strong>We do not use client portfolio holdings, custodial data, meeting audio recordings, or investor communications to train any AI models.</strong> All enterprise inference calls are executed under zero-data-retention agreements with SOC2 Type II certified cloud providers.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217] flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              2. Information We Collect
            </h2>
            <p>
              We collect information strictly necessary to provide the Adviza wealth advisory operating platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Advisor & Firm Credentials:</strong> Names, business email addresses, RIA firm metadata, and OAuth tokens.</li>
              <li><strong>Client Relationship Records:</strong> Client names, risk profiles, custodial asset allocations, and meeting schedules synced via connected CRMs or calendars.</li>
              <li><strong>Audit Telemetry:</strong> Immutable timestamped logs of rebalance recommendations, SEC Reg BI suitability reviews, and HITL (Human-in-the-Loop) approvals.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. SEC Reg S-P & Cryptographic Encryption
            </h2>
            <p>
              All sensitive financial data is protected using AES-256 encryption at rest and TLS 1.3 in transit. Access to client records is guarded by Supabase Row-Level Security (RLS) policies scoped exclusively to authorized members of your firm.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-2xs">
            <h2 className="text-base font-heading font-bold text-[#121217]">
              4. Contact Our Compliance Office
            </h2>
            <p>
              For privacy inquiries, audit exports, or data deletion requests under state or federal privacy statutes, contact our Chief Compliance & Security Officer at{" "}
              <a href="mailto:privacy@adviza.ai" className="font-semibold text-rose-600 hover:underline">
                privacy@adviza.ai
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
