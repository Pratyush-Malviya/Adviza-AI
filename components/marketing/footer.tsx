"use client";

import Link from "next/link";
import { Zap, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-slate-800 pt-20 pb-12">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Four Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16 border-b border-slate-800">
          {/* Brand Info & Newsletter (Col 1 & 2) */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F6EF7] to-[#7A8DFF] flex items-center justify-center text-white shadow-md shadow-[#4F6EF7]/25">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                Adviza<span className="text-[#4F6EF7]">.</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise AI execution workspace for modern wealth advisory practices, RIAs, and multi-family offices.
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Subscribe to Institutional Updates
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-sm gap-2">
                <input
                  type="email"
                  placeholder="advisor@firm.com"
                  className="rounded-spec-input bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F6EF7] w-full transition"
                />
                <button
                  type="submit"
                  className="btn-spec-primary px-5 py-2.5 text-xs font-semibold flex-shrink-0 inline-flex items-center gap-1"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Product</p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/#features" className="hover:text-white transition">
                  Client Dossiers
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition">
                  Ambient Scribe
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition">
                  Rebalance Sandbox
                </Link>
              </li>
              <li>
                <Link href="/#dashboard" className="hover:text-white transition">
                  Dashboard Suite
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Pricing & Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Solutions</p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/#solutions" className="hover:text-white transition">
                  Independent RIAs
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-white transition">
                  Multi-Family Offices
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-white transition">
                  Broker-Dealers
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-white transition">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Governance & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Trust & Legal</p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/security" className="hover:text-white transition">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/security#soc2" className="hover:text-white transition">
                  SOC 2 Type II Report
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
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Adviza AI Inc. All rights reserved. Enterprise Fiduciary OS.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              SEC Rule 204-2 Cryptographic Ledger
            </span>
            <Link href="/super-admin/login" className="hover:text-slate-300 transition text-[#6C8DFF]">
              Platform Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
