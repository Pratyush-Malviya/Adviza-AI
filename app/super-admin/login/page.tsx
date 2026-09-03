"use client";

import { useState } from "react";
import { Zap, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Super Admin login page.
// Authenticates against the platform.platform_admins table (NOT Supabase auth).
// Two-step: 1) email+password  2) TOTP MFA verification
// ---------------------------------------------------------------------------
export default function SuperAdminLogin() {
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
      } else {
        setStep("mfa");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMFA(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, totp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "MFA verification failed.");
      } else {
        window.location.href = "/super-admin";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Adviza</p>
            <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide">Platform Admin</p>
          </div>
        </div>

        {/* Security warning */}
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">
            This panel is for Adviza internal team only. All access is monitored and logged.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          {step === "credentials" ? (
            <>
              <h1 className="font-heading text-lg font-bold text-white mb-1">Platform Access</h1>
              <p className="text-xs text-white/40 mb-6">Enter your admin credentials to continue.</p>
              <form onSubmit={handleCredentials} className="space-y-4" id="super-admin-login-form">
                <div>
                  <label className="text-xs font-medium text-white/60 block mb-1.5">Email</label>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    placeholder="admin@adviza.ai"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/60 block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  id="admin-login-submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Continue to MFA
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-heading text-lg font-bold text-white mb-1">Two-Factor Authentication</h1>
              <p className="text-xs text-white/40 mb-6">
                Enter the 6-digit code from your authenticator app.
              </p>
              <form onSubmit={handleMFA} className="space-y-4" id="super-admin-mfa-form">
                <div>
                  <label className="text-xs font-medium text-white/60 block mb-1.5">TOTP Code</label>
                  <input
                    id="admin-totp"
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={totp}
                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center tracking-[0.5em] font-mono placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totp.length !== 6}
                  id="admin-mfa-submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Verify & Access Platform
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setError(""); setTotp(""); }}
                  className="w-full text-xs text-white/30 hover:text-white/60 transition-colors mt-2"
                >
                  ← Back to credentials
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-white/20 mt-6">
          Unauthorized access is prohibited and prosecutable under applicable law.
        </p>
      </div>
    </div>
  );
}
