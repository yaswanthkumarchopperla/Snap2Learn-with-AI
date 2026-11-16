import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  hasLink?: { text: string; url: string };
}

const FAQS: FaqItem[] = [
  {
    q: 'What is MCP?',
    a: 'MCP (Model Context Protocol) lets AI agents connect to apps like Framer. Once connected, your agent can work directly in your Framer projects to build pages, update content, and more.',
  },
  {
    q: 'Why use MCP instead of Framer’s built-in agent?',
    a: 'You can work from an agent you already use, on your desktop, in your browser, or on your phone where supported. Your Framer project doesn’t need to be open. Your AI usage follows that agent’s plan or credits.',
  },
  {
    q: 'What can my agent access?',
    a: 'After you approve the connection, your agent can work with the canvas, components, supported project settings and CMS in projects your Framer account has access to. It uses your account’s permissions.',
  },
  {
    q: 'Can my agent change my live site?',
    a: 'Yes, if you explicitly ask it to publish. By default, changes stay in your project and don’t affect the live site until you publish. Ask your agent to work on a branch, so you can review its changes and fix anything that isn’t right before publishing.',
  },
  {
    q: 'Which AI tools work with Framer MCP?',
    a: 'Any AI tool that supports remote MCP servers and OAuth can connect to Framer, including Codex, Claude Code, Cursor, Pi, Windsurf, Warp, and Grok. Add the Framer MCP server in your AI tool, approve the connection with your Framer account, and ask your agent to work on your project.',
  },
  {
    q: 'Can I migrate an existing site to Framer with MCP?',
    a: 'Yes. Connect Claude, Codex, or Cursor to Framer, then follow the MCP migration guide to move your pages, styles, and CMS content into a Framer project.',
  },
  {
    q: 'How is Framer MCP different from External Agents?',
    a: 'Framer MCP is the recommended way to connect AI agents through a remote MCP server. The older External Agents setup (@framer/agent CLI) uses a local bridge and supports additional workflows, including localization. Framer continues to support both while MCP reaches feature parity.',
  },
];

export const FramerFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Got questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#101014] border-white/20 shadow-md'
                    : 'bg-[#0b0b0d] border-white/[0.06] hover:border-white/10 hover:bg-[#0e0e11]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/10 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-white/10 text-white' : 'text-neutral-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-0 text-xs sm:text-sm text-neutral-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
