import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowRight, Terminal, Sparkles } from 'lucide-react';
import { FramerLogo } from './FramerLogo';

interface FramerCtaProps {
  onCopy?: () => void;
}

export const FramerCta: React.FC<FramerCtaProps> = ({ onCopy }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const SERVER_URL = 'https://mcp.framer.com/mcp';

  const handleCopy = () => {
    navigator.clipboard.writeText(SERVER_URL);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="py-24 border-t border-white/[0.08] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
          <FramerLogo className="w-6 h-9 text-white" />
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-[1.1]">
          Connect Claude, Codex and Cursor to Framer with MCP
        </h2>

        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Framer MCP lets you design, build, and update your site with AI tools like ChatGPT, Claude, and Cursor, without giving up the flexibility, reliability, and control of Framer.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            type="button"
            className={`px-5 py-3 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied Server URL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy MCP Server URL</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/auth')}
            type="button"
            className="px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Start free with Framer</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
