import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Search, Terminal } from 'lucide-react';
import { FramerLogo } from './FramerLogo';

interface FramerNavbarProps {
  onOpenQuickConnect?: () => void;
}

export const FramerNavbar: React.FC<FramerNavbarProps> = ({ onOpenQuickConnect }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Setup', href: '#setup' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Developer', href: '#dev-experience' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-black/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl'
          : 'bg-black/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <a
            href="#overview"
            onClick={(e) => handleNavClick(e, '#overview')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-105">
              <FramerLogo className="w-4 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight group-hover:text-white transition-colors">
              Framer
            </span>
          </a>

          <div className="h-4 w-[1px] bg-white/15 mx-0.5" />

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-mono text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>MCP</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-400">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-white transition-colors duration-150 tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://mcp.framer.com/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <span>Docs</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500" />
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {onOpenQuickConnect && (
            <button
              onClick={onOpenQuickConnect}
              type="button"
              className="p-1.5 px-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy server URL"
            >
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span>mcp.framer.com</span>
            </button>
          )}

          <button
            onClick={() => navigate('/auth')}
            type="button"
            className="text-xs font-medium text-neutral-300 hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            Log in
          </button>

          <button
            onClick={() => navigate('/auth')}
            type="button"
            className="text-xs font-medium bg-white text-black hover:bg-neutral-200 px-4 py-1.5 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
          >
            Sign up
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white bg-white/[0.05] border border-white/10 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-black/95 border-b border-white/[0.1] px-5 py-6 space-y-4 animate-in fade-in slide-in-from-top-3 backdrop-blur-2xl">
          <div className="flex flex-col space-y-3 pb-4 border-b border-white/[0.08]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://mcp.framer.com/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-neutral-400 hover:text-white transition-colors flex items-center justify-between py-1"
            >
              <span>Server Docs</span>
              <ArrowUpRight className="w-4 h-4 text-neutral-500" />
            </a>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenQuickConnect) onOpenQuickConnect();
              }}
              className="w-full py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-200 text-xs font-mono text-center"
            >
              Copy MCP Server URL
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/auth');
              }}
              className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs text-center"
            >
              Sign up / Log in
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
