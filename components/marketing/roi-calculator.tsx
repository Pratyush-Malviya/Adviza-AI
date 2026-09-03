"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight, Check } from "lucide-react";

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
    <div className="bg-white rounded-3xl border border-[#EADBCE] p-6 sm:p-10 shadow-xs">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI & Productivity Estimator</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Calculate Your Firm’s Annual Operational Savings
          </h3>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            Based on empirical time studies across 450+ wealth advisory practices using Adviza AI.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Advisor Count */}
          <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#121217]">
              <span>Advisors in Firm</span>
              <span className="text-violet-700 font-mono text-base">{advisors}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={advisors}
              onChange={(e) => setAdvisors(parseInt(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E847C]">
              <span>1</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#121217]">
              <span>Effective Hourly Rate</span>
              <span className="text-violet-700 font-mono text-base">${hourlyRate}/hr</span>
            </div>
            <input
              type="range"
              min="150"
              max="600"
              step="25"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseInt(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E847C]">
              <span>$150</span>
              <span>$350</span>
              <span>$600</span>
            </div>
          </div>

          {/* Meetings per week */}
          <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#121217]">
              <span>Meetings / Advisor / Wk</span>
              <span className="text-violet-700 font-mono text-base">{meetingsPerWeek}</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              value={meetingsPerWeek}
              onChange={(e) => setMeetingsPerWeek(parseInt(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E847C]">
              <span>3</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Output Metrics Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#121217] to-[#201F29] text-white space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="space-y-1 sm:px-4">
              <p className="text-xs text-zinc-400 font-medium">Hours Saved / Advisor / Wk</p>
              <p className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                {hoursSavedPerWeekPerAdvisor} <span className="text-sm font-normal text-zinc-400">hrs</span>
              </p>
              <p className="text-[10px] text-zinc-500">~{Math.round(hoursSavedPerWeekPerAdvisor * 60 / meetingsPerWeek)} min saved per meeting</p>
            </div>

            <div className="space-y-1 sm:px-4 pt-4 sm:pt-0">
              <p className="text-xs text-zinc-400 font-medium">Firm Hours Saved Annually</p>
              <p className="text-3xl sm:text-4xl font-heading font-extrabold text-rose-300">
                {totalAnnualHoursSaved.toLocaleString()} <span className="text-sm font-normal text-zinc-400">hrs</span>
              </p>
              <p className="text-[10px] text-zinc-500">Reinvested into client relationships</p>
            </div>

            <div className="space-y-1 sm:px-4 pt-4 sm:pt-0">
              <p className="text-xs text-zinc-400 font-medium">Estimated Annual Value</p>
              <p className="text-3xl sm:text-4xl font-heading font-extrabold text-emerald-400">
                ${Math.round(annualValueUnlocked / 1000)}k
              </p>
              <p className="text-[10px] text-emerald-300 font-bold">{roiMultiplier}× Projected ROI on Adviza</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Includes Meeting Briefings, Ambient Audio Scribe, and CCO Exam Export</span>
            </div>
            <Link
              href={`/auth/signup?plan=pro&seats=${advisors}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
            >
              <span>Unlock These Savings for Your Firm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
