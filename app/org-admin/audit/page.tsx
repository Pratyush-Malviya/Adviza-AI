import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Download, Filter, FileText, Shield } from "lucide-react";

const PRESET_REPORTS = [
  {
    id: "ai_comms_90d",
    label: "AI-Assisted Client Communications",
    desc: "All AI-generated or AI-assisted communications sent to clients (last 90 days)",
    period: "Last 90 days",
  },
  {
    id: "portfolio_proposals_12m",
    label: "Portfolio Rebalancing Proposals",
    desc: "All rebalancing proposals generated, with advisor approval status (last 12 months)",
    period: "Last 12 months",
  },
  {
    id: "user_logins_90d",
    label: "User Login Events",
    desc: "All login events with IP addresses and devices (last 90 days)",
    period: "Last 90 days",
  },
  {
    id: "tool_executions_90d",
    label: "External Tool Executions",
    desc: "All Composio actions and integrations executed, with HITL approval status (last 90 days)",
    period: "Last 90 days",
  },
];

export default async function AuditPage() {
  const ctx = await requireOrgAdmin();
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, user_id, metadata, ip_address, sha256_hash, created_at")
    .eq("firm_id", ctx.firmId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#121217]">Audit & Evidence</h2>
          <p className="text-sm text-[#8E847C] mt-1">
            Immutable record of all activity within {ctx.firmName}.
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
              <Shield className="w-3 h-3" />
              SHA-256 hash-verified
            </span>
          </p>
        </div>
        <a
          href={`/api/org-admin/audit/export?firm_id=${ctx.firmId}&format=csv`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#121217] text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      {/* Preset CCO Reports */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <h3 className="font-heading text-base font-semibold text-[#121217] mb-4">
          CCO Compliance Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_REPORTS.map((r) => (
            <a
              key={r.id}
              href={`/api/org-admin/audit/export?firm_id=${ctx.firmId}&report=${r.id}&format=pdf`}
              className="group flex gap-3 p-4 rounded-lg border border-[#EADBCE] hover:border-violet-200 hover:bg-violet-50/30 transition-colors"
            >
              <FileText className="w-5 h-5 text-[#8E847C] group-hover:text-violet-600 transition-colors flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#121217] group-hover:text-violet-700">
                  {r.label}
                </p>
                <p className="text-xs text-[#8E847C] mt-0.5">{r.desc}</p>
                <span className="inline-block mt-1.5 text-[10px] font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                  {r.period}
                </span>
              </div>
              <Download className="w-4 h-4 text-[#8E847C] group-hover:text-violet-600 ml-auto flex-shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Full Audit Log */}
      <section className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EADBCE] flex items-center gap-3">
          <h3 className="font-heading text-base font-semibold text-[#121217] flex-1">
            Full Audit Log
          </h3>
          <span className="text-xs text-[#8E847C]">Last 50 events</span>
        </div>

        {logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAF5F0] text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-[#8E847C] uppercase tracking-wide">Timestamp</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8E847C] uppercase tracking-wide">Action</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8E847C] uppercase tracking-wide">Entity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8E847C] uppercase tracking-wide">IP</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8E847C] uppercase tracking-wide">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE4]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF5F0] transition-colors">
                    <td className="px-6 py-3 text-xs text-[#8E847C] whitespace-nowrap font-mono">
                      {new Date(log.created_at).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#121217] max-w-[180px] truncate">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-[#4A4540]">{log.entity_type ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#8E847C] font-mono">{log.ip_address ?? "—"}</td>
                    <td className="px-4 py-3 text-[10px] text-[#8E847C] font-mono max-w-[80px] truncate" title={log.sha256_hash ?? ""}>
                      {log.sha256_hash ? log.sha256_hash.slice(0, 12) + "…" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[#8E847C]">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No audit events recorded yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
