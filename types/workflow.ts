export type NodeCategory = "trigger" | "agent" | "action" | "logic" | "output";

export type ExecutionStatus = "idle" | "pending" | "running" | "success" | "error";

export interface NodePort {
  id: string;
  name: string;
  type: "in" | "out";
  dataType?: "event" | "json" | "text" | "boolean";
}

export interface WorkflowNodeData {
  label: string;
  subtitle?: string;
  category: NodeCategory;
  typeId: string;
  iconName: string;
  color: string;
  badge?: string;
  config: Record<string, any>;
  status?: ExecutionStatus;
  executionOutput?: string;
  executionDurationMs?: number;
}

export interface WorkflowNode {
  id: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  animated?: boolean;
  label?: string;
  status?: ExecutionStatus;
}

export interface NodeTemplateDefinition {
  typeId: string;
  label: string;
  subtitle: string;
  category: NodeCategory;
  iconName: string;
  color: string;
  badge?: string;
  /** Composio app slug(s) this node depends on — used for live connection status display */
  composioAppIds?: string[];
  defaultConfig: Record<string, any>;
  inputs: NodePort[];
  outputs: NodePort[];
  configFields: ConfigField[];
}

export type ConfigFieldType = 
  | "text"
  | "textarea"
  | "select"
  | "slider"
  | "toggle"
  | "composio_tool"
  | "compliance_ruleset"
  | "model_select";

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  description?: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "Client Intelligence" | "Compliance & Audit" | "Portfolio & Trading" | "Operations";
  tags: string[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecutionLog {
  timestamp: string;
  nodeId: string;
  nodeLabel: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  payload?: any;
}
