import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, Cpu, ExternalLink } from 'lucide-react';

interface ConfigTab {
  id: string;
  label: string;
  filename: string;
  language: string;
  code: string;
  installCommand?: string;
}

const CONFIG_TABS: ConfigTab[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    filename: '~/.cursor/mcp.json',
    language: 'json',
    code: `{
  "mcpServers": {
    "framer": {
      "url": "https://mcp.framer.com/mcp"
    }
  }
}`,
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    filename: 'claude_desktop_config.json',
    language: 'json',
    code: `{
  "mcpServers": {
    "framer": {
      "command": "npx",
      "args": ["-y", "@framer/mcp-server@latest"]
    }
  }
}`,
  },
  {
    id: 'claude-code',
    label: 'Claude Code CLI',
    filename: 'terminal',
    language: 'bash',
    code: `# Add Framer remote MCP server to your Claude Code CLI
claude mcp add framer https://mcp.framer.com/mcp

# Verify status
claude mcp list`,
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    filename: '~/.codeium/windsurf/mcp_config.json',
    language: 'json',
    code: `{
  "mcpServers": {
    "framer": {
      "serverUrl": "https://mcp.framer.com/mcp"
    }
  }
}`,
  },
  {
    id: 'generic',
    label: 'Generic Client',
    filename: 'settings.json',
    language: 'json',
    code: `{
  "servers": [
    {
      "name": "framer",
      "type": "remote",
      "url": "https://mcp.framer.com/mcp",
      "auth": "oauth2"
    }
  ]
}`,
  },
];

interface FramerDevExperienceProps {
  onCopy?: () => void;
}

export const FramerDevExperience: React.FC<FramerDevExperienceProps> = ({ onCopy }) => {
  const [activeTab, setActiveTab] = useState('cursor');
  const [copied, setCopied] = useState(false);

  const currentTab = CONFIG_TABS.find((t) => t.id === activeTab) || CONFIG_TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.code);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="dev-experience" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Developer Experience</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Configure in seconds
          </h2>

          <p className="text-sm sm:text-base text-neutral-400">
            Copy the configuration snippet directly into your local IDE or AI client settings file.
          </p>
        </div>

        {/* Code Editor Window */}
        <div className="rounded-3xl border border-white/[0.12] bg-[#0c0c0e] shadow-2xl overflow-hidden">
          {/* Top Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#121215] px-4 py-2 gap-2">
            {/* Window Controls */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>

            {/* Client Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {CONFIG_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCopied(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Copy Snippet Button */}
            <button
              onClick={handleCopy}
              type="button"
              className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>

          {/* Filename Bar */}
          <div className="px-5 py-2 bg-[#09090b] border-b border-white/[0.04] text-[11px] font-mono text-neutral-500 flex items-center justify-between">
            <span>{currentTab.filename}</span>
            <span className="text-neutral-600 uppercase text-[10px]">{currentTab.language}</span>
          </div>

          {/* Code Body */}
          <div className="p-5 sm:p-7 bg-[#08080a] overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed select-all">
              <code>{currentTab.code}</code>
            </pre>
          </div>

          {/* Footer Helper */}
          <div className="px-5 py-3 border-t border-white/[0.06] bg-[#0c0c0e] text-[11px] text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Requires remote MCP & OAuth support. All tokens are encrypted at rest.</span>
            <a
              href="https://mcp.framer.com/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View full protocol specification</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
