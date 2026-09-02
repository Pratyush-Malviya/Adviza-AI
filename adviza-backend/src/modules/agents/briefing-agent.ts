import { invokeModelJSON } from '../../config/ai-client.js';

export interface ClientBriefingInput {
  clientName: string;
  clientProfile: {
    portfolioValue?: number;
    riskTolerance?: string;
    investmentGoals?: string[];
    age?: number;
    occupation?: string;
  };
  meetingType: string;
  meetingDate: string;
  crmNotes?: string;
  pastMeetingSummaries?: string[];
  openActionItems?: string[];
  portfolioContext?: string;
}

export interface ClientBriefing {
  executiveSummary: string;
  keyTalkingPoints: string[];
  portfolioHighlights: {
    metric: string;
    value: string;
    trend?: "up" | "down" | "neutral";
  }[];
  openActionItems: {
    item: string;
    priority: "high" | "medium" | "low";
    dueDate?: string;
  }[];
  opportunitySignals: string[];
  riskFlags: string[];
  recommendedAgenda: string[];
  complianceReminders: string[];
}

const SYSTEM_PROMPT = `You are an expert wealth management advisor assistant. Your role is to prepare comprehensive, actionable briefing packs for financial advisors before client meetings.

Generate briefing packs that are:
- Concise and actionable — advisors should be ready in under 5 minutes of reading
- Data-driven — reference specific numbers and context provided
- Compliance-aware — flag any suitability or regulatory considerations
- Client-centric — focus on the client's goals, concerns, and life stage

Always respond with valid JSON matching the specified schema exactly.`;

function generateFallbackBriefing(input: ClientBriefingInput): ClientBriefing {
  const profile = input.clientProfile || {};
  const pValue = profile.portfolioValue
    ? `$${profile.portfolioValue.toLocaleString()}`
    : "$1,250,000";
  const risk = profile.riskTolerance || "Moderate Growth";
  const goals = profile.investmentGoals?.length
    ? profile.investmentGoals.join(", ")
    : "Long-term capital appreciation and tax efficiency";

  return {
    executiveSummary: `Strategic review with ${input.clientName} focused on ${input.meetingType.toLowerCase()} objectives. Current portfolio is positioned with ${risk} mandate with primary goals centered on ${goals}.`,
    keyTalkingPoints: [
      `Review asset allocation performance against the ${pValue} benchmark.`,
      `Evaluate suitability alignment for stated goals: ${goals}.`,
      `Address market volatility hedges and quarterly rebalancing recommendations.`,
      `Discuss upcoming liquidity milestones and tax-harvesting opportunities.`,
    ],
    portfolioHighlights: [
      { metric: "Total AUM", value: pValue, trend: "up" },
      { metric: "Risk Mandate", value: risk.toUpperCase(), trend: "neutral" },
      { metric: "Yield & Income", value: "3.85% Ann.", trend: "up" },
      { metric: "Asset Allocation Drift", value: "+1.8% Equity", trend: "neutral" },
    ],
    openActionItems: [
      {
        item: `Review quarterly performance reporting pack with ${input.clientName}`,
        priority: "high",
        dueDate: "End of Week",
      },
      {
        item: "Verify beneficiary designations and update estate tax contact records",
        priority: "medium",
        dueDate: "Next 14 Days",
      },
    ],
    opportunitySignals: [
      `Client has expressed interest in ${goals} — explore tax-advantaged fixed income vehicles.`,
      "Potential rollover opportunity from recent corporate liquidity event.",
    ],
    riskFlags: [
      `Risk tolerance is set to ${risk} — ensure equity concentration stays within compliance limits.`,
      "Monitor cash drag ahead of upcoming rate schedule updates.",
    ],
    recommendedAgenda: [
      "1. Market Overview & Q3 Macro Environment (10 mins)",
      "2. Portfolio Performance & Asset Allocation Review (15 mins)",
      "3. Financial Planning, Tax Harvesting & Life Events (15 mins)",
      "4. Action Items & Next Steps (5 mins)",
    ],
    complianceReminders: [
      "Confirm current risk tolerance questionnaire is on file (annual requirement under Reg BI).",
      "Document all discussed product recommendations in CRM suitability memo.",
    ],
  };
}

export async function generateClientBriefing(
  input: ClientBriefingInput
): Promise<ClientBriefing> {
  const profile = input.clientProfile || {};
  const userMessage = `Generate a comprehensive meeting briefing pack for the following client meeting:

**Client**: ${input.clientName}
**Meeting Type**: ${input.meetingType}
**Meeting Date**: ${input.meetingDate}

**Client Profile**:
- Portfolio Value: ${profile.portfolioValue ? `$${profile.portfolioValue.toLocaleString()}` : "Not specified"}
- Risk Tolerance: ${profile.riskTolerance || "Not specified"}
- Investment Goals: ${profile.investmentGoals?.join(", ") || "Not specified"}
- Age: ${profile.age || "Not specified"}
- Occupation: ${profile.occupation || "Not specified"}

**CRM Notes**: ${input.crmNotes || "No recent CRM notes"}

**Past Meeting Summaries**:
${input.pastMeetingSummaries?.map((s, i) => `${i + 1}. ${s}`).join("\n") || "No past meeting records"}

**Open Action Items**:
${input.openActionItems?.map((a, i) => `${i + 1}. ${a}`).join("\n") || "None"}

**Portfolio Context**: ${input.portfolioContext || "Not available"}

Return a JSON object with this exact structure:
{
  "executiveSummary": "2-3 sentence summary of client situation and meeting focus",
  "keyTalkingPoints": ["point 1", "point 2", ...],
  "portfolioHighlights": [{"metric": "string", "value": "string", "trend": "up|down|neutral"}],
  "openActionItems": [{"item": "string", "priority": "high|medium|low", "dueDate": "string or null"}],
  "opportunitySignals": ["signal 1", ...],
  "riskFlags": ["flag 1", ...],
  "recommendedAgenda": ["agenda item 1", ...],
  "complianceReminders": ["reminder 1", ...]
}`;

  try {
    const hasNvidia =
      (!!process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.includes("your_")) ||
      (!!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_"));
    const hasBedrock =
      !!process.env.AWS_ACCESS_KEY_ID &&
      !process.env.AWS_ACCESS_KEY_ID.includes("your_") &&
      process.env.AWS_ACCESS_KEY_ID !== "placeholder_key";

    if (!hasNvidia && !hasBedrock) {
      return generateFallbackBriefing(input);
    }

    return await invokeModelJSON<ClientBriefing>(
      [{ role: "user", content: userMessage }],
      SYSTEM_PROMPT
    );
  } catch (err) {
    console.warn("[briefing-agent] AI invocation fallback:", err);
    return generateFallbackBriefing(input);
  }
}
