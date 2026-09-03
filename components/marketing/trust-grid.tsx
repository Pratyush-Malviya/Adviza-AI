import { ShieldCheck, Lock, Database, FileCheck2, Cpu, CheckCircle } from "lucide-react";

export function TrustGrid() {
  const BADGES = [
    {
      icon: ShieldCheck,
      title: "SOC 2 Type II Certified",
      desc: "Independently audited security controls, continuous posture monitoring, and rigorous intrusion testing.",
    },
    {
      icon: FileCheck2,
      title: "SEC 204-2 & FINRA 17a-4",
      desc: "Cryptographic Books & Records retention with one-click tamper-proof exam export for CCOs.",
    },
    {
      icon: Database,
      title: "WORM Storage Integrity",
      desc: "Write-Once-Read-Many immutable storage with SHA-256 hash chaining preventing post-hoc record tampering.",
    },
    {
      icon: Lock,
      title: "Zero-LLM Training Guarantee",
      desc: "Strict enterprise BAA equivalents with AWS Bedrock & Vertex AI. Client PII is never stored or trained on.",
    },
  ];

  const INTEGRATIONS = [
    { name: "Charles Schwab Institutional", type: "Custodian Feed" },
    { name: "Fidelity Institutional", type: "Custodian Feed" },
    { name: "BNY Mellon Pershing", type: "Custodian Feed" },
    { name: "Salesforce Financial Services", type: "CRM Two-Way Sync" },
    { name: "Wealthbox", type: "CRM Direct" },
    { name: "Redtail CRM", type: "CRM Direct" },
  ];

  return (
    <section className="py-16 bg-white border-y border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Badges */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Institutional Trust Standards</p>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#121217] tracking-tight">
            Built for Regulated Fiduciary Environments
          </h2>
          <p className="text-xs sm:text-sm text-[#7A726A]">
            Every system architecture decision is engineered to protect RIA compliance boundaries, custodian data security, and client confidentiality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#EADBCE] hover:border-violet-300 transition hover:shadow-xs space-y-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-violet-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-heading font-bold text-[#121217]">{badge.title}</h3>
                <p className="text-xs text-[#7A726A] leading-relaxed">{badge.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Integration logos */}
        <div className="pt-6 border-t border-[#EADBCE]">
          <p className="text-center text-xs font-semibold text-[#8E847C] uppercase tracking-wider mb-6">
            Enterprise Custody & Ecosystem Compatibility
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {INTEGRATIONS.map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-xl bg-[#FAF5F0] border border-[#EADBCE] flex items-center gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-[#121217]">{item.name}</span>
                <span className="text-[10px] text-[#8E847C] font-mono hidden sm:inline">({item.type})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
