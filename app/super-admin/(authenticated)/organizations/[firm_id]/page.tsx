import { requirePlatformAdmin } from "@/lib/super-admin/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2, Users, ShieldAlert, CheckCircle2,
  Calendar, CreditCard, Cpu, ArrowLeft,
  AlertTriangle, KeyRound, UserX, ExternalLink,
} from "lucide-react";

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ firm_id: string }>;
}) {
  await requirePlatformAdmin(["super_owner", "engineering", "billing_ops", "compliance_exec", "support", "read_only"]);
  
  const { firm_id } = await params;
  const supabase = await createClient();

  const [firmRes, usersRes, clientsRes, meetingsRes] = await Promise.all([
    supabase
      .from("firms")
      .select("*")
      .eq("id", firm_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("firm_id", firm_id)
      .order("created_at", { ascending: true }),
    supabase
      .from("clients")
      .select("id, full_name, portfolio_value, created_at")
      .eq("firm_id", firm_id)
      .limit(10),
    supabase
      .from("meetings")
      .select("id, title, meeting_type, scheduled_at, status")
      .eq("firm_id", firm_id)
      .order("scheduled_at", { ascending: false })
      .limit(10),
  ]);

  const firm = firmRes.data;
  if (!firm) {
    notFound();
  }

  const users = usersRes.data ?? [];
  const clients = clientsRes.data ?? [];
  const meetings = meetingsRes.data ?? [];
  const isSuspended = !!firm.suspended_at;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/super-admin/organizations"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Organizations
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-2xl font-bold text-white">{firm.name}</h2>
              <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                isSuspended
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {isSuspended ? "Suspended" : firm.subscription_status}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {firm.plan}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1 font-mono">ID: {firm.id} · slug: {firm.slug}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* Impersonation simulation */}
          <button
            title="Read-only access as this tenant"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Impersonate (Read-Only)
          </button>
          {isSuspended ? (
            <button className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              Reactivate Organization
            </button>
          ) : (
            <button className="px-3 py-2 rounded-lg text-xs font-medium bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 transition-colors">
              Suspend Organization
            </button>
          )}
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Seats Used / Max</p>
          <p className="text-xl font-bold text-white">{users.length} / {firm.max_users ?? 3}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Client Profiles</p>
          <p className="text-xl font-bold text-white">{clients.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Meetings Used</p>
          <p className="text-xl font-bold text-white">{firm.meetings_used} / {firm.meetings_limit}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">AI Requests (mo)</p>
          <p className="text-xl font-bold text-white">{firm.ai_requests_used_this_month} / {firm.max_ai_requests_per_month}</p>
        </div>
      </div>

      {/* Users table */}
      <section className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-white">Team Members ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                <th className="px-5 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-white font-medium">{u.full_name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] uppercase font-semibold text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-white/30">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quota adjustments */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="font-heading text-sm font-semibold text-white mb-4">Quota & Contract Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-white/40 block mb-1">Max Licensed Seats</label>
            <input
              type="number"
              defaultValue={firm.max_users ?? 3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-white/40 block mb-1">Monthly AI Request Quota</label>
            <input
              type="number"
              defaultValue={firm.max_ai_requests_per_month ?? 500}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-white/40 block mb-1">Customer Success Owner</label>
            <input
              type="text"
              defaultValue={firm.cs_owner ?? ""}
              placeholder="e.g. Sarah J."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
          Save Overrides
        </button>
      </section>
    </div>
  );
}
