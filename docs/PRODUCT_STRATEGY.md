# Adviza AI — Senior PM & Solution Architect Strategy Document
## "How Adviza Should Be Built to Win in Wealth Management"

---

### Document Metadata
- **Classification**: Product Strategy — Internal Leadership
- **Authors**: Senior PM Perspective + Solution Architect Perspective
- **Last Updated**: September 3, 2026

---

## EXECUTIVE THESIS

> **One sentence**: Adviza wins by being the first AI Operating System that turns every wealth advisor's scattered data, tools, and client interactions into a single governed intelligence loop — reducing admin overhead by 50% while making fiduciary decisions auditable by design.

Wealth management is a fundamentally trust-based industry operating under regulatory scrutiny. The firms that will pay for and stay with Adviza are those who believe AI can make their advisors more productive, their processes more compliant, and their client relationships stickier — without introducing new legal liability.

That is a very different product than a general-purpose AI chatbot with a financial skin.

---

## PART I: THE RIGHT PRODUCT WEDGE

### 1.1 The Core Value Loop (Ship This First, Period)

Most enterprise software fails by trying to replace everything at once. Adviza's strongest wedge is a single, complete loop:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    THE ADVIZA INTELLIGENCE LOOP                              │
│                                                                              │
│  1. PREP (Morning)                                                           │
│     ↳ "You have 3 client meetings today."                                   │
│     ↳ Auto-generated dossier: Holdings, drift, CRM notes, open tasks, goals │
│                                                                              │
│  2. MEETING (Advisor + Client)                                               │
│     ↳ Advisor uses Adviza on second screen for live context                 │
│     ↳ AI answers "what's the current allocation?" in 2 seconds              │
│                                                                              │
│  3. FOLLOW-UP (Immediately After)                                            │
│     ↳ Meeting notes → AI extracts commitments → Advisor reviews in 30 sec  │
│     ↳ One click: update CRM + create tasks + draft follow-up email          │
│                                                                              │
│  4. EVIDENCE (Always On)                                                     │
│     ↳ Every AI output, advisor approval, and action is cryptographically    │
│       logged with model version, policy version, and approver ID            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**This loop, done exceptionally well, saves 90+ minutes per advisor per day. That is your sales pitch. Everything else is a feature.**

### 1.2 What NOT to Ship First

The following are strong long-term vision items but will diffuse your go-to-market if shipped simultaneously with the core loop:

| Feature | Why to Defer |
| :--- | :--- |
| Live FIX Trade Execution | Requires custodial agreements, legal clearance, and deep compliance work. Simulate only — clearly labeled. |
| Multi-Advisor Real-Time Canvas | Complex collaboration UX. Advisors don't primarily use Adviza together. |
| 5-Model Picker in UI | Confuses non-technical users. Route models intelligently based on task; expose selection as advanced setting only. |
| Full Workflow Canvas Builder | Powerful but complex. Start with pre-built workflow templates, not a blank canvas. |
| Generic AI Chatbot | If Adviza becomes "ask anything," you lose your differentiation from ChatGPT. Every feature should be wealth-context-grounded. |

---

## PART II: IDEAL CUSTOMER PROFILE (ICP)

### 2.1 Primary ICP: The Scaling RIA Firm

| Attribute | Description |
| :--- | :--- |
| **Size** | $100M – $2B AUM, 2–15 advisors |
| **Registration** | SEC-registered or Dual-registered RIA |
| **Pain Point** | Too small for enterprise Salesforce FSC deployment, too large to manage manually |
| **Tech Stack** | Schwab Advisor Services or Fidelity, Wealthbox/Redtail CRM, Google Workspace |
| **Decision Maker** | Founding Partner / Managing Partner + CCO |
| **Budget Authority** | $500 – $3,000/month per firm ($5,000+ for enterprise) |
| **Trigger Event** | Crossing 100 clients, onboarding 2nd advisor, compliance examination, needing to scale without hiring |

### 2.2 Secondary ICP: Multi-Family Office (MFO)

| Attribute | Description |
| :--- | :--- |
| **Size** | $500M – $5B AUM, 5–50 staff |
| **Pain Point** | Highly complex client relationships (multiple entities, trusts, alternative investments) with legacy data fragmentation |
| **Requirement** | White-labeling, API access, SIEM integration, custom audit exports |
| **Pricing** | Enterprise tier ($5,000–$15,000/month, annual contract) |

### 2.3 Who to Explicitly NOT Target (Yet)

- **Independent broker-dealers** (different compliance framework, FINRA BD rules apply)
- **Robo-advisors** (B2C, commoditized, different economics)
- **Banks & wirehouses** (procurement cycles of 18–36 months, impossible to move fast)
- **Solo practitioners under $50M AUM** (cost-sensitive, low conversion probability)

---

## PART III: WHAT ADVIZA MUST DO EXCEPTIONALLY WELL

### 3.1 The Five Non-Negotiable Product Qualities

**Quality 1: Grounded Truth**
Every AI response must be grounded in live data — the advisor's actual clients, actual holdings, actual calendar. A response that hallucinates a portfolio value or fabricates a meeting commitment is a legal liability for the advisor. This is non-negotiable.

*Architect's Note*: This means: deterministic data layer first, LLM narrative layer second. The LLM should never compute a number — it should only explain a number that was computed by deterministic code.

---

**Quality 2: Fiduciary-Safe by Default**
Adviza must never put words in an advisor's mouth about investment recommendations. It must surface information, highlight risks, and propose actions for advisor approval — not autonomously take actions that affect client assets without an explicit approval step.

*PM's Note*: The advisor is the fiduciary. Adviza is the Chief of Staff. The Chief of Staff never signs the contract — the partner does.

---

**Quality 3: Invisible Compliance**
The compliance trail should be created as a natural byproduct of normal work — not as a separate, burdensome process. When an advisor approves a draft email, that approval is automatically logged. When Adviza proposes a rebalance, the model version, input data snapshot, and advisor approval are all captured.

*Architect's Note*: Build the audit trail first. Then build the features on top of it. Not the reverse.

---

**Quality 4: Blazingly Fast Context Loading**
If it takes 10 seconds to load a meeting dossier, advisors won't use it before meetings. Target: Full client dossier (holdings, CRM, meetings, tasks, emails) ready in under 2 seconds.

*Architect's Note*: Pre-compute briefings via Inngest cron workers nightly and on-demand on calendar event detection. Cache aggressively. Store pre-computed JSON in `meetings.briefing JSONB`.

---

**Quality 5: Enterprise-Grade Security Without Enterprise Friction**
RIA firms are security-conscious — they have client PII, financial data, and regulatory obligations. But they are small teams without dedicated IT staff. Security must be configured by the platform (MFA, encrypted tokens, audit logs) without requiring the advisor to understand security.

*PM's Note*: Sell security as a feature, not a configuration burden. "Your client data is protected by bank-grade encryption and compliance-grade audit trails — automatically."

---

## PART IV: HOW ADVIZA SAVES TIME AND INCREASES PRODUCTIVITY

### 4.1 Quantified Time Savings Per Advisor (Target Metrics)

| Activity | Before Adviza | With Adviza | Time Saved |
| :--- | :--- | :--- | :--- |
| Pre-meeting client research | 45–90 min | 5 min (dossier auto-generated) | **40–85 min** |
| Post-meeting task extraction | 30–45 min | 2 min (AI extracts, advisor approves) | **28–43 min** |
| Compliance documentation | 20–40 min per review | Auto-generated during workflow | **20–40 min** |
| CRM updates after meetings | 15–30 min | Automated with advisor approval | **15–30 min** |
| Portfolio drift analysis | 30–60 min per review cycle | Nightly automated with morning alert | **30–60 min** |
| Email drafting for client follow-ups | 10–20 min per email | Draft in 30 sec, advisor edits | **8–18 min** |
| **Total per day (10 meetings/week)** | **~3.5–5 hours** | **~30–45 min** | **~2.5–4 hours/day** |

**Business Impact**: At 3 hours saved per day × 250 working days × $300/hour advisor billing rate equivalent = **$225,000/year recovered capacity per advisor**. Adviza at $1,500/month ($18,000/year) is a **12.5x ROI**.

### 4.2 Revenue-Side Productivity (The Second Pitch)

Beyond saving time, Adviza increases revenue capacity:
- **More clients per advisor**: If prep time drops from 2 hours to 20 minutes, one advisor can manage 50% more clients.
- **Fewer errors, fewer compliance breaches**: Each compliance breach costs $50K–$500K in regulatory response costs. One prevented breach pays for years of Adviza.
- **Stickier client relationships**: AI-generated meeting dossiers and follow-ups make advisors look more attentive and organized → higher client retention → higher AUM.

---

## PART V: PHASED PRODUCT ROADMAP

### Phase 1 — "The Meeting Intelligence Loop" (Months 1–3)
*Core wedge. Every engineering decision should serve this.*

- [x] Live client context ingestion (CRM, holdings, meetings, tasks)
- [x] Advisor AI chat with grounded context
- [x] Meeting dossier generation (pre-computed + on-demand)
- [ ] Meeting transcript → AI commitment extraction
- [ ] One-click CRM + task + email update from meeting extraction
- [ ] Org Admin Panel (Phase 1: Team, Billing, Audit, Settings)
- [ ] Super Admin Panel (Phase 1: Org management, Platform dashboard)

### Phase 2 — "The Compliance Engine" (Months 4–6)
*Make compliance teams love Adviza.*

- [ ] Regulatory Controls & Evidence Engine (configurable by registration type)
- [ ] Policy & Authorization Engine (separate from LLM reasoning)
- [ ] Immutable audit trail with cryptographic hash chain
- [ ] CCO compliance report exports (signed PDF)
- [ ] Fiduciary Evidence Record: who, what, when, why, model, policy, approver, result
- [ ] Deep Research with tier-classified source citations

### Phase 3 — "Portfolio Intelligence" (Months 7–9)
*Deterministic financial math; AI explains results.*

- [ ] Deterministic portfolio drift engine (code-computed, not LLM)
- [ ] Tax-loss harvesting identification engine
- [ ] Rebalancing proposal workflow (Propose → Advisor Approve → Stage → Verify → Audit)
- [ ] Custodian data sync (Schwab Advisor Services API, Fidelity WealthscapeSM)
- [ ] FIX trade simulation (clearly labeled as simulation)

### Phase 4 — "The Enterprise Platform" (Months 10–18)
*Land enterprise accounts and expand.*

- [ ] API access for enterprise integration
- [ ] White-label branding + custom domain
- [ ] SIEM/SOC integration (log forwarding)
- [ ] Multi-advisor workflow handoff
- [ ] Platform-level analytics for Super Admin
- [ ] SOC 2 Type II audit certification

---

## PART VI: REVENUE MODEL

### 6.1 Plan Tiers (B2B, Per-Firm Pricing)

| Plan | Price | Seats | Target ICP |
| :--- | :--- | :--- | :--- |
| **Free / Trial** | $0 (14-day trial) | 1 seat, 10 meetings, 50 clients, 100 AI requests | Solo advisor evaluation |
| **Pro** | $299/month | 3 seats, 100 clients, 500 AI req/mo | Small RIA (2–3 advisors) |
| **Growth** | $699/month | 8 seats, 300 clients, 2,000 AI req/mo | Growing RIA (4–8 advisors) |
| **Enterprise** | $1,500+/month | Unlimited seats, custom limits | Scaling RIA / MFO |

### 6.2 Pricing Levers

- **Additional seats**: $49/seat/month on Pro, $79/seat/month on Growth
- **AI Request overage**: $0.02/request above plan limit
- **White-label**: +$500/month on Enterprise
- **API access**: Included in Enterprise; $299/month add-on for Growth

### 6.3 Annual Contract Incentives

- Annual pre-pay: 2 months free (17% discount)
- Enterprise annual: Custom negotiated; target $18,000–$60,000/year

---

## PART VII: GO-TO-MARKET STRATEGY

### 7.1 Channel Strategy

**Channel 1: Direct Outbound (Months 1–6)**
- Target RIA firms with $200M–$1B AUM on public SEC Form ADV database
- Identify the 2,000 fastest-growing RIAs (AUM increase > 20% YoY)
- Personalized outreach showing exactly how much time they'd save based on their Form ADV

**Channel 2: Custodian Ecosystem Partnership (Months 3–9)**
- Schwab Advisor Services, Fidelity Investments, and Pershing all have advisor technology marketplaces
- Getting listed in these marketplaces provides instant credibility and inbound leads
- Priority: Schwab Advisor Services Technology Partnership Program

**Channel 3: RIA Aggregator & Compliance Consultant Relationships (Months 6–12)**
- Partner with RIA compliance consultants (who advise 10–100 RIA firms each)
- Partner with RIA aggregators (Mercer Advisors, Mariner, Carson Group) for enterprise deals

**Channel 4: Content & Community (Ongoing)**
- Publish the "2026 RIA Productivity Report" using anonymized Adviza usage data
- Speak at NAPFA, T3 Technology Conference, Schwab IMPACT
- Build an "AI for Advisors" newsletter → build demand before sales motion

### 7.2 Sales Cycle Expectations

| ICP | Decision Maker | Sales Cycle | ACV |
| :--- | :--- | :--- | :--- |
| Small RIA (2–3 advisors) | Founding Partner | 2–4 weeks | $3,600–$8,400 |
| Growing RIA (5–10 advisors) | Managing Partner + CCO | 4–8 weeks | $8,400–$18,000 |
| Large RIA / MFO | COO + CCO + Procurement | 3–6 months | $18,000–$60,000 |

---

## PART VIII: COMPETITIVE DIFFERENTIATION

### 8.1 Competitive Landscape

| Competitor | What They Do | Adviza's Edge |
| :--- | :--- | :--- |
| **Salesforce FSC + Einstein AI** | CRM with AI copilot | Requires $60K+/year implementation; generic AI; Adviza is purpose-built and fast to deploy |
| **Wealthbox AI** | CRM with AI summaries | Very basic AI; no orchestration; no compliance trail; no portfolio intelligence |
| **Hearsay Systems** | Social media compliance | Narrow use case; Adviza is full operating system |
| **Practifi** | Practice management | No AI orchestration; workflow-only |
| **ChatGPT/Claude direct** | Generic AI | No client context; no compliance trail; data leaves firm boundary; hallucination risk |
| **Holistiplan / eMoney** | Financial planning tools | Point solutions; not an operating system; no AI orchestration |

### 8.2 The Defensible Moat (3-Year Vision)

Adviza's moat is not the AI model (models are commodities). The moat is:

1. **Proprietary Context Graph**: The richer the client data stored in Adviza (meetings, decisions, commitments, outcomes), the harder it becomes to switch. After 12 months of usage, Adviza understands a firm's clients better than any new tool could.

2. **Regulatory Evidence Library**: Compliance departments that have trained Adviza on their firm's specific regulatory profile and have 2 years of signed audit trails cannot switch without losing that evidence library.

3. **Advisor Workflow Habits**: Once advisors run 500 meetings through Adviza, they have built workflows around it. The switching cost is high.

4. **Custodian Integration Depth**: Schwab/Fidelity/Pershing API integrations take 12–18 months to negotiate and certify. Early movers lock this in.

---

## PART IX: CRITICAL ARCHITECTURAL DECISIONS

### 9.1 The Five Things to Build Right the First Time

**A. Deterministic Financial Math Engine**

The LLM must NEVER compute:
- Portfolio drift percentages
- Tax-loss harvesting amounts
- Rebalancing quantities
- Fee calculations

Build a `lib/calculations/` module with pure, unit-tested TypeScript functions. The LLM's job is to interpret intent ("should I rebalance this?") and explain the result ("here is why I'm recommending this rebalance"). The math is always deterministic code.

**B. Policy & Authorization Engine**

Before any tool call, evaluate:
1. Is the requesting user authorized to take this action? (tenant + role)
2. Does this action require HITL approval? (high-risk actions)
3. Would this action violate a configured regulatory constraint? (e.g., firm-wide prohibition on crypto)
4. Does this action require CCO notification? (e.g., above-threshold trade)

This must be a separate module, not embedded in the LLM prompt.

**C. Append-Only Audit Architecture**

Design the audit trail so it is physically impossible to modify from the application layer:
1. Insert-only trigger on `audit_logs` (block UPDATE and DELETE)
2. Each record includes `sha256_hash(actor + action + payload + prev_hash)` — hash-chained
3. Export signing: when exporting audit data, sign the export with a private key and store the signature

**D. Tenant Memory Isolation**

Every pgvector similarity search must include `firm_id = ?` AND `user_id = ?` filters evaluated BEFORE cosine similarity ranking. An advisor at Firm A must never see vector matches from Firm B's client memories.

**E. Execution State Machine**

Any external action (send email, create CRM note, update calendar) must go through:
```
PROPOSED → HITL_PENDING → APPROVED → EXECUTING → EXECUTED → VERIFIED → AUDITED
```

With idempotency keys to prevent duplicate execution on retry, and compensating transactions for rollback.

---

## PART X: THE 15 SPECIFIC RECOMMENDATIONS

### From the Senior PM:

1. **Name the Core Experience**: Call it "Meeting Intelligence." Make "Before Meeting / During Meeting / After Meeting" the primary navigation for new users. This frames the product around the workflow that matters most.

2. **Build the Onboarding Around Time-to-First-Value**: First valuable moment should be within 30 minutes of signup: connect calendar + add first client + generate first meeting dossier. Instrument this and optimize relentlessly.

3. **Create a CCO Portal**: CCOs at RIA firms are your biggest internal champions. Build a dedicated CCO view (audit exports, compliance flags, regulatory evidence) and let them demo it to their managing partners. They become your internal sales team.

4. **Price on AUM bands, not seats**: "Under $500M: Pro. $500M–$2B: Growth. $2B+: Enterprise." Advisors understand AUM-based pricing. Seat pricing feels like being nickel-and-dimed.

5. **Build a "Firm Intelligence Score"**: A composite score showing the firm how well their data is organized, how complete their client profiles are, how actively they're using Adviza's AI. Higher score = stickier customer.

6. **Launch a Referral Program for Advisors**: An advisor referring a peer at another firm gets $500 credit. Word-of-mouth in the RIA community is the most trusted channel.

7. **Publish Your Compliance Architecture**: Write a detailed "How Adviza Protects Your Firm" whitepaper. Share it with your prospects' CCOs before the sales call. It reduces the single biggest objection.

### From the Solution Architect:

8. **Adopt the 8-Stage Architectural Spine Now**: `Context → Policy → Reason → Propose → Approve → Execute → Verify → Audit`. Every feature you build should fit within this pipeline. This prevents ad-hoc feature additions that bypass governance.

9. **Separate Your LLM Routing From Your Data Layer Completely**: The model selection (which LLM to use) should be invisible to the data layer. Your data context assembler should not know or care which model will receive the context.

10. **Build an Internal SDK First**: Before exposing an external API, build an internal `@adviza/sdk` package used by both the Next.js frontend and the Fastify backend. This prevents duplication and creates a clean API contract.

11. **Design for Stateless Horizontal Scale From Day One**: Every Fastify route must be stateless. Session state lives in Supabase. Cache state lives in Redis (or Upstash). This makes scaling from 10 orgs to 1,000 orgs a config change, not a rewrite.

12. **Implement Structured Logging Immediately**: Every API request should log: `firm_id`, `user_id`, `action`, `model_id` (if AI), `latency_ms`, `status_code`, `request_id`. Without this, debugging production issues in a multi-tenant system is nearly impossible.

13. **Create a Staging Tenant Policy**: The Adviza team's own usage of the product (dogfooding) should happen in a designated `firm_id` with `plan = 'enterprise'` and feature flags pre-enabled. Never test production features in production org data.

14. **Define Your External Data Source Trust Tiers Now**: Before adding more external data sources (market data, news, web search), define the trust tier hierarchy: Internal DB (T1) → Custodian API (T2) → Regulator/SEC EDGAR (T3) → Licensed Data (T4) → General Web (T5). Different tiers have different citation requirements and can be used in different contexts (e.g., T5 cannot be used for pricing).

15. **Model Explainability Is a Product Feature**: When Adviza recommends rebalancing a portfolio, the advisor must be able to see exactly: which data informed the recommendation, which calculation produced the numbers, which policy rules were evaluated, and which model generated the narrative. "AI said so" is not acceptable in a fiduciary context.

---

## CONCLUSION

Adviza has a genuinely strong foundation and a product thesis that is directionally correct for the wealth management market. The critical success factors are:

1. **Narrow the wedge** — dominate the meeting intelligence loop before expanding.
2. **Make math deterministic** — LLMs explain, code computes.
3. **Build compliance as infrastructure** — not as a feature.
4. **Respect the fiduciary relationship** — Adviza is the Chief of Staff, never the decision-maker.
5. **Security earns trust** — in wealth management, trust is the product.

The firms that will pay premium prices for Adviza are those whose advisors spend less time on paperwork and more time with clients, whose CCOs can sleep at night knowing every AI output is auditable, and whose partners can scale AUM without linearly scaling headcount.

**That is the product. Build that.**

---

*Document Owner: Product & Engineering Leadership | Review Cycle: Quarterly*
