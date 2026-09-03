import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "@/lib/org-admin/auth";

// POST /api/org-admin/invitations
// Actions: "revoke" | "resend"
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireOrgAdmin();
    if (ctx.role !== "owner") {
      return NextResponse.json({ error: "Only firm owners can manage invitations." }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { action, invitationId } = body;

    // Verify the invitation belongs to this firm
    const { data: invitation } = await supabase
      .from("org_invitations")
      .select("id, email, token, firm_id, status, expires_at")
      .eq("id", invitationId)
      .eq("firm_id", ctx.firmId)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (action === "revoke") {
      const { error } = await supabase
        .from("org_invitations")
        .update({ status: "revoked" })
        .eq("id", invitationId)
        .eq("firm_id", ctx.firmId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: "Invitation revoked." });
    }

    if (action === "resend") {
      if (invitation.status === "accepted") {
        return NextResponse.json({ error: "This invitation has already been accepted." }, { status: 400 });
      }

      // Reset expiry and mark pending
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("org_invitations")
        .update({ status: "pending", expires_at: newExpiry })
        .eq("id", invitationId)
        .eq("firm_id", ctx.firmId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // TODO: Resend invitation email
      // await sendInvitationEmail({ email: invitation.email, token: invitation.token, firmName: ctx.firmName });

      return NextResponse.json({ success: true, message: "Invitation resent." });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// GET /api/org-admin/invitations — list pending invitations for this firm
export async function GET() {
  try {
    const ctx = await requireOrgAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("org_invitations")
      .select("id, email, role, status, expires_at, created_at")
      .eq("firm_id", ctx.firmId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ invitations: data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
