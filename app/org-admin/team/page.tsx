import { requireOrgAdmin } from "@/lib/org-admin/auth";
import { getOrgUsageLimits } from "@/lib/org-admin/limits";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  UserPlus, Mail, ShieldCheck, UserX, UserCheck,
  AlertTriangle, Crown, Briefcase, Eye,
} from "lucide-react";

const ROLE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  owner:      { label: "Owner",      color: "bg-amber-100 text-amber-700",   icon: Crown },
  compliance: { label: "Compliance", color: "bg-blue-100 text-blue-700",     icon: ShieldCheck },
  advisor:    { label: "Advisor",    color: "bg-violet-100 text-violet-700", icon: Briefcase },
  ops:        { label: "Ops",        color: "bg-emerald-100 text-emerald-700", icon: Eye },
};

export default async function TeamPage() {
  const ctx = await requireOrgAdmin();
  const supabase = await createClient();
  const limits = await getOrgUsageLimits(ctx.firmId);

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, updated_at")
    .eq("firm_id", ctx.firmId)
    .order("created_at", { ascending: true });

  const { data: invitations } = await supabase
    .from("org_invitations")
    .select("id, email, role, status, expires_at, created_at")
    .eq("firm_id", ctx.firmId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const isOwner = ctx.role === "owner";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#121217]">Team Management</h2>
          <p className="text-sm text-[#8E847C] mt-1">
            {limits.users.used} of {limits.users.max} seats used
          </p>
        </div>
        {isOwner && (
          <Link
            href={limits.users.canAdd ? "/org-admin/team/invite" : "/org-admin/billing"}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              limits.users.canAdd
                ? "bg-[#121217] text-white hover:bg-zinc-800"
                : "bg-[#FAF5F0] text-[#8E847C] border border-[#EADBCE] cursor-not-allowed"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {limits.users.canAdd ? "Invite Member" : "Seat Limit Reached — Upgrade"}
          </Link>
        )}
      </div>

      {/* Seat limit warning */}
      {!limits.users.canAdd && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Your organization has reached the maximum number of seats for the{" "}
          <strong>{ctx.plan}</strong> plan.{" "}
          <Link href="/org-admin/billing" className="font-medium underline ml-1">
            Upgrade to add more members.
          </Link>
        </div>
      )}

      {/* Active Members Table */}
      <section className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EADBCE]">
          <h3 className="font-heading text-base font-semibold text-[#121217]">
            Active Members ({members?.length ?? 0})
          </h3>
        </div>
        <div className="divide-y divide-[#F0EAE4]">
          {members?.map((member) => {
            const meta = ROLE_META[member.role] ?? ROLE_META.advisor;
            const Icon = meta.icon;
            const isSelf = member.id === ctx.userId;
            return (
              <div key={member.id} className="px-6 py-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {member.full_name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#121217] truncate">{member.full_name}</p>
                    {isSelf && (
                      <span className="text-[10px] font-semibold bg-[#FAF5F0] text-[#8E847C] border border-[#EADBCE] px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8E847C] truncate">{member.email}</p>
                </div>
                {/* Role badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>
                {/* Actions — only owner can manage, and cannot demote themselves */}
                {isOwner && !isSelf && member.role !== "owner" && (
                  <div className="flex items-center gap-2">
                    <form action={`/api/org-admin/team`} method="POST">
                      <input type="hidden" name="userId" value={member.id} />
                      <input type="hidden" name="action" value="deactivate" />
                      <button
                        type="submit"
                        className="p-1.5 rounded-md text-[#8E847C] hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Deactivate user"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <section className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EADBCE]">
            <h3 className="font-heading text-base font-semibold text-[#121217]">
              Pending Invitations ({invitations.length})
            </h3>
          </div>
          <div className="divide-y divide-[#F0EAE4]">
            {invitations.map((inv) => {
              const expired = new Date(inv.expires_at) < new Date();
              const meta = ROLE_META[inv.role] ?? ROLE_META.advisor;
              return (
                <div key={inv.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#F0EAE4] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#8E847C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#121217] truncate">{inv.email}</p>
                    <p className="text-xs text-[#8E847C]">
                      Expires {new Date(inv.expires_at).toLocaleDateString()}
                      {expired && <span className="text-red-500 ml-1">(expired)</span>}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Pending
                  </span>
                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <form action="/api/org-admin/invitations" method="POST">
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <input type="hidden" name="action" value="resend" />
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 rounded text-violet-600 hover:bg-violet-50 transition-colors"
                        >
                          Resend
                        </button>
                      </form>
                      <form action="/api/org-admin/invitations" method="POST">
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <input type="hidden" name="action" value="revoke" />
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Revoke
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Role Reference */}
      <section className="bg-white rounded-xl border border-[#EADBCE] p-6">
        <h3 className="font-heading text-base font-semibold text-[#121217] mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(ROLE_META).filter(([r]) => r !== "owner").map(([role, meta]) => {
            const descriptions: Record<string, string> = {
              compliance: "Full read access to all data. Export compliance reports. View all audit logs.",
              advisor: "Manage own assigned clients, meetings, chat, and workflows.",
              ops: "View clients, manage action items and workflows. No billing or admin access.",
            };
            return (
              <div key={role} className="flex gap-3 p-3 rounded-lg border border-[#EADBCE] bg-[#FAF5F0]">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold h-fit ${meta.color}`}>
                  {meta.label}
                </span>
                <p className="text-xs text-[#4A4540]">{descriptions[role]}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
