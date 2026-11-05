import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

interface SidebarProps {
  children?: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-surface/90 border-b border-border backdrop-blur-md px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-surface-hover text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm tracking-tight text-foreground">Snap2Learn AI</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
          Verified Student
        </span>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 pt-16' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="hidden lg:flex items-center gap-3 px-6 h-18 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
              <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground">Snap2Learn<span className="text-secondary ml-1">AI</span></span>
              <p className="text-[10px] text-foreground-muted font-medium">CSE-AIML Workspace</p>
            </div>
          </div>

          {/* Quick Action: Scan New Note */}
          <div className="px-4 mt-4">
            <button
              onClick={() => {
                navigate('/scanner');
                setMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-md glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>Scan New Note</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-sm glow-primary'
                        : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-secondary/20 text-secondary border border-secondary/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated">
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
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
};
