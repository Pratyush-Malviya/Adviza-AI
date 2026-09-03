import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { getOrgUsageLimits } from "@/lib/org-admin/limits";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users, UserPlus, CreditCard, ShieldCheck,
  CheckCircle2, AlertTriangle, TrendingUp, Activity,
  ArrowRight,
} from "lucide-react";

function UsageMeter({
  label, used, max, pct, warn = 80, critical = 100,
}: {
  label: string; used: number; max: number; pct: number;
  warn?: number; critical?: number;
}) {
  const color =
    pct >= critical ? "bg-red-500" :
    pct >= warn     ? "bg-amber-400" :
                      "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#4A4540]">{label}</span>
        <span className={`font-semibold ${pct >= warn ? "text-amber-600" : "text-[#121217]"}`}>
          {used} / {max}
        </span>
      </div>
      <div className="h-2 bg-[#F0EAE4] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default async function OrgAdminOverviewPage() {
  const ctx = await requireOrgAdmin();
  const supabase = await createClient();
  const limits = await getOrgUsageLimits(ctx.firmId);

  // Fetch recent team members
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("firm_id", ctx.firmId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent audit activity
  const { data: recentAudit } = await supabase
    .from("audit_logs")
    .select("id, action, user_id, created_at")
    .eq("firm_id", ctx.firmId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Onboarding checklist
  const checklist = [
    { label: "Set up regulatory profile",  done: !!(ctx as any).regulatoryProfile },
    { label: "Invite first team member",   done: (members?.length ?? 0) > 1 },
    { label: "Connect CRM integration",    done: false },
    { label: "Configure MFA for all users", done: false },
  ];
  const onboardingPct = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100
  );

  const QUICK_ACTIONS = [
    { href: "/org-admin/team",       icon: UserPlus,    label: "Invite Team Member", disabled: !limits.users.canAdd },
    { href: "/org-admin/billing",    icon: CreditCard,  label: "View Billing" },
    { href: "/org-admin/compliance", icon: ShieldCheck, label: "Configure Compliance" },
    { href: "/org-admin/audit",      icon: Activity,    label: "Export Audit Report" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#121217]">
          {ctx.firmName}
        </h2>
        <p className="text-sm text-[#8E847C] mt-1">
          Organization overview · <span className="capitalize">{ctx.plan}</span> plan
          {" "}·{" "}
          <span className={`font-medium ${limits.users.canAdd ? "text-emerald-600" : "text-red-500"}`}>
            {limits.users.used}/{limits.users.max} seats used
          </span>
        </p>
      </div>

      {/* Usage meters */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <h3 className="font-heading text-base font-semibold text-[#121217] mb-5">
          Plan Usage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UsageMeter label="Team Seats"    {...limits.users}      />
          <UsageMeter label="Clients"       {...limits.clients}    />
          <UsageMeter label="Meetings"      {...limits.meetings}   />
          <UsageMeter label="AI Requests (this month)" {...limits.aiRequests} />
        </div>
        {(!limits.users.canAdd || limits.aiRequests.pct >= 80) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {!limits.users.canAdd
              ? "Seat limit reached. Upgrade your plan to add more team members."
              : "AI request usage is high. Consider upgrading to avoid hitting your limit."}
            <Link href="/org-admin/billing" className="ml-auto text-amber-700 font-medium hover:underline">
              Upgrade →
            </Link>
          </div>
        )}
      </section>

      {/* Onboarding + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarding */}
        <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-semibold text-[#121217]">
              Setup Checklist
            </h3>
            <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
              {onboardingPct}%
            </span>
          </div>
          <div className="space-y-3">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#EADBCE] flex-shrink-0" />
                )}
                <span className={`text-sm ${item.done ? "line-through text-[#8E847C]" : "text-[#121217]"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
          <h3 className="font-heading text-base font-semibold text-[#121217] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, disabled }) => (
              <Link
                key={href}
                href={disabled ? "#" : href}
                aria-disabled={disabled}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors group ${
                  disabled
                    ? "border-[#EADBCE] bg-[#FAF5F0] opacity-50 cursor-not-allowed pointer-events-none"
                    : "border-[#EADBCE] bg-white hover:bg-[#FAF5F0] hover:border-violet-200"
                }`}
              >
                <Icon className="w-4 h-4 text-[#8E847C] group-hover:text-violet-600 transition-colors" />
                <span className="text-sm text-[#121217]">{label}</span>
                <ArrowRight className="w-3 h-3 text-[#8E847C] ml-auto group-hover:text-violet-600 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-semibold text-[#121217]">
            Recent Activity
          </h3>
          <Link href="/org-admin/audit" className="text-xs text-violet-600 hover:underline">
            View full audit log →
          </Link>
        </div>
        {recentAudit && recentAudit.length > 0 ? (
          <div className="divide-y divide-[#F0EAE4]">
            {recentAudit.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                <span className="text-sm text-[#121217] flex-1">{log.action}</span>
                <span className="text-xs text-[#8E847C]">
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8E847C]">No recent activity.</p>
        )}
      </section>
    </div>
  );
}
