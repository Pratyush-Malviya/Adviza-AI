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

    const { error } = await supabase.auth.signUp({
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
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
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
          <Link
            href="/auth/login"
            className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full shadow-md"
          >
            <span>Back to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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

        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#EADBCE] shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-extrabold text-[#121217] mb-1">
              Start your free workspace
            </h1>
            <p className="text-sm text-[#7A726A]">
              No credit card required · 10 meetings free
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            id="signup-google"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-[#FAF5F0] disabled:opacity-50 border border-[#EADBCE] text-[#121217] font-semibold rounded-full transition-colors flex items-center justify-center gap-3 text-sm shadow-sm mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EADBCE]" />
            </div>
            <div className="relative flex justify-center text-xs text-[#8E847C]">
              <span className="bg-white px-3">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                  <input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                    className="w-full pl-9 pr-3 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                  Firm Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                  <input
                    id="signup-firm"
                    name="firmName"
                    type="text"
                    value={formData.firmName}
                    onChange={handleChange}
                    placeholder="Acme Wealth"
                    required
                    className="w-full pl-9 pr-3 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@yourfirm.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E847C] hover:text-[#121217] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-hero-gradient w-full py-3.5 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 mt-2"
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
