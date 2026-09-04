"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Calendar, Clock, Users, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Client } from "@/types/supabase";

const MEETING_TYPES = [
  "Annual Review",
  "Portfolio Review",
  "Onboarding",
  "Financial Planning",
  "Tax Planning",
  "Estate Planning",
  "Ad-hoc Check-in",
  "Investment Update",
];

export default function NewMeetingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const [form, setForm] = useState({
    client_id: "",
    title: "",
    meeting_type: "Annual Review",
    scheduled_at_date: "",
    scheduled_at_time: "10:00",
    duration_minutes: "60",
  });

  useEffect(() => {
    supabase.from("clients").select("*").order("full_name").then(({ data }) => {
      if (data) setClients(data as Client[]);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single();
    if (!profile) { setError("Profile not found"); setLoading(false); return; }

    const scheduledAt = new Date(`${form.scheduled_at_date}T${form.scheduled_at_time}`).toISOString();

    const { data: meeting, error: insertError } = await supabase.from("meetings").insert({
      firm_id: profile.firm_id,
      client_id: form.client_id,
      advisor_id: user.id,
      title: form.title || `${form.meeting_type} — ${new Date(scheduledAt).toLocaleDateString()}`,
      meeting_type: form.meeting_type,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(form.duration_minutes),
      status: "scheduled",
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/meetings/${meeting.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/meetings" className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 shadow-2xs transition-colors cursor-pointer" aria-label="Back to Meetings">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New Meeting</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Schedule a meeting and activate AI agents</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">{error}</div>
        )}

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Meeting Details</h2>

          {/* Client */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              <Users className="inline w-3.5 h-3.5 mr-1" />Client *
            </label>
            <select id="meeting-client" name="client_id" value={form.client_id} onChange={handleChange} required
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-zinc-400 transition-colors">
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1 font-medium">
                No clients yet. <Link href="/dashboard/clients/new" className="underline font-semibold">Add a client first →</Link>
              </p>
            )}
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              <FileText className="inline w-3.5 h-3.5 mr-1" />Meeting Type *
            </label>
            <select id="meeting-type" name="meeting_type" value={form.meeting_type} onChange={handleChange} required
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-zinc-400 transition-colors">
              {MEETING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Title (optional)</label>
            <input id="meeting-title" name="title" type="text" value={form.title} onChange={handleChange}
              placeholder="Auto-generated if left blank" className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                <Calendar className="inline w-3.5 h-3.5 mr-1" />Date *
              </label>
              <input id="meeting-date" name="scheduled_at_date" type="date" value={form.scheduled_at_date} onChange={handleChange} required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                <Clock className="inline w-3.5 h-3.5 mr-1" />Time *
              </label>
              <input id="meeting-time" name="scheduled_at_time" type="time" value={form.scheduled_at_time} onChange={handleChange} required
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-zinc-400 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Duration (minutes)</label>
            <select id="meeting-duration" name="duration_minutes" value={form.duration_minutes} onChange={handleChange}
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-zinc-400 transition-colors">
              {["30", "45", "60", "90", "120"].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Info */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-zinc-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-900 font-semibold mb-0.5">AI Agents activate automatically</p>
            <p className="text-xs text-zinc-500 leading-relaxed">The Client Briefing Agent prepares a full context pack immediately. After the call, upload the transcript to generate intelligence & compliance records.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/meetings"
            className="flex-1 py-2.5 flex items-center justify-center bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold rounded-lg transition-colors text-center text-xs shadow-2xs">
            Cancel
          </Link>
          <button id="submit-meeting-btn" type="submit" disabled={loading}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer text-xs">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Scheduling & Generating Briefing...</span>
            ) : (
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />Schedule & Generate Briefing</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
