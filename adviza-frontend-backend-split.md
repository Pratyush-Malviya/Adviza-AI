# Adviza AI — Frontend/Backend Separation Plan

## Context

Adviza AI is currently a single Next.js 16 (App Router) monorepo where frontend pages and backend logic (`/api/*` route handlers, LangGraph orchestration, Bedrock/Gemini gateway, Mem0 engine, Composio dispatch, Inngest jobs, Stripe webhooks) live together. This plan splits it into two independently deployable services:

- **Frontend**: Next.js app, UI only, no server logic.
- **Backend**: standalone API service that owns all business logic, AI orchestration, DB access, and third-party integrations.

Target end state:

```
adviza-frontend/     → Next.js 16, deployed to Vercel/Netlify, talks to backend via HTTPS
adviza-backend/      → NestJS (or Fastify) API, deployed to AWS (ECS Fargate / Lambda), owns Supabase, Bedrock, Mem0, Composio, Inngest, Stripe
```

---

## Phase 0 — Prep (no breaking changes yet)

- [ ] Create a new empty repo `adviza-backend`.
- [ ] Inventory every route under `app/api/**/route.ts` in the current repo and note: HTTP method, auth requirements, DB tables touched, external services called (Bedrock, Composio, Mem0, Stripe, Resend, Inngest).
- [ ] Inventory every server-only module currently imported by API routes (LangGraph nodes, Mem0 extraction engine, Composio dispatcher, compliance auditor, etc.) — these move wholesale into the backend.
- [ ] Confirm which env vars are server-only (`MEM0_API_KEY`, `COMPOSIO_API_KEY`, AWS Bedrock creds, `STRIPE_SECRET_KEY`, etc.) vs. client-safe (`NEXT_PUBLIC_*`, Supabase anon key). Server-only vars move to the backend; frontend keeps only client-safe ones.

---

## Phase 1 — Scaffold the backend

- [ ] Initialize `adviza-backend` with NestJS (recommended — its module structure maps cleanly to your existing agent fleet) or Fastify if you want something lighter.
- [ ] Set up module folders that mirror the PRD's functional modules:
  - `chat/` — LangGraph orchestration (Intent Planner → Tool Executor → Synthesizer → Audit)
  - `memory/` — Mem0 dual-engine (Cloud API + Supabase extraction)
  - `agents/` — briefing agent, meeting intelligence, compliance auditor, rebalance evaluator, HITL gate
  - `workflows/` — visual workflow CRUD + AI workflow generator + Inngest execution
  - `integrations/` — Composio OAuth connect/dispatch, CRM connectors
  - `billing/` — Stripe checkout, portal, webhooks
  - `documents/` — PDF/HTML export engine
  - `auth/` — Supabase JWT verification middleware (validates tokens issued by Supabase auth, doesn't replace it)
- [ ] Set up Supabase client in the backend using the **service role key** (not anon key) since the backend now owns all writes.
- [ ] Port your 8 core tables' access logic (`firms`, `profiles`, `clients`, `meetings`, `action_items`, `audit_logs`, `chat_sessions`/`chat_messages`, `workflows`/`workflow_runs`, `firm_connections`, `user_memories`) into repository/service classes.

---

## Phase 2 — Move logic route by route

For each endpoint in the PRD's API reference table, move it from `app/api/.../route.ts` into the matching NestJS controller/service:

| Old Next.js route | New backend endpoint |
|---|---|
| `POST /api/ai/chat-orchestrate` | `chat` module |
| `GET/POST/DELETE /api/ai/chat-sessions` | `chat` module |
| `GET/POST/DELETE /api/ai/memory` | `memory` module |
| `POST /api/ai/briefing` | `agents` module |
| `POST /api/ai/meeting-intelligence` | `agents` module |
| `POST /api/ai/compliance` | `agents` module |
| `POST /api/ai/workflow-generate` | `workflows` module |
| `POST /api/ai/workflow-enhance-prompt` | `workflows` module |
| `POST /api/documents/export` | `documents` module |
| `POST /api/integrations/composio/connect` | `integrations` module |
| `GET /api/integrations/composio/connections` | `integrations` module |
| `POST /api/emails/follow-up` | `chat` or new `communication` module |
| `POST /api/stripe/checkout` | `billing` module |
| `POST /api/stripe/portal` | `billing` module |
| `POST /api/workflows`, `/api/workflows/[id]`, `/api/workflows/[id]/run` | `workflows` module |

Do this incrementally — one module at a time, testing each in isolation with Postman/Insomnia before moving to the next. Don't try to cut the whole backend over in one go.

- [ ] Version the API from day one: prefix all routes with `/v1/`.
- [ ] Add CORS config allowing only the frontend's origin(s).
- [ ] Add a Supabase JWT-verification guard so backend endpoints check the bearer token issued by Supabase auth on every request.

---

## Phase 3 — Cut the frontend over

- [ ] Add `NEXT_PUBLIC_API_URL` env var to the frontend pointing at the new backend.
- [ ] Create a thin API client wrapper (`lib/api.ts`) that attaches the Supabase session token as a bearer header and calls the backend.
- [ ] Replace every `fetch('/api/...')` call in the frontend with `apiClient.post('/v1/...')` etc.
- [ ] Keep Supabase client-side usage limited to **auth only** (sign in/out, session refresh). All data reads/writes go through the backend from here on — do not query Supabase tables directly from the frontend anymore, even though RLS would technically allow it, since business logic (memory injection, compliance checks, audit logging) needs to run server-side consistently.
- [ ] Delete `app/api/**` from the frontend repo once every route has a confirmed working backend equivalent and the frontend has been repointed.

---

## Phase 4 — Local dev & deployment

- [ ] Local dev: run frontend on `:3000`, backend on `:4000`. Either set `NEXT_PUBLIC_API_URL=http://localhost:4000` directly, or add a Next.js rewrite in `next.config.js` so `/api/*` proxies to `localhost:4000` and existing frontend code needs zero changes:
  ```js
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:4000/v1/:path*' }]
  }
  ```
- [ ] Backend deployment target: AWS ECS Fargate (simplest for a long-running NestJS app with Inngest workers) or AWS Lambda (if you containerize with a Lambda adapter — cheaper at low traffic, but watch cold starts for the LangGraph orchestration path).
- [ ] Since Bedrock already lives in AWS, deploying the backend in AWS too keeps Bedrock calls in-region, avoids cross-cloud latency, and simplifies IAM (backend's ECS task role can assume Bedrock invoke permissions directly instead of long-lived API keys).
- [ ] Frontend deployment stays on Vercel/Netlify, unchanged.
- [ ] Point Stripe, Composio, and Resend webhook URLs at the new backend's public URL once it's live.

---

## Phase 5 — Cleanup & verification

- [ ] Remove server-only env vars from the frontend's deployment config entirely.
- [ ] Confirm Supabase RLS policies still correctly scope by `firm_id` now that the backend (service role) is the sole writer — service role bypasses RLS by default, so **application-level firm_id scoping in every backend query is now mandatory**, not just a DB-level safety net.
- [ ] Load-test the split: chat orchestration round-trip should still hit the <2.0s memory recall / <3.5s workflow generation SLAs from the PRD, now with an added network hop between frontend and backend.
- [ ] Update the PRD's architecture diagram (Section 3) to reflect the two-service topology.

---

## Notes for the coding agent running this

- Do the migration module-by-module (Phase 2 table), not all at once — verify each moved endpoint against its old behavior before deleting the original.
- Preserve the existing LangGraph 6-node state graph (Intent → Validator → HITL → Executor → Synth → Audit) exactly as-is when porting; this is core orchestration logic, not glue code.
- Preserve WORM audit logging behavior (`audit_logs` table, immutable timestamps) — every migrated endpoint that currently writes an audit entry must keep doing so in the backend.
- Do not change the Mem0 dual-engine fallback logic (Cloud API vs. native Supabase extraction) during the move — port it as-is, refactor later if needed.
