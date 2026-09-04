import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  TrendingUp,
  Shield,
  Brain,
  Plus,
  Target,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { getClientMemories } from "@/lib/memory/mem0";
import { Sparkles } from "lucide-react";
import { PortfolioReconciliationCard } from "@/components/portfolio/portfolio-reconciliation-card";

export const metadata = { title: "Client Details — Adviza AI" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch Client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  // Fetch Client's Meetings, Action Items, and Mem0 Entity Memories in Parallel
  const [{ data: meetings }, { data: actionItems }, clientMemories] = await Promise.all([
    supabase
      .from("meetings")
      .select("*")
      .eq("client_id", id)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("action_items")
      .select("*, meetings(title)")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    getClientMemories(user.id, client.full_name),
  ]);

  const riskColorMap: Record<string, string> = {
    conservative: "text-blue-700 bg-blue-50 border-blue-200",
    moderate: "text-amber-800 bg-amber-50 border-amber-200",
    aggressive: "text-rose-700 bg-rose-50 border-rose-200",
    "very-aggressive": "text-purple-700 bg-purple-50 border-purple-200",
  };

  const openActions = actionItems?.filter((a) => a.status === "open") || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/dashboard/clients"
          className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 shadow-2xs transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Back to Clients"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {client.full_name}
            </h1>
            {client.risk_tolerance && (
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase ${
                  riskColorMap[client.risk_tolerance] || "text-zinc-700 bg-zinc-100 border-zinc-200"
                }`}
              >
                {client.risk_tolerance} Risk
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Client Profile · Managed Wealth Mandate
          </p>
        </div>

        <Link
          href="/dashboard/meetings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Schedule Meeting</span>
          <span className="sm:hidden">Meeting</span>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
            Total Portfolio
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {client.portfolio_value ? formatCurrency(client.portfolio_value) : "—"}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Active Mandate</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
            Total Meetings
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {meetings?.length ?? 0}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Recorded & Analyzed</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            <ClipboardList className="w-3.5 h-3.5 text-zinc-600" />
            Open Action Items
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {openActions.length}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Pending Resolution</div>
        </div>
      </div>

      {/* Custodial Portfolio Drift & Tax Reconciliation */}
      <PortfolioReconciliationCard clientName={client.full_name} />

      {/* Client Details & Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Contact & Goals */}
        <div className="md:col-span-5 space-y-5">
          {/* Contact Card */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Contact Details
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-600">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{client.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-600">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>{client.phone || "No phone provided"}</span>
              </div>
            </div>
          </div>

          {/* Investment Goals */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Target className="w-3.5 h-3.5 text-zinc-600" />
              Investment Goals
            </div>
            <div className="flex flex-wrap gap-2">
              {client.investment_goals && client.investment_goals.length > 0 ? (
                client.investment_goals.map((goal: string) => (
                  <span
                    key={goal}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-800"
                  >
                    {goal}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400">No investment goals defined.</span>
              )}
            </div>
          </div>

          {/* CRM Notes */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-zinc-600" />
              CRM Background Notes
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {client.notes || "No CRM notes on file. Add notes during your next meeting."}
            </p>
          </div>

          {/* Mem0 AI Client Memory & Mandates */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-700">
                <Brain className="w-3.5 h-3.5 text-zinc-900" />
                Persistent AI Memory (Mem0)
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800">
                {clientMemories.length} Mandate{clientMemories.length === 1 ? "" : "s"}
              </span>
            </div>

            {clientMemories.length > 0 ? (
              <div className="space-y-2">
                {clientMemories.map((mem) => (
                  <div key={mem.id} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{mem.memory}</span>
                      <div className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase">
                        {mem.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed">
                No client-specific preferences extracted yet. Adviza will automatically remember preferences and mandates expressed during advisory meetings.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Meeting History & Actions */}
        <div className="md:col-span-7 space-y-5">
          {/* Meetings History */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Meeting History ({meetings?.length ?? 0})
              </h3>
              <Link
                href="/dashboard/meetings/new"
                className="text-xs font-semibold text-zinc-900 hover:underline"
              >
                + New
              </Link>
            </div>

            {meetings && meetings.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {meetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/meetings/${meeting.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors group px-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 group-hover:text-zinc-950 transition-colors truncate">
                        {meeting.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5" suppressHydrationWarning>
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="capitalize">{meeting.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {meeting.briefing && <Brain className="w-3.5 h-3.5 text-emerald-600" />}
                      {meeting.compliance_record && <Shield className="w-3.5 h-3.5 text-purple-600" />}
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-400">
                No meetings scheduled yet. Click &apos;Schedule Meeting&apos; to begin.
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Action Items ({actionItems?.length ?? 0})
            </h3>
            {actionItems && actionItems.length > 0 ? (
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-start gap-2.5"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        item.priority === "high"
                          ? "bg-rose-500"
                          : item.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-zinc-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-900">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-[#7A726A]">
                        <span className="font-bold uppercase text-rose-600">
                          {item.priority}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{item.owner}</span>
                        {item.due_date && (
                          <>
                            <span>·</span>
                            <span>Due {item.due_date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#7A726A]">
                No action items on file for this client.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
