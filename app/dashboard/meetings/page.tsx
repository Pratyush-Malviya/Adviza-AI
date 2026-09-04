import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle, Brain, ChevronRight, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SyncCalendarButton } from "@/components/meetings/sync-calendar-button";
import { SeedDemoButton } from "@/components/dashboard/seed-demo-button";
import type { Meeting } from "@/types/supabase";

type MeetingRow = Meeting & { clients: { full_name: string } | null };

export const metadata = { title: "Meetings" };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  scheduled: { label: "Scheduled", color: "text-rose-700 bg-rose-50 border-rose-200", icon: Clock },
  completed: { label: "Completed", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-700 bg-red-50 border-red-200", icon: AlertCircle },
  "in-progress": { label: "In Progress", color: "text-amber-800 bg-amber-50 border-amber-200", icon: Clock },
};

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: meetingsRaw } = await supabase
    .from("meetings")
    .select("*, clients(full_name, portfolio_value)")
    .order("scheduled_at", { ascending: false });

  const meetings = (meetingsRaw ?? []) as unknown as MeetingRow[];
  const upcoming = meetings.filter((m) => m.status === "scheduled");
  const past = meetings.filter((m) => m.status !== "scheduled");

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Meetings</h1>
          <p className="text-xs text-zinc-500 mt-1">{meetings?.length ?? 0} total · {upcoming.length} upcoming</p>
        </div>
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <SeedDemoButton />
          <SyncCalendarButton />
          <Link href="/dashboard/meetings/new" id="new-meeting-btn"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>New Meeting</span>
          </Link>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Upcoming Meetings</h2>
          <div className="space-y-2.5">
            {upcoming.map((meeting) => {
              const config = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled;
              return (
                <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}
                  className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:border-zinc-300 transition-all group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-800">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-0.5">
                        <span className="font-semibold text-zinc-900 text-sm">
                          {(meeting as { clients?: { full_name: string } }).clients?.full_name}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-400" suppressHydrationWarning>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(meeting.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span>·</span>
                        <span className="capitalize">{meeting.meeting_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    {meeting.briefing
                      ? <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"><Brain className="w-3 h-3" />Briefed</span>
                      : <span className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full"><Brain className="w-3 h-3" />No briefing</span>
                    }
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 transition-colors ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Past Meetings</h2>
          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-2xs overflow-hidden divide-y divide-zinc-100">
            {past.map((meeting) => {
              const config = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.completed;
              return (
                <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/70 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-zinc-900 text-sm">
                        {(meeting as { clients?: { full_name: string } }).clients?.full_name}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                      <span>{formatDate(meeting.scheduled_at)}</span>
                      <span>·</span>
                      <span className="capitalize">{meeting.meeting_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {meeting.intelligence && <Brain className="w-4 h-4 text-zinc-700" />}
                    {meeting.compliance_record && (
                      <Shield className={`w-4 h-4 ${
                        meeting.compliance_status === "compliant" ? "text-emerald-600"
                        : meeting.compliance_status === "flagged" ? "text-rose-600"
                        : "text-amber-600"
                      }`} />
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {(!meetings || meetings.length === 0) && (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-2xs py-16 text-center">
          <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900 mb-1">No meetings yet</h3>
          <p className="text-xs text-zinc-500 mb-5">Schedule your first meeting and let AI handle the rest</p>
          <Link href="/dashboard/meetings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs">
            <Plus className="w-3.5 h-3.5" /><span>Schedule First Meeting</span>
          </Link>
        </div>
      )}
    </div>
  );
}
