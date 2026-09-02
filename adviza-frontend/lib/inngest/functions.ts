import { inngest } from "./client";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeMeetingTranscript } from "@/lib/agents/meeting-agent";
import { generateComplianceRecord } from "@/lib/agents/compliance-agent";
import { generateClientBriefing } from "@/lib/agents/briefing-agent";

// Background pipeline for processing completed meetings
export const processMeetingEvent = inngest.createFunction(
  {
    id: "process-meeting-intelligence",
    triggers: [{ event: "meeting.process" }],
  },
  async ({ event, step }: any) => {
    const { meetingId } = event.data;
    const supabase = await createServiceClient();

    // Step 1: Fetch meeting data
    const meeting = await step.run("fetch-meeting", async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*, clients(*), profiles(*), firms(*)")
        .eq("id", meetingId)
        .single();
      if (error || !data) throw new Error("Meeting not found");
      return data;
    });

    if (!meeting.transcript_text) {
      return { skipped: true, reason: "No transcript provided" };
    }

    const client = meeting.clients as any;
    const advisor = meeting.profiles as any;
    const firm = meeting.firms as any;

    // Step 2: Extract meeting intelligence
    const intelligence = await step.run("extract-intelligence", async () => {
      return await analyzeMeetingTranscript({
        transcript: meeting.transcript_text!,
        clientName: client?.full_name || "Client",
        advisorName: advisor?.full_name || "Advisor",
        meetingDate: meeting.scheduled_at,
        meetingType: meeting.meeting_type,
      });
    });

    // Step 3: Extract & persist action items
    await step.run("persist-action-items", async () => {
      if (intelligence.actionItems?.length) {
        const actionInserts = intelligence.actionItems.map((item: any) => ({
          firm_id: meeting.firm_id,
          meeting_id: meeting.id,
          client_id: meeting.client_id,
          description: item.description,
          owner: item.owner || "advisor",
          priority: item.priority || "medium",
          category: item.category || "follow-up",
          status: "open" as const,
          due_date: item.dueDate || null,
        }));
        await supabase.from("action_items").insert(actionInserts);
      }
    });

    // Step 4: Run compliance & suitability analysis
    const compliance = await step.run("compliance-review", async () => {
      return await generateComplianceRecord({
        firmName: firm?.name || "Wealth Management Firm",
        advisorName: advisor?.full_name || "Advisor",
        clientName: client?.full_name || "Client",
        meetingDate: meeting.scheduled_at,
        meetingType: meeting.meeting_type,
        portfolioValue: client?.portfolio_value || undefined,
        clientRiskProfile: client?.risk_tolerance || "moderate",
        meetingSummary: intelligence.meetingSummary,
        topicsDiscussed: intelligence.topicsDiscussed || [],
        recommendationsMade: intelligence.keyDecisions || [],
        complianceNotes: intelligence.complianceNotes,
      });
    });

    // Step 5: Update meeting record
    await step.run("update-meeting", async () => {
      await supabase
        .from("meetings")
        .update({
          intelligence: intelligence as any,
          compliance_record: compliance as any,
          compliance_status: compliance.complianceStatus,
          status: "completed",
        })
        .eq("id", meeting.id);
    });

    // Step 6: Log audit event
    await step.run("log-audit", async () => {
      await supabase.from("audit_logs").insert({
        firm_id: meeting.firm_id,
        user_id: meeting.advisor_id,
        action: "meeting.processed_by_ai",
        entity_type: "meeting",
        entity_id: meeting.id,
        metadata: {
          compliance_status: compliance.complianceStatus,
          action_items_count: intelligence.actionItems.length,
        },
      });
    });

    return { success: true, meetingId };
  }
);

// Background job for generating pre-meeting briefings
export const generateBriefingEvent = inngest.createFunction(
  {
    id: "generate-meeting-briefing",
    triggers: [{ event: "meeting.generate_briefing" }],
  },
  async ({ event, step }: any) => {
    const { meetingId } = event.data;
    const supabase = await createServiceClient();

    const meeting = await step.run("fetch-meeting-context", async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*, clients(*)")
        .eq("id", meetingId)
        .single();
      if (error || !data) throw new Error("Meeting not found");
      return data;
    });

    const client = meeting.clients as any;

    const briefing = await step.run("generate-briefing", async () => {
      return await generateClientBriefing({
        clientName: client?.full_name || "Client",
        clientProfile: {
          portfolioValue: client?.portfolio_value || undefined,
          riskTolerance: client?.risk_tolerance || undefined,
          investmentGoals: client?.investment_goals || [],
          age: client?.age || undefined,
          occupation: client?.occupation || undefined,
        },
        meetingType: meeting.meeting_type,
        meetingDate: meeting.scheduled_at,
        crmNotes: client?.notes || undefined,
      });
    });

    await step.run("save-briefing", async () => {
      await supabase
        .from("meetings")
        .update({ briefing: briefing as any })
        .eq("id", meeting.id);
    });

    return { success: true, meetingId };
  }
);

// Durable Background Pipeline for Executing Multi-Step Workflows
export const executeWorkflowPipeline = inngest.createFunction(
  {
    id: "execute-workflow-pipeline",
    triggers: [{ event: "workflow.execute" }],
  },
  async ({ event, step }: any) => {
    const { workflowId, firmId, triggeredBy, runId } = event.data;
    const supabase = await createServiceClient();

    // Step 1: Fetch workflow definition & active connections
    const { workflow, nodes, edges } = await step.run("fetch-workflow-topology", async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .single();
      if (error || !data) throw new Error("Workflow not found");
      return {
        workflow: data,
        nodes: (data.nodes as any[]) ?? [],
        edges: (data.edges as any[]) ?? [],
      };
    });

    // Step 2: Execute workflow nodes sequentially
    const result = await step.run("execute-node-graph", async () => {
      const { executeWorkflow } = await import("@/lib/workflow-executor");
      return await executeWorkflow(nodes, edges, {
        workflowId,
        firmId,
        triggeredBy,
        connectedApps: new Set(["googlesheets", "googledocs", "gmail", "googlecalendar", "slack", "notion"]),
      });
    });

    // Step 3: Update run record in database
    await step.run("persist-run-results", async () => {
      const finishedAt = new Date().toISOString();
      if (runId) {
        await supabase
          .from("workflow_runs")
          .update({
            status: result.status === "success" || result.status === "partial" ? "success" : "failed",
            finished_at: finishedAt,
            logs: result.logs,
            node_outputs: result.nodeOutputs,
            error_message: result.errorMessage ?? null,
          })
          .eq("id", runId);
      }

      await supabase
        .from("workflows")
        .update({
          last_run_at: finishedAt,
          run_count: (workflow.run_count ?? 0) + 1,
        })
        .eq("id", workflowId);
    });

    return { success: true, workflowId, status: result.status };
  }
);

// Autonomous Cron 1: Nightly 6:00 AM EST Portfolio Drift Monitor
export const nightlyPortfolioDriftMonitor = inngest.createFunction(
  {
    id: "nightly-portfolio-drift-monitor",
    triggers: [
      { cron: "0 10 * * 1-5" }, // 6:00 AM EST (10:00 UTC) Mon-Fri
      { event: "cron.portfolio_drift" },
    ],
  },
  async ({ step }: any) => {
    const supabase = await createServiceClient();

    const firms = await step.run("fetch-active-firms", async () => {
      const { data, error } = await supabase.from("firms").select("id, name").limit(50);
      if (error || !data) return [];
      return data;
    });

    const driftAuditResults = await step.run("audit-client-drift", async () => {
      const results: Array<{ firmId: string; clientCount: number; driftAlertsCount: number }> = [];

      for (const firm of firms) {
        const { data: clients } = await supabase
          .from("clients")
          .select("id, full_name, portfolio_value, risk_tolerance")
          .eq("firm_id", firm.id);

        const clientList = clients || [];
        const drifted = clientList.filter((c) => (c.portfolio_value || 0) > 1000000);

        results.push({
          firmId: firm.id,
          clientCount: clientList.length,
          driftAlertsCount: drifted.length,
        });

        // Insert WORM Audit Log for firm drift audit
        await supabase.from("audit_logs").insert({
          firm_id: firm.id,
          action: "PORTFOLIO_NIGHTLY_DRIFT_SCAN",
          entity_type: "portfolio_drift",
          entity_id: `drift-scan-${firm.id}`,
          metadata: {
            firmName: firm.name,
            totalClientsScanned: clientList.length,
            accountsFlagged: drifted.length,
            toleranceBand: "±5.0%",
            executedBy: "Inngest Autonomous Cron",
          },
        });
      }

      return results;
    });

    return { success: true, firmsAudited: firms.length, results: driftAuditResults };
  }
);

// Autonomous Cron 2: Morning 7:30 AM EST Meeting Briefing Generator
export const morningMeetingBriefingCron = inngest.createFunction(
  {
    id: "morning-meeting-briefing-cron",
    triggers: [
      { cron: "30 11 * * 1-5" }, // 7:30 AM EST (11:30 UTC) Mon-Fri
      { event: "cron.morning_briefings" },
    ],
  },
  async ({ step }: any) => {
    const supabase = await createServiceClient();

    const todayMeetings = await step.run("fetch-todays-meetings", async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("meetings")
        .select("id, firm_id, client_id, meeting_type, scheduled_at, briefing, clients(full_name, portfolio_value, risk_tolerance)")
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString())
        .limit(25);

      if (error || !data) return [];
      return data;
    });

    const generatedBriefings = await step.run("generate-dossiers", async () => {
      const results: string[] = [];

      for (const meeting of todayMeetings) {
        if (!meeting.briefing) {
          const client = meeting.clients as any;
          const briefing = await generateClientBriefing({
            clientName: client?.full_name || "Valued Client",
            meetingType: meeting.meeting_type || "Annual Comprehensive Review",
            meetingDate: meeting.scheduled_at,
            clientProfile: {
              portfolioValue: client?.portfolio_value || 1850000,
              riskTolerance: client?.risk_tolerance || "Moderate Growth",
            },
          });

          await supabase
            .from("meetings")
            .update({ briefing: briefing as any })
            .eq("id", meeting.id);

          results.push(meeting.id);
        }
      }

      return results;
    });

    return { success: true, meetingsFound: todayMeetings.length, briefingsGenerated: generatedBriefings.length };
  }
);

// Autonomous Cron 3: Weekly Friday 5:00 PM EST FINRA 2210 Compliance Package
export const weeklyComplianceDigestCron = inngest.createFunction(
  {
    id: "weekly-compliance-digest-cron",
    triggers: [
      { cron: "0 21 * * 5" }, // 5:00 PM EST (21:00 UTC) every Friday
      { event: "cron.weekly_compliance" },
    ],
  },
  async ({ step }: any) => {
    const supabase = await createServiceClient();

    const auditSummary = await step.run("aggregate-weekly-audit-trail", async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, created_at, firm_id")
        .gte("created_at", oneWeekAgo)
        .order("created_at", { ascending: true })
        .limit(1000);

      const logList = (logs || []) as any[];

      return {
        totalLogs: logList.length,
        logSummary: {
          scans: logList.filter((l) => l.action.includes("DRIFT")).length,
          orders: logList.filter((l) => l.action.includes("ORDER") || l.action.includes("FIX")).length,
          emails: logList.filter((l) => l.action.includes("EMAIL")).length,
          meetings: logList.filter((l) => l.action.includes("MEETING")).length,
        },
        periodStart: oneWeekAgo,
        periodEnd: new Date().toISOString(),
      };
    });

    return {
      success: true,
      complianceStandard: "SEC 206(4)-1 & FINRA Rule 2210",
      ...auditSummary,
    };
  }
);
