import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, Sun, Moon, User, ArrowRight, Scan } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/auth';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md glow-primary group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
              <div className="relative">
                <BookOpen className="w-5 h-5 text-secondary" />
                <Sparkles className="w-2.5 h-2.5 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Snap2Learn<span className="text-secondary ml-1">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-foreground-muted tracking-wider uppercase font-semibold">
              CSE-AIML Study Companion
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (visible when on landing) */}
        {location.pathname === '/' && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground-muted">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#bilingual" className="hover:text-foreground transition-colors">English & Telugu</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Scanner Action */}
          <Link
            to="/scanner"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-secondary/40 bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-colors"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Note</span>
          </Link>

          {/* User Status / Action */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          ) : !isAuthPage ? (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
};
