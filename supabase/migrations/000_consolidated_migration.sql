-- ============================================================
-- Adviza AI - Consolidated Enterprise Production Schema
-- Migration: 000_consolidated_migration.sql
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to safely get the current user's firm_id in RLS
CREATE OR REPLACE FUNCTION get_my_firm_id()
RETURNS UUID AS $$
  SELECT firm_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 3. CORE MULTI-TENANT TABLES
-- ============================================================

-- FIRMS (Multi-tenant root container)
CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  meetings_used INTEGER NOT NULL DEFAULT 0,
  meetings_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'advisor' CHECK (role IN ('owner', 'advisor', 'ops', 'compliance')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  portfolio_value NUMERIC(15,2) DEFAULT 0.00,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  investment_goals TEXT[] NOT NULL DEFAULT '{}',
  age INTEGER,
  occupation TEXT,
  crm_id TEXT,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PORTFOLIOS
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Primary Investment Portfolio',
  total_value NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  custodian TEXT NOT NULL DEFAULT 'Schwab',
  account_number TEXT,
  asset_allocation JSONB NOT NULL DEFAULT '{"equities": 60, "fixed_income": 30, "cash": 10, "alternatives": 0}',
  target_allocation JSONB NOT NULL DEFAULT '{"equities": 60, "fixed_income": 30, "cash": 10, "alternatives": 0}',
  drift_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  tax_loss_harvest_opp NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HOLDINGS (Asset positions)
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL CHECK (asset_class IN ('equity', 'fixed_income', 'cash', 'alternative', 'crypto')),
  quantity NUMERIC(12,4) NOT NULL DEFAULT 0,
  current_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  cost_basis NUMERIC(15,2) NOT NULL DEFAULT 0,
  unrealized_gain_loss NUMERIC(15,2) NOT NULL DEFAULT 0,
  gain_loss_percentage NUMERIC(8,4) NOT NULL DEFAULT 0,
  target_weight NUMERIC(5,2) NOT NULL DEFAULT 0,
  actual_weight NUMERIC(5,2) NOT NULL DEFAULT 0,
  drift NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  advisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'review',
  meeting_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER DEFAULT 45,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  transcript_url TEXT,
  transcript_text TEXT,
  notes TEXT,
  briefing JSONB,
  intelligence JSONB,
  compliance_record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTION ITEMS (Tasks & Commitments)
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'advisor' CHECK (owner IN ('advisor', 'client', 'operations')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL DEFAULT 'follow-up',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. WORKFLOWS & EXECUTION HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  trigger_type TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  connected_apps TEXT[] NOT NULL DEFAULT '{}',
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  ai_prompt TEXT,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  logs JSONB NOT NULL DEFAULT '[]',
  node_outputs JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. CHAT SESSIONS & HISTORICAL THREADS
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Wealth Advisory Session',
  model_id TEXT NOT NULL DEFAULT 'claude-3-5-sonnet',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  executed_results JSONB DEFAULT '[]',
  missing_connectors JSONB DEFAULT '[]',
  hitl_prompts JSONB DEFAULT '[]',
  is_deep_research BOOLEAN NOT NULL DEFAULT FALSE,
  is_web_search BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. INTEGRATION CONNECTIONS & WORM AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS firm_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONNECTED'
    CHECK (status IN ('CONNECTED', 'INITIATED', 'EXPIRED', 'FAILED', 'DISCONNECTED')),
  account_email TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  scopes TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_firm_user_app UNIQUE (user_id, app_slug)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'COMPLIANCE',
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  sha256_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  snippet TEXT,
  recommendation TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. CLIENT AMBIENT MEMORY (PGVECTOR)
-- ============================================================

CREATE TABLE IF NOT EXISTS client_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT 'preference'
    CHECK (memory_type IN ('preference', 'life_event', 'financial_goal', 'risk_note', 'fact')),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}',
  source_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. INDEXES FOR HIGH QUERY THROUGHPUT
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_firm_id ON profiles(firm_id);
CREATE INDEX IF NOT EXISTS idx_clients_firm_id ON clients(firm_id);
CREATE INDEX IF NOT EXISTS idx_clients_advisor_id ON clients(advisor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_firm_id ON meetings(firm_id);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_advisor_id ON meetings(advisor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_client_id ON portfolios(client_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_workflows_firm_id ON workflows(firm_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_firm_connections_user_id ON firm_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_firm_id ON audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_client_memories_client_id ON client_memories(client_id);

-- ============================================================
-- 9. TRIGGERS
-- ============================================================

CREATE OR REPLACE TRIGGER tr_firms_updated_at BEFORE UPDATE ON firms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_holdings_updated_at BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tr_firm_connections_updated_at BEFORE UPDATE ON firm_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Automated new user onboarding trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_firm_id UUID;
  firm_name TEXT;
  firm_slug TEXT;
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  firm_name := user_full_name || '''s Advisory Firm';
  firm_slug := lower(regexp_replace(user_full_name, '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(md5(random()::text), 1, 6);

  INSERT INTO public.firms (name, slug, plan)
  VALUES (firm_name, firm_slug, 'free')
  RETURNING id INTO new_firm_id;

  INSERT INTO public.profiles (id, firm_id, email, full_name, role)
  VALUES (NEW.id, new_firm_id, NEW.email, user_full_name, 'owner');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger on Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_memories ENABLE ROW LEVEL SECURITY;

-- Enable permissive development / authenticated access policies
DO $$
BEGIN
  -- Action items
  DROP POLICY IF EXISTS "action_items_all" ON action_items;
  CREATE POLICY "action_items_all" ON action_items FOR ALL USING (firm_id = get_my_firm_id());

  -- Profiles
  DROP POLICY IF EXISTS "profiles_select_own_firm" ON profiles;
  CREATE POLICY "profiles_select_own_firm" ON profiles FOR SELECT USING (id = auth.uid() OR firm_id = get_my_firm_id());
  DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
  CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE USING (id = auth.uid());

  -- Firms
  DROP POLICY IF EXISTS "firms_select" ON firms;
  CREATE POLICY "firms_select" ON firms FOR SELECT USING (id = get_my_firm_id());

  -- Clients
  DROP POLICY IF EXISTS "clients_all" ON clients;
  CREATE POLICY "clients_all" ON clients FOR ALL USING (firm_id = get_my_firm_id() OR auth.uid() = advisor_id);

  -- Portfolios
  DROP POLICY IF EXISTS "portfolios_all" ON portfolios;
  CREATE POLICY "portfolios_all" ON portfolios FOR ALL USING (firm_id = get_my_firm_id());

  -- Holdings
  DROP POLICY IF EXISTS "holdings_all" ON holdings;
  CREATE POLICY "holdings_all" ON holdings FOR ALL USING (
    EXISTS (SELECT 1 FROM portfolios p WHERE p.id = holdings.portfolio_id AND p.firm_id = get_my_firm_id())
  );

  -- Meetings
  DROP POLICY IF EXISTS "meetings_all" ON meetings;
  CREATE POLICY "meetings_all" ON meetings FOR ALL USING (
    firm_id = get_my_firm_id() OR user_id = auth.uid() OR advisor_id = auth.uid()
  );

  -- Workflows
  DROP POLICY IF EXISTS "workflows_all" ON workflows;
  CREATE POLICY "workflows_all" ON workflows FOR ALL USING (firm_id = get_my_firm_id() OR creator_id = auth.uid());

  -- Workflow Runs
  DROP POLICY IF EXISTS "workflow_runs_all" ON workflow_runs;
  CREATE POLICY "workflow_runs_all" ON workflow_runs FOR ALL USING (firm_id = get_my_firm_id() OR triggered_by = auth.uid());

  -- Chat Sessions & Messages
  DROP POLICY IF EXISTS "chat_sessions_all" ON chat_sessions;
  CREATE POLICY "chat_sessions_all" ON chat_sessions FOR ALL USING (user_id = auth.uid());
  DROP POLICY IF EXISTS "chat_messages_all" ON chat_messages;
  CREATE POLICY "chat_messages_all" ON chat_messages FOR ALL USING (user_id = auth.uid());

  -- Firm Connections
  DROP POLICY IF EXISTS "firm_connections_all" ON firm_connections;
  CREATE POLICY "firm_connections_all" ON firm_connections FOR ALL USING (user_id = auth.uid() OR firm_id = get_my_firm_id());

  -- Audit & Compliance
  DROP POLICY IF EXISTS "audit_logs_all" ON audit_logs;
  CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (firm_id = get_my_firm_id() OR user_id = auth.uid());
  DROP POLICY IF EXISTS "compliance_logs_all" ON compliance_logs;
  CREATE POLICY "compliance_logs_all" ON compliance_logs FOR ALL USING (firm_id = get_my_firm_id());

  -- Client Memories
  DROP POLICY IF EXISTS "client_memories_all" ON client_memories;
  CREATE POLICY "client_memories_all" ON client_memories FOR ALL USING (firm_id = get_my_firm_id());
EXCEPTION WHEN OTHERS THEN
  -- Fallback if auth context is not yet established during bootstrap
  NULL;
END $$;
