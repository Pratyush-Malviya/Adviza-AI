"use client";

import React, { useState } from "react";
import { Download, FileText, ShieldCheck, Printer, Check } from "lucide-react";
import {
  downloadComplianceCSV,
  generatePrintableComplianceMemo,
  type ComplianceAuditEntry,
} from "@/lib/compliance-exporter";

interface ComplianceAuditActionsProps {
  recordsCount: number;
}

export function ComplianceAuditActions({ recordsCount }: ComplianceAuditActionsProps) {
  const [downloaded, setDownloaded] = useState(false);

  const sampleAuditRecords: ComplianceAuditEntry[] = [
    {
      recordId: "CMP-2026-0901-01",
      timestamp: new Date().toISOString(),
      clientName: "Sarah Jenkins",
      advisorName: "Alex Vance, CFP",
      actionType: "Annual Comprehensive Wealth & Tax Review",
      complianceStatus: "compliant",
      suitabilityScore: 98,
      fiduciaryFlags: ["Fiduciary Duty Form ADV Part 2A Disclosed", "Wash-Sale Risk Assessed (<30 days)", "Suitability Rule 2111 Approved"],
      disclosuresVerified: true,
      wormHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      recordId: "CMP-2026-0828-04",
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      clientName: "David Miller",
      advisorName: "Alex Vance, CFP",
      actionType: "Tax-Loss Harvesting Execution",
      complianceStatus: "compliant",
      suitabilityScore: 95,
      fiduciaryFlags: ["Form ADV Disclosures Verified", "Substitute ETF Variance <0.02%"],
      disclosuresVerified: true,
      wormHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    },
  ];

  const handleDownloadCSV = () => {
    downloadComplianceCSV(sampleAuditRecords, `adviza_compliance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handlePrintMemo = () => {
    generatePrintableComplianceMemo(sampleAuditRecords[0]);
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <button
        type="button"
        onClick={handleDownloadCSV}
        className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] text-xs font-bold text-[#121217] transition shadow-2xs flex items-center gap-2"
      >
        {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5 text-rose-600" />}
        <span>{downloaded ? "CSV Exported!" : "Export Audit Trail (CSV)"}</span>
      </button>

      <button
        type="button"
        onClick={handlePrintMemo}
        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print WORM Compliance Memo</span>
      </button>
    </div>
  );
}
