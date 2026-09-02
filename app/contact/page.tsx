"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, ArrowLeft, Send, CheckCircle2, Sparkles, Building, Phone } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    firmName: "",
    aum: "$50M - $250M",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] text-[#121217] selection:bg-rose-200">
      {/* Top Header */}
      <header className="border-b border-[#EADBCE] bg-[#FAF5F0]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#121217] flex items-center justify-center text-white shadow-xs">
              <div className="w-3 h-3 rounded-full border-2 border-white" />
            </div>
            <span className="font-heading font-extrabold text-base tracking-tight text-[#121217]">
              Adviza AI
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5A544E] hover:text-[#121217] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-[11px] font-bold text-rose-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advisory Partnerships & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#121217] tracking-tight">
            Contact Adviza AI
          </h1>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            Have questions about custom integrations, RIA compliance architecture, or enterprise pricing? We’re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-white p-5 rounded-3xl border border-[#EADBCE] shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#121217]">Direct Inquiries</h3>

              <div className="space-y-3 text-xs text-[#5A544E]">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#121217]">Email Support</div>
                    <a href="mailto:support@adviza.ai" className="hover:underline text-[#7A726A]">
                      support@adviza.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#121217]">Institutional Sales</div>
                    <a href="mailto:enterprise@adviza.ai" className="hover:underline text-[#7A726A]">
                      enterprise@adviza.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#121217]">Advisor Hotline</div>
                    <span className="text-[#7A726A]">+1 (800) 412-ADVIZA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF5F0] p-4 rounded-3xl border border-[#EADBCE] text-[11px] text-[#7A726A] space-y-1">
              <p className="font-semibold text-[#121217]">SOC2 Type II & FINRA Books and Records</p>
              <p>Dedicated private VPC deployments available for RIAs managing &gt;$500M AUM.</p>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBCE] shadow-sm md:col-span-2">
            {submitted ? (
              <div className="py-12 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[#121217]">Message Received</h3>
                <p className="text-xs text-[#7A726A] max-w-sm mx-auto">
                  Thank you for reaching out. A senior RIA solutions engineer will respond to {formData.email} within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#121217]">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Jenkins, CFP"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#121217] placeholder:text-[#8E847C] focus:bg-white focus:border-rose-400 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#121217]">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="sjenkins@apexcapital.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#121217] placeholder:text-[#8E847C] focus:bg-white focus:border-rose-400 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#121217]">Firm Name</label>
                    <input
                      type="text"
                      placeholder="Apex Capital Advisory"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#121217] placeholder:text-[#8E847C] focus:bg-white focus:border-rose-400 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#121217]">Firm AUM</label>
                    <select
                      value={formData.aum}
                      onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#121217] focus:bg-white focus:border-rose-400 outline-none transition"
                    >
                      <option>&lt; $50M</option>
                      <option>$50M - $250M</option>
                      <option>$250M - $1B</option>
                      <option>&gt; $1B</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#121217]">Message or Inquiry</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your advisory tech stack and what you're looking to automate..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] text-xs text-[#121217] placeholder:text-[#8E847C] focus:bg-white focus:border-rose-400 outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
