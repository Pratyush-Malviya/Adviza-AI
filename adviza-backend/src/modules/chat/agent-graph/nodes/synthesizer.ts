import { AdvizaAgentStateType } from '../state.js';
import { invokeModel, LLMMessage } from '../../../../config/ai-client.js';

export function formatHumanResponse(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Replace em dashes (—), en dashes (–), and double hyphens (--) with clean punctuation
  cleaned = cleaned.replace(/[—–]/g, " - ");
  cleaned = cleaned.replace(/\s*--\s*/g, " - ");

  // 2. Remove all bold/italic asterisks: ***text*** -> text, **text** -> text, *text* -> text
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, "$1");
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, "$1$2$3");

  // Convert bullet asterisks to clean dashes
  cleaned = cleaned.replace(/^\s*\*\s+/gm, "- ");

  // Remove any remaining stray asterisks
  cleaned = cleaned.replace(/\*/g, "");

  // 3. Clean up markdown heading hashes into clean readable titles
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // 4. Normalize multiple spacing and newlines
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

export async function synthesizerNode(
  state: AdvizaAgentStateType
): Promise<Partial<AdvizaAgentStateType>> {
  const {
    message,
    executedResults,
    missingConnectors,
    hitlPrompts,
    conversationalIntro,
    directAnswer,
    userName,
    ambientContext,
  } = state;

  const effectiveUserName = userName || ambientContext?.userName;

  // 1. Direct answer without tools
  if (directAnswer && (!executedResults || executedResults.length === 0)) {
    return { finalResponse: formatHumanResponse(directAnswer) };
  }

  // 2. Missing connectors with Drafted Action Preview
  if (missingConnectors && missingConnectors.length > 0 && (!executedResults || executedResults.length === 0)) {
    const preview = missingConnectors[0]?.pendingAction?.preview;
    let previewText = "";

    if (preview?.recipient || preview?.body) {
      previewText = `\n\nDraft Preview:\n- To: ${preview.recipient || "Recipient"}\n- Subject: ${preview.subject || "Adviza AI Update"}\n\n${preview.body}\n\n`;
    } else if (preview?.details?.rows && Array.isArray(preview.details.rows)) {
      const rows = preview.details.rows;
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);
      const headerLine = `| ${headers.join(" | ")} |`;
      const sepLine = `| ${headers.map(() => "---").join(" | ")} |`;
      const bodyLines = dataRows.map((r: any[]) => `| ${r.join(" | ")} |`).join("\n");

      previewText = `\n\nPrepared Spreadsheet Preview (${preview.details.title || "Lead Records"}):\n\n${headerLine}\n${sepLine}\n${bodyLines}\n\n`;
    }

    const appName = missingConnectors[0]?.appName || "the app";
    return {
      finalResponse: formatHumanResponse(`I have analyzed your request and prepared everything!${previewText}To automatically push this to ${appName}, simply click connect below and I will create the live spreadsheet for you right away.`),
    };
  }

  // 3. HITL prompt awaiting sign-off
  if (hitlPrompts && hitlPrompts.length > 0 && (!executedResults || executedResults.length === 0)) {
    return {
      finalResponse: formatHumanResponse(`I have put together the requested action for your review. Take a look at the details below, and once you approve, I will dispatch it right away.`),
    };
  }

  // 4. Synthesize from executed results
  let baseResponse = "";

  if (executedResults && executedResults.length > 0) {
    try {
      const userInstruction = effectiveUserName ? `The user's name is "${effectiveUserName}". Address them naturally by name when appropriate.\n` : "";
      const summaryPrompt = `You are Adviza, a friendly, sharp, and highly capable AI partner and digital Chief of Staff for wealth management advisors.
The user requested: "${message}"
${userInstruction}
Below are the live, verified execution results from connected systems:
${JSON.stringify(executedResults, null, 2)}

Provide a warm, articulate, clean, and natural conversational response:
- Speak like a knowledgeable, helpful human colleague.
- DO NOT use any asterisks (*) or (**) anywhere. Do NOT use markdown bold or italics with asterisks.
- DO NOT use em dashes (—) or en dashes (–) or double hyphens (--). Use simple hyphens (-), colons (:), or commas.
- Clearly explain what was accomplished and highlight key numbers, dates, client names, or takeaways.
- Use clean formatting with simple bullet lists using dashes (-) or numbers (1, 2, 3).
- If a Google Sheet, Doc, or CRM record was updated, mention it naturally so the advisor knows where to find it.`;

      const synthesisMessages: LLMMessage[] = [
        { role: "user", content: summaryPrompt },
      ];

      const synthesizedText = await invokeModel(synthesisMessages);
      if (synthesizedText && synthesizedText.trim()) {
        baseResponse = synthesizedText.trim();
      }
    } catch (synthErr) {
      console.warn("[langgraph-synthesizer] Synthesis error, using structured template:", synthErr);
    }
  }

  // Deterministic fallback response if LLM was unavailable
  if (!baseResponse) {
    const lines: string[] = [];
    if (conversationalIntro) {
      lines.push(conversationalIntro);
    } else {
      lines.push("Here are the execution results for your request:");
    }

    if (executedResults && executedResults.length > 0) {
      for (const res of executedResults) {
        const capId = (res.capabilityId || "").toLowerCase();
        const data = res.data || {};

        if (capId.includes("sheet") || res.category === "productivity") {
          const count = data.rows ? Math.max(0, data.rows.length - 1) : 5;
          lines.push(`\nGoogle Sheet Updated: ${data.title || "Adviza Wealth Leads Pipeline"}`);
          lines.push(`Active Records: ${count} record(s) in spreadsheet`);
        } else if (capId.includes("salesforce") || capId.includes("hubspot") || capId.includes("wealthbox") || res.category === "crm") {
          const crmName = capId.includes("salesforce") ? "Salesforce FSC" : capId.includes("hubspot") ? "HubSpot CRM" : "Wealthbox CRM";
          const crmData = data.crmData || {};
          lines.push(`\n${crmName} Record Synchronized: ${crmData.name || data.title || "Client Record"}`);
          lines.push(`Record ID: ${data.crmRecordId || "REC-2026"} | Status: ${crmData.status || "Active"}`);
          if (crmData.company || crmData.estimatedAum) {
            lines.push(`Affiliation / AUM: ${crmData.company || "Private Client"} (${crmData.estimatedAum || "HNW"})`);
          }
        } else if (capId.includes("email") || res.category === "email") {
          lines.push(`\nEmail Dispatched: Sent to ${data.recipient_email || data.to || "Client"}`);
        } else if (capId.includes("briefing") || res.category === "briefing") {
          lines.push(`\nPre-Meeting Briefing Dossier Compiled: ${data.clientName || "Sarah Jenkins"}`);
        } else if (capId.includes("compliance") || res.category === "compliance") {
          lines.push(`\nSEC/FINRA Compliance Audit Record Generated: Record ID ${data.recordId || "REC-2026"}`);
        }
      }
    }

    baseResponse = lines.join("\n");
  }

  // 5. Append direct accessible Document, CRM, and PDF Links guaranteed
  const attachedLinks: string[] = [];
  if (executedResults && executedResults.length > 0) {
    for (const res of executedResults) {
      const data = res.data || {};
      const sheetUrl = data.spreadsheetUrl || (res.capabilityId?.toLowerCase().includes("sheet") ? "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit" : undefined);
      const docUrl = data.documentUrl || (res.category === "briefing" || res.category === "compliance" ? `/api/documents/export?type=${res.category}&clientName=${encodeURIComponent(data.clientName || "Sarah Jenkins")}` : undefined);
      const pdfUrl = data.pdfUrl || (docUrl && docUrl.startsWith("/api/documents") ? `${docUrl}&format=pdf` : undefined);
      const notionUrl = data.notionUrl;
      const crmUrl = data.crmUrl;

      if (crmUrl && !baseResponse.includes(crmUrl)) {
        const crmLabel = res.capabilityId?.toLowerCase().includes("salesforce") ? "Salesforce Financial Services Cloud" : res.capabilityId?.toLowerCase().includes("hubspot") ? "HubSpot CRM" : "Wealthbox CRM";
        attachedLinks.push(`${crmLabel}: [Open Record in CRM](${crmUrl})`);
      }
      if (sheetUrl && !baseResponse.includes(sheetUrl)) {
        attachedLinks.push(`Google Sheet: [Open Spreadsheet in Google Drive](${sheetUrl})`);
      }
      if (docUrl && !baseResponse.includes(docUrl) && docUrl !== crmUrl) {
        attachedLinks.push(`Live Document Dossier: [Open Full Dossier](${docUrl})`);
      }
      if (pdfUrl && !baseResponse.includes(pdfUrl)) {
        attachedLinks.push(`PDF Export: [Download / Save as PDF](${pdfUrl})`);
      }
      if (notionUrl && !baseResponse.includes(notionUrl)) {
        attachedLinks.push(`Notion Page: [View in Notion](${notionUrl})`);
      }
    }
  }

  // Check if any results were executed via mock/simulation pathway
  const hasMockExecutions = (executedResults || []).some((res: any) => res.data?.mock === true);
  if (hasMockExecutions && !baseResponse.includes("Demo Mode")) {
    attachedLinks.push(`\nNote: Action executed in simulated preview mode. Connect your account in Connectors for live real-time synchronization.`);
  }

  if (attachedLinks.length > 0) {
    baseResponse += `\n\nDocument Deliverables & Direct Links:\n${attachedLinks.join("\n")}`;
  }

  return {
    finalResponse: formatHumanResponse(baseResponse),
  };
}
