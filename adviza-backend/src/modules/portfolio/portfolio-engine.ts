import {
  AssetClass,
  CustodianHolding,
  CustodianType,
  PortfolioReconciliationResult,
  TargetModelPortfolio,
  AssetClassDrift,
  RebalanceOrder,
  TaxHarvestOpportunity,
} from '../../types/portfolio.js';

export const STANDARD_MODELS: Record<string, TargetModelPortfolio> = {
  MODERATE_GROWTH: {
    id: 'MODERATE_GROWTH',
    name: 'Adviza 60/40 Moderate Growth Fiduciary Model',
    riskProfile: 'MODERATE',
    allocations: [
      { assetClass: 'US_EQUITY', targetPct: 40, toleranceBandPct: 5 },
      { assetClass: 'INTL_EQUITY', targetPct: 15, toleranceBandPct: 4 },
      { assetClass: 'EMERGING_MARKETS', targetPct: 5, toleranceBandPct: 3 },
      { assetClass: 'FIXED_INCOME', targetPct: 30, toleranceBandPct: 5 },
      { assetClass: 'REAL_ESTATE', targetPct: 5, toleranceBandPct: 2 },
      { assetClass: 'CASH_EQUIVALENTS', targetPct: 5, toleranceBandPct: 2 },
    ],
  },
  AGGRESSIVE_CAPITAL_APPRECIATION: {
    id: 'AGGRESSIVE_CAPITAL_APPRECIATION',
    name: 'Adviza 80/20 Aggressive Growth Fiduciary Model',
    riskProfile: 'AGGRESSIVE',
    allocations: [
      { assetClass: 'US_EQUITY', targetPct: 55, toleranceBandPct: 5 },
      { assetClass: 'INTL_EQUITY', targetPct: 20, toleranceBandPct: 4 },
      { assetClass: 'EMERGING_MARKETS', targetPct: 10, toleranceBandPct: 3 },
      { assetClass: 'FIXED_INCOME', targetPct: 10, toleranceBandPct: 3 },
      { assetClass: 'CASH_EQUIVALENTS', targetPct: 5, toleranceBandPct: 2 },
    ],
  },
  CONSERVATIVE_INCOME: {
    id: 'CONSERVATIVE_INCOME',
    name: 'Adviza Capital Preservation & Income Model',
    riskProfile: 'CONSERVATIVE',
    allocations: [
      { assetClass: 'US_EQUITY', targetPct: 20, toleranceBandPct: 4 },
      { assetClass: 'FIXED_INCOME', targetPct: 55, toleranceBandPct: 5 },
      { assetClass: 'MUNICIPAL_BONDS', targetPct: 15, toleranceBandPct: 4 },
      { assetClass: 'CASH_EQUIVALENTS', targetPct: 10, toleranceBandPct: 3 },
    ],
  },
};

const TICKER_ASSET_CLASS_MAP: Record<string, AssetClass> = {
  SPY: 'US_EQUITY',
  VOO: 'US_EQUITY',
  VTI: 'US_EQUITY',
  QQQ: 'US_EQUITY',
  AAPL: 'US_EQUITY',
  MSFT: 'US_EQUITY',
  NVDA: 'US_EQUITY',
  AMZN: 'US_EQUITY',
  GOOGL: 'US_EQUITY',
  META: 'US_EQUITY',
  VEA: 'INTL_EQUITY',
  VXUS: 'INTL_EQUITY',
  EFA: 'INTL_EQUITY',
  VWO: 'EMERGING_MARKETS',
  EEM: 'EMERGING_MARKETS',
  BND: 'FIXED_INCOME',
  AGG: 'FIXED_INCOME',
  TLT: 'FIXED_INCOME',
  IEF: 'FIXED_INCOME',
  MUB: 'MUNICIPAL_BONDS',
  VNQ: 'REAL_ESTATE',
  GLD: 'COMMODITIES',
  BIL: 'CASH_EQUIVALENTS',
  SGOV: 'CASH_EQUIVALENTS',
  USD: 'CASH_EQUIVALENTS',
};

export function inferAssetClass(ticker: string, description: string = ''): AssetClass {
  const cleanTicker = ticker.toUpperCase().trim();
  if (TICKER_ASSET_CLASS_MAP[cleanTicker]) {
    return TICKER_ASSET_CLASS_MAP[cleanTicker];
  }

  const desc = description.toLowerCase();
  if (desc.includes('treasury') || desc.includes('bond') || desc.includes('fixed income') || desc.includes('aggregate')) {
    return 'FIXED_INCOME';
  }
  if (desc.includes('muni') || desc.includes('municipal')) {
    return 'MUNICIPAL_BONDS';
  }
  if (desc.includes('international') || desc.includes('developed') || desc.includes('europe') || desc.includes('asia')) {
    return 'INTL_EQUITY';
  }
  if (desc.includes('emerging')) {
    return 'EMERGING_MARKETS';
  }
  if (desc.includes('reit') || desc.includes('real estate')) {
    return 'REAL_ESTATE';
  }
  if (desc.includes('commodity') || desc.includes('gold') || desc.includes('silver') || desc.includes('oil')) {
    return 'COMMODITIES';
  }
  if (desc.includes('cash') || desc.includes('money market') || desc.includes('sweep') || desc.includes('fdic')) {
    return 'CASH_EQUIVALENTS';
  }

  return 'US_EQUITY';
}

/**
 * Parses raw CSV lines from Charles Schwab, Fidelity, Pershing, or Generic format.
 */
export function parseCustodianCSV(csvContent: string, custodian: CustodianType = 'generic'): CustodianHolding[] {
  const lines = csvContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) return [];

  const holdings: CustodianHolding[] = [];
  const headerIndex = lines.findIndex(
    (l) =>
      l.toLowerCase().includes('symbol') ||
      l.toLowerCase().includes('ticker') ||
      l.toLowerCase().includes('security') ||
      l.toLowerCase().includes('description')
  );

  const startLine = headerIndex >= 0 ? headerIndex + 1 : 0;
  const headers = headerIndex >= 0 ? lines[headerIndex].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, '')) : [];

  for (let i = startLine; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map((c) => c.trim().replace(/["']/g, ''));
    if (rawCols.length < 2) continue;

    let ticker = '';
    let description = '';
    let shares = 0;
    let price = 0;
    let marketValue = 0;
    let costBasis = 0;

    if (headers.length > 0) {
      const getVal = (candidates: string[]): string => {
        for (const c of candidates) {
          const idx = headers.findIndex((h) => h.includes(c));
          if (idx >= 0 && idx < rawCols.length) return rawCols[idx];
        }
        return '';
      };

      ticker = getVal(['symbol', 'ticker', 'sec id', 'item']) || rawCols[0] || 'CASH';
      description = getVal(['description', 'name', 'security name']) || ticker;
      shares = parseFloat(getVal(['quantity', 'shares', 'qty', 'units']).replace(/[^0-9.-]/g, '')) || 0;
      price = parseFloat(getVal(['price', 'last price', 'market price']).replace(/[^0-9.-]/g, '')) || 0;
      marketValue = parseFloat(getVal(['market value', 'current value', 'value', 'total']).replace(/[^0-9.-]/g, '')) || 0;
      costBasis = parseFloat(getVal(['cost basis', 'total cost', 'basis', 'cost']).replace(/[^0-9.-]/g, '')) || 0;
    } else {
      ticker = rawCols[0] || 'CASH';
      description = rawCols[1] || ticker;
      shares = parseFloat(rawCols[2]?.replace(/[^0-9.-]/g, '') || '0') || 0;
      price = parseFloat(rawCols[3]?.replace(/[^0-9.-]/g, '') || '0') || 0;
      marketValue = parseFloat(rawCols[4]?.replace(/[^0-9.-]/g, '') || '0') || 0;
      costBasis = parseFloat(rawCols[5]?.replace(/[^0-9.-]/g, '') || '0') || marketValue;
    }

    if (marketValue === 0 && shares > 0 && price > 0) {
      marketValue = shares * price;
    }
    if (costBasis === 0 && marketValue > 0) {
      costBasis = marketValue;
    }

    if (ticker && (marketValue > 0 || shares > 0)) {
      holdings.push({
        ticker: ticker.toUpperCase(),
        description,
        assetClass: inferAssetClass(ticker, description),
        shares,
        price,
        marketValue,
        costBasis,
        unrealizedGainLoss: marketValue - costBasis,
      });
    }
  }

  return holdings;
}

/**
 * Reconciles custodian holdings against target model portfolio and detects drift.
 */
export function reconcilePortfolioDrift(
  holdings: CustodianHolding[],
  modelPortfolio: TargetModelPortfolio = STANDARD_MODELS.MODERATE_GROWTH,
  custodian: CustodianType = 'generic'
): PortfolioReconciliationResult {
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalUnrealizedGainLoss = totalMarketValue - totalCostBasis;

  // Group market value by asset class
  const classTotals = new Map<AssetClass, number>();
  for (const h of holdings) {
    const prev = classTotals.get(h.assetClass) || 0;
    classTotals.set(h.assetClass, prev + h.marketValue);
  }

  let requiresRebalance = false;
  const allocations: AssetClassDrift[] = [];
  const recommendedOrders: RebalanceOrder[] = [];

  for (const alloc of modelPortfolio.allocations) {
    const currentVal = classTotals.get(alloc.assetClass) || 0;
    const currentWeightPct = totalMarketValue > 0 ? (currentVal / totalMarketValue) * 100 : 0;
    const driftPct = currentWeightPct - alloc.targetPct;
    const absDrift = Math.abs(driftPct);

    let status: 'IN_BAND' | 'OVERWEIGHT' | 'UNDERWEIGHT' = 'IN_BAND';
    if (absDrift > alloc.toleranceBandPct) {
      requiresRebalance = true;
      status = driftPct > 0 ? 'OVERWEIGHT' : 'UNDERWEIGHT';
    }

    allocations.push({
      assetClass: alloc.assetClass,
      currentValue: Math.round(currentVal * 100) / 100,
      currentWeightPct: Math.round(currentWeightPct * 100) / 100,
      targetWeightPct: alloc.targetPct,
      driftPct: Math.round(driftPct * 100) / 100,
      toleranceBandPct: alloc.toleranceBandPct,
      status,
    });

    // Generate rebalance recommendations if outside tolerance band
    if (status !== 'IN_BAND') {
      const targetDollar = (alloc.targetPct / 100) * totalMarketValue;
      const deltaDollar = targetDollar - currentVal;
      const action = deltaDollar > 0 ? 'BUY' : 'SELL';
      const absDelta = Math.abs(deltaDollar);

      // Pick representative ticker for asset class from holdings or core ETF
      const candidateHolding = holdings.find((h) => h.assetClass === alloc.assetClass && h.price > 0);
      const ticker = candidateHolding ? candidateHolding.ticker : alloc.assetClass === 'US_EQUITY' ? 'VOO' : alloc.assetClass === 'FIXED_INCOME' ? 'BND' : 'VEA';
      const refPrice = candidateHolding && candidateHolding.price > 0 ? candidateHolding.price : 100;
      const estimatedShares = Math.round((absDelta / refPrice) * 10) / 10;

      recommendedOrders.push({
        ticker,
        assetClass: alloc.assetClass,
        action,
        estimatedAmount: Math.round(absDelta),
        estimatedShares,
        reason: `Rebalance ${alloc.assetClass}: currently ${Math.round(currentWeightPct)}% (Target: ${alloc.targetPct}%, Drift: ${Math.round(driftPct)}%)`,
      });
    }
  }

  // Identify Tax-Loss Harvesting opportunities (unrealized loss > $500)
  const taxHarvestOpportunities: TaxHarvestOpportunity[] = [];
  const REPLACEMENT_PAIRS: Record<string, string> = {
    SPY: 'VOO',
    VOO: 'VTI',
    VTI: 'SCHB',
    QQQ: 'QQQM',
    VEA: 'IXUS',
    VXUS: 'IXUS',
    BND: 'AGG',
    AGG: 'BND',
    EEM: 'VWO',
    VWO: 'IEMG',
  };

  for (const h of holdings) {
    if (h.unrealizedGainLoss < -500 && h.shares > 0) {
      const replacement = REPLACEMENT_PAIRS[h.ticker] || 'Equivalent Low-Cost Index ETF';
      // Estimated 25% blended capital gains tax savings
      const taxSavingsEstimate = Math.abs(h.unrealizedGainLoss) * 0.25;

      taxHarvestOpportunities.push({
        ticker: h.ticker,
        unrealizedLoss: Math.round(h.unrealizedGainLoss),
        shares: h.shares,
        replacementSuggestion: replacement,
        taxSavingsEstimate: Math.round(taxSavingsEstimate),
      });
    }
  }

  const fiduciaryNotes: string[] = [
    `Fiduciary analysis evaluated ${holdings.length} positions totaling $${totalMarketValue.toLocaleString()} against model "${modelPortfolio.name}".`,
    requiresRebalance
      ? `🚨 Portfolio exceeds tolerance bands in ${allocations.filter((a) => a.status !== 'IN_BAND').length} asset classes. Rebalancing recommended.`
      : `✅ Portfolio allocations are within fiduciary tolerance bands (+/- ${modelPortfolio.allocations[0]?.toleranceBandPct || 5}%).`,
  ];

  if (taxHarvestOpportunities.length > 0) {
    const totalHarvestTax = taxHarvestOpportunities.reduce((sum, t) => sum + t.taxSavingsEstimate, 0);
    fiduciaryNotes.push(`💡 Identified $${totalHarvestTax.toLocaleString()} in estimated tax alpha via tax-loss harvesting across ${taxHarvestOpportunities.length} positions.`);
  }

  return {
    custodian,
    totalMarketValue: Math.round(totalMarketValue * 100) / 100,
    totalCostBasis: Math.round(totalCostBasis * 100) / 100,
    totalUnrealizedGainLoss: Math.round(totalUnrealizedGainLoss * 100) / 100,
    modelPortfolio,
    requiresRebalance,
    allocations,
    recommendedOrders,
    taxHarvestOpportunities,
    fiduciaryNotes,
  };
}
