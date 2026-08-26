"use client";

import { Bell, Search } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  profile: {
    full_name: string;
    role: string;
  } | null;
  user: User;
}

export function DashboardHeader({ profile, user }: HeaderProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-[#EADBCE] bg-[#FAF5F0]/80 backdrop-blur-sm">
      <div>
        <p className="text-sm text-[#7A726A]">
          {greeting()},{" "}
          <span className="text-[#121217] font-heading font-bold">
            {profile?.full_name?.split(" ")[0] || "Advisor"}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          id="header-search"
          className="flex items-center gap-2.5 px-3.5 py-2 bg-white border border-[#EADBCE] rounded-full text-sm text-[#7A726A] hover:text-[#121217] hover:border-[#D8CCC2] shadow-sm transition-colors"
        >
          <Search className="w-4 h-4 text-[#8E847C]" />
          <span className="hidden md:block">Search clients, meetings...</span>
          <kbd className="hidden md:block text-[11px] bg-[#FAF5F0] border border-[#EADBCE] px-1.5 py-0.5 rounded font-mono text-[#8E847C]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          id="header-notifications"
          className="relative w-9 h-9 flex items-center justify-center bg-white border border-[#EADBCE] rounded-full text-[#5A544E] hover:text-[#121217] hover:border-[#D8CCC2] shadow-sm transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {getInitials(profile?.full_name || user.email || "U")}
        </div>
      </div>
    </header>
  );
}
