import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Building2, Shield, Bell, Globe } from "lucide-react";

const TIMEZONES = [
  { value: "America/New_York",    label: "Eastern Time (ET) — America/New_York" },
  { value: "America/Chicago",     label: "Central Time (CT) — America/Chicago" },
  { value: "America/Denver",      label: "Mountain Time (MT) — America/Denver" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT) — America/Los_Angeles" },
  { value: "America/Anchorage",   label: "Alaska Time — America/Anchorage" },
  { value: "Pacific/Honolulu",    label: "Hawaii Time — Pacific/Honolulu" },
  { value: "Europe/London",       label: "GMT/BST — Europe/London" },
  { value: "Europe/Berlin",       label: "CET — Europe/Berlin" },
  { value: "Asia/Kolkata",        label: "IST — Asia/Kolkata" },
  { value: "Asia/Dubai",          label: "GST — Asia/Dubai" },
  { value: "Australia/Sydney",    label: "AEST — Australia/Sydney" },
];

const SESSION_TIMEOUTS = [
  { value: "1800",  label: "30 minutes" },
  { value: "3600",  label: "1 hour" },
  { value: "14400", label: "4 hours" },
  { value: "28800", label: "8 hours (advisor workday)" },
];

export default async function SettingsPage() {
  const ctx = await requireOrgAdmin();
  const supabase = await createClient();

  const { data: firm } = await supabase
    .from("firms")
    .select("name, slug, billing_email")
    .eq("id", ctx.firmId)
    .single();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#121217]">Organization Settings</h2>
        <p className="text-sm text-[#8E847C] mt-1">Manage firm profile, security, and notification preferences.</p>
      </div>

      {/* Firm Profile */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-violet-600" />
          <h3 className="font-heading text-base font-semibold text-[#121217]">Firm Profile</h3>
        </div>
        <form action="/api/org-admin/settings" method="POST" id="firm-profile-form" className="space-y-4">
          <input type="hidden" name="section" value="firm_profile" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#4A4540] block mb-1.5">Firm Name</label>
              <input
                name="name"
                id="firm-name-input"
                type="text"
                defaultValue={firm?.name ?? ""}
                className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#4A4540] block mb-1.5">Billing Email</label>
              <input
                name="billing_email"
                id="billing-email-input"
                type="email"
                defaultValue={firm?.billing_email ?? ""}
                placeholder="billing@yourfirm.com"
                className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#4A4540] block mb-1.5">Timezone</label>
            <select
              name="timezone"
              id="timezone-select"
              defaultValue="America/New_York"
              className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <p className="text-xs text-[#8E847C] mt-1.5">
              All meeting times, alerts, and scheduled reports will use this timezone (IANA format, DST-aware).
            </p>
          </div>
          <button
            type="submit"
            id="save-firm-profile"
            className="px-4 py-2 bg-[#121217] text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Save Profile
          </button>
        </form>
      </section>

      {/* Security */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-rose-500" />
          <h3 className="font-heading text-base font-semibold text-[#121217]">Security Settings</h3>
        </div>
        <div className="space-y-5">
          {/* MFA enforcement toggle */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FAF5F0] border border-[#EADBCE]">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#121217]">Require MFA for All Team Members</p>
              <p className="text-xs text-[#8E847C] mt-0.5">
                When enabled, users without MFA enrolled will be blocked on next login and prompted to set it up.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" id="mfa-enforcement-toggle" className="sr-only peer" />
              <div className="w-10 h-5 bg-[#EADBCE] peer-focus:ring-2 peer-focus:ring-violet-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>

          {/* Session timeout */}
          <div>
            <label className="text-sm font-medium text-[#4A4540] block mb-1.5">Session Timeout</label>
            <select
              id="session-timeout-select"
              name="session_timeout"
              defaultValue="3600"
              className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
            >
              {SESSION_TIMEOUTS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          id="save-security-settings"
          className="mt-5 px-4 py-2 bg-[#121217] text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Save Security Settings
        </button>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-amber-500" />
          <h3 className="font-heading text-base font-semibold text-[#121217]">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { id: "notif_new_user",     label: "New team member joined" },
            { id: "notif_user_deact",   label: "Team member deactivated" },
            { id: "notif_ai_80pct",     label: "AI request usage at 80%" },
            { id: "notif_payment_fail", label: "Payment failed" },
            { id: "notif_compliance",   label: "Compliance flag raised" },
          ].map((n) => (
            <label key={n.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id={n.id}
                defaultChecked
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
              <span className="text-sm text-[#121217]">{n.label}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          id="save-notification-settings"
          className="mt-5 px-4 py-2 bg-[#121217] text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Save Notifications
        </button>
      </section>
    </div>
  );
}
