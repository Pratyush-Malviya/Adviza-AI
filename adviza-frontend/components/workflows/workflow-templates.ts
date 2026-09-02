import { NodeTemplateDefinition, WorkflowTemplate } from "@/types/workflow";

export const AVAILABLE_NODE_TEMPLATES: NodeTemplateDefinition[] = [
  // TRIGGERS
  {
    typeId: "trigger-calendar",
    label: "Google Calendar Event",
    subtitle: "Triggers on upcoming client meeting",
    category: "trigger",
    iconName: "Calendar",
    color: "#3B82F6",
    badge: "Composio Trigger",
    composioAppIds: ["googlecalendar", "outlook_calendar"],
    inputs: [],
    outputs: [
      { id: "out-event", name: "Meeting Event", type: "out", dataType: "event" }
    ],
    defaultConfig: {
      lookaheadMinutes: "60",
      filterTag: "Client Review",
      autoSync: true
    },
    configFields: [
      {
        key: "lookaheadMinutes",
        label: "Trigger Lookahead (Minutes)",
        type: "select",
        description: "How many minutes prior to the scheduled meeting to initiate briefing",
        options: [
          { label: "30 Minutes Before", value: "30" },
          { label: "60 Minutes Before (Default)", value: "60" },
          { label: "120 Minutes Before", value: "120" },
          { label: "24 Hours Before", value: "1440" }
        ],
        defaultValue: "60"
      },
      {
        key: "filterTag",
        label: "Calendar Event Filter Tag",
        type: "text",
        placeholder: "e.g. Client Review, HNW, Quarterly",
        defaultValue: "Client Review"
      }
    ]
  },
  {
    typeId: "trigger-audio-upload",
    label: "Meeting Audio Upload",
    subtitle: "Triggers when advisor records or uploads audio",
    category: "trigger",
    iconName: "Mic",
    color: "#EC4899",
    badge: "Whisper/Transcribe",
    inputs: [],
    outputs: [
      { id: "out-audio", name: "Audio Stream / URL", type: "out", dataType: "event" }
    ],
    defaultConfig: {
      autoTranscribe: true,
      diarization: true,
      speakerCount: 2
    },
    configFields: [
      {
        key: "autoTranscribe",
        label: "Auto-Transcribe via Whisper / Bedrock",
        type: "toggle",
        defaultValue: true
      },
      {
        key: "diarization",
        label: "Speaker Diarization (Separate Advisor & Client)",
        type: "toggle",
        defaultValue: true
      }
    ]
  },
  {
    typeId: "trigger-portfolio-drift",
    label: "Portfolio Drift Alert",
    subtitle: "Triggers on asset allocation deviation > threshold",
    category: "trigger",
    iconName: "TrendingUp",
    color: "#F59E0B",
    badge: "Risk Engine",
    inputs: [],
    outputs: [
      { id: "out-drift", name: "Drift Event Data", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      thresholdPercent: "5.0",
      accountType: "All HNW Accounts",
      driftTarget: "Target Model Allocation"
    },
    configFields: [
      {
        key: "thresholdPercent",
        label: "Drift Tolerance Threshold (%)",
        type: "select",
        options: [
          { label: "3.0% (Tight Rebalance)", value: "3.0" },
          { label: "5.0% (Standard Fiduciary)", value: "5.0" },
          { label: "7.5% (Wide Corridor)", value: "7.5" }
        ],
        defaultValue: "5.0"
      },
      {
        key: "accountType",
        label: "Monitored Client Tier",
        type: "select",
        options: [
          { label: "All HNW Accounts ($1M+)", value: "All HNW Accounts" },
          { label: "Ultra HNW ($5M+)", value: "Ultra HNW" },
          { label: "All Active Managed Accounts", value: "All" }
        ],
        defaultValue: "All HNW Accounts"
      }
    ]
  },
  {
    typeId: "trigger-webhook",
    label: "Inbound Webhook",
    subtitle: "Triggers from external custodian / CRM event",
    category: "trigger",
    iconName: "Webhook",
    color: "#10B981",
    badge: "REST Endpoint",
    inputs: [],
    outputs: [
      { id: "out-payload", name: "Webhook Payload", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      endpointPath: "/api/v1/webhooks/custodian",
      signatureVerification: true
    },
    configFields: [
      {
        key: "endpointPath",
        label: "Webhook Path",
        type: "text",
        defaultValue: "/api/v1/webhooks/custodian"
      }
    ]
  },

  // AI AGENTS
  {
    typeId: "agent-briefing",
    label: "Pre-Meeting Briefing Agent",
    subtitle: "Synthesizes client goals, CRM notes, & market context",
    category: "agent",
    iconName: "Sparkles",
    color: "#8B5CF6",
    badge: "AI Agent",
    inputs: [
      { id: "in-event", name: "Client / Event Context", type: "in", dataType: "event" }
    ],
    outputs: [
      { id: "out-briefing", name: "Executive Briefing Memo", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      model: "bedrock-claude-3-5-sonnet",
      temperature: 0.2,
      includePortfolioHistory: true,
      focusAreas: "Life Events, Open Action Items, Asset Allocation"
    },
    configFields: [
      {
        key: "model",
        label: "Foundation Model",
        type: "model_select",
        options: [
          { label: "Anthropic Claude 3.5 Sonnet (Recommended)", value: "bedrock-claude-3-5-sonnet" },
          { label: "OpenAI GPT-4o", value: "gpt-4o" },
          { label: "Amazon Bedrock Nova Pro", value: "bedrock-nova-pro" }
        ],
        defaultValue: "bedrock-claude-3-5-sonnet"
      },
      {
        key: "focusAreas",
        label: "Advisor Focus Priorities",
        type: "textarea",
        placeholder: "Specify key sections (e.g., Life Milestones, Tax-Loss Opportunities)",
        defaultValue: "Life Events, Open Action Items, Portfolio Drift, Recent Inquiries"
      }
    ]
  },
  {
    typeId: "agent-meeting-intel",
    label: "Meeting Intelligence Agent",
    subtitle: "Extracts key topics, client sentiment & commitments",
    category: "agent",
    iconName: "Brain",
    color: "#7C3AED",
    badge: "AI Agent",
    inputs: [
      { id: "in-transcript", name: "Transcript Data", type: "in", dataType: "text" }
    ],
    outputs: [
      { id: "out-commitments", name: "Extracted Action Items", type: "out", dataType: "json" },
      { id: "out-summary", name: "Meeting Summary Memo", type: "out", dataType: "text" }
    ],
    defaultConfig: {
      model: "bedrock-claude-3-5-sonnet",
      extractFinancialCommitments: true,
      sentimentAnalysis: true
    },
    configFields: [
      {
        key: "model",
        label: "Intelligence Model",
        type: "model_select",
        options: [
          { label: "Claude 3.5 Sonnet", value: "bedrock-claude-3-5-sonnet" },
          { label: "GPT-4o", value: "gpt-4o" }
        ],
        defaultValue: "bedrock-claude-3-5-sonnet"
      },
      {
        key: "extractFinancialCommitments",
        label: "Extract Explicit Money Moves & Commitments",
        type: "toggle",
        defaultValue: true
      }
    ]
  },
  {
    typeId: "agent-compliance",
    label: "SEC & FINRA Compliance Auditor",
    subtitle: "Audit transcripts & outbound comms against rules",
    category: "agent",
    iconName: "ShieldCheck",
    color: "#059669",
    badge: "Audit Guardrail",
    inputs: [
      { id: "in-text", name: "Content to Audit", type: "in", dataType: "text" }
    ],
    outputs: [
      { id: "out-compliant", name: "Pass / Verified", type: "out", dataType: "boolean" },
      { id: "out-audit-log", name: "Audit Trail Record", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      ruleset: "SEC_FINRA_COMPREHENSIVE",
      strictness: "Fiduciary High",
      flagGuarantees: true,
      flagPromissoryStatements: true
    },
    configFields: [
      {
        key: "ruleset",
        label: "Compliance Standard",
        type: "compliance_ruleset",
        options: [
          { label: "SEC Rule 206(4)-7 & FINRA Rule 2210 (Comprehensive)", value: "SEC_FINRA_COMPREHENSIVE" },
          { label: "SEC Marketing Rule 206(4)-1", value: "SEC_MARKETING" },
          { label: "FINRA Communications Standard", value: "FINRA_2210" }
        ],
        defaultValue: "SEC_FINRA_COMPREHENSIVE"
      },
      {
        key: "flagGuarantees",
        label: "Flag Guaranteed Returns & Misleading Yield Claims",
        type: "toggle",
        defaultValue: true
      }
    ]
  },

  // LOGIC & GATES
  {
    typeId: "logic-advisor-gate",
    label: "Advisor Sign-Off Gate",
    subtitle: "Requires advisor manual review and digital signature",
    category: "logic",
    iconName: "UserCheck",
    color: "#D97706",
    badge: "Human-in-the-Loop",
    inputs: [
      { id: "in-payload", name: "Draft Payload", type: "in", dataType: "json" }
    ],
    outputs: [
      { id: "out-approved", name: "Approved Branch", type: "out", dataType: "json" },
      { id: "out-rejected", name: "Revision Requested", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      timeoutHours: "24",
      escalationRole: "Lead Fiduciary Advisor",
      requireSignature: true
    },
    configFields: [
      {
        key: "timeoutHours",
        label: "Approval Timeout Window (Hours)",
        type: "select",
        options: [
          { label: "4 Hours", value: "4" },
          { label: "24 Hours (Default)", value: "24" },
          { label: "48 Hours", value: "48" }
        ],
        defaultValue: "24"
      },
      {
        key: "requireSignature",
        label: "Require Cryptographic Audit Stamp",
        type: "toggle",
        defaultValue: true
      }
    ]
  },
  {
    typeId: "logic-condition",
    label: "Risk Score Condition",
    subtitle: "Branch based on numerical score or risk flag",
    category: "logic",
    iconName: "GitFork",
    color: "#6366F1",
    badge: "Router",
    inputs: [
      { id: "in-data", name: "Input Data", type: "in", dataType: "json" }
    ],
    outputs: [
      { id: "out-true", name: "True (High Risk / Drift)", type: "out", dataType: "json" },
      { id: "out-false", name: "False (Normal)", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      conditionVariable: "risk_score",
      operator: "greater_than",
      threshold: "75"
    },
    configFields: [
      {
        key: "conditionVariable",
        label: "Evaluated Field",
        type: "text",
        defaultValue: "risk_score"
      },
      {
        key: "threshold",
        label: "Threshold Value",
        type: "text",
        defaultValue: "75"
      }
    ]
  },

  // ACTIONS & INTEGRATIONS
  {
    typeId: "action-composio-crm",
    label: "Composio CRM Sync",
    subtitle: "Creates tasks, notes & updates contacts in Salesforce/HubSpot",
    category: "action",
    iconName: "Layers",
    color: "#EA580C",
    badge: "Composio Tool",
    composioAppIds: ["salesforce", "hubspot", "wealthbox", "zoho", "redtail", "pipedrive"],
    inputs: [
      { id: "in-crm-data", name: "Structured Data", type: "in", dataType: "json" }
    ],
    outputs: [
      { id: "out-record-id", name: "Synced Record ID", type: "out", dataType: "text" }
    ],
    defaultConfig: {
      provider: "salesforce",
      operation: "create_task_and_note",
      syncPortfolioValues: true
    },
    configFields: [
      {
        key: "provider",
        label: "Target CRM",
        type: "composio_tool",
        options: [
          { label: "Salesforce Financial Services Cloud", value: "salesforce" },
          { label: "HubSpot CRM", value: "hubspot" },
          { label: "Wealthbox CRM", value: "wealthbox" }
        ],
        defaultValue: "salesforce"
      },
      {
        key: "operation",
        label: "CRM Operation",
        type: "select",
        options: [
          { label: "Create Action Tasks & Append Meeting Note", value: "create_task_and_note" },
          { label: "Update Client KYC & Risk Profile", value: "update_kyc" },
          { label: "Log Interaction Only", value: "log_interaction" }
        ],
        defaultValue: "create_task_and_note"
      }
    ]
  },
  {
    typeId: "action-email-followup",
    label: "Resend Client Follow-up",
    subtitle: "Dispatches personalized follow-up email to client",
    category: "action",
    iconName: "Mail",
    color: "#F43F5E",
    badge: "Resend API",
    composioAppIds: ["gmail", "outlook", "sendgrid"],
    inputs: [
      { id: "in-email-body", name: "Approved Content", type: "in", dataType: "text" }
    ],
    outputs: [
      { id: "out-delivery", name: "Message ID & Status", type: "out", dataType: "json" }
    ],
    defaultConfig: {
      senderAddress: "advisor@wealthpilot.ai",
      includeActionChecklist: true,
      bccComplianceArchive: true
    },
    configFields: [
      {
        key: "senderAddress",
        label: "From Address",
        type: "text",
        defaultValue: "advisor@adviza-ai.com"
      },
      {
        key: "bccComplianceArchive",
        label: "BCC Fiduciary Compliance Vault",
        type: "toggle",
        defaultValue: true
      }
    ]
  },
  {
    typeId: "action-inngest-job",
    label: "Inngest Workflow Dispatch",
    subtitle: "Spawns resilient background step function",
    category: "action",
    iconName: "Cpu",
    color: "#0284C7",
    badge: "Inngest Step",
    inputs: [
      { id: "in-inngest-payload", name: "Event Payload", type: "in", dataType: "json" }
    ],
    outputs: [
      { id: "out-job-id", name: "Workflow Run ID", type: "out", dataType: "text" }
    ],
    defaultConfig: {
      eventName: "wealthpilot/portfolio.rebalance.requested",
      retries: 3
    },
    configFields: [
      {
        key: "eventName",
        label: "Inngest Event Topic",
        type: "text",
        defaultValue: "wealthpilot/portfolio.rebalance.requested"
      }
    ]
  }
];

export const PREBUILT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "template-pre-meeting-briefing",
    name: "Pre-Meeting Executive Briefing Pipeline",
    description: "Monitors Google Calendar 60 mins before client meetings, extracts recent portfolio context, and generates a personalized briefing memo.",
    category: "Client Intelligence",
    tags: ["Google Calendar", "Claude 3.5", "Briefing Memo", "Composio"],
    nodes: [
      {
        id: "node-1",
        position: { x: 80, y: 160 },
        data: {
          label: "Google Calendar Event",
          subtitle: "60 mins before meeting",
          category: "trigger",
          typeId: "trigger-calendar",
          iconName: "Calendar",
          color: "#3B82F6",
          badge: "Trigger",
          config: { lookaheadMinutes: "60", filterTag: "Client Review" }
        },
        inputs: [],
        outputs: [{ id: "out-event", name: "Meeting Event", type: "out", dataType: "event" }]
      },
      {
        id: "node-2",
        position: { x: 420, y: 160 },
        data: {
          label: "Pre-Meeting Briefing Agent",
          subtitle: "Claude 3.5 Sonnet analysis",
          category: "agent",
          typeId: "agent-briefing",
          iconName: "Sparkles",
          color: "#8B5CF6",
          badge: "AI Agent",
          config: { model: "bedrock-claude-3-5-sonnet", focusAreas: "Life Events, Open Action Items, Portfolio Drift" }
        },
        inputs: [{ id: "in-event", name: "Client Context", type: "in", dataType: "event" }],
        outputs: [{ id: "out-briefing", name: "Executive Briefing Memo", type: "out", dataType: "json" }]
      },
      {
        id: "node-3",
        position: { x: 780, y: 160 },
        data: {
          label: "Advisor Sign-Off Gate",
          subtitle: "Advisor preview & approval",
          category: "logic",
          typeId: "logic-advisor-gate",
          iconName: "UserCheck",
          color: "#D97706",
          badge: "Approval",
          config: { timeoutHours: "24", requireSignature: true }
        },
        inputs: [{ id: "in-payload", name: "Draft Payload", type: "in", dataType: "json" }],
        outputs: [{ id: "out-approved", name: "Approved Memo", type: "out", dataType: "json" }]
      },
      {
        id: "node-4",
        position: { x: 1140, y: 160 },
        data: {
          label: "Composio CRM Sync",
          subtitle: "Push notes to Salesforce FSC",
          category: "action",
          typeId: "action-composio-crm",
          iconName: "Layers",
          color: "#EA580C",
          badge: "Composio",
          config: { provider: "salesforce", operation: "create_task_and_note" }
        },
        inputs: [{ id: "in-crm-data", name: "Structured Data", type: "in", dataType: "json" }],
        outputs: [{ id: "out-record-id", name: "Synced Record ID", type: "out", dataType: "text" }]
      }
    ],
    edges: [
      {
        id: "edge-1-2",
        sourceNodeId: "node-1",
        sourcePortId: "out-event",
        targetNodeId: "node-2",
        targetPortId: "in-event",
        animated: true,
        label: "Client Details"
      },
      {
        id: "edge-2-3",
        sourceNodeId: "node-2",
        sourcePortId: "out-briefing",
        targetNodeId: "node-3",
        targetPortId: "in-payload",
        animated: true,
        label: "Briefing Memo"
      },
      {
        id: "edge-3-4",
        sourceNodeId: "node-3",
        sourcePortId: "out-approved",
        targetNodeId: "node-4",
        targetPortId: "in-crm-data",
        animated: true,
        label: "Approved Record"
      }
    ]
  },
  {
    id: "template-post-meeting-compliance",
    name: "Post-Meeting Intelligence & SEC/FINRA Compliance",
    description: "Ingests meeting audio, extracts action commitments, runs multi-point fiduciary audit, and dispatches audited client follow-up.",
    category: "Compliance & Audit",
    tags: ["Transcribe", "Meeting Intel", "SEC Rule 206(4)-7", "Resend"],
    nodes: [
      {
        id: "node-pm-1",
        position: { x: 80, y: 180 },
        data: {
          label: "Meeting Audio Upload",
          subtitle: "Audio recording ingest",
          category: "trigger",
          typeId: "trigger-audio-upload",
          iconName: "Mic",
          color: "#EC4899",
          badge: "Trigger",
          config: { autoTranscribe: true, diarization: true }
        },
        inputs: [],
        outputs: [{ id: "out-audio", name: "Audio Stream / URL", type: "out", dataType: "event" }]
      },
      {
        id: "node-pm-2",
        position: { x: 420, y: 180 },
        data: {
          label: "Meeting Intelligence Agent",
          subtitle: "Extract commitments & summary",
          category: "agent",
          typeId: "agent-meeting-intel",
          iconName: "Brain",
          color: "#7C3AED",
          badge: "AI Agent",
          config: { model: "bedrock-claude-3-5-sonnet", extractFinancialCommitments: true }
        },
        inputs: [{ id: "in-transcript", name: "Transcript Data", type: "in", dataType: "text" }],
        outputs: [
          { id: "out-commitments", name: "Action Items", type: "out", dataType: "json" },
          { id: "out-summary", name: "Summary Memo", type: "out", dataType: "text" }
        ]
      },
      {
        id: "node-pm-3",
        position: { x: 780, y: 180 },
        data: {
          label: "SEC & FINRA Compliance Auditor",
          subtitle: "Audit fiduciary statements",
          category: "agent",
          typeId: "agent-compliance",
          iconName: "ShieldCheck",
          color: "#059669",
          badge: "Compliance",
          config: { ruleset: "SEC_FINRA_COMPREHENSIVE", flagGuarantees: true }
        },
        inputs: [{ id: "in-text", name: "Content to Audit", type: "in", dataType: "text" }],
        outputs: [
          { id: "out-compliant", name: "Passed Audit", type: "out", dataType: "boolean" },
          { id: "out-audit-log", name: "Audit Trail Record", type: "out", dataType: "json" }
        ]
      },
      {
        id: "node-pm-4",
        position: { x: 1140, y: 180 },
        data: {
          label: "Resend Client Follow-up",
          subtitle: "Deliver approved follow-up email",
          category: "action",
          typeId: "action-email-followup",
          iconName: "Mail",
          color: "#F43F5E",
          badge: "Action",
          config: { senderAddress: "advisor@adviza-ai.com", bccComplianceArchive: true }
        },
        inputs: [{ id: "in-email-body", name: "Approved Content", type: "in", dataType: "text" }],
        outputs: [{ id: "out-delivery", name: "Status", type: "out", dataType: "json" }]
      }
    ],
    edges: [
      {
        id: "edge-pm-1-2",
        sourceNodeId: "node-pm-1",
        sourcePortId: "out-audio",
        targetNodeId: "node-pm-2",
        targetPortId: "in-transcript",
        animated: true,
        label: "Audio & Transcript"
      },
      {
        id: "edge-pm-2-3",
        sourceNodeId: "node-pm-2",
        sourcePortId: "out-summary",
        targetNodeId: "node-pm-3",
        targetPortId: "in-text",
        animated: true,
        label: "Draft Summary"
      },
      {
        id: "edge-pm-3-4",
        sourceNodeId: "node-pm-3",
        sourcePortId: "out-compliant",
        targetNodeId: "node-pm-4",
        targetPortId: "in-email-body",
        animated: true,
        label: "Audit Pass"
      }
    ]
  },
  {
    id: "template-portfolio-rebalance-drift",
    name: "HNW Portfolio Drift Alert & Rebalance Execution",
    description: "Continuously checks custodian portfolios against target asset allocation corridors. Triggers advisor gate and Inngest rebalance execution.",
    category: "Portfolio & Trading",
    tags: ["Asset Allocation", "Risk Engine", "Advisor Sign-Off", "Inngest"],
    nodes: [
      {
        id: "node-pr-1",
        position: { x: 80, y: 170 },
        data: {
          label: "Portfolio Drift Alert",
          subtitle: "Deviation > 5.0%",
          category: "trigger",
          typeId: "trigger-portfolio-drift",
          iconName: "TrendingUp",
          color: "#F59E0B",
          badge: "Trigger",
          config: { thresholdPercent: "5.0", accountType: "All HNW Accounts" }
        },
        inputs: [],
        outputs: [{ id: "out-drift", name: "Drift Event Data", type: "out", dataType: "json" }]
      },
      {
        id: "node-pr-2",
        position: { x: 420, y: 170 },
        data: {
          label: "Advisor Sign-Off Gate",
          subtitle: "Fiduciary Rebalance Approval",
          category: "logic",
          typeId: "logic-advisor-gate",
          iconName: "UserCheck",
          color: "#D97706",
          badge: "Human Sign-off",
          config: { timeoutHours: "24", requireSignature: true }
        },
        inputs: [{ id: "in-payload", name: "Drift Payload", type: "in", dataType: "json" }],
        outputs: [{ id: "out-approved", name: "Approved Trade Order", type: "out", dataType: "json" }]
      },
      {
        id: "node-pr-3",
        position: { x: 780, y: 170 },
        data: {
          label: "Inngest Workflow Dispatch",
          subtitle: "Execute rebalance background job",
          category: "action",
          typeId: "action-inngest-job",
          iconName: "Cpu",
          color: "#0284C7",
          badge: "Inngest",
          config: { eventName: "wealthpilot/portfolio.rebalance.requested", retries: 3 }
        },
        inputs: [{ id: "in-inngest-payload", name: "Order Payload", type: "in", dataType: "json" }],
        outputs: [{ id: "out-job-id", name: "Run ID", type: "out", dataType: "text" }]
      },
      {
        id: "node-pr-4",
        position: { x: 1140, y: 170 },
        data: {
          label: "Composio CRM Sync",
          subtitle: "Log trade notes in CRM",
          category: "action",
          typeId: "action-composio-crm",
          iconName: "Layers",
          color: "#EA580C",
          badge: "Composio",
          config: { provider: "salesforce", operation: "create_task_and_note" }
        },
        inputs: [{ id: "in-crm-data", name: "Structured Data", type: "in", dataType: "json" }],
        outputs: [{ id: "out-record-id", name: "Synced Record ID", type: "out", dataType: "text" }]
      }
    ],
    edges: [
      {
        id: "edge-pr-1-2",
        sourceNodeId: "node-pr-1",
        sourcePortId: "out-drift",
        targetNodeId: "node-pr-2",
        targetPortId: "in-payload",
        animated: true,
        label: "Drift Alert"
      },
      {
        id: "edge-pr-2-3",
        sourceNodeId: "node-pr-2",
        sourcePortId: "out-approved",
        targetNodeId: "node-pr-3",
        targetPortId: "in-inngest-payload",
        animated: true,
        label: "Approved Orders"
      },
      {
        id: "edge-pr-3-4",
        sourceNodeId: "node-pr-3",
        sourcePortId: "out-job-id",
        targetNodeId: "node-pr-4",
        targetPortId: "in-crm-data",
        animated: true,
        label: "Audit Record"
      }
    ]
  }
];
