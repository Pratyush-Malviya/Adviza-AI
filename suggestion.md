The product concept is strong, but the current PRD/SRS is significantly ahead of the actual product definition in a few critical areas. It reads more like a polished architecture/feature inventory than a production-grade product specification. The biggest gaps are around regulatory boundaries, AI safety/governance, data architecture, execution controls, tenant isolation, observability, and the definition of what “production verified” actually means.

The PRD positions Adviza as an enterprise AI operating system for RIAs, with live context, multi-model routing, workflow execution, compliance auditing, and custodian integration. The SRS then turns that into a fairly concrete technical baseline with five models, Supabase context ingestion, LangGraph orchestration, Composio, FIX, and WORM-style audit logging.

1. My executive assessment
Area	PM assessment	Architect assessment
Product vision	Strong	Coherent
Target persona	Good starting point	Needs sharper authorization model
Problem/solution fit	Strong	Architecture supports much of it
AI architecture	Good foundation	Needs a much stronger policy/safety layer
Workflow architecture	Promising	Needs deterministic orchestration boundaries
Integrations	Good abstraction	Composio dependency needs governance
Portfolio/trading	High potential / high risk	Currently under-specified for real production
Compliance	Major concern	Current implementation does not justify some compliance claims
Data model	Incomplete	Too thin for the claimed product
Security	Good intentions	Several implementation gaps
Observability	Weakly specified	Must become first-class architecture
Enterprise readiness	Not yet	Need tenancy, RBAC, DR, retention, incident controls
MVP scope	Too broad	Too many technically expensive surfaces simultaneously

My rating: ~7/10 as a product/architecture concept, ~5/10 as an enterprise production specification.

The interesting part is that the weaknesses are fixable. I would not throw this architecture away. I would tighten the boundaries and significantly rewrite the requirements around governance and execution.

2. What I really like
A. The core product thesis is correct

The best part of Adviza is not “AI chat.”

It is:

AI understands the firm's operating context → reasons over that context → proposes/executes workflows → records what happened.

That is considerably more defensible than building another generic financial chatbot.

The PRD's live-context approach is particularly important: user, firm, AUM, workflows, meetings, actions, integrations and audit history are explicitly surfaced before model invocation.

That is directionally exactly what an enterprise vertical AI product should do.

B. Separating frontend and backend is a good decision

The two-service architecture is sensible:

Next.js → Fastify → orchestration/services → external systems

rather than putting all business logic inside Next.js API routes.

The PRD explicitly calls out a standalone Fastify backend decoupled from the frontend.

Architecturally, this gives you room to eventually have:

Web UI
   ↓
API Gateway
   ↓
Authorization / Policy
   ↓
AI Orchestrator
   ↓
 ┌───────────────┬────────────────┬──────────────┐
 │ Data/Context  │ AI Models      │ Action Tools │
 └───────────────┴────────────────┴──────────────┘
                         ↓
                  Audit / Observability

That's the right general direction.

C. LangGraph is being used for something meaningful

I like the explicit state graph:

Intent → Validator → HITL → Executor → Synth → Audit

rather than treating an LLM as one giant autonomous agent.

The SRS identifies the LangGraph six-node fiduciary state graph and explicitly connects it to HITL enforcement.

That's an important design choice.

For a financial system, I would go even further:

User Intent
   ↓
Intent Classification
   ↓
Policy / Permission Check
   ↓
Data Retrieval
   ↓
Reasoning
   ↓
Action Proposal
   ↓
Risk Classification
   ↓
HITL / Approval
   ↓
Deterministic Executor
   ↓
Verification
   ↓
Audit

The LLM should not own the final authority over consequential actions.

3. The biggest product problem: the scope is too wide

Right now Adviza is simultaneously:

AI copilot
executive assistant
CRM assistant
meeting intelligence platform
workflow automation platform
portfolio analytics platform
trading system
compliance system
document generation system
enterprise integration platform
multi-model AI gateway
semantic memory platform
billing platform
workflow canvas

That is a huge product surface.

The PRD's live capability matrix lists all of these as implemented or underway, including multi-model routing, ambient memory, Composio execution, FIX, autonomous workers, compliance exports and billing.

From a PM perspective, I would challenge this aggressively.

The question shouldn't be:

“Can Adviza do all of these?”

It should be:

“What is the one workflow for which an RIA would pay Adviza every month?”

My candidate:

Adviza's initial wedge

“Client meeting → intelligence → actions → documented follow-up.”

For example:

Upcoming client meeting
        ↓
Advisor asks Adviza for dossier
        ↓
Adviza gathers:
CRM + meetings + holdings + emails + action items
        ↓
Produces briefing
        ↓
Advisor conducts meeting
        ↓
Meeting notes/transcript
        ↓
AI extracts:
decisions + tasks + risks + follow-ups
        ↓
Advisor approves
        ↓
CRM/email/tasks updated
        ↓
Immutable audit trail

That is a fantastic product.

And it naturally expands into portfolio monitoring, compliance and eventually trading.

4. Major architecture issue: there is no real policy engine

This is probably my #1 technical concern.

The architecture has:

authentication
LangGraph
HITL
Composio
audit

But authentication isn't authorization.

You need a dedicated:

Policy & Authorization Engine

between reasoning and execution.

For example:

User
 ↓
Identity
 ↓
Tenant
 ↓
Role
 ↓
Resource permissions
 ↓
Action risk classification
 ↓
Policy evaluation
 ↓
Approval requirements
 ↓
Execution

Suppose someone says:

“Send this client an email recommending moving 30% of their portfolio into X.”

The system needs to determine:

Is the user allowed to send client communications?
Is this client assigned to this advisor?
Is this advice allowed through this workflow?
Is the content compliant?
Does it require CCO approval?
Is this an external communication?
Which policies apply?
Which evidence supports the recommendation?
What exact version of the policy/model/data was used?

HITL alone doesn't solve that.

The SRS currently describes HITL primarily around trade and email dispatch.

I'd make policy enforcement its own architectural component.

5. The “WORM” implementation needs serious rework

This is one of the biggest discrepancies between the specification and implementation claim.

The SRS says:

audit logs are WORM and UPDATE/DELETE are rejected.

But the example implementation mainly shows PostgreSQL RLS policies:

CREATE POLICY ... FOR INSERT ...
CREATE POLICY ... FOR SELECT ...

and describes UPDATE/DELETE being disallowed.

RLS is not the same thing as true WORM storage.

A sufficiently privileged database/service-role path can potentially bypass ordinary RLS protections. Your architecture needs to distinguish:

Audit integrity

from

Regulatory record retention

I'd recommend:

Application
   ↓
Audit Event Service
   ↓
Append-only event
   ↓
Primary DB
   +
Immutable object/archive storage
   ↓
Cryptographic hash
   ↓
Hash chain / manifest
   ↓
Periodic signed verification

For an enterprise system, I would seriously consider an immutable object-storage layer with object lock/retention controls rather than presenting a PostgreSQL table + RLS as the entirety of the WORM mechanism.

And the audit record should capture more than:

action
entity
user
timestamp
metadata

You need things such as:

tenant_id
actor_id
actor_role
session_id
request_id
action_id
action_type
resource
resource_version
input_hash
output_hash
model
model_version
prompt_policy_version
retrieved_context_ids
tool_calls
approval_event
approver
execution_result
timestamp
ip/device/session metadata

This is particularly important because SEC electronic recordkeeping requirements include safeguards against loss, alteration and destruction and requirements around access, retrieval and preservation.

6. The compliance positioning needs to be corrected

This is a PM + legal positioning issue, not merely a technical issue.

The PRD treats SEC Rule 206(4)-1 and FINRA Rule 2210 almost as a universal compliance framework for the platform.

That's too broad.

For example, the SEC marketing rule applies to SEC-registered or required-to-be-registered investment advisers when they disseminate advertisements.

FINRA Rule 2210 is not simply the universal communications rule for every RIA. So the product needs to identify the firm's regulatory profile and applicable regimes before determining which controls apply.

I'd change:

“FINRA/SEC compliance engine”

to something closer to:

Regulatory Controls & Evidence Engine

with configurable regulatory profiles.

For example:

Firm Regulatory Profile
 ├── SEC Registered Adviser
 ├── State Registered Adviser
 ├── Broker-Dealer affiliation
 ├── Private Fund Adviser
 └── Other applicable regimes

       ↓

Applicable Control Set
       ↓
Communication / Trading / Recordkeeping / Marketing policies

This makes the product much more enterprise-ready.

7. I would remove the “zero-training guarantee” wording

The SRS says:

“All LLM interactions must be routed through enterprise zero-retention endpoints with signed Business Associate Agreements.”

There are two problems.

First, “zero training” and “zero retention” are different concepts.

Second, BAA terminology is HIPAA-specific, so it is strange in a wealth-management security requirement unless there is another healthcare-related reason.

Use explicit contractual/security language instead:

No customer data may be used by the model provider
for training foundation models.

Retention policies must be explicitly documented
per provider and endpoint.

Customer data residency and deletion requirements
must be configurable.

Provider-level security terms must be validated
before the provider is enabled for production workloads.

Then keep a provider registry:

Provider
Endpoint
Region
Data retention
Training usage
Encryption
Contract status
Approved data classification
Approved workload types
8. The multi-model strategy is good—but you're over-indexing on models

I actually like having a model router.

But I wouldn't sell the product around:

“We have Claude + Gemini + Kimi + DeepSeek.”

That's an implementation detail.

Customers care about:

“Adviza gives me the right answer and safely completes the work.”

The actual architecture should be:

Task
 ↓
Task classifier
 ↓
Model policy
 ↓
Eligible models
 ↓
Provider health
 ↓
Cost
 ↓
Latency
 ↓
Data sensitivity
 ↓
Model selection

For example:

Sensitive client data
→ approved providers only

Simple extraction
→ low-cost model

Complex fiduciary analysis
→ high-quality model

Document/image processing
→ multimodal model

Quantitative calculation
→ deterministic calculator first
→ model second

And portfolio math should not fundamentally depend on an LLM.

9. Very important: deterministic finance engine vs LLM

This part of the SRS concerns me:

DeepSeek is positioned for “quantitative math, portfolio drift calculations, rebalancing allocations, and tax-loss harvesting.”

Architecturally, I'd strongly disagree with letting the model be responsible for the calculation engine.

Instead:

LLM
 ↓
interprets intent
 ↓
calls deterministic financial engine
 ↓
financial engine computes
 ↓
LLM explains result

For example:

Target allocation:
60/40

Actual:
67/33

Drift:
+7 / -7

Threshold:
5%

Result:
BREACH

That calculation belongs in deterministic code.

Same for:

tax lots
gains/losses
trade quantities
portfolio constraints
cash requirements
suitability rules
account restrictions
concentration limits

The LLM should reason about the outputs, not become the source of truth for them.

10. Trading architecture is much less mature than the document suggests

The SRS calls the FIX engine a “Custodian FIX Protocol 4.4/5.0 Engine” but simultaneously describes it as generating/simulating messages.

The PRD itself admits direct custodian clearing connectivity is still in development.

So I'd explicitly separate:

Phase 1

FIX message simulator

Phase 2

Order staging

Phase 3

Broker/custodian certification

Phase 4

Production order transmission

Phase 5

Execution reconciliation

The production system needs:

Proposed trade
 ↓
Validation
 ↓
Restrictions check
 ↓
Suitability check
 ↓
Cash check
 ↓
Duplicate check
 ↓
Approval
 ↓
Order staging
 ↓
Transmission
 ↓
Execution report
 ↓
Reconciliation
 ↓
Audit

The current specification jumps too quickly from “generate valid FIX tags” to “transmit rebalancing order batch.”

11. The data model is nowhere near complete enough

The SRS claims 12 core relational entities, but only a few schemas are actually defined in the document.

For the product you're describing, I'd expect explicit domain models around:

Firm
User
Role
Permission
Client
Household
Account
Custodian
Portfolio
Position
Security
Tax Lot
Target Allocation
Investment Policy
Restriction
Risk Profile
Meeting
Meeting Artifact
Action Item
Workflow
Workflow Run
Tool Connection
AI Session
AI Message
Memory
Approval
Trade Proposal
Order
Execution
Compliance Rule
Compliance Review
Audit Event
Evidence
Document
Model Execution
Provider
Usage / Billing

Without these concepts, you will eventually end up putting too much state inside JSONB.

12. Multi-tenancy needs to be explicit

The document mentions firm_id heavily, which is good.

But I don't see a sufficiently detailed tenant isolation architecture.

You need to define:

Tenant
 ↓
User
 ↓
Role
 ↓
Permission
 ↓
Client visibility
 ↓
Account visibility
 ↓
Workflow visibility
 ↓
Document visibility
 ↓
AI context visibility

And critically:

Memory isolation.

The system uses Mem0 + pgvector for long-term memory.

You absolutely cannot rely on application-level filtering alone.

Every memory vector must carry tenant/security metadata:

firm_id
user_id
scope
client_id
visibility
created_by
classification

Retrieval must enforce those filters before similarity ranking, not after.

13. “Ambient memory” needs governance

This feature sounds great from a product perspective.

But:

“Remember everything about my firm”

is dangerous in an enterprise financial application.

The system needs memory categories:

Explicit memory

Advisor says:

“I prefer concise client summaries.”

Safe to remember.

Operational memory

“John Smith's review is every March.”

Potentially okay.

Sensitive financial memory

“Client XYZ is considering selling their business.”

Requires stricter controls.

Regulated evidence

Should not be silently converted into semantic memory.

Therefore:

Memory
├── Preference
├── Operational Context
├── Client Context
├── Derived Insight
└── Compliance Evidence

Each should have different retention and retrieval rules.

14. The “Deep Research” definition isn't sufficient

The SRS says Deep Research should cross-examine historical meeting notes, CRM communications and holdings.

That's not really a research architecture.

It needs:

Research request
 ↓
Source planning
 ↓
Source retrieval
 ↓
Source ranking
 ↓
Evidence extraction
 ↓
Conflict detection
 ↓
Answer synthesis
 ↓
Citation / provenance

And every important claim should ideally map back to evidence.

For wealth management, I'd make provenance a first-class object.

Example:

“Client portfolio is 8.2% overweight equities.”

Underneath:

Source:
Portfolio snapshot 2026-09-03 09:14 UTC

Target model:
Model ID 7281 v3.2

Calculation:
portfolio_service/drift/v2.1

Evidence:
positions:
...

That's much more trustworthy than:

“According to your portfolio…”

15. The requirements around web search are dangerous

The SRS says Web Search can ground responses in:

market data
SEC releases
financial news.

You need to distinguish:

Public information

versus

Authoritative financial data.

For example, web search is not automatically an acceptable source for live market pricing.

I'd introduce source classifications:

Tier 1
Authoritative internal data

Tier 2
Licensed financial market data

Tier 3
Official regulator/government source

Tier 4
Trusted third-party source

Tier 5
General web

Then define which tasks permit which source tier.

16. Performance requirements are too optimistic / poorly defined

The SRS specifies:

database context extraction <150ms
TTFT <800ms / <1500ms
Lighthouse ≥95.

These are nice targets, but you're missing the actual measurement definitions.

For TTFT:

Does it mean:

browser click
→ first token

or:

API request
→ model first token

Those are completely different.

Also, an AI orchestration system involving:

Auth
+
8 DB queries
+
memory retrieval
+
policy evaluation
+
model routing
+
provider

cannot simply guarantee 800ms end-to-end by requirement.

I'd establish:

P50
P90
P95
P99

for:

API latency
DB context
model selection
provider latency
TTFT
complete response
tool execution
workflow completion
17. The scheduled jobs have a timezone bug waiting to happen

The document says:

6:00 AM EST
7:30 AM EST
5:00 PM EST

while cron schedules are given separately.

That's risky.

Use:

America/New_York

rather than hardcoding EST.

Otherwise daylight saving time creates incorrect execution times.

Also ask whether the jobs should run according to:

firm timezone
advisor timezone
system timezone

For an enterprise product, that should be tenant configuration.

18. There are inconsistencies between PRD and SRS

These should be cleaned up before engineering uses either document as authoritative.

Example 1: Database context

PRD says:

8 tables

SRS lists:

profiles, firms, clients, workflows, workflow_runs, meetings, action_items, firm_connections, audit_logs

That's actually 9 entities, despite the requirement saying 8.

That's exactly the kind of small inconsistency that eventually creates engineering ambiguity.

Example 2: Model naming

The SRS calls one model:

deepseek-v3

but the PRD describes an NVIDIA endpoint associated with:

deepseek-ai/deepseek-v4-flash-0731.

Those need to be unambiguous.

Example 3: Status language

The PRD calls the product:

“Active / Production Verified”

while simultaneously saying direct custodian FIX is still in development.

I'd distinguish:

Production deployed
Production validated
Beta
Simulated
Sandbox
Integration certified
Roadmap

“Production Verified” is too broad.

19. There is almost no incident/reliability architecture

99.9% uptime is mentioned.

But where are:

retries?
exponential backoff?
circuit breakers?
idempotency?
dead-letter queues?
distributed tracing?
request correlation IDs?
provider health?
workflow recovery?
partial failure handling?
replay?
disaster recovery?
RTO?
RPO?

A production workflow system absolutely needs these.

For example:

Workflow Run #9382

Step 1 ✓ Context fetched
Step 2 ✓ AI generated proposal
Step 3 ✓ Approval received
Step 4 ✗ Salesforce timeout
Step 5 — pending retry


The system must be resumable.

That's more important than simply saying “Inngest is live.”

20. Idempotency is missing and is critical

Imagine:

“Send this email.”

Network timeout occurs.

The client retries.

Without idempotency:

two emails get sent.

Same for:

CRM updates
calendar events
trades
workflow steps
compliance exports

Every consequential action needs:

idempotency_key
action_id
workflow_run_id
attempt_number
execution_status
external_reference

and the executor must guarantee safe retry semantics.

21. Composio is useful, but it shouldn't become your domain architecture

Composio is a good integration abstraction.

But your internal architecture shouldn't become:

“Composio does everything.”

Instead create your own canonical action layer:

Adviza Action
   ↓
Provider Adapter
   ↓
Composio / Salesforce API / Google API / etc.

For example:

create_client_note()

send_client_email()

create_calendar_event()

update_crm_contact()

create_task()

Then map those to external tools.

That gives you:

consistent authorization
consistent auditing
consistent idempotency
consistent retries
provider independence
easier future replacement of Composio
22. PM-wise, I would redesign the product around Jobs-to-be-Done

The current PRD is heavily feature-oriented:

model router
workflow canvas
FIX engine
memory
cron workers

Instead, product requirements should begin with outcomes.

For the Lead Advisor:

Job

“Help me prepare for today's client meetings without manually searching five systems.”

Success:

Meeting dossier generated in <2 minutes with citations.

For Associate Advisor:

“Turn a meeting into accurate follow-up actions.”

Success:

95%+ of approved action items correctly extracted and routed.

For CCO:

“Show me why this client communication was generated and who approved it.”

Success:

Complete evidence chain available in <60 seconds.

For Firm Admin:

“Control what AI can access and execute.”

Success:

Every tool/action has explicit permission and policy configuration.

That is much stronger product management.

23. The KPI framework is missing

The PRD needs product KPIs.

I'd track:

Adoption
weekly active advisors
% advisors using AI weekly
workflows per advisor
AI-assisted meetings
Productivity
meeting preparation time saved
follow-up time saved
CRM updates automated
tasks automated
Quality
answer acceptance rate
hallucination/error rate
citation coverage
action correction rate
Automation
workflow completion rate
tool execution success rate
human approval rate
retry rate
Financial
revenue per firm
seats per firm
AI cost / active user
gross margin
expansion rate
Trust
policy violations prevented
unauthorized actions blocked
audit completeness
incident count

Without these, “production verified” doesn't actually tell Product whether the product is working.

24. What I would change in the architecture

I would evolve the current architecture into this:

                    ┌─────────────────────┐
                    │   Next.js Web App   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ API / Auth Gateway  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Tenant + RBAC       │
                    │ Policy Engine       │
                    └──────────┬──────────┘
                               ↓
              ┌────────────────────────────────┐
              │     AI Orchestration Layer     │
              │                                │
              │ Intent → Context → Reasoning  │
              │ → Proposal → Approval         │
              └───────────┬────────────────────┘
                          ↓
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
   ┌────────────┐  ┌────────────┐  ┌──────────────┐
   │ Context    │  │ Model      │  │ Deterministic│
   │ Engine     │  │ Gateway    │  │ Domain Engine│
   └────────────┘  └────────────┘  └──────────────┘
          │               │                │
          ↓               ↓                ↓
      Postgres         LLMs          Portfolio/Rules
      CRM data                        Calculations
      Memory                           Trade validation
                                      Compliance rules
                                              ↓
                                      ┌──────────────┐
                                      │ Action Layer │
                                      └──────┬───────┘
                                             ↓
                                     External providers
                                             ↓
                                      ┌──────────────┐
                                      │ Verification │
                                      └──────┬───────┘
                                             ↓
                                      ┌──────────────┐
                                      │ Audit/Event  │
                                      │ Store        │
                                      └──────────────┘

The crucial addition is:

Policy + deterministic domain services + canonical action layer + evidence/audit architecture.

25. What I would NOT build yet

I would push these down the roadmap:

1. Multi-advisor real-time canvas collaboration

Interesting, but not core to the economic value.

2. Five-model selector exposed prominently to users

Make model routing mostly automatic. Advanced users can access it, but it shouldn't become the product.

3. Full FIX trading

Only after the meeting/workflow product has strong adoption.

4. Massive 150+ connector surface

Start with the five or six integrations that solve the primary workflow.

5. Generic visual workflow canvas

Don't let users build arbitrary agent graphs until the underlying workflow primitives are proven.

26. The product I would actually launch

I'd make V1:

Adviza Advisor OS
Core experience

1. Morning briefing

“Good morning, Pratyush. You have 4 client meetings today. Two have portfolio drift above 5%. Three action items are due today.”

2. One-click meeting dossier

Client
Portfolio
Recent interactions
Open actions
Changes since last meeting
Risks
Suggested agenda
Evidence

3. Meeting → actions

Transcript / notes
       ↓
AI extraction
       ↓
Advisor approval
       ↓
CRM + email + tasks

4. Portfolio intelligence

Not “AI calculates portfolios.”

Instead:

Deterministic portfolio engine
+
AI explanation layer

5. Compliance evidence

Every action gets:

Who
What
When
Why
Source
Model
Policy
Approval
Outcome

That alone could be an extremely compelling product.

27. My priority list for the next revision
P0 — Must fix

Regulatory model

Clarify exactly which regulations apply to which customer types.

Policy engine

Separate authorization/policy from LLM reasoning.

Audit architecture

Turn “WORM” into a genuine tamper-resistant record architecture.

Tenant security

Document tenant isolation and authorization at every layer.

Deterministic financial engine

Remove financial calculation responsibility from LLMs.

Execution safety

Add approval, idempotency, retry, reconciliation and rollback/compensation semantics.

AI provenance

Store evidence and source lineage.

P1 — Strongly recommended

Canonical action layer

Don't expose Composio directly to your business domain.

Observability

OpenTelemetry-style distributed traces, request IDs, workflow IDs, model IDs and tool execution IDs.

Data classification

Public
Internal
Confidential
Client Confidential
Highly Sensitive

and route data/models/tools accordingly.

Model governance

Create a model registry rather than hardcoding model behavior into the router.

P2 — Later

Multi-user canvas collaboration, massive connector ecosystem, advanced autonomous agents, sophisticated model selection UI.

28. Final verdict

I like Adviza considerably more after reading the SRS than I would from the headline “AI OS for wealth management.”

There is a legitimate product here.

The strongest differentiator is not the LLM stack.

It is:

Persistent institutional context + workflow orchestration + human approval + deterministic financial operations + evidence-backed auditability.

That's the moat I'd build.

But I would not yet call the architecture “enterprise production verified.” The documents currently overstate maturity in a few places, particularly around compliance, WORM storage, production custodian connectivity, AI governance, and operational resilience. The PRD itself acknowledges that direct custodian clearing/FIX connectivity remains in development.

The underlying regulatory direction also needs more precise framing: SEC Rule 206(4)-1 is specifically the investment-adviser marketing rule and carries associated Rule 204-2 recordkeeping requirements; it shouldn't be presented as a blanket control framework for every communication or every wealth-management activity.

My recommendation is to keep the current technical foundation, but rewrite the PRD/SRS around a much clearer operating model:

Context → Policy → Reason → Propose → Approve → Execute → Verify → Audit

That should become the architectural spine of Adviza.