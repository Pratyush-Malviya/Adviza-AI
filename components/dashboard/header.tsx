"use client";

import { useState, useEffect } from "react";
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
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between pl-16 pr-4 sm:px-6 lg:px-8 border-b border-[#EADBCE] bg-[#FAF5F0]/80 backdrop-blur-sm">
      <div className="min-w-0 pr-2">
        <p className="text-xs sm:text-sm text-[#7A726A] truncate" suppressHydrationWarning>
          {greeting},{" "}
          <span className="text-[#121217] font-heading font-bold">
            {profile?.full_name?.split(" ")[0] || "Advisor"}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search */}
        <button
          id="header-search"
          className="flex items-center gap-2 px-3 py-2 bg-white border border-[#EADBCE] rounded-full text-xs sm:text-sm text-[#7A726A] hover:text-[#121217] hover:border-[#D8CCC2] shadow-sm transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-[#8E847C]" />
          <span className="hidden md:block">Search clients, meetings...</span>
          <kbd className="hidden lg:block text-[10px] bg-[#FAF5F0] border border-[#EADBCE] px-1.5 py-0.5 rounded font-mono text-[#8E847C]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          id="header-notifications"
          className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white border border-[#EADBCE] rounded-full text-[#5A544E] hover:text-[#121217] hover:border-[#D8CCC2] shadow-sm transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
          {getInitials(profile?.full_name || user.email || "U")}
        </div>
      </div>
    </header>
  );
}
