"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  User,
  ShieldCheck,
  Tag,
  RefreshCw,
  Sliders,
} from "lucide-react";

export interface MemoryItem {
  id: string;
  memory: string;
  category: "preference" | "persona" | "fact" | "client_context" | "workflow_habit" | "general";
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  preference: { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-500/20" },
  persona: { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/20" },
  client_context: { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/20" },
  workflow_habit: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/20" },
  fact: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/20" },
  general: { bg: "bg-slate-500/10", text: "text-slate-700", border: "border-slate-500/20" },
};

export function MemoryManager() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryItem["category"]>("preference");
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const fetchMemories = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const url = query ? `/api/ai/memory?q=${encodeURIComponent(query)}` : "/api/ai/memory";
      const res = await fetch(url);
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories);
      }
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMemories(searchQuery);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    try {
      setActionStatus("Saving memory...");
      const res = await fetch("/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory: newMemoryText.trim(),
          category: newCategory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          setMemories((prev) => [data.memory, ...prev]);
        }
        setNewMemoryText("");
        setIsAdding(false);
        setActionStatus("Memory permanently saved!");
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      console.error("Failed to add memory:", err);
      setActionStatus("Error saving memory");
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      setMemories((prev) => prev.filter((m) => m.id !== id));
      await fetch("/api/ai/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId: id }),
      });
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (searchQuery && !m.memory.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 bg-gradient-to-r from-[#121217] via-[#1E1E26] to-[#121217] rounded-2xl border border-zinc-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Mem0 Long-Term Memory & Adaptive Persona
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded-full border border-emerald-500/30">
                Active Engine
              </span>
            </h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Adviza AI automatically extracts enduring preferences, client background, portfolio habits, and communication styles from conversations, dynamically personalizing responses without repeating questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory / Rule</span>
          </button>
          <button
            onClick={() => fetchMemories()}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition"
            title="Refresh memories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {actionStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Manual Memory Form */}
      {isAdding && (
        <form
          onSubmit={handleAddMemory}
          className="p-5 bg-white border border-zinc-200/80 rounded-3xl space-y-4 shadow-sm"
        >
          <h4 className="font-bold text-sm text-[#121217]">Add Permanent Memory or Fiduciary Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <input
                type="text"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="e.g. Always structure municipal bond proposals around 5-year ladder durations"
                className="w-full px-4 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                required
              />
            </div>
            <div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-400"
              >
                <option value="preference">Preference</option>
                <option value="persona">Persona</option>
                <option value="client_context">Client Context</option>
                <option value="workflow_habit">Workflow Habit</option>
                <option value="fact">Fact</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
            >
              Save to Memory
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {["all", "preference", "persona", "client_context", "workflow_habit", "fact"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Semantic Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#8E847C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recalled memories..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200/80 rounded-2xl text-xs text-[#121217] placeholder:text-[#8E847C] focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-2xs"
          />
        </form>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#8E847C] space-y-2">
            <Clock className="w-5 h-5 animate-spin mx-auto text-rose-500" />
            <span>Loading Mem0 memory recall graph...</span>
          </div>
        ) : filteredMemories.length > 0 ? (
          filteredMemories.map((item) => {
            const style = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;

            return (
              <div
                key={item.id}
                className="p-4 bg-white border border-zinc-200/80 rounded-3xl shadow-2xs hover:shadow-sm transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {item.category.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => handleDeleteMemory(item.id)}
                      className="p-1 text-[#8E847C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#121217] font-medium leading-relaxed">
                    {item.memory}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-200/80/50 flex items-center justify-between text-[10px] text-[#8E847C]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Active"}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Grounded in Context
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 bg-white border border-zinc-200/80 rounded-3xl text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <Brain className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#121217]">No Memories Found</h4>
            <p className="text-xs text-[#8E847C] max-w-sm mx-auto">
              Adviza AI will automatically extract and remember preferences as you interact with it in chat, or you can add permanent rules manually above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
