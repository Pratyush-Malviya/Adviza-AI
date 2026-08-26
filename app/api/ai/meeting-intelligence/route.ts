import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeMeetingTranscript } from "@/lib/agents/meeting-agent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { meetingId, transcript } = await request.json();
    if (!meetingId || !transcript) {
      return NextResponse.json(
        { error: "meetingId and transcript required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load meeting data
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*, clients(*), profiles(full_name)")
      .eq("id", meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const client = meeting.clients as { full_name: string };
    const advisor = meeting.profiles as { full_name: string };

    // Run Meeting Intelligence Agent
    const intelligence = await analyzeMeetingTranscript({
      transcript,
      clientName: client.full_name,
      advisorName: advisor?.full_name || "Advisor",
      meetingDate: meeting.scheduled_at,
      meetingType: meeting.meeting_type,
    });

    const serviceClient = await createServiceClient();

    // Save intelligence + update meeting status + save transcript
    await serviceClient.from("meetings").update({
      intelligence,
      transcript_text: transcript,
      status: "completed",
      compliance_status: "pending",
    }).eq("id", meetingId);

    // Save action items extracted by the agent
    if (intelligence.actionItems && intelligence.actionItems.length > 0) {
      const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single();
      if (profile) {
        await serviceClient.from("action_items").insert(
          intelligence.actionItems.map((item) => ({
            firm_id: profile.firm_id,
            meeting_id: meetingId,
            client_id: meeting.client_id,
            description: item.description,
            owner: item.owner,
            priority: item.priority,
            category: item.category,
            status: "open",
            due_date: item.dueDate || null,
          }))
        );

        // Audit log
        await serviceClient.from("audit_logs").insert({
          firm_id: profile.firm_id,
          user_id: user.id,
          action: "process_transcript",
          entity_type: "meeting",
          entity_id: meetingId,
          metadata: {
            client_name: client.full_name,
            action_items_count: intelligence.actionItems.length,
            sentiment: intelligence.clientSentiment,
          },
        });
      }
    }

    return NextResponse.json({ intelligence });
  } catch (error) {
    console.error("[meeting-intelligence-agent]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
