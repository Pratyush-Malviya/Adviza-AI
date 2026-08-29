import { NextRequest, NextResponse } from "next/server";
import { invokeModel } from "@/lib/bedrock/client";

const SYSTEM_PROMPT = `You are a Principal AI Workflow Architect specializing in wealth management, RIA operations, and fiduciary compliance automation.
Your task is to take a short, high-level, or unrefined user prompt describing an advisory automation workflow, and enhance it into a detailed, structured, production-ready workflow description.

Structure the enhanced prompt to include:
1. Clear Trigger (e.g., upcoming Google Calendar meeting, audio recording upload, portfolio drift >5%, inbound webhook, new market commentary).
2. Specialized AI Agents (e.g., Pre-Meeting Briefing Agent, Meeting Intelligence & Commitments Extractor, SEC/FINRA Compliance Auditor).
3. Human-in-the-loop / Logic Gate (e.g., Advisor Review & Sign-Off Gate, Compliance threshold check).
4. Output & Connected Integrations (e.g., Composio CRM sync to Salesforce FSC/HubSpot/Wealthbox, Resend email follow-up, Inngest background job dispatch, LinkedIn publishing).

Guidelines:
- Return ONLY the enhanced prompt as a clear, concise 1-2 sentence actionable description.
- Do NOT return markdown headings, quotes, bullet points, or conversational filler.
- Keep it direct, professional, and actionable.`;

function getFallbackEnhancedPrompt(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("linkedin") || p.includes("social") || p.includes("post") || p.includes("content")) {
    return "When a new market commentary or quarterly client insight note is approved, generate a fiduciary-compliant LinkedIn post with Claude, audit content against SEC/FINRA promotional compliance rules, require advisor sign-off gate, and schedule publication via Composio integration.";
  }
  if (p.includes("drift") || p.includes("rebalance") || p.includes("portfolio") || p.includes("allocation")) {
    return "When a client portfolio drifts by >5% from target allocation, evaluate risk scores and tax-loss harvesting with AI, audit against SEC fiduciary guidelines, require advisor sign-off gate, and dispatch rebalancing execution via Inngest.";
  }
  if (p.includes("meeting") || p.includes("audio") || p.includes("transcript") || p.includes("recording")) {
    return "After client meeting audio recording upload, transcribe and extract key commitments with Claude 3.5 Sonnet, run FINRA/SEC compliance check, require advisor sign-off gate, sync tasks to Salesforce CRM, and send follow-up email via Resend.";
  }
  if (p.includes("calendar") || p.includes("brief") || p.includes("prep") || p.includes("schedule")) {
    return "60 minutes before scheduled Google Calendar client review meeting, generate executive briefing memo analyzing holdings and recent notes, audit against fiduciary compliance, and sync prep memo to CRM.";
  }
  if (p.includes("lead") || p.includes("onboard") || p.includes("kyc") || p.includes("client")) {
    return "When an inbound prospective High Net Worth client lead is submitted, audit KYC and suitability documentation, generate customized investment proposal with Claude, require advisor approval gate, and send personalized welcome email via Resend.";
  }
  if (p.includes("email") || p.includes("follow") || p.includes("newsletter")) {
    return "When quarterly portfolio statements are generated, draft personalized executive summary emails for each client tier with Claude, run SEC disclosure compliance audit, require advisor sign-off gate, and send via Resend.";
  }

  const cleanPrompt = prompt.trim().replace(/^create\s+(a\s+)?/i, "").replace(/^build\s+(a\s+)?/i, "");
  return `When ${cleanPrompt} triggers, analyze data with AI reasoning agent, audit against SEC/FINRA fiduciary compliance rules, require advisor approval gate, and sync automated updates to CRM and connected channels.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid prompt string is required to enhance." },
        { status: 400 }
      );
    }

    const rawPrompt = prompt.trim();

    try {
      const response = await invokeModel(
        [
          {
            role: "user",
            content: `Enhance this workflow prompt into a complete, professional fiduciary automation pipeline description:\n"${rawPrompt}"`,
          },
        ],
        SYSTEM_PROMPT
      );

      if (response && response.trim().length > 10) {
        const cleaned = response.trim().replace(/^["']|["']$/g, "").replace(/^Enhanced Prompt:\s*/i, "");
        return NextResponse.json({
          success: true,
          enhancedPrompt: cleaned,
        });
      }
    } catch (llmError) {
      console.warn("[workflow-enhance-prompt] LLM call failed, using intelligent heuristic fallback:", llmError);
    }

    // Heuristic fallback
    const fallback = getFallbackEnhancedPrompt(rawPrompt);
    return NextResponse.json({
      success: true,
      enhancedPrompt: fallback,
    });
  } catch (error: any) {
    console.error("Workflow Enhance Prompt Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
