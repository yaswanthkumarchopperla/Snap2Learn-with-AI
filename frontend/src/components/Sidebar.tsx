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
import { AutosaveIndicator } from './AutosaveIndicator';
import { ThemeSelector } from './ThemeSelector';

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
    <div className="min-h-screen flex bg-[#0e131f] relative overflow-x-hidden text-white">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[#0e131f]/95 border-b border-white/10 backdrop-blur-md px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#141a27] border border-white/10 hover:bg-[#1b2337] text-white transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
              Snap2Learn<span className="text-[#ff6b35] font-extrabold ml-0.5">AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector compact={true} />
          <AutosaveIndicator compact />
          <span className="px-2 py-0.5 rounded-full bg-[#ff6b35]/15 text-[#ff6b35] text-[10px] font-semibold border border-[#ff6b35]/30 shadow-[0_0_8px_rgba(255,107,53,0.25)]">
            Verified
          </span>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:w-64 bg-[#0e131f] border-r border-[#1e2638] flex flex-col justify-between transition-transform duration-250 ease-out lg:translate-x-0 ${mobileOpen
            ? 'translate-x-0 shadow-2xl shadow-black'
            : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'
          }`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Mobile Drawer Top Bar with dedicated Close Button */}
          <div className="flex lg:hidden items-center justify-between px-4 h-14 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff6b35] to-[#38bdf8] border border-[#ff6b35]/40 flex items-center justify-center shadow-[0_0_12px_rgba(255,107,53,0.35)]">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white">
                  Snap2Learn<span className="text-[#ff6b35] ml-0.5">AI</span>
                </span>
                <p className="text-[9px] text-[#94a3b8] font-medium">Aditya Maya • CSE-AIML</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Logo Brand Header */}
          <div className="hidden lg:flex items-center justify-between px-5 h-18 border-b border-[#1e2638] shrink-0 bg-[#0e131f]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff6b35] to-[#38bdf8] border border-[#ff6b35]/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,107,53,0.35)]">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white flex items-center">
                  Snap2Learn<span className="text-[#ff6b35] ml-1 font-extrabold">AI</span>
                </span>
                <p className="text-[10px] text-[#94a3b8] font-medium">Aditya Maya • CSE-AIML</p>
              </div>
            </div>
            <ThemeSelector compact={true} />
          </div>

          {/* Quick Action: Scan New Note with vibrant orange pill styling */}
          <div className="px-4 mt-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigate('/scanner');
                setMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f95721] hover:from-[#ff7a45] hover:to-[#fa622f] text-white text-xs font-bold shadow-[0_0_18px_rgba(255,107,53,0.35)] border border-[#ff6b35]/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>Scan New Note</span>
            </button>
          </div>

          {/* Interactive LineSidebar Navigation */}
          <div className="px-3 mt-4 flex-1 overflow-y-auto">
            <LineSidebar
              items={navItems}
              active={currentActiveIndex !== -1 ? currentActiveIndex : 0}
              accentColor="#ff6b35"
              textColor="#D1D5DB"
              markerColor="#ff6b35"
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

        {/* Theme Selector Widget in Sidebar */}
        <div className="px-4 py-2 border-t border-[#1e2638] bg-[#0e131f]">
          <ThemeSelector compact={false} />
        </div>

        {/* Autosave Sync Status Badge */}
        <div className="px-4 py-2.5 border-t border-[#1e2638] bg-[#0e131f] flex items-center justify-between">
          <span className="text-[10px] text-[#94a3b8] font-medium">Maya Cloud Sync</span>
          <AutosaveIndicator compact={true} />
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-[#1e2638] bg-[#0e131f] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff6b35] via-[#38bdf8] to-[#8b5cf6] p-[2px] shrink-0 shadow-[0_0_12px_rgba(255,107,53,0.35)]">
                <div className="w-full h-full rounded-full bg-[#141a27] flex items-center justify-center text-white font-bold text-xs">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'Y'}
                </div>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.displayName || 'CHOPPERLA YASWANTH KUMAR RAJU'}</p>
                <p className="text-[10px] text-[#94a3b8] font-mono truncate">{user?.collegeBranch || '26811AI216 • CSE (AI & ML)'}</p>
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
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#0e131f] flex flex-col w-full min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
