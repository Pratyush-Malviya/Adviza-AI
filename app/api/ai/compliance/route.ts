import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { generateComplianceRecord } from "@/lib/agents/compliance-agent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json();
    if (!meetingId) {
      return NextResponse.json({ error: "meetingId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*, clients(*), profiles(full_name), firms:firm_id(name)")
      .eq("id", meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (!meeting.intelligence) {
      return NextResponse.json(
        { error: "Meeting intelligence required before generating compliance record" },
        { status: 400 }
      );
    }

    const client = meeting.clients as { full_name: string; portfolio_value: number | null; risk_tolerance: string | null };
    const advisor = meeting.profiles as { full_name: string };
    const firm = meeting.firms as { name: string };
    const intelligence = meeting.intelligence as {
      meetingSummary: string;
      topicsDiscussed: string[];
      keyDecisions: string[];
      complianceNotes: {
        suitabilityDiscussed: boolean;
        risksDisclosed: string[];
        clientAcknowledgements: string[];
        flaggedItems: string[];
      };
    };

    const complianceRecord = await generateComplianceRecord({
      clientName: client.full_name,
      advisorName: advisor?.full_name || "Advisor",
      firmName: firm?.name || "Firm",
      meetingDate: meeting.scheduled_at,
      meetingType: meeting.meeting_type,
      meetingSummary: intelligence.meetingSummary,
      topicsDiscussed: intelligence.topicsDiscussed || [],
      recommendationsMade: intelligence.keyDecisions || [],
      clientRiskProfile: client.risk_tolerance || "Not specified",
      portfolioValue: client.portfolio_value ?? undefined,
      complianceNotes: intelligence.complianceNotes || {
        suitabilityDiscussed: false,
        risksDisclosed: [],
        clientAcknowledgements: [],
        flaggedItems: [],
      },
    });

    const serviceClient = await createServiceClient();

    // Save compliance record
    await serviceClient.from("meetings").update({
      compliance_record: complianceRecord,
      compliance_status: complianceRecord.complianceStatus,
    }).eq("id", meetingId);

    // Audit log
    const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single();
    if (profile) {
      await serviceClient.from("audit_logs").insert({
        firm_id: profile.firm_id,
        user_id: user.id,
        action: "generate_compliance_record",
        entity_type: "meeting",
        entity_id: meetingId,
        metadata: {
          record_id: complianceRecord.recordId,
          compliance_status: complianceRecord.complianceStatus,
          regulatory_flags: complianceRecord.regulatoryFlags?.length ?? 0,
        },
      });
    }

    return NextResponse.json({ complianceRecord });
  } catch (error) {
    console.error("[compliance-agent]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
