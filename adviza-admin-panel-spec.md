# Adviza AI — Admin Panel Specification
### Super Admin Panel (Platform) + Organization Admin Panel (Tenant) + User Panel (Individual)

Adviza is B2B-only, multi-tenant, and regulated. That means you actually need **three layers of access**, not one "admin panel":

| | Super Admin Panel | Organization Admin Panel | User Panel |
|---|---|---|---|
| Who uses it | Adviza internal team (ops, support, eng, finance) | The RIA firm's own Firm Admin / CCO | Each individual advisor/associate under the org |
| Scope | Every tenant, platform-wide | That firm only, RLS-bound | That user's own workspace, scoped by role and client visibility set by the org admin |
| Purpose | Run the SaaS business | Run their firm on Adviza, manage their own users | Do their actual job (meetings, workflows, portfolios) |
| Manages | Organizations, orgs' admins, billing, models, gateways | Their org's users, their activity, integrations, compliance config | Nothing administrative — just their own work inside what they're entitled to |

Keep Super Admin and Organization Admin as physically separate apps/routes (e.g. `admin.adviza.ai` vs `app.adviza.ai/settings/org`) with separate auth, so a compromised firm-admin account can never reach platform-level controls. The User Panel is just the normal product experience (`app.adviza.ai`), scoped by role.

---

## 0. Page / Menu Structure (Sitemap)

### Super Admin Panel — Sidebar

1. **Dashboard** — platform-wide health, MRR, active orgs, open incidents
2. **Organizations**
   - All Organizations (list, search, filter by plan/status)
   - Organization Detail (tabs: Overview · Users · Seats & Quota · Billing · Feature Flags · Integrations · Audit Log)
   - Create Organization (manual, by Super Admin)
3. **Users**
   - All Users (cross-tenant search)
   - User Detail (full profile, activity, permissions, quota) / Impersonate
   - Sessions & Force Logout
   - Terminate / Extend Access
4. **Billing & Payments**
   - Subscriptions & Plans
   - Invoices
   - **Payment Gateways**
   - Usage & Metering
   - Discounts / Credits
5. **AI & Models**
   - **LLM Model Registry** (add/remove/deprecate models)
   - Model Routing Policies
   - **Per-Org / Per-User Model Quotas**
   - Provider Registry
   - AI Cost Dashboard
6. **Features & Entitlements**
   - Feature Catalog
   - Plan Entitlements
   - Org Overrides
   - Rollout % / Kill Switches
7. **Compliance & Audit**
   - Cross-Tenant Audit Log
   - WORM / Storage Integrity
   - Retention Policies
   - Security Posture (SOC 2, etc.)
8. **Observability**
   - System Health (latency, error rate, queue depth)
   - Incidents
   - Trace Lookup (by request/workflow ID)
9. **Analytics**
   - Adoption
   - Revenue
   - Support
   - AI Quality
10. **Admin Access (RBAC)**
    - Internal Admin Users
    - Admin Roles & Permissions
    - Admin Audit Log
    - IP Allowlist / SSO Settings
11. **Platform Settings**
    - General Settings
    - Notification Templates (incl. credential email)
    - API Keys & Webhooks

### Organization Admin Panel — Sidebar

1. **Dashboard** — firm overview, adoption snapshot, seats used vs. paid-for
2. **Team**
   - Members (list, status, activity)
   - Add User (blocked once paid seat count is reached)
   - Roles & Permissions
   - Client/Account Visibility Assignment
   - Member Activity Log
3. **Integrations** — connected apps, connection health
4. **Compliance**
   - Regulatory Profile
   - Approval Rules
   - Communication Review Rules
5. **AI & Workflows**
   - Enabled Features (as purchased in plan)
   - Memory Settings
   - Workflow Templates
6. **Billing**
   - Plan & Seats (upgrade to add more seats)
   - Invoices
   - Payment Method
7. **Audit & Evidence**
   - Evidence Log
   - Export for Exams
8. **Analytics**
   - Advisor Productivity
   - Adoption

### User Panel — Sidebar (individual advisor/associate)

1. **My Dashboard** — today's meetings, open action items
2. **Meeting Dossiers**
3. **Workflows** (only the ones enabled for their role/org)
4. **My Clients** (only accounts assigned to them by the org admin)
5. **My Activity** — read-only view of their own action/audit history
6. **Profile & Password**

---

## 1. Super Admin Panel (Platform Level)

### 1.1 Organization / Tenant Management
- Directory of all firms: name, plan, seats used/licensed, MRR, signup date, status (trial / active / past-due / suspended / churned), health score
- **Full organization detail view**: everything about a given org — its users, roles, seats purchased vs. used, plan/features entitled, billing history, integrations connected, audit log, support notes
- **Manual organization creation** — Super Admin can create an org directly (outside the self-service payment flow), useful for enterprise deals, pilots, or demos: set name, plan, seat count, feature entitlements, and either auto-send credentials to a specified admin email or leave it in a draft state until commercial terms are finalized
- Suspend / reactivate / offboard tenant, with data-retention countdown on offboarding
- Custom domain / SSO config per tenant
- Tenant notes & CS/sales owner assignment

### 1.2 Cross-Tenant User Management
- Global user search (by email, name, firm)
- **Full user detail view**: role, org, seat status, activity log, last login, sessions, model usage/quota, permissions — visible to Super Admin regardless of which org they belong to
- Force logout / revoke sessions
- MFA enforcement policy (global default + per-tenant override)
- **Terminate user access**: immediately revoke a specific user's access (e.g. abuse, offboarded employee reported by the firm, non-payment) — this frees their seat but does not delete their historical records (needed for audit/evidence continuity)
- **Extend / reinstate access**: restore a terminated user, or extend a trial/limited-access user's window
- **Impersonation** — support staff can log in "as" a user to debug, but every impersonation session is itself logged (who, whose account, start/end time, actions taken) and the tenant should be able to see this in their own audit log

### 1.3 Feature Flags & Entitlements
- Central feature catalog: chat, workflow canvas, deep research, multi-model routing, portfolio drift engine, FIX/trading module, compliance evidence export, etc.
- Default entitlements per plan tier (Starter / Professional / Enterprise) — this is what a firm gets automatically based on the package they bought on the website
- Per-org overrides (pilot access, beta features, custom contracts)
- Staged rollout % and emergency kill-switch per feature — critical for anything touching trading or client communications
- Feature dependency rules (e.g. trading module requires compliance module enabled)

### 1.4 Billing & Subscription Oversight
- Stripe-synced dashboard: plan, MRR/ARR per org, invoice status, failed payments, dunning stage
- Usage-based metering: AI/model calls, tokens, workflow runs per org (for overage billing and margin tracking)
- Manual discount/credit application with approval trail
- Contract metadata: renewal date, seat count vs. licensed count, custom terms

### 1.5 Payment Gateway Management
Given clients across India, Kenya/East Africa, UK, Australia and the US, you'll likely need more than one gateway live at once (e.g. Stripe for US/UK/AU, Razorpay for India, a local processor for East Africa).
- **Gateway registry**: list of configured gateways (Stripe, Razorpay, PayPal, etc.) with status (active/disabled/test mode)
- **Add a gateway**: select provider → enter API keys/secrets (written to a secrets manager, never displayed again in plaintext) → configure webhook endpoint → set supported currencies/regions → test-mode transaction → go live
- **Remove/disable a gateway**: soft-disable only if it has processed transactions (keep for historical reconciliation); hard-remove allowed only if never used
- **Default gateway routing**: assign a default gateway per region/currency, with per-org override if a specific firm needs a specific processor
- **Fallback logic**: if primary gateway fails, retry via a secondary gateway before marking payment failed
- **Webhook health**: delivery success rate, last failure, replay failed webhooks
- **Reconciliation view**: transactions per gateway vs. internal billing ledger, to catch drift

> **Build note:** you said you have a separate, more detailed prompt for Payment Gateway (Razorpay) implementation. When it's time to actually build this, that should be raised as its own task using that prompt rather than being built off this spec alone — this document should only describe *what the admin panel needs to manage*, not dictate the integration's implementation details.

### 1.6 AI Provider & LLM Model Management
- **Provider registry**: provider, endpoint, region, data-retention policy, "used for training?" flag, contract/BAA-equivalent status, approved data classification, approved workload types
- **Model registry table**: model name, provider, endpoint/deployment ID, version tag, status, context window, input/output cost per 1K tokens, capability tags (text / vision / function-calling / reasoning), approved data classification
- **Add New Model** flow: select provider → enter endpoint & credentials → set model identifier & version → set context window & pricing → tag capabilities → set approved data classification → run a test call/health check → optionally assign to a routing policy → activate. New models enter as `Draft` → `Testing` before they can be marked `Active`.
- **Remove a Model** — two-step, not a hard delete by default:
  - **Deprecate**: stops new routing to the model immediately; existing workflow runs and audit records that already reference it still resolve correctly (this matters — a model referenced in a past audit/evidence record can't just disappear)
  - **Archive / Hard delete**: only allowed once no audit or execution record references the model, or after the firm's retention period has passed; otherwise it stays deprecated-but-visible for provenance
- **Version pinning**: let a specific org stay on a specific model version even after a newer one is added platform-wide (some enterprise clients won't want silent version changes)
- **Fallback chains**: if Model A errors or times out, auto-route to a designated backup model
- Model routing policy editor (which model class is eligible for which task type/data sensitivity — e.g. client-sensitive data only to approved-classification models)

### 1.7 Model Quota Management
- **Per-organization quota**: set/adjust the AI usage quota (e.g. tokens, model calls, or workflow-runs per month) an org is entitled to under their plan
- **Per-user quota within an org**: optionally cap an individual user's usage (useful if a firm wants to prevent one advisor from consuming the whole org's monthly allowance)
- **Increase / decrease quota**: Super Admin can adjust either up (e.g. mid-cycle upsell, goodwill gesture) or down (e.g. plan downgrade, abuse prevention) — every change is logged with reason and actor
- **Quota alerts**: notify org admin (and optionally Super Admin) as usage approaches the cap; configurable hard-stop vs. soft-warn-and-allow-overage behavior
- Per-model, per-org, per-user cost and latency dashboard
- Provider incident/outage status feed

### 1.8 Compliance & Audit Oversight (platform-wide)
- Cross-tenant audit log viewer, itself access-restricted and logged
- Immutable/WORM storage health checks (hash-chain verification status, not just "RLS blocks deletes")
- Data retention policy configuration by regulatory profile
- SOC 2 / security posture dashboard for enterprise sales support

### 1.9 Observability & Reliability
- API latency (P50/P90/P95/P99), error rates, queue depth, workflow failure/retry rates
- Incident log + postmortem tracking
- Circuit-breaker / provider health status board
- Distributed trace lookup by `request_id` / `workflow_run_id`

### 1.10 Platform Analytics
- Adoption: WAU/MAU per org, feature usage heatmap, workflows-per-advisor
- Revenue: MRR/ARR trend, net revenue retention, churn, expansion, LTV/CAC
- Support: ticket volume, escalation rate, time-to-resolution
- AI quality: answer acceptance rate, correction/override rate, citation coverage, flagged hallucinations

### 1.11 Super-Admin RBAC (Internal Team Access)
Super Admin isn't one all-powerful login — it's itself role-based, so Adviza's own employees only get what their job needs:
- **Internal admin roles** (starting set): Support (read-only + impersonate), Billing Ops (billing/payment gateway access, no model/compliance access), Engineering (model registry, observability, feature flags), Compliance/Exec (full audit + compliance access), Super Owner (everything, including managing other admin roles)
- **Permission matrix**: each internal role mapped against each menu section (0.1–0.11) with View / Edit / No-access — e.g. Support can view an org's user list and impersonate, but cannot touch billing or the model registry
- **Custom internal roles**: Super Owner can create additional scoped roles as the team grows (e.g. a "Regional CS" role limited to orgs in a specific country)
- **Assigning roles**: Super Owner invites an internal employee, assigns a role (or combination of roles), can revoke or change it any time
- Every super-admin action is itself audit-logged — this list is not optional given the product's own compliance positioning
- IP allowlist / SSO required for admin panel login

---

## 2. Organization Admin Panel (Tenant Level)

This is what the **firm's own admin (Firm Admin / CCO)** sees — scoped entirely to their `firm_id` via RLS.

### 2.1 Firm & User Management
- Invite/manage advisors, associates, CCO, ops staff
- **Add User** — only enabled up to the number of seats the firm has paid for; once the seat limit is hit, the button is disabled with a prompt to upgrade the plan (which routes to Billing)
- Role-based access: Lead Advisor, Associate Advisor, CCO/Compliance Reviewer, Firm Admin, Read-only
- Assign client/account visibility per advisor (who can see which households)
- **Each user gets their own panel/workspace** — the org admin doesn't work inside individual users' accounts day-to-day, but has full visibility into and control over them: view any user's activity, suspend a specific user (e.g. someone leaving the firm), reset their password, reassign their client list
- **Member activity log** — org admin can see what each of their users has been doing on the platform (workflows run, meetings prepped, actions approved) — this is the firm-level equivalent of the Super Admin's cross-tenant view, scoped to just their firm

### 2.2 Integrations
- Connect/disconnect CRM, calendar, email, custodian, document storage (via the canonical action layer, not raw Composio)
- Connection health status and re-auth flows

### 2.3 Policy & Compliance Configuration
- Set firm's regulatory profile (SEC-registered adviser / state-registered / BD-affiliated / private fund adviser / other) — this drives which control set applies, rather than a blanket "FINRA/SEC compliance engine"
- Configure what requires CCO approval (e.g. client communications, trade proposals above a threshold)
- Communication review rules and escalation routing

### 2.4 AI & Workflow Configuration
- Toggle which AI features are enabled for the firm (within what platform entitlements allow — i.e. whatever was included in the package they purchased)
- Ambient memory governance — which memory categories are allowed to persist (preferences vs. sensitive client context vs. compliance evidence, each with different retention rules)
- Workflow template management

### 2.5 Billing (self-service, scoped)
- Current plan, seats used vs. licensed, invoices, payment method (whichever gateway the platform has routed them to — e.g. Razorpay for an India-based firm, Stripe for a US firm)
- **Add more seats** — self-service upgrade flow; additional payment unlocks additional "Add User" slots immediately
- Usage dashboard scoped only to their own firm, including proximity to their model/usage quota

### 2.6 Firm Audit & Evidence
- Evidence-chain viewer scoped to their firm (who/what/when/why/source/model/policy/approval/outcome)
- Export for regulatory exams

### 2.7 Firm Analytics
- Advisor productivity: meeting prep time saved, action items auto-extracted, CRM updates automated
- Adoption within the firm (weekly active advisors, workflows run)

---

## 3. Individual User Panel

Every user under an organization (an advisor, associate, or compliance reviewer) gets their **own scoped workspace** — this is the actual day-to-day product, not an "admin" surface, but it's worth specifying here because access to it is entirely controlled by the two layers above it:

- What a user can see and do is the intersection of: (a) the org's plan entitlements set by Super Admin, (b) the role the org admin assigned them, and (c) the specific client/account visibility the org admin granted them
- A user cannot add other users, change billing, or alter compliance configuration — those stay with the org admin
- A user can: run workflows they're entitled to, view/manage their own assigned clients, see their own activity history, update their own profile and password
- If a user's access is terminated (by their org admin or by Super Admin), their historical records remain intact for audit purposes — only their ability to log in and act is removed

---

## 4. Self-Service Signup, Payment & Provisioning Flow

This is the flow from "org buys a plan on the website" to "their team is working inside Adviza":

1. **Plan selection** — prospective firm picks a package on the marketing site (e.g. Starter / Professional / Enterprise) and chooses **how many user seats** they want
2. **Payment** — firm pays through the routed payment gateway (region-dependent, e.g. Razorpay for India, Stripe elsewhere) for the seat count × plan price
3. **Auto-provisioning** — on successful payment webhook confirmation:
   - A new organization record is created automatically (`firm_id`, plan, seat count, feature entitlements derived from the plan)
   - A Firm Admin account is created for the person who completed checkout
   - RLS boundary, default feature flags, and quota are set based on the purchased plan
4. **Credential delivery** — the Firm Admin receives their login credentials by email (temporary password, login link)
5. **First login** — Firm Admin logs in, is prompted to **change their password**
6. **Add team** — Firm Admin adds users one at a time, up to (but not exceeding) the number of seats paid for; each invited user gets their own credentials by email and sets their own password on first login
7. **Feature access** — every user under the org automatically gets access to whatever features were included in the plan the org purchased — no separate per-user feature purchase; feature access is org-wide, seat count is what's individually metered
8. **Upgrade path** — if the firm wants more seats or a higher plan, that's a self-service upgrade in Billing (2.5), which triggers another payment → seat count increase → "Add User" unlocks further slots

This entire flow should also be triggerable **manually by Super Admin** (section 1.1) for enterprise deals that don't go through self-service checkout — same end state (org created, admin credentialed, seats/features set), just initiated from the Super Admin panel instead of a payment webhook.

---

## 5. Data Model Additions

New entities needed beyond the core domain model already scoped for Adviza:

`organizations`, `subscriptions`, `plans`, `feature_flags`, `feature_entitlements`, `seats` (purchased vs. used), `user_access_status` (active/terminated/extended, with reason and actor), `quotas` (org-level and user-level), `quota_usage_events`, `admin_users`, `admin_roles`, `admin_role_permissions`, `admin_audit_log`, `impersonation_sessions`, `provider_registry`, `model_registry`, `payment_gateways`, `payment_gateway_transactions`, `provisioning_events` (payment → org creation → credential email, each step logged), `usage_metering_events`

Every row in `admin_audit_log`, `impersonation_sessions`, and `user_access_status` changes should carry the same evidentiary fields already used for the main product's audit events (actor, action, resource, before/after, timestamp, session/request IDs, reason) — the admin panel is not exempt from the auditability standard you're selling to customers.

---

## 6. Pre-Launch Technical Foundations Checklist

Separate from the admin-panel feature set above, these are foundational build/launch items — several depend on being done early rather than retrofitted:

1. **Keep frontend, backend, and database separated** — foundation first; everything else (admin panel, multi-tenancy, scaling) depends on this being right from the start, not bolted on later
2. **Mobile responsiveness handled properly at build time** — fix this as you build each screen, not after; retrofitting responsive design across an already-built admin panel and product is painful and slow
3. **Set up the payment gateway (Razorpay)** — core functionality needed before go-live, not after
4. **Audit and convert the website to be SEO-friendly** — do this before submitting to Google; there's no point indexing a site that isn't SEO-optimized yet
5. **List on Google (Google Search Console)** — submit the sitemap only after SEO work is actually in place
6. **Track user activity (Google Analytics 4)** — start measuring once people can actually land on and use the site
7. **Get user screen recording (Microsoft Clarity)** — layer this on once there's real traffic; recordings are only useful once there's actual user behavior to study

> **Build note:** you have separate, more detailed prompts for **Payment Gateway (Razorpay)**, **SEO**, and **Google Tag Manager** implementation. When any of these three come up for actual implementation, that should be raised as its own dedicated task using those specific prompts — not built ad hoc off this checklist. This document only flags that they need to happen and roughly when in the sequence; it isn't the spec for how to build them.

---

## 7. Build Priority

**Phase 1 (needed before your first paying B2B org can be safely onboarded):**
Org CRUD (manual + self-service provisioning), cross-tenant user management, seat/quota enforcement, basic feature flags, one payment gateway live, basic audit log, Organization Admin Panel v1 (user/role management + integrations), User Panel v1.

**Phase 2:**
Model registry (add/remove/deprecate), quota management (org + user level), additional payment gateways, Super Admin RBAC, impersonation with audit trail, observability dashboard, firm regulatory-profile-driven compliance config.

**Phase 3:**
Full platform analytics, AI quality dashboards, advanced usage-based billing, evidence export tooling.

Don't build Phase 3 before Phase 1 — it's tempting because analytics dashboards demo well, but without tenant isolation, entitlements, and basic audit, you can't actually sell to a regulated B2B buyer.
