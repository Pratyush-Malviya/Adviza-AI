"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ContiantSandSectionExact() {
  return (
    <section id="solutions" className="py-16 px-4 sm:px-6 bg-white">
      {/* Giant Warm Sand / Dusty Peach Container matching Screenshot 5 */}
      <div className="max-w-[1360px] mx-auto rounded-[36px] bg-[#DAC8BD] text-[#1C242C] p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column matching Screenshot 5 */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-[62px] font-heading font-bold tracking-tight leading-[1.08] text-[#1C242C]">
              Unlock the{" "}
              <span className="block">power</span>
              <span className="block">of advisory</span>
              <span className="relative inline-block text-[#1C242C]">
                data
                {/* Purple Underline matching Screenshot 5 */}
                <svg
                  className="absolute -bottom-2 left-0 w-full overflow-visible pointer-events-none"
                  height="12"
                  viewBox="0 0 160 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7C40 2.5 90 2 158 5.5"
                    stroke="#7935FF"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 9.5C65 5 110 5.5 155 7.5"
                    stroke="#7935FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#1C242C]/80 max-w-sm leading-relaxed font-normal">
              Access real-time custodian balances, automated meeting minutes, and cryptographic audit records from a single connected system.
            </p>

            {/* Dark Pill Button matching Screenshot 5 */}
            <div className="pt-2">
              <Link
                href="/auth/signup"
                className="btn-contiant-dark px-9 py-4 text-base font-semibold inline-flex items-center gap-2.5 shadow-md"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Stacked Tilted Peach Cards with Clean Geometric Circles matching Screenshot 5 */}
          <div className="lg:col-span-7 relative flex flex-wrap lg:flex-nowrap items-center justify-center gap-5">
            {/* Card 1: Balance Card */}
            <div className="w-64 rounded-3xl bg-[#EFE4DC] p-6 shadow-xl border border-white/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              {/* Geometric Graphic: Overlapping Dark Circles */}
              <div className="relative w-20 h-20 mb-10">
                <div className="w-14 h-14 rounded-full bg-[#1C242C] absolute left-0 top-0" />
                <div className="w-14 h-14 rounded-full bg-[#1C242C]/30 absolute right-0 bottom-0" />
              </div>
              <h4 className="text-xl font-heading font-bold text-[#1C242C] mb-1">
                Balance
              </h4>
              <p className="text-xs text-[#1C242C]/70">
                Verify real-time account balances across Schwab & Fidelity.
              </p>
            </div>

            {/* Card 2: Transactions / Drift Card */}
            <div className="w-64 rounded-3xl bg-[#EFE4DC] p-6 shadow-xl border border-white/40 transform rotate-2 hover:rotate-0 transition-transform duration-300 -mt-4 lg:mt-0">
              {/* Geometric Graphic: Dark Circle & Half-Moon */}
              <div className="relative w-20 h-20 mb-10">
                <div className="w-14 h-14 rounded-full bg-[#1C242C] absolute left-1 top-1" />
                <div className="w-14 h-14 rounded-bl-full bg-[#1C242C]/30 absolute right-1 bottom-1" />
              </div>
              <h4 className="text-xl font-heading font-bold text-[#1C242C] mb-1">
                Portfolio Drift
              </h4>
              <p className="text-xs text-[#1C242C]/70">
                Access detailed drift history and tax-loss offset tracking.
              </p>
            </div>

            {/* Card 3: Account Details Card */}
            <div className="w-64 rounded-3xl bg-[#EFE4DC] p-6 shadow-xl border border-white/40 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Geometric Graphic: Dark Card Outline */}
              <div className="relative w-20 h-20 mb-10 flex items-center justify-center">
                <div className="w-16 h-12 rounded-xl bg-[#1C242C] p-2 flex flex-col justify-between">
                  <div className="w-3 h-3 rounded-full bg-white/40" />
                  <div className="w-8 h-1.5 rounded-full bg-white/30" />
                </div>
              </div>
              <h4 className="text-xl font-heading font-bold text-[#1C242C] mb-1">
                Account Details
              </h4>
              <p className="text-xs text-[#1C242C]/70">
                Verify investor suitability and lock in SEC compliance proofs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
