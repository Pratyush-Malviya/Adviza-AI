import Link from "next/link";
import { Zap, ShieldCheck, Lock, ExternalLink, ArrowRight } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[#121217] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-white">
                Adviza<span className="text-violet-400 font-light ml-0.5">AI</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              The Autonomous Execution Workspace for modern wealth management firms, RIAs, and multi-family offices.
              Accelerating advisor meeting intelligence, mathematical portfolio rebalancing, and tamper-proof compliance documentation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-medium">
                <Lock className="w-3 h-3 text-violet-400" />
                <span>SOC 2 Type II Certified</span>
              </div>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">Platform</p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/platform" className="hover:text-white transition">
                  Overview & Architecture
                </Link>
              </li>
              <li>
                <Link href="/platform#briefings" className="hover:text-white transition">
                  Pre-Meeting Dossiers
                </Link>
              </li>
              <li>
                <Link href="/platform#intelligence" className="hover:text-white transition">
                  Ambient Scribe & Transcription
                </Link>
              </li>
              <li>
                <Link href="/platform#portfolio" className="hover:text-white transition">
                  Portfolio Drift Engine
                </Link>
              </li>
              <li>
                <Link href="/platform#compliance" className="hover:text-white transition">
                  CCO Compliance Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Trust & Compliance */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">Trust & Security</p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/security" className="hover:text-white transition">
                  Security Trust Center
                </Link>
              </li>
              <li>
                <Link href="/security#books-records" className="hover:text-white transition">
                  SEC 204-2 / FINRA 17a-4
                </Link>
              </li>
              <li>
                <Link href="/security#worm-storage" className="hover:text-white transition">
                  WORM Immutable Ledger
                </Link>
              </li>
              <li>
                <Link href="/security#data-privacy" className="hover:text-white transition">
                  Zero LLM Training Guarantee
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-white transition">
                  RIA Case Studies & ROI
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">Company</p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Adviza AI
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Plans & Packaging
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Book Institutional Demo
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/super-admin/login" className="text-zinc-600 hover:text-zinc-400 transition text-[11px]">
                  Platform Operator Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="pt-8 space-y-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <strong>Regulatory & Compliance Notice:</strong> Adviza AI is a technology service provider and enterprise software developer.
            Adviza AI is not a Registered Investment Adviser (RIA), broker-dealer, or fiduciary custodian under the Investment Advisers Act of 1940
            or the Securities Exchange Act of 1934. All portfolio drift calculations, briefing dossiers, and meeting summaries generated by Adviza AI
            are non-discretionary analytical tools provided strictly for evaluation by qualified licensed wealth advisors and compliance personnel.
            Advisors retain sole fiduciary responsibility for trade decisions, client advice, and regulatory suitability determinations.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 pt-4 border-t border-white/5">
            <p>© {new Date().getFullYear()} Adviza AI, Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-zinc-300 transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-zinc-300 transition">
                Terms
              </Link>
              <Link href="/security" className="hover:text-zinc-300 transition">
                Security Architecture
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
