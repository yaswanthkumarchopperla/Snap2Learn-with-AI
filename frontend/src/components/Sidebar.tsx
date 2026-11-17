import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  MessageSquare,
  BookOpen,
  Award,
  Layers,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LineSidebar from './LineSidebar';
import { AutosaveIndicator } from './AutosaveIndicator';

interface SidebarProps {
  children?: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('snap2learn_theme') === 'light';
  });

  // Apply theme class to document root
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('snap2learn_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('snap2learn_theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Scan Notes', path: '/scanner', icon: Scan, badge: 'AI Vision' },
    { label: 'AI Tutor', path: '/chat', icon: MessageSquare },
    { label: 'My Notes', path: '/notes', icon: BookOpen },
    { label: 'Quiz Arena', path: '/quiz', icon: Award },
    { label: 'Flashcards', path: '/flashcards', icon: Layers },
    { label: 'Progress Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const currentActiveIndex = navItems.findIndex(item => item.path === location.pathname);

  return (
    <div className="min-h-screen flex bg-background relative overflow-x-hidden text-foreground">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[#0d1322]/95 border-b border-indigo-500/20 backdrop-blur-md px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
              Snap2Learn<span className="text-cyan-400 font-extrabold ml-0.5">AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-surface border border-border text-foreground-muted hover:text-cyan-400 transition-colors"
            title={isLightMode ? 'Switch to Midnight Dark' : 'Switch to Sunlight Mode'}
          >
            {isLightMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
          <AutosaveIndicator compact />
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
            Verified
          </span>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:w-64 bg-[#0d1322] border-r border-indigo-500/20 flex flex-col justify-between transition-transform duration-250 ease-out lg:translate-x-0 ${mobileOpen
            ? 'translate-x-0 shadow-2xl shadow-indigo-950/80'
            : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'
          }`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Mobile Drawer Top Bar with dedicated Close Button */}
          <div className="flex lg:hidden items-center justify-between px-4 h-14 border-b border-indigo-500/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white">
                  Snap2Learn<span className="text-cyan-400 ml-0.5">AI</span>
                </span>
                <p className="text-[9px] text-cyan-300/70 font-medium">CSE-AIML Workspace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Logo Brand Header */}
          <div className="hidden lg:flex items-center justify-between px-5 h-18 border-b border-indigo-500/20 shrink-0 bg-[#0a0f1c]/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)]">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white flex items-center">
                  Snap2Learn<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-1 font-extrabold">AI</span>
                </span>
                <p className="text-[10px] text-cyan-300/70 font-medium">CSE-AIML Workspace</p>
              </div>
            </div>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-surface border border-border text-foreground-muted hover:text-amber-400 transition-colors shadow-xs"
              title={isLightMode ? 'Switch to Midnight Dark' : 'Switch to Sunlight Mode'}
            >
              {isLightMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          {/* Quick Action: Scan New Note with radiant edge glow */}
          <div className="px-4 mt-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigate('/scanner');
                setMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-[0_0_18px_rgba(6,182,212,0.35)] border border-cyan-400/40 hover:border-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Scan className="w-4 h-4 text-cyan-100 animate-pulse" />
              <span>Scan New Note</span>
            </button>
          </div>

          {/* Interactive LineSidebar Navigation */}
          <div className="px-3 mt-4 flex-1 overflow-y-auto">
            <LineSidebar
              items={navItems}
              active={currentActiveIndex !== -1 ? currentActiveIndex : 0}
              accentColor="#38bdf8"
              textColor="#94a3b8"
              markerColor="#3b82f6"
              showIndex={true}
              showMarker={true}
              proximityRadius={90}
              maxShift={16}
              falloff="smooth"
              markerLength={24}
              markerGap={4}
              tickScale={0.5}
              scaleTick={true}
              itemGap={10}
              fontSize={0.82}
              smoothing={100}
              onItemClick={(index) => {
                const target = navItems[index];
                if (target) {
                  navigate(target.path);
                  setMobileOpen(false);
                }
              }}
            />
          </div>
        </div>

        {/* Autosave Sync Status Badge */}
        <div className="px-4 py-2.5 border-t border-indigo-500/20 bg-[#0a0f1c] flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 font-medium">Auto-Save Sync</span>
          <AutosaveIndicator compact={true} />
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-indigo-500/20 bg-[#0a0f1c] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                <div className="w-full h-full rounded-full bg-[#0d1322] flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
                </div>
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.displayName || 'Student'}</p>
                <p className="text-[10px] text-cyan-300/70 truncate">{user?.collegeBranch || 'CSE-AIML'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 min-h-screen flex flex-col w-full min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
