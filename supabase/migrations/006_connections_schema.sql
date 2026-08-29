-- ============================================================
-- Adviza AI - Firm Connections Schema
-- Migration: 006_connections_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS firm_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  app_name TEXT NOT NULL,
  app_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONNECTED'
    CHECK (status IN ('CONNECTED', 'INITIATED', 'FAILED', 'EXPIRED', 'DISCONNECTED')),
  account_email TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (firm_id, app_slug)
);

CREATE TRIGGER firm_connections_updated_at BEFORE UPDATE ON firm_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_firm_connections_firm_id ON firm_connections(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_connections_app_slug ON firm_connections(app_slug);

ALTER TABLE firm_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firm_connections: firm members can read"
  ON firm_connections FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "firm_connections: firm members can insert"
  ON firm_connections FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "firm_connections: firm members can update"
  ON firm_connections FOR UPDATE
  USING (firm_id = get_my_firm_id());

CREATE POLICY "firm_connections: firm members can delete"
  ON firm_connections FOR DELETE
  USING (firm_id = get_my_firm_id());
