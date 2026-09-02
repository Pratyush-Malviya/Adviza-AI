"use client";

import { useState } from "react";
import {
  Brain,
  FileText,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  LogIn,
  Check,
  Menu,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calculator,
  Terminal,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const FEATURES = [
  {
    icon: Brain,
    title: "Client Briefing Agent",
    description:
      "Generates structured meeting briefing packs in seconds — CRM history, portfolio drift context, open actions, opportunity signals, and risk flags. All in one view.",
    badge: "Pre-Meeting Alpha",
  },
  {
    icon: FileText,
    title: "Meeting Intelligence Agent",
    description:
      "Transcribes and analyzes client meetings in real time. Extracts action items, portfolio allocations, and generates advisor follow-up emails instantly.",
    badge: "Live Audio & Zoom",
  },
  {
    icon: Shield,
    title: "FINRA 2210 & SEC Compliance",
    description:
      "Auto-generates suitability records and marketing reviews. Cryptographically hashed with SHA-256 and stored in immutable WORM audit logs.",
    badge: "Audit-Proof WORM",
  },
  {
    icon: TrendingUp,
    title: "FIX Protocol Custodian Rebalance",
    description:
      "Simulate and transmit standard FIX 4.4/5.0 orders for Charles Schwab, Fidelity, and BNY Mellon Pershing with Human-in-the-Loop authorization.",
    badge: "FIX 4.4 Tag-Value",
  },
];

const STATS = [
  { value: "5–10 hrs", label: "Saved per advisor / week", icon: Clock },
  { value: "84.5%", label: "Gross operational efficiency", icon: TrendingUp },
  { value: "1,400+", label: "Live tool connectors via Composio", icon: Zap },
  { value: "100%", label: "WORM compliant audit trail", icon: ShieldCheck },
];

const PRICING = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for solo advisors and independent wealth consultants",
    features: [
      "10 client meetings / month",
      "Real-time audio transcription",
      "Automated briefing packs",
      "Basic compliance logs",
      "Standard email support",
    ],
    cta: "Start Free",
    href: `${APP_URL}/auth/signup`,
    highlighted: false,
  },
  {
    name: "Advisor Growth",
    price: "$499",
    period: "per month / firm",
    description: "For high-performing advisory practices and wealth management teams",
    features: [
      "Unlimited client meetings & briefing packs",
      "LangGraph 6-Node Fiduciary Agent Fleet",
      "Mem0 pgvector 768-dim semantic memory",
      "Composio Live 1,400+ tool integration suite",
      "FIX 4.4 / 5.0 Custodian Rebalancing simulator",
      "Autonomous Inngest nightly drift & morning crons",
      "FINRA 2210 & SEC 206(4)-1 SHA-256 PDF exports",
      "Priority 24/7 dedicated RIA onboarding",
    ],
    cta: "Start 14-Day Free Trial",
    href: `${APP_URL}/auth/signup?plan=pro`,
    highlighted: true,
  },
  {
    name: "Enterprise RIA",
    price: "Custom",
    period: "tailored",
    description: "For large RIAs, multi-family offices, and institutional wealth managers",
    features: [
      "Everything in Growth tier",
      "Custom AWS Bedrock & VPC private enclave",
      "Direct FIX protocol custodian clearing pipes",
      "Custom CCO supervisory workflow gates",
      "Enterprise SLA with 99.99% uptime guarantee",
      "Dedicated Solutions Architect & Compliance Officer",
    ],
    cta: "Contact Enterprise Sales",
    href: `${APP_URL}/auth/signup?plan=enterprise`,
    highlighted: false,
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive ROI Calculator State
  const [advisorsCount, setAdvisorsCount] = useState<number>(5);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(6);
  const [advisorHourlyRate, setAdvisorHourlyRate] = useState<number>(175);

  const annualSavings = advisorsCount * hoursSavedPerWeek * advisorHourlyRate * 50;

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] flex flex-col selection:bg-rose-500 selection:text-white">
      {/* ── Header / Navigation ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-sm">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">Adviza AI</span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              Enterprise OS
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#645F5A]">
            <a href="#features" className="hover:text-[#121217] transition">Features</a>
            <a href="#custodians" className="hover:text-[#121217] transition">Custodian FIX</a>
            <a href="#roi" className="hover:text-[#121217] transition">ROI Calculator</a>
            <a href="#pricing" className="hover:text-[#121217] transition">Pricing</a>
            <a href="#security" className="hover:text-[#121217] transition">Security & WORM</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={`${APP_URL}/auth/login`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#121217] hover:bg-[#FAF5F0] rounded-full transition"
            >
              <LogIn className="w-4 h-4 text-[#8E847C]" />
              Sign In
            </a>
            <a
              href={`${APP_URL}/auth/signup`}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-[#121217] hover:bg-rose-600 text-white rounded-full transition shadow-sm"
            >
              Launch App
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#121217]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#EADBCE] px-4 pt-2 pb-6 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Features</a>
            <a href="#custodians" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Custodian FIX</a>
            <a href="#roi" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">ROI Calculator</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Pricing</a>
            <div className="pt-4 border-t border-[#EADBCE] flex flex-col gap-2">
              <a href={`${APP_URL}/auth/login`} className="w-full text-center py-2.5 text-sm font-semibold border border-[#EADBCE] rounded-xl">Sign In</a>
              <a href={`${APP_URL}/auth/signup`} className="w-full text-center py-2.5 text-sm font-bold bg-rose-600 text-white rounded-xl">Launch App</a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-[#EADBCE] bg-gradient-to-b from-white via-[#FAF5F0] to-[#FAF5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Fiduciary AI Operating System for Wealth Management & RIAs</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#121217] max-w-4xl mx-auto leading-[1.08]">
            Automate 40% of Advisor Work with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">
              Fiduciary AI Agents
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#645F5A] max-w-2xl mx-auto font-medium leading-relaxed">
            From pre-meeting dossiers and real-time audio intelligence to FIX 4.4 custodian rebalancing and SEC 206(4)-1 cryptographic audit trails.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${APP_URL}/auth/signup?plan=pro`}
              className="w-full sm:w-auto px-8 py-4 bg-[#121217] hover:bg-rose-600 text-white text-base font-bold rounded-full transition shadow-lg flex items-center justify-center gap-2 group"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#roi"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FAF5F0] text-[#121217] text-base font-bold rounded-full transition border border-[#EADBCE] shadow-sm flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 text-rose-500" />
              Calculate Firm ROI
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs text-left">
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-2xl font-black text-[#121217]">{stat.value}</span>
                </div>
                <div className="text-xs font-semibold text-[#645F5A]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3">Enterprise Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#121217]">
            Built Specifically for High-Net-Worth Advisory & Compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feat, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <feat.icon className="w-6 h-6 text-rose-600" />
                </div>
                <span className="text-xs font-bold bg-[#FAF5F0] text-[#645F5A] px-3 py-1 rounded-full border border-[#EADBCE]">
                  {feat.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#121217] mb-2">{feat.title}</h3>
              <p className="text-sm text-[#645F5A] leading-relaxed font-medium">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Custodian & FIX Protocol Showcase ─────────────────────────────── */}
      <section id="custodians" className="py-20 bg-white border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-200">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Institutional Custodian Feeds</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121217] mb-4">
                Automated FIX 4.4 / 5.0 Portfolio Rebalancing
              </h2>
              <p className="text-[#645F5A] font-medium leading-relaxed mb-6">
                Detect asset class drift across equity, fixed income, and cash mandates. Adviza generates structured FIX protocol order batches (`35=D`) with human-in-the-loop authorization and simulated execution reports (`35=8`) for Schwab, Fidelity, and Pershing.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#121217]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Charles Schwab Institutional (`SCHW_FIX_GW`)</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#121217]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fidelity Wealth Institutional (`FID_FIMS_GW`)</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#121217]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BNY Mellon Pershing (`PERSHING_NETX_GW`)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121217] text-white p-6 rounded-3xl font-mono text-xs shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[#8E847C]">
                <span>FIX 4.4 Protocol Inspector</span>
                <span className="text-emerald-400 font-bold">● GATEWAY ONLINE</span>
              </div>
              <div className="space-y-2 text-[#EADBCE]">
                <div className="text-violet-400 font-semibold">// New Order Single (MsgType=D)</div>
                <div className="p-2.5 bg-black/40 rounded-xl break-all">
                  8=FIX.4.4|9=142|35=D|49=ADVIZA_AI|56=SCHW_FIX_GW|11=ORD-9481|55=VTI|54=1|38=50|40=1|10=182
                </div>
                <div className="text-emerald-400 font-semibold pt-2">// Simulated Execution Report (MsgType=8)</div>
                <div className="p-2.5 bg-black/40 rounded-xl break-all">
                  8=FIX.4.4|9=168|35=8|37=EXEC-8832|39=2|150=2|55=VTI|54=1|38=50|32=50|31=284.15|10=044
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive ROI Calculator ────────────────────────────────────── */}
      <section id="roi" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-[#121217] to-[#1E1E28] text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">ROI Calculator</h2>
            <h3 className="text-3xl font-extrabold">Estimate Your Practice's Annual Savings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <label className="text-xs text-[#8E847C] font-semibold block mb-2">Number of Advisors: {advisorsCount}</label>
              <input
                type="range"
                min="1"
                max="50"
                value={advisorsCount}
                onChange={(e) => setAdvisorsCount(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <label className="text-xs text-[#8E847C] font-semibold block mb-2">Hours Saved / Advisor / Wk: {hoursSavedPerWeek}h</label>
              <input
                type="range"
                min="2"
                max="15"
                value={hoursSavedPerWeek}
                onChange={(e) => setHoursSavedPerWeek(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <label className="text-xs text-[#8E847C] font-semibold block mb-2">Blended Hourly Rate: ${advisorHourlyRate}/hr</label>
              <input
                type="range"
                min="75"
                max="500"
                step="25"
                value={advisorHourlyRate}
                onChange={(e) => setAdvisorHourlyRate(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center">
            <div className="text-xs uppercase font-bold tracking-widest text-rose-400 mb-1">Estimated Annual Practice Value Created</div>
            <div className="text-4xl sm:text-5xl font-black text-rose-400 mb-4">
              ${annualSavings.toLocaleString()} / year
            </div>
            <a
              href={`${APP_URL}/auth/signup?plan=pro`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-sm transition"
            >
              Start Saving with Adviza
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Pricing Matrix ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 bg-white border-t border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">Transparent Pricing</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#121217]">
              Simple, High-ROI Plans Built to Scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`rounded-3xl p-8 flex flex-col justify-between border ${
                  plan.highlighted
                    ? "bg-[#121217] text-white border-rose-500 shadow-2xl relative"
                    : "bg-[#FAF5F0] text-[#121217] border-[#EADBCE]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className={`text-xs mb-6 font-medium ${plan.highlighted ? "text-[#8E847C]" : "text-[#645F5A]"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className={`text-xs font-semibold ${plan.highlighted ? "text-[#8E847C]" : "text-[#645F5A]"}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 text-xs font-semibold mb-8">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-rose-400" : "text-rose-600"}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={plan.href}
                  className={`w-full py-3.5 rounded-full text-center text-xs font-bold transition shadow-sm ${
                    plan.highlighted
                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                      : "bg-[#121217] hover:bg-rose-600 text-white"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & WORM Compliance ──────────────────────────────────────── */}
      <section id="security" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EADBCE] shadow-sm">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121217] mb-2">
              Fiduciary-Grade Security & WORM Compliance
            </h2>
            <p className="text-sm text-[#645F5A] font-medium">
              Engineered to satisfy Chief Compliance Officers (CCOs), SEC Rule 204-2 examinations, and FINRA supervisory standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-medium">
            <div className="p-4 bg-[#FAF5F0] rounded-2xl border border-[#EADBCE]">
              <div className="font-bold text-[#121217] mb-1">🔒 SEC Rule 204-2 WORM Storage</div>
              <p className="text-[#645F5A]">Immutable, append-only audit records with SHA-256 hash chaining to prevent tampering or backdating.</p>
            </div>
            <div className="p-4 bg-[#FAF5F0] rounded-2xl border border-[#EADBCE]">
              <div className="font-bold text-[#121217] mb-1">🛡️ Zero-Training AI Policy</div>
              <p className="text-[#645F5A]">No client transcripts or portfolio data are ever stored or used for model training under signed AWS enterprise BAA.</p>
            </div>
            <div className="p-4 bg-[#FAF5F0] rounded-2xl border border-[#EADBCE]">
              <div className="font-bold text-[#121217] mb-1">👤 Mandatory HITL Approval Gates</div>
              <p className="text-[#645F5A]">Trade order transmissions and client emails strictly require Human-in-the-Loop advisor sign-off.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-[#121217] text-white py-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">Adviza AI</span>
            <span className="text-[#8E847C] ml-2">© {new Date().getFullYear()} Adviza AI Enterprise. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-[#8E847C]">
            <a href={`${APP_URL}/auth/login`} className="hover:text-white transition">Advisor Login</a>
            <a href={`${APP_URL}/auth/signup`} className="hover:text-white transition">Sign Up</a>
            <a href="#security" className="hover:text-white transition">Security & Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
