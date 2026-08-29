"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Shield,
  Settings,
  ClipboardList,
  LogOut,
  ChevronRight,
  Zap,
  Workflow,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/meetings", icon: Calendar, label: "Meetings" },
  { href: "/dashboard/workflows", icon: Workflow, label: "Workflows" },
  { href: "/dashboard/actions", icon: ClipboardList, label: "Actions" },
  { href: "/dashboard/compliance", icon: Shield, label: "Compliance" },
  { href: "/dashboard/connectors", icon: Zap, label: "Connectors" },
];

interface SidebarProps {
  profile: {
    full_name: string;
    role: string;
    firms?: { name: string; plan: string } | null;
  } | null;
}

export function DashboardSidebar({ profile }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Load user's desktop sidebar collapse preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adviza_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore SSR or storage exceptions
    }

    const handleToggleEvent = () => {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("adviza_sidebar_collapsed", String(next));
        } catch {}
        return next;
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleToggleEvent();
      }
    };

    window.addEventListener("adviza:toggle-sidebar", handleToggleEvent);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("adviza:toggle-sidebar", handleToggleEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("adviza_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const renderNavLinks = (collapsed: boolean) => (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <li key={item.href} className="relative group">
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-2xl text-sm font-semibold transition-all min-h-[44px]",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive
                  ? "bg-[#121217] text-white shadow-sm"
                  : "text-[#5A544E] hover:text-[#121217] hover:bg-[#FAF5F0]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-rose-400" : "text-[#8E847C]")} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/60" />
              )}
            </Link>

            {/* Tooltip on collapsed desktop hover */}
            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-[#121217] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Hamburger Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-40 p-2 rounded-2xl bg-white border border-[#EADBCE] text-[#121217] shadow-sm hover:bg-[#FAF5F0] transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full bg-white shadow-2xl z-10 flex flex-col border-r border-[#EADBCE] animate-in slide-in-from-left duration-200">
            {/* Mobile Header */}
            <div className="px-5 py-5 border-b border-[#EADBCE]/80 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-2xl bg-[#121217] flex items-center justify-center shadow-md">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-extrabold text-base tracking-tight text-[#121217]">
                    Adviza<span className="text-rose-500">.</span>
                  </div>
                  <div className="text-xs text-[#8E847C] font-mono truncate">
                    {profile?.firms?.name || "AI Workspace"}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-[#8E847C] hover:text-[#121217] rounded-xl hover:bg-[#FAF5F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
              {renderNavLinks(false)}
              <div className="mt-6 pt-6 border-t border-[#EADBCE]/80 space-y-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-[#5A544E] hover:text-[#121217] hover:bg-[#FAF5F0]"
                >
                  <Settings className="w-4 h-4 text-[#8E847C]" />
                  <span>Settings</span>
                </Link>
              </div>
            </nav>

            {/* Mobile User Section */}
            <div className="px-3 py-4 border-t border-[#EADBCE]/80 bg-[#FAF5F0]/40">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-[#EADBCE]/80 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(profile?.full_name || "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#121217] truncate">{profile?.full_name || "Advisor"}</div>
                  <div className="text-xs text-[#8E847C] capitalize truncate">{profile?.role}</div>
                </div>
                <button onClick={handleSignOut} className="text-[#8E847C] hover:text-rose-600 p-1.5">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Collapsible / Expandable Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-shrink-0 flex-col bg-white border-r border-[#EADBCE] transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header with Logo and Collapse Toggle */}
        <div className={cn("py-5 border-b border-[#EADBCE]/80 flex items-center", isCollapsed ? "px-3 justify-center" : "px-5 justify-between")}>
          <Link href="/dashboard" className="flex items-center gap-3 group min-w-0" title="Adviza AI">
            <div className="w-9 h-9 rounded-2xl bg-[#121217] flex items-center justify-center shadow-md transition-transform group-hover:scale-105 flex-shrink-0">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-heading font-extrabold text-base tracking-tight text-[#121217]">
                  Adviza<span className="text-rose-500">.</span>
                </div>
                <div className="text-xs text-[#8E847C] font-mono truncate">
                  {profile?.firms?.name || "AI Workspace"}
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Close/Expand Button */}
          <button
            onClick={toggleDesktopCollapse}
            className={cn(
              "p-1.5 rounded-xl text-[#8E847C] hover:text-[#121217] hover:bg-[#FAF5F0] transition-colors",
              isCollapsed && "mt-3"
            )}
            title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Plan badge */}
        {!isCollapsed ? (
          <div className="px-5 py-3 border-b border-[#EADBCE]/60 bg-[#FAF5F0]/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8E847C] font-heading font-bold uppercase tracking-wider">
                Plan
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border",
                  profile?.firms?.plan === "pro"
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : profile?.firms?.plan === "enterprise"
                    ? "text-purple-700 bg-purple-50 border-purple-200"
                    : "text-zinc-600 bg-white border-zinc-200"
                )}
              >
                {(profile?.firms?.plan || "free").toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 border-b border-[#EADBCE]/60 bg-[#FAF5F0]/60 flex justify-center" title={`Plan: ${(profile?.firms?.plan || "free").toUpperCase()}`}>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {renderNavLinks(isCollapsed)}

          <div className="mt-6 pt-6 border-t border-[#EADBCE]/80 space-y-1">
            <div className="relative group">
              <Link
                href="/dashboard/settings"
                className={cn(
                  "flex items-center rounded-2xl text-sm font-semibold transition-all min-h-[44px]",
                  isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-[#121217] text-white shadow-sm"
                    : "text-[#5A544E] hover:text-[#121217] hover:bg-[#FAF5F0]"
                )}
                title={isCollapsed ? "Settings" : undefined}
              >
                <Settings className="w-5 h-5 text-[#8E847C] flex-shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </Link>
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                  <div className="bg-[#121217] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                    Settings
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User section */}
        <div className={cn("py-4 border-t border-[#EADBCE]/80 bg-[#FAF5F0]/40", isCollapsed ? "px-2" : "px-3")}>
          <div
            className={cn(
              "flex items-center rounded-2xl bg-white border border-[#EADBCE]/80 shadow-sm",
              isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(profile?.full_name || "U")}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#121217] truncate">
                    {profile?.full_name || "Advisor"}
                  </div>
                  <div className="text-xs text-[#8E847C] capitalize truncate">
                    {profile?.role}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-[#8E847C] hover:text-rose-600 transition-colors flex-shrink-0 p-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EADBCE] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-w-[54px]",
                isActive
                  ? "text-rose-600 font-extrabold"
                  : "text-[#8E847C] hover:text-[#121217]"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-rose-600" : "text-[#8E847C]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-w-[54px]",
            pathname.startsWith("/dashboard/settings")
              ? "text-rose-600 font-extrabold"
              : "text-[#8E847C] hover:text-[#121217]"
          )}
        >
          <Settings className={cn("w-5 h-5 mb-0.5", pathname.startsWith("/dashboard/settings") ? "text-rose-600" : "text-[#8E847C]")} />
          <span>Settings</span>
        </Link>
      </div>
    </>
  );
}
