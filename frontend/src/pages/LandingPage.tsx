import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  BrainCircuit,
  MessageSquare,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe2,
  Clock,
  Code2,
  Copy,
  Check,
  Menu,
  X,
  RotateCw
} from 'lucide-react';
import { MathRenderer } from '../components/MathRenderer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Interactive Live Demo states (Fulfills user request: "give me the demo to see how it works")
  const [demoMode, setDemoMode] = useState<'flashcard' | 'ocr' | 'bilingual' | 'quiz'>('flashcard');
  const [demoFlashcardFlipped, setDemoFlashcardFlipped] = useState(false);
  const [demoQuizSelected, setDemoQuizSelected] = useState<number | null>(null);
  const [demoTeluguActive, setDemoTeluguActive] = useState(false);
  const [demoRatingClicked, setDemoRatingClicked] = useState<string | null>(null);

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText('https://api.snap2learn.ai/v1');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Snap Note or Textbook Page',
      badge: 'Multimodal Vision',
      desc: 'Capture handwritten derivations, lecture whiteboards, or textbook equations with your mobile or laptop camera.',
      sampleInput: 'Handwritten: "det(A - λI) = 0 for eigenvalues of matrix A"',
      code: 'POST /api/scan { file: "lecture_notes_eigenvalues.jpg" }',
    },
    {
      step: '02',
      title: 'Formula-Aware OCR Extraction',
      badge: 'LaTeX Preserved',
      desc: 'Gemini Vision extracts dense mathematical notations, subscripts, matrices, and code blocks with 99.4% syntax fidelity.',
      sampleInput: 'Extracted: A v = λ v \\implies (A - λ I) v = 0',
      code: 'STATUS 200 OK: LaTeX syntax verified and formatted',
    },
    {
      step: '03',
      title: 'Bilingual AI Explanation',
      badge: 'English + Telugu',
      desc: 'Receive structured concept breakdowns: core definitions, step-by-step proofs, common pitfalls, and Telugu vernacular notes.',
      sampleInput: 'ఐగన్‌విలువలు: మ్యాట్రిక్స్ ద్వారా వెక్టార్ దిశ మారకుండా స్కేల్ అయ్యే గుణకం.',
      code: 'GENERATED: Simple Notes, Detailed Proof, Telugu Explanation',
    },
    {
      step: '04',
      title: 'Practice Quiz Arena',
      badge: 'Deterministic Scoring',
      desc: 'Test your understanding with timer-controlled multiple choice questions. The timer starts strictly when questions render.',
      sampleInput: 'MCQ: If λ is an eigenvalue of A, what is the eigenvalue of A²? Ans: λ²',
      code: 'QUIZ: 5 Questions (Medium) • Timer: 7m 00s (Deterministic)',
    },
    {
      step: '05',
      title: 'Spaced-Repetition Flashcards',
      badge: 'SM-2 & Autosave',
      desc: 'Automated flashcard decks for active recall with cloud autosave and offline synchronization across devices.',
      sampleInput: 'Front: State Cayley-Hamilton theorem. Back: Every square matrix satisfies its own characteristic equation.',
      code: 'AUTOSAVE: Synced to MongoDB Atlas • Status: Online',
    },
  ];

  const features = [
    {
      icon: Camera,
      title: 'Multimodal Note Scanner',
      desc: 'Upload photos of handwritten notebooks or textbook exercises. Preserves complex LaTeX equations and matrix formatting.',
      edgeClass: 'border-2 border-cyan-500/40 shadow-[0_0_22px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]',
      iconBox: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
      badge: 'Cyan Edge Glow',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    },
    {
      icon: Globe2,
      title: 'English & Telugu Explanations',
      desc: 'Switch effortlessly between English academic explanations and native Telugu conceptual translations for maximum clarity.',
      edgeClass: 'border-2 border-purple-500/40 shadow-[0_0_22px_rgba(168,85,247,0.2)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
      iconBox: 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
      badge: 'Purple Edge Glow',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    {
      icon: Award,
      title: 'Deterministic Quiz Arena',
      desc: 'Configurable 5 or 10-question tests with Easy, Medium, and Hard tiers. Guaranteed fair countdown timers starting only upon question render.',
      edgeClass: 'border-2 border-amber-500/40 shadow-[0_0_22px_rgba(245,158,11,0.2)] hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]',
      iconBox: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
      badge: 'Amber Edge Glow',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    {
      icon: Layers,
      title: 'Smart Spaced Flashcards',
      desc: 'Active recall decks with Again, Hard, Good, and Easy ratings. Real-time background autosave and offline sync support.',
      edgeClass: 'border-2 border-emerald-500/40 shadow-[0_0_22px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
      iconBox: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      badge: 'Emerald Edge Glow',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      icon: MessageSquare,
      title: 'Contextual AI Study Tutor',
      desc: 'Interactive chat assistant grounded in your uploaded notes. Ask follow-up questions, request counter-examples, or debug code.',
      edgeClass: 'border-2 border-indigo-500/40 shadow-[0_0_22px_rgba(99,102,241,0.2)] hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]',
      iconBox: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]',
      badge: 'Indigo Edge Glow',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
    },
    {
      icon: BarChart3,
      title: 'Weak-Topic Progress Analytics',
      desc: 'Automated mastery breakdown identifying your weak engineering areas so you can focus revision where it matters most.',
      edgeClass: 'border-2 border-rose-500/40 shadow-[0_0_22px_rgba(244,63,94,0.2)] hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]',
      iconBox: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
      badge: 'Rose Edge Glow',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    },
  ];

  const faqs = [
    {
      q: 'How does the camera scan preserve complex mathematical formulas?',
      a: 'Snap2Learn AI uses Gemini 2.5 Pro Vision combined with specialized LaTeX formatting prompts. It recognizes mathematical notation, matrices, summations, integrals, and Greek symbols, outputting clean KaTeX-ready math markup directly.',
    },
    {
      q: 'Why does the quiz timer only start when questions appear?',
      a: 'We believe student testing must be fair. Because AI question generation takes a few seconds, our countdown timer remains strictly paused during generation and only activates once Question 1 is fully rendered on your screen.',
    },
    {
      q: 'How does the Telugu bilingual explanation work?',
      a: 'Alongside rigorous English explanations, our models generate natural Telugu translations explaining the intuition and engineering concepts in relatable terms, helping engineering students grasp difficult abstract proofs faster.',
    },
    {
      q: 'Does Snap2Learn AI save my flashcards and quizzes if I go offline?',
      a: 'Yes! Snap2Learn AI includes an offline sync engine. If you lose internet connectivity during revision, changes are buffered in IndexedDB and automatically synchronized to MongoDB Atlas the moment your device reconnects.',
    },
    {
      q: 'Can I use this for engineering mathematics and computer science subjects?',
      a: 'Absolutely. Snap2Learn AI is engineered specifically for CSE, AIML, and engineering coursework, including Linear Algebra, Calculus, Machine Learning, Operating Systems, Data Structures, and Digital Electronics.',
    },
    {
      q: 'Is my uploaded study data private and secure?',
      a: 'Yes. All uploads and generated notes are tied to your personal student workspace protected by JWT authentication and secure session tokens.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-cyan-500/30 selection:text-white">
      {/* ---------------- NAVIGATION BAR ---------------- */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-black/90 backdrop-blur-md border-b border-white/10 transition-all shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center">
                Snap2Learn<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-extrabold ml-1">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 hidden sm:inline shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                v2.5 Pro
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-300">
            <a href="#demo" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Live Demo</span>
            </a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#subjects" className="hover:text-white transition-colors">Subjects</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-xs font-medium text-cyan-200 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_18px_rgba(6,182,212,0.35)] border border-cyan-400/40 transition-all cursor-pointer active:scale-95"
            >
              Launch Workspace
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-black border border-white/20 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-cyan-300 font-semibold py-1.5"
            >
              ⚡ Live Demo
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-300 py-1.5"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-300 py-1.5"
            >
              How It Works
            </a>
            <a
              href="#subjects"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-300 py-1.5"
            >
              Subjects
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-300 py-1.5"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-indigo-500/20 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md"
              >
                Launch Workspace
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="relative pt-24 sm:pt-32">
        {/* ---------------- HERO SECTION ---------------- */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8 pb-16">
          {/* Ambient Radial Color Meshes (Eye-Comfort & Lively Colors) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-indigo-500/15 to-purple-500/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-40 left-1/4 w-[350px] h-[250px] bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />
          <div className="absolute top-40 right-1/4 w-[350px] h-[250px] bg-purple-500/10 blur-[90px] pointer-events-none rounded-full" />

          {/* Glowing Gradient Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 text-xs text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer group">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-100">AI Vision OCR • Telugu & English Tutor • Auto-Save Sync</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>

          {/* Hero Headline with Radiant Colors */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Turn Handwritten Notes into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 font-extrabold drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Exam Mastery
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
            Snap photos of complex lecture derivations, textbook formulas, or engineering proofs. Snap2Learn AI extracts LaTeX math, delivers English & Telugu explanations, and generates targeted quizzes with deterministic timers.
          </p>

          {/* Hero Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(6,182,212,0.4)] border border-cyan-400/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-100" />
              <span>Start Scanning Free</span>
            </button>
            <a
              href="#demo"
              className="px-5 py-3 rounded-xl bg-black hover:bg-white/5 border border-cyan-400/30 text-cyan-200 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Try Live Interactive Demo Below</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>

          {/* ============================================================= */}
          {/* LIVE INTERACTIVE DEMO (User Core Requirement)                */}
          {/* ============================================================= */}
          <div id="demo" className="pt-12 max-w-5xl mx-auto scroll-mt-24">
            <div className="p-1 rounded-3xl bg-gradient-to-r from-cyan-500/40 via-indigo-500/40 to-purple-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)]">
              <div className="rounded-[22px] bg-[#060609] p-5 sm:p-7 space-y-6 text-left">
                {/* Demo Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                      ⚡ Interactive Demo
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      Experience Colored Edge Highlighters & AI Features
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                      ● Live Interactive
                    </span>
                  </div>
                </div>

                {/* 4 Feature Tabs with Colored Edge Highlighters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDemoMode('flashcard')}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      demoMode === 'flashcard'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'border-indigo-500/20 bg-surface text-neutral-400 hover:text-white hover:border-emerald-500/40'
                    }`}
                  >
                    <Layers className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-xs font-bold block">Smart Flashcard</span>
                    <span className="text-[10px] text-emerald-300/80">Emerald Edge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoMode('ocr')}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      demoMode === 'ocr'
                        ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                        : 'border-indigo-500/20 bg-surface text-neutral-400 hover:text-white hover:border-cyan-500/40'
                    }`}
                  >
                    <Camera className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <span className="text-xs font-bold block">Vision OCR</span>
                    <span className="text-[10px] text-cyan-300/80">Cyan Edge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoMode('bilingual')}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      demoMode === 'bilingual'
                        ? 'border-purple-400 bg-purple-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                        : 'border-indigo-500/20 bg-surface text-neutral-400 hover:text-white hover:border-purple-500/40'
                    }`}
                  >
                    <Globe2 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    <span className="text-xs font-bold block">Telugu & English</span>
                    <span className="text-[10px] text-purple-300/80">Purple Edge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoMode('quiz')}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      demoMode === 'quiz'
                        ? 'border-amber-400 bg-amber-500/20 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                        : 'border-indigo-500/20 bg-surface text-neutral-400 hover:text-white hover:border-amber-500/40'
                    }`}
                  >
                    <Award className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs font-bold block">Quiz Arena</span>
                    <span className="text-[10px] text-amber-300/80">Amber Edge</span>
                  </button>
                </div>

                {/* DEMO DISPLAY PANEL: Changes dynamically based on selected tab */}
                <div className="space-y-4">
                  {/* TAB 1: Smart Flashcard Demo (Emerald Edge Highlighter) */}
                  {demoMode === 'flashcard' && (
                    <div className="space-y-3">
                      <div
                        onClick={() => setDemoFlashcardFlipped(!demoFlashcardFlipped)}
                        className={`cursor-pointer rounded-2xl p-6 sm:p-8 border-2 transition-all duration-300 shadow-xl ${
                          !demoFlashcardFlipped
                            ? 'border-emerald-400/60 bg-black shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:border-emerald-300'
                            : 'border-purple-400/60 bg-black shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Engineering Mathematics • Linear Algebra
                          </span>
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
                            <span>Click to Flip Card</span>
                          </span>
                        </div>

                        <div className="py-6 text-center">
                          {!demoFlashcardFlipped ? (
                            <div>
                              <span className="text-[11px] font-mono text-emerald-400 font-bold block mb-2">PROMPT / QUESTION</span>
                              <h4 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                                What is the characteristic equation used to find the eigenvalues of an n×n matrix A?
                              </h4>
                              <p className="text-xs text-neutral-400 mt-3 font-mono">Tap this card to reveal the formula proof</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[11px] font-mono text-purple-400 font-bold block mb-2">ANSWER & FORMULA</span>
                              <div className="p-3 rounded-xl bg-black border border-purple-500/40 inline-block text-white text-base font-mono mb-3 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                                <MathRenderer content={"\\det(A - \\lambda I) = 0"} block />
                              </div>
                              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                                The non-trivial solution requires matrix <MathRenderer content={"(A - \\lambda I)"} /> to be singular, making its determinant zero.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-center text-[10px] text-cyan-200/60 pt-2 border-t border-white/10">
                          {demoFlashcardFlipped ? 'Card flipped! Try rating your recall below' : '👈 Click card to flip'}
                        </div>
                      </div>

                      {/* Demo Rating Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-neutral-400 font-medium mr-2">Try Recall Rating:</span>
                        <button
                          type="button"
                          onClick={() => setDemoRatingClicked('Hard (Review Soon)')}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)] hover:bg-rose-500/25 transition-all"
                        >
                          Hard
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoRatingClicked('Medium (Retained)')}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:bg-amber-500/25 transition-all"
                        >
                          Medium
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoRatingClicked('Easy (Mastered! Continuous Auto-Save Triggered)')}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:bg-emerald-500/25 transition-all"
                        >
                          Easy
                        </button>
                      </div>

                      {demoRatingClicked && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-semibold animate-in fade-in">
                          ✓ Auto-Saved: {demoRatingClicked}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Vision OCR Demo (Cyan Edge Highlighter) */}
                  {demoMode === 'ocr' && (
                    <div className="p-6 rounded-2xl bg-black border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          Multimodal Vision • LaTeX Formula Extraction
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">Confidence: 99.4%</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#060609] border border-cyan-500/25 space-y-2">
                          <span className="text-[10px] font-mono uppercase text-cyan-400">Sample Handwritten Input:</span>
                          <p className="text-xs font-mono text-neutral-300">
                            "Cayley-Hamilton Theorem: Every square matrix A satisfies its own characteristic equation p(A) = 0."
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#060609] border border-cyan-500/25 space-y-2">
                          <span className="text-[10px] font-mono uppercase text-cyan-400">Extracted KaTeX Formulation:</span>
                          <div className="text-center py-1 text-white">
                            <MathRenderer content={"p(\\lambda) = \\det(\\lambda I - A) = 0 \\implies p(A) = 0"} block />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300">
                        Gemini 2.5 Pro Multimodal Vision accurately parses handwritten math symbols, superscripts, subscripts, and Greek notations.
                      </p>
                    </div>
                  )}

                  {/* TAB 3: Bilingual Telugu & English Demo (Purple Edge Highlighter) */}
                  {demoMode === 'bilingual' && (
                    <div className="p-6 rounded-2xl bg-black border-2 border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.25)] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          Bilingual Conceptual Tutor
                        </span>
                        <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-purple-500/30">
                          <button
                            type="button"
                            onClick={() => setDemoTeluguActive(false)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              !demoTeluguActive ? 'bg-purple-500 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            onClick={() => setDemoTeluguActive(true)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              demoTeluguActive ? 'bg-purple-500 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            తెలుగు (Telugu)
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#060609] border border-purple-500/25 space-y-2">
                        {!demoTeluguActive ? (
                          <div>
                            <h4 className="text-xs font-bold text-white mb-1">Eigenvalue Concept (English):</h4>
                            <p className="text-xs text-neutral-200 leading-relaxed">
                              An eigenvalue represents the factor by which an eigenvector is scaled along its axis during a linear matrix transformation without altering its directional line.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-xs font-bold text-purple-300 mb-1">ఐగన్‌విలువ భావన (Telugu Intuition):</h4>
                            <p className="text-xs text-purple-100 leading-relaxed font-sans">
                              మ్యాట్రిక్స్ ద్వారా వెక్టార్‌పై రూపాంతరం (Transformation) జరిగినప్పుడు, దాని దిశ (Direction) మారకుండా పొడవు ఎంత శాతం స్కేల్ అవుతుందో తెలిపే విలువనే ఐగన్‌విలువ అంటారు.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Quiz Arena Demo (Amber Edge Highlighter) */}
                  {demoMode === 'quiz' && (
                    <div className="p-6 rounded-2xl bg-black border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Interactive MCQ Practice Arena
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          ⏱ Deterministic Timer: 02:35
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        If λ is an eigenvalue of square matrix A, what is the corresponding eigenvalue of matrix A²?
                      </h4>

                      <div className="space-y-2">
                        {[
                          { id: 0, text: 'λ', isCorrect: false },
                          { id: 1, text: 'λ²', isCorrect: true },
                          { id: 2, text: '2λ', isCorrect: false },
                          { id: 3, text: '1 / λ', isCorrect: false },
                        ].map((choice) => {
                          const isSelected = demoQuizSelected === choice.id;
                          return (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => setDemoQuizSelected(choice.id)}
                              className={`w-full p-3 rounded-xl border text-left transition-all text-xs font-semibold cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? choice.isCorrect
                                    ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'bg-rose-500/20 border-2 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                  : 'bg-surface border-indigo-500/20 text-neutral-300 hover:border-amber-400/50 hover:text-white'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + choice.id)}. {choice.text}</span>
                              {isSelected && (
                                <span className="text-[11px] font-bold">
                                  {choice.isCorrect ? '✓ Correct! EXCELLENT' : '✗ Incorrect (Review Rule)'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {demoQuizSelected !== null && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                          💡 <strong>Proof:</strong> Since <MathRenderer content={"A v = \\lambda v"} />, multiplying by A gives <MathRenderer content={"A^2 v = A (\\lambda v) = \\lambda (A v) = \\lambda^2 v"} />. Hence the eigenvalue is <MathRenderer content={"\\lambda^2"} />.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CORE CAPABILITIES GRID (With Distinct Colored Edge Highlighters) ---------------- */}
        <section id="features" className="py-24 border-t border-indigo-500/20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs font-mono text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <span>Features & Tooling</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Designed for Engineering Clarity
              </h2>
              <p className="text-xs sm:text-sm text-cyan-200/70">
                Every feature is framed with distinct colored edge highlighters for fast visual recognition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className={`p-6 rounded-2xl bg-[#060609] transition-all space-y-3 group ${feat.edgeClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${feat.iconBox}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- 5-STEP WORKFLOW SECTION ---------------- */}
        <section id="workflow" className="py-24 border-t border-white/[0.08] relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
                <span>The Learning Loop</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How Snap2Learn AI Works
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                From handwritten notebook to exam mastery in five continuous stages.
              </p>
            </div>

            {/* Step navigation tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {workflowSteps.map((step, idx) => (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeWorkflowStep === idx
                      ? 'bg-white/[0.08] border-indigo-400/50 text-white shadow-lg'
                      : 'bg-black border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="font-mono text-xs text-indigo-400 block mb-1">{step.step}</span>
                  <p className="text-xs font-bold truncate">{step.title}</p>
                </button>
              ))}
            </div>

            {/* Active Step Showcase Card */}
            <div className="rounded-2xl bg-[#060609] border border-white/[0.08] p-6 sm:p-8 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-indigo-400">Step {workflowSteps[activeWorkflowStep].step}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                      {workflowSteps[activeWorkflowStep].badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {workflowSteps[activeWorkflowStep].title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="self-start sm:self-auto px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold cursor-pointer shadow-md"
                >
                  Try In App
                </button>
              </div>

              <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
                {workflowSteps[activeWorkflowStep].desc}
              </p>

              {/* Code / Input Box */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] space-y-2">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">Demonstration:</span>
                <p className="text-xs text-neutral-200 font-mono">
                  {workflowSteps[activeWorkflowStep].sampleInput}
                </p>
                <div className="pt-1 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{workflowSteps[activeWorkflowStep].code}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SUBJECTS COVERED ---------------- */}
        <section id="subjects" className="py-24 border-t border-indigo-500/20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs font-mono text-cyan-300">
                <span>Curriculum</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Trained Across Core Engineering Disciplines
              </h2>
              <p className="text-xs sm:text-sm text-cyan-200/70">
                Recognizes university-level proofs, equations, diagrams, and programming syntax.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'Linear Algebra', tag: 'Eigenvalues & Inverses', border: 'border-cyan-500/30 hover:border-cyan-400' },
                { name: 'Multivariate Calculus', tag: 'Gradients & Integrals', border: 'border-purple-500/30 hover:border-purple-400' },
                { name: 'Machine Learning', tag: 'Backprop & CNNs', border: 'border-emerald-500/30 hover:border-emerald-400' },
                { name: 'Operating Systems', tag: 'Deadlocks & Semaphores', border: 'border-amber-500/30 hover:border-amber-400' },
                { name: 'Data Structures', tag: 'Trees, Graphs, DP', border: 'border-indigo-500/30 hover:border-indigo-400' },
                { name: 'Digital Electronics', tag: 'K-Maps & Logic Gates', border: 'border-rose-500/30 hover:border-rose-400' },
              ].map((subj) => (
                <div
                  key={subj.name}
                  className={`p-4 rounded-xl bg-[#060609] border transition-all text-center space-y-1 shadow-md hover:shadow-lg ${subj.border}`}
                >
                  <p className="text-xs font-bold text-white">{subj.name}</p>
                  <p className="text-[10px] text-cyan-300/70 font-mono">{subj.tag}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FREQUENTLY ASKED QUESTIONS ---------------- */}
        <section id="faq" className="py-24 border-t border-white/[0.08] relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
                <span>Got Questions?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Learn how Snap2Learn AI powers reliable engineering exam preparation.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#060609] border border-white/[0.08] overflow-hidden transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-white/[0.04] pt-3 animate-in fade-in duration-150">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- FINAL CALL TO ACTION ---------------- */}
        <section className="py-24 border-t border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Ready to Master Your Engineering Exams?
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Create your free student account today. Scan notes, get instant bilingual explanations, and practice deterministic quizzes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Free Student Workspace</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- COMPREHENSIVE FOOTER ---------------- */}
      <footer className="relative bg-black border-t border-white/10 pt-14 pb-10 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-white/[0.06]">
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#features" className="hover:text-white transition-colors">Smart Note Scanner</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Bilingual AI Explainer</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Quiz Arena</a></li>
                <li><a href="#flashcards" className="hover:text-white transition-colors">Smart Flashcards</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider">Curriculum</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><span className="text-neutral-400">Engineering Mathematics</span></li>
                <li><span className="text-neutral-400">Machine Learning & AI</span></li>
                <li><span className="text-neutral-400">Operating Systems</span></li>
                <li><span className="text-neutral-400">Computer Networks</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider">Reliability</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><span className="text-neutral-400">Deterministic Quiz Timer</span></li>
                <li><span className="text-neutral-400">Formula-Preserving OCR</span></li>
                <li><span className="text-neutral-400">Offline Sync Protocol</span></li>
                <li><span className="text-neutral-400">MongoDB Atlas Storage</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><button type="button" onClick={() => navigate('/auth')} className="hover:text-white transition-colors cursor-pointer">Student Login</button></li>
                <li><button type="button" onClick={() => navigate('/auth')} className="hover:text-white transition-colors cursor-pointer">Create Account</button></li>
                <li><button type="button" onClick={() => navigate('/reset-password')} className="hover:text-white transition-colors cursor-pointer">Reset Password</button></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Student Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-white/[0.08] flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="font-semibold text-white text-xs">Snap2Learn AI</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-500 text-[11px]">© 2026 Snap2Learn AI. All rights reserved.</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-neutral-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-neutral-400">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
