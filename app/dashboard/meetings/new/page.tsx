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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/meetings" className="w-9 h-9 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#5A544E] hover:text-[#121217] shadow-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">New Meeting</h1>
          <p className="text-sm text-[#7A726A] mt-0.5">Schedule a meeting and activate AI agents</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">{error}</div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-sm space-y-5">
          <h2 className="text-xs font-heading font-bold text-[#8E847C] uppercase tracking-wider">Meeting Details</h2>

          {/* Client */}
          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">
              <Users className="inline w-3.5 h-3.5 mr-1" />Client *
            </label>
            <select id="meeting-client" name="client_id" value={form.client_id} onChange={handleChange} required
              className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors">
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-amber-700 mt-2 flex items-center gap-1 font-medium">
                No clients yet. <Link href="/dashboard/clients/new" className="underline font-bold">Add a client first →</Link>
              </p>
            )}
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">
              <FileText className="inline w-3.5 h-3.5 mr-1" />Meeting Type *
            </label>
            <select id="meeting-type" name="meeting_type" value={form.meeting_type} onChange={handleChange} required
              className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors">
              {MEETING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Title (optional)</label>
            <input id="meeting-title" name="title" type="text" value={form.title} onChange={handleChange}
              placeholder="Auto-generated if left blank" className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] placeholder-[#A89E95] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">
                <Calendar className="inline w-3.5 h-3.5 mr-1" />Date *
              </label>
              <input id="meeting-date" name="scheduled_at_date" type="date" value={form.scheduled_at_date} onChange={handleChange} required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">
                <Clock className="inline w-3.5 h-3.5 mr-1" />Time *
              </label>
              <input id="meeting-time" name="scheduled_at_time" type="time" value={form.scheduled_at_time} onChange={handleChange} required
                className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold text-[#5A544E] mb-2">Duration (minutes)</label>
            <select id="meeting-duration" name="duration_minutes" value={form.duration_minutes} onChange={handleChange}
              className="w-full px-4 py-3 bg-[#FAF5F0]/60 border border-[#EADBCE] rounded-xl text-[#121217] text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-colors">
              {["30", "45", "60", "90", "120"].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Info */}
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-100 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-rose-900 font-bold mb-1">AI Agents activate automatically</p>
            <p className="text-xs text-rose-700/80 leading-relaxed">The Client Briefing Agent prepares a full context pack immediately. After the call, upload the transcript to generate intelligence & compliance records.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/meetings"
            className="flex-1 py-3.5 bg-white hover:bg-[#FAF5F0] border border-[#EADBCE] text-[#121217] font-bold rounded-full transition-colors text-center text-sm shadow-sm">
            Cancel
          </Link>
          <button id="submit-meeting" type="submit" disabled={loading}
            className="btn-hero-gradient flex-1 py-3.5 disabled:opacity-50 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-rose-500/20">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Scheduling...</span></> : <span>Schedule Meeting</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
