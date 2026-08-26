import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Calendar,
  Users,
  ClipboardList,
  Shield,
  ArrowRight,
  Clock,
  TrendingUp,
  CheckCircle2,
  Brain,
  Plus,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
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
      .limit(3),
    supabase
      .from("action_items")
      .select("*", { count: "exact" })
      .eq("status", "open")
      .limit(1),
    supabase
      .from("meetings")
      .select("*, clients(full_name)")
      .order("scheduled_at", { ascending: false })
      .limit(5),
  ]);

  const firm = (profile as { firms?: { name: string; plan: string; meetings_used: number; meetings_limit: number } } | null)?.firms;

  const STATS = [
    {
      label: "Total Clients",
      value: clientCount ?? 0,
      icon: Users,
      badge: "bg-purple-100 text-purple-700",
      href: "/dashboard/clients",
    },
    {
      label: "Upcoming Meetings",
      value: upcomingMeetings?.length ?? 0,
      icon: Calendar,
      badge: "bg-rose-100 text-rose-700",
      href: "/dashboard/meetings",
    },
    {
      label: "Open Actions",
      value: actionCount ?? 0,
      icon: ClipboardList,
      badge: "bg-amber-100 text-amber-700",
      href: "/dashboard/actions",
    },
    {
      label: "Meetings This Month",
      value: firm?.meetings_used ?? 0,
      icon: TrendingUp,
      badge: "bg-emerald-100 text-emerald-700",
      href: "/dashboard/meetings",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#7A726A] mt-1">
            {firm?.name} · AI Execution Workspace
          </p>
        </div>
        <Link
          href="/dashboard/meetings/new"
          id="new-meeting-btn"
          className="btn-hero-gradient flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-full shadow-md shadow-rose-500/20 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </Link>
      </div>

      {/* Usage bar */}
      {firm && (
        <div className="bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-sm flex items-center gap-5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider">
                Monthly AI Engine Usage
              </span>
              <span className="text-xs font-bold text-[#121217]">
                {firm.meetings_used} / {firm.meetings_limit} meetings
              </span>
            </div>
            <div className="h-2 bg-[#FAF5F0] rounded-full overflow-hidden border border-[#EADBCE]/60">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (firm.meetings_used / firm.meetings_limit) * 100)}%`,
                }}
              />
            </div>
          </div>
          {firm.plan === "free" && (
            <Link
              href="/dashboard/settings?tab=billing"
              className="flex-shrink-0 px-4 py-2 bg-[#121217] hover:bg-zinc-800 text-white text-xs font-bold rounded-full transition-colors"
            >
              Upgrade
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm hover:shadow-md hover:border-[#D8CCC2] transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${stat.badge}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-heading font-extrabold text-[#121217] mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-[#7A726A] group-hover:text-[#121217] transition-colors">
                {stat.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#EADBCE]/80">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-rose-600" />
              <h2 className="font-heading font-bold text-[#121217] text-base">Upcoming Meetings</h2>
            </div>
            <Link
              href="/dashboard/meetings"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#EADBCE]/60 flex-1">
            {upcomingMeetings && upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/dashboard/meetings/${meeting.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAF5F0]/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-[#121217] text-sm truncate">
                      {(meeting as { clients?: { full_name: string } }).clients?.full_name}
                    </div>
                    <div className="text-xs text-[#7A726A] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(meeting.scheduled_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.briefing ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Briefed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-[#A89E95] group-hover:text-[#121217] transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Calendar className="w-8 h-8 text-[#A89E95] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#7A726A]">No upcoming meetings</p>
                <Link
                  href="/dashboard/meetings/new"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schedule a meeting
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#EADBCE]/80">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <h2 className="font-heading font-bold text-[#121217] text-base">Recent Meetings</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-700">LIVE FEED</span>
            </div>
          </div>

          <div className="divide-y divide-[#EADBCE]/60 flex-1">
            {recentMeetings && recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => {
                const complianceColorMap: Record<string, string> = {
                  compliant: "text-emerald-600",
                  "needs-review": "text-amber-600",
                  flagged: "text-rose-600",
                  pending: "text-[#8E847C]",
                };
                const complianceColor =
                  complianceColorMap[meeting.compliance_status || "pending"];

                return (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/meetings/${meeting.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAF5F0]/60 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[#121217] text-sm truncate">
                        {(meeting as { clients?: { full_name: string } }).clients?.full_name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#7A726A]">
                          {meeting.meeting_type}
                        </span>
                        <span className="text-[#D8CCC2]">·</span>
                        <span className="text-xs text-[#7A726A]">
                          {formatRelativeTime(meeting.scheduled_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {meeting.intelligence && (
                        <Shield className={`w-4 h-4 ${complianceColor}`} />
                      )}
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          meeting.status === "completed"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : meeting.status === "cancelled"
                            ? "text-rose-700 bg-rose-50 border-rose-200"
                            : "text-rose-700 bg-rose-50 border-rose-200"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <Brain className="w-8 h-8 text-[#A89E95] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#7A726A]">No meetings yet</p>
                <p className="text-xs text-[#8E847C] mt-1">
                  Your meeting intelligence will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Agents status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <Brain className="w-5 h-5 text-rose-600" />
          <h2 className="font-heading font-bold text-[#121217] text-base">AI Execution Engine Status</h2>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { name: "Client Briefing Agent", status: "ONLINE", tasks: "Ready for next meeting" },
            {
              name: "Meeting Intelligence Agent",
              status: "ONLINE",
              tasks: "Live transcription standby",
            },
            {
              name: "Compliance & Audit Agent",
              status: "ONLINE",
              tasks: "SEC/FINRA rules active",
            },
          ].map((agent) => (
            <div
              key={agent.name}
              className="bg-[#FAF5F0] border border-[#EADBCE] rounded-2xl p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  {agent.status}
                </span>
              </div>
              <div className="text-sm font-heading font-bold text-[#121217]">
                {agent.name}
              </div>
              <div className="text-xs text-[#7A726A] mt-1">{agent.tasks}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
