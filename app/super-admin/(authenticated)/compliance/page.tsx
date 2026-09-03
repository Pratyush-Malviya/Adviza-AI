import { Hammer } from "lucide-react";

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <Hammer className="w-8 h-8 text-violet-400" />
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">Compliance & Audit</h2>
      <p className="text-white/50 max-w-md">
        Review audit logs, data retention policies, and compliance boundaries.<br />
        <span className="inline-block mt-4 text-xs font-mono px-2 py-1 bg-white/5 rounded text-white/40">
          Module under construction (Phase 2)
        </span>
      </p>
    </div>
  );
}
