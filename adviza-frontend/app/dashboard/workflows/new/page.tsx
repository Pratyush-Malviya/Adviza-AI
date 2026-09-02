"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * /dashboard/workflows/new
 * Creates a blank workflow in the DB and redirects to its editor.
 * Falls back to client-side localStorage editor if DB is unavailable.
 */
export default function NewWorkflowPage() {
  const router = useRouter();

  useEffect(() => {
    async function create() {
      try {
        const res = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Untitled Workflow" }),
        });
        if (res.ok) {
          const data = await res.json();
          router.replace(`/dashboard/workflows/${data.workflow.id}`);
        } else {
          // DB not available — render local editor stub via query param
          router.replace("/dashboard/workflows/local?new=1");
        }
      } catch {
        router.replace("/dashboard/workflows/local?new=1");
      }
    }
    create();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      <p className="text-sm text-[#8E847C]">Creating new workflow…</p>
    </div>
  );
}
