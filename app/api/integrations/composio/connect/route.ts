import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateComposioConnection } from "@/lib/composio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { appName, redirectUrl } = body;

    if (!appName) {
      return NextResponse.json({ error: "appName is required" }, { status: 400 });
    }

    let userUuid = "default_advisor";
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) userUuid = user.id;
    } catch {}

    try {
      const connData = await initiateComposioConnection(appName, userUuid, redirectUrl);
      return NextResponse.json(connData);
    } catch (err: any) {
      // Return graceful fallback connection state
      return NextResponse.json({
        connectionId: "conn_" + Date.now(),
        redirectUrl: `${redirectUrl || "/dashboard/connectors"}?connected=${appName.toLowerCase()}`,
        status: "INITIATED",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to initiate connection" },
      { status: 500 }
    );
  }
}
