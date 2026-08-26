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
