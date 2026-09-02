-- ============================================================
-- Adviza AI - Realistic RIA Seed Data
-- Migration: 009_seed_sample_data.sql
-- ============================================================

DO $$
DECLARE
  v_firm_id UUID;
  v_advisor_id UUID;
  v_client_1 UUID := 'c1111111-1111-1111-1111-111111111111';
  v_client_2 UUID := 'c2222222-2222-2222-2222-222222222222';
  v_client_3 UUID := 'c3333333-3333-3333-3333-333333333333';
  v_portfolio_1 UUID := 'p1111111-1111-1111-1111-111111111111';
  v_portfolio_2 UUID := 'p2222222-2222-2222-2222-222222222222';
  v_portfolio_3 UUID := 'p3333333-3333-3333-3333-333333333333';
BEGIN
  -- 1. Ensure at least one Firm exists
  SELECT id INTO v_firm_id FROM firms LIMIT 1;
  IF v_firm_id IS NULL THEN
    INSERT INTO firms (id, name, slug, plan)
    VALUES ('f0000000-0000-0000-0000-000000000001', 'Apex Capital Advisory', 'apex-capital', 'enterprise')
    RETURNING id INTO v_firm_id;
  END IF;

  -- 2. Pick or create Advisor Profile
  SELECT id INTO v_advisor_id FROM profiles WHERE firm_id = v_firm_id LIMIT 1;

  -- 3. Seed 3 High-Net-Worth Clients
  INSERT INTO clients (id, firm_id, advisor_id, full_name, email, phone, portfolio_value, risk_tolerance, investment_goals, age, occupation, notes, tags)
  VALUES
    (
      v_client_1,
      v_firm_id,
      COALESCE(v_advisor_id, '00000000-0000-0000-0000-000000000000'),
      'Sarah Jenkins',
      'sarah.jenkins@familyoffice.com',
      '+1 (415) 882-9012',
      3450000.00,
      'moderate',
      ARRAY['Retirement Wealth Preservation', 'Tax-Advantaged Trust Transition', 'Philanthropic Foundation'],
      54,
      'Tech Founder & Board Director',
      'Prefers quarterly Zoom reviews. Focusing on liquidity transition for Series C secondary shares.',
      ARRAY['HNW', 'Founder', 'Trust', 'Schwab']
    ),
    (
      v_client_2,
      v_firm_id,
      COALESCE(v_advisor_id, '00000000-0000-0000-0000-000000000000'),
      'Robert Sterling',
      'rsterling@sterlingholdings.org',
      '+1 (212) 555-0198',
      8720000.00,
      'conservative',
      ARRAY['Municipal Bond Yield', 'Capital Preservation', 'Dynasty Trust Generation-Skipping'],
      68,
      'Retired Real Estate Executive',
      'Holds extensive commercial real estate holdings. Needs tax-loss harvesting and bond ladder rebalancing.',
      ARRAY['Ultra-HNW', 'Fixed Income', 'Fidelity', 'Dynasty Trust']
    ),
    (
      v_client_3,
      v_firm_id,
      COALESCE(v_advisor_id, '00000000-0000-0000-0000-000000000000'),
      'Elena Rostova',
      'elena@bioventurecapital.com',
      '+1 (650) 441-2093',
      5180000.00,
      'aggressive',
      ARRAY['Growth Equities', 'Private Equity Secondary', 'ESG & Clean Energy'],
      46,
      'Biotech Venture Capital Partner',
      'Interested in structured alternative assets and AI semiconductor sector allocation.',
      ARRAY['HNW', 'VC', 'Growth', 'ESG']
    )
  ON CONFLICT (id) DO UPDATE SET
    portfolio_value = EXCLUDED.portfolio_value,
    notes = EXCLUDED.notes;

  -- 4. Seed Portfolios with Real Allocations and Drift
  INSERT INTO portfolios (id, firm_id, client_id, name, total_value, custodian, account_number, asset_allocation, target_allocation, drift_percentage, tax_loss_harvest_opp)
  VALUES
    (
      v_portfolio_1,
      v_firm_id,
      v_client_1,
      'Jenkins Family Trust (Schwab)',
      3450000.00,
      'Schwab Institutional',
      'SCHW-8821-994',
      '{"equities": 68, "fixed_income": 22, "cash": 10, "alternatives": 0}',
      '{"equities": 60, "fixed_income": 30, "cash": 10, "alternatives": 0}',
      8.00,
      12400.00
    ),
    (
      v_portfolio_2,
      v_firm_id,
      v_client_2,
      'Sterling Dynasty Core (Fidelity)',
      8720000.00,
      'Fidelity Wealth',
      'FID-9012-331',
      '{"equities": 40, "fixed_income": 50, "cash": 10, "alternatives": 0}',
      '{"equities": 35, "fixed_income": 55, "cash": 10, "alternatives": 0}',
      5.00,
      38500.00
    ),
    (
      v_portfolio_3,
      v_firm_id,
      v_client_3,
      'Rostova Global Growth (Pershing)',
      5180000.00,
      'BNY Mellon Pershing',
      'PRSH-4412-108',
      '{"equities": 85, "fixed_income": 5, "cash": 5, "alternatives": 5}',
      '{"equities": 80, "fixed_income": 10, "cash": 5, "alternatives": 5}',
      5.00,
      8900.00
    )
  ON CONFLICT (id) DO UPDATE SET
    total_value = EXCLUDED.total_value,
    drift_percentage = EXCLUDED.drift_percentage;

  -- 5. Seed Core Holdings
  INSERT INTO holdings (portfolio_id, symbol, name, asset_class, quantity, current_price, total_value, cost_basis, unrealized_gain_loss, gain_loss_percentage, target_weight, actual_weight, drift)
  VALUES
    (v_portfolio_1, 'VTI', 'Vanguard Total Stock Market ETF', 'equity', 4800, 275.50, 1322400.00, 1100000.00, 222400.00, 20.21, 35.0, 38.3, 3.3),
    (v_portfolio_1, 'VXUS', 'Vanguard Total International Stock ETF', 'equity', 12000, 64.20, 770400.00, 810000.00, -39600.00, -4.88, 25.0, 22.3, -2.7),
    (v_portfolio_1, 'BND', 'Vanguard Total Bond Market ETF', 'fixed_income', 10500, 72.30, 759150.00, 780000.00, -20850.00, -2.67, 30.0, 22.0, -8.0),
    (v_portfolio_1, 'BIL', 'SPDR 1-3 Month T-Bill ETF', 'cash', 6500, 91.50, 594750.00, 594000.00, 750.00, 0.12, 10.0, 17.2, 7.2),
    (v_portfolio_2, 'MUB', 'iShares National Muni Bond ETF', 'fixed_income', 38000, 107.50, 4085000.00, 4200000.00, -115000.00, -2.73, 50.0, 46.8, -3.2),
    (v_portfolio_2, 'VOO', 'Vanguard S&P 500 ETF', 'equity', 6500, 520.40, 3382600.00, 2800000.00, 582600.00, 20.81, 35.0, 38.8, 3.8)
  ON CONFLICT DO NOTHING;

  -- 6. Seed Scheduled Upcoming Review Meetings
  INSERT INTO meetings (firm_id, client_id, advisor_id, title, meeting_type, meeting_date, scheduled_at, duration_minutes, status, notes)
  VALUES
    (
      v_firm_id,
      v_client_1,
      COALESCE(v_advisor_id, '00000000-0000-0000-0000-000000000000'),
      'Q3 Strategic Wealth Review - Sarah Jenkins',
      'review',
      NOW() + INTERVAL '1 day 4 hours',
      NOW() + INTERVAL '1 day 4 hours',
      60,
      'scheduled',
      'Agenda: Rebalance 8% equity drift back into BND bond ladder, harvest $12.4k tax losses, and review trust beneficiaries.'
    ),
    (
      v_firm_id,
      v_client_2,
      COALESCE(v_advisor_id, '00000000-0000-0000-0000-000000000000'),
      'Annual Fiduciary Suitability & Muni Yield Review - Robert Sterling',
      'review',
      NOW() + INTERVAL '3 days 2 hours',
      NOW() + INTERVAL '3 days 2 hours',
      45,
      'scheduled',
      'Agenda: Review municipal bond yield spread and execute $38.5k tax-loss swap before quarter close.'
    )
  ON CONFLICT DO NOTHING;

END $$;
