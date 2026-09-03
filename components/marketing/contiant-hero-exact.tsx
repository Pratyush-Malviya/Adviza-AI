"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, User } from "lucide-react";

export function ContiantHeroExact() {
  return (
    <section className="relative pt-16 pb-24 px-6 overflow-hidden bg-white">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: 6 Columns */}
        <div className="lg:col-span-6 space-y-8 text-left">
          {/* Giant Contiant Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-heading font-bold text-[#1C242D] tracking-tight leading-[1.08]">
            Instant intelligence{" "}
            <span className="block mt-1">
              with{" "}
              <span className="relative inline-block text-[#1C242D]">
                Wealth Advisory
                {/* Purple Underline SVG curve matching Contiant */}
                <svg
                  className="absolute -bottom-3 left-0 w-full overflow-visible pointer-events-none"
                  height="16"
                  viewBox="0 0 320 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 10.5C50 4 120 3.5 180 8C230 11.8 280 12.5 317 6.5"
                    stroke="#7935FF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-title-underline"
                  />
                  <path
                    d="M25 13C85 8.5 190 7.5 300 10.5"
                    stroke="#7935FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </span>
          </h1>

          {/* Subtitle matching Contiant's relaxed typography */}
          <p className="text-lg sm:text-[19px] text-[#5A6578] font-normal leading-relaxed max-w-xl">
            Our advanced AI models and fiduciary execution systems provide a safe and reliable way to prepare meetings, rebalance portfolios, and seal audit records, allowing you to benefit from reduced processing times and improved efficiency.
          </p>

          {/* Contiant Purple Pill CTA */}
          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="btn-contiant-purple px-9 py-4 text-base font-semibold shadow-lg shadow-[#7935FF]/30 inline-flex items-center gap-2.5"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: 6 Columns - Floating 3D Transaction & Execution Flow */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[540px] h-[520px]">
            {/* SVG Connecting Paths */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 540 520"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M120 100 C150 160, 200 180, 260 200"
                stroke="#7935FF"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.35"
              />
              <path
                d="M320 220 C360 250, 390 280, 420 340"
                stroke="#7935FF"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.35"
              />
              <path
                d="M260 380 C320 400, 380 410, 440 430"
                stroke="#7935FF"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.35"
              />
            </svg>

            {/* Card 1: User Profile Pill (Top Left) */}
            <div className="absolute top-10 left-2 bg-white rounded-full p-2 pr-5 shadow-lg border border-slate-100 flex items-center gap-3 z-20 animate-contiant-float">
              <div className="w-10 h-10 rounded-full bg-[#DAC8BD] flex items-center justify-center text-[#1C242C] font-bold text-xs">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#1C242D]">Dr. Vance</p>
                <p className="text-[10px] text-[#5A6578]">Lead Advisor</p>
              </div>
            </div>

            {/* Card 2: Rebalance Order Card (Top Center) */}
            <div className="absolute top-4 right-16 bg-[#F3F6F8] rounded-2xl p-4 shadow-xl border border-white w-48 z-10 animate-contiant-float">
              <div className="w-full h-20 rounded-xl bg-white flex items-center justify-center mb-3 p-2 shadow-xs">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-[#7935FF] font-bold block">MODEL ALLOCATION</span>
                  <span className="text-xs font-bold text-[#1C242D]">Core Growth 65/35</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5A6578]">Portfolio Rebalance</p>
              <p className="text-base font-extrabold text-[#1C242D] mb-3">$142,000</p>
              <div className="w-full py-1.5 rounded-lg bg-[#1C242C] text-white text-[10px] font-bold text-center">
                EXECUTE ORDER
              </div>
            </div>

            {/* Card 3: Custodian Selector Card (Middle Right) */}
            <div className="absolute top-40 right-2 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 w-44 z-20">
              <p className="text-[11px] font-bold text-[#1C242D] mb-2.5">Select custodian</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#F8F9FA] border border-slate-100 text-[10px] font-bold text-[#1C242D]">
                  Schwab
                </div>
                <div className="p-2 rounded-lg bg-[#F8F9FA] border border-slate-100 text-[10px] font-bold text-[#1C242D]">
                  Fidelity
                </div>
                <div className="p-2 rounded-lg bg-[#F8F9FA] border border-slate-100 text-[10px] font-bold text-[#1C242D]">
                  Pershing
                </div>
                <div className="p-2 rounded-lg bg-[#F8F9FA] border border-slate-100 text-[10px] font-bold text-[#1C242D]">
                  Citi
                </div>
              </div>
            </div>

            {/* Card 4: Authorize Action Card (Bottom Center) */}
            <div className="absolute bottom-6 left-12 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 w-64 z-20">
              <p className="text-xs font-bold text-[#1C242D] mb-3">Authorize fiduciary action</p>
              <div className="space-y-1.5 text-[11px] text-[#5A6578] mb-4 pb-3 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold text-[#1C242D]">$142,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="font-semibold text-[#1C242D]">Schwab Clearing</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing ID:</span>
                  <span className="font-mono text-[#1C242D]">021000089</span>
                </div>
              </div>
              <div className="w-full py-2 rounded-lg bg-[#1C242C] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer hover:bg-black transition">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>CONFIRM</span>
              </div>
            </div>

            {/* Card 5: Purple Success Card (Bottom Right) */}
            <div className="absolute bottom-8 right-0 bg-[#ECE5FF] rounded-2xl p-4 shadow-lg border border-[#DAC8BD]/30 w-36 text-center z-30 animate-contiant-float">
              <div className="w-10 h-10 rounded-full bg-[#7935FF] text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-[#7935FF]/30">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#1C242D] leading-tight">
                Successful execution
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
