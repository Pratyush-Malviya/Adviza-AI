import { NextRequest, NextResponse } from "next/server";
import { getPlatformAdminSession, getPlatformClient, writePlatformAuditEvent } from "@/lib/super-admin/auth";
import { DEFAULT_CMS_CONTENT } from "@/lib/cms/content";

export async function GET() {
  try {
    const session = await getPlatformAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const platformClient = getPlatformClient();
    const { data: rows, error } = await platformClient
      .from("website_content")
      .select("*")
      .order("section_key", { ascending: true });

    // Map existing rows or merge with defaults
    const contentMap: Record<string, any> = { ...DEFAULT_CMS_CONTENT };
    if (!error && rows) {
      rows.forEach((row) => {
        contentMap[row.section_key] = row.content;
      });
    }

    return NextResponse.json({ content: contentMap });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to fetch website content." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getPlatformAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: super_owner, engineering, and billing_ops can manage content
    if (!["super_owner", "engineering"].includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden. Content management requires engineering or super_owner privileges." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sectionKey, content, isPublished = true } = body;

    if (!sectionKey || !content) {
      return NextResponse.json({ error: "sectionKey and content are required." }, { status: 400 });
    }

    const platformClient = getPlatformClient();
    const { data, error } = await platformClient
      .from("website_content")
      .upsert(
        {
          section_key: sectionKey,
          content,
          is_published: isPublished,
          updated_by: session.adminId !== "bootstrap-super-owner" ? session.adminId : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "section_key" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Write audit event
    const clientIP = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
    try {
      await writePlatformAuditEvent({
        actorId: session.adminId,
        actorEmail: session.email,
        action: `cms.update.${sectionKey}`,
        resourceType: "website_content",
        resourceId: sectionKey,
        payload: { sectionKey, isPublished },
        ipAddress: clientIP.split(",")[0].trim(),
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to update content." }, { status: 500 });
  }
}
