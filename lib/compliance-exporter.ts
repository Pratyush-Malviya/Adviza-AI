/**
 * lib/compliance-exporter.ts
 * SEC / FINRA Fiduciary Compliance & WORM Audit Trail Exporter.
 * Generates audit-ready CSV logs and formatted compliance memos
 * meeting SEC Rule 204-2 and FINRA Rule 4511 recordkeeping standards.
 */

export interface ComplianceAuditEntry {
  recordId: string;
  timestamp: string;
  clientName: string;
  advisorName: string;
  actionType: string;
  complianceStatus: "compliant" | "needs-review" | "flagged" | "pending";
  suitabilityScore: number; // 0 - 100
  fiduciaryFlags: string[];
  disclosuresVerified: boolean;
  wormHash: string;
}

/**
 * Format audit records into RFC 4180 compliant CSV string.
 */
export function exportComplianceRecordsToCSV(records: ComplianceAuditEntry[]): string {
  const headers = [
    "Record ID",
    "Timestamp (UTC)",
    "Client Name",
    "Advisor Name",
    "Action / Meeting Type",
    "Compliance Status",
    "Suitability Score (%)",
    "Fiduciary Risk Flags",
    "Disclosures Verified",
    "WORM SHA-256 Hash",
  ];

  const rows = records.map((r) => [
    `"${r.recordId}"`,
    `"${r.timestamp}"`,
    `"${r.clientName.replace(/"/g, '""')}"`,
    `"${r.advisorName.replace(/"/g, '""')}"`,
    `"${r.actionType.replace(/"/g, '""')}"`,
    `"${r.complianceStatus.toUpperCase()}"`,
    r.suitabilityScore,
    `"${(r.fiduciaryFlags || []).join("; ").replace(/"/g, '""')}"`,
    r.disclosuresVerified ? "YES" : "NO",
    `"${r.wormHash}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}

/**
 * Trigger client-side file download for CSV audit trail.
 */
export function downloadComplianceCSV(records: ComplianceAuditEntry[], filename = "adviza_fiduciary_audit_trail.csv"): void {
  if (typeof window === "undefined") return;

  const csvContent = exportComplianceRecordsToCSV(records);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a printable SEC / FINRA Fiduciary Audit Memo (HTML format).
 */
export function generatePrintableComplianceMemo(record: ComplianceAuditEntry): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SEC/FINRA Compliance Audit Record - ${record.recordId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #121217; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          .header { border-bottom: 2px solid #EADBCE; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #121217; }
          .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .badge-compliant { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
          .badge-flagged { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .card { background: #FAF5F0; padding: 16px; border-radius: 12px; border: 1px solid #EADBCE; }
          .label { font-size: 11px; font-weight: 700; color: #8E847C; text-transform: uppercase; margin-bottom: 4px; }
          .value { font-size: 15px; font-weight: 600; color: #121217; }
          .score { font-size: 32px; font-weight: 800; color: #2E7D32; }
          .hash { font-family: monospace; font-size: 11px; color: #5A544E; word-break: break-all; background: #fff; padding: 8px; border-radius: 6px; border: 1px solid #EADBCE; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #EADBCE; font-size: 11px; color: #8E847C; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Fiduciary Compliance Audit Memo</div>
            <div style="font-size: 13px; color: #8E847C; margin-top: 4px;">Adviza OS Immutable Record &bull; Rule 204-2 / FINRA 4511</div>
          </div>
          <div class="badge ${record.complianceStatus === 'compliant' ? 'badge-compliant' : 'badge-flagged'}">
            ${record.complianceStatus}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="label">Client Dossier</div>
            <div class="value">${record.clientName}</div>
          </div>
          <div class="card">
            <div class="label">Managing Advisor</div>
            <div class="value">${record.advisorName}</div>
          </div>
          <div class="card">
            <div class="label">Action / Engagement</div>
            <div class="value">${record.actionType}</div>
          </div>
          <div class="card">
            <div class="label">Suitability Score</div>
            <div class="score">${record.suitabilityScore}%</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div class="label">Fiduciary & Form ADV Disclosures</div>
          <div class="value">${record.disclosuresVerified ? "✓ Verified & Form ADV Part 2A Disclosed" : "⚠ Pending Advisor Attestation"}</div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div class="label">WORM Immutable Audit Hash (SHA-256)</div>
          <div class="hash">${record.wormHash}</div>
        </div>

        <div class="footer">
          Generated automatically by Adviza Fiduciary AI Operating System. This document constitutes an official compliance audit trail record.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}
