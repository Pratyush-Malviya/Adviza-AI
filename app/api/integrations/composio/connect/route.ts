import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateComposioConnection } from "@/lib/composio";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appName } = await req.json();
    if (!appName) {
      return NextResponse.json({ error: "Missing appName parameter" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${origin}/dashboard/settings?connected=${appName}`;

    const connection = await initiateComposioConnection(user.id, appName, redirectUri);

    return NextResponse.json(connection);
  } catch (error: any) {
    console.error("Composio connect route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Composio connection" },
      { status: 500 }
    );
  }
}
