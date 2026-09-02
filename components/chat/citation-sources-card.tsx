"use client";

import React, { useState } from "react";
import { Globe, ExternalLink, ChevronDown, ChevronUp, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import type { SearchCitation } from "@/lib/search-service";

interface CitationSourcesCardProps {
  citations: SearchCitation[];
  isDeepResearch?: boolean;
}

export function CitationSourcesCard({ citations, isDeepResearch }: CitationSourcesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-[#EADBCE] shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header Bar Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#FAF5F0]/80 hover:bg-[#FAF5F0] transition text-left group"
      >
        <div className="flex items-center gap-2">
          {isDeepResearch ? (
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Sparkles className="w-3 h-3" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
              <Globe className="w-3 h-3" />
            </div>
          )}
          <span className="text-xs font-bold text-[#121217]">
            {isDeepResearch ? "Deep Research Sources & Citations" : "Live Web Sources"}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#EADBCE] text-[#5A544E]">
            {citations.length} Verified
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8E847C] group-hover:text-[#121217]">
          <span className="text-[11px] font-medium">{isExpanded ? "Hide" : "View"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Citations Preview Strip (When Collapsed) */}
      {!isExpanded && (
        <div className="px-3.5 py-2 flex flex-wrap gap-1.5 border-t border-[#EADBCE]/50 bg-white">
          {citations.slice(0, 3).map((cit, idx) => (
            <a
              key={cit.id || idx}
              href={cit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF5F0] hover:bg-[#F2ECE4] border border-[#EADBCE] text-[11px] text-[#5A544E] hover:text-[#121217] transition"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#EADBCE] text-[9px] font-bold flex items-center justify-center text-[#121217]">
                {idx + 1}
              </span>
              <span className="font-medium truncate max-w-[140px]">{cit.domain}</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#8E847C]" />
            </a>
          ))}
          {citations.length > 3 && (
            <span className="text-[10px] text-[#8E847C] self-center">
              +{citations.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Full Citations List (When Expanded) */}
      {isExpanded && (
        <div className="p-3.5 space-y-2.5 border-t border-[#EADBCE] bg-white divide-y divide-[#FAF5F0]">
          {citations.map((cit, idx) => (
            <div key={cit.id || idx} className="pt-2.5 first:pt-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={cit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-1.5 font-bold text-xs text-rose-600 hover:text-rose-700 hover:underline"
                >
                  <span className="w-4 h-4 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold flex items-center justify-center text-rose-700 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-1">{cit.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#8E847C] group-hover/link:text-rose-600 shrink-0" />
                </a>
                <span className="text-[10px] font-mono text-[#8E847C] shrink-0 bg-[#FAF5F0] px-1.5 py-0.5 rounded-md">
                  {cit.domain}
                </span>
              </div>
              <p className="text-xs text-[#5A544E] leading-relaxed line-clamp-2 pl-5">
                {cit.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
