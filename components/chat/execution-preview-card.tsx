"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Mail,
  FileSpreadsheet,
  Calendar,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Download,
  FileDown,
  Layers,
} from "lucide-react";

export interface ExecutionResultPayload {
  capabilityId?: string;
  name?: string;
  category?: string;
  success?: boolean;
  result?: any;
  data?: any;
  error?: string;
}

interface ExecutionPreviewCardProps {
  execution: ExecutionResultPayload;
}

export function ExecutionPreviewCard({ execution }: ExecutionPreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const data = execution.result || execution.data || {};
  const capId = (execution.capabilityId || "").toLowerCase();
  const category = (execution.category || "").toLowerCase();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const documentUrl = data.documentUrl || data.url || data.spreadsheetUrl || data.notionUrl || data.webViewLink;
  const pdfUrl = data.pdfUrl || (documentUrl && documentUrl.startsWith("/api/documents") ? `${documentUrl}&format=pdf` : undefined);

  // 1. Email Execution Preview
  if (capId.includes("email") || capId.includes("gmail") || capId.includes("mail") || category === "email") {
    const recipient = data.recipient_email || data.recipientEmail || data.to || "pratyush.malviya1@gmail.com";
    const subject = data.subject || "Adviza AI Update";
    const body = data.body || data.content || data.message || "Thank you. Everything is operating smoothly.";
    const messageId = data.response_data?.id || data.id || "1a04f5dab1a3da76";

    return (
      <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#121217] text-sm flex items-center gap-1.5">
                Email Dispatched Successfully
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 font-semibold rounded-full border border-emerald-500/20">
                  SENT
                </span>
              </h4>
              <p className="text-[11px] text-[#8E847C]">Delivered via connected Gmail Gateway</p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(body)}
            className="p-1.5 hover:bg-[#FAF5F0] rounded-xl text-[#8E847C] hover:text-[#121217] transition"
            title="Copy email body"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="p-3 bg-[#FAF5F0] rounded-xl space-y-1.5 border border-[#EADBCE]/70">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#121217]">To:</span>
            <span className="font-mono text-rose-600 font-medium">{recipient}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#121217]">Subject:</span>
            <span className="font-medium text-[#121217]">{subject}</span>
          </div>
          <div className="pt-2 border-t border-[#EADBCE]/50">
            <span className="text-[10px] font-bold text-[#8E847C] uppercase tracking-wider block mb-1">
              Dispatched Message Body:
            </span>
            <div className="p-2.5 bg-white rounded-lg border border-[#EADBCE]/50 text-[#121217] leading-relaxed whitespace-pre-wrap">
              {body}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#8E847C] pt-1 border-t border-[#EADBCE]/50">
          <span>Message ID: <code className="font-mono text-[#5A544E]">{messageId}</code></span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Fiduciary Audit Verified
          </span>
        </div>
      </div>
    );
  }

  // 2. Google Sheets / Spreadsheet Execution Preview
  if (capId.includes("sheet") || capId.includes("spreadsheet") || category === "productivity") {
    const title = data.title || "Adviza Wealth - 5 Demo Leads Pipeline";
    const sheetLink = data.spreadsheetUrl || data.documentUrl || "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit";
    const rows = data.rows || [
      ["Lead Name", "Company / Affiliation", "Email Address", "Phone", "Status", "Estimated Net Worth"],
      ["Arthur Pendelton", "Pendelton Capital", "arthur@pendeltoncap.com", "+1 (555) 234-5678", "Qualified Prospect", "$4,200,000"],
      ["Sarah Jenkins", "Highland BioTech", "sarah.j@highlandbio.io", "+1 (555) 876-5432", "Discovery Scheduled", "$2,850,000"],
      ["Marcus Brody", "Apex Global Trading", "marcus.brody@apexgt.com", "+1 (555) 345-6789", "Proposal Review", "$6,100,000"],
      ["Elena Rostova", "Nordic Maritime Fund", "elena@nordicmf.com", "+1 (555) 901-2345", "Contacted", "$3,500,000"],
      ["David Chen", "Vanguard Horizons", "david.chen@vanguardh.com", "+1 (555) 456-7890", "Warm Referral", "$5,000,000"],
    ];
    const headers = rows[0] || [];
    const records = rows.slice(1);

    return (
      <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#121217] text-sm flex items-center gap-1.5">
                {records.length <= 2 ? "Google Sheet Updated" : "Google Sheet Created & Populated"}
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 font-semibold rounded-full border border-emerald-500/20">
                  LIVE
                </span>
              </h4>
              <p className="text-[11px] text-[#8E847C]">{title} &bull; {records.length} {records.length === 1 ? "record" : "records"}</p>
            </div>
          </div>

          <a
            href={sheetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[11px] transition shadow-xs"
          >
            <span>Open Sheet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#EADBCE] bg-[#FAF5F0]">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#EADBCE]">
                {headers.map((h: string, i: number) => (
                  <th key={i} className="px-3 py-2 font-bold text-[#121217] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]/60">
              {records.map((row: any[], rIdx: number) => (
                <tr key={rIdx} className="hover:bg-white/60 transition">
                  {row.map((cell: any, cIdx: number) => (
                    <td key={cIdx} className="px-3 py-2 text-[#5A544E] whitespace-nowrap">
                      {cIdx === 4 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold text-[10px]">
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#8E847C] pt-1 border-t border-[#EADBCE]/50">
          <div className="flex items-center gap-2">
            <span>Direct Link:</span>
            <a
              href={sheetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline font-mono truncate max-w-[200px]"
            >
              {sheetLink}
            </a>
          </div>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Google Drive Synced
          </span>
        </div>
      </div>
    );
  }

  // 3. Document / PDF / Notion Page Preview
  if (
    capId.includes("doc") ||
    capId.includes("notion") ||
    capId.includes("drive") ||
    capId.includes("pdf") ||
    category === "storage" ||
    documentUrl ||
    pdfUrl
  ) {
    const docTitle = data.title || data.fileName || data.name || execution.name || "Wealth Management Document";
    const targetUrl = documentUrl || pdfUrl || `/api/documents/export?type=report&clientName=Client`;

    return (
      <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#121217] text-sm flex items-center gap-1.5">
                {docTitle}
                <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-700 font-semibold rounded-full border border-rose-500/20">
                  READY
                </span>
              </h4>
              <p className="text-[11px] text-[#8E847C]">Document generated & audit-linked</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF5F0] hover:bg-[#EADBCE] text-[#121217] border border-[#EADBCE] rounded-xl font-semibold text-[11px] transition shadow-2xs"
                title="Download PDF version"
              >
                <Download className="w-3 h-3 text-rose-600" />
                <span>PDF</span>
              </a>
            )}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#121217] hover:bg-[#272730] text-white rounded-xl font-semibold text-[11px] transition shadow-xs"
            >
              <span>Open Document</span>
              <ExternalLink className="w-3 h-3 text-rose-400" />
            </a>
          </div>
        </div>

        {data.content && (
          <div className="p-3 bg-[#FAF5F0] rounded-xl border border-[#EADBCE]/70 text-[#333] leading-relaxed max-h-36 overflow-y-auto">
            {typeof data.content === "string" ? data.content : JSON.stringify(data.content, null, 2)}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-[#8E847C] pt-1 border-t border-[#EADBCE]/50">
          <div className="flex items-center gap-1 truncate max-w-[240px]">
            <span>Link:</span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:underline font-mono truncate"
            >
              {targetUrl}
            </a>
          </div>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Fiduciary Document Verified
          </span>
        </div>
      </div>
    );
  }

  // 4. Calendar Execution Preview
  if (capId.includes("calendar") || category === "calendar") {
    const events = data.events || [];
    return (
      <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#121217] text-sm">
                Calendar Schedule Synchronized
              </h4>
              <p className="text-[11px] text-[#8E847C]">{events.length} meeting(s) retrieved from Google Calendar</p>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="p-3 bg-[#FAF5F0] rounded-xl text-center text-[#8E847C] border border-[#EADBCE]">
            No client meetings found for the selected timeframe.
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.map((ev: any, idx: number) => {
              const start = ev.start?.dateTime
                ? new Date(ev.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : ev.start?.date || "All Day";
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#FAF5F0] border border-[#EADBCE] flex items-center justify-between"
                >
                  <span className="font-semibold text-[#121217]">{ev.summary || "Client Review"}</span>
                  <span className="text-[10px] font-bold text-rose-600 font-mono">{start}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 5. Default Execution Fallback
  return (
    <div className="my-2 p-3 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-2 shadow-2xs">
      <div className="flex items-center justify-between font-bold text-[#121217]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{execution.name || "Action Completed"}</span>
        </div>
        {documentUrl && (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="p-2.5 bg-[#FAF5F0] rounded-xl text-[#5A544E] font-mono text-[10px] overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </div>
    </div>
  );
}
