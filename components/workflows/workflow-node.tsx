"use client";

import React from "react";
import {
  Calendar,
  Mic,
  TrendingUp,
  Webhook,
  Sparkles,
  Brain,
  ShieldCheck,
  UserCheck,
  GitFork,
  Layers,
  Mail,
  Cpu,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  CircleDot
} from "lucide-react";
import { WorkflowNode, NodePort, ExecutionStatus } from "@/types/workflow";
import { cn } from "@/lib/utils";

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onPortMouseDown: (nodeId: string, portId: string, portType: "in" | "out", e: React.MouseEvent) => void;
  onPortMouseUp: (nodeId: string, portId: string, portType: "in" | "out", e: React.MouseEvent) => void;
  scale: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Mic,
  TrendingUp,
  Webhook,
  Sparkles,
  Brain,
  ShieldCheck,
  UserCheck,
  GitFork,
  Layers,
  Mail,
  Cpu
};

export function WorkflowNodeComponent({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onPortMouseDown,
  onPortMouseUp,
}: WorkflowNodeComponentProps) {
  const Icon = ICON_MAP[node.data.iconName] || CircleDot;
  const status: ExecutionStatus = node.data.status || "idle";

  const getStatusBorder = () => {
    if (status === "running") return "ring-2 ring-violet-500 shadow-lg shadow-violet-200";
    if (status === "success") return "ring-2 ring-emerald-500 shadow-lg shadow-emerald-100";
    if (status === "error") return "ring-2 ring-rose-500 shadow-lg shadow-rose-100";
    if (isSelected) return "ring-2 ring-rose-500 shadow-lg shadow-rose-100/50";
    return "hover:border-[#D8CCC2]";
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={cn(
        "relative rounded-2xl bg-white/95 backdrop-blur-md border border-[#EADBCE] shadow-sm transition-all duration-150 select-none cursor-grab active:cursor-grabbing w-[280px]",
        getStatusBorder()
      )}
      style={{
        cursor: "grab",
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
      }}
    >
      {/* Node Header */}
      <div className="p-3.5 pb-2.5 flex items-start justify-between border-b border-[#F0E7DE]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: node.data.color }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#121217] truncate leading-tight">
                {node.data.label}
              </span>
            </div>
            {node.data.subtitle && (
              <p className="text-[11px] text-[#8E847C] truncate mt-0.5">
                {node.data.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action icons on hover / selected */}
        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 shrink-0">
          {node.data.badge && (
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${node.data.color}15`,
                color: node.data.color
              }}
            >
              {node.data.badge}
            </span>
          )}
        </div>
      </div>

      {/* Node Body / Config summary */}
      <div className="p-3 bg-[#FAF5F0]/40 text-[11px] text-[#645F5A] space-y-1.5">
        {Object.entries(node.data.config || {}).slice(0, 2).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <span className="text-[#8E847C] capitalize truncate">{k.replace(/([A-Z])/g, " $1")}:</span>
            <span className="font-medium text-[#121217] truncate max-w-[120px]">
              {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
            </span>
          </div>
        ))}

        {/* Live Execution Status Bar */}
        {status !== "idle" && (
          <div className="mt-2 pt-2 border-t border-[#EADBCE] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E847C]">Status:</span>
            <div className="flex items-center gap-1.5">
              {status === "running" && (
                <>
                  <Loader2 className="w-3 h-3 text-violet-600 animate-spin" />
                  <span className="text-[11px] text-violet-600 font-medium">Running...</span>
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-medium">Completed ({node.data.executionDurationMs || 340}ms)</span>
                </>
              )}
              {status === "error" && (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span className="text-[11px] text-rose-600 font-medium">Failed</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Node Quick Action Bar (when selected) */}
      {isSelected && (
        <div className="px-3 py-1.5 bg-[#F5EDE4] border-t border-[#EADBCE] rounded-b-2xl flex items-center justify-between">
          <span className="text-[10px] text-[#8E847C] font-mono">ID: {node.id}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(node.id);
              }}
              title="Duplicate Node"
              className="p-1 text-[#8E847C] hover:text-[#121217] hover:bg-white rounded transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              title="Delete Node"
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Left Input Ports */}
      {node.inputs.map((port: NodePort, idx: number) => {
        const topPercent = ((idx + 1) / (node.inputs.length + 1)) * 100;
        return (
          <div
            key={port.id}
            className="absolute left-0 -translate-x-1/2 group/port flex items-center"
            style={{ top: `${topPercent}%` }}
          >
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortMouseDown(node.id, port.id, "in", e);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                onPortMouseUp(node.id, port.id, "in", e);
              }}
              title={`Input: ${port.name}`}
              className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#8E847C] group-hover/port:border-rose-500 group-hover/port:scale-125 cursor-crosshair transition-transform shadow-sm"
            />
            <div className="hidden group-hover/port:block absolute left-5 whitespace-nowrap bg-[#121217] text-white text-[10px] px-2 py-0.5 rounded shadow-lg z-50 pointer-events-none">
              In: {port.name}
            </div>
          </div>
        );
      })}

      {/* Right Output Ports */}
      {node.outputs.map((port: NodePort, idx: number) => {
        const topPercent = ((idx + 1) / (node.outputs.length + 1)) * 100;
        return (
          <div
            key={port.id}
            className="absolute right-0 translate-x-1/2 group/port flex items-center"
            style={{ top: `${topPercent}%` }}
          >
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortMouseDown(node.id, port.id, "out", e);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                onPortMouseUp(node.id, port.id, "out", e);
              }}
              title={`Output: ${port.name}`}
              className="w-3.5 h-3.5 rounded-full bg-white border-2 border-rose-500 group-hover/port:bg-rose-500 group-hover/port:scale-125 cursor-crosshair transition-transform shadow-sm"
            />
            <div className="hidden group-hover/port:block absolute right-5 whitespace-nowrap bg-[#121217] text-white text-[10px] px-2 py-0.5 rounded shadow-lg z-50 pointer-events-none">
              Out: {port.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
