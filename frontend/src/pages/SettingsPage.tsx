import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  User,
  Globe2,
  Sliders,
  Moon,
  Sun,
  Trash2,
  ShieldCheck,
  Check,
  LogOut,
  Sparkles
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAutosave } from '../contexts/AutosaveContext';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { api } from '../services/api';
import { Language, ExplanationMode, Difficulty } from '../types';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { triggerAutosave } = useAutosave();

  const [displayName, setDisplayName] = useState(user?.displayName || 'First-Year Student');
  const [preferredLang, setPreferredLang] = useState<Language>('bilingual');
  const [defaultMode, setDefaultMode] = useState<ExplanationMode>('standard');
  const [defaultDifficulty, setDefaultDifficulty] = useState<Difficulty>('medium');
  const [defaultQuestions, setDefaultQuestions] = useState<number>(5);
  const [resetSuccess, setResetSuccess] = useState(false);
  const isInitialMount = useRef(true);

  // Load user preferences on mount
  useEffect(() => {
    api.getPreferences().then((prefs) => {
      if (prefs.preferred_language === 'te') {
        setPreferredLang('telugu');
      } else if (prefs.preferred_language === 'en') {
        setPreferredLang('english');
      } else {
        setPreferredLang('bilingual');
      }
      if (prefs.default_difficulty) setDefaultDifficulty(prefs.default_difficulty);
      if (prefs.default_quiz_questions) setDefaultQuestions(prefs.default_quiz_questions);
      if (prefs.study_mode === 'exam_cram') setDefaultMode('exam');
      else if (prefs.study_mode === 'deep_dive') setDefaultMode('standard');
    }).catch(() => {});
  }, []);

  // Autosave preferences on change
  const syncPreferences = (updates: {
    preferred_language?: 'en' | 'te';
    default_difficulty?: Difficulty;
    default_quiz_questions?: number;
    study_mode?: 'standard' | 'exam_cram' | 'deep_dive';
  }) => {
    triggerAutosave(async () => {
      return await api.updatePreferences(updates);
    }, {
      type: 'preferences',
      action: 'update',
      endpoint: '/api/auth/preferences',
      payload: updates
    });
  };

  const handleLanguageChange = (val: Language) => {
    setPreferredLang(val);
    const backendLang = val === 'telugu' ? 'te' : 'en';
    syncPreferences({ preferred_language: backendLang });
  };

  const handleModeChange = (val: ExplanationMode) => {
    setDefaultMode(val);
    const backendMode = val === 'exam' ? 'exam_cram' : 'standard';
    syncPreferences({ study_mode: backendMode });
  };

  const handleDifficultyChange = (val: Difficulty) => {
    setDefaultDifficulty(val);
    syncPreferences({ default_difficulty: val });
  };

  const handleQuestionsChange = (val: number) => {
    setDefaultQuestions(val);
    syncPreferences({ default_quiz_questions: val });
  };

  const handleClearLocalData = () => {
    if (window.confirm('Clear cached notes and local user state?')) {
      localStorage.clear();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-secondary" />
              <span>Workspace Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Customize your learning experience, regional languages, and account preferences.
            </p>
          </div>

          <AutosaveIndicator compact={false} />
        </div>

        {resetSuccess && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            Local data cleared. Reloading workspace...
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Student Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Academic Branch
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.collegeBranch || 'CSE-AIML (1st Year)'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface/50 border border-border text-foreground-muted text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-secondary" />
                <span>Learning & Quiz Preferences (Autosaved)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold">Changes synced automatically</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Preferred Explanation Language
                </label>
                <select
                  value={preferredLang}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                >
                  <option value="bilingual">Bilingual (English + Telugu Side-by-Side)</option>
                  <option value="english">English Only</option>
                  <option value="telugu">తెలుగు (Telugu Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Default Explanation Detail Level
                </label>
                <select
                  value={defaultMode}
                  onChange={(e) => handleModeChange(e.target.value as ExplanationMode)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                >
                  <option value="standard">Standard (Academic Rigor & Proofs)</option>
                  <option value="beginner">Beginner (Everyday Analogies)</option>
                  <option value="exam">Exam Preparation (High-scoring structured answers)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Default Quiz Difficulty
                </label>
                <select
                  value={defaultDifficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                >
                  <option value="easy">Easy (Definitions & Concept Recall)</option>
                  <option value="medium">Medium (Application & 2-Step Solving)</option>
                  <option value="hard">Hard (Multi-Step Numerical Problems)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Default Questions per Quiz
                </label>
                <select
                  value={defaultQuestions}
                  onChange={(e) => handleQuestionsChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                >
                  <option value={5}>5 Questions (Fast Sprint)</option>
                  <option value={10}>10 Questions (Standard Test)</option>
                  <option value={15}>15 Questions (Full Exam Simulation)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme & Display */}
          <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-0.5">Application Theme</h3>
              <p className="text-xs text-foreground-muted">Toggle between dark and light appearance</p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="self-stretch sm:self-auto px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-secondary" />
                  <span>Dark Mode (Active)</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode (Active)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security & Data Privacy Card */}
        <div className="glass-card p-4 sm:p-6 border-l-4 border-l-secondary space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
            <h3 className="text-sm font-bold text-foreground">Data Privacy & Security Guarantee</h3>
          </div>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Snap2Learn AI never trains foundational models on your personal study notes or exam drafts.
            API keys are strictly managed on the FastAPI backend. You can purge local session caches at any time.
          </p>

          <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClearLocalData}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Cached Local Session Data</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground-muted hover:text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};
