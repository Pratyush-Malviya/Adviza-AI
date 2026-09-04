"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, User, Mail, Phone, DollarSign, Target, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative", desc: "Capital preservation priority" },
  { value: "moderate", label: "Moderate", desc: "Balanced growth and safety" },
  { value: "aggressive", label: "Aggressive", desc: "Maximum growth focus" },
];

const GOAL_OPTIONS = [
  "Retirement Planning",
  "Wealth Accumulation",
  "Income Generation",
  "Estate Planning",
  "Tax Optimization",
  "Education Funding",
  "Business Sale",
  "Real Estate Investment",
];

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    portfolio_value: "",
    risk_tolerance: "",
    investment_goals: [] as string[],
    age: "",
    occupation: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleGoal(goal: string) {
    setForm((prev) => ({
      ...prev,
      investment_goals: prev.investment_goals.includes(goal)
        ? prev.investment_goals.filter((g) => g !== goal)
        : [...prev.investment_goals, goal],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    if (!profile) { setError("Profile not found"); setLoading(false); return; }

    const { error: insertError } = await supabase.from("clients").insert({
      firm_id: profile.firm_id,
      advisor_id: user.id,
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      portfolio_value: form.portfolio_value ? parseFloat(form.portfolio_value) : null,
      risk_tolerance: (form.risk_tolerance as "conservative" | "moderate" | "aggressive") || null,
      investment_goals: form.investment_goals,
      age: form.age ? parseInt(form.age) : null,
      occupation: form.occupation || null,
      notes: form.notes || null,
      tags: [],
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/dashboard/clients");
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/clients" className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 shadow-2xs transition-colors cursor-pointer" aria-label="Back to Clients">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Add New Client</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Create a client profile to enable AI briefings and intelligence</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">{error}</div>
        )}

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input id="client-name" name="full_name" type="text" value={form.full_name} onChange={handleChange} required
                  placeholder="Margaret Johnson" className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input id="client-email" name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="margaret@email.com" className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input id="client-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+1 (555) 000-0000" className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Age</label>
              <input id="client-age" name="age" type="number" value={form.age} onChange={handleChange}
                placeholder="55" min="18" max="120" className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Occupation</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input id="client-occupation" name="occupation" type="text" value={form.occupation} onChange={handleChange}
                  placeholder="CEO, Retired, etc." className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Portfolio Details</h2>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Portfolio Value (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input id="client-portfolio" name="portfolio_value" type="number" value={form.portfolio_value} onChange={handleChange}
                placeholder="1500000" className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Risk Tolerance</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RISK_OPTIONS.map((option) => (
                <button key={option.value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, risk_tolerance: option.value }))}
                  className={cn("p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                    form.risk_tolerance === option.value
                      ? "bg-zinc-100 border-zinc-300 text-zinc-900 shadow-2xs"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  )}>
                  <div className="font-semibold text-xs text-zinc-900">{option.label}</div>
                  <div className="text-[11px] mt-0.5 text-zinc-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              <Target className="inline w-3.5 h-3.5 mr-1" />
              Investment Goals
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_OPTIONS.map((goal) => (
                <button key={goal} type="button" onClick={() => toggleGoal(goal)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center cursor-pointer",
                    form.investment_goals.includes(goal)
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  )}>
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Notes</label>
            <textarea id="client-notes" name="notes" value={form.notes} onChange={handleChange} rows={3}
              placeholder="Any additional context about this client..."
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/clients"
            className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
            Cancel
          </Link>
          <button id="submit-client-btn" type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></> : <span>Create Client Profile</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
