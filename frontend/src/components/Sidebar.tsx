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
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LineSidebar from './LineSidebar';

interface SidebarProps {
  children?: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="min-h-screen flex bg-background relative overflow-x-hidden">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-surface/95 border-b border-border backdrop-blur-md px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              Snap2Learn<span className="text-secondary ml-0.5">AI</span>
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
          Verified Student
        </span>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:w-64 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-250 ease-out lg:translate-x-0 ${
          mobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'
        }`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Mobile Drawer Top Bar with dedicated Close Button */}
          <div className="flex lg:hidden items-center justify-between px-4 h-14 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
                <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-secondary" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-foreground">
                  Snap2Learn<span className="text-secondary ml-0.5">AI</span>
                </span>
                <p className="text-[9px] text-foreground-muted font-medium">CSE-AIML Workspace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Logo Brand Header */}
          <div className="hidden lg:flex items-center gap-3 px-6 h-18 border-b border-border shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
              <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground">
                Snap2Learn<span className="text-secondary ml-1">AI</span>
              </span>
              <p className="text-[10px] text-foreground-muted font-medium">CSE-AIML Workspace</p>
            </div>
          </div>

          {/* Quick Action: Scan New Note */}
          <div className="px-4 mt-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigate('/scanner');
                setMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-md glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
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
              markerColor="#334155"
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

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">{user?.displayName || 'Student'}</p>
                <p className="text-[10px] text-foreground-muted truncate">{user?.collegeBranch || 'CSE-AIML'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-red-400 hover:bg-surface-hover transition-colors cursor-pointer"
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
