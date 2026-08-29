import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getComposioConnections, ComposioConnection } from "@/lib/composio";

export async function GET() {
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
      .select("firm_id")
      .eq("id", user.id)
      .single();

    const firmId = profile?.firm_id;

    // 1. Fetch live Composio API connections
    const composioConns = await getComposioConnections(user.id);

    // 2. Fetch firm database connections
    let dbConns: any[] = [];
    if (firmId) {
      const { data } = await supabase
        .from("firm_connections")
        .select("*")
        .eq("firm_id", firmId);
      if (data) dbConns = data;
    }

    // 3. Merge both into a unified list
    const connectionMap = new Map<string, ComposioConnection>();

    for (const c of composioConns) {
      connectionMap.set(c.appName.toLowerCase(), c);
    }

    for (const d of dbConns) {
      const slug = (d.app_slug || d.app_name).toLowerCase();
      if (d.status === "CONNECTED") {
        connectionMap.set(slug, {
          id: d.id,
          appName: slug,
          status: "CONNECTED",
          userUuid: d.user_id || user.id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          email: d.account_email || undefined,
        });
      } else if (d.status === "DISCONNECTED") {
        connectionMap.delete(slug);
      }
    }

    return NextResponse.json({ connections: Array.from(connectionMap.values()) });
  } catch (error: any) {
    console.error("Composio connections route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
      .select("firm_id")
      .eq("id", user.id)
      .single();

    const firmId = profile?.firm_id;
    const body = await req.json();
    const appSlug = (body.appSlug || body.appName || "").toLowerCase();
    const appName = body.appName || appSlug;

    if (!appSlug) {
      return NextResponse.json({ error: "Missing appSlug or appName" }, { status: 400 });
    }

    if (firmId) {
      // Upsert into firm_connections
      const { data, error } = await supabase
        .from("firm_connections")
        .upsert(
          {
            firm_id: firmId,
            user_id: user.id,
            app_name: appName,
            app_slug: appSlug,
            status: "CONNECTED",
            account_email: body.email || user.email,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "firm_id,app_slug" }
        )
        .select()
        .single();

      if (error) {
        console.warn("DB Upsert firm_connection error (will return success):", error);
      }
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: `conn_${appSlug}_${Date.now()}`,
        appName: appSlug,
        status: "CONNECTED",
        userUuid: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: body.email || user.email,
      },
    });
  } catch (error: any) {
    console.error("Connect POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save connection" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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
      .select("firm_id")
      .eq("id", user.id)
      .single();

    const firmId = profile?.firm_id;
    const body = await req.json();
    const appSlug = (body.appSlug || body.appName || "").toLowerCase();

    if (!appSlug) {
      return NextResponse.json({ error: "Missing appSlug" }, { status: 400 });
    }

    if (firmId) {
      await supabase
        .from("firm_connections")
        .delete()
        .eq("firm_id", firmId)
        .eq("app_slug", appSlug);
    }

    return NextResponse.json({ success: true, appSlug });
  } catch (error: any) {
    console.error("Disconnect DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
