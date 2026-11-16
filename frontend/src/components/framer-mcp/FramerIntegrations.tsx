import React, { useState } from 'react';
import { Copy, Check, ArrowUpRight, Terminal, Sparkles, ExternalLink } from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  category?: string;
  actionLabel: string;
  actionType: 'install' | 'guide';
  logoUrl: string;
  installUrl?: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'claude',
    name: 'Claude',
    category: 'Anthropic Desktop & Web',
    actionLabel: 'Add to Claude',
    actionType: 'install',
    logoUrl: 'https://framerusercontent.com/images/wTFm3mt8aqjkUJOviPf90Hbc.png',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    category: 'Terminal Agent CLI',
    actionLabel: 'Add to Claude Code',
    actionType: 'install',
    logoUrl: 'https://framerusercontent.com/images/M0bBeFkkZMksynq2BPJSlQM8DGE.png',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'OpenAI Web & Desktop',
    actionLabel: 'Add to ChatGPT',
    actionType: 'install',
    logoUrl: 'https://framerusercontent.com/images/ruv2NHckqpQOHTuPoDo0yy9X1g.png',
  },
  {
    id: 'codex',
    name: 'Codex',
    category: 'Code Generator & Agent',
    actionLabel: 'Add to Codex',
    actionType: 'install',
    logoUrl: 'https://framerusercontent.com/images/Q2PwvcvPzxBf7y810ewVueDlxss.png',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'AI Code Editor',
    actionLabel: 'Add to Cursor',
    actionType: 'install',
    logoUrl: 'https://framerusercontent.com/images/ocEI71hUvGONqLCdsQKm9QS1w.png',
    installUrl: 'cursor://anysphere.cursor-mcp/install?url=https://mcp.framer.com/mcp',
  },
  {
    id: 'grok-bot',
    name: 'Grok Bot',
    category: 'xAI Assistant',
    actionLabel: 'Add to Grok Bot',
    actionType: 'install',
    logoUrl: 'https://framerusercontent.com/images/ovmOJKQopZbtayaqnjuBLwIM.png',
  },
  {
    id: 'grok',
    name: 'Grok',
    category: 'xAI LLM Platform',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/3qjIIADFvHbBiNdLsCuNCDEKwCI.png',
  },
  {
    id: 'pi',
    name: 'Pi',
    category: 'Inflection Conversational',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/tVUFrieOOLCX5LniqZsV6Z4TAE.png',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    category: 'Open Source Agent',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/WCLVgXPvUMTH8ZEaghf7iKM3bfk.png',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'Visual Studio Code MCP',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/X6FA3na7km2z3VSBo59odXJxYU.png',
  },
  {
    id: 'kiro',
    name: 'Kiro',
    category: 'Autonomous Agent',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/q3pxcjDIXPPP4uQFWXIQYPrsvy8.png',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Workspace & Docs Agent',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/uXNkCzkyP2XVcY0SaoE8mhRo8Q.png',
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    category: 'Agentic AI IDE',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/EuS0tslXbOjOJXzX80yTM1CTZY.png',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'Codeium AI Cascade',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/OxRs0ACjZYCy3PgOy6Dqjo0oUjE.png',
  },
  {
    id: 'warp',
    name: 'Warp',
    category: 'Modern Rust Terminal',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/4lafZpCUUbvtUi31Ujc048qgZU.png',
  },
  {
    id: 'devin',
    name: 'Devin',
    category: 'Cognition Autonomous Engineer',
    actionLabel: 'View install guide',
    actionType: 'guide',
    logoUrl: 'https://framerusercontent.com/images/E9eYKvN70C8mXcwqXNrzeK4rw9c.png',
  },
];

interface FramerIntegrationsProps {
  onSelectTool?: (tool: ToolItem) => void;
}

export const FramerIntegrations: React.FC<FramerIntegrationsProps> = ({ onSelectTool }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const SERVER_URL = 'https://mcp.framer.com/mcp';

  const handleToolAction = (tool: ToolItem) => {
    if (tool.installUrl) {
      window.location.href = tool.installUrl;
      return;
    }

    navigator.clipboard.writeText(SERVER_URL);
    setCopiedId(tool.id);
    if (onSelectTool) onSelectTool(tool);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="integrations" className="py-20 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Agent Compatibility</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Connect Framer to your tools
          </h2>

          <p className="text-sm sm:text-base text-neutral-400">
            Add the Framer MCP server to your AI tool, approve the OAuth connection, and ask your agent to build in Framer.
          </p>
        </div>

        {/* 16-Tool Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {TOOLS.map((tool) => {
            const isCopied = copiedId === tool.id;

            return (
              <div
                key={tool.id}
                className="group relative p-4 sm:p-5 rounded-2xl bg-[#0d0d0f] hover:bg-[#131316] border border-white/[0.08] hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                onClick={() => handleToolAction(tool)}
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black border border-white/[0.08] p-2 flex items-center justify-center overflow-hidden group-hover:border-white/25 transition-colors">
                    <img
                      src={tool.logoUrl}
                      alt={`${tool.name} logo`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
                      <span>{tool.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                      {tool.category}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : tool.actionType === 'install'
                      ? 'bg-white/[0.06] group-hover:bg-white text-neutral-300 group-hover:text-black border border-white/[0.08]'
                      : 'bg-white/[0.04] group-hover:bg-white/[0.08] text-neutral-400 group-hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied URL!</span>
                    </>
                  ) : (
                    <span>{tool.actionLabel}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Fallback Manual Server URL Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0c0e] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="text-left space-y-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-400" />
              <span>Using an app that’s not listed?</span>
            </h4>
            <p className="text-xs text-neutral-400">
              Follow the manual setup guide and connect directly with this server URL.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <code className="px-3 py-1.5 rounded-xl bg-black border border-white/[0.1] font-mono text-xs text-neutral-200 select-all flex-1 sm:flex-none">
              https://mcp.framer.com/mcp
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://mcp.framer.com/mcp');
                setCopiedId('fallback-btn');
                setTimeout(() => setCopiedId(null), 2000);
              }}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
            >
              {copiedId === 'fallback-btn' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
