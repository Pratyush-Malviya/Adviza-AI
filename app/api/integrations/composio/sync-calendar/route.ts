import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeComposioAction } from "@/lib/composio";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, firms(*)")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch existing clients to match meeting participants
    const { data: clients } = await supabase
      .from("clients")
      .select("id, full_name, email")
      .eq("firm_id", profile.firm_id);

    // Call Google Calendar action through Composio
    const now = new Date();
    const futureLimit = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // next 14 days

    const result = await executeComposioAction(user.id, "GOOGLECALENDAR_FIND_EVENTS", {
      timeMin: now.toISOString(),
      timeMax: futureLimit.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    let importedCount = 0;
    const events = result?.items || result?.data?.items || [];

    for (const event of events) {
      const summary = event.summary || "Client Review Meeting";
      const startTime = event.start?.dateTime || event.start?.date;
      if (!startTime) continue;

      // Find matching client by attendee email or name in summary
      let matchedClient = clients?.find((c) =>
        (c.email && event.attendees?.some((a: any) => a.email?.toLowerCase() === c.email?.toLowerCase())) ||
        (c.full_name && summary.toLowerCase().includes(c.full_name.toLowerCase()))
      ) || clients?.[0];

      if (!matchedClient) {
        // Automatically create client record for the meeting participant
        const attendeeEmail = event.attendees?.[0]?.email || "client@example.com";
        const attendeeName = event.attendees?.[0]?.displayName || summary.replace(/review|meeting|call/gi, "").trim() || "New Client";

        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            firm_id: profile.firm_id,
            advisor_id: user.id,
            full_name: attendeeName,
            email: attendeeEmail,
            risk_tolerance: "moderate",
          })
          .select("id, full_name, email")
          .single();

        if (newClient) {
          matchedClient = newClient;
        }
      }

      if (matchedClient) {
        // Insert into meetings
        const { error } = await supabase.from("meetings").insert({
          firm_id: profile.firm_id,
          client_id: matchedClient.id,
          advisor_id: user.id,
          title: summary,
          meeting_type: "portfolio-review",
          scheduled_at: new Date(startTime).toISOString(),
          duration_minutes: 45,
          status: "scheduled",
        });

        if (!error) importedCount++;
      }
    }

    // Log audit trail
    await supabase.from("audit_logs").insert({
      firm_id: profile.firm_id,
      user_id: user.id,
      action: "integration.google_calendar_synced",
      entity_type: "meeting",
      entity_id: user.id,
      metadata: {
        events_found: events.length,
        meetings_imported: importedCount,
      },
    });

    return NextResponse.json({
      success: true,
      eventsFound: events.length,
      meetingsImported: importedCount,
      mock: Boolean(result?.mock),
    });
  } catch (error: any) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync Google Calendar" },
      { status: 500 }
    );
  }
}
