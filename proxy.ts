import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/platform") ||
    pathname.startsWith("/security") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/case-studies") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/super-admin/login") ||
    isApiRoute;

  // ── 1. SUPER ADMIN GUARD (/super-admin/*) ────────────────────────────────
  if (pathname.startsWith("/super-admin") && !pathname.startsWith("/super-admin/login")) {
    // a. IP Allowlist (enforced in production when list is configured)
    const allowlistEnv = process.env.SUPER_ADMIN_IP_ALLOWLIST ?? "";
    const allowlist = allowlistEnv.split(",").map((s) => s.trim()).filter(Boolean);
    if (process.env.NODE_ENV === "production" && allowlist.length > 0) {
      const clientIP =
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        "0.0.0.0";
      const cleanIP = clientIP.split(",")[0].trim();
      const allowed = allowlist.some((entry) => {
        if (entry.includes("/")) {
          const [network] = entry.split("/");
          return network.split(".").slice(0, 3).join(".") === cleanIP.split(".").slice(0, 3).join(".");
        }
        return cleanIP === entry;
      });
      if (!allowed) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    // b. Platform admin session cookie
    const SUPER_ADMIN_COOKIE = "adviza_platform_admin_session";
    const SESSION_MAX_AGE_S = parseInt(process.env.SUPER_ADMIN_SESSION_MAX_AGE ?? "3600", 10);
    const raw = request.cookies.get(SUPER_ADMIN_COOKIE)?.value;
    let sessionValid = false;
    if (raw) {
      try {
        const session = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
        if (session?.adminId && session?.mfaVerified) {
          const age = (Date.now() - (session.issuedAt ?? 0)) / 1000;
          sessionValid = age < SESSION_MAX_AGE_S;
        }
      } catch { /* invalid cookie */ }
    }
    if (!sessionValid) {
      const loginUrl = new URL("/super-admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("X-Frame-Options", "DENY");
      return res;
    }

    // c. Security headers
    const res = NextResponse.next({ request });
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    return res;
  }

  // ── 2. ORG ADMIN GUARD (/org-admin/*) ───────────────────────────────────
  if (pathname.startsWith("/org-admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
    // Role check deferred to requireOrgAdmin() in layout (avoids extra DB query per-request)
    const res = supabaseResponse;
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    return res;
  }

  // ── 3. STANDARD SUPABASE AUTH (/dashboard/*, etc.) ──────────────────────
  if (!user && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
