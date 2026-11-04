import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail, signupWithEmail, loginAsGuest, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGuestEntry = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gradient-mesh selection:bg-primary/30">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
          <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-secondary" />
          </div>
        </div>
        <div>
          <span className="font-bold text-lg text-foreground tracking-tight">Snap2Learn<span className="text-secondary ml-1">AI</span></span>
          <p className="text-[10px] text-foreground-muted">CSE-AIML Study Companion</p>
        </div>
      </Link>

      <div className="w-full max-w-md glass-card p-6 sm:p-8 border border-border">
        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-surface p-1 mb-6 border border-border">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin' ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup' ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Yashwanth Ch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">College or Student Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Student Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative px-3 bg-surface text-[10px] uppercase font-semibold text-foreground-muted tracking-wider">
            Or Quick Access
          </span>
        </div>

        {/* Guest Demo Mode Button */}
        <button
          type="button"
          onClick={handleGuestEntry}
          className="w-full py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-secondary/40 text-foreground text-xs font-semibold hover:bg-surface-hover transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>Continue as Guest (Demo Mode)</span>
        </button>
        <p className="text-[10px] text-center text-foreground-muted mt-2">
          Explore all features immediately with pre-seeded sample notes & flashcards.
        </p>
      </div>

      <p className="text-xs text-foreground-muted mt-6">
        First-Year CSE-AIML College Hackathon Project
      </p>
    </div>
  );
};
