export type CustodianType = 'schwab' | 'fidelity' | 'pershing' | 'generic';

export type AssetClass =
  | 'US_EQUITY'
  | 'INTL_EQUITY'
  | 'EMERGING_MARKETS'
  | 'FIXED_INCOME'
  | 'MUNICIPAL_BONDS'
  | 'REAL_ESTATE'
  | 'COMMODITIES'
  | 'CASH_EQUIVALENTS';

export interface CustodianHolding {
  accountNumber?: string;
  ticker: string;
  description: string;
  assetClass: AssetClass;
  shares: number;
  price: number;
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
}

export interface ModelAllocation {
  assetClass: AssetClass;
  targetPct: number; // e.g., 40 for 40%
  toleranceBandPct: number; // e.g., 5 for +/- 5%
}

export interface TargetModelPortfolio {
  id: string;
  name: string;
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'ALL_WEATHER' | 'CUSTOM';
  allocations: ModelAllocation[];
}

export interface AssetClassDrift {
  assetClass: AssetClass;
  currentValue: number;
  currentWeightPct: number;
  targetWeightPct: number;
  driftPct: number;
  toleranceBandPct: number;
  status: 'IN_BAND' | 'OVERWEIGHT' | 'UNDERWEIGHT';
}

export interface RebalanceOrder {
  ticker: string;
  assetClass: AssetClass;
  action: 'BUY' | 'SELL' | 'HOLD';
  estimatedAmount: number;
  estimatedShares: number;
  reason: string;
}

export interface TaxHarvestOpportunity {
  ticker: string;
  unrealizedLoss: number;
  shares: number;
  replacementSuggestion: string;
  taxSavingsEstimate: number;
}

export interface PortfolioReconciliationResult {
  custodian: CustodianType;
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealizedGainLoss: number;
  modelPortfolio: TargetModelPortfolio;
  requiresRebalance: boolean;
  allocations: AssetClassDrift[];
  recommendedOrders: RebalanceOrder[];
  taxHarvestOpportunities: TaxHarvestOpportunity[];
  fiduciaryNotes: string[];
}
