"use client";

import React, { useState, useEffect } from "react";
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
  Plus,
  X,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";

export interface ModelConfig {
  id: string;
  name: string;
  shortName: string;
  provider: "AWS Bedrock" | "NVIDIA NIM" | "Google Cloud" | "OpenAI" | "Anthropic" | "Groq";
  providerLogo: string;
  tier: "Flagship" | "High-Throughput" | "Low Latency" | "Quant Math" | "Multimodal";
  contextWindow: string;
  costMultiplier: number;
  status: "active" | "standby" | "maintenance";
  defaultRole: string;
  latencyMs: number;
  throughputTps: number;
  enabled: boolean;
  isCustom?: boolean;
}

const DEFAULT_MODELS: ModelConfig[] = [
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
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [fallbackActive, setFallbackActive] = useState(true);
  const [testingPing, setTestingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState("");
  const [formProvider, setFormProvider] = useState<ModelConfig["provider"]>("AWS Bedrock");
  const [formTier, setFormTier] = useState<ModelConfig["tier"]>("Flagship");
  const [formContext, setFormContext] = useState("128k tokens");
  const [formMultiplier, setFormMultiplier] = useState(1.0);
  const [formRole, setFormRole] = useState("");
  const [formLatency, setFormLatency] = useState(250);
  const [formThroughput, setFormThroughput] = useState(80);
  const [formError, setFormError] = useState("");

  // Load custom models from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adviza_registered_models");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setModels(parsed);
        }
      }
    } catch {}
  }, []);

  // Save models to localStorage
  const persistModels = (updated: ModelConfig[]) => {
    setModels(updated);
    try {
      localStorage.setItem("adviza_registered_models", JSON.stringify(updated));
    } catch {}
  };

  const toggleModel = (id: string) => {
    const updated = models.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    persistModels(updated);
  };

  const deleteModel = (id: string) => {
    const updated = models.filter((m) => m.id !== id);
    persistModels(updated);
    setNotification("Model removed from registry.");
    setTimeout(() => setNotification(null), 3000);
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

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim() || !formId.trim() || !formRole.trim()) {
      setFormError("Please fill in Model Name, Model ID, and Primary Role.");
      return;
    }

    const cleanId = formId.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");

    if (models.some((m) => m.id === cleanId)) {
      setFormError(`A model with ID "${cleanId}" already exists.`);
      return;
    }

    const newModel: ModelConfig = {
      id: cleanId,
      name: formName.trim(),
      shortName: formName.trim().split(" ")[0] + " " + (formName.trim().split(" ")[1] || ""),
      provider: formProvider,
      providerLogo: formProvider === "AWS Bedrock" ? "AWS" : formProvider === "NVIDIA NIM" ? "NVIDIA" : "GCP",
      tier: formTier,
      contextWindow: formContext.trim() || "128k tokens",
      costMultiplier: Number(formMultiplier) || 1.0,
      status: "active",
      defaultRole: formRole.trim(),
      latencyMs: Number(formLatency) || 200,
      throughputTps: Number(formThroughput) || 80,
      enabled: true,
      isCustom: true,
    };

    const updated = [newModel, ...models];
    persistModels(updated);

    // Reset Form
    setFormName("");
    setFormId("");
    setFormRole("");
    setIsModalOpen(false);
    setNotification(`Successfully added ${newModel.name} to the active model registry!`);
    setTimeout(() => setNotification(null), 4000);
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
              All Gateways Operational
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
            {testingPing ? "Pinging..." : "Health Ping"}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Model
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center gap-2.5 animate-fade-in text-xs text-violet-200">
          <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {pingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-200">
              All gateways responded with HTTP 200. Average cluster latency: <strong>237ms</strong>.
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
                <span>Active Routing:</span>
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
              If primary model gateway returns rate-limits (429) or timeouts, queries automatically route to standby fallback models with zero client downtime.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/60">
            Failover Policy: {fallbackActive ? "ENABLED" : "PAUSED"}
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

          <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto max-w-full">
            {["all", "AWS Bedrock", "NVIDIA NIM", "Google Cloud", "OpenAI", "Anthropic", "Groq"].map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvider(prov)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedProvider === prov
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {prov === "all" ? "All" : prov}
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
                    {m.isCustom && (
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-violet-400 mt-0.5">
                    {m.tier}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {m.isCustom && (
                    <button
                      onClick={() => deleteModel(m.id)}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      title="Delete custom model"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                {m.enabled ? "Active in Routing" : "Disabled by Admin"}
              </span>
              <span className="text-white/30 font-mono text-[10px]">
                ID: {m.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MODEL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#13131A] border border-white/10 shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Add New LLM Model
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Register a model into Adviza's active routing catalog.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddModel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Model Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI GPT-4o"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Model ID / API Key Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gpt-4o"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Provider
                  </label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="AWS Bedrock">AWS Bedrock</option>
                    <option value="NVIDIA NIM">NVIDIA NIM</option>
                    <option value="Google Cloud">Google Cloud (Vertex)</option>
                    <option value="OpenAI">OpenAI</option>
                    <option value="Anthropic">Anthropic Direct</option>
                    <option value="Groq">Groq (LPU Inference)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Capability Tier
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Flagship">Flagship (Fiduciary Depth)</option>
                    <option value="High-Throughput">High-Throughput (Fast)</option>
                    <option value="Low Latency">Low Latency (Streaming)</option>
                    <option value="Quant Math">Quant Math (Financial)</option>
                    <option value="Multimodal">Multimodal (Doc Ingestion)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Context Window
                  </label>
                  <input
                    type="text"
                    placeholder="128k tokens"
                    value={formContext}
                    onChange={(e) => setFormContext(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Cost Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    value={formMultiplier}
                    onChange={(e) => setFormMultiplier(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1">
                    Avg Latency (ms)
                  </label>
                  <input
                    type="number"
                    value={formLatency}
                    onChange={(e) => setFormLatency(parseInt(e.target.value, 10) || 200)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/60 mb-1">
                  Primary Role / Use Case Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Real-time fiduciary suitability checks, portfolio tax optimization..."
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Register Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Governance Note */}
      <div className="p-6 rounded-2xl bg-[#13131A] border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Fiduciary Compliance & Audit Boundary
          </h4>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Adviza operates a strict zero-data-retention policy across all model inferences. Prompts sent to registered gateways are enterprise-governed and never used for foundation model training. All completions are hashed and recorded with SEC Rule 204-2 compliance audit signatures.
        </p>
      </div>
    </div>
  );
}
