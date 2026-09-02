"use client";

import React, { useState } from "react";
import { Link2, ExternalLink, CheckCircle2, Loader2, AlertTriangle, ArrowRight } from "lucide-react";

interface MissingConnectorCardProps {
  connectorId: string;
  connectorName: string;
  category?: string;
  description?: string;
  reason?: string;
  capabilityId: string;
  authUrl?: string;
  pendingPrompt?: string;
  onConnectedAndResume?: () => void;
}

export function MissingConnectorCard({
  connectorId,
  connectorName,
  category,
  description,
  reason,
  capabilityId,
  authUrl,
  pendingPrompt,
  onConnectedAndResume,
}: MissingConnectorCardProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      if (pendingPrompt) {
        try {
          sessionStorage.setItem("adviza_pending_chat_prompt", pendingPrompt);
        } catch {}
      }

      if (authUrl) {
        window.location.href = authUrl;
        return;
      }

      const res = await fetch("/api/integrations/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: connectorId, source: "chat" }),
      });

      const data = await res.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || "Failed to initiate connector authorization");
      }
    } catch (err: any) {
      console.error("Connect error:", err);
      setError(err.message || "Failed to initiate connector");
      setConnecting(false);
    }
  };

  return (
    <div className="my-2 p-4 bg-white border border-[#EADBCE] rounded-2xl text-xs space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#121217] text-sm flex items-center gap-1.5">
              Connect {connectorName}
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-700 font-semibold rounded-full border border-amber-500/20">
                {category ? `${category.toUpperCase()}` : "REQUIRED"}
              </span>
            </h4>
            <p className="text-[#8E847C] text-[11px] mt-0.5">
              {description || `1-click authorization to enable ${connectorName} actions.`}
            </p>
          </div>
        </div>
      </div>

      {reason && (
        <div className="p-2.5 bg-[#FAF5F0] rounded-xl text-[#5A544E] text-[11px] border border-[#EADBCE]/60">
          <span className="font-semibold text-[#121217]">Action Purpose: </span>
          {reason}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-600 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-[#EADBCE]/50">
        <span className="text-[11px] text-[#8E847C]">
          Auto-dispatches your task once connected.
        </span>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#121217] hover:bg-[#2A2A35] text-white rounded-xl font-bold shadow-sm transition disabled:opacity-50 group"
        >
          {connecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>Connect {connectorName}</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
