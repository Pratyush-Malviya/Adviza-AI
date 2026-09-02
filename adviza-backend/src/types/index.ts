export type Role = 'advisor' | 'assistant' | 'user' | 'system' | 'compliance_officer';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: Role;
  content: string;
  capability_calls?: any[];
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  firm_id: string;
  user_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  category: 'preference' | 'persona' | 'client_context' | 'workflow_habit' | 'fact' | 'general';
  memory: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface WorkflowDefinition {
  id: string;
  firm_id: string;
  name: string;
  nodes: any[];
  edges: any[];
  status: 'active' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface ComplianceAuditLog {
  id: string;
  firm_id: string;
  action: string;
  actor: string;
  resource: string;
  payload?: any;
  compliance_score?: number;
  flagged_items?: string[];
  timestamp: string;
}
