"use client";

import React from "react";
import { FileText, Shield, TrendingUp, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface BriefingCardProps {
  data: any;
  type: "briefing" | "compliance" | "generic";
}

export function BriefingCard({ data, type }: BriefingCardProps) {
  if (type === "briefing" && data?.executiveSummary) {
    return (
      <div className="my-2 p-4 bg-background/90 border border-border rounded-xl space-y-3 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground text-sm">Meeting Briefing Dossier</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-medium rounded-full">
            Ready
          </span>
        </div>

        <p className="text-muted-foreground leading-relaxed italic">
          &ldquo;{data.executiveSummary}&rdquo;
        </p>

        {data.portfolioHighlights?.length > 0 && (
          <div>
            <span className="font-semibold text-[11px] text-foreground mb-1.5 block">Portfolio Metrics</span>
            <div className="grid grid-cols-2 gap-1.5">
              {data.portfolioHighlights.map((item: any, idx: number) => (
                <div key={idx} className="p-2 bg-muted/40 rounded-lg border border-border/40">
                  <div className="text-[10px] text-muted-foreground">{item.metric}</div>
                  <div className="font-semibold text-foreground text-xs">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.keyTalkingPoints?.length > 0 && (
          <div>
            <span className="font-semibold text-[11px] text-foreground mb-1 block">Key Talking Points</span>
            <ul className="space-y-1">
              {data.keyTalkingPoints.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (type === "compliance" && data?.recordId) {
    return (
      <div className="my-2 p-4 bg-background/90 border border-border rounded-xl space-y-3 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground text-sm">SEC/FINRA Compliance Record</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-medium rounded-full">
            {data.complianceStatus?.toUpperCase() || "COMPLIANT"}
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">Record ID:</span> {data.recordId}
        </div>

        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {data.auditNarrative}
        </p>

        {data.suitabilityAssessment && (
          <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40">
            <span className="font-semibold text-[11px] text-foreground block mb-1">Suitability Rationale</span>
            <p className="text-muted-foreground text-[11px]">{data.suitabilityAssessment.rationale}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
