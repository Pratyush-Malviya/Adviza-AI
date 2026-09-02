import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';
import { reconcilePortfolioDrift, STANDARD_MODELS } from './portfolio-engine.js';
import { CustodianHolding, AssetClassDrift, TaxHarvestOpportunity } from '../../types/portfolio.js';

const resend = new Resend(env.RESEND_API_KEY || process.env.RESEND_API_KEY);

export interface DriftAuditClient {
  clientId: string;
  clientName: string;
  custodian: string;
  totalValue: number;
  driftTriggered: boolean;
  maxDriftPct: number;
  recommendedOrdersCount: number;
  taxHarvestSavings: number;
  summary: string;
}

export interface DriftAuditReport {
  auditId: string;
  executedAt: string;
  totalClientsAudited: number;
  driftBreachesCount: number;
  taxHarvestOpportunitiesCount: number;
  totalPotentialTaxSavings: number;
  clientsWithDrift: DriftAuditClient[];
  emailDispatched: boolean;
  emailRecipient?: string;
  emailId?: string;
}

export function generateDriftAlertHtml(report: DriftAuditReport, advisorName: string = 'Wealth Advisor'): string {
  const dateStr = new Date(report.executedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const clientRows = report.clientsWithDrift
    .map(
      (c) => `
    <tr style="border-bottom: 1px solid #EADBCE;">
      <td style="padding: 12px 8px; font-weight: bold; color: #121217;">${c.clientName}</td>
      <td style="padding: 12px 8px; color: #645D56;">${c.custodian}</td>
      <td style="padding: 12px 8px; font-family: monospace; color: #121217;">$${c.totalValue.toLocaleString()}</td>
      <td style="padding: 12px 8px;">
        <span style="background: ${c.driftTriggered ? '#FFE4E6' : '#DCFCE7'}; color: ${c.driftTriggered ? '#E11D48' : '#16A34A'}; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
          ${c.maxDriftPct > 0 ? '+' : ''}${c.maxDriftPct.toFixed(1)}% Drift
        </span>
      </td>
      <td style="padding: 12px 8px; font-weight: bold; color: #2563EB;">${c.recommendedOrdersCount} orders</td>
      <td style="padding: 12px 8px; font-weight: bold; color: #059669;">+$${c.taxHarvestSavings.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #FAF5F0; margin: 0; padding: 24px; color: #121217; }
    .container { max-width: 680px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EADBCE; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
    .badge { display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; background: rgba(225, 29, 72, 0.1); color: #E11D48; border-radius: 20px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; color: #121217; }
    .subtitle { font-size: 13px; color: #7A726A; margin-bottom: 24px; }
    .metric-card { background: #FAF5F0; border: 1px solid #EADBCE; border-radius: 12px; padding: 14px; text-align: center; }
    .metric-val { font-size: 20px; font-weight: 800; color: #121217; }
    .metric-lbl { font-size: 11px; color: #7A726A; text-transform: uppercase; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
    th { text-align: left; padding: 10px 8px; background: #FAF5F0; color: #645D56; font-weight: 700; border-bottom: 2px solid #EADBCE; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #EADBCE; font-size: 11px; color: #8E847C; display: flex; justify-content: space-between; }
    .btn { display: inline-block; background: #E11D48; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 12px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">FIDUCIARY PORTFOLIO MONITOR</div>
    <h1>Automated Portfolio Drift & Rebalance Alert</h1>
    <div class="subtitle">Prepared for <strong>${advisorName}</strong> &bull; ${dateStr}</div>

    <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #9F1239;">
      <strong>⚠️ Action Required:</strong> The Adviza autonomous portfolio monitor identified <strong>${report.driftBreachesCount} client portfolio(s)</strong> exceeding target allocation tolerance bands (&plusmn;5.0%) and <strong>$${report.totalPotentialTaxSavings.toLocaleString()}</strong> in wash-sale compliant tax-loss harvesting opportunities.
    </div>

    <table style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td style="width: 33%; padding: 4px;">
          <div class="metric-card">
            <div class="metric-val">${report.totalClientsAudited}</div>
            <div class="metric-lbl">Clients Scanned</div>
          </div>
        </td>
        <td style="width: 33%; padding: 4px;">
          <div class="metric-card">
            <div class="metric-val" style="color: #E11D48;">${report.driftBreachesCount}</div>
            <div class="metric-lbl">Drift Breaches</div>
          </div>
        </td>
        <td style="width: 33%; padding: 4px;">
          <div class="metric-card">
            <div class="metric-val" style="color: #059669;">+$${report.totalPotentialTaxSavings.toLocaleString()}</div>
            <div class="metric-lbl">Tax Savings Found</div>
          </div>
        </td>
      </tr>
    </table>

    <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #121217; margin-bottom: 8px;">
      Client Drift Breakdown
    </h3>
    <table>
      <thead>
        <tr>
          <th>Client</th>
          <th>Custodian</th>
          <th>Portfolio Value</th>
          <th>Max Drift</th>
          <th>Trades</th>
          <th>Tax Offset</th>
        </tr>
      </thead>
      <tbody>
        ${clientRows}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://adviza-ai.vercel.app/dashboard/clients" class="btn">
        Open Advisor Dashboard & Approve Trades &rarr;
      </a>
    </div>

    <div class="footer">
      <div>Adviza AI &bull; Autonomous Fiduciary Operating System</div>
      <div>Audit ID: ${report.auditId}</div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function runPortfolioMonitorJob(options: {
  firmId: string;
  advisorEmail?: string;
  advisorName?: string;
  sendEmail?: boolean;
}): Promise<DriftAuditReport> {
  const { firmId, advisorEmail = 'advisor@adviza.ai', advisorName = 'Senior Advisor', sendEmail = false } = options;
  const auditId = 'drift_audit_' + Date.now();
  const supabase = getSupabaseAdmin();

  const sampleClients = [
    {
      id: 'cli_sarah_jenkins',
      name: 'Sarah Jenkins',
      custodian: 'Charles Schwab',
      holdings: [
        { ticker: 'VTI', description: 'Vanguard Total Stock Market', assetClass: 'US_EQUITY', shares: 1400, price: 265.4, marketValue: 371560, costBasis: 320000, unrealizedGainLoss: 51560 },
        { ticker: 'VXUS', description: 'Vanguard Total International Stock', assetClass: 'INTL_EQUITY', shares: 850, price: 62.1, marketValue: 52785, costBasis: 58000, unrealizedGainLoss: -5215 },
        { ticker: 'BND', description: 'Vanguard Total Bond Market', assetClass: 'FIXED_INCOME', shares: 500, price: 72.4, marketValue: 36200, costBasis: 39000, unrealizedGainLoss: -2800 },
        { ticker: 'VNQ', description: 'Vanguard Real Estate ETF', assetClass: 'REAL_ESTATE', shares: 250, price: 88.2, marketValue: 22050, costBasis: 21500, unrealizedGainLoss: 550 },
        { ticker: 'CASH', description: 'USD Liquidity Sweep', assetClass: 'CASH_EQUIVALENTS', shares: 17405, price: 1.0, marketValue: 17405, costBasis: 17405, unrealizedGainLoss: 0 },
      ] as CustodianHolding[],
      modelId: 'MODERATE_GROWTH',
    },
    {
      id: 'cli_arthur_dent',
      name: 'Arthur Dent',
      custodian: 'Fidelity Investments',
      holdings: [
        { ticker: 'SPY', description: 'SPDR S&P 500 ETF Trust', assetClass: 'US_EQUITY', shares: 1200, price: 512.3, marketValue: 614760, costBasis: 580000, unrealizedGainLoss: 34760 },
        { ticker: 'AGG', description: 'iShares Core US Aggregate Bond', assetClass: 'FIXED_INCOME', shares: 3800, price: 97.5, marketValue: 370500, costBasis: 390000, unrealizedGainLoss: -19500 },
        { ticker: 'CASH', description: 'Fidelity Cash Reserves', assetClass: 'CASH_EQUIVALENTS', shares: 14740, price: 1.0, marketValue: 14740, costBasis: 14740, unrealizedGainLoss: 0 },
      ] as CustodianHolding[],
      modelId: 'CONSERVATIVE_INCOME',
    },
  ];

  const auditedClients: DriftAuditClient[] = [];
  let totalPotentialTaxSavings = 0;
  let driftBreachesCount = 0;
  let taxHarvestOpportunitiesCount = 0;

  for (const client of sampleClients) {
    const model = STANDARD_MODELS[client.modelId] || STANDARD_MODELS.MODERATE_GROWTH;
    const result = reconcilePortfolioDrift(client.holdings, model);

    const maxDrift = Math.max(...result.allocations.map((d: AssetClassDrift) => Math.abs(d.driftPct)));
    const clientTaxSavings = result.taxHarvestOpportunities.reduce((acc: number, t: TaxHarvestOpportunity) => acc + (t.taxSavingsEstimate || 0), 0);

    totalPotentialTaxSavings += clientTaxSavings;
    if (result.requiresRebalance) driftBreachesCount++;
    if (result.taxHarvestOpportunities.length > 0) taxHarvestOpportunitiesCount += result.taxHarvestOpportunities.length;

    auditedClients.push({
      clientId: client.id,
      clientName: client.name,
      custodian: client.custodian,
      totalValue: result.totalMarketValue,
      driftTriggered: result.requiresRebalance,
      maxDriftPct: maxDrift,
      recommendedOrdersCount: result.recommendedOrders.length,
      taxHarvestSavings: clientTaxSavings,
      summary: `${result.recommendedOrders.length} rebalance orders generated. Max drift ${maxDrift.toFixed(1)}%.`,
    });
  }

  const report: DriftAuditReport = {
    auditId,
    executedAt: new Date().toISOString(),
    totalClientsAudited: sampleClients.length,
    driftBreachesCount,
    taxHarvestOpportunitiesCount,
    totalPotentialTaxSavings,
    clientsWithDrift: auditedClients,
    emailDispatched: false,
  };

  // 2. Dispatch Resend Email if requested
  if (sendEmail && advisorEmail) {
    try {
      const emailHtml = generateDriftAlertHtml(report, advisorName);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Adviza AI <onboarding@resend.dev>';

      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: advisorEmail,
        subject: `⚠️ [Adviza Drift Alert] ${driftBreachesCount} Client Portfolios Require Rebalancing`,
        html: emailHtml,
      });

      report.emailDispatched = true;
      report.emailRecipient = advisorEmail;
      report.emailId = emailResult.data?.id;
    } catch (emailErr: any) {
      console.error('[portfolio-monitor] Email dispatch error:', emailErr.message);
    }
  }

  // 3. Persist audit log in Supabase
  try {
    await supabase.from('audit_logs').insert(
      scopeFirm(
        {
          action: 'portfolio_drift_audit',
          actor: 'adviza_scheduled_monitor',
          resource: 'portfolio_engine',
          payload: report,
          timestamp: new Date().toISOString(),
        },
        firmId
      )
    );
  } catch (dbErr: any) {
    console.warn('[portfolio-monitor] Audit log persist warning:', dbErr.message);
  }

  return report;
}
