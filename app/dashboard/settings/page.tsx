import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Brain, Building2, CreditCard, Shield, ArrowRight } from "lucide-react";
import { BillingButton } from "@/components/dashboard/billing-button";
import { MemoryManager } from "@/components/dashboard/memory-manager";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*, firms(*)").eq("id", user!.id).single();
  const firm = (profile as { firms?: { name: string; plan: string; meetings_used: number; meetings_limit: number; slug: string; stripe_customer_id?: string | null } } | null)?.firms;

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-200 mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage your advisory firm workspace and subscription</p>
      </div>

      {/* Firm Info */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Firm Details</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Firm Name</label>
            <p className="text-zinc-900 font-semibold text-sm">{firm?.name}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Workspace Slug</label>
            <p className="text-zinc-700 font-mono text-xs">{firm?.slug}</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Profile</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Name</label>
            <p className="text-zinc-900 font-semibold text-sm">{profile?.full_name}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email</label>
            <p className="text-zinc-700 text-xs">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Role</label>
            <p className="text-zinc-900 capitalize text-xs font-semibold">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan & Subscription</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 mb-3 gap-4">
          <div>
            <div className="font-bold text-sm text-zinc-900 capitalize">{firm?.plan} Tier</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {firm?.meetings_used ?? 0} / {firm?.meetings_limit ?? 10} meetings used this billing cycle
            </div>
          </div>
          <BillingButton
            plan={firm?.plan ?? "free"}
            hasCustomer={Boolean(firm?.stripe_customer_id)}
          />
        </div>
        <p className="text-xs text-zinc-400">
          Need to change tiers or configure custom RIA compliance retention? Contact{" "}
          <a href="mailto:billing@adviza.ai" className="text-zinc-900 font-semibold hover:underline">billing@adviza.ai</a>
        </p>
      </div>

      {/* Connectors & Integrations Reference */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Connectors & Tool Integrations</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your Google Calendar, Outlook, CRM, and communication tool authorizations.
          </p>
        </div>
        <Link
          href="/dashboard/connectors"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition shadow-2xs shrink-0 cursor-pointer"
        >
          <span>Open Connectors & Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mem0 AI Long-Term Memory & Adaptive Persona */}
      <div className="space-y-4">
        <MemoryManager />
      </div>

      {/* AI Stack */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Infrastructure & Security</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {[
            { name: "Workspace Tool Gateway", model: "Integration Engine (Calendar, Gmail, CRM, Slack)", status: "Active" },
            { name: "Amazon Bedrock", model: "Claude 3.5 Sonnet / Custom FinTech Embeddings", status: "Active" },
            { name: "Supabase", model: "PostgreSQL + RLS + pgvector (Encrypted at Rest)", status: "Active" },
            { name: "Resend", model: "Advisor Client Email Delivery", status: "Active" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-xs font-semibold text-zinc-900">{item.name}</p>
                <p className="text-[11px] text-zinc-500">{item.model}</p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
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
