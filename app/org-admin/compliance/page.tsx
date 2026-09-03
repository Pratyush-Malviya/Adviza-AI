import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Building2, Globe, Clock, Bell } from "lucide-react";

const REGULATORY_TYPES = [
  { value: "ria_sec",      label: "SEC-Registered Investment Adviser" },
  { value: "ria_state",    label: "State-Registered Investment Adviser" },
  { value: "bd",           label: "FINRA-Registered Broker-Dealer" },
  { value: "hybrid",       label: "Hybrid (Dual-Registered RIA + BD)" },
  { value: "private_fund", label: "Private Fund Adviser (Exempt Reporting)" },
  { value: "other",        label: "Other" },
];

export default async function CompliancePage() {
  const ctx = await requireOrgAdmin();
  const supabase = await createClient();

  const { data: firm } = await supabase
    .from("firms")
    .select("name, regulatory_profile, billing_email")
    .eq("id", ctx.firmId)
    .single();

  const profile = (firm?.regulatory_profile as Record<string, string> | null) ?? {};

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#121217]">Compliance & Policy</h2>
        <p className="text-sm text-[#8E847C] mt-1">
          Configure your firm's regulatory profile and approval rules. These settings determine which compliance controls are active.
        </p>
      </div>

      {/* Regulatory Profile */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-4 h-4 text-violet-600" />
          <h3 className="font-heading text-base font-semibold text-[#121217]">Regulatory Profile</h3>
        </div>
        <form action="/api/org-admin/settings" method="POST" id="regulatory-profile-form" className="space-y-5">
          <input type="hidden" name="section" value="regulatory_profile" />

          <div>
            <label className="text-sm font-medium text-[#4A4540] block mb-1.5">
              Firm Registration Type
            </label>
            <select
              name="reg_type"
              defaultValue={profile.type ?? "ria_sec"}
              id="reg-type-select"
              className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
            >
              {REGULATORY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs text-[#8E847C] mt-1.5">
              Determines which compliance templates, HITL approval rules, and evidence export formats are active.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#4A4540] block mb-1.5">
                CRD / IARD Number
              </label>
              <input
                name="crd_number"
                type="text"
                id="crd-number-input"
                defaultValue={profile.crd_number ?? ""}
                placeholder="123456"
                className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#4A4540] block mb-1.5">
                State of Registration
              </label>
              <input
                name="state"
                type="text"
                id="state-input"
                defaultValue={profile.state ?? ""}
                placeholder="CA (if State-registered)"
                className="w-full border border-[#EADBCE] rounded-lg px-3 py-2.5 text-sm text-[#121217] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            id="save-regulatory-profile"
            className="px-4 py-2 bg-[#121217] text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Save Regulatory Profile
          </button>
        </form>
      </section>

      {/* CCO Approval Rules */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <h3 className="font-heading text-base font-semibold text-[#121217]">CCO Approval Rules</h3>
        </div>
        <div className="space-y-4">
          {[
            { id: "cco_approve_comms",   label: "Client communications require CCO review",         desc: "All AI-drafted emails and letters to clients must be reviewed before sending." },
            { id: "cco_approve_trades",  label: "Trade proposals above threshold require CCO sign-off", desc: "Any rebalancing proposal above $50,000 triggers CCO approval workflow." },
            { id: "cco_approve_research", label: "Deep Research reports require CCO review",         desc: "AI-generated investment research reports must be reviewed before sharing." },
          ].map((rule) => (
            <label key={rule.id} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id={rule.id}
                defaultChecked
                className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-[#121217] group-hover:text-violet-700 transition-colors">{rule.label}</p>
                <p className="text-xs text-[#8E847C] mt-0.5">{rule.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <button
          type="button"
          id="save-cco-rules"
          className="mt-5 px-4 py-2 bg-[#121217] text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Save Approval Rules
        </button>
      </section>
    </div>
  );
}
