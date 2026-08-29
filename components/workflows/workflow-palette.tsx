"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Zap,
  Sparkles,
  ShieldCheck,
  GitBranch,
  Layers,
  Calendar,
  Mic,
  TrendingUp,
  Webhook,
  Brain,
  UserCheck,
  Mail,
  Cpu,
  HelpCircle
} from "lucide-react";
import { NodeTemplateDefinition, NodeCategory } from "@/types/workflow";
import { AVAILABLE_NODE_TEMPLATES } from "./workflow-templates";
import { cn } from "@/lib/utils";

interface WorkflowPaletteProps {
  onAddNode: (template: NodeTemplateDefinition, position?: { x: number; y: number }) => void;
}

const CATEGORY_TABS: { key: "all" | NodeCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "trigger", label: "Triggers", icon: Zap },
  { key: "agent", label: "AI Agents", icon: Sparkles },
  { key: "logic", label: "Logic", icon: GitBranch },
  { key: "action", label: "Actions", icon: ShieldCheck },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Mic,
  TrendingUp,
  Webhook,
  Sparkles,
  Brain,
  ShieldCheck,
  UserCheck,
  GitBranch,
  Layers,
  Mail,
  Cpu
};

export function WorkflowPalette({ onAddNode }: WorkflowPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | NodeCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = AVAILABLE_NODE_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.badge && template.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, template: NodeTemplateDefinition) => {
    e.dataTransfer.setData("application/json", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="w-80 border-r border-[#EADBCE] bg-[#FAF5F0]/90 backdrop-blur-sm flex flex-col h-full shrink-0 select-none z-10">
      {/* Header */}
      <div className="p-4 border-b border-[#EADBCE]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              W
            </div>
            <h2 className="font-semibold text-sm text-[#121217]">Node Library</h2>
          </div>
          <span className="text-[11px] font-medium text-[#8E847C] bg-[#EADBCE]/50 px-2 py-0.5 rounded-full">
            {AVAILABLE_NODE_TEMPLATES.length} Blocks
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E847C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search triggers, agents, actions..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-[#8E847C]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all",
                  active
                    ? "bg-[#121217] text-white shadow-sm"
                    : "text-[#645F5A] hover:bg-[#EADBCE]/60"
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Node Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#8E847C]">
            No building blocks match your search.
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const Icon = ICON_MAP[template.iconName] || Layers;
            return (
              <div
                key={template.typeId}
                draggable
                onDragStart={(e) => handleDragStart(e, template)}
                onClick={() => onAddNode(template)}
                className="group relative p-3 bg-white hover:bg-white/90 border border-[#EADBCE] hover:border-rose-300 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex items-start gap-3"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: template.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#121217] truncate">
                      {template.label}
                    </span>
                    {template.badge && (
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.2 rounded-full shrink-0"
                        style={{
                          backgroundColor: `${template.color}15`,
                          color: template.color,
                        }}
                      >
                        {template.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8E847C] line-clamp-2 mt-0.5 leading-snug">
                    {template.subtitle}
                  </p>
                </div>

                {/* Quick Add Button on hover */}
                <button
                  type="button"
                  title="Add to canvas"
                  className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper */}
      <div className="p-3 border-t border-[#EADBCE] bg-[#F5EDE4]/60 text-[11px] text-[#8E847C] flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>Drag blocks onto canvas or click to add directly.</span>
      </div>
    </aside>
  );
}
