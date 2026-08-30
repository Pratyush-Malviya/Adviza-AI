# Adviza AI — Unit Economics & Cost-Per-Execution Model

*Internal Strategic Analysis & Pricing Validation*
*Compiled: August 2026*

---

## 1. Executive Summary

This document provides a transparent unit economics model for Adviza AI's execution pipeline across LLM token consumption, memory engine operations, connector proxies, and database operations.

Based on current real-world pricing:
- **Average Cost per Standard Chat Turn (Gemini 3.6 Flash)**: ~$0.0008
- **Average Cost per Tool Execution (Gemini + Composio)**: ~$0.0078
- **Average Cost per Complex Multi-Agent Run (Claude 3.5 Sonnet + Mem0 + Composio)**: ~$0.0468
- **Growth RIA Tier ($499/mo, 1,000 executions)**: **~92% Gross Margin** (assuming typical blended workload)
- **Enterprise Multi-Family Office Tier ($1,499/mo, 5,000 executions)**: **~87% Gross Margin**

---

## 2. Infrastructure Cost Components

| Layer | Provider / Model | Unit Cost Rate |
| :--- | :--- | :--- |
| **Primary LLM** | Google Gemini 3.6 Flash | $0.10 / 1M Input Tokens<br>$0.40 / 1M Output Tokens |
| **High-Fidelity Compliance LLM** | Anthropic Claude 3.5 Sonnet v2 (via AWS Bedrock) | $3.00 / 1M Input Tokens<br>$15.00 / 1M Output Tokens |
| **Long-Term Memory** | Mem0 Cloud API / Native Supabase Extraction | ~$0.0010 per memory retrieval<br>~$0.0010 per extraction turn |
| **Connector Tool Proxy** | Composio Gateway (Connected App Action) | ~$0.0050 per tool execution |
| **Database & Vector Search** | Supabase PostgreSQL + pgvector | Fixed monthly tier ($25/mo Pro base) |
| **Transactional Email** | Resend Email API | $0.0010 per dispatched email |

---

## 3. Per-Execution Archetype Breakdown

### Archetype A: Conversational Intelligence (General Advisory Q&A)
*Advisor asks about a financial concept, platform guidance, or client overview.*
- **LLM Pipeline**: Intent Planner (Gemini Flash) + Synthesizer (Gemini Flash)
- **Token Usage**: ~1,800 input tokens, ~450 output tokens
- **Memory Ops**: 1 semantic recall query ($0.001)
- **Total Estimated Cost**: **$0.0014 per turn**

### Archetype B: Standard Tool Orchestration (Document / Sheet Generation)
*Advisor asks to create a lead pipeline, update client note, or search calendar.*
- **LLM Pipeline**: Intent Planner (Gemini Flash) + Synthesizer (Gemini Flash)
- **Token Usage**: ~2,500 input tokens, ~800 output tokens
- **Composio Dispatch**: 1 action ($0.0050)
- **Memory Ops**: 1 recall + 1 background extraction ($0.0020)
- **Total Estimated Cost**: **$0.0076 per execution**

### Archetype C: Full Fiduciary Fleet Workflow (Pre-Meeting Dossier + Compliance Audit)
*Advisor generates full pre-meeting dossier, risk audit, and compliance retention packet.*
- **LLM Pipeline**: Bedrock Claude 3.5 Sonnet v2 (Deep Reasoning & Suitability Check)
- **Token Usage**: ~4,500 input tokens, ~2,200 output tokens
- **Composio Dispatch**: 1 action ($0.0050)
- **Memory Ops**: 1 recall + 1 background extraction ($0.0020)
- **Total Estimated Cost**: **$0.0535 per execution**

---

## 4. Subscription Tier Margin Validation

### 1. Starter RIA (Free 14-Day Trial)
- **Cap**: 50 executions / month
- **Max Cost to Platform**: 50 × $0.0535 = **$2.68 per trial**
- **CAC Impact**: Extremely low infrastructure cost per acquired RIA lead.

### 2. Growth RIA ($499 / month)
- **Allowance**: 1,000 AI agent executions / month
- **Blended Usage Distribution**:
  - 60% Archetype A / B ($0.005 avg × 600) = $3.00
  - 40% Archetype C ($0.0535 × 400) = $21.40
  - Total Monthly Infrastructure COGS: **$24.40**
- **Gross Margin**: `($499 - $24.40) / $499` = **95.1%** (Worst-case all-Claude: **89.3%**)

### 3. Enterprise Multi-Family Office ($1,499+ / month)
- **Allowance**: 5,000 AI agent executions / month (Fair Use baseline)
- **Blended Usage Distribution**:
  - 50% Standard Tool Runs (2,500 × $0.0076) = $19.00
  - 50% Full Compliance Workflows (2,500 × $0.0535) = $133.75
  - Dedicated Supabase/VPC Overhead = $50.00
  - Total Monthly Infrastructure COGS: **$202.75**
- **Gross Margin**: `($1,499 - $202.75) / $1,499` = **86.5%**

---

## 5. Cost Guardrails & Risk Mitigations

1. **Intelligent Model Routing**: The LangGraph router defaults to Gemini 3.6 Flash for intent parsing, tool routing, and lightweight formatting, reserving Claude 3.5 Sonnet strictly for deep compliance audits and complex fiduciary briefings.
2. **Memory Extraction Debouncing**: Memory extraction runs asynchronously in the background and only triggers if new factual statements or preferences are identified in the turn.
3. **Composio Response Caching**: Static metadata and schema catalogs are cached for 1 hour (`revalidate: 3600`), eliminating redundant catalog queries.
