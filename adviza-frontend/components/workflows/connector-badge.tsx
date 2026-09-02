"use client";

import { Zap, WifiOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ConnectorBadgeProps {
  appId: string;
  appName: string;
  isConnected: boolean;
  loading?: boolean;
  size?: "sm" | "xs";
  showLink?: boolean;
}

export function ConnectorBadge({
  appId,
  appName,
  isConnected,
  loading = false,
  size = "sm",
  showLink = true,
}: ConnectorBadgeProps) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-medium animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        Checking...
      </span>
    );
  }

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-all",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        isConnected
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      )}
      title={isConnected ? `${appName} is connected` : `${appName} not connected — click to connect`}
    >
      {isConnected ? (
        <Zap className={cn("fill-emerald-500 stroke-emerald-600", size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3")} />
      ) : (
        <WifiOff className={cn("stroke-amber-500", size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3")} />
      )}
      {isConnected ? "Connected" : "Not Connected"}
    </span>
  );

  if (!isConnected && showLink) {
    return (
      <Link href="/dashboard/connectors" className="hover:opacity-80 transition-opacity" tabIndex={-1}>
        {badge}
      </Link>
    );
  }

  return badge;
}
