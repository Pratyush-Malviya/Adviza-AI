import Link from "next/link";
import {
  Brain,
  FileText,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  User,
  LogIn,
  Mic,
  Video,
  Pause,
  Check,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Client Briefing Agent",
    description:
      "Generates structured meeting briefing packs in seconds — CRM history, portfolio context, open actions, opportunity signals, and risk flags. All in one view.",
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    border: "border-purple-200/70",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    icon: FileText,
    title: "Meeting Intelligence Agent",
    description:
      "Transcribes and analyzes every client meeting in real-time. Extracts action items, sentiment, portfolio decisions, and drafts advisor follow-ups instantly.",
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    border: "border-rose-200/70",
    badge: "bg-rose-100 text-rose-700",
  },
  {
    icon: Shield,
    title: "Compliance & Audit Agent",
    description:
      "Auto-generates suitability notes and compliance records after every meeting. Immutable audit trail maintained continuously, not reconstructed after the fact.",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    border: "border-amber-200/70",
    badge: "bg-amber-100 text-amber-800",
  },
];

const STATS = [
  { value: "5–10 hrs", label: "Saved per advisor / week", icon: Clock },
  { value: "40%", label: "Less operational overhead", icon: TrendingUp },
  { value: "3×", label: "Faster meeting documentation", icon: Zap },
  { value: "100%", label: "Audit-ready from day one", icon: Shield },
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
    href: "/auth/signup",
    highlighted: false,
  },
  {
    name: "Advisor Pro",
    price: "$99",
    period: "per month",
    description: "For high-performing advisory practices and wealth teams",
    features: [
      "Unlimited client meetings",
      "Full real-time intelligence & suggestions",
      "Continuous compliance & audit trail",
      "CRM & Calendar two-way sync",
      "Automated client follow-up drafting",
      "Priority 24/7 support",
      "Multi-advisor team workspace",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/auth/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise RIA",
    price: "Custom",
    period: "tailored",
    description: "For large RIAs, multi-family offices, and wealth institutions",
    features: [
      "Everything in Advisor Pro",
      "Custom compliance rules & archival",
      "SSO, SAML & role-based permissions",
      "Dedicated Amazon Bedrock VPC",
      "Custom CRM & custodian integrations",
      "Enterprise SLA & dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@adviza.ai",
    highlighted: false,
  },
];

const LOGOS = [
  { name: "SHELLS", symbol: "◎" },
  { name: "SmartFinder", symbol: "❖" },
  { name: "Zoomerr", symbol: "⚡" },
  { name: "kontrastr", symbol: "■" },
  { name: "WAVESMARATHON", symbol: "|||\\" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200 selection:text-rose-900">
      {/* Navigation matching reference */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-[#FAF5F0]/90 backdrop-blur-md border-b border-[#EADBCE]/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo Squircle */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#121217] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-[#121217]">
                Adviza<span className="text-rose-500">.</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-9 text-[15px] font-medium text-[#4A4540]">
              <Link href="#how-it-works" className="hover:text-[#121217] transition-colors">
                How it works
              </Link>
              <Link href="#use-cases" className="hover:text-[#121217] transition-colors">
                Use cases
              </Link>
              <Link href="#features" className="hover:text-[#121217] transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="hover:text-[#121217] transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="hover:text-[#121217] transition-colors">
                FAQ
              </Link>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="w-10 h-10 rounded-full border border-[#D8CCC2] hover:border-[#121217] bg-white flex items-center justify-center text-[#121217] transition-all hover:scale-105"
                title="Sign In"
              >
                <LogIn className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="w-10 h-10 rounded-full border border-[#D8CCC2] hover:border-[#121217] bg-white flex items-center justify-center text-[#121217] transition-all hover:scale-105"
                title="Account"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-6 sm:px-8 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 xl:col-span-5 pt-4">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-heading font-extrabold tracking-tight leading-[1.08] mb-6">
                <span className="gradient-text-hero">AI analysis</span>
                <br />
                <span className="text-[#121217]">for real-time</span>
                <br />
                <span className="text-[#121217]">discussions</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5A544E] leading-relaxed max-w-lg mb-8">
                Adviza AI records your wealth advisory meetings, recognizes who’s speaking, and provides real-time insights and live recommendations — all without taking manual notes.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Link
                  href="/auth/signup"
                  className="btn-hero-gradient inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-white font-semibold text-base shadow-lg shadow-rose-500/20 group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span>Start for free</span>
                </Link>

                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white border border-[#D8CCC2] hover:border-[#121217] text-[#121217] font-semibold text-base transition-all hover:bg-[#F7EFE8]"
                >
                  Contact us
                </Link>
              </div>

              {/* Bullets */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#7A726A] font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A89E95]" />
                  31-day free trial
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A89E95]" />
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A89E95]" />
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Right Interactive Hero Showcase (Matching reference UI) */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center min-h-[520px] lg:min-h-[580px]">
              
              {/* Connector lines SVG behind cards */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 120 120 C 180 160, 240 180, 310 220"
                  fill="none"
                  stroke="#EADBCE"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="215" cy="175" r="14" fill="#F43F5E" fillOpacity="0.15" />
                <circle cx="215" cy="175" r="8" fill="#F43F5E" />
                <path
                  d="M 520 130 C 460 160, 420 190, 380 230"
                  fill="none"
                  stroke="#EADBCE"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Floating Participant Video 1 (Top Left) */}
              <div className="absolute -top-2 left-4 sm:left-12 z-20 animate-float">
                <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-rose-200/80 shadow-md bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Advisor Participant"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-1 rounded-md text-white flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-rose-400" />
                    <Mic className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating Participant Video 2 (Top Right) */}
              <div className="absolute top-6 right-2 sm:right-8 z-20 animate-float-slow">
                <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-purple-200/80 shadow-md bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                    alt="Wealth Client"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-1 rounded-md text-white flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-emerald-400" />
                    <Mic className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating Participant Video 3 (Bottom Left) */}
              <div className="absolute bottom-2 left-6 sm:left-14 z-20 animate-float-slow">
                <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#EADBCE] shadow-md bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
                    alt="Estate Planner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-1 rounded-md text-white flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-white" />
                    <Mic className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating Participant Video 4 (Bottom Right) */}
              <div className="absolute bottom-4 right-4 sm:right-10 z-20 animate-float">
                <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#EADBCE] shadow-md bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                    alt="Tax Specialist"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-1 rounded-md text-white flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-emerald-400" />
                    <Mic className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Central Main Meeting Intelligence Device / App Card */}
              <div className="relative z-30 w-full max-w-[320px] sm:max-w-[340px] bg-white rounded-[32px] shadow-2xl border border-[#EADBCE] overflow-hidden">
                
                {/* Top Floating Reviews Pill */}
                <div className="absolute -top-3 right-4 z-40 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-100 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-[#121217]">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 flex items-center justify-center text-[8px] text-white font-extrabold">
                    G
                  </div>
                  <div className="flex text-amber-400 text-[10px]">
                    {"★".repeat(5)}
                  </div>
                  <span>5.0 / 5.0</span>
                </div>

                {/* Dark Meeting Header Container */}
                <div className="bg-[#121217] text-white p-5 pt-7 rounded-b-[28px] relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-sm tracking-tight text-white">
                        Portfolio Review & Strategy
                      </h3>
                      <p className="text-[10px] text-zinc-400">Sterling High-Net-Worth Advisory</p>
                    </div>
                    <div className="text-zinc-400 text-sm font-mono">•••</div>
                  </div>

                  {/* Audio Waveform Display */}
                  <div className="relative h-12 flex items-center justify-between gap-1 px-2 mb-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                    {[14, 24, 8, 32, 28, 16, 38, 22, 12, 34, 26, 18, 30, 22, 10, 26, 36, 20, 14, 28, 16, 24].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full ${
                          i === 11 ? "bg-rose-500 h-10 shadow-sm shadow-rose-500" : "bg-zinc-600"
                        }`}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                    {/* Scrub marker */}
                    <div className="absolute left-[54%] top-0 bottom-0 w-0.5 bg-rose-500 shadow-glow" />
                  </div>

                  {/* Waveform timestamp indicator */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      00:05:39
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-sans font-semibold border border-rose-500/30">
                      <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                      Analysing...
                    </span>
                  </div>
                </div>

                {/* Floating Highlight Speech Bubble */}
                <div className="p-4 relative">
                  <div className="bg-white rounded-2xl p-3.5 shadow-lg border border-zinc-100 mb-3 -mt-6 relative z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                          alt="Conrad"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-900">David M.</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-semibold">
                        05:45
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-800 leading-snug">
                      “We should reallocate 15% into municipal bonds before Q3 to optimize tax liability.”
                    </p>
                  </div>

                  {/* Secondary Transcript Items */}
                  <div className="space-y-2.5 text-xs text-zinc-600 px-1">
                    <div className="border-l-2 border-zinc-200 pl-2.5">
                      <p className="font-semibold text-zinc-900 text-[11px]">Adviza Suitability Note:</p>
                      <p className="text-[11px] text-zinc-500">Tax exemption criteria satisfied. Risk tolerance matches conservative growth profile.</p>
                    </div>
                    <div className="border-l-2 border-zinc-200 pl-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[11px] text-zinc-800">Sofia R.</span>
                        <span className="text-[10px] text-zinc-400 font-mono">04:34</span>
                      </div>
                      <p className="text-[11px] text-zinc-600">Agree. Please prepare the beneficiary transition documents.</p>
                    </div>
                  </div>

                  {/* Bottom Audio Control floating button */}
                  <div className="mt-4 flex justify-center">
                    <button className="w-9 h-9 rounded-full bg-[#121217] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                      <Pause className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Mid-page Announcement Banner */}
      <section className="py-4 px-6 sm:px-8 border-y border-[#EADBCE] bg-[#F7EFE8]/70">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3 text-center text-sm">
          <span className="font-semibold text-[#121217]">
            Enjoy 50% off premium features for first 3 months — 21 days remaining
          </span>
          <Link
            href="/auth/signup?promo=50off"
            className="inline-flex items-center gap-1.5 font-bold text-rose-600 hover:text-rose-700 transition-colors group"
          >
            <span className="w-4 h-4 rounded-full border border-rose-600 flex items-center justify-center text-[10px]">
              →
            </span>
            <span>Start 14 days trial</span>
          </Link>
        </div>
      </section>

      {/* Monochrome Brand Logos Strip */}
      <section className="py-12 px-6 sm:px-8 bg-[#FAF5F0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-8 md:gap-12 opacity-85 grayscale hover:grayscale-0 transition-all">
            {LOGOS.map((logo) => (
              <div key={logo.name} className="flex items-center gap-2 text-xl sm:text-2xl font-heading font-extrabold tracking-wider text-[#121217]">
                <span className="text-lg opacity-60">{logo.symbol}</span>
                <span>{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 sm:px-8 bg-white border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.value} className="text-center">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3 text-rose-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#121217] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[#7A726A] font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 sm:px-8 lg:px-12 bg-[#FAF5F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-heading font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Core AI Agents
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight mb-4">
              Built specifically for modern wealth management.
            </h2>
            <p className="text-[#686058] text-base sm:text-lg">
              Every agent is fine-tuned for RIA compliance, CRM context, and high-stakes client conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-white rounded-3xl p-8 border ${feature.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.badge} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-[#121217] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#686058] leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / 4-Step Flow */}
      <section id="how-it-works" className="py-24 px-6 sm:px-8 lg:px-12 bg-white border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-heading font-bold uppercase tracking-wider mb-4">
              Seamless Workflow
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight mb-4">
              From meeting start to compliance record in minutes.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Schedule Meeting",
                desc: "Syncs automatically with Google Calendar and Outlook to pull client context.",
              },
              {
                step: "02",
                title: "Get Briefing Pack",
                desc: "AI compiles portfolio holdings, previous notes, and open action items in 1 page.",
              },
              {
                step: "03",
                title: "Live Analysis",
                desc: "Real-time speech recognition extracts sentiment, key quotes, and action triggers.",
              },
              {
                step: "04",
                title: "Auto-Compliance",
                desc: "Instant suitability documentation and draft follow-up ready for advisor approval.",
              },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-3xl bg-[#FAF5F0] border border-[#EADBCE]/70">
                <div className="text-xs font-mono font-extrabold text-rose-500 mb-3 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">{item.title}</h3>
                <p className="text-sm text-[#686058] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="py-24 px-6 sm:px-8 lg:px-12 bg-[#FAF5F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-heading font-bold uppercase tracking-wider mb-4">
              Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#121217] tracking-tight mb-4">
              Simple plans for ambitious advisors.
            </h2>
            <p className="text-[#686058]">No setup fee. 14-day full access trial. Upgrade or cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[32px] p-8 sm:p-10 transition-all ${
                  plan.highlighted
                    ? "bg-[#121217] text-white shadow-2xl ring-2 ring-rose-500 relative"
                    : "bg-white text-[#121217] border border-[#EADBCE] shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <div className={`text-xs font-heading font-bold uppercase tracking-wider mb-2 ${plan.highlighted ? "text-rose-400" : "text-zinc-500"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold">
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? "text-zinc-400" : "text-zinc-500"}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? "text-zinc-300" : "text-zinc-600"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 ${
                          plan.highlighted ? "text-rose-400" : "text-rose-600"
                        }`}
                      />
                      <span className={plan.highlighted ? "text-zinc-200" : "text-zinc-700"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full text-center py-4 px-6 rounded-full font-bold text-sm transition-all ${
                    plan.highlighted
                      ? "btn-hero-gradient text-white shadow-lg shadow-rose-500/30"
                      : "bg-[#121217] hover:bg-zinc-800 text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Accelerate CTA */}
      <section className="py-24 px-6 sm:px-8 bg-white border-t border-[#EADBCE]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-[#121217] mb-6">
            Ready to give your advisors
            <br />
            <span className="gradient-text-hero">5 hours back every week?</span>
          </h2>
          <p className="text-lg text-[#686058] max-w-xl mx-auto mb-10">
            Join wealth advisory firms using Adviza to eliminate operational friction and automate compliance.
          </p>
          <Link
            href="/auth/signup"
            className="btn-hero-gradient inline-flex items-center gap-3 px-9 py-4 rounded-full text-white font-bold text-lg shadow-xl shadow-rose-500/25"
          >
            <span>Start Free Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer matching reference design */}
      <footer className="bg-[#FAF5F0] border-t border-[#EADBCE] py-14 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#121217] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full border-2 border-white" />
            </div>
            <span className="font-heading font-bold text-base text-[#121217]">Adviza AI</span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            © {new Date().getFullYear()} Adviza AI. Empowering wealth advisors with real-time intelligence.
          </p>
          <div className="flex gap-6 text-xs sm:text-sm text-[#7A726A]">
            <Link href="/privacy" className="hover:text-[#121217] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#121217] transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-[#121217] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
