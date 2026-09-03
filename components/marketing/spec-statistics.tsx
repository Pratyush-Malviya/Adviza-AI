"use client";

import React from "react";
import { TrendingUp, Users, ShieldCheck, Clock } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  sublabel: string;
  icon: any;
}

const STATS: StatItem[] = [
  {
    value: "$18.4B+",
    label: "AUM Monitored & Analyzed",
    sublabel: "Across connected custodians",
    icon: TrendingUp,
  },
  {
    value: "450+",
    label: "Advisory Practices & RIAs",
    sublabel: "Active fiduciary teams",
    icon: Users,
  },
  {
    value: "99.8%",
    label: "Audit Exam Readiness",
    sublabel: "SEC Reg BI & FINRA 2111",
    icon: ShieldCheck,
  },
  {
    value: "4.2 hrs",
    label: "Daily Advisor Capacity Unlocked",
    sublabel: "Average time savings per advisor",
    icon: Clock,
  },
];

export function SpecStatistics() {
  return (
    <section id="statistics" className="py-24 px-6 bg-white max-w-[1280px] mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-xs font-semibold">
          <span>Measurable Operational ROI</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#111827] tracking-tight">
          Proven results for modern advisory practices
        </h2>
        <p className="text-base text-[#6B7280]">
          Quantifiable time savings, lower compliance risk, and superior client relationship depth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-[24px] bg-[#F8F9FC] border border-[#E5E7EB] text-center space-y-3 spec-card-interaction"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#4F6EF7] mx-auto shadow-xs">
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-4xl sm:text-5xl font-heading font-extrabold text-[#111827] tracking-tight">
                {stat.value}
              </p>
              <div>
                <p className="text-base font-bold text-[#111827]">{stat.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{stat.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
