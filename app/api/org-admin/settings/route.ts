import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "@/lib/org-admin/auth";

export async function GET() {
  try {
    const ctx = await requireOrgAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("firms")
      .select("name, slug, billing_email, regulatory_profile, onboarding_completed")
      .eq("id", ctx.firmId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireOrgAdmin();
    if (ctx.role !== "owner") {
      return NextResponse.json({ error: "Only firm owners can update organization settings." }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { section } = body;

    if (section === "firm_profile") {
      const { name, billing_email } = body as { name?: string; billing_email?: string };
      const updates: { name?: string; billing_email?: string } = {};
      if (name?.trim()) updates.name = name.trim();
      if (billing_email?.trim()) updates.billing_email = billing_email.trim();

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
      }

      const { error } = await supabase
        .from("firms")
        .update(updates)
        .eq("id", ctx.firmId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (section === "regulatory_profile") {
      const { reg_type, crd_number, state } = body as {
        reg_type?: string;
        crd_number?: string;
        state?: string;
      };

      const { data: firm } = await supabase
        .from("firms")
        .select("regulatory_profile")
        .eq("id", ctx.firmId)
        .single();

      const existing = (firm?.regulatory_profile as Record<string, string>) ?? {};
      const updated = {
        ...existing,
        ...(reg_type ? { type: reg_type } : {}),
        ...(crd_number !== undefined ? { crd_number } : {}),
        ...(state !== undefined ? { state } : {}),
      };

      const { error } = await supabase
        .from("firms")
        .update({ regulatory_profile: updated })
        .eq("id", ctx.firmId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, regulatory_profile: updated });
    }

    return NextResponse.json({ error: `Unknown settings section: ${section}` }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
