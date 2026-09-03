import { getPlatformAdminSession } from "@/lib/super-admin/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, Users, CreditCard, Cpu,
  Flag, ShieldCheck, Activity, BarChart2, Lock,
  Settings, LogOut, Zap, Globe,
} from "lucide-react";

const NAV_SECTIONS = [
  { label: "Platform", items: [
    { href: "/super-admin",               icon: LayoutDashboard, label: "Dashboard" },
    { href: "/super-admin/organizations", icon: Building2,       label: "Organizations" },
    { href: "/super-admin/users",         icon: Users,           label: "Users" },
    { href: "/super-admin/website-content", icon: Globe,         label: "Website CMS" },
  ]},
  { label: "Commerce", items: [
    { href: "/super-admin/billing",       icon: CreditCard,      label: "Billing & Payments" },
    { href: "/super-admin/models",        icon: Cpu,             label: "AI & Models" },
    { href: "/super-admin/features",      icon: Flag,            label: "Features & Flags" },
  ]},
  { label: "Operations", items: [
    { href: "/super-admin/compliance",    icon: ShieldCheck,     label: "Compliance & Audit" },
    { href: "/super-admin/system",        icon: Activity,        label: "Observability" },
    { href: "/super-admin/analytics",     icon: BarChart2,       label: "Analytics" },
  ]},
  { label: "Admin", items: [
    { href: "/super-admin/admins",        icon: Lock,            label: "Admin Access (RBAC)" },
    { href: "/super-admin/platform-settings", icon: Settings,    label: "Platform Settings" },
  ]},
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPlatformAdminSession();
  if (!session) redirect("/super-admin/login");

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Dark sidebar — distinct from org/advisor panels */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-[#111118] border-r border-white/10">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Adviza</p>
              <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide">Super Admin</p>
            </div>
          </div>
          <div className="mt-3 px-2 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide">
              ⚠ Platform Access — Internal Only
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[9px] font-semibold uppercase tracking-widest text-white/30">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <p className="px-3 text-[9px] text-white/30 truncate">{session.email}</p>
          <p className="px-3 text-[9px] text-violet-400 font-semibold capitalize">{session.role.replace("_", " ")}</p>
          <Link
            href="/super-admin/login?logout=1"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-white/5 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0D0D14]">
        <header className="h-14 border-b border-white/10 flex items-center px-6 gap-3 bg-[#111118]">
          <h1 className="font-heading font-semibold text-sm text-white">Platform Administration</h1>
          <div className="flex-1" />
          <span className="text-[10px] text-white/30 font-mono">
            Session expires in{" "}
            <span className="text-amber-400">
              {Math.max(0, Math.floor((3600 - (Date.now() - session.issuedAt) / 1000) / 60))} min
            </span>
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 text-white/90">
          {children}
        </main>
      </div>
    </div>
  );
}
