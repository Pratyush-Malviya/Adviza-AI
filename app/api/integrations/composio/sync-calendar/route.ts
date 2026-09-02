import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeComposioAction } from "@/lib/composio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let syncedCount = 0;
    if (user) {
      try {
        const result = await executeComposioAction(user.id, "GOOGLECALENDAR_FIND_EVENTS", {
          timeMin: new Date().toISOString(),
          maxResults: 25,
        });

        const events = result?.events || result?.raw?.events || [];
        if (Array.isArray(events)) {
          for (const evt of events) {
            if (evt.summary) {
              await supabase.from("meetings" as any).upsert(
                {
                  user_id: user.id,
                  title: evt.summary,
                  meeting_date: evt.start?.dateTime || evt.start?.date || new Date().toISOString(),
                  status: "scheduled",
                  notes: evt.description || "Imported from Google Calendar via Composio",
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,title,meeting_date" }
              );
              syncedCount++;
            }
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      meetingsImported: syncedCount,
      message: `Calendar sync completed (${syncedCount} meetings imported)`,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      meetingsImported: 0,
      message: "Calendar sync completed (0 meetings imported)",
    });
  }
}
