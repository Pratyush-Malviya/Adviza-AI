"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, CheckCircle2 } from "lucide-react";

export function ContiantDarkSectionExact() {
  return (
    <section id="advantages" className="py-16 px-4 sm:px-6 bg-white">
      {/* Giant Dark Slate Rounded Container matching Screenshot 3 */}
      <div className="max-w-[1360px] mx-auto rounded-[36px] bg-[#1C242C] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: 3 Stacked Mint-Teal Cards matching Screenshot 3 */}
          <div className="lg:col-span-5 space-y-4">
            {/* Mint Card 1 */}
            <div className="rounded-2xl bg-[#A8CDC6] text-[#1C242C] p-6 sm:p-7 space-y-3 shadow-md">
              {/* Geometric Icon */}
              <div className="w-10 h-10 rounded-full bg-[#1C242C] flex items-center justify-center text-[#A8CDC6] overflow-hidden">
                <div className="w-5 h-5 bg-[#A8CDC6] rounded-tl-full rounded-br-full" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
                Eliminate prep work
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#1C242C]/80 leading-relaxed">
                Eliminate 45 minutes of manual CRM and custodian hunting before every client meeting.
              </p>
            </div>

            {/* Mint Card 2 */}
            <div className="rounded-2xl bg-[#A8CDC6] text-[#1C242C] p-6 sm:p-7 space-y-3 shadow-md">
              {/* Geometric Icon */}
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#1C242C]" />
                <div className="w-8 h-8 rounded-full bg-[#1C242C]/40" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
                Reduce overhead cost
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#1C242C]/80 leading-relaxed">
                3x times less expensive than adding administrative associates to handle meeting minutes.
              </p>
            </div>

            {/* Mint Card 3 */}
            <div className="rounded-2xl bg-[#A8CDC6] text-[#1C242C] p-6 sm:p-7 space-y-3 shadow-md">
              {/* Geometric Icon */}
              <div className="w-10 h-10 rounded-full bg-[#1C242C] flex items-center justify-center text-[#A8CDC6]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A8CDC6]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
                Zero audit exposure
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#1C242C]/80 leading-relaxed">
                Instant SEC Rule 204-2 and FINRA 2111 compliant WORM ledger export in 1 click.
              </p>
            </div>
          </div>

          {/* Right Column: Copy, Card Mockups & Purple Button matching Screenshot 3 */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Headline with Signature Purple Underline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[62px] font-heading font-bold text-white tracking-tight leading-[1.1]">
              Tired of manual{" "}
              <span className="block mt-1">
                <span className="relative inline-block text-white">
                  Advisory drag?
                  {/* Purple Underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full overflow-visible pointer-events-none"
                    height="14"
                    viewBox="0 0 320 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8.5C60 3 140 2.5 210 7C260 10.5 290 10.5 317 5.5"
                      stroke="#7935FF"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h2>

            <p className="text-base sm:text-lg text-white/70 max-w-lg leading-relaxed">
              Join the advisory evolution with us. Run client meetings, rebalance portfolios, and push pristine CRM memos that are completed in seconds.
            </p>

            {/* Dark Glass Floating Cards Visual */}
            <div className="relative h-44 w-full max-w-md py-4">
              <div className="absolute left-0 top-0 w-64 h-36 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10 p-4 shadow-2xl transform -rotate-3">
                <div className="flex justify-between items-center text-xs text-white/40 mb-3">
                  <span className="font-mono">FIDUCIARY CARD</span>
                  <div className="w-5 h-3 rounded bg-white/20" />
                </div>
                <p className="text-base font-bold text-white font-mono tracking-wider">•••• 8941</p>
                <div className="mt-4 flex justify-between text-[10px] text-white/60">
                  <span>CHARLES SCHWAB</span>
                  <span>09/28</span>
                </div>
              </div>

              <div className="absolute left-16 top-4 w-64 h-36 rounded-2xl bg-white/[0.05] backdrop-blur-lg border border-white/10 p-4 shadow-2xl transform rotate-6">
                <div className="flex justify-between items-center text-xs text-white/40 mb-3">
                  <span className="font-mono">AUDIT VAULT</span>
                  <div className="w-5 h-3 rounded bg-white/20" />
                </div>
                <p className="text-base font-bold text-white font-mono tracking-wider">•••• 3312</p>
                <div className="mt-4 flex justify-between text-[10px] text-white/60">
                  <span>WORM LEDGER</span>
                  <span>SEC 204-2</span>
                </div>
              </div>
            </div>

            {/* Electric Purple Pill CTA matching Screenshot 3 */}
            <div className="pt-4">
              <Link
                href="/contact"
                className="btn-contiant-purple px-9 py-3.5 text-base font-semibold shadow-lg shadow-[#7935FF]/30 inline-flex items-center gap-2"
              >
                <span>Contact us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
