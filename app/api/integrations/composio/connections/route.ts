import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getComposioConnections } from "@/lib/composio";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await getComposioConnections(user.id);
    return NextResponse.json({ connections });
  } catch (error: any) {
    console.error("Composio connections route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch connections" },
      { status: 500 }
    );
  }
}
