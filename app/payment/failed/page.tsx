import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, Mail, HelpCircle } from "lucide-react";

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; code?: string; desc?: string; reason?: string }>;
}) {
  const { order_id, desc, reason } = await searchParams;

  const errorMessage = desc || (reason === "verification_failed" ? "Payment signature could not be verified by the server." : "The transaction was cancelled or declined by your card issuer/bank.");

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EADBCE] p-8 sm:p-10 shadow-lg text-center space-y-6">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Payment Incomplete
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Transaction Declined
          </h1>
          <p className="text-xs text-[#7A726A] leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {order_id && (
          <div className="p-3 rounded-xl bg-[#FAF5F0] border border-[#EADBCE] text-xs font-mono text-[#8E847C]">
            Reference Order: <span className="text-[#121217] font-bold">{order_id}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
          <p className="font-bold">No funds were deducted:</p>
          <p className="text-[11px] text-amber-800">
            If your bank authorized the charge, it will be automatically reversed to your account within 24–48 hours.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Link
            href="/pricing"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Payment Again</span>
          </Link>

          <Link
            href="/contact?subject=payment-assistance"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#EADBCE] text-[#5A544E] hover:text-[#121217] hover:bg-[#FAF5F0] text-xs font-semibold transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Billing Desk (billing@adviza.ai)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
