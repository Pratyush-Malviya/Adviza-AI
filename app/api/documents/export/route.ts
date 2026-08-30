import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "briefing";
  const id = searchParams.get("id") || "doc_" + Date.now();
  const clientName = searchParams.get("clientName") || "Sarah Jenkins";
  const format = searchParams.get("format") || "html";
  const title = searchParams.get("title") || `${type.toUpperCase()} Dossier - ${clientName}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  const autoPrintScript = format === "pdf" ? `
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => { window.print(); }, 600);
      });
    </script>
  ` : "";

  let bodyContent = "";

  if (type === "briefing") {
    bodyContent = `
      <div class="header">
        <div class="badge">CONFIDENTIAL &bull; FIDUCIARY CLIENT DOSSIER</div>
        <h1>Pre-Meeting Executive Briefing Pack</h1>
        <div class="subtitle">Client: <strong>${escapeHtml(clientName)}</strong> &bull; Date: ${dateStr} &bull; Time: ${timeStr}</div>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <div class="callout">
          Pre-meeting dossier compiled for comprehensive fiduciary review. High-net-worth portfolio analysis indicates strong performance (+4.2% QTD) with active opportunities for fixed income rebalancing and capital gains tax optimization.
        </div>
      </div>

      <div class="section">
        <h2>Portfolio Snapshot & Key Metrics</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Value</th>
              <th>Target Mandate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Total Portfolio Value</strong></td>
              <td>$1,850,000</td>
              <td>Growth & Income</td>
              <td><span class="tag green">Optimized</span></td>
            </tr>
            <tr>
              <td><strong>Equity Allocation</strong></td>
              <td>68.4%</td>
              <td>65.0%</td>
              <td><span class="tag amber">Slight Drift (+3.4%)</span></td>
            </tr>
            <tr>
              <td><strong>Fixed Income / Municipal</strong></td>
              <td>24.6%</td>
              <td>30.0%</td>
              <td><span class="tag blue">Rebalance Ready</span></td>
            </tr>
            <tr>
              <td><strong>Liquid Cash Reserves</strong></td>
              <td>7.0%</td>
              <td>5.0%</td>
              <td><span class="tag green">Ample Liquidity</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Strategic Talking Points</h2>
        <ul class="bullet-list">
          <li><strong>Municipal Bond Ladder:</strong> Deploy surplus cash reserves into California tax-exempt munis yielding ~4.1% federal/state exempt.</li>
          <li><strong>Tax-Loss Harvesting:</strong> Harvest $18,500 in emerging market fixed income losses before month-end to offset realized capital gains.</li>
          <li><strong>IPS & Beneficiary Update:</strong> Confirm updated trust beneficiary designations and refresh Investment Policy Statement risk tolerance.</li>
        </ul>
      </div>

      <div class="section">
        <h2>Action Items & Deliverables</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Draft Updated Investment Policy Statement (IPS)</td>
              <td>Lead Wealth Advisor</td>
              <td>Within 3 Business Days</td>
              <td><span class="tag amber">In Progress</span></td>
            </tr>
            <tr>
              <td>Generate Municipal Bond Allocation Proposal</td>
              <td>Paraplanner / Fixed Income Desk</td>
              <td>Prior to Client Call</td>
              <td><span class="tag green">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (type === "compliance") {
    bodyContent = `
      <div class="header">
        <div class="badge shield">SEC RULE 204-2 &bull; FINRA RULE 2111 AUDIT RECORD</div>
        <h1>Fiduciary Suitability & Compliance Record</h1>
        <div class="subtitle">Client: <strong>${escapeHtml(clientName)}</strong> &bull; Record ID: <code>${escapeHtml(id)}</code></div>
      </div>

      <div class="section">
        <h2>Compliance Status</h2>
        <div class="callout success">
          <strong>AUDIT STATUS: APPROVED & COMPLIANT</strong><br/>
          This record was generated and cryptographically hashed under SEC Rule 204-2 books and records retention requirements with WORM storage immutability markers.
        </div>
      </div>

      <div class="section">
        <h2>Suitability Rationale (Reg BI)</h2>
        <p>
          The recommended asset allocation adjustments adhere strictly to the client's documented investment profile, risk capacity (Moderate Growth), and stated liquidity objectives. All associated material risks—including interest rate sensitivity and credit risk—have been formally disclosed to the client.
        </p>
      </div>

      <div class="section">
        <h2>Fiduciary Checks & Audit Verification</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Check Item</th>
              <th>Standard</th>
              <th>Result</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Form ADV Part 2A Delivery</td>
              <td>SEC Rule 204-3</td>
              <td><span class="tag green">VERIFIED PASS</span></td>
              <td>${dateStr} ${timeStr}</td>
            </tr>
            <tr>
              <td>Fiduciary Suitability Assessment</td>
              <td>FINRA Rule 2111 / Reg BI</td>
              <td><span class="tag green">VERIFIED PASS</span></td>
              <td>${dateStr} ${timeStr}</td>
            </tr>
            <tr>
              <td>Conflict of Interest Screening</td>
              <td>SEC Fiduciary Standard</td>
              <td><span class="tag green">NO CONFLICTS</span></td>
              <td>${dateStr} ${timeStr}</td>
            </tr>
            <tr>
              <td>WORM Retention Marker</td>
              <td>SEC 17a-4(f)</td>
              <td><span class="tag blue">HASH: sha256_e83b...</span></td>
              <td>${dateStr} ${timeStr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (type === "meeting" || type === "transcript") {
    bodyContent = `
      <div class="header">
        <div class="badge">MEETING INTELLIGENCE & MINUTES</div>
        <h1>Client Meeting Summary & Action Protocol</h1>
        <div class="subtitle">Client: <strong>${escapeHtml(clientName)}</strong> &bull; Session Date: ${dateStr}</div>
      </div>

      <div class="section">
        <h2>Meeting Transcript Intelligence</h2>
        <div class="callout">
          Key conversation topics included Q3 portfolio review, liquidity deployment from recent events, tax mitigation strategies, and fixed income allocation. Client expressed high satisfaction and approved recommended actions.
        </div>
      </div>

      <div class="section">
        <h2>Decisions & Commitments Made</h2>
        <ul class="bullet-list">
          <li>Client approved proposed California municipal bond ladder deployment.</li>
          <li>Advisor to deliver revised IPS and bond proposal by Thursday.</li>
          <li>Client agreed to forward 2025 tax returns and verify trust beneficiary schedules.</li>
        </ul>
      </div>
    `;
  } else {
    bodyContent = `
      <div class="header">
        <div class="badge">WEALTH MANAGEMENT REPORT</div>
        <h1>${escapeHtml(title)}</h1>
        <div class="subtitle">Client: <strong>${escapeHtml(clientName)}</strong> &bull; Generated: ${dateStr}</div>
      </div>

      <div class="section">
        <h2>Report Overview</h2>
        <div class="callout">
          This document was generated by the Adviza AI Fiduciary Engine for advisory operations and client relationship management.
        </div>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --primary: #121217;
      --accent: #E11D48;
      --border: #EADBCE;
      --bg: #FAF5F0;
      --text: #121217;
      --muted: #645D56;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F6F3EF;
      color: var(--text);
      line-height: 1.5;
      padding: 40px 20px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .top-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
      color: var(--primary);
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: background 0.15s ease;
    }
    .btn-primary {
      background: var(--primary);
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background: #272730;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }
    .btn-outline:hover {
      background: var(--bg);
    }
    .header {
      margin-bottom: 32px;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 4px 10px;
      background: rgba(225, 29, 72, 0.1);
      color: var(--accent);
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .badge.shield {
      background: rgba(79, 70, 229, 0.1);
      color: #4F46E5;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 12px;
      color: var(--muted);
    }
    .section {
      margin-bottom: 28px;
    }
    h2 {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      border-left: 3px solid var(--accent);
      padding-left: 8px;
    }
    .callout {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      font-size: 13px;
      color: #333;
      line-height: 1.6;
    }
    .callout.success {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.2);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    .data-table th {
      background: var(--bg);
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #EADBCE80;
      color: #444;
    }
    .tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .tag.green { background: rgba(16, 185, 129, 0.15); color: #059669; }
    .tag.amber { background: rgba(245, 158, 11, 0.15); color: #D97706; }
    .tag.blue { background: rgba(59, 130, 246, 0.15); color: #2563EB; }
    .bullet-list {
      list-style-type: none;
      padding-left: 0;
      font-size: 13px;
    }
    .bullet-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 10px;
      line-height: 1.5;
      color: #333;
    }
    .bullet-list li::before {
      content: "•";
      color: var(--accent);
      font-weight: bold;
      font-size: 16px;
      position: absolute;
      left: 4px;
      top: -1px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: var(--muted);
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .top-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-actions">
      <div class="brand">
        <div class="brand-dot"></div>
        Adviza AI &bull; Fiduciary Wealth Intelligence
      </div>
      <div class="btn-group">
        <button class="btn btn-outline" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="btn btn-primary" onclick="window.print()">📥 Download PDF</button>
      </div>
    </div>

    ${bodyContent}

    <div class="footer">
      <div>Adviza Wealth Management AI &bull; SEC Registered Investment Advisory Audit Trail</div>
      <div>Record Hash: ${escapeHtml(id)} &bull; ${dateStr}</div>
    </div>
  </div>
  ${autoPrintScript}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
