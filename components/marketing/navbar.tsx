"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

interface NavbarProps {
  banner?: {
    enabled?: boolean;
    badge?: string;
    text?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

export function MarketingNavbar({ banner }: NavbarProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-[1360px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand Logo matching Contiant style */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full bg-[#1C242C] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
              <path
                d="M12 3a9 9 0 1 0 9 9c0-.6 0-1.2-.1-1.8A7 7 0 1 1 12 5.1V3z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-xl font-heading font-extrabold tracking-tight text-[#1C242D]">
            adviza
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#5A6578]">
          <Link href="#solutions" className="hover:text-[#1C242D] transition">
            Product
          </Link>
          <Link href="#powergrid" className="hover:text-[#1C242D] transition">
            Developers
          </Link>
          <Link href="#advantages" className="hover:text-[#1C242D] transition">
            Solutions
          </Link>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#1C242D] transition px-2.5 py-1 rounded-full border border-slate-200 text-xs text-[#1C242D] font-semibold">
            <span>US / RIA</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </nav>

        {/* Right Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="btn-contiant-dark px-6 py-2 text-xs font-semibold"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="btn-contiant-purple px-6 py-2 text-xs font-semibold"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#1C242D]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-lg animate-fade-in">
          <nav className="space-y-3 text-sm font-medium text-[#1C242D]">
            <Link href="#solutions" onClick={() => setMobileOpen(false)} className="block">
              Product
            </Link>
            <Link href="#powergrid" onClick={() => setMobileOpen(false)} className="block">
              Developers
            </Link>
            <Link href="#advantages" onClick={() => setMobileOpen(false)} className="block">
              Solutions
            </Link>
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="btn-contiant-dark w-full py-2.5 text-center text-xs justify-center"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileOpen(false)}
              className="btn-contiant-purple w-full py-2.5 text-center text-xs justify-center"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
