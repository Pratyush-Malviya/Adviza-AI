"use client";

import React, { useState } from "react";
import { Copy, Check, Volume2, VolumeX, Printer, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

interface MessageActionsProps {
  content: string;
  timestamp?: string;
  isDeepResearch?: boolean;
}

export function MessageActions({ content, timestamp, isDeepResearch }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = content.replace(/[#*`_\[\]()]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Adviza AI Fiduciary Advisory Memo</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #121217; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1, h2, h3 { color: #121217; }
            .header { border-bottom: 2px solid #EADBCE; padding-bottom: 15px; margin-bottom: 25px; }
            .badge { display: inline-block; padding: 4px 12px; background: #FAF5F0; border: 1px solid #EADBCE; border-radius: 20px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Adviza Fiduciary Intelligence Briefing</h2>
            <div class="badge">Date: ${new Date().toLocaleDateString()} &bull; Adviza OS</div>
          </div>
          <div style="white-space: pre-wrap;">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="flex items-center justify-between pt-1.5 px-1 text-[#8E847C]">
      <div className="flex items-center gap-1">
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#FAF5F0] hover:text-[#121217] transition text-[11px]"
          title="Copy Response"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>

        {/* Read Aloud Button */}
        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#FAF5F0] hover:text-[#121217] transition text-[11px] ${
            isPlaying ? "text-rose-600 bg-rose-50" : ""
          }`}
          title={isPlaying ? "Stop Speaking" : "Read Aloud"}
        >
          {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isPlaying ? "Stop" : "Listen"}</span>
        </button>

        {/* Print / Export Memo */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#FAF5F0] hover:text-[#121217] transition text-[11px]"
          title="Print Advisory Memo"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Memo</span>
        </button>

        {/* Thumbs Up / Down */}
        <button
          type="button"
          onClick={() => setFeedback(feedback === "up" ? null : "up")}
          className={`p-1.5 rounded-lg hover:bg-[#FAF5F0] transition ${
            feedback === "up" ? "text-emerald-600 bg-emerald-50" : "hover:text-[#121217]"
          }`}
          title="Good Response"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setFeedback(feedback === "down" ? null : "down")}
          className={`p-1.5 rounded-lg hover:bg-[#FAF5F0] transition ${
            feedback === "down" ? "text-rose-600 bg-rose-50" : "hover:text-[#121217]"
          }`}
          title="Bad Response"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {timestamp && <span className="text-[10px] font-mono text-[#8E847C]">{timestamp}</span>}
    </div>
  );
}
