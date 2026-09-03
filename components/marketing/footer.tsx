"use client";

import Link from "next/link";
import { Zap, ShieldCheck, Lock, ExternalLink, ArrowRight } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[#0D0D0C] text-white border-t border-white/10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-14 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8247FF] flex items-center justify-center text-white shadow-md shadow-[#8247FF]/30">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Adviza<span className="text-[#8247FF]">.</span>
              </span>
            </Link>
            <p className="text-xs text-[#9AA5B1] max-w-sm leading-relaxed">
              The Enterprise AI Operating System for modern wealth advisory practices, RIAs, and multi-family offices.
              Automating meeting intelligence, portfolio rebalancing, and cryptographic compliance documentation.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#A9CECC] text-[10px] font-mono font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A9CECC] animate-pulse" />
                <span>All 3 Model Gateways Active</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono">
                <Lock className="w-3 h-3 text-[#8247FF]" />
                <span>SEC Rule 204-2 WORM Ledger</span>
              </div>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/40">Platform</p>
            <ul className="space-y-2.5 text-xs text-white/60">
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
                  Ambient Dual-Stream Scribe
                </Link>
              </li>
              <li>
                <Link href="/platform#portfolio" className="hover:text-white transition">
                  Deterministic Rebalance Sandbox
                </Link>
              </li>
              <li>
                <Link href="/platform#compliance" className="hover:text-white transition">
                  WORM SHA-256 Audit Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Governance & Trust */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/40">Governance & Trust</p>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li>
                <Link href="/security" className="hover:text-white transition">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/security#sec-reg-bi" className="hover:text-white transition">
                  SEC Reg BI & FINRA Rule 2111
                </Link>
              </li>
              <li>
                <Link href="/security#soc2" className="hover:text-white transition">
                  SOC 2 Type II Accreditation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Zero-Data Retention Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition">
                  Cancellation & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Updates */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/40">Stay Updated</p>
            <p className="text-xs text-white/50 leading-relaxed">
              Quarterly regulatory releases, model routing updates, and RIA benchmarks.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="flex items-center rounded-full bg-white/5 border border-white/10 p-1 focus-within:border-[#8247FF] transition-colors">
                <input
                  type="email"
                  placeholder="advisor@firm.com"
                  className="bg-transparent px-3 py-1 text-xs text-white placeholder-white/30 focus:outline-none w-full"
                />
                <button
                  type="submit"
                  className="w-7 h-7 rounded-full bg-[#8247FF] flex items-center justify-center text-white hover:bg-[#6C2BD9] transition flex-shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Regulatory Disclaimers & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7B8794]">
          <p>
            &copy; {new Date().getFullYear()} Adviza AI, Inc. All rights reserved. Fiduciary Intelligence Platform.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-mono">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition">
              Refund Policy
            </Link>
            <Link href="/super-admin/login" className="hover:text-white transition text-[#8247FF]">
              Super Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
