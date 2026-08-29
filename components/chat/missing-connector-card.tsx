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
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const res = await fetch("/api/integrations/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: connectorId }),
      });

      if (!res.ok) {
        throw new Error("Failed to initiate connection");
      }

      const data = await res.json();

      if (data.redirectUrl) {
        // Open OAuth in a popup or new tab
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const authWindow = window.open(
          data.redirectUrl,
          `Connect ${connectorName}`,
          `width=${width},height=${height},top=${top},left=${left}`
        );

        // Poll for window close / mock completion
        const timer = setInterval(() => {
          if (authWindow?.closed || !authWindow) {
            clearInterval(timer);
            setConnecting(false);
            setConnected(true);
            // Auto-resume original intent after 1 second
            setTimeout(() => {
              onConnectedAndResume?.();
            }, 1000);
          }
        }, 1000);
      } else {
        setConnecting(false);
        setConnected(true);
        onConnectedAndResume?.();
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
          Auto-resumes your request immediately after connecting.
        </span>

        {connected ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Connected! Resuming...
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
          >
            {connecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect {connectorName}
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
