-- ============================================================
-- Adviza AI — Website CMS Schema
-- Migration: 011_website_cms_schema.sql
-- ============================================================

-- Table for storing dynamic website content editable by Super Admin
CREATE TABLE IF NOT EXISTS platform.website_content (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key   TEXT         UNIQUE NOT NULL,
  content       JSONB        NOT NULL DEFAULT '{}',
  is_published  BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_by    UUID         REFERENCES platform.platform_admins(id),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed initial website content
INSERT INTO platform.website_content (section_key, content, is_published)
VALUES
(
  'announcement_banner',
  '{
    "enabled": true,
    "badge": "New Release",
    "text": "Adviza v2.4 introduces Deterministic Portfolio Drift & SEC 204-2 Exam Export",
    "ctaText": "Explore the Platform",
    "ctaLink": "/platform"
  }'::jsonb,
  true
),
(
  'hero',
  '{
    "badge": "Institutional Wealth Management AI",
    "headline": "Autonomous Execution Workspace for High-Performing Wealth Advisors",
    "subheadline": "Adviza handles client meeting dossiers, real-time audio transcription, deterministic portfolio drift analysis, and SEC/FINRA compliance records — freeing your advisors to focus 100% on clients.",
    "primaryCtaText": "Start 14-Day Firm Trial",
    "primaryCtaLink": "/auth/signup",
    "secondaryCtaText": "Schedule Institutional Demo",
    "secondaryCtaLink": "/contact",
    "trustMetric": "Trusted by 450+ RIA firms managing over $18.4 Billion in combined AUM"
  }'::jsonb,
  true
),
(
  'trust_stats',
  '{
    "stats": [
      { "value": "$18.4B+", "label": "AUM Monitored & Analyzed" },
      { "value": "6.2 hrs", "label": "Saved per Advisor / Week" },
      { "value": "99.8%", "label": "Compliance Exam Accuracy" },
      { "value": "0%", "label": "Client Data Used for LLM Training" }
    ]
  }'::jsonb,
  true
),
(
  'testimonials',
  '{
    "items": [
      {
        "quote": "Adviza completely transformed our advisory operations. Before Adviza, each advisor spent 45 minutes compiling meeting notes and CRM updates. Now it happens automatically before the client even walks out the door.",
        "author": "Eleanor Vance, CFP®",
        "title": "Managing Principal",
        "firm": "Beacon Wealth Partners ($1.4B AUM)",
        "rating": 5
      },
      {
        "quote": "As Chief Compliance Officer, our biggest risk was unstructured communication and incomplete suitability rationales. Adviza provides a tamper-proof, SHA-256 hash-verified evidence trail that made our SEC examination seamless.",
        "author": "Marcus Sterling, JD",
        "title": "Chief Compliance Officer",
        "firm": "Apex Private Wealth ($820M AUM)",
        "rating": 5
      },
      {
        "quote": "The deterministic portfolio drift calculations are rock-solid. Other AI tools hallucinate allocation math; Adviza executes mathematical rebalancing with human-in-the-loop sign-off. Outstanding engineering.",
        "author": "David Chen, CFA",
        "title": "Chief Investment Officer",
        "firm": "Cascade Family Office ($2.6B AUM)",
        "rating": 5
      }
    ]
  }'::jsonb,
  true
),
(
  'faqs',
  '{
    "items": [
      {
        "question": "Does Adviza use our confidential client data to train public AI models?",
        "answer": "Absolutely not. Adviza enforces a strict Zero-Data Retention (ZDR) architecture with all LLM providers (AWS Bedrock, NVIDIA NIM, Google Cloud Vertex). Your client transcripts, financial records, and PII are never retained, logged, or used for model training under any circumstance."
      },
      {
        "question": "How does Adviza support SEC Rule 204-2 and FINRA Rule 17a-4?",
        "answer": "Every meeting dossier, audio transcript, action item, and portfolio recommendation is anchored into a Write-Once-Read-Many (WORM) compliant immutable audit ledger with cryptographic SHA-256 hash chaining. When auditors request proof, CCOs can generate a tamper-evident compliance packet in one click."
      },
      {
        "question": "Which custodians and CRMs does Adviza integrate with?",
        "answer": "Adviza connects natively with major custodian feeds (Charles Schwab, Fidelity Institutional, BNY Mellon Pershing) and leading wealth management CRMs (Salesforce Financial Services Cloud, Wealthbox, Redtail) through secure OAuth2 and canonical REST connectors."
      },
      {
        "question": "What is the onboarding and setup timeline for an RIA firm?",
        "answer": "A typical firm onboarding takes less than 24 hours. Once your Organization Admin configures your firm regulatory profile and invites team members, advisors can begin conducting meetings and generating briefings immediately without complex software installations."
      }
    ]
  }'::jsonb,
  true
)
ON CONFLICT (section_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();
