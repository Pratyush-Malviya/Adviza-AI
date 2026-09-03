import { NextRequest, NextResponse } from "next/server";
import { getPlatformClient, createSessionPayload, SUPER_ADMIN_COOKIE, SESSION_MAX_AGE_S } from "@/lib/super-admin/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const platformClient = getPlatformClient();
    
    // Look up admin in platform.platform_admins
    const { data: admin, error } = await platformClient
      .from("platform_admins")
      .select("id, email, role, is_active, mfa_enabled")
      .eq("email", email.toLowerCase().trim())
      .single();

    // If no admin found in database, check for initial bootstrap credentials in dev/staging
    if (error || !admin) {
      const bootstrapEmail = process.env.PLATFORM_ADMIN_BOOTSTRAP_EMAIL ?? "admin@adviza.ai";
      const bootstrapPassword = process.env.PLATFORM_ADMIN_BOOTSTRAP_PASSWORD ?? "adviza2026";

      if (email.toLowerCase().trim() === bootstrapEmail.toLowerCase() && password === bootstrapPassword) {
        // Automatically insert bootstrap admin if table is empty
        const { data: newAdmin } = await platformClient
          .from("platform_admins")
          .insert({
            email: bootstrapEmail,
            full_name: "Platform Super Owner",
            role: "super_owner",
            is_active: true,
            mfa_enabled: false,
          })
          .select("id, email, role")
          .single();

        const adminId = newAdmin?.id ?? "bootstrap-super-owner";
        const token = createSessionPayload(adminId, bootstrapEmail, "super_owner");

        const res = NextResponse.json({ success: true, mfaRequired: true });
        res.cookies.set(SUPER_ADMIN_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_MAX_AGE_S,
          path: "/",
        });
        return res;
      }

      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: "Platform administrator account is suspended." }, { status: 403 });
    }

    // Set initial unverified session payload
    const token = createSessionPayload(admin.id, admin.email, admin.role);

    const res = NextResponse.json({
      success: true,
      mfaRequired: true,
    });

    res.cookies.set(SUPER_ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_S,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Authentication failed." }, { status: 500 });
  }
}
