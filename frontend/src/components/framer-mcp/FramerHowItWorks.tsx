import React, { useState } from 'react';
import {
  Link2,
  KeyRound,
  MessageSquareCode,
  Eye,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Layers,
  GitBranch
} from 'lucide-react';

export const FramerHowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Connect your AI tool',
      subtitle: 'Add the remote MCP endpoint',
      desc: 'Add https://mcp.framer.com/mcp into Cursor, Claude Desktop, Claude Code CLI, or your favorite MCP-compatible agent.',
      icon: Link2,
      codeSnippet: 'claude mcp add framer https://mcp.framer.com/mcp',
      tag: 'Endpoint Setup',
    },
    {
      num: '02',
      title: 'Authorize access securely',
      subtitle: 'Grant project permissions via OAuth',
      desc: 'Sign in with your Framer account to approve workspace access. Your agent inherits your exact account permissions.',
      icon: KeyRound,
      codeSnippet: 'OAuth 2.0: Connected as student@college.edu (Admin)',
      tag: 'OAuth 2.0 Auth',
    },
    {
      num: '03',
      title: 'Prompt your agent',
      subtitle: 'Instruct the agent in natural language',
      desc: 'Ask your agent to build landing pages, tweak typography, add testimonial carousels, or restructure CMS collections.',
      icon: MessageSquareCode,
      codeSnippet: '"Add a dark pricing grid with 3 tiers and feature checklist"',
      tag: 'Natural Language',
    },
    {
      num: '04',
      title: 'Review branch changes',
      subtitle: 'Inspect visual diffs before merging',
      desc: 'Changes are isolated in a branch. Compare modified canvas components side-by-side with main before anything touches production.',
      icon: Eye,
      codeSnippet: 'Branch: feature/pricing-grid (12 layers modified)',
      tag: 'Branch Isolation',
    },
    {
      num: '05',
      title: 'Publish when ready',
      subtitle: 'Deploy live with one click',
      desc: 'Merge the verified branch to main. Publish instantly to custom domains, staging previews, or Framer ultra-fast global hosting.',
      icon: Rocket,
      codeSnippet: 'framer.project live at https://your-brand.framer.app',
      tag: 'Instant Deploy',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
            <span>Seamless Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How Framer MCP works
          </h2>

          <p className="text-sm sm:text-base text-neutral-400">
            From setup to production in five simple steps. No bridges to compile, no complex local daemons.
          </p>
        </div>

        {/* 5-Step Horizontal / Stacked Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#141418] border-white/30 shadow-lg'
                    : 'bg-[#0d0d0f] border-white/[0.06] hover:border-white/15 hover:bg-[#101014]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-neutral-500'
                    }`}
                  >
                    {s.num}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-white/[0.05] text-neutral-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                    {s.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0c0e] border border-white/[0.1] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] text-neutral-300 font-mono text-[11px]">
              <span>Step {steps[activeStep].num}</span>
              <span>•</span>
              <span className="text-cyan-400">{steps[activeStep].tag}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {steps[activeStep].title}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {steps[activeStep].desc}
            </p>

            {/* Interactive Progress Indicators */}
            <div className="flex items-center gap-2 pt-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeStep === i ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Preview Code Box */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-white/[0.1] bg-[#121215] p-5 font-mono text-xs shadow-inner space-y-3 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-neutral-500 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span>terminal_preview.sh</span>
                </div>
                <span>Status: Ready</span>
              </div>

              <div className="space-y-1.5 text-neutral-300">
                <p className="text-neutral-500">// Command execution</p>
                <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.06] text-emerald-400 flex items-center gap-2">
                  <span className="text-neutral-500">$</span>
                  <span className="select-all">{steps[activeStep].codeSnippet}</span>
                </div>
                <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified with Framer Remote Server API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
