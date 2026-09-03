-- ============================================================
-- Adviza AI — Admin Panel Schema
-- Migration: 010_admin_panel_schema.sql
-- ============================================================

-- ============================================================
-- 1. PLATFORM SCHEMA (physically separate from public.*)
--    No tenant RLS applies here — access controlled at API layer
-- ============================================================

CREATE SCHEMA IF NOT EXISTS platform;

-- Platform Operators (Adviza internal team only)
-- These users are NOT in public.profiles — separate auth entirely
CREATE TABLE IF NOT EXISTS platform.platform_admins (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT        UNIQUE NOT NULL,
  full_name       TEXT        NOT NULL,
  role            TEXT        NOT NULL DEFAULT 'support'
                              CHECK (role IN ('super_owner','engineering','billing_ops','compliance_exec','support','read_only')),
  mfa_enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
  mfa_secret_encrypted TEXT,  -- AES-256 encrypted TOTP secret; never returned in API responses
  ip_allowlist    INET[]      NOT NULL DEFAULT '{}',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  last_login_ip   TEXT,
  created_by      UUID        REFERENCES platform.platform_admins(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable Platform Audit Log (INSERT ONLY — trigger below blocks UPDATE/DELETE)
CREATE TABLE IF NOT EXISTS platform.platform_audit_events (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID        NOT NULL REFERENCES platform.platform_admins(id),
  actor_email   TEXT        NOT NULL,
  action        TEXT        NOT NULL,
  resource_type TEXT        NOT NULL,   -- 'organization','user','feature_flag','model','gateway','billing','system','admin'
  resource_id   TEXT,
  payload       JSONB       NOT NULL DEFAULT '{}',
  reason        TEXT,
  ip_address    INET,
  user_agent    TEXT,
  sha256_hash   TEXT        NOT NULL,   -- SHA-256(actor_id || action || resource_id || payload || created_at)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at — immutable by design
);

-- Trigger: block UPDATE and DELETE on platform_audit_events
CREATE OR REPLACE FUNCTION platform.prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit events are immutable. UPDATE and DELETE are not permitted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_audit_immutable_update ON platform.platform_audit_events;
CREATE TRIGGER tr_audit_immutable_update
  BEFORE UPDATE ON platform.platform_audit_events
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_audit_mutation();

DROP TRIGGER IF EXISTS tr_audit_immutable_delete ON platform.platform_audit_events;
CREATE TRIGGER tr_audit_immutable_delete
  BEFORE DELETE ON platform.platform_audit_events
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_audit_mutation();

-- Impersonation Sessions (append-only, auditable, visible in org's own audit log)
CREATE TABLE IF NOT EXISTS platform.impersonation_sessions (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_admin_id   UUID        NOT NULL REFERENCES platform.platform_admins(id),
  target_firm_id      UUID        NOT NULL REFERENCES public.firms(id),
  target_user_id      UUID        REFERENCES auth.users(id),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at            TIMESTAMPTZ,
  actions_taken       JSONB       NOT NULL DEFAULT '[]',  -- page views, search queries (read-only only)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature Flags (platform-wide catalog)
CREATE TABLE IF NOT EXISTS platform.feature_flags (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key                   TEXT        UNIQUE NOT NULL,
  description           TEXT        NOT NULL,
  is_enabled_globally   BOOLEAN     NOT NULL DEFAULT FALSE,
  enabled_for_plans     TEXT[]      NOT NULL DEFAULT '{}',
  rollout_percentage    INTEGER     NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  depends_on            TEXT[]      DEFAULT '{}',   -- feature dependency keys
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-Organization Feature Flag Overrides
CREATE TABLE IF NOT EXISTS platform.org_feature_overrides (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id         UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  feature_key     TEXT        NOT NULL REFERENCES platform.feature_flags(key) ON DELETE CASCADE,
  is_enabled      BOOLEAN     NOT NULL,
  override_reason TEXT,
  expires_at      TIMESTAMPTZ,
  set_by          UUID        REFERENCES platform.platform_admins(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_org_feature UNIQUE (firm_id, feature_key)
);

-- AI/LLM Provider Registry
CREATE TABLE IF NOT EXISTS platform.provider_registry (
  id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                        TEXT        UNIQUE NOT NULL,
  endpoint                    TEXT,
  region                      TEXT,
  data_retention_policy       TEXT,
  used_for_training           BOOLEAN     NOT NULL DEFAULT FALSE,
  contract_status             TEXT        NOT NULL DEFAULT 'active'
                              CHECK (contract_status IN ('active','pending','expired')),
  approved_data_classification TEXT[]     NOT NULL DEFAULT '{}',
  approved_workload_types     TEXT[]      NOT NULL DEFAULT '{}',
  is_active                   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LLM Model Registry
CREATE TABLE IF NOT EXISTS platform.model_registry (
  id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                        TEXT        NOT NULL,
  model_id                    TEXT        UNIQUE NOT NULL,
  provider_id                 UUID        REFERENCES platform.provider_registry(id),
  version_tag                 TEXT        NOT NULL,
  status                      TEXT        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','testing','active','deprecated','archived')),
  context_window              INTEGER,
  cost_per_1k_input_tokens    NUMERIC(8,6) DEFAULT 0,
  cost_per_1k_output_tokens   NUMERIC(8,6) DEFAULT 0,
  capability_tags             TEXT[]      NOT NULL DEFAULT '{}',
  approved_data_classification TEXT[]     NOT NULL DEFAULT '{}',
  fallback_model_id           TEXT        REFERENCES platform.model_registry(model_id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Gateway Registry
CREATE TABLE IF NOT EXISTS platform.payment_gateways (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     TEXT        NOT NULL,
  provider_key             TEXT        UNIQUE NOT NULL,
  status                   TEXT        NOT NULL DEFAULT 'test'
                           CHECK (status IN ('active','test','disabled')),
  supported_currencies     TEXT[]      NOT NULL DEFAULT '{}',
  supported_regions        TEXT[]      NOT NULL DEFAULT '{}',
  webhook_endpoint         TEXT,
  webhook_secret_encrypted TEXT,        -- written to secrets manager; NEVER returned in API after save
  is_default_for_regions   TEXT[]      NOT NULL DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Events & Incidents
CREATE TABLE IF NOT EXISTS platform.system_events (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type        TEXT        NOT NULL
                    CHECK (event_type IN ('deployment','incident','maintenance','alert','info')),
  title             TEXT        NOT NULL,
  description       TEXT,
  severity          TEXT        NOT NULL DEFAULT 'info'
                    CHECK (severity IN ('info','warning','error','critical')),
  affected_services TEXT[]      NOT NULL DEFAULT '{}',
  status            TEXT        NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','investigating','mitigating','resolved')),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  postmortem        TEXT,
  created_by        UUID        REFERENCES platform.platform_admins(id)
);

-- Provisioning Events (payment → org creation → credential email — every step logged)
CREATE TABLE IF NOT EXISTS platform.provisioning_events (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id      UUID        REFERENCES public.firms(id),
  event_type   TEXT        NOT NULL
               CHECK (event_type IN ('payment_received','org_created','admin_credentialed','manual_provision','plan_changed','suspended','reactivated')),
  triggered_by TEXT        NOT NULL,   -- 'webhook', 'super_admin', 'self_service'
  actor_id     TEXT,                   -- platform_admin.id or 'system'
  payload      JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enriched Org Summary (materialized view — refresh on a schedule)
CREATE MATERIALIZED VIEW IF NOT EXISTS platform.org_summary AS
  SELECT
    f.id,
    f.name,
    f.slug,
    f.plan,
    f.subscription_status,
    f.max_users,
    f.max_clients,
    f.max_ai_requests_per_month,
    f.ai_requests_used_this_month,
    f.trial_ends_at,
    f.suspended_at,
    f.created_at,
    COUNT(DISTINCT p.id)   AS user_count,
    COUNT(DISTINCT c.id)   AS client_count,
    COUNT(DISTINCT m.id)
      FILTER (WHERE m.created_at > NOW() - INTERVAL '30 days')
                           AS meetings_last_30d,
    COALESCE(SUM(cl.portfolio_value), 0) AS total_aum
  FROM public.firms f
  LEFT JOIN public.profiles p  ON p.firm_id = f.id
  LEFT JOIN public.clients  c  ON c.firm_id = f.id
  LEFT JOIN public.meetings  m  ON m.firm_id = f.id
  LEFT JOIN public.clients  cl ON cl.firm_id = f.id
  GROUP BY f.id, f.name, f.slug, f.plan, f.subscription_status,
           f.max_users, f.max_clients, f.max_ai_requests_per_month,
           f.ai_requests_used_this_month, f.trial_ends_at,
           f.suspended_at, f.created_at
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_summary_id ON platform.org_summary(id);

-- ============================================================
-- 2. PUBLIC SCHEMA ADDITIONS
-- ============================================================

-- Organization Invitations (team member invite-by-email)
CREATE TABLE IF NOT EXISTS public.org_invitations (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id     UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  invited_by  UUID        NOT NULL REFERENCES public.profiles(id),
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'advisor'
              CHECK (role IN ('advisor','ops','compliance')),
  token       TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status      TEXT        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','expired','revoked')),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. ENHANCE public.firms WITH ADMIN PANEL COLUMNS
-- ============================================================

ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_users                    INTEGER     NOT NULL DEFAULT 3;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_clients                  INTEGER     NOT NULL DEFAULT 50;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_workflows                INTEGER     NOT NULL DEFAULT 10;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_ai_requests_per_month    INTEGER     NOT NULL DEFAULT 500;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS ai_requests_used_this_month  INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS subscription_status          TEXT        NOT NULL DEFAULT 'trialing'
  CHECK (subscription_status IN ('active','past_due','cancelled','trialing','paused','suspended'));
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS trial_ends_at                TIMESTAMPTZ;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS billing_email                TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS regulatory_profile           JSONB       NOT NULL DEFAULT '{"type":"ria","regulator":"sec","state":null,"crd_number":null}';
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS onboarding_completed         BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS suspended_at                 TIMESTAMPTZ;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS suspension_reason            TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS custom_domain                TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS cs_owner                     TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS cs_notes                     TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS default_model_id             TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS ai_user_quota_override       INTEGER;

-- ============================================================
-- 4. RLS FOR NEW PUBLIC TABLES
-- ============================================================

ALTER TABLE public.org_invitations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "org_invitations_firm_admin" ON public.org_invitations;
  CREATE POLICY "org_invitations_firm_admin" ON public.org_invitations
    FOR ALL USING (
      firm_id = get_my_firm_id()
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('owner', 'compliance')
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 5. SEED PLATFORM FEATURE FLAGS (initial catalog)
-- ============================================================

INSERT INTO platform.feature_flags (key, description, enabled_for_plans, rollout_percentage)
VALUES
  ('deep_research',        'Multi-source Deep Research mode in Chat',              ARRAY['pro','enterprise'],  100),
  ('web_search',           'Real-time web search in Chat',                         ARRAY['pro','enterprise'],  100),
  ('fix_trading',          'FIX protocol trade simulation (sandbox only)',          ARRAY['enterprise'],         100),
  ('compliance_export',    'FINRA/SEC signed PDF compliance export',               ARRAY['enterprise'],         100),
  ('multi_model_routing',  'Access to all 5 LLM providers',                       ARRAY['pro','enterprise'],  100),
  ('workflow_canvas',      'Visual workflow builder',                              ARRAY['pro','enterprise'],  100),
  ('composio_integrations','Third-party tool integrations via Composio',           ARRAY['pro','enterprise'],  100),
  ('mem0_memory',          'Persistent semantic memory per client (pgvector)',      ARRAY['pro','enterprise'],  100),
  ('portfolio_drift',      'Automated portfolio drift calculation & nightly alerts',ARRAY['pro','enterprise'],  100),
  ('team_collaboration',   'Multi-advisor seat management',                        ARRAY['enterprise'],         100),
  ('api_access',           'REST API keys for enterprise integration',             ARRAY['enterprise'],         100),
  ('white_label',          'Custom branding & custom domain',                      ARRAY['enterprise'],           0)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 6. SEED INITIAL LLM PROVIDERS
-- ============================================================

INSERT INTO platform.provider_registry
  (name, region, used_for_training, contract_status, approved_data_classification, approved_workload_types, is_active)
VALUES
  ('AWS Bedrock',          'us-east-1',       FALSE, 'active', ARRAY['internal','client_sensitive'], ARRAY['chat','analysis','research'], TRUE),
  ('NVIDIA NIM',           'us-west-2',       FALSE, 'active', ARRAY['internal'],                   ARRAY['chat','code'],                TRUE),
  ('Google Cloud Vertex',  'us-central1',     FALSE, 'active', ARRAY['internal','client_sensitive'], ARRAY['chat','analysis'],            TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_platform_audit_actor       ON platform.platform_audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_resource    ON platform.platform_audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_created     ON platform.platform_audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impersonation_firm         ON platform.impersonation_sessions(target_firm_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_admin        ON platform.impersonation_sessions(platform_admin_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_firm       ON public.org_invitations(firm_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token      ON public.org_invitations(token);
CREATE INDEX IF NOT EXISTS idx_provisioning_firm          ON platform.provisioning_events(firm_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_status      ON platform.model_registry(status);
