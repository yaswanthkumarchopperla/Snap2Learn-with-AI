import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Terminal,
  ExternalLink,
  Layers,
  GitBranch,
  Play,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface FramerHeroProps {
  onCopyUrl?: () => void;
}

export const FramerHero: React.FC<FramerHeroProps> = ({ onCopyUrl }) => {
  const [copied, setCopied] = useState(false);
  const SERVER_URL = 'https://mcp.framer.com/mcp';

  const handleCopy = () => {
    navigator.clipboard.writeText(SERVER_URL);
    setCopied(true);
    if (onCopyUrl) onCopyUrl();
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="overview" className="relative pt-16 sm:pt-24 pb-20 overflow-hidden">
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent blur-[90px] pointer-events-none" />

      {/* Subtle Grid Lines Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs text-neutral-300 hover:border-white/20 transition-all cursor-pointer group">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="font-medium text-neutral-200">Remote Model Context Protocol</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400 group-hover:text-white flex items-center gap-1 transition-colors">
            Framer MCP Server
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-[-0.035em] leading-[1.08] max-w-4xl mx-auto">
          Connect Claude, Codex and Cursor to Framer with MCP
        </h1>

        {/* Subtitle Description */}
        <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Framer MCP lets you design, build, and update your site with AI tools like ChatGPT, Claude, and Cursor, without giving up the flexibility, reliability, and control of Framer.
        </p>

        {/* Server URL Input & Copy Bar */}
        <div className="max-w-xl mx-auto">
          <div className="p-1.5 sm:p-2 rounded-2xl bg-[#0f0f11] border border-white/[0.12] shadow-2xl flex items-center justify-between gap-3 group focus-within:border-white/25 transition-all">
            <div className="flex items-center gap-2.5 pl-3 min-w-0 flex-1">
              <Terminal className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-mono text-xs sm:text-sm text-neutral-200 truncate select-all">
                {SERVER_URL}
              </span>
            </div>

            <button
              onClick={handleCopy}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white text-black hover:bg-neutral-200 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 mt-2">
            Add this remote MCP endpoint into Cursor, Claude Desktop, or Windsurf config.
          </p>
        </div>

        {/* Action CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="cursor://anysphere.cursor-mcp/install?url=https://mcp.framer.com/mcp"
            className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <span>Add to Cursor</span>
            <ExternalLink className="w-3.5 h-3.5 text-black/70" />
          </a>

          <a
            href="#setup"
            className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <span>Setup Guide</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>

        {/* ============================================================= */}
        {/* HERO VISUAL MOCKUP: AI Agent + Framer Canvas                   */}
        {/* ============================================================= */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-[#0c0c0e] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Window Title Bar */}
            <div className="h-10 sm:h-11 px-4 border-b border-white/[0.08] bg-[#121214] flex items-center justify-between text-xs text-neutral-400 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="text-neutral-500 font-mono text-[11px] ml-2 hidden sm:inline">
                  framer.project — AI Agent Active Session
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                  <GitBranch className="w-3 h-3" />
                  <span>branch: ai-feature/hero-redesign</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Split Interface: Left Agent Chat / Right Framer Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[440px] text-left">
              {/* Left Column: AI Coding Agent (Cursor / Claude) */}
              <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#0f0f12] flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold">
                        AI
                      </div>
                      <span className="text-xs font-semibold text-white">Claude 3.7 Agent</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">MCP Protocol v1.0</span>
                  </div>

                  {/* User Prompt Message */}
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">User Prompt</span>
                    <p className="text-xs text-neutral-200 leading-relaxed">
                      "Read the design tokens in my Framer project, add a responsive dark hero section with MCP integration cards, and verify changes on a new branch."
                    </p>
                  </div>

                  {/* Agent Response Stream */}
                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="flex items-start gap-2 text-neutral-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Connected to <code className="text-neutral-200">https://mcp.framer.com/mcp</code></span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Read project canvas and 14 component variants</span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Created branch: <span className="text-cyan-300">ai-feature/hero-redesign</span></span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-400">
                      <span className="text-cyan-400 animate-spin">⟳</span>
                      <span className="text-neutral-300">Applying changes to Framer canvas...</span>
                    </div>
                  </div>
                </div>

                {/* Prompt Input bar preview */}
                <div className="p-2.5 rounded-xl bg-[#161619] border border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
                  <span className="text-neutral-500 text-[11px]">Ask your agent anything about this project...</span>
                  <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-300">
                    ⌘K
                  </div>
                </div>
              </div>

              {/* Right Column: Live Framer Canvas Preview */}
              <div className="lg:col-span-7 p-4 sm:p-6 bg-[#0a0a0c] flex flex-col justify-between relative overflow-hidden">
                {/* Canvas Canvas Header Controls */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-200 font-medium">Desktop (1200px)</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-neutral-400">Tablet</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-neutral-400">Phone</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live Sync
                    </span>
                    <button className="px-2.5 py-1 rounded-lg bg-white text-black font-semibold text-[11px]">
                      Publish
                    </button>
                  </div>
                </div>

                {/* Mini Canvas Mockup Box */}
                <div className="my-auto py-4">
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#141418] to-[#0d0d10] border border-cyan-500/30 shadow-xl relative group">
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded bg-cyan-500 text-[9px] font-bold text-black uppercase tracking-wider">
                      Agent Editing Layer: Hero_V2
                    </div>

                    <div className="space-y-3">
                      <div className="w-24 h-2.5 rounded-full bg-neutral-700" />
                      <div className="w-3/4 h-5 rounded-md bg-white/90" />
                      <div className="w-1/2 h-3 rounded-md bg-neutral-600" />

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="h-16 rounded-xl bg-white/[0.04] border border-white/[0.08] p-2 flex flex-col justify-between">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
                          <div className="w-12 h-1.5 rounded-full bg-neutral-600" />
                        </div>
                        <div className="h-16 rounded-xl bg-white/[0.04] border border-cyan-400/40 p-2 flex flex-col justify-between shadow-xs">
                          <div className="w-5 h-5 rounded-full bg-cyan-500/30" />
                          <div className="w-14 h-1.5 rounded-full bg-neutral-400" />
                        </div>
                        <div className="h-16 rounded-xl bg-white/[0.04] border border-white/[0.08] p-2 flex flex-col justify-between">
                          <div className="w-5 h-5 rounded-full bg-purple-500/30" />
                          <div className="w-10 h-1.5 rounded-full bg-neutral-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Canvas Status Footer */}
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-white/[0.06]">
                  <span>14 changes pending review in branch</span>
                  <span className="font-mono text-neutral-400">100% Zoom • 60 FPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
