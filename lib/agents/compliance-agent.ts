import { invokeModelJSON } from "@/lib/bedrock/client";

export interface ComplianceRecordInput {
  clientName: string;
  advisorName: string;
  firmName: string;
  meetingDate: string;
  meetingType: string;
  meetingSummary: string;
  topicsDiscussed: string[];
  recommendationsMade: string[];
  clientRiskProfile: string;
  portfolioValue?: number;
  complianceNotes: {
    suitabilityDiscussed: boolean;
    risksDisclosed: string[];
    clientAcknowledgements: string[];
    flaggedItems: string[];
  };
}

export interface ComplianceRecord {
  recordId: string;
  generatedAt: string;
  complianceStatus: "compliant" | "needs-review" | "flagged";
  suitabilityAssessment: {
    status: "appropriate" | "needs-review" | "inappropriate";
    rationale: string;
    factors: string[];
  };
  disclosuresSummary: string[];
  regulatoryFlags: {
    flag: string;
    severity: "critical" | "warning" | "info";
    requiredAction: string;
  }[];
  auditNarrative: string;
  attestationText: string;
  retentionRequirement: string;
}

const SYSTEM_PROMPT = `You are a financial services compliance officer AI. Generate detailed, audit-ready compliance records for wealth management client meetings.

Follow SEC, FINRA, and fiduciary standard requirements. Be thorough, precise, and flag any potential issues.

Compliance record ID format: CR-{YYYYMMDD}-{random 6 chars}

Respond with valid JSON only.`;

export async function generateComplianceRecord(
  input: ComplianceRecordInput
): Promise<ComplianceRecord> {
  const recordDate = new Date().toISOString();
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date(input.meetingDate)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const userMessage = `Generate a compliance record for the following wealth management meeting:

**Firm**: ${input.firmName}
**Advisor**: ${input.advisorName}
**Client**: ${input.clientName}
**Meeting Date**: ${input.meetingDate}
**Meeting Type**: ${input.meetingType}
**Portfolio Value**: ${input.portfolioValue ? `$${input.portfolioValue.toLocaleString()}` : "Not specified"}
**Client Risk Profile**: ${input.clientRiskProfile}

**Meeting Summary**: ${input.meetingSummary}

**Topics Discussed**: ${input.topicsDiscussed.join("; ")}

**Recommendations Made**: ${input.recommendationsMade.join("; ") || "None documented"}

**Compliance Notes**:
- Suitability Discussed: ${input.complianceNotes.suitabilityDiscussed ? "Yes" : "No"}
- Risks Disclosed: ${input.complianceNotes.risksDisclosed.join("; ") || "None"}
- Client Acknowledgements: ${input.complianceNotes.clientAcknowledgements.join("; ") || "None"}
- Flagged Items: ${input.complianceNotes.flaggedItems.join("; ") || "None"}

Return JSON:
{
  "recordId": "CR-${dateStr}-${randomId}",
  "generatedAt": "${recordDate}",
  "complianceStatus": "compliant|needs-review|flagged",
  "suitabilityAssessment": {
    "status": "appropriate|needs-review|inappropriate",
    "rationale": "string",
    "factors": ["factor 1", ...]
  },
  "disclosuresSummary": ["disclosure 1", ...],
  "regulatoryFlags": [
    {
      "flag": "string",
      "severity": "critical|warning|info",
      "requiredAction": "string"
    }
  ],
  "auditNarrative": "Full narrative suitable for regulatory review",
  "attestationText": "Attestation statement for advisor signature",
  "retentionRequirement": "Retention period per regulation"
}`;

  return invokeModelJSON<ComplianceRecord>(
    [{ role: "user", content: userMessage }],
    SYSTEM_PROMPT
  );
}
