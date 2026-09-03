"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Shield,
  Layers,
  CreditCard,
  Building2,
  FileCheck,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  banner?: {
    enabled: boolean;
    badge: string;
    text: string;
    ctaText: string;
    ctaLink: string;
  };
}

const NAV_LINKS = [
  { href: "/platform", label: "Platform", icon: Layers },
  { href: "/security", label: "Security & Compliance", icon: Shield },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/case-studies", label: "Case Studies", icon: FileCheck },
  { href: "/about", label: "About", icon: Building2 },
];

export function MarketingNavbar({ banner }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showBanner = banner?.enabled !== false && banner?.text;

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Dynamic Announcement Banner */}
      {showBanner && (
        <div className="bg-[#121217] text-white text-[11px] sm:text-xs py-2 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-violet-600 text-[10px] font-extrabold uppercase tracking-wide text-white">
              {banner?.badge || "New"}
            </span>
            <span className="text-zinc-300 font-medium">{banner?.text}</span>
            <Link
              href={banner?.ctaLink || "/platform"}
              className="inline-flex items-center gap-1 font-semibold text-violet-300 hover:text-white transition"
            >
              <span>{banner?.ctaText || "Learn More"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-[#FAF5F0]/90 backdrop-blur-md border-b border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#121217] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-rose-400" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-[#121217]">
              Adviza<span className="text-violet-600 font-light ml-0.5">AI</span>
            </span>
            <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EADBCE]/50 text-[#6B635B]">
              RIA OS
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    active
                      ? "text-violet-700 bg-violet-50 font-bold"
                      : "text-[#5A544E] hover:text-[#121217] hover:bg-[#EADBCE]/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/contact"
              className="text-xs font-semibold text-[#5A544E] hover:text-[#121217] px-3 py-2 transition"
            >
              Book Demo
            </Link>
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-[#121217] hover:text-violet-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#121217] hover:bg-zinc-800 shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-[#5A544E] hover:text-[#121217] hover:bg-[#EADBCE]/50 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-[#EADBCE] bg-[#FAF5F0] px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                      active
                        ? "text-violet-700 bg-violet-50 font-bold"
                        : "text-[#5A544E] hover:text-[#121217] hover:bg-[#EADBCE]/40"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#8E847C]" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#EADBCE] space-y-2">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl border border-[#EADBCE] text-xs font-semibold text-[#121217] bg-white transition"
              >
                Book Institutional Demo
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl border border-[#EADBCE] text-xs font-semibold text-[#121217] bg-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-[#121217] text-white text-xs font-bold transition shadow-xs"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
