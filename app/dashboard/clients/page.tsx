import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Plus,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Client } from "@/types/supabase";

export const metadata = {
  title: "Clients",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("full_name", { ascending: true });

  const riskColorMap: Record<string, string> = {
    conservative: "text-purple-700 bg-purple-50 border-purple-200",
    moderate: "text-amber-800 bg-amber-50 border-amber-200",
    aggressive: "text-rose-700 bg-rose-50 border-rose-200",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Clients
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {clients?.length ?? 0} total client relationships
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          id="add-client-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Client list */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-2xs overflow-hidden">
        {clients && clients.length > 0 ? (
          <>
            {/* Mobile Card List (screens < 768px) */}
            <div className="md:hidden divide-y divide-zinc-100">
              {clients.map((client: Client) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 text-xs font-semibold shrink-0">
                      {getInitials(client.full_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 text-sm truncate">
                        {client.full_name}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500 mt-0.5">
                        <span className="font-semibold text-zinc-900">
                          {client.portfolio_value ? formatCurrency(client.portfolio_value) : "—"}
                        </span>
                        {client.risk_tolerance && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${
                              riskColorMap[client.risk_tolerance] || "text-zinc-700 bg-zinc-100 border-zinc-200"
                            }`}
                          >
                            {client.risk_tolerance}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </Link>
              ))}
            </div>

            {/* Desktop Table View (screens >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-zinc-200/80 bg-zinc-50/70">
                  <div className="col-span-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Client
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Portfolio
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Risk Profile
                  </div>
                  <div className="col-span-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Goals
                  </div>
                  <div className="col-span-1" />
                </div>

                {/* Rows */}
                <div className="divide-y divide-zinc-100">
                  {clients.map((client: Client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-zinc-50/70 transition-colors group items-center"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 text-xs font-semibold flex-shrink-0">
                          {getInitials(client.full_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 text-sm">
                            {client.full_name}
                          </div>
                          {client.email && (
                            <div className="text-xs text-zinc-400">{client.email}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="text-sm font-semibold text-zinc-900">
                          {client.portfolio_value
                            ? formatCurrency(client.portfolio_value)
                            : "—"}
                        </span>
                      </div>

                      <div className="col-span-2">
                        {client.risk_tolerance ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                              riskColorMap[client.risk_tolerance] ||
                              "text-zinc-700 bg-zinc-100 border-zinc-200"
                            }`}
                          >
                            {client.risk_tolerance}
                          </span>
                        ) : (
                          <span className="text-[#8E847C] text-sm">—</span>
                        )}
                      </div>

                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1.5">
                          {client.investment_goals?.slice(0, 2).map((goal: string) => (
                            <span
                              key={goal}
                              className="text-xs px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium rounded-full"
                            >
                              {goal}
                            </span>
                          ))}
                          {(client.investment_goals?.length ?? 0) > 2 && (
                            <span className="text-xs text-zinc-400 font-semibold">
                              +{client.investment_goals.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 mb-1">No clients yet</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Add your first client to get started with AI-powered briefings
            </p>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Client</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
