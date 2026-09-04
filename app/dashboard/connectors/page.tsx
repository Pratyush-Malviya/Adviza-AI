import { Zap, ShieldCheck, Cpu } from "lucide-react";
import { IntegrationsHub } from "@/components/dashboard/integrations-hub";

export const metadata = { title: "Connectors & Tools" };

export default function ConnectorsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Connectors & Tool Integrations</h1>
          </div>
          <p className="text-xs text-zinc-500 max-w-2xl">
            Connect your advisor tools to empower AI agents with direct calendar sync, email dispatch, CRM export, and automated compliance alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-mono text-zinc-600 flex items-center gap-2 shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gateway: <strong className="text-zinc-900">Active</strong></span>
          </div>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Automated Ingestion</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Synchronize scheduled client reviews from Google Calendar or Microsoft Outlook without manual data entry.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Direct CRM Sync</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Push meeting summaries, suitability memos, and action items directly into Salesforce, HubSpot, or Wealthbox.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">1-Click Dispatch</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Send AI-generated client follow-up letters directly through your connected Gmail or Outlook mailbox.
            </p>
          </div>
        </div>
      </div>

      {/* Main Integrations Hub with Search & Filters */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs">
        <IntegrationsHub />
      </div>
    </div>
  );
}
