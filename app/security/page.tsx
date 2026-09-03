import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { TrustGrid } from "@/components/marketing/trust-grid";
import { getWebsiteContent, AnnouncementBannerContent } from "@/lib/cms/content";
import {
  ShieldCheck,
  Lock,
  Database,
  FileCheck2,
  Key,
  Server,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";

export const metadata = {
  title: "Security, Privacy & Regulatory Compliance | Adviza AI",
  description:
    "Institutional Trust Center: SOC 2 Type II certified, SEC 204-2 and FINRA 17a-4 Books & Records compliance, WORM hash-chain storage, and zero-LLM-training architecture.",
};

export default async function SecurityPage() {
  const banner = await getWebsiteContent<AnnouncementBannerContent>("announcement_banner");

  const PILLARS = [
    {
      icon: Lock,
      title: "Zero-Data Retention (ZDR) LLM Architecture",
      desc: "Adviza connects to enterprise-tier LLM endpoints (AWS Bedrock, Vertex AI, NVIDIA NIM) under signed Business Associate Agreement (BAA) and commercial zero-retention contracts. No client transcripts, audio recordings, or financial data are ever stored on model servers or used to train public or private foundation models.",
    },
    {
      icon: Database,
      title: "WORM Storage & Cryptographic Integrity",
      desc: "All meeting intelligence, trade rationales, and advisor follow-ups are persisted to Write-Once-Read-Many (WORM) compliant storage. Records are chained with cryptographic SHA-256 hashes: any attempt to alter past notes or recommendations invalidates the hash signature, providing tamper-evident proof to SEC/FINRA examiners.",
    },
    {
      icon: FileCheck2,
      title: "SEC Rule 204-2 & FINRA Rule 17a-4 Ready",
      desc: "Designed from day one to satisfy investment adviser recordkeeping requirements. Adviza indexes communications by client, advisor, date, and asset class, preserving complete metadata (original audio, extracted transcript, generated briefing, and CCO approval stamp) for the statutory 5-to-7 year retention period.",
    },
    {
      icon: Server,
      title: "Strict Multi-Tenant Database Isolation",
      desc: "Adviza enforces physical and logical tenant separation using PostgreSQL Row-Level Security (RLS). Every query executed by the application is scoped strictly to the firm's verified cryptographic tenant ID. Organization administrators have full control over advisor access, client visibility permissions, and instant credential revocation.",
    },
    {
      icon: Key,
      title: "End-to-End Encryption (At Rest & In Transit)",
      desc: "All client data is encrypted in transit using TLS 1.3 with forward secrecy, and encrypted at rest using AES-256 with customer-managed or AWS KMS key hierarchies. Sensitive credentials such as CRM API tokens and custodian feeds are stored in hardware security modules and never displayed in plaintext.",
    },
    {
      icon: ShieldCheck,
      title: "Continuous CCO Oversight & HITL Governance",
      desc: "Adviza operates strictly on a Human-in-the-Loop (HITL) philosophy. AI assists advisors by drafting briefings and analyzing drift, but no trade proposal, client email, or account adjustment is executed without explicit advisor or CCO confirmation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar banner={banner} />

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institutional Trust & Compliance Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight leading-tight">
            Security & Regulatory Compliance Built for Fiduciary RIAs
          </h1>
          <p className="text-sm sm:text-base text-[#7A726A] max-w-2xl mx-auto leading-relaxed">
            Adviza meets the highest standards of data privacy, cryptographic record integrity, and SEC/FINRA regulatory oversight.
            Your client data belongs entirely to your firm.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact?subject=security-whitepaper"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#121217] hover:bg-zinc-800 shadow-xs transition"
            >
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Request SOC 2 Type II Report</span>
            </Link>
            <Link
              href="/contact?subject=compliance-review"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-semibold text-[#121217] bg-white border border-[#EADBCE] hover:bg-[#FAF5F0] transition"
            >
              <span>Schedule CCO Architecture Review</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Security Pillars Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Enterprise Security Safeguards</p>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Zero-Trust Architecture from Foundation to Edge
          </h2>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            How we protect wealth management firms against data leakage, model drift, and regulatory scrutiny.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EADBCE] hover:border-violet-300 transition space-y-4 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] flex items-center justify-center text-violet-700">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-heading font-bold text-[#121217]">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-[#7A726A] leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CCO Exam Packet Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#EADBCE]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              Audit-Ready in Seconds
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
              One-Click Regulatory Exam Packet Generator
            </h2>
            <p className="text-xs sm:text-sm text-[#7A726A] leading-relaxed">
              When the SEC, FINRA, or state securities division initiates a routine sweep, CCOs typically spend weeks hunting down advisor emails, CRM entries, and suitability notes. With Adviza, you generate a cryptographically signed exam packet in one click.
            </p>
            <div className="space-y-2 text-xs text-[#5A544E] pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All AI-generated client communications with original timestamps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Portfolio rebalancing proposals with mathematical drift evidence</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Advisor and CCO Human-in-the-Loop signature approvals</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#121217] text-white p-6 sm:p-8 border border-white/10 shadow-lg space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">SEC_Rule_204-2_Exam_Packet.pdf</span>
              <span className="text-emerald-400 text-[10px]">VERIFIED HASH</span>
            </div>
            <div className="space-y-2 text-[11px] text-zinc-300">
              <p className="text-violet-400 font-bold">FIRM: Beacon Wealth Partners (CRD #184920)</p>
              <p>EXAMINATION PERIOD: 2025-01-01 to 2025-12-31</p>
              <p>TOTAL ADVISOR MEETINGS LOGGED: 1,842</p>
              <p>SUITABILITY DETERMINATIONS ARCHIVED: 1,842</p>
              <p>HASH ROOT: sha256:9f8e43812b1928374d9e018a38472...</p>
              <p className="text-emerald-400 pt-2 font-bold">TAMPER VERIFICATION: PASSED (0 MODIFIED RECORDS)</p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-zinc-500">
              <span>WORM Compliant Ledger</span>
              <span className="underline cursor-pointer text-violet-300">Download Sample Packet →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Grid & Custodian compatibility */}
      <TrustGrid />

      <MarketingFooter />
    </div>
  );
}
