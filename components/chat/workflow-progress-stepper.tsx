"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Circle, Sparkles, Shield, Cpu, Zap, Search } from "lucide-react";

interface WorkflowProgressStepperProps {
  statusMessage?: string | null;
}

const STEPS = [
  {
    id: 1,
    title: "Analyzing Intent & Context",
    description: "Parsing parameters, recipient, and structured payload...",
    icon: Search,
  },
  {
    id: 2,
    title: "Validating Connectors & Gateways",
    description: "Verifying OAuth authorizations and tool availability...",
    icon: Zap,
  },
  {
    id: 3,
    title: "Executing Live Advisory Capability",
    description: "Dispatching API calls via Composio v3 & Agent Fleet...",
    icon: Cpu,
  },
  {
    id: 4,
    title: "Running Fiduciary Compliance & Audit",
    description: "Recording immutable WORM audit trail...",
    icon: Shield,
  },
  {
    id: 5,
    title: "Synthesizing Output Preview",
    description: "Formatting executive summary and data cards...",
    icon: Sparkles,
  },
];

export function WorkflowProgressStepper({ statusMessage }: WorkflowProgressStepperProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Progressively advance through steps to provide lively feedback
    const timers = [
      setTimeout(() => setCurrentStepIndex(1), 700),
      setTimeout(() => setCurrentStepIndex(2), 1600),
      setTimeout(() => setCurrentStepIndex(3), 2600),
      setTimeout(() => setCurrentStepIndex(4), 3600),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="my-3 p-4 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-3.5 shadow-2xs animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-[#121217] text-xs flex items-center gap-1.5">
              Adviza Agent Orchestration
              <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 font-semibold rounded-full">
                Live Workflow
              </span>
            </h4>
            <p className="text-[10px] text-[#8E847C]">
              {statusMessage || "Autonomous multi-agent execution pipeline in progress..."}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-rose-600 font-mono">
          Step {Math.min(currentStepIndex + 1, STEPS.length)} of {STEPS.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-2 pt-1 border-t border-[#EADBCE]/50">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? "bg-[#FAF5F0] border border-[#EADBCE]"
                  : isDone
                  ? "opacity-80"
                  : "opacity-40"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-[#8E847C]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-[11px] ${
                      isCurrent
                        ? "text-[#121217] font-bold"
                        : isDone
                        ? "text-emerald-800"
                        : "text-[#8E847C]"
                    }`}
                  >
                    {step.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-rose-600 animate-pulse">
                      In Progress...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[9px] font-bold text-emerald-600">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#8E847C] truncate">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
