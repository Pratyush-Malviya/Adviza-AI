"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncCalendarButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/integrations/composio/sync-calendar", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setResult(`Imported ${data.meetingsImported || 0} meetings`);
        router.refresh();
        setTimeout(() => setResult(null), 4000);
      } else {
        alert(data.error || "Calendar sync failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error syncing calendar";
      alert("Error syncing calendar: " + message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-fade-in">
          {result}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF5F0] disabled:opacity-50 text-[#121217] text-sm font-bold rounded-full transition-colors border border-[#EADBCE] shadow-sm cursor-pointer"
        title="Sync scheduled meetings from Google Calendar"
      >
        {syncing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 text-rose-500" />
            <span>Sync Calendar</span>
          </>
        )}
      </button>
    </div>
  );
}
