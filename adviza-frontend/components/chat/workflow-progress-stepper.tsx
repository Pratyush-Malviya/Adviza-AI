"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  Circle,
  Sparkles,
  Shield,
  Cpu,
  Zap,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const activeStep = STEPS[currentStepIndex] || STEPS[0];

  return (
    <div className="my-2.5 bg-white border border-[#EADBCE] rounded-2xl text-xs shadow-2xs overflow-hidden transition-all duration-300 animate-in fade-in">
      {/* Clickable Dropdown Tab Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#FAF5F0]/60 transition-colors select-none group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#121217] text-xs truncate">
                Adviza Agent Orchestration
              </h4>
              <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-600 font-semibold rounded-full shrink-0">
                Live Workflow
              </span>
            </div>
            <p className="text-[11px] text-[#8E847C] truncate mt-0.5">
              {statusMessage || `${activeStep.title}...`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] font-bold text-rose-600 font-mono bg-rose-500/10 px-2 py-0.5 rounded-md">
            Step {Math.min(currentStepIndex + 1, STEPS.length)} of {STEPS.length}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8E847C] group-hover:text-[#121217] transition">
            <span className="hidden sm:inline text-[10px]">
              {isExpanded ? "Hide Details" : "View Details"}
            </span>
            <div
              className={`w-5 h-5 rounded-lg bg-[#FAF5F0] border border-[#EADBCE] flex items-center justify-center transition-transform duration-200 ${
                isExpanded ? "rotate-180 bg-[#EADBCE]/50" : ""
              }`}
            >
              <ChevronDown className="w-3 h-3 text-[#5A544E]" />
            </div>
          </div>
        </div>
      </button>

      {/* Collapsible Dropdown Details */}
      {isExpanded && (
        <div className="p-3.5 pt-1 border-t border-[#EADBCE]/60 bg-[#FAF5F0]/30 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E847C] px-1 py-0.5">
            Orchestration Execution Pipeline
          </div>
          <div className="space-y-1.5">
            {STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-200 ${
                    isCurrent
                      ? "bg-white border border-[#EADBCE] shadow-2xs"
                      : isDone
                      ? "bg-white/60 opacity-85"
                      : "opacity-40"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#8E847C]" />
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
                    <p className="text-[10px] text-[#8E847C] truncate mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
