"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface BillingButtonProps {
  plan: string;
  hasCustomer: boolean;
}

export function BillingButton({ plan, hasCustomer }: BillingButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleBilling() {
    setLoading(true);
    try {
      const endpoint = hasCustomer && plan !== "free" ? "/api/stripe/portal" : "/api/stripe/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to redirect to billing portal.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error initiating billing action";
      alert("Error initiating billing action: " + message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBilling}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 disabled:opacity-50 text-white text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : plan === "free" ? (
        <>
          <span>Upgrade to Pro</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </>
      ) : (
        <>
          <span>Manage Subscription</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  );
}
