import { StateGraph, START, END } from "@langchain/langgraph";
import { AdvizaAgentAnnotation, AdvizaAgentStateType } from "./state";
import { intentPlannerNode } from "./nodes/intent-planner";
import { connectorValidatorNode } from "./nodes/connector-validator";
import { hitlGateNode } from "./nodes/hitl-gate";
import { toolExecutorNode } from "./nodes/tool-executor";
import { synthesizerNode } from "./nodes/synthesizer";
import { complianceAuditNode } from "./nodes/compliance-audit";

/**
 * Conditional router after intent & capability planning.
 */
function routeAfterIntent(state: AdvizaAgentStateType): string {
  if (!state.capabilityCalls || state.capabilityCalls.length === 0) {
    return "synthesizer";
  }
  return "connector_validator";
}

/**
 * Conditional router after connector verification.
 */
function routeAfterConnectorCheck(state: AdvizaAgentStateType): string {
  if (state.missingConnectors && state.missingConnectors.length > 0) {
    return "synthesizer";
  }
  return "hitl_gate";
}

/**
 * Conditional router after HITL gate inspection.
 */
function routeAfterHITLCheck(state: AdvizaAgentStateType): string {
  if (state.hitlPrompts && state.hitlPrompts.length > 0) {
    return "synthesizer";
  }
  return "tool_executor";
}

/**
 * Builds and compiles the Adviza Fiduciary LangGraph Agent Graph.
 */
function buildAdvizaGraph() {
  const workflow = new StateGraph(AdvizaAgentAnnotation)
    // 1. Add all nodes
    .addNode("intent_planner", intentPlannerNode)
    .addNode("connector_validator", connectorValidatorNode)
    .addNode("hitl_gate", hitlGateNode)
    .addNode("tool_executor", toolExecutorNode)
    .addNode("synthesizer", synthesizerNode)
    .addNode("compliance_audit", complianceAuditNode)

    // 2. Define edge graph flows
    .addEdge(START, "intent_planner")
    .addConditionalEdges("intent_planner", routeAfterIntent, {
      synthesizer: "synthesizer",
      connector_validator: "connector_validator",
    })
    .addConditionalEdges("connector_validator", routeAfterConnectorCheck, {
      synthesizer: "synthesizer",
      hitl_gate: "hitl_gate",
    })
    .addConditionalEdges("hitl_gate", routeAfterHITLCheck, {
      synthesizer: "synthesizer",
      tool_executor: "tool_executor",
    })
    .addEdge("tool_executor", "synthesizer")
    .addEdge("synthesizer", "compliance_audit")
    .addEdge("compliance_audit", END);

  return workflow.compile();
}

export const advizaChatGraph = buildAdvizaGraph();
