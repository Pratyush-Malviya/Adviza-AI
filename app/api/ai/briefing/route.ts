import { createServiceClient } from "@/lib/supabase/server";
import { generateClientBriefing } from "@/lib/agents/briefing-agent";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Load meeting with client data
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*, clients(*)")
      .eq("id", meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const client = meeting.clients as {
      full_name: string;
      portfolio_value: number | null;
      risk_tolerance: string | null;
      investment_goals: string[];
      age: number | null;
      occupation: string | null;
      notes: string | null;
    };

    // Load past meetings for this client
    const { data: pastMeetings } = await supabase
      .from("meetings")
      .select("intelligence, scheduled_at")
      .eq("client_id", meeting.client_id)
      .neq("id", meetingId)
      .not("intelligence", "is", null)
      .order("scheduled_at", { ascending: false })
      .limit(3);

    const pastSummaries = pastMeetings?.map((m) => {
      const intel = m.intelligence as { meetingSummary?: string } | null;
      return intel?.meetingSummary || "";
    }).filter(Boolean) ?? [];

    // Load open action items for this client
    const { data: openActions } = await supabase
      .from("action_items")
      .select("description")
      .eq("client_id", meeting.client_id)
      .eq("status", "open")
      .limit(10);

    const briefing = await generateClientBriefing({
      clientName: client.full_name,
      clientProfile: {
        portfolioValue: client.portfolio_value ?? undefined,
        riskTolerance: client.risk_tolerance ?? undefined,
        investmentGoals: client.investment_goals,
        age: client.age ?? undefined,
        occupation: client.occupation ?? undefined,
      },
      meetingType: meeting.meeting_type,
      meetingDate: meeting.scheduled_at,
      crmNotes: client.notes ?? undefined,
      pastMeetingSummaries: pastSummaries,
      openActionItems: openActions?.map((a) => a.description) ?? [],
    });

    // Save briefing to database
    const serviceClient = await createServiceClient();
    await serviceClient.from("meetings").update({ briefing }).eq("id", meetingId);

    // Log audit event
    const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single();
    if (profile) {
      await serviceClient.from("audit_logs").insert({
        firm_id: profile.firm_id,
        user_id: user.id,
        action: "generate_briefing",
        entity_type: "meeting",
        entity_id: meetingId,
        metadata: { client_name: client.full_name },
      });
    }

    return NextResponse.json({ briefing });
  } catch (error) {
    console.error("[briefing-agent]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
