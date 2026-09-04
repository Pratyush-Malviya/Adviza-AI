"use client";

import { Bell, PanelLeft } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  profile: {
    full_name: string;
    role: string;
    firms?: { name: string; plan: string } | null;
  } | null;
  user: User;
}

export function DashboardHeader({ profile, user }: HeaderProps) {
  const triggerSidebarToggle = () => {
    window.dispatchEvent(new CustomEvent("adviza:toggle-sidebar"));
  };

  const firmName = profile?.firms?.name || "Nike";
  const userName = profile?.full_name || "Luke Lotardo";

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between pl-14 md:pl-6 pr-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 bg-white">
      <div className="flex items-center gap-3 min-w-0">
        {/* Toggle sidebar button */}
        <button
          onClick={triggerSidebarToggle}
          className="hidden md:flex items-center justify-center p-1 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          title="Toggle sidebar (Ctrl+B)"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Subtle breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <span className="text-zinc-400">{firmName}</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-800 font-semibold">Workspace</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notifications */}
        <button
          id="header-notifications"
          className="relative w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-800 rounded-md hover:bg-zinc-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-900 rounded-full" />
        </button>

        {/* Small Profile Avatar */}
        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
          {getInitials(userName || user.email || "U")}
        </div>
      </div>
    </header>
  );
}
