"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF5F0] flex flex-col items-center justify-center px-4 selection:bg-rose-200 selection:text-rose-900">
      <div className="relative w-full max-w-md">
        {/* Logo */}
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

        {/* Card */}
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#EADBCE] shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-extrabold text-[#121217] mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-[#7A726A]">
              Sign in to your Adviza workspace
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] uppercase tracking-wider mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E847C]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advisor@yourfirm.com"
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
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E847C] hover:text-[#121217] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-hero-gradient w-full py-3.5 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#7A726A]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-rose-600 hover:text-rose-700 font-bold transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
