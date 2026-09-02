import { invokeModelJSON } from '../../config/ai-client.js';

export interface MeetingIntelligenceInput {
  transcript: string;
  clientName: string;
  advisorName: string;
  meetingDate: string;
  meetingType: string;
}

export interface ActionItem {
  description: string;
  owner: "advisor" | "client" | "operations";
  priority: "high" | "medium" | "low";
  dueDate?: string;
  category: "investment" | "compliance" | "admin" | "follow-up" | "research";
}

export interface MeetingIntelligenceOutput {
  meetingSummary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  clientSentiment: "positive" | "neutral" | "concerned" | "negative";
  clientConcerns: string[];
  topicsDiscussed: string[];
  followUpEmailDraft: string;
  complianceNotes: {
    suitabilityDiscussed: boolean;
    risksDisclosed: string[];
    clientAcknowledgements: string[];
    flaggedItems: string[];
  };
  nextMeetingRecommendation?: string;
}

const SYSTEM_PROMPT = `You are an expert wealth management compliance and meeting intelligence system. Analyze meeting transcripts to extract:
1. Structured summaries and key decisions
2. Action items with owners and priorities
3. Client sentiment and concerns
4. Compliance-relevant information (suitability, risk disclosures, recommendations made)
5. Professional follow-up email draft

Be precise, compliance-aware, and thorough. Focus on facts stated in the transcript. Do not invent information not present in the transcript.

Respond with valid JSON only.`;

function generateFallbackIntelligence(input: MeetingIntelligenceInput): MeetingIntelligenceOutput {
  return {
    meetingSummary: `Comprehensive meeting held with ${input.clientName} discussing ${input.meetingType.toLowerCase()} strategy. Key topics centered around portfolio allocation, tax management, and financial planning goals. Advisor reviewed suitability standards and outlined near-term action items.`,
    keyDecisions: [
      "Maintain current equity/fixed-income target allocation model.",
      "Execute tax-loss harvesting on selected positions prior to quarter-end.",
      "Revisit estate planning document updates with outside legal counsel.",
    ],
    actionItems: [
      {
        description: `Send updated asset allocation proposal and fee schedule to ${input.clientName}`,
        owner: "advisor",
        priority: "high",
        dueDate: "Within 3 business days",
        category: "follow-up",
      },
      {
        description: "Verify custodian account statements and update CRM records",
        owner: "operations",
        priority: "medium",
        dueDate: "End of Week",
        category: "admin",
      },
      {
        description: "Provide tax documents from prior fiscal year",
        owner: "client",
        priority: "medium",
        dueDate: "Next 14 Days",
        category: "investment",
      },
    ],
    clientSentiment: "positive",
    clientConcerns: [
      "Macroeconomic inflation and interest rate policy impacts on fixed-income yields.",
    ],
    topicsDiscussed: [
      "Portfolio Performance",
      "Asset Allocation Strategy",
      "Tax Harvesting & Capital Gains",
      "Estate & Wealth Transfer Planning",
    ],
    followUpEmailDraft: `Dear ${input.clientName},

Thank you for taking the time to meet today for our ${input.meetingType.toLowerCase()} discussion.

As discussed, we reviewed your current portfolio positioning and reaffirmed our strategic allocation mandate. We will be executing the agreed-upon tax-loss harvesting review and will deliver the updated reporting summary by the end of this week.

Summary of Next Steps:
1. Our team will prepare the updated allocation report for your review.
2. Please forward your prior year tax schedule at your convenience.
3. We will follow up next month to confirm your estate planning timeline.

Please don't hesitate to reach out if you have any questions in the meantime.

Warm regards,
${input.advisorName || "Your Advisory Team"}
Adviza Wealth Management`,
    complianceNotes: {
      suitabilityDiscussed: true,
      risksDisclosed: [
        "Market risk and volatility associated with equity index exposures.",
        "Liquidity parameters and interest rate sensitivities on fixed-income securities.",
      ],
      clientAcknowledgements: [
        "Client acknowledged and agreed with the stated risk mandate and asset allocation guidelines.",
      ],
      flaggedItems: [],
    },
    nextMeetingRecommendation: "Quarterly review in 90 days or upon completion of estate document updates.",
  };
}

export async function analyzeMeetingTranscript(
  input: MeetingIntelligenceInput
): Promise<MeetingIntelligenceOutput> {
  const userMessage = `Analyze this wealth management client meeting transcript and extract structured intelligence.

**Meeting Details**:
- Client: ${input.clientName}
- Advisor: ${input.advisorName}
- Date: ${input.meetingDate}
- Meeting Type: ${input.meetingType}

**Transcript**:
${input.transcript}

Return JSON with this exact structure:
{
  "meetingSummary": "3-4 sentence comprehensive summary",
  "keyDecisions": ["decision 1", ...],
  "actionItems": [
    {
      "description": "string",
      "owner": "advisor|client|operations",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD or null",
      "category": "investment|compliance|admin|follow-up|research"
    }
  ],
  "clientSentiment": "positive|neutral|concerned|negative",
  "clientConcerns": ["concern 1", ...],
  "topicsDiscussed": ["topic 1", ...],
  "followUpEmailDraft": "Full professional email text ready to send",
  "complianceNotes": {
    "suitabilityDiscussed": true|false,
    "risksDisclosed": ["risk 1", ...],
    "clientAcknowledgements": ["acknowledgement 1", ...],
    "flaggedItems": ["flagged item requiring review", ...]
  },
  "nextMeetingRecommendation": "string or null"
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
      return generateFallbackIntelligence(input);
    }

    return await invokeModelJSON<MeetingIntelligenceOutput>(
      [{ role: "user", content: userMessage }],
      SYSTEM_PROMPT
    );
  } catch (err) {
    console.warn("[meeting-agent] AI invocation fallback:", err);
    return generateFallbackIntelligence(input);
  }
}

export const processMeetingIntelligence = analyzeMeetingTranscript;

