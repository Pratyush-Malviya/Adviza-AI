"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Brain, Shield, CheckCircle2,
  Clock, Send, Loader2,
  Calendar, User, Mic, ClipboardList, AlertCircle, Sparkles, FileText, Download, ExternalLink
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

const SAMPLE_DEMO_TRANSCRIPT = `Advisor (David Miller): Good morning Alexander, thank you for joining our Q3 portfolio review. Today I want to analyze your current $3.85M asset allocation, particularly following your recent Series B liquidity event.

Client (Alexander Vance): Thanks David. Yes, with the $2.1M liquidity from our secondary tender offer, I have significant cash sitting idle in checking, but I'm also worried about a heavy capital gains tax hit next April. Plus, my concentrated tech equity exposure is higher than I'd like.

Advisor (David Miller): Exactly. Here is my strategic recommendation: first, we should execute tax-loss harvesting on your legacy emerging markets positions before Friday to offset approximately $65,000 in capital gains.

Client (Alexander Vance): That sounds prudent. What do you recommend doing with the idle cash?

Advisor (David Miller): I propose deploying 35% ($750,000) into a California tax-exempt municipal bond ladder yielding approximately 4.1% federal/state tax-free. For the remaining capital, we can dollar-cost average into our Global Tech & Clean Energy ETF strategy over the next 4 months.

Client (Alexander Vance): I agree with the municipal bond ladder and the 4-month dollar-cost averaging plan. Let's proceed. What are our next steps?

Advisor (David Miller): I will draft and send over the updated Investment Policy Statement (IPS) and municipal bond proposal by Thursday. On your end, could you please forward your 2025 tax return schedule and verify your trust beneficiary details?

Client (Alexander Vance): Absolutely, I will email those tax schedules to your operations team tomorrow afternoon.

Advisor (David Miller): Excellent. As a regulatory disclosure under SEC Reg BI and FINRA suitability standards, fixed-income allocations carry interest rate and liquidity risk as documented in our Form ADV Part 2A.

Client (Alexander Vance): Understood and fully acknowledged. Thank you David!`;

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
      setSuccess("Google Gemini Briefing generated successfully!");
      setActiveTab("briefing");
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
      setSuccess("Meeting intelligence & action items extracted via Gemini!");
      setShowTranscriptInput(false);
      setActiveTab("intelligence");
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
      setSuccess("SEC/FINRA Compliance record generated!");
      setActiveTab("compliance");
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
      setSuccess("Follow-up email dispatched to client via Resend!");
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
          <div className="flex items-center gap-4 text-sm text-[#7A726A]" suppressHydrationWarning>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-rose-500" />{new Date(meeting.scheduled_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-rose-500" />{client?.full_name}</span>
          </div>
        </div>
      </div>

      {/* Interactive AI Lifecycle Guide / Demo Flow Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-rose-600">
            <Sparkles className="w-4 h-4" />
            <span>AI Wealth Advisory Lifecycle</span>
          </div>
          <span className="text-[11px] text-[#8E847C] font-mono">Gemini 3.6 Flash + Resend</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={cn("p-3 rounded-2xl border transition-all text-xs", briefing ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#FAF5F0] border-[#EADBCE] text-[#5A544E]")}>
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-mono border">1</span>
              Briefing Pack
            </div>
            <p className="text-[11px] opacity-80">{briefing ? "✓ Generated" : "Pre-meeting summary"}</p>
          </div>

          <div className={cn("p-3 rounded-2xl border transition-all text-xs", intelligence ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#FAF5F0] border-[#EADBCE] text-[#5A544E]")}>
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-mono border">2</span>
              Intelligence
            </div>
            <p className="text-[11px] opacity-80">{intelligence ? "✓ Analyzed" : "Extract decisions & actions"}</p>
          </div>

          <div className={cn("p-3 rounded-2xl border transition-all text-xs", compliance ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#FAF5F0] border-[#EADBCE] text-[#5A544E]")}>
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-mono border">3</span>
              Compliance
            </div>
            <p className="text-[11px] opacity-80">{compliance ? "✓ Audit Ready" : "SEC / FINRA memo"}</p>
          </div>

          <div className={cn("p-3 rounded-2xl border transition-all text-xs", meeting.follow_up_sent ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#FAF5F0] border-[#EADBCE] text-[#5A544E]")}>
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-mono border">4</span>
              Follow-up
            </div>
            <p className="text-[11px] opacity-80">{meeting.follow_up_sent ? "✓ Sent to Client" : "Deliver via Resend"}</p>
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
            briefing ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "btn-hero-gradient text-white",
            loading === "briefing" && "opacity-50 cursor-not-allowed"
          )}>
          {loading === "briefing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          <span>{briefing ? "Regenerate Briefing" : "Generate Briefing"}</span>
        </button>

        <button id="process-transcript-btn" onClick={() => setShowTranscriptInput(!showTranscriptInput)} disabled={!!loading}
          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm",
            intelligence ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-white border-[#EADBCE] text-[#121217] hover:bg-[#FAF5F0]",
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

      {/* Transcript & Audio Input with Quick Demo Presets */}
      {showTranscriptInput && (
        <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-md animate-slide-up space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">Audio Recording & Transcript Upload</h3>
              <p className="text-xs text-[#7A726A] mt-0.5">Upload meeting audio (.mp3, .m4a, .wav) for auto-transcription or paste text below</p>
            </div>
            <button
              onClick={() => setTranscript(SAMPLE_DEMO_TRANSCRIPT)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Transcript (Demo)</span>
            </button>
          </div>

          {/* Audio Upload Dropzone */}
          <div className="border-2 border-dashed border-[#EADBCE] hover:border-rose-300 rounded-2xl p-5 bg-[#FAF5F0]/40 transition-colors text-center">
            <input
              type="file"
              id="meeting-audio-file"
              accept="audio/*,.mp3,.m4a,.wav,.webm,.ogg"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLoading("transcribing");
                setError(null);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("meetingId", meeting.id);
                  const res = await fetch("/api/meetings/transcribe", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Transcription failed");
                  setTranscript(data.transcript);
                  setSuccess(`Transcribed ${file.name} successfully via Gemini Multimodal Speech!`);
                } catch (err: any) {
                  setError(err.message || "Failed to transcribe audio file");
                } finally {
                  setLoading(null);
                }
              }}
            />
            <label htmlFor="meeting-audio-file" className="cursor-pointer flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EADBCE] flex items-center justify-center text-rose-600 shadow-sm">
                {loading === "transcribing" ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#121217]">
                  {loading === "transcribing" ? "Transcribing meeting audio via Gemini..." : "Drop advisory meeting audio here or click to browse"}
                </p>
                <p className="text-[11px] text-[#7A726A] mt-0.5">Supports MP3, M4A, WAV, WEBM audio recordings (up to 50MB)</p>
              </div>
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EADBCE]" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#8E847C]"><span className="bg-white px-2">or edit verbatim transcript text</span></div>
          </div>

          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8}
            placeholder="Paste your meeting transcript here... or click 'Load Sample Transcript' above to test Gemini AI immediately"
            className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-2xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors resize-none font-mono text-xs leading-relaxed" />
          <div className="flex gap-3">
            <button onClick={() => setShowTranscriptInput(false)}
              className="px-5 py-2.5 bg-white border border-[#EADBCE] text-[#121217] text-sm font-bold rounded-full hover:bg-[#FAF5F0] transition-colors">
              Cancel
            </button>
            <button id="process-transcript-confirm" onClick={processTranscript} disabled={!transcript.trim() || loading === "intelligence" || loading === "transcribing"}
              className="btn-hero-gradient flex items-center gap-2 px-6 py-2.5 disabled:opacity-50 text-white text-sm font-bold rounded-full transition-all shadow-md">
              {loading === "intelligence" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              <span>Extract Intelligence & Actions</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#EADBCE]">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition-colors flex-shrink-0",
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
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <h3 className="text-xs font-heading font-bold text-rose-600 uppercase tracking-wider">Executive Summary</h3>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/documents/export?type=briefing&clientName=${encodeURIComponent(client?.full_name || "Client")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EADBCE] bg-[#FAF5F0] hover:bg-[#EADBCE] text-xs font-bold text-[#121217] transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
                        <span>Open Dossier</span>
                      </a>
                      <a
                        href={`/api/documents/export?type=briefing&format=pdf&clientName=${encodeURIComponent(client?.full_name || "Client")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121217] hover:bg-[#272730] text-xs font-bold text-white transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-400" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  </div>
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
                        <li key={i} className="flex items-start gap-3 text-sm text-emerald-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Portfolio Highlights */}
                {Array.isArray(briefing.portfolioHighlights) && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Portfolio Highlights</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(briefing.portfolioHighlights as { metric: string; value: string; trend?: string }[]).map((h, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE]">
                          <div className="text-xs text-[#8E847C] font-medium">{h.metric}</div>
                          <div className="text-xl font-heading font-extrabold text-[#121217] mt-1">{h.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-[#EADBCE] shadow-sm text-center">
                <Brain className="w-10 h-10 text-[#A89E95] mx-auto mb-3" />
                <h3 className="text-base font-heading font-bold text-[#121217] mb-1">No Briefing Pack Generated</h3>
                <p className="text-sm text-[#7A726A] mb-4">Generate an AI briefing pack to review portfolio context and talking points before the meeting.</p>
                <button onClick={generateBriefing} disabled={!!loading}
                  className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-full shadow-md">
                  {loading === "briefing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  <span>Generate Briefing with Gemini</span>
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
                {/* Meeting Summary */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <h3 className="text-xs font-heading font-bold text-rose-600 uppercase tracking-wider mb-3">AI Meeting Summary</h3>
                  <p className="text-[#5A544E] leading-relaxed text-sm">{intelligence.meetingSummary as string}</p>
                </div>

                {/* Key Decisions & Topics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Key Decisions Made</h3>
                    <ul className="space-y-2.5 text-sm text-[#5A544E]">
                      {(intelligence.keyDecisions as string[])?.map((dec, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{dec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-4">Follow-up Email Draft</h3>
                    <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs font-mono whitespace-pre-wrap text-[#2A2520] max-h-60 overflow-y-auto">
                      {intelligence.followUpEmailDraft as string}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-[#EADBCE] shadow-sm text-center">
                <Mic className="w-10 h-10 text-[#A89E95] mx-auto mb-3" />
                <h3 className="text-base font-heading font-bold text-[#121217] mb-1">No Meeting Intelligence Yet</h3>
                <p className="text-sm text-[#7A726A] mb-4">Paste a meeting transcript to extract decisions, sentiment, action items, and drafted follow-up emails.</p>
                <button onClick={() => setShowTranscriptInput(true)}
                  className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-full shadow-md">
                  <FileText className="w-4 h-4" />
                  <span>Paste Transcript / Load Demo</span>
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
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#8E847C]">RECORD ID: {compliance.recordId as string}</span>
                      <h3 className="text-lg font-heading font-bold text-[#121217] mt-0.5">SEC / FINRA Fiduciary Compliance Record</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/documents/export?type=compliance&clientName=${encodeURIComponent(client?.full_name || "Client")}&id=${compliance.recordId as string}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EADBCE] bg-[#FAF5F0] hover:bg-[#EADBCE] text-xs font-bold text-[#121217] transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Audit View</span>
                      </a>
                      <a
                        href={`/api/compliance/export-finra?clientName=${encodeURIComponent(client?.full_name || "Client")}&format=pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition shadow-sm"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>FINRA / SEC Packet</span>
                      </a>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase">
                        {compliance.complianceStatus as string}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#5A544E] leading-relaxed">
                    {(compliance.suitabilityAssessment as { rationale?: string })?.rationale}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm">
                  <h3 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider mb-3">Audit Trail Narrative</h3>
                  <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#5A544E] leading-relaxed">
                    {compliance.auditNarrative as string}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#EADBCE] text-[11px] text-[#8E847C] font-mono">
                    Retention standard: {compliance.retentionRequirement as string}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-[#EADBCE] shadow-sm text-center">
                <Shield className="w-10 h-10 text-[#A89E95] mx-auto mb-3" />
                <h3 className="text-base font-heading font-bold text-[#121217] mb-1">No Compliance Record</h3>
                <p className="text-sm text-[#7A726A] mb-4">Extract meeting intelligence first to automatically generate your SEC/FINRA suitability audit record.</p>
                {intelligence ? (
                  <button onClick={generateCompliance} disabled={!!loading}
                    className="btn-hero-gradient inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-full shadow-md">
                    {loading === "compliance" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    <span>Generate Compliance Record</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#8E847C] font-medium">Process meeting transcript in Step 2 first</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === "actions" && (
          <div>
            {actionItems.length > 0 ? (
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#EADBCE] shadow-sm flex items-start gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5",
                      item.priority === "high" ? "bg-rose-500" : item.priority === "medium" ? "bg-amber-500" : "bg-zinc-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#121217]">{item.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#7A726A]">
                        <span className="font-bold uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">{item.priority}</span>
                        <span className="capitalize font-medium">{item.owner}</span>
                        {item.due_date && <span>Due {item.due_date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-[#EADBCE] shadow-sm text-center">
                <ClipboardList className="w-10 h-10 text-[#A89E95] mx-auto mb-3" />
                <h3 className="text-base font-heading font-bold text-[#121217] mb-1">No Action Items</h3>
                <p className="text-sm text-[#7A726A]">Action items will be extracted automatically when processing your meeting transcript.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
