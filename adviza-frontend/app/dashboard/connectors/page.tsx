import { Zap, ShieldCheck, Cpu } from "lucide-react";
import { IntegrationsHub } from "@/components/dashboard/integrations-hub";

export const metadata = { title: "Connectors & Tools" };

export default function ConnectorsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EADBCE]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">Connectors & Tool Integrations</h1>
          </div>
          <p className="text-sm text-[#7A726A] max-w-2xl">
            Connect your advisor tools to empower AI agents with direct calendar sync, email dispatch, CRM export, and automated compliance alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white border border-[#EADBCE] text-xs font-mono text-[#5A544E] flex items-center gap-2 shadow-sm">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Gateway: <strong className="text-[#121217]">Active</strong></span>
          </div>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-heading font-bold text-[#121217] uppercase tracking-wider">Automated Ingestion</h3>
            <p className="text-xs text-[#7A726A] mt-1.5 leading-relaxed">
              Synchronize scheduled client reviews from Google Calendar or Microsoft Outlook without manual data entry.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-heading font-bold text-[#121217] uppercase tracking-wider">Direct CRM Sync</h3>
            <p className="text-xs text-[#7A726A] mt-1.5 leading-relaxed">
              Push meeting summaries, suitability memos, and action items directly into Salesforce, HubSpot, or Wealthbox.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-heading font-bold text-[#121217] uppercase tracking-wider">1-Click Dispatch</h3>
            <p className="text-xs text-[#7A726A] mt-1.5 leading-relaxed">
              Send AI-generated client follow-up letters directly through your connected Gmail or Outlook mailbox.
            </p>
          </div>
        </div>
      </div>

      {/* Main Integrations Hub with Search & Filters */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
        <IntegrationsHub />
      </div>
    </div>
  );
}
