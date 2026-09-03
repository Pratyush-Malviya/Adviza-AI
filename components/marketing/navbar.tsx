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
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Banner */}
      {showBanner && (
        <div className="bg-[#1F2933] text-white text-[11px] sm:text-xs py-2 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-[#8247FF] text-[10px] font-mono font-bold uppercase tracking-wider text-white">
              {banner?.badge || "Update"}
            </span>
            <span className="text-white/80 font-medium">{banner?.text}</span>
            <Link
              href={banner?.ctaLink || "/platform"}
              className="inline-flex items-center gap-1 font-semibold text-[#DFD1F4] hover:text-white transition"
            >
              <span>{banner?.ctaText || "Learn More"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Contiant-Style Floating Capsule Pill Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="rounded-full bg-[#0D0D0C]/85 backdrop-blur-xl border border-white/10 px-5 py-2.5 flex items-center justify-between shadow-2xl">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#8247FF] flex items-center justify-center text-white shadow-md shadow-[#8247FF]/30 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-heading font-extrabold tracking-tight text-white">
                Adviza<span className="text-[#8247FF]">.</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase -mt-1">
                Fiduciary AI
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-[#8247FF] text-white shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-contiant-primary px-5 py-2 text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D0D0C]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4 animate-fade-in">
          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-[#8247FF] text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="btn-contiant-secondary w-full py-2.5 text-center text-xs font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileOpen(false)}
              className="btn-contiant-primary w-full py-2.5 text-center text-xs font-semibold"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
