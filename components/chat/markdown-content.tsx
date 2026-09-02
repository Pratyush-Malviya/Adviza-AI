"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function MarkdownContentComponent({ content, className = "" }: MarkdownContentProps) {
  if (!content) return null;

  // 1. Pre-normalize any compressed/unbroken markdown strings
  const normalized = normalizeMarkdown(content);

  // 2. Parse into structured blocks
  const blocks = parseMarkdownBlocks(normalized);

  return (
    <div className={`space-y-3.5 text-xs sm:text-sm text-[#121217] leading-relaxed font-sans ${className}`}>
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>{renderBlock(block, idx)}</React.Fragment>
      ))}
    </div>
  );
}

export const MarkdownContent = React.memo(MarkdownContentComponent);

// ---------------------------------------------------------------------------
// Pre-Normalization of Raw Markdown Strings
// ---------------------------------------------------------------------------

function normalizeMarkdown(raw: string): string {
  if (!raw) return "";
  return raw
    // Replace em dashes and en dashes
    .replace(/[\u2014\u2015]/g, " - ")
    .replace(/[\u2013]/g, "-")
    // Normalize unicode bullets
    .replace(/^[•●▪]\s+/gm, "- ");
}

// ---------------------------------------------------------------------------
// Block Parsing & Data Structures
// ---------------------------------------------------------------------------

type BlockType =
  | { type: "heading"; level: number; text: string }
  | { type: "callout"; alertType: "note" | "warning" | "fiduciary" | "tip"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "divider" }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(raw: string): BlockType[] {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const blocks: BlockType[] = [];
  let i = 0;

  while (i < lines.length) {
    const prevI = i;
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Horizontal Divider (--- or *** or ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // 3. Headings (# Title, ## Title, ### Title)
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (headingMatch && headingMatch[2]) {
      blocks.push({
        type: "heading",
        level: Math.min(headingMatch[1].length, 3),
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // 4. Code Block (```lang ... ```)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim() || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++; // skip closing ```
      }
      blocks.push({
        type: "code",
        language: lang,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 5. Callout / Blockquote (> [!NOTE] or > Text)
    if (trimmed.startsWith(">")) {
      const calloutLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        calloutLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const fullCallout = calloutLines.join("\n");
      let alertType: "note" | "warning" | "fiduciary" | "tip" = "note";
      let cleanText = fullCallout;

      if (fullCallout.includes("[!WARNING]") || fullCallout.toLowerCase().includes("risk") || fullCallout.toLowerCase().includes("penalty")) {
        alertType = "warning";
        cleanText = fullCallout.replace(/\[!WARNING\]/i, "").trim();
      } else if (fullCallout.includes("[!FIDUCIARY]") || fullCallout.toLowerCase().includes("sec") || fullCallout.toLowerCase().includes("finra")) {
        alertType = "fiduciary";
        cleanText = fullCallout.replace(/\[!FIDUCIARY\]/i, "").trim();
      } else if (fullCallout.includes("[!TIP]")) {
        alertType = "tip";
        cleanText = fullCallout.replace(/\[!TIP\]/i, "").trim();
      } else {
        cleanText = fullCallout.replace(/\[!NOTE\]/i, "").trim();
      }

      blocks.push({
        type: "callout",
        alertType,
        text: cleanText || fullCallout,
      });
      continue;
    }

    // 6. Markdown Table (| Col 1 | Col 2 |)
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        const hasDivider = /^[|\s-:]+$/.test(tableLines[1]);
        const dataStartIdx = hasDivider ? 2 : 1;
        const rows: string[][] = [];

        for (let r = dataStartIdx; r < tableLines.length; r++) {
          const cols = tableLines[r]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
          if (cols.length > 0) {
            rows.push(cols);
          }
        }

        blocks.push({ type: "table", headers, rows });
        continue;
      } else if (tableLines.length === 1) {
        blocks.push({ type: "paragraph", text: tableLines[0] });
        continue;
      }
    }

    // 7. Unordered List (- item or * item)
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // 8. Ordered List (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // 9. Standard Paragraph (accumulate until next block boundary)
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(\-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
    } else {
      // Guaranteed progress fallback: consume line if it didn't match paragraph loop
      blocks.push({
        type: "paragraph",
        text: trimmed,
      });
      i++;
    }

    // Absolute fail-safe: guarantee loop termination
    if (i <= prevI) {
      i = prevI + 1;
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Block Rendering Components
// ---------------------------------------------------------------------------

function renderBlock(block: BlockType, index: number) {
  switch (block.type) {
    case "heading": {
      if (block.level === 1) {
        return (
          <div key={index} className="pt-3 pb-1 border-b border-[#EADBCE]/80">
            <h1 className="text-base sm:text-lg font-heading font-extrabold text-[#121217] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {renderFormattedInlineText(block.text)}
            </h1>
          </div>
        );
      }
      if (block.level === 2) {
        return (
          <div key={index} className="pt-2.5 pb-0.5">
            <h2 className="text-sm sm:text-base font-heading font-bold text-[#121217] tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {renderFormattedInlineText(block.text)}
            </h2>
          </div>
        );
      }
      return (
        <h3 key={index} className="text-xs sm:text-sm font-heading font-bold text-[#121217] pt-2 pb-0.5">
          {renderFormattedInlineText(block.text)}
        </h3>
      );
    }

    case "divider":
      return <div key={index} className="my-3 border-t border-[#EADBCE]/80" />;

    case "callout": {
      const styles = {
        warning: {
          bg: "bg-rose-50/70 border-rose-200 text-rose-950",
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
          title: "Compliance Risk Flag",
        },
        fiduciary: {
          bg: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
          title: "SEC / FINRA Fiduciary Standard",
        },
        tip: {
          bg: "bg-amber-50/70 border-amber-200 text-amber-950",
          icon: <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
          title: "Advisory Strategy Tip",
        },
        note: {
          bg: "bg-[#FAF5F0] border-[#EADBCE] text-[#121217]",
          icon: <Info className="w-4 h-4 text-[#8E847C] shrink-0 mt-0.5" />,
          title: "Executive Note",
        },
      }[block.alertType];

      return (
        <div
          key={index}
          className={`p-3.5 rounded-2xl border ${styles.bg} shadow-2xs flex items-start gap-3 my-2.5`}
        >
          {styles.icon}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-0.5 opacity-80">
              {styles.title}
            </div>
            <div className="text-xs leading-relaxed">
              {renderFormattedInlineText(block.text)}
            </div>
          </div>
        </div>
      );
    }

    case "table":
      return (
        <div
          key={index}
          className="my-3 overflow-hidden rounded-2xl border border-[#EADBCE] shadow-2xs bg-white overflow-x-auto"
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF5F0] border-b border-[#EADBCE]">
                {block.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3.5 font-bold text-[#121217] uppercase tracking-wider text-[10px]">
                    {renderFormattedInlineText(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F0]">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FAF5F0]/50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3.5 text-[#5A544E]">
                      {renderFormattedInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "code":
      return <CodeBlockCard key={index} code={block.code} language={block.language} />;

    case "list":
      return (
        <div key={index} className="space-y-2 my-2.5">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-[#121217] leading-relaxed"
            >
              {block.ordered ? (
                <span className="w-4 h-4 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
              )}
              <div className="flex-1">
                {renderFormattedInlineText(item)}
              </div>
            </div>
          ))}
        </div>
      );

    case "paragraph":
      return (
        <p key={index} className="text-xs sm:text-sm text-[#121217] leading-relaxed my-1">
          {renderFormattedInlineText(block.text)}
        </p>
      );
  }
}

// ---------------------------------------------------------------------------
// Interactive Code Block with Copy Button
// ---------------------------------------------------------------------------

function CodeBlockCard({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#121217] text-white shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1C1C24] border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
        <span className="uppercase tracking-wider font-bold">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition px-2 py-0.5 rounded-md hover:bg-zinc-800"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono overflow-x-auto text-zinc-200 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Text Formatter (Bold, Highlights, Badges, Links, Inline Code)
// ---------------------------------------------------------------------------

function renderFormattedInlineText(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\/(?:mo|yr|month|year|advisor|firm|seat))?|\+\d+\.?\d*%)/g;

  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    const matchedStr = match[0];

    // Bold (**text**)
    if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      const boldText = matchedStr.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-extrabold text-[#121217]">
          {boldText}
        </strong>
      );
    }
    // Inline Code (`code`)
    else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      const codeText = matchedStr.slice(1, -1);
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 bg-[#FAF5F0] border border-[#EADBCE] rounded-md font-mono text-[11px] text-rose-700 font-bold"
        >
          {codeText}
        </code>
      );
    }
    // Link ([title](url))
    else if (matchedStr.startsWith("[")) {
      const linkMatch = matchedStr.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-rose-600 hover:text-rose-700 underline font-bold"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        );
      }
    }
    // Currency or Percentage Badge ($500 - $1,500 / mo or +18.4%)
    else if (matchedStr.startsWith("$") || matchedStr.endsWith("%")) {
      parts.push(
        <span
          key={match.index}
          className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] font-mono mx-0.5 shadow-2xs"
        >
          {matchedStr}
        </span>
      );
    }

    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return <>{parts}</>;
}
