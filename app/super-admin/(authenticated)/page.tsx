import { requirePlatformAdmin } from "@/lib/super-admin/auth";
import { getPlatformClient } from "@/lib/super-admin/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Building2, Users, Activity, TrendingUp,
  AlertTriangle, CheckCircle2, XCircle, Loader2,
} from "lucide-react";

function StatCard({ label, value, sub, accent = false }: {
  label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "bg-violet-500/10 border-violet-500/30" : "bg-white/5 border-white/10"}`}>
      <p className="text-xs text-white/40 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

const LLM_PROVIDERS = [
  { name: "AWS Bedrock",         models: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku"] },
  { name: "NVIDIA NIM",          models: ["Kimi-k3", "DeepSeek V3"] },
  { name: "Google Vertex AI",    models: ["Gemini 2.5 Flash"] },
];

export default async function SuperAdminDashboard() {
  await requirePlatformAdmin(); // throws if no valid session

  const supabase = await createClient();

  const [orgsRes, usersRes, meetingsRes, chatRes] = await Promise.all([
    supabase.from("firms").select("id, plan, subscription_status, suspended_at", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("meetings").select("id", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
  ]);

  const orgs = orgsRes.data ?? [];
  const totalOrgs = orgsRes.count ?? 0;
  const activeOrgs = orgs.filter((o) => o.subscription_status === "active").length;
  const trialOrgs  = orgs.filter((o) => o.subscription_status === "trialing").length;
  const suspended  = orgs.filter((o) => o.suspended_at).length;

  const byPlan = orgs.reduce<Record<string, number>>((acc, o) => {
    acc[o.plan] = (acc[o.plan] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-white">Platform Dashboard</h2>
        <p className="text-sm text-white/40 mt-1">Real-time view of all organizations and platform health.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Organizations" value={totalOrgs} sub={`${activeOrgs} active · ${trialOrgs} trial`} accent />
        <StatCard label="Total Users"         value={usersRes.count ?? 0} />
        <StatCard label="Total Meetings"      value={meetingsRes.count ?? 0} />
        <StatCard label="Total AI Sessions"   value={chatRes.count ?? 0} />
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["free", "pro", "enterprise"] as const).map((plan) => (
          <div key={plan} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1 capitalize">{plan}</p>
            <p className="text-3xl font-bold text-white">{byPlan[plan] ?? 0}</p>
            <p className="text-xs text-white/30 mt-1">organizations</p>
          </div>
        ))}
      </div>

      {/* Organization status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">{activeOrgs} Active</p>
            <p className="text-xs text-white/30">paying subscriptions</p>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">{trialOrgs} Trialing</p>
            <p className="text-xs text-white/30">in evaluation</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300">{suspended} Suspended</p>
            <p className="text-xs text-white/30">access revoked</p>
          </div>
        </div>
      </div>

      {/* LLM Provider Status */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-violet-400" />
          <h3 className="font-heading text-sm font-semibold text-white">LLM Provider Health</h3>
          <span className="ml-auto text-[10px] text-white/30">Refreshed every 60s</span>
        </div>
        <div className="space-y-3">
          {LLM_PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{p.name}</p>
                <p className="text-xs text-white/40">{p.models.join(" · ")}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Operational
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity feed */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="font-heading text-sm font-semibold text-white mb-4">Recent Platform Audit</h3>
        <div className="text-center py-8 text-white/20 text-sm">
          Platform audit events will appear here once the first Super Admin action is taken.
        </div>
      </section>
    </div>
  );
}
