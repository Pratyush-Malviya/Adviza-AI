import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { getOrgUsageLimits } from "@/lib/org-admin/limits";
import Link from "next/link";
import { CreditCard, TrendingUp, AlertTriangle, Receipt, ExternalLink } from "lucide-react";

const PLAN_FEATURES: Record<string, string[]> = {
  free:       ["1 advisor seat", "10 client profiles", "100 AI requests/month", "Basic meeting dossiers"],
  pro:        ["3 advisor seats", "100 clients", "500 AI requests/month", "Deep Research", "Web Search", "Multi-model AI routing", "Workflow canvas"],
  enterprise: ["Unlimited seats", "Unlimited clients", "5,000 AI requests/month", "FIX trading simulation", "Compliance PDF export", "API access", "White-label", "Priority support"],
};

const PLAN_PRICES: Record<string, string> = {
  free: "$0/month",
  pro: "$299/month",
  enterprise: "Custom",
};

function UsageMeter({ label, used, max, pct }: {
  label: string; used: number; max: number; pct: number;
}) {
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="p-4 bg-[#FAF5F0] rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#4A4540]">{label}</span>
        <span className={`text-sm font-semibold ${pct >= 80 ? "text-amber-600" : "text-[#121217]"}`}>
          {used}/{max}
        </span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden border border-[#EADBCE]">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {pct >= 80 && (
        <p className="text-xs text-amber-600 mt-1">
          {pct >= 100 ? "Limit reached" : `${100 - pct}% remaining`}
        </p>
      )}
    </div>
  );
}

export default async function BillingPage() {
  const ctx = await requireOrgAdmin();
  const limits = await getOrgUsageLimits(ctx.firmId);

  const currentFeatures = PLAN_FEATURES[ctx.plan] ?? PLAN_FEATURES.free;
  const nextPlan = ctx.plan === "free" ? "pro" : ctx.plan === "pro" ? "enterprise" : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#121217]">Billing & Subscription</h2>
        <p className="text-sm text-[#8E847C] mt-1">
          Manage your plan, usage, and payment details.
        </p>
      </div>

      {/* Current Plan */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-heading text-base font-semibold text-[#121217]">Current Plan</h3>
            <p className="text-xs text-[#8E847C] mt-0.5">Renews automatically unless cancelled</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#121217] capitalize">{ctx.plan}</p>
            <p className="text-sm text-[#8E847C]">{PLAN_PRICES[ctx.plan] ?? "Custom"}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-[#4A4540] mb-3">What's included:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-[#4A4540]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Stripe Customer Portal */}
          <a
            href="/api/org-admin/billing/portal"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#121217] text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Manage Payment Method
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          {nextPlan && (
            <Link
              href="/org-admin/billing/upgrade"
              className="flex items-center gap-2 px-4 py-2.5 border border-violet-300 text-violet-700 bg-violet-50 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade to {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}
            </Link>
          )}
        </div>
      </section>

      {/* Usage Meters */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <h3 className="font-heading text-base font-semibold text-[#121217] mb-5">
          Current Usage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UsageMeter label="Team Seats"             {...limits.users}      />
          <UsageMeter label="Client Profiles"        {...limits.clients}    />
          <UsageMeter label="Meetings (this month)"  {...limits.meetings}   />
          <UsageMeter label="AI Requests (this month)" {...limits.aiRequests} />
        </div>

        {/* Upgrade prompt when hitting limits */}
        {(limits.users.pct >= 100 || limits.aiRequests.pct >= 90) && (
          <div className="mt-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              You're approaching or at your plan limits.{" "}
              <Link href="/org-admin/billing/upgrade" className="font-semibold underline">
                Upgrade your plan
              </Link>{" "}
              to continue without interruption.
            </p>
          </div>
        )}
      </section>

      {/* Invoice History placeholder */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-base font-semibold text-[#121217]">
            Invoice History
          </h3>
          <span className="text-xs text-[#8E847C]">Last 24 months</span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center text-[#8E847C]">
          <Receipt className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">Invoice history is managed via your Stripe billing portal.</p>
          <a
            href="/api/org-admin/billing/portal"
            className="mt-3 text-sm text-violet-600 hover:underline inline-flex items-center gap-1"
          >
            Open Billing Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>
    </div>
  );
}
