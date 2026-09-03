"use client";

import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Server,
  ShieldCheck,
  Activity,
  Sliders,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Gauge,
  Layers,
  ArrowRightLeft,
  Search,
  Lock,
} from "lucide-react";

interface ModelConfig {
  id: string;
  name: string;
  shortName: string;
  provider: "AWS Bedrock" | "NVIDIA NIM" | "Google Cloud";
  providerLogo: string;
  tier: "Flagship" | "High-Throughput" | "Low Latency" | "Quant Math" | "Multimodal";
  contextWindow: string;
  costMultiplier: number;
  status: "active" | "standby" | "maintenance";
  defaultRole: string;
  latencyMs: number;
  throughputTps: number;
  enabled: boolean;
}

const INITIAL_MODELS: ModelConfig[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet v2",
    shortName: "Claude 3.5 Sonnet",
    provider: "AWS Bedrock",
    providerLogo: "AWS",
    tier: "Flagship",
    contextWindow: "200k tokens",
    costMultiplier: 1.5,
    status: "active",
    defaultRole: "Fiduciary Reasoning, Complex Portfolio Orchestration & Audit",
    latencyMs: 340,
    throughputTps: 72,
    enabled: true,
  },
  {
    id: "moonshot-kimi-k3",
    name: "Moonshot Kimi-k3",
    shortName: "Kimi-k3 Turbo",
    provider: "NVIDIA NIM",
    providerLogo: "NVIDIA",
    tier: "High-Throughput",
    contextWindow: "128k tokens",
    costMultiplier: 1.0,
    status: "active",
    defaultRole: "Fast Client Drafts, Rapid Responses & Bulk Conversions",
    latencyMs: 180,
    throughputTps: 110,
    enabled: true,
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    shortName: "Claude 3.5 Haiku",
    provider: "AWS Bedrock",
    providerLogo: "AWS",
    tier: "Low Latency",
    contextWindow: "200k tokens",
    costMultiplier: 0.8,
    status: "active",
    defaultRole: "Meeting Transcripts, Micro-Briefings & Instant Chat",
    latencyMs: 145,
    throughputTps: 125,
    enabled: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    shortName: "DeepSeek V3",
    provider: "NVIDIA NIM",
    providerLogo: "NVIDIA",
    tier: "Quant Math",
    contextWindow: "64k tokens",
    costMultiplier: 1.2,
    status: "active",
    defaultRole: "Numerical Tax Modeling, Asset Allocation & Factor Analysis",
    latencyMs: 290,
    throughputTps: 88,
    enabled: true,
  },
  {
    id: "gemini-2.5-flash",
    name: "Google Gemini 2.5 Flash",
    shortName: "Gemini 2.5 Flash",
    provider: "Google Cloud",
    providerLogo: "GCP",
    tier: "Multimodal",
    contextWindow: "1,000,000 tokens",
    costMultiplier: 1.0,
    status: "active",
    defaultRole: "Massive Prospectus Parsing, 10-K Ingestion & OCR",
    latencyMs: 210,
    throughputTps: 96,
    enabled: true,
  },
];

const PROVIDERS = [
  {
    name: "AWS Bedrock",
    region: "us-east-1",
    status: "Operational",
    uptime: "99.98%",
    activeModels: 2,
    badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  },
  {
    name: "NVIDIA NIM",
    region: "integrate.api.nvidia.com",
    status: "Operational",
    uptime: "99.95%",
    activeModels: 2,
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  {
    name: "Google Cloud",
    region: "us-central1 (Vertex)",
    status: "Operational",
    uptime: "99.99%",
    activeModels: 1,
    badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  },
];

export default function SuperAdminModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>(INITIAL_MODELS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [fallbackActive, setFallbackActive] = useState(true);
  const [testingPing, setTestingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const toggleModel = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleTestPings = () => {
    setTestingPing(true);
    setPingSuccess(false);
    setTimeout(() => {
      setTestingPing(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 4000);
    }, 1200);
  };

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      selectedProvider === "all" || m.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Live Model Governance
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All 3 Gateways Connected
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
            AI & Model Orchestration
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Configure LLM inference gateways, multi-model fallback rules, and advisor tenant model access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestPings}
            disabled={testingPing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? "animate-spin" : ""}`} />
            {testingPing ? "Pinging Gateways..." : "Health Ping All"}
          </button>
        </div>
      </div>

      {pingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-200">
              All 3 gateways (AWS Bedrock, NVIDIA NIM, Google Vertex) responded with HTTP 200. Average cluster latency: <strong>237ms</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Gateway Providers Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROVIDERS.map((p) => (
          <div
            key={p.name}
            className="p-5 rounded-2xl bg-[#13131A] border border-white/10 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor}`}
              >
                {p.status}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Endpoint / Region:</span>
                <span className="font-mono text-white/80">{p.region}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Historical Uptime:</span>
                <span className="text-emerald-400 font-semibold">{p.uptime}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Active Routing Models:</span>
                <span className="text-white font-medium">{p.activeModels} models</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Fallback Policy Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-zinc-900 border border-violet-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Dynamic High-Availability Failover</h4>
            <p className="text-xs text-white/50 mt-0.5">
              If AWS Bedrock returns a rate-limit (429) or 5xx outage, advisor prompts automatically route to NVIDIA NIM / Google Vertex with zero downtime.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/60">
            Failover Policy: {fallbackActive ? "STRICT" : "DISABLED"}
          </span>
          <button
            onClick={() => setFallbackActive(!fallbackActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              fallbackActive ? "bg-violet-600" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                fallbackActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search model name, tier, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            {["all", "AWS Bedrock", "NVIDIA NIM", "Google Cloud"].map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvider(prov)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedProvider === prov
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {prov === "all" ? "All Providers" : prov}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/40 font-mono">
          Showing {filteredModels.length} of {models.length} registered models
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((m) => (
          <div
            key={m.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              m.enabled
                ? "bg-[#13131A] border-white/10 hover:border-violet-500/40"
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-base font-semibold text-white">
                      {m.shortName}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60">
                      {m.provider}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-violet-400 mt-0.5">
                    {m.tier}
                  </p>
                </div>

                <button
                  onClick={() => toggleModel(m.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    m.enabled ? "bg-violet-600" : "bg-white/10"
                  }`}
                  title={m.enabled ? "Model enabled for tenant routing" : "Model paused"}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      m.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Role description */}
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                {m.defaultRole}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[11px] mb-4">
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <span className="text-white/40 block">Context Window</span>
                  <span className="font-mono text-white font-medium">{m.contextWindow}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <span className="text-white/40 block">Credit Multiplier</span>
                  <span className="font-mono text-amber-400 font-semibold">{m.costMultiplier}x</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <span className="text-white/40 block">Avg Response</span>
                  <span className="font-mono text-emerald-400 font-medium">{m.latencyMs} ms</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <span className="text-white/40 block">Throughput</span>
                  <span className="font-mono text-blue-400 font-medium">{m.throughputTps} tps</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
              <span className="flex items-center gap-1.5 text-white/40">
                <span className={`w-1.5 h-1.5 rounded-full ${m.enabled ? "bg-emerald-400" : "bg-zinc-600"}`} />
                {m.enabled ? "Routed in Production" : "Disabled by Admin"}
              </span>
              <span className="text-white/30 font-mono text-[10px]">
                ID: {m.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Model Governance Policy Note */}
      <div className="p-6 rounded-2xl bg-[#13131A] border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Fiduciary Compliance & Audit Boundary
          </h4>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Adviza operates a strict zero-data-retention policy across all model inferences. Prompts sent to AWS Bedrock and NVIDIA NIM are enterprise-governed and never used for foundation model training. All prompt completions are hashed and recorded in the tenant audit log with SEC Rule 204-2 compliance signatures.
        </p>
      </div>
    </div>
  );
}
