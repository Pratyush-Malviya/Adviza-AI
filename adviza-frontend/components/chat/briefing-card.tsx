"use client";

import React from "react";
import { FileText, Shield, Download, ExternalLink, ChevronRight, CheckCircle2 } from "lucide-react";

interface BriefingCardProps {
  data: any;
  type: "briefing" | "compliance" | "generic";
}

export function BriefingCard({ data, type }: BriefingCardProps) {
  const clientName = data?.clientName || "Sarah Jenkins";
  const docUrl = data?.documentUrl || `/api/documents/export?type=${type}&clientName=${encodeURIComponent(clientName)}`;
  const pdfUrl = data?.pdfUrl || `/api/documents/export?type=${type}&format=pdf&clientName=${encodeURIComponent(clientName)}`;

  if (type === "briefing" && data?.executiveSummary) {
    return (
      <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl space-y-3 shadow-2xs text-xs">
        <div className="flex items-center justify-between border-b border-[#EADBCE]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#121217] text-sm block">Meeting Briefing Dossier</span>
              <span className="text-[10px] text-[#8E847C]">Client: {clientName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF5F0] hover:bg-[#EADBCE] text-[#121217] border border-[#EADBCE] rounded-xl font-semibold text-[10px] transition"
              title="Download Briefing PDF"
            >
              <Download className="w-3 h-3 text-rose-600" />
              <span>PDF</span>
            </a>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121217] hover:bg-[#272730] text-white rounded-xl font-semibold text-[10px] transition"
            >
              <span>View Dossier</span>
              <ExternalLink className="w-3 h-3 text-rose-400" />
            </a>
          </div>
        </div>

        <p className="text-[#5A544E] leading-relaxed italic bg-[#FAF5F0] p-3 rounded-xl border border-[#EADBCE]/50">
          &ldquo;{data.executiveSummary}&rdquo;
        </p>

        {data.portfolioHighlights?.length > 0 && (
          <div>
            <span className="font-bold text-[11px] text-[#121217] mb-1.5 block">Portfolio Metrics</span>
            <div className="grid grid-cols-2 gap-1.5">
              {data.portfolioHighlights.map((item: any, idx: number) => (
                <div key={idx} className="p-2 bg-[#FAF5F0] rounded-xl border border-[#EADBCE]/50">
                  <div className="text-[10px] text-[#8E847C]">{item.metric}</div>
                  <div className="font-bold text-[#121217] text-xs">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.keyTalkingPoints?.length > 0 && (
          <div>
            <span className="font-bold text-[11px] text-[#121217] mb-1 block">Key Talking Points</span>
            <ul className="space-y-1">
              {data.keyTalkingPoints.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 text-[#5A544E] text-[11px]">
                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-[#8E847C] pt-2 border-t border-[#EADBCE]/50">
          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-mono truncate max-w-[240px]">
            {docUrl}
          </a>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Fiduciary Record Linked
          </span>
        </div>
      </div>
    );
  }

  if (type === "compliance" && data?.recordId) {
    return (
      <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl space-y-3 shadow-2xs text-xs">
        <div className="flex items-center justify-between border-b border-[#EADBCE]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#121217] text-sm block">SEC/FINRA Compliance Record</span>
              <span className="text-[10px] text-[#8E847C]">ID: {data.recordId}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF5F0] hover:bg-[#EADBCE] text-[#121217] border border-[#EADBCE] rounded-xl font-semibold text-[10px] transition"
              title="Download Compliance PDF"
            >
              <Download className="w-3 h-3 text-indigo-600" />
              <span>PDF</span>
            </a>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121217] hover:bg-[#272730] text-white rounded-xl font-semibold text-[10px] transition"
            >
              <span>Audit View</span>
              <ExternalLink className="w-3 h-3 text-indigo-400" />
            </a>
          </div>
        </div>

        <p className="text-[#5A544E] text-[11px] leading-relaxed bg-[#FAF5F0] p-3 rounded-xl border border-[#EADBCE]/50">
          {data.auditNarrative}
        </p>

        {data.suitabilityAssessment && (
          <div className="p-2.5 bg-[#FAF5F0] rounded-xl border border-[#EADBCE]/50">
            <span className="font-bold text-[11px] text-[#121217] block mb-1">Suitability Rationale</span>
            <p className="text-[#5A544E] text-[11px]">{data.suitabilityAssessment.rationale}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-[#8E847C] pt-2 border-t border-[#EADBCE]/50">
          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-mono truncate max-w-[240px]">
            {docUrl}
          </a>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
            <CheckCircle2 className="w-3 h-3" /> SEC 204-2 Immutability Stamp
          </span>
        </div>
      </div>
    );
  }

  return null;
}
