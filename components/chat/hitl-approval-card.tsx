"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, X, Loader2, AlertCircle } from "lucide-react";

interface HITLApprovalCardProps {
  capabilityId: string;
  capabilityName: string;
  reason?: string;
  parameters: Record<string, any>;
  riskLevel?: "low" | "medium" | "high";
  summary: string;
  onDecision?: (decision: "approved" | "rejected", data?: any) => void;
}

export function HITLApprovalCard({
  capabilityId,
  capabilityName,
  reason,
  parameters,
  riskLevel = "medium",
  summary,
  onDecision,
}: HITLApprovalCardProps) {
  const [status, setStatus] = useState<"pending" | "approving" | "rejecting" | "approved" | "rejected">("pending");

  const handleApprove = async () => {
    try {
      setStatus("approving");
      const res = await fetch("/api/ai/chat-orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "approve_hitl",
          hitlActionData: {
            capabilityId,
            parameters,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to execute approved action");
      }

      setStatus("approved");
      onDecision?.("approved", { capabilityId, parameters });
    } catch (err) {
      console.error("Approval execution error:", err);
      setStatus("pending");
    }
  };

  const handleReject = () => {
    setStatus("rejected");
    onDecision?.("rejected", { capabilityId });
  };

  return (
    <div className="my-2 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              Advisor Sign-Off Required (HITL)
              <span className={`text-[10px] px-1.5 py-0.5 font-medium rounded-full ${
                riskLevel === "high" 
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" 
                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}>
                {riskLevel.toUpperCase()} RISK
              </span>
            </h4>
            <p className="text-muted-foreground text-[11px]">
              Fiduciary compliance check: Outbound or trade-adjacent action requires explicit sign-off.
            </p>
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-background/80 rounded-lg border border-border/60 space-y-1.5 text-[11px]">
        <div className="font-medium text-foreground">{capabilityName}</div>
        <div className="text-muted-foreground">{summary}</div>
        {parameters && (
          <pre className="p-2 bg-muted/50 rounded font-mono text-[10px] overflow-x-auto text-foreground/80">
            {JSON.stringify(parameters, null, 2)}
          </pre>
        )}
      </div>

      {status === "pending" && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleReject}
            className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-sm transition"
          >
            <Check className="w-3.5 h-3.5" />
            Approve & Execute
          </button>
        </div>
      )}

      {status === "approving" && (
        <div className="flex items-center justify-end gap-1.5 text-xs text-rose-600 font-medium py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Logging WORM compliance audit & executing...
        </div>
      )}

      {status === "approved" && (
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs py-1">
          <Check className="w-4 h-4" />
          Action Approved and Executed. Logged to Compliance Audit Trail.
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-center gap-1.5 text-rose-500 font-semibold text-xs py-1">
          <X className="w-4 h-4" />
          Action Rejected by Advisor.
        </div>
      )}
    </div>
  );
}
