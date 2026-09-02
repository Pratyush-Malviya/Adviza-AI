import { invokeModelJSON } from '../../config/ai-client.js';
import { WorkflowNode, WorkflowEdge, NodeTemplateDefinition } from '../../types/workflow.js';
import { AVAILABLE_NODE_TEMPLATES } from '../workflows/templates.js';
import { invokeModel } from '../../config/ai-client.js';

export interface GeneratedWorkflowResponse {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const SYSTEM_PROMPT = `You are an expert AI systems architect for wealth management and fiduciary RIA operations.
Your task is to convert natural language descriptions of advisor automations into fully structured, node-based workflow pipelines.

Available Node Types:
1. Triggers:
   - "trigger-calendar": Triggers on upcoming meeting (Google Calendar)
   - "trigger-audio-upload": Triggers on audio recording upload
   - "trigger-portfolio-drift": Triggers on portfolio asset allocation drift
   - "trigger-webhook": Inbound custodian/CRM webhook
2. AI Agents:
   - "agent-briefing": Pre-Meeting Briefing Agent (Claude 3.5 Sonnet / Bedrock)
   - "agent-meeting-intel": Meeting Intelligence & Action Item Extractor
   - "agent-compliance": SEC & FINRA Compliance Auditor
3. Logic & Gates:
   - "logic-advisor-gate": Advisor Sign-Off & Review Gate (Human-in-the-Loop)
   - "logic-condition": Risk Score / Numerical Condition Branching
4. Actions & Integrations:
   - "action-composio-crm": Composio CRM Sync (Salesforce FSC, HubSpot, Wealthbox)
   - "action-email-followup": Resend Client Email Follow-up
   - "action-inngest-job": Inngest Background Step Job

Return JSON in this exact structure:
{
  "name": "Pipeline Name",
  "description": "Brief summary",
  "nodeSequence": [
    {
      "typeId": "trigger-calendar",
      "customLabel": "Optional custom name",
      "customConfig": { "lookaheadMinutes": "60" }
    },
    {
      "typeId": "agent-briefing",
      "customLabel": "Briefing Agent",
      "customConfig": { "model": "bedrock-claude-3-5-sonnet" }
    }
  ]
}`;

function buildFallbackWorkflowFromPrompt(prompt: string): GeneratedWorkflowResponse {
  const p = prompt.toLowerCase();

  let selectedTypeIds: string[] = [];
  let name = "AI Generated Wealth Pipeline";
  let description = `Automated pipeline generated for: "${prompt.slice(0, 80)}..."`;

  if (p.includes("drift") || p.includes("rebalance") || p.includes("portfolio")) {
    name = "Automated Portfolio Drift & Rebalance Pipeline";
    selectedTypeIds = [
      "trigger-portfolio-drift",
      "agent-compliance",
      "logic-advisor-gate",
      "action-inngest-job",
      "action-composio-crm"
    ];
  } else if (p.includes("meeting") || p.includes("audio") || p.includes("transcript") || p.includes("recording")) {
    name = "Post-Meeting Intelligence & Compliance Pipeline";
    selectedTypeIds = [
      "trigger-audio-upload",
      "agent-meeting-intel",
      "agent-compliance",
      "action-composio-crm",
      "action-email-followup"
    ];
  } else if (p.includes("calendar") || p.includes("brief") || p.includes("prep") || p.includes("review")) {
    name = "Pre-Meeting Intelligence & Advisor Briefing";
    selectedTypeIds = [
      "trigger-calendar",
      "agent-briefing",
      "logic-advisor-gate",
      "action-composio-crm"
    ];
  } else if (p.includes("compliance") || p.includes("sec") || p.includes("audit") || p.includes("finra")) {
    name = "Fiduciary SEC & FINRA Compliance Audit Gate";
    selectedTypeIds = [
      "trigger-webhook",
      "agent-compliance",
      "logic-advisor-gate",
      "action-email-followup"
    ];
  } else {
    // General hybrid workflow
    name = "Fiduciary Agentic Advisory Workflow";
    selectedTypeIds = [
      "trigger-calendar",
      "agent-briefing",
      "agent-compliance",
      "logic-advisor-gate",
      "action-composio-crm"
    ];
  }

  return constructWorkflowGraph(name, description, selectedTypeIds);
}

function constructWorkflowGraph(
  name: string,
  description: string,
  typeIds: string[],
  customConfigs?: Record<string, any>[]
): GeneratedWorkflowResponse {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  typeIds.forEach((typeId, index) => {
    const template = AVAILABLE_NODE_TEMPLATES.find((t) => t.typeId === typeId) || AVAILABLE_NODE_TEMPLATES[0];
    const nodeId = `node-ai-${index + 1}`;
    const customConfig = customConfigs?.[index] || {};

    const node: WorkflowNode = {
      id: nodeId,
      position: {
        x: 80 + index * 340,
        y: 160 + (index % 2 === 1 ? 20 : 0),
      },
      data: {
        label: template.label,
        subtitle: template.subtitle,
        category: template.category,
        typeId: template.typeId,
        iconName: template.iconName,
        color: template.color,
        badge: template.badge,
        config: { ...template.defaultConfig, ...customConfig },
        status: "idle",
      },
      inputs: template.inputs.map((p) => ({ ...p, id: `${nodeId}-${p.id}` })),
      outputs: template.outputs.map((p) => ({ ...p, id: `${nodeId}-${p.id}` })),
    };

    nodes.push(node);

    // Automatically connect previous node's primary output to current node's primary input
    if (index > 0) {
      const prevNode = nodes[index - 1];
      const prevOutput = prevNode.outputs[0];
      const currInput = node.inputs[0];

      if (prevOutput && currInput) {
        edges.push({
          id: `edge-${prevNode.id}-${node.id}-${index}`,
          sourceNodeId: prevNode.id,
          sourcePortId: prevOutput.id,
          targetNodeId: node.id,
          targetPortId: currInput.id,
          animated: true,
          label: `${prevNode.data.label.split(" ")[0]} ➔ ${node.data.label.split(" ")[0]}`,
        });
      }
    }
  });

  return {
    name,
    description,
    nodes,
    edges,
  };
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<GeneratedWorkflowResponse> {
  if (!prompt || prompt.trim().length === 0) {
    return buildFallbackWorkflowFromPrompt("Pre-Meeting Briefing");
  }

  try {
    const userMessage = `Create a complete wealth management automation workflow for this requirement:\n"${prompt.trim()}"`;
    const response = await invokeModelJSON<{
      name?: string;
      description?: string;
      nodeSequence?: { typeId: string; customLabel?: string; customConfig?: Record<string, any> }[];
    }>([{ role: "user", content: userMessage }], SYSTEM_PROMPT);

    if (response && response.nodeSequence && response.nodeSequence.length > 0) {
      const typeIds = response.nodeSequence.map((n) => n.typeId);
      const customConfigs = response.nodeSequence.map((n) => n.customConfig || {});
      return constructWorkflowGraph(
        response.name || "AI Generated Advisory Pipeline",
        response.description || "Generated by Adviza AI Engine",
        typeIds,
        customConfigs
      );
    }
  } catch (error) {
    console.warn("AI workflow generator API error, utilizing intelligent fallback:", error);
  }

  return buildFallbackWorkflowFromPrompt(prompt);
}

export const generateWorkflowGraph = generateWorkflowFromPrompt;

export async function enhanceWorkflowPrompt(prompt: string): Promise<string> {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return 'When an advisory event triggers, analyze data with AI reasoning agent, audit against SEC/FINRA compliance, require advisor sign-off gate, and sync updates to CRM.';
  }

  const rawPrompt = prompt.trim();
  const systemPrompt = `You are a Principal AI Workflow Architect specializing in wealth management, RIA operations, and fiduciary compliance automation.
Enhance user workflow ideas with triggers, compliance audits, human sign-off gates, and CRM syncs. Return ONLY 1-2 sentences.`;

  try {
    const response = await invokeModel(
      [{ role: 'user', content: `Enhance this workflow prompt:\n"${rawPrompt}"` }],
      systemPrompt
    );
    if (response && response.trim().length > 10) {
      return response.trim().replace(/^["']|["']$/g, '');
    }
  } catch (err) {
    console.warn('[workflow-generator] enhance prompt fallback:', err);
  }

  return `When ${rawPrompt} triggers, evaluate with AI reasoning agent, audit against SEC/FINRA compliance rules, require advisor approval gate, and sync automated updates to CRM.`;
}

