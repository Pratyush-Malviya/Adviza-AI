-- ============================================================
-- Adviza AI - Workflows Schema
-- Migration: 004_workflows_schema.sql
-- ============================================================

-- ============================================================
-- WORKFLOWS (persisted visual pipeline definitions)
-- ============================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id),
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

-- ============================================================
-- WORKFLOW RUNS (execution history per workflow)
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  logs JSONB NOT NULL DEFAULT '[]',
  node_outputs JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER for workflows
-- ============================================================
CREATE TRIGGER workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_workflows_firm_id ON workflows(firm_id);
CREATE INDEX IF NOT EXISTS idx_workflows_creator_id ON workflows(creator_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_firm_id ON workflow_runs(firm_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

-- Workflows: full CRUD scoped to firm
CREATE POLICY "workflows: firm members can read"
  ON workflows FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "workflows: firm members can insert"
  ON workflows FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "workflows: creators and owners can update"
  ON workflows FOR UPDATE
  USING (
    firm_id = get_my_firm_id()
    AND (
      creator_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('owner', 'ops')
      )
    )
  );

CREATE POLICY "workflows: owners can delete"
  ON workflows FOR DELETE
  USING (
    firm_id = get_my_firm_id()
    AND (
      creator_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'owner'
      )
    )
  );

-- Workflow runs: scoped to firm
CREATE POLICY "workflow_runs: firm members can read"
  ON workflow_runs FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "workflow_runs: firm members can insert"
  ON workflow_runs FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "workflow_runs: system can update run status"
  ON workflow_runs FOR UPDATE
  USING (firm_id = get_my_firm_id());
