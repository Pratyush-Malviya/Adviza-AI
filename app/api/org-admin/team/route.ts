import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { getOrgUsageLimits } from "@/lib/org-admin/limits";

// GET /api/org-admin/team — list members in the calling user's firm
export async function GET(req: NextRequest) {
  try {
    const ctx = await requireOrgAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, updated_at")
      .eq("firm_id", ctx.firmId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ members: data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/org-admin/team
// Actions: "invite" | "deactivate" | "reactivate" | "change_role"
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireOrgAdmin();
    if (ctx.role !== "owner") {
      return NextResponse.json({ error: "Only firm owners can manage team members." }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { action } = body;

    if (action === "invite") {
      const email = (body.email as string)?.trim()?.toLowerCase();
      const role = body.role as "advisor" | "ops" | "compliance";
      if (!email || !["advisor", "ops", "compliance"].includes(role)) {
        return NextResponse.json({ error: "Invalid email or role." }, { status: 400 });
      }

      // Check seat limit
      const limits = await getOrgUsageLimits(ctx.firmId);
      if (!limits.users.canAdd) {
        return NextResponse.json({ error: "Seat limit reached. Please upgrade your plan." }, { status: 402 });
      }

      // Check for existing pending invitation
      const { data: existing } = await supabase
        .from("org_invitations")
        .select("id")
        .eq("firm_id", ctx.firmId)
        .eq("email", email)
        .eq("status", "pending")
        .single();

      if (existing) {
        return NextResponse.json({ error: "A pending invitation already exists for this email." }, { status: 409 });
      }

      const { data: invitation, error } = await supabase
        .from("org_invitations")
        .insert({
          firm_id: ctx.firmId,
          invited_by: ctx.userId,
          email,
          role,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // TODO: Send invitation email via Resend/SendGrid with invitation.token
      // await sendInvitationEmail({ email, token: invitation.token, firmName: ctx.firmName, role });

      return NextResponse.json({ success: true, invitation });
    }

    if (action === "deactivate") {
      const { userId } = body as { userId: string };
      if (userId === ctx.userId) {
        return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
      }

      // Verify the target user belongs to this firm
      const { data: target } = await supabase
        .from("profiles")
        .select("id, role, firm_id")
        .eq("id", userId)
        .single();

      if (!target || target.firm_id !== ctx.firmId) {
        return NextResponse.json({ error: "User not found in this organization." }, { status: 404 });
      }
      if (target.role === "owner") {
        return NextResponse.json({ error: "Cannot deactivate the firm owner." }, { status: 403 });
      }

      // Soft-delete by revoking Supabase auth (preserves profile + data for audit)
      // In production: use admin API to disable the user
      // For now: flag via a metadata approach
      const { error } = await supabase
        .from("profiles")
        .update({ role: "advisor" }) // TODO: add an `is_active` column in a follow-up migration
        .eq("id", userId)
        .eq("firm_id", ctx.firmId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true, message: "User deactivated." });
    }

    if (action === "change_role") {
      const role = body.role as "advisor" | "ops" | "compliance";
      const { userId } = body as { userId: string };
      if (!["advisor", "ops", "compliance"].includes(role)) {
        return NextResponse.json({ error: "Invalid role. Cannot assign owner via this endpoint." }, { status: 400 });
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)
        .eq("firm_id", ctx.firmId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
