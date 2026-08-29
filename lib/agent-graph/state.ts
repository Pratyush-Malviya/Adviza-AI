import { Annotation } from "@langchain/langgraph";

export interface CapabilityCall {
  capability_id: string;
  parameters: Record<string, any>;
  reason?: string;
  requiresHITL?: boolean;
}

export interface MissingConnector {
  appSlug: string;
  appName: string;
  category: string;
  description?: string;
  authUrl?: string;
  pendingAction?: {
    capabilityId: string;
    parameters: Record<string, any>;
    preview?: {
      title?: string;
      recipient?: string;
      subject?: string;
      body?: string;
      details?: Record<string, any>;
    };
  };
}

export interface HITLPrompt {
  actionId: string;
  title: string;
  description: string;
  payload: Record<string, any>;
}

export interface ExecutedResult {
  capabilityId: string;
  success: boolean;
  data: any;
  error?: string;
}

export interface PlanMetadata {
  intent: string;
  targetCapabilities: string[];
  reasoning: string;
  draftedContent?: {
    recipient?: string;
    subject?: string;
    body?: string;
    type?: string;
  };
}

/**
 * LangGraph State Channels Annotation for Adviza Fiduciary Multi-Agent Graph.
 */
export const AdvizaAgentAnnotation = Annotation.Root({
  sessionId: Annotation<string | undefined>(),
  userId: Annotation<string>(),
  firmId: Annotation<string | undefined>(),
  message: Annotation<string>(),
  messages: Annotation<Array<{ role: "user" | "assistant" | "system"; content: string }>>({
    reducer: (curr, update) => (update ? update : curr),
    default: () => [],
  }),
  ambientContext: Annotation<{
    clientId?: string;
    clientName?: string;
    workflowId?: string;
    page?: string;
  } | undefined>(),
  plan: Annotation<PlanMetadata | undefined>(),
  capabilityCalls: Annotation<CapabilityCall[]>({
    reducer: (curr, update) => (update ? update : curr),
    default: () => [],
  }),
  missingConnectors: Annotation<MissingConnector[]>({
    reducer: (curr, update) => (update ? update : curr),
    default: () => [],
  }),
  hitlPrompts: Annotation<HITLPrompt[]>({
    reducer: (curr, update) => (update ? update : curr),
    default: () => [],
  }),
  executedResults: Annotation<ExecutedResult[]>({
    reducer: (curr, update) => (update ? update : curr),
    default: () => [],
  }),
  directAnswer: Annotation<string | undefined>(),
  conversationalIntro: Annotation<string | undefined>(),
  finalResponse: Annotation<string>({
    reducer: (curr, update) => (update ? update : curr),
    default: () => "",
  }),
});

export type AdvizaAgentStateType = typeof AdvizaAgentAnnotation.State;
