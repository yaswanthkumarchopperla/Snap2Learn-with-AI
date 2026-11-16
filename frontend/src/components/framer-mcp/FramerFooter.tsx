import React, { useState } from 'react';
import { FramerLogo } from './FramerLogo';
import { Globe, CheckCircle2, ChevronDown } from 'lucide-react';

interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href: string;
    isNew?: boolean;
  }>;
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'AI', href: '#features' },
      { label: 'Agents', href: '#overview' },
      { label: 'MCP', href: '#overview', isNew: true },
      { label: 'Design', href: '#features' },
      { label: 'Collaborate', href: '#features' },
      { label: 'CMS', href: '#features' },
      { label: 'Hosting', href: '#features' },
      { label: 'Performance', href: '#features' },
      { label: 'Analytics', href: '#features' },
      { label: 'SEO', href: '#features' },
      { label: 'Skills', href: '#guides', isNew: true },
      { label: 'Updates', href: '#features' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'Templates', href: '#integrations' },
      { label: 'Components', href: '#integrations' },
      { label: 'Vectors', href: '#integrations' },
      { label: 'Plugins', href: '#integrations' },
      { label: 'Gallery', href: '#integrations' },
      { label: 'Hire Experts', href: '#partner' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'Switch to Framer', href: '#cta', isNew: true },
      { label: 'Enterprise', href: '#partner' },
      { label: 'Agencies', href: '#partner' },
      { label: 'Startups', href: '#partner' },
      { label: 'Pricing', href: '#cta' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Academy', href: '#guides' },
      { label: 'Desktop App', href: '#developer' },
      { label: 'Developers', href: '#developer' },
      { label: 'Guides', href: '#guides' },
      { label: 'Blog', href: '#faq' },
      { label: 'Newsletter', href: '#faq' },
      { label: 'Skills Index', href: '#features', isNew: true },
      { label: 'Community Meetups', href: '#partner' },
      { label: 'Help Center', href: '#faq' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Designers', href: '#features' },
      { label: 'Engineers', href: '#developer' },
      { label: 'Founders', href: '#features' },
      { label: 'AI Website Builder', href: '#overview' },
      { label: 'AI Design Agent', href: '#how-it-works' },
      { label: 'Landing Pages', href: '#overview' },
      { label: 'Figma to Framer', href: '#features' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'Webflow', href: '#compare' },
      { label: 'Figma', href: '#compare' },
      { label: 'WordPress', href: '#compare' },
      { label: 'Squarespace', href: '#compare' },
      { label: 'Lovable', href: '#compare' },
      { label: 'Claude Code', href: '#compare' },
      { label: 'v0', href: '#compare' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#overview', isNew: true },
      { label: 'Careers', href: '#overview' },
      { label: 'Security', href: '#overview' },
      { label: 'Brand Assets', href: '#overview' },
      { label: 'Privacy & Legal', href: '#overview' },
      { label: 'Trust Center', href: '#overview' },
    ],
  },
];

export const FramerFooter: React.FC = () => {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <footer className="relative bg-[#050507] border-t border-white/[0.08] pt-16 sm:pt-20 pb-12 overflow-hidden text-neutral-400 text-xs">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 sm:gap-10 pb-14 border-b border-white/[0.06]">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3.5">
              <h4 className="text-[13px] font-semibold text-white tracking-wide uppercase text-[11px]">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors duration-150 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                        {link.label}
                      </span>
                      {link.isNew && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-400/30 text-[9px] font-semibold text-indigo-300 uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Logo, Copyright, Status, Language */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Copyright */}
          <div className="flex flex-wrap items-center gap-4 text-neutral-500">
            <a
              href="#overview"
              className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity"
            >
              <FramerLogo className="w-5 h-5 text-white" />
              <span className="font-semibold text-sm tracking-tight">Framer</span>
            </a>
            <span className="text-neutral-600">•</span>
            <span>© 2026 Framer B.V. All rights reserved.</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <a
              href="#legal"
              className="hover:text-neutral-300 transition-colors hidden sm:inline"
            >
              CCPA Notice
            </a>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <a
              href="#privacy"
              className="hover:text-neutral-300 transition-colors hidden sm:inline"
            >
              Privacy Policy
            </a>
          </div>

          {/* Right utilities: Status Pill & Language Selector */}
          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-neutral-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-neutral-300">mcp.framer.com: operational</span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-neutral-300 hover:text-white transition-all text-[11px]"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span>English</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {langOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-36 bg-[#121217] border border-white/[0.12] rounded-xl shadow-2xl py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                  {['English (US)', 'Deutsch', 'Français', '日本語', 'Español'].map((lang, idx) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLangOpen(false)}
                      className="w-full text-left px-3 py-1.5 text-neutral-300 hover:text-white hover:bg-white/[0.06] flex items-center justify-between"
                    >
                      <span>{lang}</span>
                      {idx === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
