"use client";

import React from "react";

export function ContiantPartnersExact() {
  return (
    <section className="py-12 px-6 bg-white border-b border-slate-100">
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Label matching Screenshot 2 */}
        <p className="text-xs sm:text-[13px] font-semibold text-[#5A6578] max-w-xs leading-relaxed text-center md:text-left">
          Trusted by 450+ Advisory Practices,
          <span className="block">19 Custodian Interfaces and counting ...</span>
        </p>

        {/* Logos Grid on Pure White matching Screenshot 2 */}
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 opacity-75">
          {/* Citi */}
          <div className="flex items-center text-xl font-bold tracking-tight text-[#1C242D] font-mono">
            cíti
          </div>

          {/* Monzo / Schwab */}
          <div className="flex items-center gap-1.5 text-base font-bold text-[#1C242D]">
            <div className="w-5 h-5 rounded-full bg-[#1C242C] text-white flex items-center justify-center text-[10px]">
              S
            </div>
            <span>schwab</span>
          </div>

          {/* Pershing */}
          <div className="flex items-center text-lg font-bold tracking-tight text-[#1C242D]">
            PERSHING
          </div>

          {/* Revolut */}
          <div className="flex items-center text-xl font-extrabold text-[#1C242D]">
            R
          </div>

          {/* Fidelity */}
          <div className="flex items-center text-base font-semibold text-[#1C242D] tracking-wide">
            Fidelity
          </div>
        </div>
      </div>
    </section>
  );
}
