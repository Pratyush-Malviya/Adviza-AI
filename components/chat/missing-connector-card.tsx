"use client";

import React, { useState } from "react";
import { Link2, ExternalLink, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

interface MissingConnectorCardProps {
  connectorId: string;
  connectorName: string;
  description?: string;
  reason?: string;
  capabilityId: string;
  onConnectedAndResume?: () => void;
}

export function MissingConnectorCard({
  connectorId,
  connectorName,
  description,
  reason,
  capabilityId,
  onConnectedAndResume,
}: MissingConnectorCardProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const res = await fetch("/api/integrations/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: connectorId, source: "chat" }),
      });

      const data = await res.json();

      if (data.redirectUrl) {
        // Directly navigate to connector without popup blockers
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || "Failed to initiate connector");
      }
    } catch (err: any) {
      console.error("Connect error:", err);
      setError(err.message || "Failed to initiate connector");
      setConnecting(false);
    }
  };

  return (
    <div className="my-2 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded-lg">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              Connect {connectorName}
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium rounded-full">
                Required
              </span>
            </h4>
            <p className="text-muted-foreground text-[11px]">
              {description || `Authorization needed to access ${connectorName} data.`}
            </p>
          </div>
        </div>
      </div>

      {reason && (
        <div className="p-2 bg-background/60 rounded-lg text-muted-foreground text-[11px] border border-border/50">
          <span className="font-medium text-foreground">Why it&apos;s needed: </span>
          {reason}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-500 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-muted-foreground">
          Directly opens connector authorization.
        </span>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
        >
          {connecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Opening Connector...
            </>
          ) : (
            <>
              Connect {connectorName}
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
