"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, AlertCircle, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  planId: string;
  amount: number; // in INR
  currency?: string;
  label?: string;
  className?: string;
  onSuccess?: () => void;
}

export function RazorpayPaymentButton({
  planId,
  amount,
  currency = "INR",
  label = "Upgrade with Razorpay",
  className = "",
  onSuccess,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper to dynamically load Razorpay checkout.js script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Load checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Call backend to create Razorpay Order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, amount, currency }),
      });

      const data = await res.json();

      if (!res.ok || !data.orderId) {
        if (res.status === 401) {
          router.push(`/auth/login?redirect=/pricing`);
          return;
        }
        throw new Error(data.error || "Failed to initiate payment order.");
      }

      // 3. Configure Razorpay modal options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Adviza AI",
        description: `${planId.toUpperCase()} Subscription — Institutional Workspace`,
        order_id: data.orderId,
        prefill: {
          name: data.userName || "",
          email: data.userEmail || "",
        },
        theme: {
          color: "#7c3aed", // Adviza violet accent
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 4. Client callback: Re-verify signature on server
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              router.push(`/payment/failed?order_id=${response.razorpay_order_id}&reason=verification_failed`);
              return;
            }

            // 5. Success redirect
            if (onSuccess) {
              onSuccess();
            } else {
              router.push(
                `/payment/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&plan=${planId}`
              );
            }
          } catch (err: any) {
            router.push(`/payment/failed?order_id=${response.razorpay_order_id}&reason=${encodeURIComponent(err?.message || "unknown")}`);
          }
        },
      };

      // 4. Open Razorpay Checkout Modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("[Razorpay Modal Failure]:", response.error);
        router.push(
          `/payment/failed?order_id=${data.orderId}&code=${response.error?.code}&desc=${encodeURIComponent(
            response.error?.description || "Payment was declined"
          )}`
        );
      });
      rzp.open();
    } catch (err: any) {
      console.error("[Checkout Init Error]:", err);
      setError(err?.message || "Unable to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting Gateway...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-violet-200" />
            <span>{label}</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
