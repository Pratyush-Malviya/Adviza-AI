"use client";

import React from "react";
import {
  Shield,
  Zap,
  Cpu,
  Layers,
  Building2,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface MarqueeItem {
  name: string;
  category: string;
  badge: string;
}

const ITEMS: MarqueeItem[] = [
  { name: "Charles Schwab", category: "Custodian API", badge: "Live Sync" },
  { name: "Fidelity Institutional", category: "Direct Brokerage", badge: "FidSafe" },
  { name: "BNY Mellon Pershing", category: "Clearinghouse", badge: "NetX360+" },
  { name: "Salesforce FSC", category: "CRM Ecosystem", badge: "2-Way Sync" },
  { name: "Wealthbox CRM", category: "Advisory CRM", badge: "REST API" },
  { name: "AWS Bedrock", category: "Fiduciary LLMs", badge: "Claude 3.5" },
  { name: "NVIDIA NIM", category: "Accelerated Inference", badge: "DeepSeek / Kimi" },
  { name: "SEC Reg BI Ready", category: "Regulatory Audit", badge: "WORM SHA-256" },
  { name: "FINRA Rule 2111", category: "Suitability Engine", badge: "Automated" },
  { name: "Black Diamond", category: "Reporting Gateway", badge: "Portfolio Data" },
  { name: "Orion Advisor Tech", category: "Rebalancing Engine", badge: "Drift Sync" },
];

export function MarqueeTicker() {
  return (
    <div className="relative w-full overflow-hidden py-10 border-y border-white/10 bg-[#0D0D0C]">
      {/* Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0D0D0C] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0D0D0C] to-transparent" />

      {/* Label */}
      <div className="max-w-7xl mx-auto px-6 mb-5 flex items-center justify-between">
        <p className="text-[11px] font-mono tracking-[0.1em] text-white/40 uppercase">
          Connected Custodians, CRMs & Regulated Financial Infrastructure
        </p>
        <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          99.99% Ecosystem Uptime
        </span>
      </div>

      {/* Ticker Row */}
      <div className="flex animate-marquee">
        {/* First set */}
        <div className="flex items-center gap-4 pr-4">
          {ITEMS.map((item, idx) => (
            <div
              key={`a-${idx}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#8247FF]/50 transition-all cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-[#8247FF]" />
              <div className="text-left">
                <span className="text-xs font-semibold text-white tracking-tight mr-2">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Duplicate set for seamless infinite loop */}
        <div className="flex items-center gap-4 pr-4" aria-hidden="true">
          {ITEMS.map((item, idx) => (
            <div
              key={`b-${idx}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#8247FF]/50 transition-all cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-[#8247FF]" />
              <div className="text-left">
                <span className="text-xs font-semibold text-white tracking-tight mr-2">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
