import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Globe2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Award,
  MessageSquare,
  Bookmark,
  Copy,
  Check,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosave } from '../contexts/AutosaveContext';
import { api } from '../services/api';
import { ExplainResponse, ExplanationMode, Language } from '../types';

export const ExplainPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerAutosave } = useAutosave();

  // Initial params passed from Scanner or previous page
  const initialText = location.state?.text ||
    'Let A be an n × n square matrix. A scalar λ is called an eigenvalue of A if there exists a non-zero column vector v such that A v = λ v. The characteristic equation is det(A - λ I) = 0.';
  const initialSubject = location.state?.subject || 'Engineering Mathematics';
  const initialTopic = location.state?.topic || 'Eigenvalues & Characteristic Equation';

  const [mode, setMode] = useState<ExplanationMode>('standard');
  const [language, setLanguage] = useState<Language>('bilingual');
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedExamAnswer, setCopiedExamAnswer] = useState(false);
  const [copiedFullNotes, setCopiedFullNotes] = useState(false);

  const handleCopyFullNotes = () => {
    if (!explanation) return;
    const content = [
      `# ${initialTopic} (${initialSubject})`,
      `\n## Core Concept Overview\n${explanation.short_summary}`,
      explanation.telugu_summary ? `\n## తెలుగు సారాంశం\n${explanation.telugu_summary}` : '',
      `\n## Step-by-Step Breakdown\n${explanation.detailed_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
      `\n## Key Definitions\n${explanation.key_definitions.map((k) => `- ${k.term}: ${k.definition}`).join('\n')}`,
      `\n## Formulas\n${explanation.formulas.map((f) => `- ${f.name}: $$${f.latex}$$ (${f.explanation})`).join('\n')}`,
      `\n## Real-Life Example\n${explanation.real_life_example}`,
      `\n## Exam Model Answer\n${explanation.exam_answer}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(content);
    setCopiedFullNotes(true);
    setTimeout(() => setCopiedFullNotes(false), 2000);
  };

  const fetchExplanation = async (selectedMode: ExplanationMode, selectedLang: Language) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.explainNotes({
        text: initialText,
        subject: initialSubject,
        topic: initialTopic,
        mode: selectedMode,
        language: selectedLang,
      });
      setExplanation(data);

      // Autosave explanation note automatically
      triggerAutosave(async () => {
        return await api.createNote({
          title: initialTopic,
          subject: initialSubject,
          topic: initialTopic,
          raw_text: initialText,
          summary: data.short_summary,
          telugu_summary: data.telugu_summary,
        });
      }, {
        type: 'note',
        action: 'create',
        endpoint: '/api/notes',
        payload: {
          title: initialTopic,
          subject: initialSubject,
          topic: initialTopic,
          raw_text: initialText,
          summary: data.short_summary,
          telugu_summary: data.telugu_summary,
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation(mode, language);
  }, []);

  const handleModeChange = (newMode: ExplanationMode) => {
    setMode(newMode);
    fetchExplanation(newMode, language);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    fetchExplanation(mode, newLang);
  };

  // Save Note to Workspace
  const handleSaveNote = async () => {
    try {
      await api.createNote({
        title: initialTopic,
        subject: initialSubject,
        topic: initialTopic,
        raw_text: initialText,
        summary: explanation?.short_summary,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  // Copy Exam Answer to Clipboard
  const handleCopyExamAnswer = () => {
    if (!explanation?.exam_answer) return;
    navigator.clipboard.writeText(explanation.exam_answer);
    setCopiedExamAnswer(true);
    setTimeout(() => setCopiedExamAnswer(false), 2000);
  };

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Top Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                {initialSubject}
              </span>
              <span className="text-xs text-foreground-muted">{initialTopic}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AI Explanation Engine
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <AutosaveIndicator compact={false} />
            <button
              onClick={handleCopyFullNotes}
              className="px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              {copiedFullNotes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-secondary" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveNote}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                savedSuccess
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-surface border-border hover:bg-surface-hover text-foreground'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved to Notes!' : 'Save Note'}</span>
            </button>

            <button
              onClick={() =>
                navigate('/chat', {
                  state: {
                    studyContext: initialText,
                    subject: initialSubject,
                    topic: initialTopic,
                  },
                })
              }
              className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border hover:border-secondary/40 text-foreground text-xs font-semibold hover:bg-surface-hover transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-secondary" />
              <span>Chat With Tutor</span>
            </button>

            <button
              onClick={() =>
                navigate('/quiz', {
                  state: {
                    text: initialText,
                    subject: initialSubject,
                    topic: initialTopic,
                  },
                })
              }
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>

        {/* Mode & Language Controls Toolbar */}
        <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Explanation Mode Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Sliders className="w-4 h-4 text-foreground-muted shrink-0" />
            <span className="text-xs font-semibold text-foreground-muted">Mode:</span>
            <div className="flex rounded-xl bg-surface p-1 border border-border text-xs w-full sm:w-auto">
              {(['beginner', 'standard', 'exam'] as ExplanationMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                    mode === m
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {m === 'exam' ? 'Exam Prep' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Globe2 className="w-4 h-4 text-secondary shrink-0" />
            <span className="text-xs font-semibold text-foreground-muted">Language:</span>
            <div className="flex rounded-xl bg-surface p-1 border border-border text-xs w-full sm:w-auto">
              {(
                [
                  { id: 'english', label: 'English' },
                  { id: 'bilingual', label: 'Bilingual (En + Te)' },
                  { id: 'telugu', label: 'తెలుగు (Telugu)' },
                ] as const
              ).map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLanguageChange(l.id)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-all ${
                    language === l.id
                      ? 'bg-secondary text-black font-bold shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
            <p className="text-sm font-semibold text-foreground">
              Generating tailored explanation in {language} for {mode} mode...
            </p>
            <p className="text-xs text-foreground-muted">Formatting formulas and semester exam responses</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Explanation Content Panels */}
        {!loading && explanation && (
          <div className="space-y-6">
            {/* 1. Core Summary Card */}
            <div className="glass-card p-6 border-l-4 border-l-secondary">
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                Core Concept Overview
              </span>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                <MathRenderer content={explanation.short_summary} />
              </p>

              {/* Telugu summary if bilingual/telugu */}
              {explanation.telugu_summary && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                    తెలుగు ముఖ్య సారాంశం (Telugu Key Takeaway)
                  </span>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    <MathRenderer content={explanation.telugu_summary} />
                  </p>
                </div>
              )}
            </div>

            {/* 2. Step-by-Step Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Step-by-Step Mathematical & Conceptual Breakdown</span>
              </h3>
              <div className="space-y-3">
                {explanation.detailed_steps.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-xs sm:text-sm text-foreground-muted leading-relaxed flex-1">
                      <MathRenderer content={step} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Key Definitions & Formulas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Definitions */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Important Terminology & Definitions</span>
                </h3>
                <div className="space-y-3">
                  {explanation.key_definitions.map((def, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface border border-border">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-secondary">{def.term}</span>
                        {def.telugu_translation && (
                          <span className="text-[10px] text-foreground-muted font-medium bg-surface-elevated px-2 py-0.5 rounded-md">
                            {def.telugu_translation}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        <MathRenderer content={def.definition} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Formulas */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Key Formulas & Equations</span>
                </h3>
                <div className="space-y-3">
                  {explanation.formulas.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border">
                      <span className="font-semibold text-xs text-foreground block mb-1.5">{item.name}</span>
                      <div className="p-2.5 rounded-lg bg-black/40 border border-border text-center text-xs text-secondary my-1.5 overflow-x-auto">
                        <MathRenderer content={item.latex} block />
                      </div>
                      <div className="text-[11px] text-foreground-muted mt-1.5 leading-relaxed">
                        <MathRenderer content={item.explanation} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Real Life Engineering Example & Common Mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real World Example */}
              <div className="glass-card p-6 border-l-4 border-l-amber-400">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Real-Life Engineering Application</span>
                </h3>
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  <MathRenderer content={explanation.real_life_example} />
                </p>
              </div>

              {/* Common Pitfalls & Corrections */}
              <div className="glass-card p-6 border-l-4 border-l-red-400">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Common Student Mistakes to Avoid</span>
                </h3>
                <div className="space-y-3 mt-3">
                  {explanation.common_mistakes.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1.5">
                      <div className="text-red-400 font-medium line-through flex items-start gap-1.5">
                        <span className="shrink-0">✗</span>
                        <div className="flex-1">
                          <MathRenderer content={m.mistake} />
                        </div>
                      </div>
                      <div className="text-emerald-400 font-medium flex items-start gap-1.5">
                        <span className="shrink-0">✓</span>
                        <div className="flex-1">
                          <MathRenderer content={m.correction} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Exam-Ready University Answer */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">
                    Model University Semester Exam Answer
                  </h3>
                </div>
                <button
                  onClick={handleCopyExamAnswer}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedExamAnswer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExamAnswer ? 'Copied!' : 'Copy Answer'}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border text-xs sm:text-sm text-foreground leading-relaxed">
                <MathRenderer content={explanation.exam_answer} />
              </div>
            </div>

            {/* Bottom Navigation CTAs */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-secondary/10 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-foreground">Ready to test your knowledge?</h4>
                <p className="text-xs text-foreground-muted">Generate a 5, 10, or 15 question quiz directly from this material.</p>
              </div>
              <button
                onClick={() =>
                  navigate('/quiz', {
                    state: {
                      text: initialText,
                      subject: initialSubject,
                      topic: initialTopic,
                    },
                  })
                }
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow-md glow-primary hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Launch Quiz Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
