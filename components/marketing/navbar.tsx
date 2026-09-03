"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X, ArrowRight } from "lucide-react";

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
  { href: "#features", label: "Features" },
  { href: "#dashboard", label: "Product" },
  { href: "#statistics", label: "Results" },
  { href: "#solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingNavbar({ banner }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showBanner = banner?.enabled !== false && banner?.text;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Banner */}
      {showBanner && !scrolled && (
        <div className="bg-[#0F172A] text-white text-[12px] py-2 px-4 border-b border-slate-800 transition-opacity">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-[#4F6EF7] text-[10px] font-bold uppercase tracking-wider text-white">
              {banner?.badge || "New Release"}
            </span>
            <span className="text-slate-300 font-medium">{banner?.text}</span>
            <Link
              href={banner?.ctaLink || "/platform"}
              className="inline-flex items-center gap-1 font-semibold text-[#6C8DFF] hover:text-white transition"
            >
              <span>{banner?.ctaText || "Learn More"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F6EF7] to-[#7A8DFF] flex items-center justify-center text-white shadow-md shadow-[#4F6EF7]/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight text-[#111827]">
              Adviza<span className="text-[#4F6EF7]">.</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-[15px] font-medium text-[#6B7280] hover:text-[#111827] px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-spec-primary px-6 py-2.5 text-[15px] inline-flex items-center gap-1.5"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#111827] hover:bg-slate-100 transition"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-6 py-6 space-y-4 shadow-xl animate-fade-in">
          <nav className="space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#111827] hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-3">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="btn-spec-secondary w-full py-2.5 text-center text-[15px]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileOpen(false)}
              className="btn-spec-primary w-full py-2.5 text-center text-[15px]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
