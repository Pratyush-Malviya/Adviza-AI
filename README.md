# WealthPilot AI

An AI Execution Workspace for Wealth Management Advisors — built on Next.js, Supabase, and Amazon Bedrock.

## Features

- **Client Briefing Agent** — Auto-generates structured meeting briefing packs from CRM + portfolio data
- **Meeting Intelligence Agent** — Transcribes meetings, extracts action items, drafts follow-up emails
- **Compliance & Audit Agent** — Maintains suitability notes and audit trails automatically
- **Human-in-the-loop approvals** — Advisors review all AI outputs before sending
- **Enterprise-grade security** — Supabase RLS, multi-tenant data isolation

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **AI/LLM**: Amazon Bedrock (Claude 3.5 Sonnet) via AWS SDK
- **Database**: Supabase (PostgreSQL + pgvector + RLS)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **Payments**: Stripe
- **Background Jobs**: Inngest
- **Deployment**: Vercel

## Getting Started

1. Clone the repo
2. Copy `.env.local` and fill in your credentials
3. Run Supabase migrations: `supabase db push`
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`

## Environment Variables

See `.env.local` for all required environment variables.

## Supabase Schema

Migrations are in `supabase/migrations/`. Run `supabase db push` to apply.
