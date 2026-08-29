import { AdvizaAgentStateType } from "../state";
import { invokeModel, LLMMessage } from "@/lib/bedrock/client";

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
  } = state;

  // 1. Direct answer without tools
  if (directAnswer && (!executedResults || executedResults.length === 0)) {
    return { finalResponse: directAnswer };
  }

  // 2. Missing connectors with Drafted Action Preview
  if (missingConnectors && missingConnectors.length > 0 && (!executedResults || executedResults.length === 0)) {
    const preview = missingConnectors[0]?.pendingAction?.preview;
    let previewText = "";

    if (preview?.recipient || preview?.body) {
      previewText = `\n\n### 📝 Drafted Message Preview\n- **To:** \`${preview.recipient || "Recipient"}\`\n- **Subject:** *${preview.subject || "Adviza AI Update"}*\n\n> ${preview.body?.replace(/\n/g, "\n> ")}\n\n`;
    }

    return {
      finalResponse: `I have analyzed your request and prepared the action.${previewText}To dispatch this automatically, please connect any of the available connectors below. Once connected, Adviza AI will instantly execute and deliver this for you.`,
    };
  }

  // 3. HITL prompt awaiting sign-off
  if (hitlPrompts && hitlPrompts.length > 0 && (!executedResults || executedResults.length === 0)) {
    return {
      finalResponse: `I have prepared the required fiduciary action. Please review the details and sign off below before it is dispatched.`,
    };
  }

  // 4. Synthesize from executed results
  if (executedResults && executedResults.length > 0) {
    try {
      const summaryPrompt = `You are Adviza AI, an autonomous Fiduciary Wealth Management Assistant.
The user requested: "${message}"

Below are the live execution results from the tool integrations:
${JSON.stringify(executedResults, null, 2)}

Provide a concise, direct, professional answer to the user:
- If an email was sent, clearly state that the email has been sent successfully to the recipient, along with the subject and confirmation.
- If calendar events or meetings are returned, state the exact count and list them with titles and times.
- If briefing or compliance data is returned, highlight key metrics and talking points.
- Do NOT output raw JSON blocks. Format with crisp markdown bullet points.`;

      const synthesisMessages: LLMMessage[] = [
        { role: "user", content: summaryPrompt },
      ];

      const synthesizedText = await invokeModel(synthesisMessages);
      if (synthesizedText && synthesizedText.trim()) {
        return { finalResponse: synthesizedText.trim() };
      }
    } catch (synthErr) {
      console.warn("[langgraph-synthesizer] Synthesis error, falling back to intro/default:", synthErr);
    }
  }

  return {
    finalResponse: conversationalIntro || "Here are the execution results for your request:",
  };
}
