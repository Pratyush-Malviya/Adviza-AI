import { invokeModelJSON } from "@/lib/bedrock/client";

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

  return invokeModelJSON<MeetingIntelligenceOutput>(
    [{ role: "user", content: userMessage }],
    SYSTEM_PROMPT
  );
}
