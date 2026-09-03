import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Layers, Sparkles } from "lucide-react";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string; order_id?: string; plan?: string }>;
}) {
  const { payment_id, order_id, plan = "pro" } = await searchParams;

  const planName = plan.toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EADBCE] p-8 sm:p-10 shadow-lg text-center space-y-6">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Subscription Activated!
          </h1>
          <p className="text-xs text-[#7A726A]">
            Thank you for subscribing to Adviza AI. Your organization has been upgraded to the <strong>{planName}</strong> plan.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-[#8E847C]">Plan:</span>
            <span className="font-bold text-[#121217]">{planName} Tier</span>
          </div>
          {payment_id && (
            <div className="flex justify-between">
              <span className="text-[#8E847C]">Payment ID:</span>
              <span className="text-[#121217] truncate max-w-[180px]">{payment_id}</span>
            </div>
          )}
          {order_id && (
            <div className="flex justify-between">
              <span className="text-[#8E847C]">Order ID:</span>
              <span className="text-[#121217] truncate max-w-[180px]">{order_id}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#8E847C]">Status:</span>
            <span className="text-emerald-700 font-bold">Active & Verified</span>
          </div>
        </div>

        {/* What was unlocked */}
        <div className="space-y-2 text-left text-xs text-[#5A544E] pt-2">
          <p className="font-bold text-[#121217] uppercase tracking-wider text-[10px]">What is now active:</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Licensed Advisor Seats Allocated</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Real-time Dual-Stream Audio Transcription</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Deterministic Portfolio Drift & CCO Exam Export</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#121217] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition shadow-sm"
          >
            <span>Launch Advisor Dashboard</span>
            <ArrowRight className="w-4 h-4 text-rose-400" />
          </Link>
          <Link
            href="/org-admin"
            className="block text-center py-2 text-xs font-semibold text-[#7A726A] hover:text-[#121217] transition"
          >
            Manage Team in Org Admin Panel →
          </Link>
        </div>
      </div>
    </div>
  );
}
