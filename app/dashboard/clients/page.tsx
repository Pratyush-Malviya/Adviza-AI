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
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Clients
          </h1>
          <p className="text-sm text-[#7A726A] mt-1">
            {clients?.length ?? 0} total client relationships
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          id="add-client-btn"
          className="btn-hero-gradient inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-white text-sm font-bold rounded-full shadow-md shadow-rose-500/20 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Client list */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden">
        {clients && clients.length > 0 ? (
          <>
            {/* Mobile Card List (screens < 768px) */}
            <div className="md:hidden divide-y divide-[#EADBCE]/60">
              {clients.map((client: Client) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF5F0]/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold shrink-0">
                      {getInitials(client.full_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-[#121217] text-sm truncate">
                        {client.full_name}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#7A726A] mt-0.5">
                        <span className="font-bold text-[#121217]">
                          {client.portfolio_value ? formatCurrency(client.portfolio_value) : "—"}
                        </span>
                        {client.risk_tolerance && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                              riskColorMap[client.risk_tolerance] || "text-zinc-700 bg-zinc-100 border-zinc-200"
                            }`}
                          >
                            {client.risk_tolerance}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A89E95] shrink-0" />
                </Link>
              ))}
            </div>

            {/* Desktop Table View (screens >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#EADBCE]/80 bg-[#FAF5F0]/60">
                  <div className="col-span-4 text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">
                    Client
                  </div>
                  <div className="col-span-2 text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">
                    Portfolio
                  </div>
                  <div className="col-span-2 text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">
                    Risk Profile
                  </div>
                  <div className="col-span-3 text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">
                    Goals
                  </div>
                  <div className="col-span-1" />
                </div>

                {/* Rows */}
                <div className="divide-y divide-[#EADBCE]/60">
                  {clients.map((client: Client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#FAF5F0]/60 transition-colors group items-center"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold flex-shrink-0">
                          {getInitials(client.full_name)}
                        </div>
                        <div>
                          <div className="font-heading font-bold text-[#121217] text-sm">
                            {client.full_name}
                          </div>
                          {client.email && (
                            <div className="text-xs text-[#7A726A]">{client.email}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="text-sm font-bold text-[#121217]">
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
                              className="text-xs px-2.5 py-0.5 bg-[#FAF5F0] border border-[#EADBCE] text-[#5A544E] font-medium rounded-full"
                            >
                              {goal}
                            </span>
                          ))}
                          {(client.investment_goals?.length ?? 0) > 2 && (
                            <span className="text-xs text-[#8E847C] font-semibold">
                              +{client.investment_goals.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <ChevronRight className="w-4 h-4 text-[#A89E95] group-hover:text-[#121217] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
            <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No clients yet</h3>
            <p className="text-sm text-[#7A726A] mb-6">
              Add your first client to get started with AI-powered briefings
            </p>
            <Link
              href="/dashboard/clients/new"
              className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-3 min-h-[44px] text-white text-sm font-bold rounded-full shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Client</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
