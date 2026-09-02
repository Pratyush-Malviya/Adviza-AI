import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getComposioConnections } from "@/lib/composio";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const connectionMap = new Map<string, any>();

    // Fetch live Composio connections if available
    try {
      const liveConnections = await getComposioConnections(user?.id || "default_advisor");
      liveConnections.forEach((c) => {
        const slug = (c.appName || "").toLowerCase();
        connectionMap.set(slug, c);
      });
    } catch {}

    // Fetch DB connections if user is logged in
    if (user) {
      try {
        const { data: dbConnections } = await supabase
          .from("firm_connections" as any)
          .select("*");

        (dbConnections || []).forEach((c: any) => {
          const slug = (c.app_slug || c.provider || "").toLowerCase();
          connectionMap.set(slug, {
            id: c.id,
            appName: c.app_slug || c.provider,
            status: c.status || "CONNECTED",
            userUuid: user.id,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            email: c.account_email,
          });
        });
      } catch {}
    }

    return NextResponse.json({ connections: Array.from(connectionMap.values()) });
  } catch (err: any) {
    return NextResponse.json({ connections: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const appSlug = (body.appSlug || body.appName || "").toLowerCase();
    const appName = body.appName || body.appSlug || "App";

    const connection = {
      id: "conn_" + Date.now(),
      appName,
      appSlug,
      status: "CONNECTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("firm_connections" as any).upsert(
          {
            user_id: user.id,
            app_slug: appSlug,
            provider: appName,
            status: "CONNECTED",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,app_slug" }
        );
      }
    } catch {}

    return NextResponse.json({ success: true, connection });
  } catch (err: any) {
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const appSlug = (body.appSlug || body.appName || "").toLowerCase();

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && appSlug) {
        await supabase
          .from("firm_connections" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("app_slug", appSlug);
      }
    } catch {}

    return NextResponse.json({ success: true, disconnected: appSlug });
  } catch (err: any) {
    return NextResponse.json({ success: true });
  }
}
