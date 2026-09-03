"use client";

import React from "react";
import Link from "next/link";
import { Building2, Landmark, ShieldAlert, ArrowRight, Check } from "lucide-react";

interface SolutionItem {
  tag: string;
  title: string;
  description: string;
  benefits: string[];
  icon: any;
  href: string;
}

const SOLUTIONS: SolutionItem[] = [
  {
    tag: "INDEPENDENT RIAS",
    title: "Scale client capacity without junior overhead",
    description: "Empower lead advisors to handle 150+ high-touch client relationships effortlessly with automated meeting briefings, ambient CRM syncing, and drift alerts.",
    benefits: [
      "4.2 hours recovered daily per advisor",
      "Instant 2-way sync to Salesforce FSC & Wealthbox",
      "Fast 15-minute onboarding with zero complex coding",
    ],
    icon: Building2,
    href: "/platform#rias",
  },
  {
    tag: "MULTI-FAMILY OFFICES",
    title: "Complex multi-entity and generational governance",
    description: "Manage multiple family trusts, estate planning structures, and generational wealth milestones with deep context-aware LLM intelligence.",
    benefits: [
      "Multi-custodian consolidated balance tracking",
      "Generational estate milestone & tax-loss monitoring",
      "Private tenant isolation and zero-data retention",
    ],
    icon: Landmark,
    href: "/platform#family-offices",
  },
  {
    tag: "ENTERPRISE BROKER-DEALERS",
    title: "Centralized compliance and CCO audit defense",
    description: "Give Chief Compliance Officers real-time visibility across all branch communications, recommendations, and portfolio rebalances with immutable WORM records.",
    benefits: [
      "100% automated SEC Rule 204-2 books and records",
      "Instant 1-click exam packet export for regulatory auditors",
      "Role-based access control and branch permissioning",
    ],
    icon: ShieldAlert,
    href: "/security",
  },
];

export function SpecSolutions() {
  return (
    <section id="solutions" className="py-28 px-6 bg-[#F8F9FC] border-t border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-xs font-semibold">
            <span>Tailored Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#111827] tracking-tight">
            Built for modern fiduciary practices
          </h2>
          <p className="text-base sm:text-lg text-[#6B7280]">
            Whether you are an ambitious RIA or an enterprise institution, Adviza scales with your practice.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SOLUTIONS.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <div
                key={idx}
                className="rounded-[24px] bg-white border border-[#E5E7EB] p-8 shadow-spec-card spec-card-interaction flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#4F6EF7]/10 flex items-center justify-center text-[#4F6EF7]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold tracking-wider text-[#6B7280] bg-slate-100 px-2.5 py-1 rounded-full">
                      {sol.tag}
                    </span>
                  </div>

                  {/* Heading & Copy */}
                  <div>
                    <h3 className="text-xl font-heading font-bold text-[#111827] leading-snug mb-3">
                      {sol.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {sol.description}
                    </p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2.5 pt-4 border-t border-[#E5E7EB] text-xs text-[#374151]">
                    {sol.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div className="pt-8">
                  <Link
                    href={sol.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F6EF7] hover:text-[#3B54D4] transition"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
