"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Calendar,
  Shield,
  Settings,
  ClipboardList,
  LogOut,
  ChevronDown,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  Workflow,
  Sparkles,
  Menu,
  X,
  Search,
  MessageSquare,
  Plus,
  Trash2,
  Megaphone,
  HelpCircle,
  FileText,
  Layers,
  Lightbulb,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";

export interface NavCategory {
  title: string;
  items: {
    href: string;
    icon: any;
    label: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    title: "Analytics",
    items: [
      { href: "/dashboard", icon: LayoutGrid, label: "Overview" },
      { href: "/dashboard/chat", icon: Sparkles, label: "Answer Engine Insights" },
      { href: "/dashboard/clients", icon: Users, label: "Client Analytics" },
      { href: "/dashboard/meetings", icon: Calendar, label: "Agent Analytics" },
    ],
  },
  {
    title: "Action",
    items: [
      { href: "/dashboard/actions", icon: Lightbulb, label: "Opportunities" },
      { href: "/dashboard", icon: FileText, label: "Content" },
      { href: "/dashboard/workflows", icon: Workflow, label: "Workflows", badge: "Alpha", badgeColor: "bg-blue-50 text-blue-600 border-blue-200/60" },
      { href: "/dashboard/compliance", icon: Shield, label: "Brand & Compliance" },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/dashboard/tools", icon: Layers, label: "Custom Reports", badge: "Beta", badgeColor: "bg-blue-50 text-blue-600 border-blue-200/60" },
      { href: "/dashboard/connectors", icon: Zap, label: "Connectors" },
    ],
  },
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
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string; updated_at?: string }[]>([]);
  const [isChatSubmenuOpen, setIsChatSubmenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  // Load chat sessions from localStorage and sync
  const loadChatSessions = useCallback(() => {
    try {
      const cached = localStorage.getItem("adviza_chat_sessions");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const realSessions = parsed.filter(
            (s: any) => s.id && !s.id.startsWith("sess_calendar_") && !s.id.startsWith("sess_july_") && !s.id.startsWith("sess_briefing_")
          );
          setChatSessions(realSessions);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadChatSessions();

    const handleUpdate = () => {
      loadChatSessions();
    };

    window.addEventListener("adviza:chat-sessions-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("adviza:chat-sessions-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadChatSessions]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setChatSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem("adviza_chat_sessions", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    window.dispatchEvent(new CustomEvent("adviza:chat-sessions-updated"));

    if (searchParams?.get("sessionId") === sessionId) {
      router.push("/dashboard/chat");
    }

    try {
      await fetch("/api/ai/chat-sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error("Failed to delete session on server:", err);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adviza_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("sidebar-search-input");
        searchInput?.focus();
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

  const firmName = profile?.firms?.name || "Nike";
  const userName = profile?.full_name || "Luke Lotardo";

  const renderNavCategories = (collapsed: boolean) => (
    <div className="space-y-6">
      {NAV_CATEGORIES.map((category) => (
        <div key={category.title} className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 select-none">
              {category.title}
            </div>
          )}

          <ul className="space-y-0.5">
            {category.items.map((item) => {
              const Icon = item.icon;
              const isChat = item.href === "/dashboard/chat";
              const isContent = item.label === "Content";
              const isOverview = item.label === "Overview";

              let isActive = false;
              if (isContent) {
                isActive = pathname === "/dashboard" && searchParams?.get("tab") !== "overview";
              } else if (isOverview) {
                isActive = pathname === "/dashboard" && searchParams?.get("tab") === "overview";
              } else {
                isActive = pathname.startsWith(item.href) && item.href !== "/dashboard";
              }

              return (
                <li key={`${category.title}-${item.label}`} className="relative group">
                  <Link
                    href={isOverview ? "/dashboard?tab=overview" : item.href}
                    onClick={() => {
                      if (isChat && pathname === "/dashboard/chat") {
                        setIsChatSubmenuOpen((prev) => !prev);
                      }
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "flex items-center rounded-lg text-[13px] font-medium transition-colors min-h-[34px]",
                      collapsed ? "justify-center px-0 py-1.5" : "gap-3 px-3 py-1.5",
                      isActive
                        ? "bg-zinc-100 text-zinc-900 font-semibold"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-700"
                      )}
                    />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none ml-auto",
                          item.badgeColor || "bg-blue-50 text-blue-600 border-blue-200/60"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Collapsed Tooltip */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                      <div className="bg-zinc-900 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-md whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-800 shadow-xs hover:bg-zinc-50 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full bg-white shadow-xl z-10 flex flex-col border-r border-zinc-200 animate-in slide-in-from-left duration-200">
            {/* Mobile Header: Workspace switcher */}
            <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-white text-[11px] font-bold">
                  {firmName.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-semibold text-sm text-zinc-900 truncate">{firmName}</span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-800 rounded-md hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {renderNavCategories(false)}
            </nav>

            {/* Mobile Bottom Footer */}
            <div className="p-3 border-t border-zinc-200 space-y-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>What&apos;s New?</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-zinc-50 border border-zinc-200">
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
                  {getInitials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 truncate">{userName}</div>
                  <div className="text-[11px] text-zinc-500 capitalize truncate">{profile?.role || "Admin"}</div>
                </div>
                <button onClick={handleSignOut} className="text-zinc-400 hover:text-zinc-900 p-1">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-shrink-0 flex-col bg-white border-r border-zinc-200/80 transition-all duration-200 select-none",
          isCollapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Workspace Switcher */}
        <div className="p-3 border-b border-zinc-100">
          <button
            type="button"
            className={cn(
              "w-full flex items-center rounded-lg hover:bg-zinc-50 transition-colors text-left",
              isCollapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5"
            )}
            title={`Workspace: ${firmName}`}
          >
            <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-xs">
              {firmName.slice(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <>
                <span className="font-semibold text-sm text-zinc-900 truncate flex-1 tracking-tight">
                  {firmName}
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* Search Bar with ⌘K Badge */}
        {!isCollapsed ? (
          <div className="px-3 pt-3 pb-2">
            <div className="relative group">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-700 transition-colors pointer-events-none" />
              <input
                id="sidebar-search-input"
                type="text"
                placeholder="Search"
                className="w-full pl-8 pr-9 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 hover:border-zinc-300 focus:outline-none focus:border-zinc-400 transition-all"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded leading-none pointer-events-none">
                ⌘K
              </kbd>
            </div>
          </div>
        ) : (
          <div className="py-2.5 flex justify-center">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 rounded-md transition-colors"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Categories & Navigation items */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-none">
          {renderNavCategories(isCollapsed)}
        </nav>

        {/* Bottom Utility Actions */}
        <div className="border-t border-zinc-100 p-2 space-y-0.5 bg-white">
          {/* Collapse Button */}
          <button
            onClick={toggleDesktopCollapse}
            className={cn(
              "w-full flex items-center rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors py-1.5",
              isCollapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
            )}
            title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-zinc-400" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500 text-xs">Collapse</span>
              </>
            )}
          </button>

          {/* Support */}
          {!isCollapsed && (
            <Link
              href="/dashboard/settings"
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span>Support</span>
            </Link>
          )}

          {/* What's New? */}
          {!isCollapsed && (
            <Link
              href="/dashboard/workflows"
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <Megaphone className="w-4 h-4 text-zinc-400" />
              <span>What&apos;s New?</span>
            </Link>
          )}

          {/* User Profile Pill Card */}
          <div className={cn("pt-1.5 mt-1 border-t border-zinc-100", isCollapsed && "flex justify-center")}>
            <div
              className={cn(
                "flex items-center rounded-lg transition-colors group cursor-pointer hover:bg-zinc-50",
                isCollapsed ? "p-1 justify-center" : "gap-2.5 px-2 py-1.5"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {getInitials(userName)}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 truncate leading-tight">
                      {userName}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 transition-opacity p-0.5"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
