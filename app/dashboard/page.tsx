import { createClient } from "@/lib/supabase/server";
import { DashboardContentClient } from "./dashboard-content-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = resolvedParams?.tab || "generate";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { count: clientCount },
    { data: upcomingMeetings },
    { count: actionCount },
    { data: recentMeetings },
  ] = await Promise.all([
    supabase.from("profiles").select("*, firms(*)").eq("id", user!.id).single(),
    supabase.from("clients").select("*", { count: "exact" }).limit(1),
    supabase
      .from("meetings")
      .select("*, clients(full_name)")
      .gte("scheduled_at", new Date().toISOString())
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("action_items")
      .select("*", { count: "exact" })
      .eq("status", "open")
      .limit(1),
    supabase
      .from("meetings")
      .select("*, clients(full_name)")
      .order("scheduled_at", { ascending: false })
      .limit(8),
  ]);

  const firm = (profile as { firms?: { name: string; plan: string; meetings_used: number; meetings_limit: number } } | null)?.firms;

  return (
    <DashboardContentClient
      initialTab={initialTab}
      profile={profile}
      firm={firm}
      clientCount={clientCount ?? 0}
      actionCount={actionCount ?? 0}
      upcomingMeetings={upcomingMeetings ?? []}
      recentMeetings={recentMeetings ?? []}
    />
  );
}
