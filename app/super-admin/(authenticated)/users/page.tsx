import { requirePlatformAdmin } from "@/lib/super-admin/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserX, KeyRound, Shield } from "lucide-react";

const ROLE_STYLES: Record<string, string> = {
  owner:      "bg-amber-400/10 text-amber-400 border-amber-400/20",
  compliance: "bg-blue-400/10  text-blue-400  border-blue-400/20",
  advisor:    "bg-violet-400/10 text-violet-400 border-violet-400/20",
  ops:        "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

export default async function UsersPage() {
  await requirePlatformAdmin(["super_owner", "engineering", "compliance_exec", "support", "read_only"]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id, full_name, email, role, created_at,
      firms(id, name, plan)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-white">All Users</h2>
        <p className="text-sm text-white/40 mt-1">
          Cross-tenant user lookup. {users?.length ?? 0} total users across all organizations.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["User", "Organization", "Role", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(users ?? []).map((user) => {
                const firm = user.firms as { id: string; name: string; plan: string } | null;
                const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.advisor;
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-rose-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white/70">
                            {user.full_name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate max-w-[160px]">{user.full_name}</p>
                          <p className="text-xs text-white/30 truncate max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {firm ? (
                        <Link
                          href={`/super-admin/organizations/${firm.id}`}
                          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          {firm.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold capitalize border px-2 py-0.5 rounded-full ${roleStyle}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/30">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          title="Force password reset"
                          className="p-1.5 rounded-md text-white/30 hover:bg-white/5 hover:text-amber-400 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Terminate access"
                          className="p-1.5 rounded-md text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
