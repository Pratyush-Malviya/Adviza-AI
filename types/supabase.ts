export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  | Record<string, any>
  | any;

export interface Database {
  public: {
    Tables: {
      firms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "free" | "pro" | "enterprise";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          meetings_used: number;
          meetings_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: "free" | "pro" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          meetings_used?: number;
          meetings_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: "free" | "pro" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          meetings_used?: number;
          meetings_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          firm_id: string;
          email: string;
          full_name: string;
          role: "owner" | "advisor" | "ops" | "compliance";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          firm_id: string;
          email: string;
          full_name?: string;
          role?: "owner" | "advisor" | "ops" | "compliance";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          email?: string;
          full_name?: string;
          role?: "owner" | "advisor" | "ops" | "compliance";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          firm_id: string;
          advisor_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          portfolio_value: number | null;
          risk_tolerance: "conservative" | "moderate" | "aggressive" | null;
          investment_goals: string[];
          age: number | null;
          occupation: string | null;
          crm_id: string | null;
          notes: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          advisor_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          portfolio_value?: number | null;
          risk_tolerance?: "conservative" | "moderate" | "aggressive" | null;
          investment_goals?: string[];
          age?: number | null;
          occupation?: string | null;
          crm_id?: string | null;
          notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          advisor_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          portfolio_value?: number | null;
          risk_tolerance?: "conservative" | "moderate" | "aggressive" | null;
          investment_goals?: string[];
          age?: number | null;
          occupation?: string | null;
          crm_id?: string | null;
          notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_advisor_id_fkey";
            columns: ["advisor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      meetings: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          advisor_id: string;
          title: string;
          meeting_type: string;
          scheduled_at: string;
          duration_minutes: number | null;
          status: "scheduled" | "in-progress" | "completed" | "cancelled";
          transcript_url: string | null;
          transcript_text: string | null;
          briefing: Json | null;
          intelligence: Json | null;
          compliance_record: Json | null;
          compliance_status: "pending" | "compliant" | "needs-review" | "flagged" | null;
          follow_up_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          client_id: string;
          advisor_id: string;
          title: string;
          meeting_type?: string;
          scheduled_at: string;
          duration_minutes?: number | null;
          status?: "scheduled" | "in-progress" | "completed" | "cancelled";
          transcript_url?: string | null;
          transcript_text?: string | null;
          briefing?: Json | null;
          intelligence?: Json | null;
          compliance_record?: Json | null;
          compliance_status?: "pending" | "compliant" | "needs-review" | "flagged" | null;
          follow_up_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          client_id?: string;
          advisor_id?: string;
          title?: string;
          meeting_type?: string;
          scheduled_at?: string;
          duration_minutes?: number | null;
          status?: "scheduled" | "in-progress" | "completed" | "cancelled";
          transcript_url?: string | null;
          transcript_text?: string | null;
          briefing?: Json | null;
          intelligence?: Json | null;
          compliance_record?: Json | null;
          compliance_status?: "pending" | "compliant" | "needs-review" | "flagged" | null;
          follow_up_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meetings_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_advisor_id_fkey";
            columns: ["advisor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      action_items: {
        Row: {
          id: string;
          firm_id: string;
          meeting_id: string;
          client_id: string;
          description: string;
          owner: "advisor" | "client" | "operations";
          priority: "high" | "medium" | "low";
          category: string;
          status: "open" | "in-progress" | "completed" | "cancelled";
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          meeting_id: string;
          client_id: string;
          description: string;
          owner?: "advisor" | "client" | "operations";
          priority?: "high" | "medium" | "low";
          category?: string;
          status?: "open" | "in-progress" | "completed" | "cancelled";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          meeting_id?: string;
          client_id?: string;
          description?: string;
          owner?: "advisor" | "client" | "operations";
          priority?: "high" | "medium" | "low";
          category?: string;
          status?: "open" | "in-progress" | "completed" | "cancelled";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "action_items_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_items_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_items_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          firm_id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      workflows: {
        Row: {
          id: string;
          firm_id: string;
          creator_id: string;
          name: string;
          description: string | null;
          status: "draft" | "active" | "paused" | "archived";
          trigger_type: string | null;
          nodes: Json;
          edges: Json;
          connected_apps: string[];
          ai_generated: boolean;
          ai_prompt: string | null;
          last_run_at: string | null;
          run_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          creator_id: string;
          name: string;
          description?: string | null;
          status?: "draft" | "active" | "paused" | "archived";
          trigger_type?: string | null;
          nodes?: Json;
          edges?: Json;
          connected_apps?: string[];
          ai_generated?: boolean;
          ai_prompt?: string | null;
          last_run_at?: string | null;
          run_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          creator_id?: string;
          name?: string;
          description?: string | null;
          status?: "draft" | "active" | "paused" | "archived";
          trigger_type?: string | null;
          nodes?: Json;
          edges?: Json;
          connected_apps?: string[];
          ai_generated?: boolean;
          ai_prompt?: string | null;
          last_run_at?: string | null;
          run_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workflows_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workflows_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      workflow_runs: {
        Row: {
          id: string;
          workflow_id: string;
          firm_id: string;
          triggered_by: string | null;
          status: "pending" | "running" | "success" | "failed" | "cancelled";
          started_at: string | null;
          finished_at: string | null;
          duration_ms: number | null;
          logs: Json;
          node_outputs: Json;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          firm_id: string;
          triggered_by?: string | null;
          status?: "pending" | "running" | "success" | "failed" | "cancelled";
          started_at?: string | null;
          finished_at?: string | null;
          duration_ms?: number | null;
          logs?: Json;
          node_outputs?: Json;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          firm_id?: string;
          triggered_by?: string | null;
          status?: "pending" | "running" | "success" | "failed" | "cancelled";
          started_at?: string | null;
          finished_at?: string | null;
          duration_ms?: number | null;
          logs?: Json;
          node_outputs?: Json;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          firm_id: string;
          user_id: string;
          title: string;
          context_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          user_id: string;
          title?: string;
          context_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          user_id?: string;
          title?: string;
          context_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          firm_id: string;
          user_id: string | null;
          role: "user" | "assistant" | "system" | "tool";
          content: string;
          capability_calls: Json;
          hitl_decision: Json | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          firm_id: string;
          user_id?: string | null;
          role: "user" | "assistant" | "system" | "tool";
          content: string;
          capability_calls?: Json;
          hitl_decision?: Json | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          firm_id?: string;
          user_id?: string | null;
          role?: "user" | "assistant" | "system" | "tool";
          content?: string;
          capability_calls?: Json;
          hitl_decision?: Json | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      firm_connections: {
        Row: {
          id: string;
          firm_id: string;
          user_id: string | null;
          app_name: string;
          app_slug: string;
          status: "CONNECTED" | "INITIATED" | "FAILED" | "EXPIRED" | "DISCONNECTED";
          account_email: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          user_id?: string | null;
          app_name: string;
          app_slug: string;
          status?: "CONNECTED" | "INITIATED" | "FAILED" | "EXPIRED" | "DISCONNECTED";
          account_email?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          user_id?: string | null;
          app_name?: string;
          app_slug?: string;
          status?: "CONNECTED" | "INITIATED" | "FAILED" | "EXPIRED" | "DISCONNECTED";
          account_email?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Firm = Database["public"]["Tables"]["firms"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type ActionItem = Database["public"]["Tables"]["action_items"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type WorkflowRecord = Database["public"]["Tables"]["workflows"]["Row"];
export type WorkflowRun = Database["public"]["Tables"]["workflow_runs"]["Row"];
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessageRecord = Database["public"]["Tables"]["chat_messages"]["Row"];
export type FirmConnectionRecord = Database["public"]["Tables"]["firm_connections"]["Row"];
