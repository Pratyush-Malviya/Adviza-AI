import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type OrgAdminRole = "owner" | "compliance";

export interface OrgAdminContext {
  userId: string;
  firmId: string;
  role: OrgAdminRole;
  firmName: string;
  plan: string;
}

// ---------------------------------------------------------------------------
// Require org admin role from server component.
// Redirects to /dashboard if the user is authenticated but lacks the role.
// ---------------------------------------------------------------------------
export async function requireOrgAdmin(): Promise<OrgAdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, firm_id, firms(name, plan)")
    .eq("id", user.id)
    .single();

  if (!profile || !["owner", "compliance"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const firm = profile.firms as { name: string; plan: string } | null;

  return {
    userId: user.id,
    firmId: profile.firm_id,
    role: profile.role as OrgAdminRole,
    firmName: firm?.name ?? "",
    plan: firm?.plan ?? "free",
  };
}
