import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Compliance" };

const statusConfig: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  compliant: { icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Compliant" },
  "needs-review": { icon: AlertTriangle, color: "text-amber-800 bg-amber-50 border-amber-200", label: "Needs Review" },
  flagged: { icon: XCircle, color: "text-rose-700 bg-rose-50 border-rose-200", label: "Flagged" },
  pending: { icon: Shield, color: "text-zinc-700 bg-zinc-100 border-zinc-200", label: "Pending" },
};

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, scheduled_at, compliance_status, compliance_record, meeting_type, clients(full_name)")
    .not("compliance_record", "is", null)
    .order("scheduled_at", { ascending: false });

  const { data: pendingMeetings } = await supabase
    .from("meetings")
    .select("id, title, scheduled_at, meeting_type, clients(full_name)")
    .eq("status", "completed")
    .is("compliance_record", null);

  const stats = {
    compliant: meetings?.filter((m) => m.compliance_status === "compliant").length ?? 0,
    needsReview: meetings?.filter((m) => m.compliance_status === "needs-review").length ?? 0,
    flagged: meetings?.filter((m) => m.compliance_status === "flagged").length ?? 0,
    pending: pendingMeetings?.length ?? 0,
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">Compliance & Audit</h1>
        <p className="text-sm text-[#7A726A] mt-1">Immutable audit trail and regulatory compliance records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Compliant", value: stats.compliant, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Needs Review", value: stats.needsReview, color: "text-amber-800", bg: "bg-amber-50 border-amber-100" },
          { label: "Flagged", value: stats.flagged, color: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
          { label: "Pending", value: stats.pending, color: "text-zinc-700", bg: "bg-zinc-100 border-zinc-200" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm text-center">
            <div className={`text-4xl font-heading font-extrabold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold text-[#8E847C] uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending compliance records */}
      {pendingMeetings && pendingMeetings.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />Awaiting Compliance Record ({pendingMeetings.length})
          </h2>
          <div className="space-y-3">
            {pendingMeetings.map((m) => (
              <Link key={m.id} href={`/dashboard/meetings/${m.id}?tab=compliance`}
                className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-amber-300 transition-all group bg-amber-50/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-[#121217] text-sm">{(m as { clients?: { full_name: string } }).clients?.full_name}</div>
                  <div className="text-xs text-[#7A726A] mt-0.5">{m.meeting_type} · {formatDate(m.scheduled_at)}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Records */}
      {meetings && meetings.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Compliance Records</h2>
          <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden divide-y divide-[#EADBCE]/60">
            {meetings.map((meeting) => {
              const status = meeting.compliance_status || "pending";
              const config = statusConfig[status] || statusConfig.pending;
              const Icon = config.icon;
              const record = meeting.compliance_record as { recordId?: string } | null;

              return (
                <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}?tab=compliance`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAF5F0]/60 transition-colors group">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-[#121217] text-sm">{(meeting as { clients?: { full_name: string } }).clients?.full_name}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#7A726A]">
                      {record?.recordId && <span className="font-mono text-rose-600 font-bold">{record.recordId}</span>}
                      <span>·</span>
                      <span>{formatDate(meeting.scheduled_at)}</span>
                      <span>·</span>
                      <span className="capitalize">{meeting.meeting_type}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A89E95] group-hover:text-[#121217] transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!meetings?.length && !pendingMeetings?.length && (
        <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm py-20 text-center">
          <Shield className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
          <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No compliance records yet</h3>
          <p className="text-sm text-[#7A726A]">Process meeting transcripts to auto-generate compliance records</p>
        </div>
      )}
    </div>
  );
}
