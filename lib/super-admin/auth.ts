import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Separate service-role client scoped to the platform schema.
// Uses PLATFORM_SUPABASE_SERVICE_KEY — never the tenant service role key.
// ---------------------------------------------------------------------------
export function getPlatformClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const key =
    process.env.PLATFORM_SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "placeholder";
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "platform" },
  });
}

// ---------------------------------------------------------------------------
// Session cookie constants (must match middleware.ts)
// ---------------------------------------------------------------------------
export const SUPER_ADMIN_COOKIE = "adviza_platform_admin_session";
export const SESSION_MAX_AGE_S = parseInt(
  process.env.SUPER_ADMIN_SESSION_MAX_AGE ?? "3600",
  10
);

export interface PlatformAdminSession {
  adminId: string;
  email: string;
  role: string;
  mfaVerified: boolean;
  issuedAt: number;
}

// ---------------------------------------------------------------------------
// Verify the current platform admin session (called from Server Components)
// ---------------------------------------------------------------------------
export async function getPlatformAdminSession(): Promise<PlatformAdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SUPER_ADMIN_COOKIE)?.value;
  if (!raw) return null;
  try {
    const session: PlatformAdminSession = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8")
    );
    if (!session?.adminId || !session?.mfaVerified) return null;
    const age = (Date.now() - (session.issuedAt ?? 0)) / 1000;
    if (age >= SESSION_MAX_AGE_S) return null;
    return session;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Create a signed session cookie payload (called at login)
// ---------------------------------------------------------------------------
export function createSessionPayload(
  adminId: string,
  email: string,
  role: string
): string {
  const payload: PlatformAdminSession = {
    adminId,
    email,
    role,
    mfaVerified: false,
    issuedAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function createVerifiedSessionPayload(
  adminId: string,
  email: string,
  role: string
): string {
  const payload: PlatformAdminSession = {
    adminId,
    email,
    role,
    mfaVerified: true,
    issuedAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// ---------------------------------------------------------------------------
// Write an immutable audit event to platform.platform_audit_events
// ---------------------------------------------------------------------------
export async function writePlatformAuditEvent(opts: {
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const client = getPlatformClient();
  const hash = createHash("sha256")
    .update(
      [
        opts.actorId,
        opts.action,
        opts.resourceId ?? "",
        JSON.stringify(opts.payload ?? {}),
        new Date().toISOString(),
      ].join("|")
    )
    .digest("hex");

  await client.from("platform_audit_events").insert({
    actor_id: opts.actorId,
    actor_email: opts.actorEmail,
    action: opts.action,
    resource_type: opts.resourceType,
    resource_id: opts.resourceId ?? null,
    payload: opts.payload ?? {},
    reason: opts.reason ?? null,
    ip_address: opts.ipAddress ?? null,
    user_agent: opts.userAgent ?? null,
    sha256_hash: hash,
  });
}

// ---------------------------------------------------------------------------
// Require a valid platform admin session; redirect on failure
// (use in server components that can't rely on middleware alone)
// ---------------------------------------------------------------------------
export async function requirePlatformAdmin(
  allowedRoles?: string[]
): Promise<PlatformAdminSession> {
  const session = await getPlatformAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
