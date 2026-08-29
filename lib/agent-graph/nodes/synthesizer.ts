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

  // 2. Missing connectors warning
  if (missingConnectors && missingConnectors.length > 0 && (!executedResults || executedResults.length === 0)) {
    const apps = missingConnectors.map((m) => m.appName).join(", ");
    return {
      finalResponse: `To complete this request, please connect your **${apps}** account using the authorization card below.`,
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
      const summaryPrompt = `You are Adviza AI, a high-conviction Fiduciary Wealth Management Assistant.
The user asked: "${message}"

Below are the live execution results from the tool integrations:
${JSON.stringify(executedResults, null, 2)}

Provide a concise, direct, professional answer to the user's question based on these results.
- If calendar events or meetings are returned, state the exact count and list them with titles and times.
- If emails are returned, summarize any relevant messages or state clearly if no matching emails were found.
- If briefing or compliance data is returned, highlight key portfolio numbers and talking points.
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
