-- ============================================================
-- WealthPilot AI - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: get current user's firm_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_firm_id()
RETURNS UUID AS $$
  SELECT firm_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- FIRMS policies
-- ============================================================
CREATE POLICY "firms: members can read their firm"
  ON firms FOR SELECT
  USING (id = get_my_firm_id());

CREATE POLICY "firms: owners can update their firm"
  ON firms FOR UPDATE
  USING (
    id = get_my_firm_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================
-- PROFILES policies
-- ============================================================
CREATE POLICY "profiles: members can read own firm profiles"
  ON profiles FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "profiles: users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles: owners can insert profiles for their firm"
  ON profiles FOR INSERT
  WITH CHECK (
    firm_id = get_my_firm_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================
-- CLIENTS policies
-- ============================================================
CREATE POLICY "clients: firm members can read all clients"
  ON clients FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "clients: advisors can insert clients for their firm"
  ON clients FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "clients: advisors can update their clients"
  ON clients FOR UPDATE
  USING (
    firm_id = get_my_firm_id()
    AND (
      advisor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('owner', 'ops')
      )
    )
  );

CREATE POLICY "clients: owners/ops can delete clients"
  ON clients FOR DELETE
  USING (
    firm_id = get_my_firm_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('owner', 'ops')
    )
  );

-- ============================================================
-- MEETINGS policies
-- ============================================================
CREATE POLICY "meetings: firm members can read all meetings"
  ON meetings FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "meetings: advisors can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "meetings: advisors can update their meetings"
  ON meetings FOR UPDATE
  USING (
    firm_id = get_my_firm_id()
    AND (
      advisor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('owner', 'ops', 'compliance')
      )
    )
  );

CREATE POLICY "meetings: owners can delete meetings"
  ON meetings FOR DELETE
  USING (
    firm_id = get_my_firm_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================
-- ACTION ITEMS policies
-- ============================================================
CREATE POLICY "action_items: firm members can read"
  ON action_items FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "action_items: firm members can insert"
  ON action_items FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "action_items: firm members can update"
  ON action_items FOR UPDATE
  USING (firm_id = get_my_firm_id());

-- ============================================================
-- AUDIT LOGS policies (read-only for compliance users)
-- ============================================================
CREATE POLICY "audit_logs: firm members can read"
  ON audit_logs FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "audit_logs: system can insert (service role)"
  ON audit_logs FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());
