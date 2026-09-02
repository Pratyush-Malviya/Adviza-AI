"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeedDemoButtonProps {
  className?: string;
  variant?: "primary" | "banner";
}

export function SeedDemoButton({ className, variant = "primary" }: SeedDemoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSeedDemo() {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate demo");

      setSuccess(true);
      if (data.meetingId) {
        setTimeout(() => {
          router.push(`/dashboard/meetings/${data.meetingId}`);
        }, 600);
      } else {
        router.refresh();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating demo data");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "banner") {
    return (
      <div className={cn("bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-orange-500/10 border border-rose-200/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm", className)}>
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#121217]">
              Explore AI Meeting & Briefing Demo
            </h3>
            <p className="text-xs sm:text-sm text-[#7A726A] mt-0.5 leading-relaxed">
              Populate a sample $3.85M FinTech client portfolio and launch the 4-step AI Briefing, Intelligence & Compliance demo in 1 click.
            </p>
          </div>
        </div>
        <button
          onClick={handleSeedDemo}
          disabled={loading || success}
          className="btn-hero-gradient flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 hover:scale-105 transition-all flex-shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{loading ? "Generating..." : success ? "Demo Loaded!" : "Load Interactive Demo"}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSeedDemo}
      disabled={loading || success}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white border border-[#EADBCE] text-[#121217] hover:bg-[#FAF5F0] hover:border-[#D8CCC2] transition-all shadow-xs disabled:opacity-50",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
      )}
      <span>{loading ? "Seeding..." : "Load Demo Data"}</span>
    </button>
  );
}
