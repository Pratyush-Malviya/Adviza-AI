import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { TrustGrid } from "@/components/marketing/trust-grid";
import { getWebsiteContent, AnnouncementBannerContent } from "@/lib/cms/content";
import {
  Building2,
  HeartHandshake,
  Shield,
  Zap,
  Target,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Adviza AI | Fiduciary Mission & Regulatory Philosophy",
  description:
    "Learn about Adviza's mission to empower fiduciary wealth managers with deterministic execution, tamper-proof compliance, and ambient meeting intelligence.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Adviza AI | Fiduciary Mission & Regulatory Philosophy",
    description:
      "Learn about Adviza's mission to empower fiduciary wealth managers with deterministic execution, tamper-proof compliance, and ambient meeting intelligence.",
    url: "https://adviza.ai/about",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About Adviza AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Adviza AI | Fiduciary Mission & Regulatory Philosophy",
    description:
      "Learn about Adviza's mission to empower fiduciary wealth managers with deterministic execution and tamper-proof compliance.",
    images: ["/og-image.png"],
  },
};

export default async function AboutPage() {
  const banner = await getWebsiteContent<AnnouncementBannerContent>("announcement_banner");

  const PRINCIPLES = [
    {
      icon: HeartHandshake,
      title: "1. Fiduciary-First: Assist, Never Replace",
      desc: "Wealth management is fundamentally built on human empathy, trust, and judgment. Adviza will never execute client portfolio trades or send unvetted communications autonomously. The advisor remains in the driver’s seat at all times.",
    },
    {
      icon: Target,
      title: "2. Deterministic Math vs. Generative Language",
      desc: "We strictly separate mathematical calculation from natural language synthesis. Generative AI is brilliant at summarizing client discussions; mathematical models are strictly deterministic to ensure 0% hallucination in allocation math.",
    },
    {
      icon: Shield,
      title: "3. Absolute Data Sovereignty (Zero-Training)",
      desc: "Under no circumstance will client financial disclosures, meeting transcripts, or personal data be used to train AI models. What happens inside your firm stays strictly inside your firm.",
    },
    {
      icon: Zap,
      title: "4. Compliance by Design, Not Retrospective Scramble",
      desc: "Every dossier, transcription, and rebalance decision is immediately anchored with cryptographic SHA-256 hashes into an immutable ledger, ensuring that SEC and FINRA examinations are stress-free.",
    },
  ];

  const LEADERSHIP = [
    {
      name: "Pratyush Malviya",
      role: "Founder & Chief Executive Officer",
      bio: "Former enterprise systems architect with deep background in mission-critical financial systems, distributed ledger security, and agentic workflows.",
    },
    {
      name: "Arthur Vance, CFP®",
      role: "Head of Wealth Solutions & Advisor Advocacy",
      bio: "20+ years leading multi-billion RIA practices. Passionate about eliminating administrative friction from the advisor-client relationship.",
    },
    {
      name: "Elena Rostova, JD",
      role: "VP of Regulatory Compliance & Policy",
      bio: "Former SEC regulatory examiner and veteran RIA Chief Compliance Officer specializing in Investment Advisers Act Rule 204-2 compliance.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      <MarketingNavbar banner={banner} />

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Fiduciary Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight leading-tight">
            Built by Enterprise Technologists and Wealth Practitioners
          </h1>
          <p className="text-sm sm:text-base text-[#7A726A] max-w-2xl mx-auto leading-relaxed">
            Adviza AI was founded with a singular conviction: wealth advisors should spend their days advising families,
            not wrestling with manual meeting notes, disparate CRM entries, and compliance paperwork.
          </p>
        </div>
      </section>

      {/* Mission Statement Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Our North Star</p>
          <blockquote className="text-xl sm:text-2xl font-heading font-extrabold text-[#121217] leading-relaxed">
            "To deliver the world’s most trusted autonomous execution operating system for fiduciary wealth managers —
            combining ambient meeting intelligence with mathematical portfolio precision and bulletproof compliance."
          </blockquote>
        </div>
      </section>

      {/* 4 Fiduciary Principles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Core Engineering Values</p>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Our Fiduciary Engineering Principles
          </h2>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            The strict ethical and technical guardrails that govern every feature built at Adviza AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRINCIPLES.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-[#EADBCE] space-y-3 hover:border-violet-300 transition hover:shadow-xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] flex items-center justify-center text-violet-700">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-heading font-bold text-[#121217]">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[#7A726A] leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#EADBCE]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Adviza Leadership</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
              Advisory Board & Executive Team
            </h2>
            <p className="text-xs sm:text-sm text-[#7A726A]">
              Decades of combined experience spanning enterprise AI infrastructure, financial regulation, and private wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEADERSHIP.map((leader, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-[#121217] text-white flex items-center justify-center font-heading font-bold text-base">
                  {leader.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-[#121217]">{leader.name}</h3>
                  <p className="text-xs font-semibold text-violet-700">{leader.role}</p>
                </div>
                <p className="text-xs text-[#7A726A] leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustGrid />

      <MarketingFooter />
    </div>
  );
}
