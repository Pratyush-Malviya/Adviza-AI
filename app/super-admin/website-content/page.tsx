"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Type,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] = useState<"banner" | "hero" | "stats" | "testimonials" | "faqs">("banner");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [banner, setBanner] = useState({
    enabled: true,
    badge: "New Release",
    text: "Adviza v2.4 introduces Deterministic Portfolio Drift & SEC 204-2 Exam Export",
    ctaText: "Explore the Platform",
    ctaLink: "/platform",
  });

  const [hero, setHero] = useState({
    badge: "Institutional Wealth Management AI",
    headline: "Autonomous Execution Workspace for High-Performing Wealth Advisors",
    subheadline:
      "Adviza handles client meeting dossiers, real-time audio transcription, deterministic portfolio drift analysis, and SEC/FINRA compliance records — freeing your advisors to focus 100% on clients.",
    primaryCtaText: "Start 14-Day Firm Trial",
    primaryCtaLink: "/auth/signup",
    secondaryCtaText: "Schedule Institutional Demo",
    secondaryCtaLink: "/contact",
    trustMetric: "Trusted by 450+ RIA firms managing over $18.4 Billion in combined AUM",
  });

  const [stats, setStats] = useState([
    { value: "$18.4B+", label: "AUM Monitored & Analyzed" },
    { value: "6.2 hrs", label: "Saved per Advisor / Week" },
    { value: "99.8%", label: "Compliance Exam Accuracy" },
    { value: "0%", label: "Client Data Used for LLM Training" },
  ]);

  const [testimonials, setTestimonials] = useState([
    {
      quote:
        "Adviza completely transformed our advisory operations. Before Adviza, each advisor spent 45 minutes compiling meeting notes and CRM updates. Now it happens automatically before the client even walks out the door.",
      author: "Eleanor Vance, CFP®",
      title: "Managing Principal",
      firm: "Beacon Wealth Partners ($1.4B AUM)",
      rating: 5,
    },
    {
      quote:
        "As Chief Compliance Officer, our biggest risk was unstructured communication and incomplete suitability rationales. Adviza provides a tamper-proof, SHA-256 hash-verified evidence trail that made our SEC examination seamless.",
      author: "Marcus Sterling, JD",
      title: "Chief Compliance Officer",
      firm: "Apex Private Wealth ($820M AUM)",
      rating: 5,
    },
  ]);

  const [faqs, setFaqs] = useState([
    {
      question: "Does Adviza use our confidential client data to train public AI models?",
      answer:
        "Absolutely not. Adviza enforces a strict Zero-Data Retention (ZDR) architecture with all LLM providers. Your client transcripts, financial records, and PII are never retained, logged, or used for model training under any circumstance.",
    },
    {
      question: "How does Adviza support SEC Rule 204-2 and FINRA Rule 17a-4?",
      answer:
        "Every meeting dossier, audio transcript, action item, and portfolio recommendation is anchored into a Write-Once-Read-Many (WORM) compliant immutable audit ledger with cryptographic SHA-256 hash chaining.",
    },
  ]);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/super-admin/website-content");
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            if (data.content.announcement_banner) setBanner(data.content.announcement_banner);
            if (data.content.hero) setHero(data.content.hero);
            if (data.content.trust_stats?.stats) setStats(data.content.trust_stats.stats);
            if (data.content.testimonials?.items) setTestimonials(data.content.testimonials.items);
            if (data.content.faqs?.items) setFaqs(data.content.faqs.items);
          }
        }
      } catch {
        // defaults already initialized
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  async function handleSaveSection(sectionKey: string, contentData: any) {
    setSaving(true);
    setSaveStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/super-admin/website-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionKey, content: contentData, isPublished: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save content.");
      } else {
        setSaveStatus(`Successfully saved & published ${sectionKey}! Changes are live on the public site.`);
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch {
      setError("Network error saving section.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white/40">
        <div className="w-5 h-5 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin mr-2" />
        Loading website CMS...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-400" />
            <h2 className="font-heading text-2xl font-bold text-white">Website Content Management</h2>
          </div>
          <p className="text-sm text-white/40 mt-1">
            Manage public website copy, announcement banners, trust metrics, testimonials, and FAQs live without redeploying code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live Site
          </a>
        </div>
      </div>

      {/* Notifications */}
      {saveStatus && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: "banner", label: "Announcement Banner", icon: Megaphone },
          { id: "hero", label: "Hero & Headlines", icon: Type },
          { id: "stats", label: "Trust Metrics", icon: TrendingUp },
          { id: "testimonials", label: "Client Quotes", icon: MessageSquare },
          { id: "faqs", label: "FAQs", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Announcement Banner */}
      {activeTab === "banner" && (
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Top Announcement Bar</h3>
              <p className="text-xs text-white/40 mt-0.5">High-visibility bar pinned across all public pages.</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={banner.enabled}
                onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })}
                className="accent-violet-600 w-4 h-4 rounded"
              />
              Enable Banner
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-white/60 block mb-1.5 font-medium">Badge Text</label>
              <input
                type="text"
                value={banner.badge}
                onChange={(e) => setBanner({ ...banner, badge: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="e.g. New Release"
              />
            </div>
            <div>
              <label className="text-white/60 block mb-1.5 font-medium">CTA Button Label</label>
              <input
                type="text"
                value={banner.ctaText}
                onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="e.g. Learn More"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-white/60 block mb-1.5 font-medium">Banner Message</label>
            <input
              type="text"
              value={banner.text}
              onChange={(e) => setBanner({ ...banner, text: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              placeholder="e.g. Adviza v2.4 introduces Deterministic Portfolio Drift & SEC 204-2 Exam Export"
            />
          </div>

          <div className="text-xs">
            <label className="text-white/60 block mb-1.5 font-medium">Target URL Link</label>
            <input
              type="text"
              value={banner.ctaLink}
              onChange={(e) => setBanner({ ...banner, ctaLink: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              placeholder="/platform"
            />
          </div>

          {/* Live Preview */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Live Preview:</p>
            <div className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-900/40 via-purple-900/40 to-rose-900/40 border border-violet-500/30 text-white text-xs flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-500 text-[10px] font-bold text-white">
                {banner.badge}
              </span>
              <span>{banner.text}</span>
              <span className="font-semibold underline text-violet-300">{banner.ctaText} →</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => handleSaveSection("announcement_banner", banner)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Save & Publish Banner"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Hero & Headlines */}
      {activeTab === "hero" && (
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Homepage Hero & Taglines</h3>
            <p className="text-xs text-white/40 mt-0.5">Primary value proposition seen by institutional buyers.</p>
          </div>

          <div className="text-xs">
            <label className="text-white/60 block mb-1.5 font-medium">Hero Top Badge</label>
            <input
              type="text"
              value={hero.badge}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="text-xs">
            <label className="text-white/60 block mb-1.5 font-medium">Primary Headline</label>
            <textarea
              rows={2}
              value={hero.headline}
              onChange={(e) => setHero({ ...hero, headline: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="text-xs">
            <label className="text-white/60 block mb-1.5 font-medium">Sub-headline Description</label>
            <textarea
              rows={3}
              value={hero.subheadline}
              onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-white/60 block mb-1.5 font-medium">Primary CTA Label</label>
              <input
                type="text"
                value={hero.primaryCtaText}
                onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-white/60 block mb-1.5 font-medium">Secondary CTA Label</label>
              <input
                type="text"
                value={hero.secondaryCtaText}
                onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-white/60 block mb-1.5 font-medium">Trust Proof Metric Caption</label>
            <input
              type="text"
              value={hero.trustMetric}
              onChange={(e) => setHero({ ...hero, trustMetric: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => handleSaveSection("hero", hero)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Save & Publish Hero"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Trust Metrics */}
      {activeTab === "stats" && (
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Institutional Trust Metrics</h3>
            <p className="text-xs text-white/40 mt-0.5">High-impact numbers showcased across homepage and security pages.</p>
          </div>

          <div className="space-y-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/5 p-3.5 rounded-lg border border-white/10">
                <div className="w-36">
                  <label className="text-[10px] text-white/40 uppercase font-semibold block mb-1">Figure</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[idx].value = e.target.value;
                      setStats(updated);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-mono font-bold text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-white/40 uppercase font-semibold block mb-1">Description Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[idx].label = e.target.value;
                      setStats(updated);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStats(stats.filter((_, i) => i !== idx))}
                  className="mt-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStats([...stats, { value: "New", label: "Metric description" }])}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Metric
          </button>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => handleSaveSection("trust_stats", { stats })}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Save & Publish Metrics"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Client Quotes & Testimonials</h3>
            <p className="text-xs text-white/40 mt-0.5">Verified RIA customer endorsements.</p>
          </div>

          <div className="space-y-4">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                    Testimonial #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Quote</label>
                  <textarea
                    rows={2}
                    value={item.quote}
                    onChange={(e) => {
                      const updated = [...testimonials];
                      updated[idx].quote = e.target.value;
                      setTestimonials(updated);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase block mb-1">Author Name & Credential</label>
                    <input
                      type="text"
                      value={item.author}
                      onChange={(e) => {
                        const updated = [...testimonials];
                        updated[idx].author = e.target.value;
                        setTestimonials(updated);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase block mb-1">Job Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...testimonials];
                        updated[idx].title = e.target.value;
                        setTestimonials(updated);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase block mb-1">Firm Name & AUM</label>
                    <input
                      type="text"
                      value={item.firm}
                      onChange={(e) => {
                        const updated = [...testimonials];
                        updated[idx].firm = e.target.value;
                        setTestimonials(updated);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setTestimonials([
                ...testimonials,
                {
                  quote: "Adviza makes our advisory workflows effortless.",
                  author: "Advisory Principal",
                  title: "Partner",
                  firm: "Wealth Advisory RIA",
                  rating: 5,
                },
              ])
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Testimonial
          </button>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => handleSaveSection("testimonials", { items: testimonials })}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Save & Publish Quotes"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: FAQs */}
      {activeTab === "faqs" && (
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-white/40 mt-0.5">Shown across pricing, security, and home pages.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                    FAQ #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Answer</label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].answer = e.target.value;
                      setFaqs(updated);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setFaqs([
                ...faqs,
                { question: "How does billing work?", answer: "Billing is based on active advisor seats billed monthly or annually." },
              ])
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add FAQ
          </button>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => handleSaveSection("faqs", { items: faqs })}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Save & Publish FAQs"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
