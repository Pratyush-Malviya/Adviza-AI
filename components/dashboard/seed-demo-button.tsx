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
      <div className={cn("bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs", className)}>
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-2xs flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-900">
              Explore AI Intelligence & Briefing Demo
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Populate a sample client portfolio and launch the 4-step AI Briefing, Intelligence & Compliance demo in 1 click.
            </p>
          </div>
        </div>
        <button
          onClick={handleSeedDemo}
          disabled={loading || success}
          className="bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-2xs transition-all flex-shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
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
        "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-zinc-200/80 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs disabled:opacity-50 cursor-pointer",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
      )}
      <span>{loading ? "Seeding..." : "Load Demo Data"}</span>
    </button>
  );
}
