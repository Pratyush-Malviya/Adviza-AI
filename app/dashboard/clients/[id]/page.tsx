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
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/clients"
          className="w-10 h-10 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#5A544E] hover:text-[#121217] shadow-sm transition-colors flex-shrink-0 mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
              {client.full_name}
            </h1>
            {client.risk_tolerance && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${
                  riskColorMap[client.risk_tolerance] || "text-zinc-700 bg-zinc-100 border-zinc-200"
                }`}
              >
                {client.risk_tolerance} Risk
              </span>
            )}
          </div>
          <p className="text-sm text-[#7A726A]">
            Client Profile · Managed Wealth Mandate
          </p>
        </div>

        <Link
          href="/dashboard/meetings/new"
          className="btn-hero-gradient flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-full shadow-md shadow-rose-500/20 transition-transform hover:scale-105 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Schedule Meeting</span>
          <span className="sm:hidden">Meeting</span>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCE] shadow-sm">
          <div className="flex items-center gap-3 text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C] mb-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            Total Portfolio
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
            {client.portfolio_value ? formatCurrency(client.portfolio_value) : "—"}
          </div>
          <div className="text-xs text-emerald-700 font-bold mt-1">Active Mandate</div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCE] shadow-sm">
          <div className="flex items-center gap-3 text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C] mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Total Meetings
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
            {meetings?.length ?? 0}
          </div>
          <div className="text-xs text-[#7A726A] mt-1">Recorded & Analyzed</div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCE] shadow-sm">
          <div className="flex items-center gap-3 text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C] mb-2">
            <ClipboardList className="w-4 h-4 text-amber-500" />
            Open Action Items
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">
            {openActions.length}
          </div>
          <div className="text-xs text-[#7A726A] mt-1">Pending Resolution</div>
        </div>
      </div>

      {/* Client Details & Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Contact & Goals */}
        <div className="md:col-span-5 space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C]">
              Contact Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-[#5A544E]">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate">{client.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#5A544E]">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{client.phone || "No phone provided"}</span>
              </div>
            </div>
          </div>

          {/* Investment Goals */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C]">
              <Target className="w-4 h-4 text-rose-500" />
              Investment Goals
            </div>
            <div className="flex flex-wrap gap-2">
              {client.investment_goals && client.investment_goals.length > 0 ? (
                client.investment_goals.map((goal: string) => (
                  <span
                    key={goal}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF5F0] border border-[#EADBCE] text-[#121217]"
                  >
                    {goal}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#8E847C]">No investment goals defined.</span>
              )}
            </div>
          </div>

          {/* CRM Notes */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C]">
              <FileText className="w-4 h-4 text-rose-500" />
              CRM Background Notes
            </div>
            <p className="text-xs sm:text-sm text-[#5A544E] leading-relaxed whitespace-pre-wrap">
              {client.notes || "No CRM notes on file. Add notes during your next meeting."}
            </p>
          </div>

          {/* Mem0 AI Client Memory & Mandates */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-rose-600">
                <Brain className="w-4 h-4 text-rose-500" />
                Persistent AI Memory (Mem0)
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                {clientMemories.length} Mandate{clientMemories.length === 1 ? "" : "s"}
              </span>
            </div>

            {clientMemories.length > 0 ? (
              <div className="space-y-2">
                {clientMemories.map((mem) => (
                  <div key={mem.id} className="p-2.5 rounded-xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#2A2520] flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{mem.memory}</span>
                      <div className="text-[10px] font-mono text-[#8E847C] mt-0.5 uppercase">
                        {mem.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7A726A] leading-relaxed">
                No client-specific preferences extracted yet. Adviza will automatically remember preferences and mandates expressed during advisory meetings.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Meeting History & Actions */}
        <div className="md:col-span-7 space-y-6">
          {/* Meetings History */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C]">
                Meeting History ({meetings?.length ?? 0})
              </h3>
              <Link
                href="/dashboard/meetings/new"
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                + New
              </Link>
            </div>

            {meetings && meetings.length > 0 ? (
              <div className="divide-y divide-[#EADBCE]/60">
                {meetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/meetings/${meeting.id}`}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF5F0]/60 transition-colors group px-2 rounded-xl"
                  >
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-sm text-[#121217] group-hover:text-rose-600 transition-colors truncate">
                        {meeting.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#7A726A] mt-0.5" suppressHydrationWarning>
                        <Clock className="w-3.5 h-3.5 text-[#8E847C]" />
                        <span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="capitalize">{meeting.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {meeting.briefing && <Brain className="w-4 h-4 text-emerald-600" />}
                      {meeting.compliance_record && <Shield className="w-4 h-4 text-purple-600" />}
                      <ChevronRight className="w-4 h-4 text-[#A89E95] group-hover:text-[#121217]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#7A726A]">
                No meetings scheduled yet. Click &apos;Schedule Meeting&apos; to begin.
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#8E847C]">
              Action Items ({actionItems?.length ?? 0})
            </h3>
            {actionItems && actionItems.length > 0 ? (
              <div className="space-y-2.5">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] flex items-start gap-3"
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
                      <p className="text-xs sm:text-sm font-bold text-[#121217]">
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
