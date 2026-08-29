import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateComposioConnection } from "@/lib/composio";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const appName = body.appName;

    if (!appName) {
      return NextResponse.json({ error: "Missing appName parameter" }, { status: 400 });
    }

    const userId = user?.id || "demo_advisor_uuid";
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectPath = body.source === "chat" ? "/dashboard/chat" : "/dashboard/connectors";
    const redirectUri = `${origin}${redirectPath}?connected=${appName}`;

    const connection = await initiateComposioConnection(userId, appName, redirectUri);

    return NextResponse.json(connection);
  } catch (error: any) {
    console.error("Composio connect route error:", error);
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({
      redirectUrl: `${origin}/dashboard/settings?integration_connected=generic&mock=true`,
      connectionId: `mock_conn_${Date.now()}`,
    });
  }
}
