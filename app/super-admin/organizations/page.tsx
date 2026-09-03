import { requirePlatformAdmin } from "@/lib/super-admin/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Building2, AlertTriangle, CheckCircle2, Search, Plus } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  trialing:  "bg-amber-400/10  text-amber-400  border-amber-400/20",
  past_due:  "bg-red-400/10    text-red-400    border-red-400/20",
  suspended: "bg-red-600/10    text-red-500    border-red-500/20",
  cancelled: "bg-white/5       text-white/30   border-white/10",
  paused:    "bg-white/5       text-white/40   border-white/10",
};

const PLAN_STYLES: Record<string, string> = {
  free:       "bg-white/5     text-white/40",
  pro:        "bg-violet-500/10 text-violet-400",
  enterprise: "bg-amber-400/10  text-amber-400",
};

export default async function OrganizationsPage() {
  await requirePlatformAdmin(["super_owner", "engineering", "billing_ops", "compliance_exec", "support", "read_only"]);

  const supabase = await createClient();

  // Fetch all firms with basic stats
  const { data: firms } = await supabase
    .from("firms")
    .select(`
      id, name, slug, plan, subscription_status,
      max_users, meetings_used, meetings_limit,
      suspended_at, trial_ends_at, created_at,
      stripe_customer_id
    `)
    .order("created_at", { ascending: false });

  // Count users and clients per firm (simple join)
  const { data: userCounts } = await supabase
    .from("profiles")
    .select("firm_id");

  const { data: clientCounts } = await supabase
    .from("clients")
    .select("firm_id");

  const userByFirm = (userCounts ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.firm_id] = (acc[p.firm_id] ?? 0) + 1;
    return acc;
  }, {});
  const clientByFirm = (clientCounts ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.firm_id] = (acc[c.firm_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Organizations</h2>
          <p className="text-sm text-white/40 mt-1">All {firms?.length ?? 0} organizations across the platform.</p>
        </div>
        <Link
          href="/super-admin/organizations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Organization</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Plan</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Users</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Clients</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Meetings</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Stripe</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(firms ?? []).map((firm) => {
                const users = userByFirm[firm.id] ?? 0;
                const clients = clientByFirm[firm.id] ?? 0;
                const statusKey = firm.suspended_at ? "suspended" : (firm.subscription_status ?? "trialing");
                return (
                  <tr key={firm.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-rose-500/30 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-[160px]">{firm.name}</p>
                          <p className="text-[10px] text-white/30 font-mono">{firm.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${PLAN_STYLES[firm.plan] ?? PLAN_STYLES.free}`}>
                        {firm.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold capitalize border px-2 py-0.5 rounded-full ${STATUS_STYLES[statusKey] ?? STATUS_STYLES.trialing}`}>
                        {statusKey}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white/60">
                      {users}/{firm.max_users ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white/60">{clients}</td>
                    <td className="px-4 py-3.5 text-sm text-white/60">
                      {firm.meetings_used}/{firm.meetings_limit}
                    </td>
                    <td className="px-4 py-3.5">
                      {firm.stripe_customer_id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/30">
                      {new Date(firm.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/super-admin/organizations/${firm.id}`}
                        className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
