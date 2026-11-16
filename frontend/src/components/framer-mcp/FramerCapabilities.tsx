import React from 'react';
import {
  Smartphone,
  GitBranch,
  Layers,
  Palette,
  Database,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const FramerCapabilities: React.FC = () => {
  return (
    <section id="capabilities" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
            <span>Remote Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Work anywhere, stay in control
          </h2>

          <p className="text-sm sm:text-base text-neutral-400">
            Design and develop websites without constraints. Interact with your Framer projects from your preferred coding client or on the go.
          </p>
        </div>

        {/* Two Large Heroic Feature Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 1: Work from your desktop, browser, or phone */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d0d10] border border-white/[0.08] flex flex-col justify-between space-y-8 hover:border-white/20 transition-all shadow-2xl overflow-hidden group">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Work from your desktop, browser, or phone
              </h3>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Use Framer from any supported desktop, browser, or mobile client. There’s no local Framer bridge to install and no need to keep the editor open.
              </p>
            </div>

            {/* Visual Screenshot from official Framer */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black/60 shadow-xl group-hover:scale-[1.01] transition-transform">
              <img
                src="https://framerusercontent.com/images/JuVZJzM9CtIi8m9nGwj4YgYS0.png"
                alt="Mobile AI chat with a prompt to research competitors in Ahrefs and optimize a website"
                className="w-full h-auto object-cover max-h-[380px]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Feature 2: Review every change before it goes live */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d0d10] border border-white/[0.08] flex flex-col justify-between space-y-8 hover:border-white/20 transition-all shadow-2xl overflow-hidden group">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Review every change before it goes live
              </h3>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Changes stay in your project or branch until you or your agent publishes them. Review the work, compare it with main, and publish when you’re ready.
              </p>
            </div>

            {/* Visual Screenshot from official Framer */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black/60 shadow-xl group-hover:scale-[1.01] transition-transform">
              <img
                src="https://framerusercontent.com/images/bctzthFxxvAwupL2PSxR7WoWC08.png"
                alt="Framer Branches panel showing nested branches, a list of changes, and the Apply to Main button"
                className="w-full h-auto object-cover max-h-[380px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* 4 Supporting Capability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0b0b0e] border border-white/[0.06] hover:border-white/15 transition-all space-y-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Canvas Manipulation</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Create, modify, and restructure layouts, frames, and stacks with pixel-perfect responsive precision.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b0b0e] border border-white/[0.06] hover:border-white/15 transition-all space-y-2.5">
            <Palette className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Component Systems</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Update variant states, configure property controls, and sync typography and color styles across your project.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b0b0e] border border-white/[0.06] hover:border-white/15 transition-all space-y-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">CMS Management</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Add new blog posts, populate team bios, or migrate existing content collections with full schema preservation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b0b0e] border border-white/[0.06] hover:border-white/15 transition-all space-y-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Branching Safety</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every agent edits on a protected branch. Test iterations freely without risk to production domains.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
