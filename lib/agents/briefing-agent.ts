import { invokeModelJSON } from "@/lib/bedrock/client";

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

export async function generateClientBriefing(
  input: ClientBriefingInput
): Promise<ClientBriefing> {
  const userMessage = `Generate a comprehensive meeting briefing pack for the following client meeting:

**Client**: ${input.clientName}
**Meeting Type**: ${input.meetingType}
**Meeting Date**: ${input.meetingDate}

**Client Profile**:
- Portfolio Value: ${input.clientProfile.portfolioValue ? `$${input.clientProfile.portfolioValue.toLocaleString()}` : "Not specified"}
- Risk Tolerance: ${input.clientProfile.riskTolerance || "Not specified"}
- Investment Goals: ${input.clientProfile.investmentGoals?.join(", ") || "Not specified"}
- Age: ${input.clientProfile.age || "Not specified"}
- Occupation: ${input.clientProfile.occupation || "Not specified"}

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

  return invokeModelJSON<ClientBriefing>(
    [{ role: "user", content: userMessage }],
    SYSTEM_PROMPT
  );
}
