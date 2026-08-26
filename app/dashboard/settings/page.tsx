import { createClient } from "@/lib/supabase/server";
import { Brain, Building2, CreditCard, Shield } from "lucide-react";
import { BillingButton } from "@/components/dashboard/billing-button";
import { IntegrationsHub } from "@/components/dashboard/integrations-hub";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*, firms(*)").eq("id", user!.id).single();
  const firm = (profile as { firms?: { name: string; plan: string; meetings_used: number; meetings_limit: number; slug: string; stripe_customer_id?: string | null } } | null)?.firms;

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">Settings</h1>
        <p className="text-sm text-[#7A726A] mt-1">Manage your advisory firm workspace and subscription</p>
      </div>

      {/* Firm Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 mb-2">
          <Building2 className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-heading font-bold text-[#121217] uppercase tracking-wider">Firm Details</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-1">Firm Name</label>
            <p className="text-[#121217] font-bold text-base">{firm?.name}</p>
          </div>
          <div>
            <label className="block text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-1">Workspace Slug</label>
            <p className="text-[#121217] font-mono text-sm">{firm?.slug}</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 mb-2">
          <Shield className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-heading font-bold text-[#121217] uppercase tracking-wider">Your Profile</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-1">Name</label>
            <p className="text-[#121217] font-bold text-sm">{profile?.full_name}</p>
          </div>
          <div>
            <label className="block text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-1">Email</label>
            <p className="text-[#121217] text-sm">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-1">Role</label>
            <p className="text-[#121217] capitalize text-sm font-semibold">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <CreditCard className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-heading font-bold text-[#121217] uppercase tracking-wider">Plan & Subscription</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#FAF5F0] rounded-2xl border border-[#EADBCE] mb-4 gap-4">
          <div>
            <div className="font-heading font-extrabold text-lg text-[#121217] capitalize">{firm?.plan} Tier</div>
            <div className="text-xs text-[#7A726A] mt-1 font-medium">
              {firm?.meetings_used ?? 0} / {firm?.meetings_limit ?? 10} meetings used this billing cycle
            </div>
          </div>
          <BillingButton
            plan={firm?.plan ?? "free"}
            hasCustomer={Boolean(firm?.stripe_customer_id)}
          />
        </div>
        <p className="text-xs text-[#7A726A]">
          Need to change tiers or configure custom RIA compliance retention? Contact{" "}
          <a href="mailto:billing@adviza.ai" className="text-rose-600 font-bold hover:underline">billing@adviza.ai</a>
        </p>
      </div>

      {/* Connected Tools & Workspace Integrations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
        <IntegrationsHub />
      </div>

      {/* AI Stack */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <Brain className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-heading font-bold text-[#121217] uppercase tracking-wider">AI Infrastructure & Security</h2>
        </div>
        <div className="divide-y divide-[#EADBCE]/60">
          {[
            { name: "Workspace Tool Gateway", model: "Integration Engine (Calendar, Gmail, CRM, Slack)", status: "Active" },
            { name: "Amazon Bedrock", model: "Claude 3.5 Sonnet / Custom FinTech Embeddings", status: "Active" },
            { name: "Supabase", model: "PostgreSQL + RLS + pgvector (Encrypted at Rest)", status: "Active" },
            { name: "Resend", model: "Advisor Client Email Delivery", status: "Active" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-heading font-bold text-[#121217]">{item.name}</p>
                <p className="text-xs text-[#7A726A]">{item.model}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
