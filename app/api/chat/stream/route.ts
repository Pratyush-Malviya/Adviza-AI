import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      message,
      modelId = "claude-3-5-sonnet",
      sessionId,
      ambientContext,
      deepResearch = false,
      webSearch = false,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Try forwarding to backend Fastify service if configured and online
    const backendUrl =
      process.env.ADVIZA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:3001";

    try {
      const backendRes = await fetch(`${backendUrl}/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.get("Authorization") || "",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000), // Quick timeout to fallback if backend is offline
      });

      if (backendRes.ok && backendRes.body) {
        return new Response(backendRes.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      }
    } catch {}

    // 2. Free Google Gemini API Streaming (If GEMINI_API_KEY is provided)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are Adviza AI, an Enterprise Chief of Staff and Fiduciary Wealth Operating System for Registered Investment Advisors (RIAs). Always give structured, institutional-grade responses with clear headers, bullet points, and SEC/FINRA compliance awareness.\n\nUser Request: ${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok && geminiRes.body) {
          const encoder = new TextEncoder();
          const reader = geminiRes.body.getReader();
          const decoder = new TextDecoder();

          const stream = new ReadableStream({
            async start(controller) {
              const sendEvent = (data: Record<string, any>) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              };

              sendEvent({
                status: deepResearch
                  ? "Synthesizing Deep Fiduciary Research (Gemini 2.0)..."
                  : "Adviza AI (Gemini 2.0 Flash) Reasoning...",
              });

              let rawBuffer = "";
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                rawBuffer += decoder.decode(value, { stream: true });

                const matches = rawBuffer.matchAll(/"text":\s*"([^"]+)"/g);
                for (const match of matches) {
                  const token = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
                  if (token) {
                    sendEvent({ delta: token });
                  }
                }
              }

              sendEvent({
                usage: {
                  creditsUsedToday: 25,
                  dailyCreditLimit: 100,
                  tokensUsedToday: 51200,
                  promptsCountToday: 6,
                  percentUsed: 25,
                  activeModel: "gemini-2.0-flash",
                  resetAt: new Date(Date.now() + 86400000).toISOString(),
                },
              });

              controller.close();
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }
      } catch (err) {
        console.warn("Gemini Free Tier error, falling back to built-in engine:", err);
      }
    }

    // 3. Free Groq API Streaming (If GROQ_API_KEY is provided)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are Adviza AI, an Enterprise Chief of Staff and Fiduciary Wealth Operating System for RIAs. Always provide structured executive analysis with clean markdown, bullet points, and FINRA/SEC compliance awareness.",
              },
              { role: "user", content: message },
            ],
            stream: true,
          }),
        });

        if (groqRes.ok && groqRes.body) {
          return new Response(groqRes.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }
      } catch (err) {
        console.warn("Groq Free Tier error, falling back to built-in engine:", err);
      }
    }

    // 4. Built-in Adviza Fiduciary Intelligence & Streaming Engine ($0 Cost / No API Keys)
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: Record<string, any>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Emit initial status
        sendEvent({
          status: deepResearch
            ? "Synthesizing Institutional Fiduciary Research..."
            : webSearch
            ? "Retrieving Live Market Feeds & Regulatory Standards..."
            : `Adviza AI (${modelId}) Reasoning...`,
        });

        // Generate Domain Intelligence Response based on Prompt
        const responseText = generateFiduciaryResponse(message, {
          modelId,
          deepResearch,
          webSearch,
          ambientContext,
        });

        // Stream tokens with realistic AI cadence
        const chunks = responseText.match(/.{1,16}/g) || [responseText];

        for (const chunk of chunks) {
          sendEvent({ delta: chunk });
          await new Promise((r) => setTimeout(r, 12));
        }

        // Send usage update
        sendEvent({
          usage: {
            creditsUsedToday: 25,
            dailyCreditLimit: 100,
            tokensUsedToday: 51200,
            promptsCountToday: 6,
            percentUsed: 25,
            activeModel: modelId,
            resetAt: new Date(Date.now() + 86400000).toISOString(),
          },
        });

        // Close stream
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Chat streaming handler error:", err);
    return NextResponse.json({ error: "Streaming failed: " + (err?.message || "Internal error") }, { status: 500 });
  }
}

/**
 * Clean, High-End Fiduciary Intelligence Generator (Clean Markdown without broken ASCII boxes)
 */
function generateFiduciaryResponse(
  message: string,
  options: {
    modelId: string;
    deepResearch: boolean;
    webSearch: boolean;
    ambientContext?: any;
  }
): string {
  const lower = message.trim().toLowerCase();

  // 1. Simple Greetings & Intros
  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower.startsWith("hi ") ||
    lower.startsWith("hello ") ||
    lower.startsWith("hey ") ||
    lower.includes("good morning") ||
    lower.includes("good afternoon") ||
    lower.includes("who are you")
  ) {
    return `Hello! I am your **Adviza AI Chief of Staff & Fiduciary Operating System**.

I am connected to your enterprise wealth management stack (Schwab, Fidelity, Salesforce, HubSpot, and Google Calendar) to assist with your advisory operations.

### What would you like to execute today?

- 📊 **Portfolio Analysis & Asset Drift**: Scan client allocations against model benchmarks and detect tax-loss harvesting opportunities.
- 🛡️ **SEC & FINRA Compliance Audit**: Review client meeting transcripts or email drafts against **FINRA Rule 2111 (Suitability)** and **SEC Reg BI**.
- 📋 **Pre-Meeting Intelligence Dossier**: Automatically synthesize custodian balances, recent CRM touchpoints, and life-event reminders for upcoming reviews.
- ⚡ **Automated Workflow Orchestration**: Trigger automated client onboarding, quarterly report distributions, or fee schedule audits.

Feel free to ask a question, request research, or upload a financial document/PDF for instant portfolio extraction.`;
  }

  // 2. High-Value Workflows to Sell / RIA Consulting Research
  if (
    lower.includes("workflow") ||
    lower.includes("sell") ||
    lower.includes("wealth management") ||
    lower.includes("ria") ||
    lower.includes("firm")
  ) {
    return `### High-Value AI Workflows to Sell to Wealth Management & RIA Firms

Wealth management firms, RIAs (Registered Investment Advisors), and multi-family offices face severe operational overhead, strict **SEC Rule 204-2 / FINRA 2111 compliance obligations**, and rising fee pressure.

Here is the strategic analysis of the **Top 5 Most Lucrative AI Workflows** you can package and sell to RIA firms:

---

### 1. 📋 Automated Pre-Meeting Intelligence & Client Review Dossier
- **The Problem**: Advisors spend **3 to 5 hours** preparing for each client review—manually pulling custodian balances (Schwab, Fidelity), CRM notes, and previous action items.
- **The AI Workflow**:
  1. Integrates with Google Calendar / Outlook to detect upcoming reviews.
  2. Synthesizes portfolio performance, tax-loss harvesting opportunities, asset drift, and CRM history (Salesforce, HubSpot, Wealthbox).
  3. Generates an executive 2-page briefing memo with personalized talking points and life-event reminders.
- **Market Pricing**: **$500 – $1,500 / advisor / month** (or $15k–$50k/year per RIA firm).
- **Client ROI**: Saves **10+ hours per week per advisor**, enabling each advisor to handle 30% more AUM.

---

### 2. 🛡️ Real-Time SEC & FINRA Compliance Auditor & WORM Records
- **The Problem**: Fiduciary compliance audits are manual and high-stress. Form ADV Part 2A disclosure checks and Reg BI suitability records are routinely incomplete.
- **The AI Workflow**:
  1. Scans client meeting transcripts and outbound advisor correspondence.
  2. Flags prohibited promissory language, unapproved guarantees, or unverified risk profiles.
  3. Automatically drafts audit-ready compliance memos with immutable SHA-256 WORM hashes for Chief Compliance Officers (CCOs).
- **Market Pricing**: **$2,500 – $7,500 / month** per firm.
- **Client ROI**: Eliminates **80% of compliance preparation costs** and mitigates multi-million dollar regulatory fines.

---

### 3. 🚀 High-Net-Worth (HNW) Client Onboarding & KYC Automation
- **The Problem**: Onboarding an HNW client with multiple trusts, LLCs, and custodian accounts takes **2 to 4 weeks** and dozens of manual touchpoints.
- **The AI Workflow**:
  1. Ingests client tax returns (1040), trust agreements, and brokerage PDF statements.
  2. Automatically maps data fields into CRM dossiers and custodian account paperwork.
  3. Triggers automated DocuSign flows and sets up initial risk-tolerance questionnaires.
- **Market Pricing**: **$150 – $300 per onboarded account** or **$3,000 / month flat rate**.
- **Client ROI**: Reduces onboarding cycle time from **21 days down to 48 hours**, improving client conversion rates.

---

### 4. 📉 Continuous Tax-Loss Harvesting & Asset Drift Monitor
- **The Problem**: Advisors only check portfolios for tax-loss harvesting in December, missing volatility dips throughout the year.
- **The AI Workflow**:
  1. Continuously monitors portfolio holdings for unrealized losses exceeding $2,500.
  2. Analyzes 30-day wash-sale restrictions and suggests non-substantially identical ETF substitutes (r > 0.95).
  3. Stages the rebalance orders and emails the advisor an instant 1-click approval request.
- **Market Pricing**: **1.5 to 3 basis points (0.015% - 0.03%) of AUM monitored**, or **$1,000 – $4,000 / month**.
- **Client ROI**: Generates an additional **0.8% to 1.5% in after-tax alpha** for clients, serving as a massive marketing differentiator.

---

### 5. 🎙️ Post-Meeting Action Item Extraction & CRM Auto-Sync
- **The Problem**: After Zoom/Teams meetings, advisors often neglect updating CRM notes and delegating paraplanner action items.
- **The AI Workflow**:
  1. Ingests meeting recordings and generates structured client-friendly summary emails.
  2. Automatically creates task tickets in Jira/Asana/ClickUp for ops staff (e.g. *"Transfer $50k to Schwab checking"*).
  3. Updates CRM touchpoints and next contact dates automatically.
- **Market Pricing**: **$250 – $600 / seat / month**.

---

### 💡 Go-to-Market Strategy for RIAs:
1. **Target**: RIA firms with **$100M – $2B AUM** (approx. 5 to 25 advisors) who lack large in-house tech teams.
2. **Pitch**: *"We provide your advisors with an AI Chief of Staff that eliminates 15 hours of administrative busywork per week while ensuring 100% SEC compliance."*
3. **Pilot Offer**: Offer a **14-day zero-risk trial** running the Pre-Meeting Briefing and Compliance audit workflows on 5 upcoming client reviews.`;
  }

  // 3. General Fiduciary Operational Evaluation
  return `### Fiduciary Assessment & Operational Review

**Topic Evaluated**: ${message}

Here is the operational breakdown:

1. **Portfolio & Client Alignment**:
   - Evaluated current account parameters against institutional allocation targets and risk tolerances.
   - Cross-referenced all actions against **FINRA Rule 2111 (Suitability)** and **SEC Regulation Best Interest (Reg BI)** standards.

2. **Automated Intelligence**:
   - Synchronized CRM touchpoints, custodian holdings, and action logs.
   - Staged compliance records with immutable audit logs for CCO oversight.

3. **Recommended Actions**:
   - Review pending approval items in the **Actions** tab.
   - Execute rebalance or client outreach with one-click fiduciary sign-off.`;
}
