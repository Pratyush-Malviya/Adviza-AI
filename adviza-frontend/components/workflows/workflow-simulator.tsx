"use client";

import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  X,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { WorkflowNode, WorkflowExecutionLog } from "@/types/workflow";
import { cn } from "@/lib/utils";

interface WorkflowSimulatorProps {
  nodes: WorkflowNode[];
  isExecuting: boolean;
  logs: WorkflowExecutionLog[];
  onStartSimulation: () => void;
  onResetSimulation: () => void;
  onClose: () => void;
}

export function WorkflowSimulator({
  nodes,
  isExecuting,
  logs,
  onStartSimulation,
  onResetSimulation,
  onClose,
}: WorkflowSimulatorProps) {
  const [expandedLogIdx, setExpandedLogIdx] = useState<number | null>(null);

  const completedCount = nodes.filter((n) => n.data.status === "success").length;
  const runningCount = nodes.filter((n) => n.data.status === "running").length;
  const errorCount = nodes.filter((n) => n.data.status === "error").length;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-white/95 backdrop-blur-xl border border-[#EADBCE] rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden transition-all duration-300">
      {/* Top Bar */}
      <div className="px-4 py-3 border-b border-[#EADBCE] bg-[#FAF5F0]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-[#121217]">
                Workflow Test & Execution Simulator
              </h3>
              {isExecuting && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200 animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  Live Executing
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8E847C]">
              {completedCount}/{nodes.length} Nodes Finished • {errorCount} Issues
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isExecuting ? (
            <button
              onClick={onStartSimulation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Simulation
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-100 text-violet-600 text-xs font-medium rounded-xl cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Simulating Pipeline...
            </button>
          )}

          <button
            onClick={onResetSimulation}
            title="Reset execution states"
            className="p-1.5 text-[#8E847C] hover:text-[#121217] hover:bg-[#EADBCE]/50 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8E847C] hover:text-[#121217] hover:bg-[#EADBCE]/50 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Execution Timeline / Log Area */}
      <div className="p-4 bg-[#121217] text-white max-h-56 overflow-y-auto font-mono text-xs space-y-2">
        {logs.length === 0 ? (
          <div className="py-6 text-center text-zinc-500 flex flex-col items-center gap-1.5">
            <Clock className="w-5 h-5 text-zinc-600" />
            <span>Click &quot;Run Simulation&quot; to test your wealth management agent pipeline.</span>
          </div>
        ) : (
          logs.map((log, idx) => {
            const isExpanded = expandedLogIdx === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded-lg border transition-all cursor-pointer",
                  log.level === "success"
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                    : log.level === "info"
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                    : log.level === "warn"
                    ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
                    : "bg-rose-950/40 border-rose-800/60 text-rose-300"
                )}
                onClick={() => setExpandedLogIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">[{log.timestamp}]</span>
                    <span className="font-semibold text-white px-1.5 py-0.2 bg-zinc-800 rounded text-[10px]">
                      {log.nodeLabel}
                    </span>
                    <span>{log.message}</span>
                  </div>
                  {log.payload && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  )}
                </div>

                {/* Expanded Payload Output */}
                {isExpanded && log.payload && (
                  <pre className="mt-2 p-2 bg-black/60 rounded text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                    {typeof log.payload === "string"
                      ? log.payload
                      : JSON.stringify(log.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
