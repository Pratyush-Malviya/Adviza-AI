# Adviza AI — PRD Review & Build Resources

*Compiled: August 30, 2026*

---

## 1. PRD Analysis

### What's genuinely strong

**Fiduciary-native positioning is the actual moat.** Most AI-for-advisors tools bolt on compliance as an afterthought. HITL approval gates, WORM audit trails, and SEC 206(4)-1 / FINRA 2210 auditing are first-class citizens in the architecture (§5.1, §4.5) rather than an afterthought. That's the right instinct — CCOs are the real buyers/blockers in RIA sales cycles, and this PRD is clearly written to survive their scrutiny.

**Mem0 as a differentiator is well-executed on paper.** The dual-engine fallback (Mem0 Cloud → self-hosted Gemini+Supabase extraction) is smart risk management — no dependency on a third-party memory vendor's uptime or pricing. The category taxonomy (`preference`, `persona`, `client_context`, `workflow_habit`, `fact`) is genuinely useful for advisor workflows specifically — "Sarah Jenkins targets munis" as a persistent memory is a real differentiator vs. stateless competitors.

**The tech stack choices are coherent, not just trendy.** LangGraph for orchestration + Composio for connectors + Inngest for durable execution is a sensible split of concerns rather than one framework trying to do everything.

---

## 2. What to Fix (priority order)

### #1 — Fix the "GA" framing vs. reality mismatch (biggest risk)
The doc reads like a shipped product, but §9 admits several core pieces are still roadmap items:
- Composio tool execution is a **mock response engine**, not live (Phase 4, unchecked)
- Custodian connectors (Schwab, Fidelity, Pershing) are "**prepared architecture**" — not built
- Inngest background worker execution — not done
- Real Composio OAuth connect for Salesforce FSC/Wealthbox — not done

**Fix:** Add a clear "Current State vs Roadmap" banner at the top, or relabel §4.6 Integrations Hub to separate "Live" from "Planned." If this doc goes in front of a prospect or CCO as-is, the first demo question ("pull my Schwab data") exposes the gap and kills trust. Don't let engineering-complete (Phase 1–3) read as product-complete.

### #2 — Back compliance claims with actual proof, not architecture
"SEC WORM-Compliant Audit Trails" and "Zero LLM Training Policy" are legal-grade claims. Right now they're described as architecture, not verified.

**Fix:** Before this goes into sales collateral, get confirmation (from legal/compliance, not eng) that:
- WORM claim is backed by actual immutability guarantees (not just "we don't allow edits")
- Zero-training policy has a signed enterprise agreement with AWS Bedrock/Google, not just "processed through enterprise endpoints"
- Add a citations/evidence line for each claim, or soften language to "designed for" until verified

### #3 — Model unit economics before pricing ships
$499/mo Growth tier includes 1,000 AI agent executions across dual-LLM (Bedrock Claude 3.5 + Gemini) + Composio + Mem0 Cloud calls.

**Fix:** Run actual cost-per-execution math (token costs × avg workflow complexity × Mem0 API calls) against that price point before it becomes the quoted number to prospects. If margin is thin or negative at scale, fix pricing now, not after signing Enterprise MFOs.

### #4 — Separate internal engineering metrics from buyer-facing ones
"46 production routes," "0 build errors," "100% TypeScript strict" — none of this matters to an RIA buyer or CCO.

**Fix:** Keep §7 for internal/technical audiences (investors, eng leadership). If this PRD gets repurposed into a pitch deck or customer-facing doc, strip these and keep only the 99.95% uptime and SLA numbers — that's what buyers actually evaluate.

### #5 — Tighten roadmap language so it can't be misread as commitments
Phase 4/5 items are written as concrete deliverables (e.g. "Custodian automated trade order generation (Schwab/Fidelity FIX protocol)") without dates or confidence levels.

**Fix:** Add rough timeframes or at minimum a confidence tag (committed / exploratory) per roadmap item — especially anything touching custodian trade execution, since that's a regulatory and liability-heavy claim to leave vague.

---

## 3. Free LLM Models (as of Aug 2026)

Useful as dev/testing fallback options — **not recommended for production** on a fiduciary product where output provenance and uptime matter. Free catalogs can change or disappear without warning, and free tiers typically only offer open-weight models (no GPT, Claude, or Gemini Pro for free).

| Provider | Free Tier | Good for |
|---|---|---|
| **Groq** | 30 req/min, 131K context on `gpt-oss-120b` | Fastest inference, no card required — latency-sensitive chat testing |
| **Google Gemini API** | Current Flash models free, no card required | Fits your existing Gemini fallback path |
| **OpenRouter** | 14 free models, up to 1M context, 50 requests/day | One key, many models — good for A/B testing model quality |
| **Cloudflare Workers AI** | 10,000 Neurons/day | Edge-deployed use cases |
| **Mistral AI** | Free mode, no card required | Decent for compliance-text classification tasks |
| **SambaNova Cloud** | 200,000 tokens/day per model | Higher-volume free dev testing |

**Caveat:** Adviza's PRD already commits to Bedrock Claude 3.5 + Gemini as the paid production gateway. Free tiers should stay dev/testing only — RIA clients won't want compliance-critical outputs coming from a rate-limited free tier that can vanish mid-quarter.

---

## 4. Repos to Strengthen Adviza AI

Matched to the existing stack (LangGraph, Composio, Mem0, canvas-based workflow builder). Use these as **pattern references**, not as new dependencies to bolt on — the current architecture is already coherent; Phase 4 (real Composio execution) should be finished before adding more surface area.

### Orchestration / agents
- **`langchain-ai/langgraph`** — ~33,000 stars, ranks #1 in production-readiness, used by Klarna and Cisco, hit 1.0 GA in early 2026. Already in use — worth pulling newer checkpointing/HITL examples for the sign-off gates.
- **`mem0ai/mem0`** — already in use. Check for pgvector-based semantic recall examples, directly relevant to the Phase 4 roadmap item (embedding-based similarity search).

### Visual workflow builders (canvas/node UX reference)
- **`langflow-ai/langflow`** — 146k stars, visual LangGraph builder — good reference for node/edge UX patterns, marquee-select behavior.
- **`FlowiseAI/Flowise`** — 51k stars, drag-and-drop LLM flow builder — lighter-weight canvas reference than Langflow.

### RAG / document-heavy (compliance doc processing)
- **`deepset-ai/haystack`** — purpose-built for RAG and document processing, handles chunking, embedding, and retrieval as first-class operations. Strong fit for financial reports and internal knowledge bases — could strengthen the Compliance Auditor and Briefing agents.

### Multi-agent patterns
- **`crewAI-inc/crewAI`** — production multi-agent framework, role-based collaboration, async execution, 1500+ company adoptions. Useful reference for the Fiduciary AI Agent Fleet's role separation (Briefing Agent, Compliance Auditor, etc. as distinct roles).

---

## 5. Bottom line

If only one thing gets fixed before this PRD is used externally: **#1 — the GA-vs-roadmap framing.** Everything else is polish; #1 is the difference between a prospect trusting the rest of the document or not.
