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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/clients" className="w-9 h-9 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#5A544E] hover:text-[#121217] shadow-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">Add Client</h1>
          <p className="text-sm text-[#7A726A] mt-0.5">Fill in the details to create a new client relationship</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">{error}</div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm space-y-5">
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input id="client-name" name="full_name" type="text" value={form.full_name} onChange={handleChange} required
                  placeholder="Margaret Johnson" className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input id="client-email" name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="margaret@email.com" className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input id="client-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+1 (555) 000-0000" className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Age</label>
              <input id="client-age" name="age" type="number" value={form.age} onChange={handleChange}
                placeholder="55" min="18" max="120" className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Occupation</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input id="client-occupation" name="occupation" type="text" value={form.occupation} onChange={handleChange}
                  placeholder="CEO, Retired, etc." className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm space-y-5">
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">Portfolio Details</h2>
          
          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Portfolio Value (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
              <input id="client-portfolio" name="portfolio_value" type="number" value={form.portfolio_value} onChange={handleChange}
                placeholder="1500000" className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Risk Tolerance</label>
            <div className="grid grid-cols-3 gap-3">
              {RISK_OPTIONS.map((option) => (
                <button key={option.value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, risk_tolerance: option.value }))}
                  className={cn("p-4 rounded-2xl border text-left transition-all",
                    form.risk_tolerance === option.value
                      ? "bg-rose-50 border-rose-300 text-rose-800 shadow-sm"
                      : "bg-[#FAF5F0]/60 border-[#EADBCE] text-[#5A544E] hover:border-[#D8CCC2]"
                  )}>
                  <div className="font-heading font-bold text-sm">{option.label}</div>
                  <div className="text-xs mt-1 text-[#7A726A]">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">
              <Target className="inline w-3.5 h-3.5 mr-1" />
              Investment Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <button key={goal} type="button" onClick={() => toggleGoal(goal)}
                  className={cn("px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all",
                    form.investment_goals.includes(goal)
                      ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                      : "bg-[#FAF5F0] border-[#EADBCE] text-[#5A544E] hover:border-[#D8CCC2]"
                  )}>
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
          <label className="block text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-3">Advisor Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
            placeholder="Key context, concerns, relationship notes, or CRM data..."
            className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-2xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors resize-none" />
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/clients"
            className="flex-1 py-3.5 bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] text-[#121217] font-bold rounded-full transition-colors text-center text-sm shadow-sm">
            Cancel
          </Link>
          <button id="submit-client" type="submit" disabled={loading}
            className="btn-hero-gradient flex-1 py-3.5 disabled:opacity-50 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-rose-500/20">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></> : <span>Add Client</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
