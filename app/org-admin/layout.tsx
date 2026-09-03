import { requireOrgAdmin } from "@/lib/org-admin/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  CreditCard,
  Link2,
  ShieldCheck,
  BarChart2,
  Settings,
  BookOpen,
  Sparkles,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/org-admin",                  icon: LayoutDashboard, label: "Overview" },
  { href: "/org-admin/team",             icon: Users,           label: "Team" },
  { href: "/org-admin/integrations",     icon: Link2,           label: "Integrations" },
  { href: "/org-admin/compliance",       icon: ShieldCheck,     label: "Compliance" },
  { href: "/org-admin/billing",          icon: CreditCard,      label: "Billing" },
  { href: "/org-admin/audit",            icon: BookOpen,        label: "Audit & Evidence" },
  { href: "/org-admin/analytics",        icon: BarChart2,       label: "Analytics" },
  { href: "/org-admin/settings",         icon: Settings,        label: "Settings" },
];

export default async function OrgAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard — requireOrgAdmin redirects if role is wrong
  const ctx = await requireOrgAdmin();

  return (
    <div className="flex h-screen bg-[#FAF5F0] text-[#121217] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-[#EADBCE]">
        {/* Header */}
        <div className="px-5 py-5 border-b border-[#EADBCE]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-[#121217]">Org Admin</span>
          </div>
          <p className="text-xs text-[#8E847C] truncate">{ctx.firmName}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-violet-100 text-violet-700">
            {ctx.plan}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#4A4540] hover:bg-[#FAF5F0] hover:text-[#121217] transition-colors"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#EADBCE] space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#8E847C] hover:bg-[#FAF5F0] hover:text-[#121217] transition-colors w-full"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Workspace
          </Link>
          <p className="px-3 text-[10px] text-[#8E847C]">
            {ctx.role === "owner" ? "Firm Owner" : "Compliance Officer"}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-[#EADBCE] bg-white flex items-center px-6 gap-3">
          <h1 className="font-heading font-semibold text-base text-[#121217]">
            Organization Administration
          </h1>
          <div className="flex-1" />
          <span className="text-xs text-[#8E847C]">{ctx.firmName}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
