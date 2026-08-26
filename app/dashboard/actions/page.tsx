import { createClient } from "@/lib/supabase/server";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Action Items" };

const priorityConfig = {
  high: { color: "text-rose-700 bg-rose-50 border-rose-200" },
  medium: { color: "text-amber-800 bg-amber-50 border-amber-200" },
  low: { color: "text-zinc-700 bg-zinc-100 border-zinc-200" },
};

type ActionItemRow = {
  id: string;
  description: string;
  status: string;
  priority: "high" | "medium" | "low";
  owner: string;
  due_date: string | null;
  meetings: { title: string; scheduled_at: string } | null;
  clients: { full_name: string } | null;
};

export default async function ActionsPage() {
  const supabase = await createClient();
  const { data: actionsRaw } = await supabase
    .from("action_items")
    .select("*, clients(full_name), meetings(title, scheduled_at)")
    .order("priority", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  const actions = (actionsRaw ?? []) as unknown as ActionItemRow[];

  const open = actions?.filter((a) => a.status === "open") ?? [];
  const inProgress = actions?.filter((a) => a.status === "in-progress") ?? [];
  const completed = actions?.filter((a) => a.status === "completed") ?? [];

  const renderActionItem = (item: ActionItemRow) => {
    const priority = item.priority as keyof typeof priorityConfig;
    const config = priorityConfig[priority] || priorityConfig.low;
    const meeting = item.meetings;
    const client = item.clients;

    return (
      <div key={item.id} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#EADBCE] shadow-sm flex items-start gap-3 sm:gap-4 hover:shadow-md transition-all">
        <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 sm:mt-2",
          item.status === "completed" ? "bg-emerald-500" : item.priority === "high" ? "bg-rose-500" : item.priority === "medium" ? "bg-amber-500" : "bg-zinc-400"
        )} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-bold leading-snug", item.status === "completed" ? "line-through text-[#8E847C]" : "text-[#121217]")}>
            {item.description}
          </p>
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-2.5">
            <span className={cn("text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase", config.color)}>{item.priority}</span>
            {client?.full_name && (
              <span className="flex items-center gap-1 text-xs text-[#7A726A] font-medium"><User className="w-3.5 h-3.5 text-rose-500" />{client.full_name}</span>
            )}
            <span className="text-xs text-[#8E847C] capitalize font-medium">{item.owner}</span>
            {item.due_date && (
              <span className="flex items-center gap-1 text-xs text-[#7A726A] font-medium">
                <Clock className="w-3.5 h-3.5 text-rose-500" />Due {item.due_date}
              </span>
            )}
          </div>
          {meeting && (
            <p className="text-[11px] sm:text-xs text-[#8E847C] mt-2 truncate" suppressHydrationWarning>
              From: {meeting.title} · {new Date(meeting.scheduled_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">Action Items</h1>
        <p className="text-xs sm:text-sm text-[#7A726A] mt-1">{open.length} open · {inProgress.length} in progress · {completed.length} completed</p>
      </div>

      {/* Summary stats - 1 col on mobile, 3 cols on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {[
          { label: "Open", count: open.length, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
          { label: "In Progress", count: inProgress.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Completed", count: completed.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EADBCE] shadow-sm flex items-center gap-3.5 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border ${s.bg} ${s.color} flex-shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217]">{s.count}</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#8E847C] uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open Actions */}
      {open.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-rose-700 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />Open Actions ({open.length})
          </h2>
          <div className="space-y-2.5 sm:space-y-3">{open.map(renderActionItem)}</div>
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-amber-800 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />In Progress ({inProgress.length})
          </h2>
          <div className="space-y-2.5 sm:space-y-3">{inProgress.map(renderActionItem)}</div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />Completed ({completed.length})
          </h2>
          <div className="space-y-2.5 sm:space-y-3 opacity-75">{completed.map(renderActionItem)}</div>
        </div>
      )}

      {!actions?.length && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EADBCE] shadow-sm py-16 sm:py-20 text-center px-4">
          <ClipboardList className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
          <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No action items yet</h3>
          <p className="text-sm text-[#7A726A]">Action items are extracted automatically from meeting transcripts</p>
        </div>
      )}
    </div>
  );
}
