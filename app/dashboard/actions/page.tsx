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
      <div key={item.id} className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-2xs flex items-start gap-3 sm:gap-4 hover:border-zinc-300 transition-all">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
          item.status === "completed" ? "bg-emerald-500" : item.priority === "high" ? "bg-rose-500" : item.priority === "medium" ? "bg-amber-500" : "bg-zinc-400"
        )} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs sm:text-sm font-semibold leading-snug", item.status === "completed" ? "line-through text-zinc-400" : "text-zinc-900")}>
            {item.description}
          </p>
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-2">
            <span className={cn("text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border uppercase", config.color)}>{item.priority}</span>
            {client?.full_name && (
              <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium"><User className="w-3 h-3 text-zinc-400" />{client.full_name}</span>
            )}
            <span className="text-xs text-zinc-400 capitalize font-medium">{item.owner}</span>
            {item.due_date && (
              <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                <Clock className="w-3 h-3 text-zinc-400" />Due {item.due_date}
              </span>
            )}
          </div>
          {meeting && (
            <p className="text-[11px] text-zinc-400 mt-1.5 truncate" suppressHydrationWarning>
              From: {meeting.title} · {new Date(meeting.scheduled_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Action Items</h1>
        <p className="text-xs text-zinc-500 mt-1">{open.length} open · {inProgress.length} in progress · {completed.length} completed</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Open", count: open.length, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
          { label: "In Progress", count: inProgress.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Completed", count: completed.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200/80 shadow-2xs flex items-center gap-3.5 sm:gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${s.bg} ${s.color} flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900">{s.count}</div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {open.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Open Actions</h2>
          <div className="space-y-2">{open.map(renderActionItem)}</div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">In Progress</h2>
          <div className="space-y-2">{inProgress.map(renderActionItem)}</div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Completed</h2>
          <div className="space-y-2">{completed.map(renderActionItem)}</div>
        </div>
      )}

      {actions.length === 0 && (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-2xs py-16 text-center px-4">
          <ClipboardList className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900 mb-1">No action items yet</h3>
          <p className="text-xs text-zinc-500">Action items will be automatically extracted from your meetings by AI</p>
        </div>
      )}
    </div>
  );
}
