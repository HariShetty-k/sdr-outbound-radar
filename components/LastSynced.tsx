"use client";

import { useEffect, useState } from "react";
import { getLastSync, SyncLog } from "@/lib/supabase";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function LastSynced() {
  const [sync, setSync] = useState<SyncLog | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLastSync()
      .then(setSync)
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  return (
    <div
      className="flex items-center gap-1.5 text-[11.5px]"
      style={{ color: "var(--ink-soft)" }}
      title={sync ? new Date(sync.synced_at).toLocaleString() : undefined}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 flex-none">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      {sync ? (
        <>
          Brand data last synced {relativeTime(sync.synced_at)}
          {sync.brands_found > 0 && ` · ${sync.brands_found} new`}
        </>
      ) : (
        "Brand data not synced yet"
      )}
    </div>
  );
}
