import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle, Brain, ChevronRight, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SyncCalendarButton } from "@/components/meetings/sync-calendar-button";
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
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">Meetings</h1>
          <p className="text-sm text-[#7A726A] mt-1">{meetings?.length ?? 0} total · {upcoming.length} upcoming</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncCalendarButton />
          <Link href="/dashboard/meetings/new" id="new-meeting-btn"
            className="btn-hero-gradient flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-full shadow-md shadow-rose-500/20 transition-transform hover:scale-105">
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </Link>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Upcoming Meetings</h2>
          <div className="space-y-3">
            {upcoming.map((meeting) => {
              const config = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled;
              return (
                <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EADBCE] shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-md hover:border-[#D8CCC2] transition-all group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-0.5">
                        <span className="font-heading font-bold text-[#121217] text-sm sm:text-base">
                          {(meeting as { clients?: { full_name: string } }).clients?.full_name}
                        </span>
                        <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#7A726A]" suppressHydrationWarning>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(meeting.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="text-[#D8CCC2]">·</span>
                        <span className="capitalize">{meeting.meeting_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EADBCE]/50">
                    {meeting.briefing
                      ? <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 rounded-full"><Brain className="w-3.5 h-3.5" />Briefed</span>
                      : <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-1 rounded-full"><Brain className="w-3.5 h-3.5" />No briefing</span>
                    }
                    <ChevronRight className="w-4 h-4 text-[#A89E95] group-hover:text-[#121217] transition-colors ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Past Meetings</h2>
          <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden divide-y divide-[#EADBCE]/60">
            {past.map((meeting) => {
              const config = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.completed;
              return (
                <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAF5F0]/60 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-[#121217] text-sm">
                        {(meeting as { clients?: { full_name: string } }).clients?.full_name}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#7A726A]">
                      <span>{formatDate(meeting.scheduled_at)}</span>
                      <span className="text-[#D8CCC2]">·</span>
                      <span className="capitalize">{meeting.meeting_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {meeting.intelligence && <Brain className="w-4 h-4 text-rose-600" />}
                    {meeting.compliance_record && (
                      <Shield className={`w-4 h-4 ${
                        meeting.compliance_status === "compliant" ? "text-emerald-600"
                        : meeting.compliance_status === "flagged" ? "text-rose-600"
                        : "text-amber-600"
                      }`} />
                    )}
                    <ChevronRight className="w-4 h-4 text-[#A89E95] group-hover:text-[#121217] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!meetings || meetings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm py-20 text-center">
          <Calendar className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
          <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No meetings yet</h3>
          <p className="text-sm text-[#7A726A] mb-6">Schedule your first meeting and let AI handle the rest</p>
          <Link href="/dashboard/meetings/new"
            className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full shadow-md">
            <Plus className="w-4 h-4" /><span>Schedule First Meeting</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
