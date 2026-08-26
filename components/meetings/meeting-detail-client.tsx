"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Brain, Shield, Upload, CheckCircle2,
  AlertTriangle, Clock, Send, Loader2,
  Calendar, User, Mic, ClipboardList, AlertCircle, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/types/supabase";

type MeetingWithRelations = {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_at: string;
  status: string;
  briefing: unknown;
  intelligence: unknown;
  compliance_record: unknown;
  compliance_status: string | null;
  follow_up_sent: boolean;
  transcript_text: string | null;
  clients: { id: string; full_name: string; portfolio_value: number | null; risk_tolerance: string | null; investment_goals: string[]; notes: string | null } | null;
  profiles: { full_name: string } | null;
};

interface MeetingDetailClientProps {
  meeting: MeetingWithRelations;
  actionItems: ActionItem[];
}

type TabId = "briefing" | "intelligence" | "compliance" | "actions";

export function MeetingDetailClient({ meeting, actionItems }: MeetingDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("briefing");
  const [loading, setLoading] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const client = meeting.clients;
  const briefing = meeting.briefing as Record<string, unknown> | null;
  const intelligence = meeting.intelligence as Record<string, unknown> | null;
  const compliance = meeting.compliance_record as Record<string, unknown> | null;

  const TABS: { id: TabId; label: string; icon: typeof Brain }[] = [
    { id: "briefing", label: "Briefing Pack", icon: Brain },
    { id: "intelligence", label: "Meeting Intelligence", icon: Mic },
    { id: "compliance", label: "Compliance Record", icon: Shield },
    { id: "actions", label: `Actions (${actionItems.length})`, icon: ClipboardList },
  ];

  async function generateBriefing() {
    setLoading("briefing");
    setError(null);
    try {
      const res = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meeting.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Briefing generated successfully!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate briefing");
    } finally {
      setLoading(null);
    }
  }

  async function processTranscript() {
    if (!transcript.trim()) return;
    setLoading("intelligence");
    setError(null);
    try {
      const res = await fetch("/api/ai/meeting-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meeting.id, transcript }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Meeting intelligence extracted!");
      setShowTranscriptInput(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process transcript");
    } finally {
      setLoading(null);
    }
  }

  async function generateCompliance() {
    setLoading("compliance");
    setError(null);
    try {
      const res = await fetch("/api/ai/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meeting.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Compliance record generated!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate compliance record");
    } finally {
      setLoading(null);
    }
  }

  async function sendFollowUp() {
    setLoading("followup");
    setError(null);
    try {
      const res = await fetch("/api/emails/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meeting.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Follow-up email sent!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send follow-up");
    } finally {
      setLoading(null);
    }
  }

  const complianceColorMap: Record<string, string> = {
    compliant: "text-emerald-700 bg-emerald-50 border-emerald-200",
    "needs-review": "text-amber-800 bg-amber-50 border-amber-200",
    flagged: "text-red-700 bg-red-50 border-red-200",
    pending: "text-zinc-600 bg-zinc-100 border-zinc-200",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/meetings" className="w-10 h-10 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#5A544E] hover:text-[#121217] shadow-sm transition-colors flex-shrink-0 mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">{meeting.title}</h1>
            <span className={cn("text-xs font-mono font-bold px-3 py-1 rounded-full border",
              meeting.status === "completed" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : meeting.status === "scheduled" ? "text-rose-700 bg-rose-50 border-rose-200"
              : "text-zinc-700 bg-zinc-100 border-zinc-200"
            )}>
              {meeting.status.toUpperCase()}
            </span>
            {meeting.compliance_status && (
              <span className={cn("text-xs font-mono font-bold px-3 py-1 rounded-full border", complianceColorMap[meeting.compliance_status])}>
                {meeting.compliance_status.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#7A726A]">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-rose-500" />{new Date(meeting.scheduled_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-rose-500" />{client?.full_name}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* AI Action Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EADBCE] shadow-sm flex flex-wrap items-center gap-3">
        <button id="generate-briefing-btn" onClick={generateBriefing} disabled={!!loading}
          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm",
            briefing ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "btn-hero-gradient text-white",
            loading === "briefing" && "opacity-50 cursor-not-allowed"
          )}>
          {loading === "briefing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          <span>{briefing ? "Regenerate Briefing" : "Generate Briefing"}</span>
        </button>

        <button id="process-transcript-btn" onClick={() => setShowTranscriptInput(!showTranscriptInput)} disabled={!!loading}
          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm",
            intelligence ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-[#EADBCE] text-[#121217] hover:bg-[#FAF5F0]",
          )}>
          <Mic className="w-4 h-4" />
          <span>{intelligence ? "Update Intelligence" : "Process Transcript"}</span>
        </button>

        {intelligence && !compliance && (
          <button id="generate-compliance-btn" onClick={generateCompliance} disabled={!!loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors shadow-sm">
            {loading === "compliance" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span>Generate Compliance Record</span>
          </button>
        )}

        {intelligence && !meeting.follow_up_sent && (
          <button id="send-followup-btn" onClick={sendFollowUp} disabled={!!loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#121217] hover:bg-zinc-800 text-white transition-colors ml-auto shadow-sm">
            {loading === "followup" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Send Follow-up Email</span>
          </button>
        )}
        {meeting.follow_up_sent && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />Follow-up sent
          </span>
        )}
      </div>

      {/* Transcript Input */}
      {showTranscriptInput && (
        <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-md animate-slide-up">
          <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-3">Paste Meeting Transcript</h3>
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={10}
            placeholder="Paste your meeting transcript here... (from Zoom, Google Meet, Teams, or any transcription service)"
            className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-2xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors resize-none" />
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowTranscriptInput(false)}
              className="px-5 py-2.5 bg-white border border-[#EADBCE] text-[#121217] text-sm font-bold rounded-full hover:bg-[#FAF5F0] transition-colors">
              Cancel
            </button>
            <button id="process-transcript-confirm" onClick={processTranscript} disabled={!transcript.trim() || loading === "intelligence"}
              className="btn-hero-gradient flex items-center gap-2 px-6 py-2.5 disabled:opacity-50 text-white text-sm font-bold rounded-full transition-all shadow-md">
              {loading === "intelligence" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              <span>Extract Intelligence</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#EADBCE]">
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("flex items-center gap-2 px-5 py-3 text-sm font-heading font-bold border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-rose-600 text-[#121217]"
                    : "border-transparent text-[#7A726A] hover:text-[#121217]"
                )}>
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {/* Briefing Tab */}
        {activeTab === "briefing" && (
          <div>
            {briefing ? (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <h3 className="text-xs font-heading font-bold text-rose-600 uppercase tracking-wider mb-3">Executive Summary</h3>
                  <p className="text-[#5A544E] leading-relaxed text-sm">{briefing.executiveSummary as string}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Key Talking Points */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Key Talking Points</h3>
                    <ul className="space-y-3">
                      {(briefing.keyTalkingPoints as string[])?.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#5A544E]">
                          <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunity Signals */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-emerald-700 uppercase tracking-wider mb-4">Opportunity Signals</h3>
                    <ul className="space-y-3">
                      {(briefing.opportunitySignals as string[])?.map((signal, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#5A544E]">
                          <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 fill-amber-400" />
                          <span className="leading-relaxed">{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Flags */}
                  {(briefing.riskFlags as string[])?.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm bg-amber-50/20">
                      <h3 className="text-xs font-heading font-bold text-amber-800 uppercase tracking-wider mb-4">Risk Flags</h3>
                      <ul className="space-y-3">
                        {(briefing.riskFlags as string[]).map((flag, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#5A544E]">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Open Actions */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Open Action Items</h3>
                    <ul className="space-y-3">
                      {(briefing.openActionItems as {item: string; priority: string}[])?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5",
                            item.priority === "high" ? "bg-red-50 text-red-700 border border-red-200"
                            : item.priority === "medium" ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          )}>{item.priority}</span>
                          <span className="text-[#5A544E] leading-relaxed">{item.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Agenda */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Recommended Agenda</h3>
                  <ol className="space-y-3">
                    {(briefing.recommendedAgenda as string[])?.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#5A544E]">
                        <span className="text-xs font-mono font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">{String(i+1).padStart(2, "0")}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm py-16 text-center">
                <Brain className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
                <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No briefing yet</h3>
                <p className="text-sm text-[#7A726A] mb-6">Generate a briefing pack to prepare for this meeting</p>
                <button onClick={generateBriefing} disabled={!!loading}
                  className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full shadow-md">
                  {loading === "briefing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  <span>Generate Briefing Pack</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Intelligence Tab */}
        {activeTab === "intelligence" && (
          <div>
            {intelligence ? (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-heading font-bold text-rose-600 uppercase tracking-wider">Meeting Summary</h3>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full border",
                      intelligence.clientSentiment === "positive" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : intelligence.clientSentiment === "concerned" ? "text-amber-800 bg-amber-50 border-amber-200"
                      : "text-zinc-700 bg-zinc-100 border-zinc-200"
                    )}>
                      Sentiment: {intelligence.clientSentiment as string}
                    </span>
                  </div>
                  <p className="text-[#5A544E] leading-relaxed text-sm">{intelligence.meetingSummary as string}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Key Decisions</h3>
                    <ul className="space-y-3">
                      {(intelligence.keyDecisions as string[])?.map((d, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#5A544E]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Client Concerns</h3>
                    {(intelligence.clientConcerns as string[])?.length > 0 ? (
                      <ul className="space-y-3">
                        {(intelligence.clientConcerns as string[]).map((c, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#5A544E]">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{c}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#7A726A]">No concerns noted</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Follow-up Email Draft</h3>
                  <div className="bg-[#FAF5F0] rounded-2xl p-5 text-sm text-[#121217] leading-relaxed whitespace-pre-wrap border border-[#EADBCE]">
                    {intelligence.followUpEmailDraft as string}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm py-16 text-center">
                <Mic className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
                <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No meeting transcript yet</h3>
                <p className="text-sm text-[#7A726A] mb-6">Upload a transcript after your meeting to extract intelligence</p>
                <button onClick={() => setShowTranscriptInput(true)}
                  className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>Process Transcript</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <div>
            {compliance ? (
              <div className="space-y-6">
                <div className={cn("bg-white rounded-3xl p-6 sm:p-8 border shadow-sm",
                  (compliance.complianceStatus as string) === "compliant" ? "border-emerald-200"
                  : (compliance.complianceStatus as string) === "flagged" ? "border-red-200"
                  : "border-amber-200"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">Compliance Status</h3>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full border",
                      complianceColorMap[compliance.complianceStatus as string] || "text-zinc-700 bg-zinc-100 border-zinc-200"
                    )}>
                      {(compliance.complianceStatus as string)?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-rose-600 mb-2">Record ID: {compliance.recordId as string}</p>
                  <p className="text-sm text-[#5A544E] leading-relaxed">{compliance.auditNarrative as string}</p>
                </div>

                {(compliance.regulatoryFlags as {flag: string; severity: string; requiredAction: string}[])?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-amber-800 uppercase tracking-wider mb-4">Regulatory Flags</h3>
                    <div className="space-y-3">
                      {(compliance.regulatoryFlags as {flag: string; severity: string; requiredAction: string}[]).map((f, i) => (
                        <div key={i} className={cn("p-4 rounded-2xl border",
                          f.severity === "critical" ? "bg-red-50 border-red-200 text-red-900"
                          : f.severity === "warning" ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-xs font-bold uppercase", f.severity === "critical" ? "text-red-700" : f.severity === "warning" ? "text-amber-800" : "text-zinc-600")}>{f.severity}</span>
                          </div>
                          <p className="text-sm font-bold">{f.flag}</p>
                          <p className="text-xs text-[#5A544E] mt-1">Required: {f.requiredAction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Attestation</h3>
                  <p className="text-sm text-[#5A544E] leading-relaxed italic">{compliance.attestationText as string}</p>
                  <p className="text-xs text-[#7A726A] mt-4 font-medium">Retention Requirement: {compliance.retentionRequirement as string}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm py-16 text-center">
                <Shield className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
                <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No compliance record yet</h3>
                <p className="text-sm text-[#7A726A] mb-4">Process a transcript first to generate the compliance record</p>
                {!intelligence && <p className="text-xs text-[#8E847C]">Requires: Meeting Intelligence</p>}
                {intelligence && (
                  <button onClick={generateCompliance} disabled={!!loading}
                    className="btn-hero-gradient mt-2 inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full shadow-md">
                    {loading === "compliance" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    <span>Generate Compliance Record</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === "actions" && (
          <div className="space-y-4">
            {actionItems.length > 0 ? (
              actionItems.map((item) => (
                <div key={item.id} className={cn("bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-sm flex items-start gap-4",
                  item.status === "completed" && "opacity-60 bg-[#FAF5F0]"
                )}>
                  <div className={cn("mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    item.status === "completed" ? "bg-emerald-600 border-emerald-600" : "border-[#D8CCC2]"
                  )}>
                    {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold", item.status === "completed" ? "line-through text-[#8E847C]" : "text-[#121217]")}>{item.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border",
                        item.priority === "high" ? "bg-red-50 text-red-700 border-red-200"
                        : item.priority === "medium" ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      )}>{item.priority}</span>
                      <span className="text-xs text-[#7A726A] capitalize font-medium">{item.owner}</span>
                      {item.due_date && <span className="text-xs text-[#7A726A] flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.due_date}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm py-16 text-center">
                <ClipboardList className="w-10 h-10 text-[#A89E95] mx-auto mb-4" />
                <h3 className="text-lg font-heading font-bold text-[#121217] mb-2">No action items</h3>
                <p className="text-sm text-[#7A726A]">Action items will appear after processing the meeting transcript</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
