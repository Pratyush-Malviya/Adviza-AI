"use client";

import React from "react";
import { Check } from "lucide-react";

export function ContiantPowerGridExact() {
  return (
    <section id="powergrid" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-[1360px] mx-auto text-center space-y-16">
        {/* Title with Purple Burst Ray Accents matching Screenshot 4 */}
        <div className="inline-block relative">
          <h2 className="text-4xl sm:text-6xl font-heading font-bold text-[#1C242D] tracking-tight">
            One advisory{" "}
            <span className="relative inline-block">
              power grid
              {/* Dynamic Purple Burst Rays */}
              <svg
                className="absolute -top-5 -right-6 w-7 h-7 text-[#7935FF]"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14 2V8" stroke="#7935FF" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M22 6L18 10" stroke="#7935FF" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M26 14H20" stroke="#7935FF" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
        </div>

        {/* Diagram Architecture matching Screenshot 4 */}
        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6 py-6">
          {/* Left: 6 White Rounded Square Custodian Tiles (2 columns x 3 rows) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-[360px] flex-shrink-0">
            {[
              { name: "Schwab", label: "Charles Schwab" },
              { name: "Fidelity", label: "Fidelity Inst." },
              { name: "cíti", label: "Citi Wealth" },
              { name: "R", label: "Revolut" },
              { name: "PERSHING", label: "BNY Mellon" },
              { name: "UBS", label: "UBS Global" },
            ].map((bank, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-spec-card border border-slate-100 flex flex-col items-center justify-center h-24 text-center hover:scale-105 transition-transform"
              >
                <span className="text-base font-extrabold text-[#1C242D] block mb-1">
                  {bank.name}
                </span>
                <span className="text-[10px] text-[#5A6578]">{bank.label}</span>
              </div>
            ))}
          </div>

          {/* Center: Connecting Branching Purple Lines + Dark Hub Icon */}
          <div className="relative flex items-center justify-center my-2 lg:my-0">
            {/* Horizontal Line for Desktop */}
            <div className="hidden lg:block w-16 h-0.5 bg-[#7935FF]/30" />

            {/* Dark Central Hub Icon matching Screenshot 4 */}
            <div className="w-16 h-16 rounded-2xl bg-[#1C242C] text-white flex items-center justify-center shadow-xl z-10">
              <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white">
                <path
                  d="M12 3a9 9 0 1 0 9 9c0-.6 0-1.2-.1-1.8A7 7 0 1 1 12 5.1V3z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="hidden lg:block w-16 h-0.5 bg-[#7935FF]/30" />
          </div>

          {/* Right: Output Action Card & Lilac Success Card matching Screenshot 4 */}
          <div className="relative flex items-center justify-center gap-4 w-full lg:w-auto">
            {/* Execution Action Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 w-56 text-left space-y-3">
              <div className="w-full h-24 rounded-xl bg-slate-50 flex items-center justify-center text-center p-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#7935FF] block">INSTANT REBALANCE</span>
                  <span className="text-xs font-bold text-[#1C242D]">Model Portfolio 65/35</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#5A6578]">Allocated Order</p>
                <p className="text-base font-bold text-[#1C242D]">$150,000.00</p>
              </div>
              <div className="w-full py-2 rounded-lg bg-[#1C242C] text-white text-[11px] font-bold text-center">
                EXECUTE VIA GRID
              </div>
            </div>

            {/* Lilac Success Card */}
            <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 w-44 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center mx-auto text-[#7935FF]">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-[#1C242D] leading-tight">
                Successful execution
              </p>
              <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-[#5A6578]">
                Sealed in compliance WORM vault
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
