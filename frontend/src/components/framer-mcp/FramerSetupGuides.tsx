import React, { useState } from 'react';
import { Play, ArrowRight, BookOpen, Video, ExternalLink, X, Check } from 'lucide-react';

export const FramerSetupGuides: React.FC = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section id="setup" className="py-20 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-left max-w-xl space-y-2">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Resources & Guides
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Setup the Framer MCP
          </h2>
        </div>

        {/* 2-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Build with Framer MCP (Video Feature) */}
          <div
            onClick={() => setShowVideoModal(true)}
            className="group relative rounded-3xl p-6 sm:p-8 bg-[#0d0d10] hover:bg-[#121216] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xl"
          >
            {/* Visual Thumbnail */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-gradient-to-tr from-neutral-900 to-black border border-white/[0.08] overflow-hidden mb-6 flex items-center justify-center group-hover:border-cyan-500/30 transition-all">
              {/* Play Badge */}
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all shadow-2xl z-10">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>

              {/* Decorative Canvas Wireframe */}
              <div className="absolute inset-4 rounded-xl border border-white/[0.06] bg-[#141418]/60 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>AI Canvas Editor</span>
                  <span>1080p Preview</span>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-3 rounded bg-white/20" />
                  <div className="w-1/2 h-2 rounded bg-neutral-700" />
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30" />
                  <div className="w-16 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Build with Framer MCP</span>
                <span className="text-xs text-neutral-500 font-mono">2:45 min</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                See how an AI agent can inspect your project, edit the canvas, and help you build in Framer.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                <span>Watch video</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* Card 2: Set up Framer MCP (Documentation Feature) */}
          <div
            onClick={() => {
              const el = document.querySelector('#dev-experience');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative rounded-3xl p-6 sm:p-8 bg-[#0d0d10] hover:bg-[#121216] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xl"
          >
            {/* Visual Configuration Mockup */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-gradient-to-tr from-[#121216] to-[#0a0a0c] border border-white/[0.08] overflow-hidden mb-6 p-4 font-mono text-[11px] text-neutral-300 flex flex-col justify-between group-hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-neutral-500 text-[10px]">
                <span>mcp_settings.json</span>
                <span>OAuth 2.0</span>
              </div>

              <div className="space-y-1.5 text-neutral-400">
                <div><span className="text-purple-400">"mcpServers"</span>: &#123;</div>
                <div className="pl-4"><span className="text-cyan-400">"framer"</span>: &#123;</div>
                <div className="pl-8"><span className="text-neutral-500">"url":</span> <span className="text-emerald-400">"https://mcp.framer.com/mcp"</span></div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-500">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3 h-3" /> Compatible with Cursor & Claude
                </span>
                <span>v1.2.0</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Set up Framer MCP</span>
                <span className="text-xs text-neutral-500 font-mono">Step-by-step</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Connect Framer to Codex, Cursor, Claude, Grok Bot or another compatible MCP client.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">
                <span>Read guide</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Demo Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full p-6 rounded-3xl bg-[#111114] border border-white/20 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Framer MCP: Live Demonstration</h4>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-black border border-white/10 overflow-hidden relative flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
              <h5 className="text-base font-semibold text-white mb-1">
                AI Agent Building on Framer Canvas
              </h5>
              <p className="text-xs text-neutral-400 max-w-md">
                Demonstrating Claude 3.7 and Cursor connecting to the remote Framer MCP server, creating branches, and visually updating component styles.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
