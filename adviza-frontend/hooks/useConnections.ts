"use client";

import { useState, useEffect, useCallback } from "react";
import type { ComposioConnection } from "@/lib/composio";

interface ConnectionsState {
  connections: ComposioConnection[];
  loading: boolean;
  connectedAppSlugs: Set<string>;
  isConnected: (appId: string) => boolean;
  refresh: () => void;
}

let cachedConnections: ComposioConnection[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 second client-side cache

export function useConnections(): ConnectionsState {
  const [connections, setConnections] = useState<ComposioConnection[]>(cachedConnections ?? []);
  const [loading, setLoading] = useState(!cachedConnections);

  const fetchConnections = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cachedConnections && now - cacheTimestamp < CACHE_TTL_MS) {
      setConnections(cachedConnections);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/integrations/composio/connections");
      if (res.ok) {
        const data = await res.json();
        const fetched: ComposioConnection[] = data.connections ?? [];
        cachedConnections = fetched;
        cacheTimestamp = Date.now();
        setConnections(fetched);
      }
    } catch {
      // silently fail — connection status is non-critical UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const connectedAppSlugs = new Set(
    connections
      .filter((c) => c.status === "CONNECTED" || c.status === "ACTIVE")
      .map((c) => c.appName.toLowerCase())
  );

  const isConnected = (appId: string): boolean =>
    connectedAppSlugs.has(appId.toLowerCase());

  return {
    connections,
    loading,
    connectedAppSlugs,
    isConnected,
    refresh: () => fetchConnections(true),
  };
}
