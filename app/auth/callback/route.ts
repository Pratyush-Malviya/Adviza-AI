import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      const user = data.user;
      
      // Ensure user profile and firm exist (especially for OAuth signups)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, firm_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Advisor";
        const firmName = user.user_metadata?.firm_name || `${userName}'s Advisory`;
        const firmSlug = `firm-${user.id.slice(0, 8)}`;

        const { data: newFirm } = await supabase
          .from("firms")
          .insert({
            name: firmName,
            slug: firmSlug,
            plan: "free",
            meetings_limit: 10,
            meetings_used: 0,
          })
          .select("id")
          .single();

        if (newFirm) {
          await supabase.from("profiles").insert({
            id: user.id,
            firm_id: newFirm.id,
            email: user.email || "",
            full_name: userName,
            role: "owner",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
