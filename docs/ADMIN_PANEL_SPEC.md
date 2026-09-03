# Adviza AI — Super Admin & Organization Panel
## Complete Technical Specification & Implementation Blueprint

---

### Document Metadata
- **Version**: 1.0
- **Classification**: Internal Engineering & Product Specification
- **Security Classification**: CONFIDENTIAL — Internal Only
- **Last Updated**: September 3, 2026
- **Status**: Approved for Implementation

---

## PART I: ARCHITECTURE OVERVIEW

### 1.1 Panel Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ADVIZA AI — THREE-TIER PANEL HIERARCHY              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TIER 1: SUPER ADMIN PANEL  /super-admin/*                              │
│  • Platform operators only (Adviza team)                                │
│  • Full platform visibility, billing control, system health             │
│  • Requires: super_admin role + MFA + IP allowlist                      │
│                                                                         │
│              |                                                          │
│              v                                                          │
│                                                                         │
│  TIER 2: ORGANIZATION ADMIN PANEL  /org-admin/*                         │
│  • Firm Owner / CCO per B2B client organization                         │
│  • Manages own firm's users, settings, billing, integrations            │
│  • Requires: owner or compliance role + MFA                             │
│                                                                         │
│              |                                                          │
│              v                                                          │
│                                                                         │
│  TIER 3: ADVISOR WORKSPACE  /dashboard/*                                │
│  • Individual advisor daily operations (existing)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Security-First Architecture Principles

> [!CAUTION]
> Security is the absolute top priority. Every panel section implements defense-in-depth: authentication, authorization, network controls, audit, and data isolation are all enforced independently.

1. **Separate Route Namespace**: Super Admin lives at `/super-admin/*` — a completely isolated Next.js route group with its own layout, middleware, and session context. Zero shared state with `/dashboard/*`.
2. **Role Enum Separation**: `super_admin` is NOT stored in the `profiles` table (which is tenant-scoped). It is stored in a separate `platform_admins` table in a dedicated schema inaccessible to any tenant RLS policy.
3. **MFA Mandatory**: All super admin and org admin logins require TOTP MFA. Unenforced = access denied.
4. **IP Allowlist (Super Admin)**: Super admin access is restricted to an IP CIDR allowlist stored in environment variables, enforced in Next.js middleware before any route renders.
5. **Session Isolation**: Super admin sessions use a separate auth token with a 1-hour max TTL and no refresh (re-auth required after inactivity).
6. **Read-Only by Default**: Every super admin action that mutates data requires a typed confirmation and is logged with the operator's identity, timestamp, and reason.
7. **Zero Cross-Tenant Data**: Super Admin UI never renders tenant data inline. All tenant data fetches go through a dedicated `platform_api` edge function with its own service key — never the standard tenant JWT.
8. **Cryptographic Audit Trail**: Every admin action writes an immutable `platform_audit_events` record with SHA-256 hash of `(actor_id + action + payload + timestamp)`.

---

## PART II: DATABASE SCHEMA ADDITIONS

### 2.1 New Tables Required

```sql
-- ============================================================
-- PLATFORM ADMIN SCHEMA (separate from tenant schema)
-- ============================================================

CREATE SCHEMA IF NOT EXISTS platform;

-- Platform Operators (Adviza internal team)
CREATE TABLE platform.platform_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'support'
    CHECK (role IN ('super_admin', 'billing_admin', 'support', 'read_only')),
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret_encrypted TEXT,
  ip_allowlist INET[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  created_by UUID REFERENCES platform.platform_admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable Platform Audit Events (INSERT ONLY)
CREATE TABLE platform.platform_audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES platform.platform_admins(id),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  sha256_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at — immutable by design
);

-- Feature Flags (per-plan and per-organization overrides)
CREATE TABLE platform.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  is_enabled_globally BOOLEAN NOT NULL DEFAULT FALSE,
  enabled_for_plans TEXT[] NOT NULL DEFAULT '{}',
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-Organization Feature Flag Overrides
CREATE TABLE platform.org_feature_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES platform.feature_flags(key) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL,
  override_reason TEXT,
  expires_at TIMESTAMPTZ,
  set_by UUID REFERENCES platform.platform_admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_org_feature UNIQUE (firm_id, feature_key)
);

-- Platform System Events & Incidents
CREATE TABLE platform.system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('deployment', 'incident', 'maintenance', 'alert', 'info')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  affected_services TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'investigating', 'mitigating', 'resolved')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform.platform_admins(id)
);

-- Enriched Organizations Materialized View
CREATE MATERIALIZED VIEW platform.org_summary AS
  SELECT
    f.id, f.name, f.slug, f.plan, f.stripe_customer_id,
    f.meetings_used, f.meetings_limit, f.created_at,
    COUNT(DISTINCT p.id) AS user_count,
    COUNT(DISTINCT c.id) AS client_count,
    COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '30 days') AS meetings_last_30d,
    SUM(cl.portfolio_value) AS total_aum
  FROM public.firms f
  LEFT JOIN public.profiles p ON p.firm_id = f.id
  LEFT JOIN public.clients c ON c.firm_id = f.id
  LEFT JOIN public.meetings m ON m.firm_id = f.id
  LEFT JOIN public.clients cl ON cl.firm_id = f.id
  GROUP BY f.id
WITH DATA;

CREATE UNIQUE INDEX ON platform.org_summary(id);

-- Organization Invitations
CREATE TABLE IF NOT EXISTS public.org_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'advisor'
    CHECK (role IN ('advisor', 'ops', 'compliance')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enhanced firms table columns
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_users INTEGER NOT NULL DEFAULT 3;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_clients INTEGER NOT NULL DEFAULT 50;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_workflows INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS max_ai_requests_per_month INTEGER NOT NULL DEFAULT 500;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS ai_requests_used_this_month INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active'
  CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing', 'paused'));
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS regulatory_profile JSONB NOT NULL DEFAULT '{"type": "ria", "regulator": "sec", "state": null}';
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
```

---

## PART III: SUPER ADMIN PANEL — FULL SPECIFICATION

### 3.1 Authentication Gate

1. Must have `platform_admins` record with `is_active = true`
2. Must have completed TOTP MFA challenge in current session
3. Requesting IP must be in `ip_allowlist` (enforced in Next.js middleware)
4. Session TTL: **60 minutes hard expiry**, no sliding window

**Middleware pseudocode** (`middleware.ts`):
```typescript
// For all routes matching /super-admin/*
const SUPER_ADMIN_IP_ALLOWLIST = process.env.SUPER_ADMIN_IP_ALLOWLIST?.split(',') ?? [];
const clientIP = req.headers['x-forwarded-for'] ?? req.ip;
if (!isIPInAllowlist(clientIP, SUPER_ADMIN_IP_ALLOWLIST)) return Response.redirect('/403');
```

---

### 3.2 Module 1: Platform Dashboard (Overview)

**Route**: `/super-admin/`

**Key Metrics**:

| Metric | Source | Refresh |
| :--- | :--- | :--- |
| Total Organizations (Active / Trial / Suspended) | `platform.org_summary` | 5 min |
| Total Platform Users | `profiles` count | 5 min |
| Total Meetings (All Time / Last 30d) | `meetings` aggregate | 5 min |
| Total AI Requests (Today / Month) | `chat_sessions` aggregate | 5 min |
| Platform MRR | Stripe API | Real-time |
| Active Subscriptions by Plan Tier | Stripe API | Real-time |
| System Health Status | Internal health check | 30 sec |
| LLM Provider Status (AWS / NVIDIA / Google) | Health check endpoints | 1 min |

**Charts**: Org signups over time (12 months), AI Request Volume heatmap, MRR growth curve, Feature adoption rates.

---

### 3.3 Module 2: Organization Management

**Route**: `/super-admin/organizations`

**Columns**: Name, Slug, Plan, Status, Users, Clients, AUM, Meetings (30d), Created At.

**Filters**: Plan, Status, Date Range, Has Stripe.

**Actions per Org** (all logged to `platform_audit_events`):

| Action | Notes |
| :--- | :--- |
| **View Details** | Full org deep-dive page |
| **Impersonate (Read-Only)** | Opens sandboxed session with "⚠️ IMPERSONATION MODE" banner. Zero write access. |
| **Suspend Organization** | Toggles `suspended_at`, requires typed reason, sends email to billing contact |
| **Upgrade/Downgrade Plan** | Syncs with Stripe via API |
| **Reset AI Request Counter** | Resets `ai_requests_used_this_month` |
| **Override Usage Limits** | Temporary limit increases with expiry date |

**Org Detail Page** (`/super-admin/organizations/[firm_id]`): Overview, Users Tab, Billing Tab, Feature Flags Tab, Audit Trail Tab, Integrations Tab, AI Usage Tab.

---

### 3.4 Module 3: Global User Management

**Route**: `/super-admin/users`

**Actions**:
- View all users across ALL organizations
- Deactivate / Reactivate
- Force Password Reset
- Force MFA Re-enrollment
- View Impersonated Session Logs

---

### 3.5 Module 4: Subscription & Billing

**Route**: `/super-admin/billing`

**Sections**:
1. **MRR Dashboard**: MRR, ARR, New MRR, Churned MRR, Expansion MRR
2. **Subscription List**: All Stripe subscriptions with grace period extension
3. **Razorpay Integration**: India B2B payment link management, failed payment recovery
4. **Revenue Analytics**: ARPU by plan tier, cohort retention, upgrade/downgrade funnel
5. **Invoice Management**: Manual invoice generation, credit note creation (requires 2-admin approval)

---

### 3.6 Module 5: Feature Flag Management

**Route**: `/super-admin/features`

**Initial Feature Flags**:

| Flag Key | Description | Default Plans |
| :--- | :--- | :--- |
| `deep_research` | Multi-source Deep Research in Chat | pro, enterprise |
| `web_search` | Real-time web search in Chat | pro, enterprise |
| `fix_trading` | FIX protocol trade simulation | enterprise |
| `compliance_export` | FINRA/SEC PDF export | enterprise |
| `multi_model_routing` | Access to all 5 LLM providers | pro, enterprise |
| `workflow_canvas` | Visual workflow builder | pro, enterprise |
| `composio_integrations` | Third-party tool integrations | pro, enterprise |
| `mem0_memory` | Persistent semantic memory per client | pro, enterprise |
| `portfolio_drift` | Automated drift calculation & alerts | pro, enterprise |
| `team_collaboration` | Multi-advisor seat management | enterprise |
| `api_access` | REST API keys for enterprise integration | enterprise |
| `white_label` | Custom branding & domain | enterprise |

**Controls**: Global kill switch, per-plan defaults, rollout percentage (gradual), per-org overrides with expiry.

---

### 3.7 Module 6: Platform Analytics

**Route**: `/super-admin/analytics`

1. **Engagement**: Daily/Monthly Active Organizations, feature-level usage, chat session depth
2. **AI Model Analytics**: Request distribution, latency P50/P95/P99, error rate, cost estimate per model
3. **Retention**: Churn prediction scores, time-to-activation, power users vs. at-risk orgs
4. **Data Volume**: DB size per tenant, pgvector memory count, storage by module

---

### 3.8 Module 7: System Health Monitor

**Route**: `/super-admin/system`

1. **LLM Provider Health**: Real-time status for AWS Bedrock, NVIDIA NIM, Google Vertex AI; circuit breaker status
2. **Infrastructure Health**: Supabase DB pool, Fastify backend metrics, Inngest cron worker status
3. **Incident Management**: Create/manage incidents from `platform.system_events`, status page updates
4. **Maintenance Mode**: Toggle platform-wide maintenance with automated email to all billing contacts

---

### 3.9 Module 8: Platform Admin Management

**Route**: `/super-admin/admins`

**Access**: Only `super_admin` role (not billing_admin or support).

**Role Capabilities Matrix**:

| Capability | super_admin | billing_admin | support | read_only |
| :--- | :---: | :---: | :---: | :---: |
| View all orgs | ✅ | ✅ | ✅ | ✅ |
| Suspend org | ✅ | ❌ | ❌ | ❌ |
| Modify billing | ✅ | ✅ | ❌ | ❌ |
| Feature flags | ✅ | ❌ | ❌ | ❌ |
| Impersonate org | ✅ | ❌ | ✅ | ✅ |
| Manage platform admins | ✅ | ❌ | ❌ | ❌ |
| Create incidents | ✅ | ❌ | ✅ | ❌ |
| View audit trail | ✅ | ✅ | ✅ | ✅ |

**Actions**: Invite new platform admin (sends TOTP enrollment email), change role, deactivate immediately, view individual audit trail.

---

### 3.10 Module 9: Platform Audit Log

**Route**: `/super-admin/audit`

- Immutable record of every super admin action
- Export as signed PDF with SHA-256 hash of the export itself
- **Data Retention**: 7 years minimum. No delete in UI.
- Any export is itself logged as an audit event.

---

## PART IV: ORGANIZATION ADMIN PANEL — FULL SPECIFICATION

### 4.1 Access Requirements

- Profile `role IN ('owner', 'compliance')`
- MFA completed (TOTP or email OTP)
- Scoped entirely to own `firm_id` — zero cross-org visibility

---

### 4.2 Module 1: Organization Overview

**Route**: `/org-admin/`

**Metrics**: Current plan & status, seat usage, client usage, AI request usage (current month), meeting usage, trial days remaining.

**Health Indicators**: Onboarding checklist, MFA adoption rate, integration connection status.

---

### 4.3 Module 2: Team Management

**Route**: `/org-admin/team`

**User Table**: Name, Email, Role, MFA Status, Last Active, Status.

**Actions**:

| Action | Who Can Do | Notes |
| :--- | :--- | :--- |
| Invite User | Owner | Creates `org_invitations` record, sends email, 7-day expiry |
| Resend Invitation | Owner | For pending invites near expiry |
| Revoke Invitation | Owner | Marks token `revoked` |
| Change Role | Owner | advisor ↔ ops ↔ compliance. Cannot create another owner. |
| Deactivate User | Owner | Soft-delete; data preserved |
| Reactivate User | Owner | Restore access |
| View User Activity | Owner, Compliance | Summary of recent actions |

**Role Definitions**:

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **Owner** | Firm administrator | All capabilities including billing and team management |
| **Advisor** | Wealth advisor | Own clients, meetings, chat, workflows |
| **Ops** | Operations staff | View clients, manage action items, workflows |
| **Compliance** | CCO | Read all data, export compliance reports, full audit log |

> [!IMPORTANT]
> Seat Limit Enforcement: If `user_count >= max_users`, "Invite User" is disabled with upgrade prompt.

---

### 4.4 Module 3: Billing & Subscription

**Route**: `/org-admin/billing`

1. **Current Plan Summary**: Plan name, price, renewal date, features included
2. **Usage Meters**: Visual progress bars (80% warning, 100% hard block + upgrade prompt) for: Users, Clients, Meetings, AI Requests, Workflows
3. **Plan Upgrade/Downgrade**: Via Stripe Checkout, downgrade shows feature loss confirmation
4. **Payment Methods**: Stripe cards + Razorpay (India billing)
5. **Invoice History**: Last 24 months, downloadable PDF

---

### 4.5 Module 4: Integrations & Connectors

**Route**: `/org-admin/integrations`

**Integration Table**: App Name, Connected Account, Status, Last Synced, Scopes, Connected By, Actions.

**Org-Level Controls**:
- Default CRM, Default Calendar provider, Default email provider
- Org Admin can disconnect any advisor's integration
- View OAuth scopes granted per integration
- Trigger re-auth if token expired

---

### 4.6 Module 5: Organization Audit Log

**Route**: `/org-admin/audit`

**Pre-built CCO Reports**:
- "All AI-assisted client communications (last 90 days)"
- "All portfolio rebalancing proposals (last 12 months)"
- "All user login events with IP addresses (last 90 days)"
- "All external tool executions with HITL approval status"

**Export**: Signed PDF or CSV. Exports themselves are audit-logged.

---

### 4.7 Module 6: Feature & AI Configuration

**Route**: `/org-admin/settings/features`

- Enable/Disable features for entire org (within plan limits)
- Set default AI model for org
- AI Request rate limiting per user
- Regulatory Profile: SEC RIA / State RIA / Broker-Dealer / Hybrid + CRD number

---

### 4.8 Module 7: Organization Settings

**Route**: `/org-admin/settings`

1. **Firm Profile**: Name, slug, billing email, logo, timezone (IANA string), business address
2. **Security Settings**:
   - Toggle: "Require MFA for all users" (non-MFA users blocked on next login)
   - Session timeout: 30 min / 1h / 4h / 8h
   - IP restrictions: Office IP allowlist (optional)
3. **Notification Settings**: New user, user deactivated, AI limit 80%, payment failed, compliance flag raised
4. **Data & Privacy**: GDPR export (max once per 30 days), data retention view, deletion request workflow

---

## PART V: FILE STRUCTURE

```
app/
├── super-admin/
│   ├── layout.tsx               # IP allowlist + platform_admin MFA guard
│   ├── page.tsx                 # Platform dashboard
│   ├── login/page.tsx           # Separate login flow
│   ├── organizations/
│   │   ├── page.tsx
│   │   └── [firm_id]/page.tsx
│   ├── users/page.tsx
│   ├── billing/page.tsx
│   ├── features/page.tsx
│   ├── analytics/page.tsx
│   ├── system/page.tsx
│   ├── admins/page.tsx
│   └── audit/page.tsx
│
├── org-admin/
│   ├── layout.tsx               # Org owner/compliance role guard + MFA guard
│   ├── page.tsx
│   ├── team/page.tsx
│   ├── billing/page.tsx
│   ├── integrations/page.tsx
│   ├── audit/page.tsx
│   └── settings/
│       ├── page.tsx
│       └── features/page.tsx
│
└── dashboard/                   # Existing (unchanged)

app/api/
├── super-admin/
│   ├── orgs/route.ts
│   ├── orgs/[firm_id]/route.ts
│   ├── users/route.ts
│   ├── features/route.ts
│   └── audit/route.ts
└── org-admin/
    ├── team/route.ts
    ├── invitations/route.ts
    └── settings/route.ts

lib/
├── super-admin/
│   ├── auth.ts                  # Platform admin authentication helper
│   ├── audit.ts                 # Platform audit event writer
│   └── platform-client.ts      # Service-role client (platform schema only)
└── org-admin/
    ├── auth.ts                  # Org admin role guard
    └── limits.ts               # Usage limit enforcement helpers
```

---

## PART VI: BUILD PRIORITY PHASES

| Phase | Deliverable | Priority |
| :--- | :--- | :--- |
| **Phase 1** | DB migrations (platform schema + new firms columns) | P0 |
| **Phase 1** | Middleware security guards for both panel routes | P0 |
| **Phase 1** | Org Admin: Team Management (invite, roles, deactivate) | P0 |
| **Phase 1** | Org Admin: Billing (Stripe portal + usage meters) | P0 |
| **Phase 2** | Super Admin: Org list + detail view | P1 |
| **Phase 2** | Super Admin: Platform dashboard metrics | P1 |
| **Phase 2** | Org Admin: Audit log + export | P1 |
| **Phase 2** | Org Admin: Settings (profile, security, timezone) | P1 |
| **Phase 3** | Super Admin: Feature flag management | P2 |
| **Phase 3** | Super Admin: Billing dashboard + Razorpay sync | P2 |
| **Phase 3** | Super Admin: Platform admin management | P2 |
| **Phase 4** | Super Admin: System health monitor | P3 |
| **Phase 4** | Super Admin: Analytics dashboards | P3 |
| **Phase 4** | Org Admin: Regulatory profile & feature config | P3 |

---

## PART VII: SECURITY CHECKLIST (Pre-Launch, Non-Negotiable)

- [ ] IP allowlist enforcement tested with real IP blocking in staging
- [ ] MFA enrollment flow tested end-to-end (TOTP + verification)
- [ ] Super admin session TTL enforced at 60 min, tested
- [ ] Platform audit log is write-only: UI cannot delete or update records
- [ ] Impersonation mode is read-only: mutation endpoints return 403
- [ ] Cross-tenant isolation: org admin cannot access another firm's data
- [ ] Org invitation tokens expire after 7 days and are single-use
- [ ] All admin mutations require confirmation dialog with resource name typed
- [ ] Rate limiting on admin auth endpoints (5 attempts per 15 min)
- [ ] Platform admin MFA secrets AES-256 encrypted at rest
- [ ] Separate Supabase service-role key for platform schema (never exposed to tenant API)
- [ ] All admin pages: `X-Frame-Options: DENY` + strict `Content-Security-Policy`
- [ ] CSRF protection on all state-mutating API routes
- [ ] Data export uses time-bounded presigned URLs (expire in 15 minutes)
- [ ] SOC 2 Type II audit trail covers all three tiers

---

## APPENDIX: REQUIRED ENVIRONMENT VARIABLES

```bash
# Super Admin Security
SUPER_ADMIN_IP_ALLOWLIST=203.0.113.0/24,198.51.100.0/24
SUPER_ADMIN_SESSION_MAX_AGE=3600
PLATFORM_ADMIN_JWT_SECRET=<256-bit-random>

# Platform Schema (separate service-role)
PLATFORM_SUPABASE_SERVICE_KEY=<separate-service-role-key>

# MFA
TOTP_ISSUER_NAME=AdvizaAI
TOTP_ENCRYPTION_KEY=<32-byte-aes-key>

# Audit
AUDIT_LOG_HASH_SECRET=<sha256-salt>
```
