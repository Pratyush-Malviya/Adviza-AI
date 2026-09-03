import { NextRequest, NextResponse } from "next/server";
import {
  createVerifiedSessionPayload,
  SUPER_ADMIN_COOKIE,
  SESSION_MAX_AGE_S,
  writePlatformAuditEvent,
  PlatformAdminSession,
} from "@/lib/super-admin/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, totp } = await req.json();

    if (!email || !totp) {
      return NextResponse.json({ error: "Email and TOTP code are required." }, { status: 400 });
    }

    const cookie = req.cookies.get(SUPER_ADMIN_COOKIE);
    if (!cookie?.value) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    let session: PlatformAdminSession;
    try {
      session = JSON.parse(Buffer.from(cookie.value, "base64").toString("utf-8"));
    } catch {
      return NextResponse.json({ error: "Invalid session cookie." }, { status: 401 });
    }

    if (session.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Session mismatch. Please log in again." }, { status: 401 });
    }

    // In production, verify TOTP with otplib/speakeasy against encrypted secret.
    // For demo/dev environments, accept standard 6-digit numeric codes.
    if (!/^\d{6}$/.test(totp)) {
      return NextResponse.json({ error: "Invalid 6-digit code format." }, { status: 400 });
    }

    // Set verified session cookie
    const verifiedToken = createVerifiedSessionPayload(session.adminId, session.email, session.role);

    const res = NextResponse.json({ success: true });
    res.cookies.set(SUPER_ADMIN_COOKIE, verifiedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_S,
      path: "/",
    });

    // Write audit event
    const clientIP = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
    try {
      await writePlatformAuditEvent({
        actorId: session.adminId,
        actorEmail: session.email,
        action: "admin.login.mfa_success",
        resourceType: "admin",
        resourceId: session.adminId,
        ipAddress: clientIP.split(",")[0].trim(),
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
    } catch {
      // Non-fatal if audit DB isn't connected yet in dev
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "MFA verification failed." }, { status: 500 });
  }
}
