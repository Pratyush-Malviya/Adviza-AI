"use client";

import React from "react";
import {
  X,
  Sliders,
  Sparkles,
  Bot,
  Layers,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Copy,
  Trash2
} from "lucide-react";
import { WorkflowNode, ConfigField } from "@/types/workflow";
import { AVAILABLE_NODE_TEMPLATES } from "./workflow-templates";

interface WorkflowPropertiesProps {
  node: WorkflowNode | null;
  onUpdateNodeConfig: (nodeId: string, updatedConfig: Record<string, any>) => void;
  onClose: () => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
}

export function WorkflowProperties({
  node,
  onUpdateNodeConfig,
  onClose,
  onDeleteNode,
  onDuplicateNode,
}: WorkflowPropertiesProps) {
  if (!node) return null;

  const template = AVAILABLE_NODE_TEMPLATES.find((t) => t.typeId === node.data.typeId);
  const configFields: ConfigField[] = template?.configFields || [];

  const handleFieldChange = (key: string, value: any) => {
    const newConfig = {
      ...(node.data.config || {}),
      [key]: value,
    };
    onUpdateNodeConfig(node.id, newConfig);
  };

  return (
    <aside className="w-88 border-l border-[#EADBCE] bg-[#FAF5F0]/95 backdrop-blur-md flex flex-col h-full shrink-0 select-none z-10">
      {/* Header */}
      <div className="p-4 border-b border-[#EADBCE] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-sm"
            style={{ backgroundColor: node.data.color }}
          >
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-[#121217]">Node Configuration</h3>
            <p className="text-[10px] text-[#8E847C] font-mono">ID: {node.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#8E847C] hover:text-[#121217] hover:bg-[#EADBCE]/50 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Info */}
      <div className="p-4 bg-white border-b border-[#EADBCE]">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{
              backgroundColor: `${node.data.color}15`,
              color: node.data.color,
            }}
          >
            {node.data.category}
          </span>
          {node.data.badge && (
            <span className="text-[10px] font-medium bg-[#FAF5F0] text-[#645F5A] px-2 py-0.5 rounded-full border border-[#EADBCE]">
              {node.data.badge}
            </span>
          )}
        </div>
        <h2 className="text-sm font-bold text-[#121217] mt-1.5">{node.data.label}</h2>
        {node.data.subtitle && (
          <p className="text-xs text-[#8E847C] mt-0.5">{node.data.subtitle}</p>
        )}
      </div>

      {/* Config Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {configFields.length === 0 ? (
          <div className="text-xs text-[#8E847C] py-6 text-center">
            This node does not require custom parameter configuration.
          </div>
        ) : (
          configFields.map((field) => {
            const currentValue =
              node.data.config?.[field.key] !== undefined
                ? node.data.config[field.key]
                : field.defaultValue;

            return (
              <div key={field.key} className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#121217]">
                  {field.label}
                </label>

                {field.description && (
                  <p className="text-[11px] text-[#8E847C] leading-snug">
                    {field.description}
                  </p>
                )}

                {/* Text Input */}
                {field.type === "text" && (
                  <input
                    type="text"
                    value={currentValue || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                )}

                {/* Textarea Input */}
                {field.type === "textarea" && (
                  <textarea
                    rows={3}
                    value={currentValue || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                  />
                )}

                {/* Select / Model Select / Composio Tool */}
                {(field.type === "select" ||
                  field.type === "model_select" ||
                  field.type === "composio_tool" ||
                  field.type === "compliance_ruleset") && (
                  <select
                    value={currentValue || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Toggle Input */}
                {field.type === "toggle" && (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={!!currentValue}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      className="w-4 h-4 rounded border-[#EADBCE] text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs text-[#645F5A]">Enabled</span>
                  </label>
                )}
              </div>
            );
          })
        )}

        {/* Execution Output Preview if run */}
        {node.data.executionOutput && (
          <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Latest Node Output
            </div>
            <pre className="text-[11px] font-mono text-emerald-950 bg-white/60 p-2 rounded border border-emerald-100 overflow-x-auto whitespace-pre-wrap max-h-32">
              {node.data.executionOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[#EADBCE] bg-[#F5EDE4]/60 flex items-center justify-between">
        <button
          onClick={() => onDuplicateNode(node.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#645F5A] hover:text-[#121217] bg-white border border-[#EADBCE] rounded-xl hover:shadow-sm transition"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </button>

        <button
          onClick={() => onDeleteNode(node.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Node
        </button>
      </div>
    </aside>
  );
}
