import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { ChatPanelWrapper } from "@/components/chat/chat-panel-wrapper";

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
    <div className="flex h-screen bg-[#FBFBFB] text-zinc-900 overflow-hidden selection:bg-zinc-200 selection:text-zinc-900 font-sans">
      <DashboardSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        <DashboardHeader profile={profile} user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16 md:pb-8 relative bg-white">
          {children}
          <ChatPanelWrapper />
        </main>
      </div>
    </div>
  );
}
