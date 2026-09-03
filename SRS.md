# Software Requirements Specification (SRS)
## Adviza AI — Enterprise Fiduciary AI Operating System for Wealth Management

---

### Document Information
- **Document Title**: Software Requirements Specification (SRS) for Adviza AI
- **Document Identifier**: ADV-SRS-2026-V3.6
- **Version**: 3.6 (Executive Multi-Model & Ambient Fiduciary Architecture)
- **Standard Compliance**: IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018
- **Date**: September 3, 2026
- **Status**: Approved / Production Baseline
- **Author**: Adviza AI System Engineering & Fiduciary Architecture Team

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional, external interface, performance, security, and regulatory compliance specifications for **Adviza AI**, an enterprise-grade AI Operating System designed for Registered Investment Advisors (RIAs), Multi-Family Offices, and Wealth Management institutions. 

This document serves as the authoritative technical baseline for engineering implementation, quality assurance validation, security audits, and regulatory compliance examinations (SEC and FINRA).

### 1.2 Scope of the Software
Adviza AI provides an autonomous, multi-agent advisory platform that executes, verifies, and records operational workflows across connected wealth management infrastructure. The software encompasses:

1. **Multi-Model LLM Routing Engine**: Unified orchestration layer interfacing with AWS Bedrock (Claude 3.5 Sonnet v2, Claude 3.5 Haiku), Google Cloud (Gemini 2.5 Flash), and NVIDIA NIM (Moonshot Kimi-k3, DeepSeek V3) with dynamic streaming, automatic failover, and token consumption metering.
2. **Live Database Context Ingestion**: Real-time extraction and injection of relational state (account ownership, firm AUM, active workflows, meeting schedules, open action items, integration statuses, and audit records) into model prompts to prevent hallucinations.
3. **Executive Ergonomic Interface**: Distraction-free, responsive Next.js 16 interface with elevated floating input, execution toggles (*Think Longer*, *Deep Research*, *Web Search*), and 2x2 curated wealth management action cards.
4. **Autonomous Inngest Cron Workers**: Scheduled background agents performing portfolio drift audits, pre-meeting executive dossier generation, and weekly regulatory packaging.
5. **Composio Tool Execution Gateway**: Real-time bidirectional execution gateway interfacing with 150+ enterprise SaaS connectors (Gmail, Google Calendar, Slack, Salesforce FSC).
6. **Custodian FIX Protocol 4.4/5.0 Engine**: Electronic trading engine generating and inspecting Financial Information eXchange (FIX) order batches with simulated fill executions for Charles Schwab, Fidelity Wealth, and BNY Mellon Pershing.
7. **WORM Regulatory Compliance Engine**: Write-Once-Read-Many immutable audit trail architecture with cryptographic SHA-256 sealing for SEC Rule 204-2 and FINRA Rule 2210 export compliance.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term / Acronym | Full Definition | Context in Adviza AI |
| :--- | :--- | :--- |
| **AUM** | Assets Under Management | Aggregate market value of client assets managed by the advisory firm. |
| **CCO** | Chief Compliance Officer | The executive responsible for supervising regulatory adherence within an RIA. |
| **Composio** | Tool Integration Gateway | Unified enterprise middleware managing OAuth tokens and tool calls. |
| **FIX** | Financial Information eXchange | Industry-standard messaging protocol (FIX 4.4 / 5.0) for electronic trade routing. |
| **HITL** | Human-in-the-Loop | Mandatory gate requiring explicit advisor sign-off before trade or email dispatch. |
| **Inngest** | Event-Driven Workflow Engine | Durable background execution framework powering scheduled autonomous workers. |
| **Mem0** | Semantic Memory Layer | Hybrid pgvector storage system tracking long-term advisor preferences and facts. |
| **NIM** | NVIDIA Inference Microservice | Optimized enterprise runtime delivering ultra-low-latency model inference. |
| **RIA** | Registered Investment Advisor | An investment advisory firm registered under the Investment Advisers Act of 1940. |
| **RLS** | Row-Level Security | PostgreSQL database security enforcing strict multi-tenant data isolation. |
| **SSE** | Server-Sent Events | Unidirectional HTTP streaming protocol delivering token streams to the browser. |
| **TTFT** | Time-To-First-Token | Metric measuring the latency from user query submission to initial streamed token. |
| **WORM** | Write-Once-Read-Many | Immutable storage policy prohibiting modification or deletion of compliance records. |

### 1.4 References
- **IEEE Std 830-1998**: IEEE Recommended Practice for Software Requirements Specifications.
- **ISO/IEC/IEEE 29148:2018**: Systems and software engineering — Life cycle processes — Requirements engineering.
- **SEC Rule 204-2**: Books and Records Requirements for Registered Investment Advisers.
- **SEC Rule 206(4)-1**: Investment Adviser Marketing Rule (Performance, Testimonials, Endorsements).
- **FINRA Rule 2210**: Communications with the Public (Approval, Review, Recordkeeping).
- **FIX Protocol 4.4/5.0 Specification**: FIX Trading Community Electronic Messaging Standard.
- **RFC 7519**: JSON Web Token (JWT) Standard.
- **RFC 8446**: The Transport Layer Security (TLS) Protocol Version 1.3.

---

## 2. Overall Description

### 2.1 Product Perspective & Context
Adviza AI operates at the intersection of advisory relationship management, custodial portfolio administration, and regulatory compliance. It does not replace custodial clearing firms or core CRMs; rather, it acts as an intelligent operating system orchestrating actions across them.

```
+-----------------------------------------------------------------------------------+
|                                  ADVIZA AI OS                                     |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                       Next.js 16 Executive Web UI                         |   |
|   |   - Multi-Model Selector (Claude, Gemini, Kimi, DeepSeek)                 |   |
|   |   - Floating Prompt Interface (Think Longer / Deep Research / Web)        |   |
|   |   - 2x2 Curated Wealth Actions (Drift, Dossiers, Tasks, Workflows)        |   |
|   +---------------------------------------------------------------------------+   |
|                                         | SSE / JSON                              |
|   +-------------------------------------+-------------------------------------+   |
|   |                         API & Orchestration Core                          |   |
|   |   - Multi-Model LLM Gateway (Bedrock, NIM, Google Cloud)                  |   |
|   |   - Live Supabase Relational Context Ingestor                             |   |
|   |   - Mem0 Hybrid pgvector (768-dim + BM25)                                 |   |
|   |   - LangGraph 6-Node Fiduciary State Graph (HITL Enforcement)             |   |
|   +---------------------------------------------------------------------------+   |
|            |                        |                       |                     |
+------------+------------------------+-----------------------+---------------------+
             |                        |                       |
             v                        v                       v
+-----------------------+  +--------------------+  +--------------------+
|  Connected SaaS Apps  |  |  Custodial Fix GW  |  |  Regulatory Vault  |
|  - Google Workspace   |  |  - Charles Schwab  |  |  - WORM Audit Logs |
|  - Salesforce FSC     |  |  - Fidelity Wealth |  |  - SHA-256 Hashes  |
|  - Slack Enterprise   |  |  - BNY Pershing    |  |  - FINRA 2210 PDF  |
+-----------------------+  +--------------------+  +--------------------+
```

### 2.2 User Classes and Characteristics

| User Class | Technical Competency | System Rights | Primary Interaction Modality |
| :--- | :--- | :--- | :--- |
| **Lead Advisor / Owner** | Moderate | Full read/write; account billing; HITL trade approval | Executive chat; natural conversational commands; meeting briefs |
| **Associate Advisor** | Moderate to High | Portfolio rebalance generation; client notes; CRM updates | Workflow builder; FIX generation; client dossier review |
| **Chief Compliance Officer** | Moderate | Audit trail inspection; compliance policy configuration; export | Compliance log explorer; FINRA 2210 cryptographic exporter |
| **Firm Administrator** | High | API connector setup; user seat provisioning; billing | Settings dashboard; Composio integration configuration |

### 2.3 Operating Environment
- **Client Side**: Modern evergreen web browsers (Chromium 120+, Safari 17+, Firefox 125+) on Windows, macOS, iOS, and Android.
- **Edge / Frontend Server**: Vercel Serverless Edge Runtime running Next.js 16.3.3 with Turbopack bundler and React 19.
- **Backend API Gateway**: Fastify 5.x on Node.js 22 LTS containerized via Docker on AWS ECS Fargate (us-east-1).
- **Database & Identity**: Supabase Managed PostgreSQL 15+ with `pgvector` extension and Supabase GoTrue Auth.
- **AI Runtimes**: AWS Bedrock (us-east-1), Google Generative Language API (v1beta), NVIDIA NIM Enterprise API.

### 2.4 Design and Implementation Constraints
1. **Ponytail Minimalist Architecture**: Adhere strictly to the 7-Rung Ladder (YAGNI -> Codebase Reuse -> Stdlib -> Native Platform -> Existing Dependencies -> One-Liner -> Minimal Code). Avoid speculative boilerplate.
2. **Strict Type Safety**: All source files must compile with zero TypeScript errors (`tsc --noEmit` and `next build` exit code 0).
3. **WORM Immutability**: The `audit_logs` table must disallow `UPDATE` and `DELETE` queries at the database engine level via PostgreSQL RLS policies.
4. **Zero AI Training Policy**: No client data, portfolio values, or transcripts may be submitted to public model training queues.

---

## 3. External Interface Requirements

### 3.1 User Interfaces

#### 3.1.1 Executive Chat Starter Workspace
- **Header Badge**: Minimalist obsidian-and-bronze emblem with amber sparkle indicator.
- **Heading**: Single-line executive title *"How can Adviza assist you today?"* with concise subtitle *"Real-time portfolio intelligence, automated workflows, and meeting dossiers."*
- **Elevated Prompt Box**:
  - Borderless, clean text area with placeholder reflecting active model.
  - Action row containing file attachment trigger, execution toggles, voice mic, and elevated obsidian send button.
  - Real-time preview tags for attached images (`image/*`) and documents (`application/pdf`).
- **2x2 Curated Wealth Management Actions**:
  - `Portfolio Drift`: Executes benchmark drift audit.
  - `Meeting Dossier`: Pre-compiles notes and holdings for upcoming reviews.
  - `Action Items`: Displays open fiduciary tasks sorted by priority.
  - `Active Workflows`: Reports execution status of automated pipelines.

#### 3.1.2 Active Chat Stream Interface
- **Model Attribution**: Displays active model badge (e.g. `Claude 3.5 Sonnet`, `Google Gemini 2.5 Flash`, `Moonshot Kimi-k3`, `DeepSeek V3`).
- **Reasoning Stepper**: Collapsible `<WorkflowProgressStepper />` displaying real-time node orchestration (`Planning...`, `Validating Connectors...`, `Synthesizing...`).
- **Docked Input Bar**: Pinned to the bottom viewport with full parity to hero input controls.

### 3.2 Hardware Interfaces
No direct custom hardware interfaces required. Hardware acceleration for client-side rendering is handled via browser WebGL/CSS3 transforms.

### 3.3 Software Interfaces

| Interface Target | Communication Protocol | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| **Supabase Postgres** | PostgreSQL Wire / REST PostgREST | Primary persistence, vector storage, RLS | Service Role JWT / User Bearer Token |
| **AWS Bedrock** | HTTPS / AWS Signature V4 | Claude 3.5 Sonnet v2 and Haiku inference | AWS IAM Access Key & Secret |
| **Google Generative AI** | HTTPS / REST v1beta | Gemini 2.5 Flash multimodal inference | Google Cloud API Key |
| **NVIDIA NIM** | HTTPS / OpenAI Compatible REST | Moonshot Kimi-k3 & DeepSeek V3 inference | Bearer Token (`Bearer nvapi-...`) |
| **Composio v3** | HTTPS / REST | 150+ Tool Execution & OAuth Management | Composio API Key |
| **Inngest** | HTTPS / Inngest SDK Event Bus | Asynchronous cron worker dispatch | Inngest Event Key & Signing Key |
| **Stripe API** | HTTPS / REST | Subscription billing, usage metering, checkout | Stripe Secret Key & Webhook Secret |

### 3.4 Communications Interfaces
- **HTTPS**: Enforce TLS 1.3 across all incoming and outgoing connections.
- **Server-Sent Events (SSE)**: Standardized stream formatted as `data: {"text": "..."}\n\n` with terminating `data: [DONE]\n\n`.
- **FIX Protocol**: Standard tag-value syntax (`Tag=Value\x01`) over TCP or simulated REST bridge.

---

## 4. System Features & Functional Requirements

### 4.1 Feature 1: Multi-Model LLM Routing Engine (SRS-FR-01)

#### 4.1.1 Description
The system shall provide dynamic routing across 5 enterprise LLM models tailored for wealth management tasks.

#### 4.1.2 Functional Requirements
- **FR-01.1 Model Selection**: The user shall be able to select from 5 models via the UI dropdown:
  - `claude-3-5-sonnet` (Claude 3.5 Sonnet v2 — AWS Bedrock)
  - `gemini-2.5-flash` (Google Gemini 2.5 Flash — Google Cloud)
  - `moonshot-kimi-k3` (Moonshot Kimi-k3 — NVIDIA NIM)
  - `claude-3-5-haiku` (Claude 3.5 Haiku — AWS Bedrock)
  - `deepseek-v3` (DeepSeek V3 — NVIDIA NIM)
- **FR-01.2 Streaming Protocol**: Model responses must be streamed to the client using Server-Sent Events (SSE) with Time-To-First-Token (TTFT) < 1,500ms.
- **FR-01.3 Timeout & Fallback Cascading**:
  - If Moonshot Kimi-k3 or DeepSeek V3 fails to respond within 3,500ms, the system shall automatically fall back to AWS Bedrock Claude 3.5 Sonnet v2.
  - The fallback transition must be completely transparent to the user and recorded in the audit log.
- **FR-01.4 Token Accounting & Multipliers**:
  - Each model execution shall deduct credits according to established multipliers:
    - Sonnet v2: 1.5x
    - Gemini 2.5 Flash: 1.0x
    - DeepSeek V3: 1.0x
    - Moonshot Kimi-k3: 0.8x
    - Haiku: 0.5x

---

### 4.2 Feature 2: Live Enterprise Database Context Ingestion (SRS-FR-02)

#### 4.2.1 Description
Before any user prompt is sent to an LLM, the backend shall query Supabase to extract live relational state and compile a structured context block.

#### 4.2.2 Functional Requirements
- **FR-02.1 Parallel Ingestion**: The system shall execute queries across 8 tables simultaneously via `Promise.allSettled()`:
  - `profiles`: User ID, full name, email, advisory role (`owner`, `advisor`, `paraplanner`).
  - `firms`: Firm ID, firm legal name, plan tier, meeting allocation usage.
  - `clients`: Total client count, portfolio value per client, risk profiles, investment goals.
  - `workflows`: Active automated workflow count, names, triggers, run counts.
  - `workflow_runs`: Recent execution history with status (`pending`, `running`, `success`, `failed`).
  - `meetings`: Upcoming reviews filtered by `scheduled_at`, meeting title, client ID.
  - `action_items`: Open fiduciary tasks filtered by `status = 'open'`, priority, due dates.
  - `firm_connections`: Connected third-party integrations, app slugs, status (`CONNECTED`).
  - `audit_logs`: Most recent 8 actions executed in the account.
- **FR-02.2 AUM Calculation**: The system shall aggregate total AUM by summing `portfolio_value` across all firm clients.
- **FR-02.3 Prompt Injection**: The aggregated data shall be injected into the LLM system prompt under `### Live Enterprise Account Context`.
- **FR-02.4 Zero Speculation**: The LLM prompt shall strictly mandate that the model cite live records and refuse to speculate or fabricate client details.

---

### 4.3 Feature 3: Natural Conversational Personality & Tone (SRS-FR-03)

#### 4.3.1 Description
The assistant shall exhibit a natural, professional tone matching an elite executive Chief of Staff.

#### 4.3.2 Functional Requirements
- **FR-03.1 Human Assistant Feel**: The assistant shall greet advisors by first name, cite their firm, and provide natural, conversational responses rather than robotic pre-canned templates.
- **FR-03.2 Outcome-Focused Communication**: Responses shall emphasize concrete results, actions taken, and links to generated deliverables ("Done. Rebalanced portfolio according to target 60/40 model.").
- **FR-03.3 Model-Specific System Directives**:
  - Sonnet v2: Emphasize institutional fiduciary rigor and suitability standards.
  - Gemini 2.5 Flash: Emphasize multimodal data synthesis and velocity.
  - DeepSeek V3: Emphasize mathematical drift calculations and tax-loss harvesting.
  - Kimi-k3: Deliver rapid, high-density executive briefings.

---

### 4.4 Feature 4: Interactive Thought Execution Modes (SRS-FR-04)

#### 4.4.1 Description
Advisors can toggle specialized execution parameters directly inside the prompt container.

#### 4.4.2 Functional Requirements
- **FR-04.1 Think Longer (Deep Reasoning)**:
  - When enabled, appends deep chain-of-thought instructions requesting the model to evaluate multi-step trade-offs and edge cases.
- **FR-04.2 Deep Research (Evidence Synthesis)**:
  - When enabled, directs the assistant to cross-examine historical meeting notes, CRM communications, and portfolio holdings before rendering judgment.
- **FR-04.3 Live Web Search**:
  - When enabled, grounds responses in real-time market data, SEC regulatory releases, or financial news.

---

### 4.5 Feature 5: Custodian FIX Protocol 4.4/5.0 Rebalancing (SRS-FR-05)

#### 4.5.1 Description
The system shall generate and simulate electronic trading orders adhering to the FIX 4.4 protocol.

#### 4.5.2 Functional Requirements
- **FR-05.1 Tag-Value Generation**: The system shall generate valid FIX messages containing:
  - Tag 8: `FIX.4.4`
  - Tag 35: `D` (New Order Single)
  - Tag 49: SenderCompID (e.g. `ADVIZA_RIA`)
  - Tag 56: TargetCompID (`SCHW_FIX_GW`, `FID_FIMS_GW`, `PERSHING_NETX_GW`)
  - Tag 11: Unique `ClOrdID` (UUID format)
  - Tag 55: Ticker Symbol
  - Tag 54: Side (`1` = Buy, `2` = Sell)
  - Tag 38: Order Quantity
  - Tag 40: Order Type (`1` = Market, `2` = Limit)
  - Tag 10: 3-digit calculated modulo-256 checksum
- **FR-05.2 Human-in-the-Loop (HITL) Gate**: Under FINRA Rule 3110 (Supervision), no trade batch shall be transmitted without explicit advisor confirmation.
- **FR-05.3 Execution Confirmation**: The simulator shall emit `MsgType=8` (Execution Report) confirming simulated order fills.

---

### 4.6 Feature 6: Autonomous Inngest Scheduled Workers (SRS-FR-06)

#### 4.6.1 Description
Autonomous cron workers running via Inngest shall execute scheduled operations without requiring advisor initiation.

#### 4.6.2 Functional Requirements
- **FR-06.1 Nightly Drift Audit (`0 10 * * 1-5`)**: Runs at 6:00 AM EST Mon–Fri; scans all client portfolios and flags asset drift exceeding 5.0%.
- **FR-06.2 Morning Meeting Briefing (`30 11 * * 1-5`)**: Runs at 7:30 AM EST Mon–Fri; identifies meetings scheduled for today and generates client briefing dossiers.
- **FR-06.3 Weekly FINRA Compliance Package (`0 21 * * 5`)**: Runs at 5:00 PM EST Fridays; packages all weekly activity into a cryptographically sealed compliance bundle.

---

### 4.7 Feature 7: WORM Regulatory Audit & Cryptographic Seal (SRS-FR-07)

#### 4.7.1 Description
Provides immutable, tamper-evident audit logs and verifiable document exports for SEC and FINRA examinations.

#### 4.7.2 Functional Requirements
- **FR-07.1 WORM Immutability**: All records inserted into `audit_logs` must be permanent. The database shall reject any `UPDATE` or `DELETE` commands on this table.
- **FR-07.2 SHA-256 Digest Generation**: Exported documents (PDF and HTML) must include a calculated SHA-256 cryptographic digest printed on the header and embedded in metadata.
- **FR-07.3 Hash Verification**: The system shall provide an endpoint `/v1/compliance/verify-hash` allowing compliance officers to verify document authenticity.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance Requirements
- **NFR-P1**: Time-To-First-Token (TTFT) shall not exceed:
  - 800ms for Claude 3.5 Haiku and Gemini 2.5 Flash.
  - 1,500ms for Claude 3.5 Sonnet v2.
- **NFR-P2**: Live database context extraction must complete in under 150ms.
- **NFR-P3**: The web application shall achieve a Google Lighthouse Performance Score >= 95.

### 5.2 Security & Privacy Requirements
- **NFR-S1**: All data at rest shall be encrypted using AES-256.
- **NFR-S2**: All data in transit must require TLS 1.3.
- **NFR-S3**: Secrets, API keys, and private credentials must never be committed to git, logged to stdout, or exposed to the client.
- **NFR-S4 Zero-Training Guarantee**: All LLM interactions must be routed through enterprise zero-retention endpoints with signed Business Associate Agreements.

### 5.3 Reliability & Availability
- **NFR-R1**: The API gateway shall maintain 99.9% uptime (excluding scheduled maintenance windows).
- **NFR-R2 Automatic Failover**: Failure of any individual model provider must trigger automatic fallback to AWS Bedrock within 3,500ms.

---

## 6. Data Requirements & Database Schema

### 6.1 Entity Relationship Overview
The system relies on 12 core relational entities managed under Supabase PostgreSQL:

```
[firms] 1 --- * [profiles] (advisors/staff)
   |
   +--------- * [clients] 1 --- * [meetings]
   |             |                   |
   |             +--- * [action_items]
   |
   +--------- * [workflows] 1 --- * [workflow_runs]
   |
   +--------- * [firm_connections]
   |
   +--------- * [audit_logs] (WORM Immutable)
   |
   +--------- * [chat_sessions] 1 --- * [chat_messages]
   |
   +--------- * [user_memories] (pgvector 768-dim)
```

### 6.2 Table Specifications

#### 6.2.1 `audit_logs` (WORM Compliance Table)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Enforcement: Allow INSERT and SELECT; Disallow UPDATE and DELETE
CREATE POLICY "audit_logs: insert only" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_logs: read firm only" ON audit_logs FOR SELECT USING (firm_id = get_my_firm_id());
```

#### 6.2.2 `meetings`
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    meeting_type TEXT DEFAULT 'annual_review',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    briefing JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 6.2.3 `action_items`
```sql
CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium', -- 'high' | 'medium' | 'low'
    status TEXT NOT NULL DEFAULT 'open',     -- 'open' | 'in-progress' | 'completed' | 'cancelled'
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. Verification & Traceability Matrix

| Requirement ID | Module / Component | Verification Method | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **SRS-FR-01** | Multi-Model LLM Router | Automated Integration Test (`scripts/test-all-models.mjs`) | All 5 models return status 200 with valid streamed tokens. |
| **SRS-FR-02** | Live Database Context | Integration Test (`scripts/test-natural-chat.mjs`) | Context block contains live user name, AUM, and open action items. |
| **SRS-FR-03** | Conversational Persona | Evaluation Benchmark | Responses open with personalized greeting and zero robotic boilerplate. |
| **SRS-FR-04** | Execution Toggles | Unit / UI Test | Payload includes `thinkLonger`, `deepResearch`, and `webSearch` flags. |
| **SRS-FR-05** | FIX 4.4 Engine | Checksum & Tag Validator | Emitted FIX message passes Modulo-256 checksum and tag structure. |
| **SRS-FR-06** | Inngest Scheduled Workers | Simulated Inngest Event Test | Cron functions trigger successfully and record audit entries. |
| **SRS-FR-07** | WORM Audit Integrity | PostgreSQL Security Test | Attempts to execute `UPDATE` or `DELETE` on `audit_logs` fail with permission error. |
| **NFR-S1/S2** | TLS & Encryption | Security Scan (A+ SSL Labs) | TLS 1.3 enforced; AES-256 verified at rest. |
| **NFR-Build** | Next.js 16 Build Engine | CLI Command (`npm run build`) | Exits with code 0; 0 TypeScript errors; 30/30 pages static generated. |

---

### Document Sign-off
- **Lead Software Architect**: Adviza Engineering Lead
- **Head of Regulatory Compliance**: Chief Compliance Officer (RIAs)
- **Product Management**: Director of Wealth Management Systems
