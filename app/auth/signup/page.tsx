"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    firmName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const firmSlug = formData.firmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          firm_name: formData.firmName,
          firm_slug: `${firmSlug}-${Math.random().toString(36).slice(2, 6)}`,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.status === 422) {
        setError("An account with this email is already registered. Please sign in instead.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else if (data?.session) {
      window.location.href = "/dashboard";
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF5F0] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-[32px] p-8 sm:p-10 border border-[#EADBCE] shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#121217] mb-3">Check your email</h1>
          <p className="text-[#686058] mb-6 leading-relaxed text-sm">
            We sent a confirmation link to{" "}
            <span className="text-[#121217] font-bold">{formData.email}</span>.
            Click the link to activate your workspace.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="btn-hero-gradient inline-flex items-center justify-center gap-2 w-full py-3.5 text-white text-sm font-bold rounded-full shadow-md"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5F0] flex flex-col items-center justify-center px-4 py-12 selection:bg-rose-200 selection:text-rose-900">
      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-8 group">
          <div className="w-10 h-10 rounded-2xl bg-[#121217] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-[#121217]">
            Adviza<span className="text-rose-500">.</span>
          </span>
        </Link>

        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#EADBCE] shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-extrabold text-[#121217] mb-1">
              Start your free workspace
            </h1>
            <p className="text-sm text-[#7A726A]">
              No credit card required · 10 meetings free
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium leading-relaxed">
              {error}
              {error.includes("already registered") && (
                <div className="mt-2">
                  <Link href="/auth/login" className="font-bold underline hover:text-rose-900">
                    Go to Sign In &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C] pointer-events-none" />
                  <input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                    className="w-full pl-9 pr-3 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-base sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                  Firm Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C] pointer-events-none" />
                  <input
                    id="signup-firm"
                    name="firmName"
                    type="text"
                    value={formData.firmName}
                    onChange={handleChange}
                    placeholder="Acme Wealth"
                    required
                    className="w-full pl-9 pr-3 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-base sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C] pointer-events-none" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@yourfirm.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-base sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C] pointer-events-none" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-base sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8E847C] hover:text-[#121217] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-hero-gradient w-full py-3.5 min-h-[44px] text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Free Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[#7A726A]">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-rose-600 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-rose-600 hover:underline">
              Privacy Policy
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-[#7A726A]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-rose-600 hover:text-rose-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
