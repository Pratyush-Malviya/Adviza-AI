"use client";

import React from "react";

const LOGOS = [
  { name: "Charles Schwab", label: "Custodian Direct API" },
  { name: "Fidelity Institutional", label: "Brokerage Interface" },
  { name: "BNY Mellon Pershing", label: "NetX360+ Clearing" },
  { name: "Salesforce FSC", label: "Financial Services Cloud" },
  { name: "Wealthbox CRM", label: "Two-Way Advisory Sync" },
  { name: "Black Diamond", label: "Portfolio Reporting" },
  { name: "Orion Advisor Tech", label: "Rebalancing Engine" },
  { name: "AWS Bedrock", label: "Fiduciary LLM Gateway" },
  { name: "NVIDIA NIM", label: "High-Throughput Inference" },
];

export function SpecLogoStrip() {
  return (
    <div className="relative w-full overflow-hidden py-10 bg-[#F8F9FC] border-y border-[#E5E7EB]">
      {/* Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#F8F9FC] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#F8F9FC] to-transparent" />

      {/* Label */}
      <div className="max-w-[1280px] mx-auto px-6 mb-5 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
          Seamlessly Connected to Leading Wealth Infrastructure
        </p>
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#22C55E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          99.99% Integration Uptime
        </span>
      </div>

      {/* Ticker Row */}
      <div className="flex animate-marquee-linear">
        {/* Set 1 */}
        <div className="flex items-center gap-4 pr-4">
          {LOGOS.map((item, idx) => (
            <div
              key={`logo-a-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-[#E5E7EB] shadow-xs hover:border-[#4F6EF7]/40 hover:shadow-sm transition-all cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-[#4F6EF7]" />
              <div className="text-left">
                <span className="text-sm font-semibold text-[#111827] mr-2">
                  {item.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8F9FC] text-[#6B7280] border border-[#E5E7EB]">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Set 2 (Duplicate for seamless loop) */}
        <div className="flex items-center gap-4 pr-4" aria-hidden="true">
          {LOGOS.map((item, idx) => (
            <div
              key={`logo-b-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-[#E5E7EB] shadow-xs hover:border-[#4F6EF7]/40 hover:shadow-sm transition-all cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-[#4F6EF7]" />
              <div className="text-left">
                <span className="text-sm font-semibold text-[#111827] mr-2">
                  {item.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8F9FC] text-[#6B7280] border border-[#E5E7EB]">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
