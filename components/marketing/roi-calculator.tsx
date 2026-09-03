"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight, Check, Zap } from "lucide-react";

export function RoiCalculator() {
  const [advisors, setAdvisors] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(300);
  const [meetingsPerWeek, setMeetingsPerWeek] = useState(7);

  // Math:
  // Meeting prep: 35 min saved per meeting
  // Post-meeting documentation + CRM entry: 25 min saved per meeting
  // Weekly total: 1 hr saved per meeting
  const hoursSavedPerWeekPerAdvisor = Math.round(meetingsPerWeek * 0.9 * 10) / 10;
  const totalWeeklyHoursSaved = Math.round(advisors * hoursSavedPerWeekPerAdvisor);
  const totalAnnualHoursSaved = Math.round(totalWeeklyHoursSaved * 48); // 48 work weeks
  const annualValueUnlocked = totalAnnualHoursSaved * hourlyRate;

  // Approximate cost on Pro ($99/mo/seat = $1,188/yr/seat)
  const annualCost = advisors * 99 * 12;
  const roiMultiplier = Math.max(1, Math.round(annualValueUnlocked / (annualCost || 1)));

  return (
    <div className="bg-[#13131A] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background glow in Contiant Purple */}
      <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 bg-[#8247FF]/10 blur-[90px] rounded-full" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8247FF]/15 text-[#DFD1F4] text-xs font-mono uppercase tracking-wider border border-[#8247FF]/30">
            <Calculator className="w-3.5 h-3.5 text-[#8247FF]" />
            <span>Interactive ROI & Productivity Wizard</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Calculate Your Firm&apos;s Annual Operational Savings
          </h3>
          <p className="text-xs sm:text-sm text-white/50 max-w-xl mx-auto">
            Based on empirical time studies across 450+ wealth advisory practices using Adviza AI.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Advisor Count */}
          <div className="p-5 rounded-2xl bg-[#1F2933]/60 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>Advisors in Firm</span>
              <span className="text-[#8247FF] font-mono text-base font-extrabold">{advisors}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={advisors}
              onChange={(e) => setAdvisors(parseInt(e.target.value))}
              className="w-full accent-[#8247FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>1</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Average Advisor Hourly Value */}
          <div className="p-5 rounded-2xl bg-[#1F2933]/60 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>Advisor Hourly Rate</span>
              <span className="text-[#A9CECC] font-mono text-base font-extrabold">${hourlyRate}/hr</span>
            </div>
            <input
              type="range"
              min="150"
              max="600"
              step="25"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseInt(e.target.value))}
              className="w-full accent-[#8247FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>$150</span>
              <span>$375</span>
              <span>$600</span>
            </div>
          </div>

          {/* Client Meetings Per Week */}
          <div className="p-5 rounded-2xl bg-[#1F2933]/60 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>Meetings/Advisor/Wk</span>
              <span className="text-white font-mono text-base font-extrabold">{meetingsPerWeek}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={meetingsPerWeek}
              onChange={(e) => setMeetingsPerWeek(parseInt(e.target.value))}
              className="w-full accent-[#8247FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>2</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Dynamic ROI Metrics Output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Annual Hours Saved */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1F2933] to-[#13131A] border border-white/10 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-white/40 uppercase">
              <Clock className="w-3.5 h-3.5 text-[#8247FF]" />
              <span>Annual Hours Recovered</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              {totalAnnualHoursSaved.toLocaleString()} <span className="text-sm font-normal text-white/40">hrs</span>
            </p>
            <p className="text-[11px] text-white/40">
              ~{Math.round(totalAnnualHoursSaved / advisors)} hours per advisor annually
            </p>
          </div>

          {/* Total Dollar Value */}
          <div className="p-6 rounded-2xl bg-[#8247FF]/10 border border-[#8247FF]/30 text-center space-y-1 shadow-lg shadow-[#8247FF]/10">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#DFD1F4] uppercase">
              <DollarSign className="w-3.5 h-3.5 text-[#8247FF]" />
              <span>Annual Capacity Unlocked</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              ${annualValueUnlocked.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#A9CECC] font-medium">
              Equivalent to {Math.max(1, Math.round(totalAnnualHoursSaved / 2080 * 10) / 10)} full-time associates
            </p>
          </div>

          {/* Projected ROI */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1F2933] to-[#13131A] border border-white/10 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-white/40 uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-[#A9CECC]" />
              <span>Projected ROI Multiplier</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold font-heading text-[#A9CECC]">
              {roiMultiplier}x
            </p>
            <p className="text-[11px] text-white/40">
              Based on professional seat tier
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="space-y-0.5 text-left">
            <p className="text-xs sm:text-sm font-semibold text-white">
              Ready to recapture {totalWeeklyHoursSaved} hours per week across your team?
            </p>
            <p className="text-[11px] text-white/40">
              Deploy your firm&apos;s autonomous AI execution grid in under 15 minutes.
            </p>
          </div>

          <Link
            href="/auth/signup"
            className="btn-contiant-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold whitespace-nowrap shadow-md"
          >
            <span>Start 14-Day Firm Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
