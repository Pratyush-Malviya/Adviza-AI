import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userPrompt = (body.prompt || "").trim();

    if (!userPrompt) {
      return NextResponse.json({ enhancedPrompt: userPrompt });
    }

    // Enhance prompt with RIA fiduciary controls, SEC/FINRA compliance, and connector specifics
    const enhanced = `Autonomous RIA Execution: ${userPrompt}. Include automated custodian drift calculations (Schwab/Fidelity), SEC Reg BI & FINRA Rule 2111 compliance verification, Human-In-The-Loop approval gate for orders >$50,000, and executive briefing synthesis with CRM task dispatch.`;

    return NextResponse.json({ enhancedPrompt: enhanced });
  } catch (err: any) {
    return NextResponse.json({ enhancedPrompt: req.url });
  }
}
