import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, firms(*)")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-[#FAF5F0] text-[#121217] overflow-hidden selection:bg-rose-200 selection:text-rose-900">
      <DashboardSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF5F0]">
        <DashboardHeader profile={profile} user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
