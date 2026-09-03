"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[#1C242C] text-white pt-20 pb-12 border-t border-slate-800">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16 border-b border-slate-700/60">
          {/* Brand & Newsletter */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1C242C]">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#1C242C]">
                  <path
                    d="M12 3a9 9 0 1 0 9 9c0-.6 0-1.2-.1-1.8A7 7 0 1 1 12 5.1V3z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                adviza
              </span>
            </Link>

            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              The autonomous execution operating system for modern wealth management firms, RIAs, and multi-family offices.
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Stay updated
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-sm gap-2">
                <input
                  type="email"
                  placeholder="advisor@firm.com"
                  className="rounded-full bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#7935FF] w-full"
                />
                <button
                  type="submit"
                  className="btn-contiant-purple px-5 py-2.5 text-xs font-semibold flex-shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Product</p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="#powergrid" className="hover:text-white transition">
                  Execution Power Grid
                </Link>
              </li>
              <li>
                <Link href="#advantages" className="hover:text-white transition">
                  Meeting Intelligence
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-white transition">
                  Advisory Data Hub
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Solutions</p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="#advantages" className="hover:text-white transition">
                  Independent RIAs
                </Link>
              </li>
              <li>
                <Link href="#advantages" className="hover:text-white transition">
                  Multi-Family Offices
                </Link>
              </li>
              <li>
                <Link href="#advantages" className="hover:text-white transition">
                  Enterprise BDs
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-white transition">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Trust & Legal</p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/security" className="hover:text-white transition">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/security#soc2" className="hover:text-white transition">
                  SOC 2 Type II
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
                <Link href="/super-admin/login" className="hover:text-white transition text-[#A8CDC6]">
                  Platform Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Adviza AI, Inc. All rights reserved. Fiduciary Intelligence Platform.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#A8CDC6]" />
              SEC Rule 204-2 Cryptographic Ledger
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
