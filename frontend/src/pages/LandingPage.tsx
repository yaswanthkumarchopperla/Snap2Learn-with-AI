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
  X
} from 'lucide-react';
import { MathRenderer } from '../components/MathRenderer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

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
    },
    {
      icon: Globe2,
      title: 'English & Telugu Explanations',
      desc: 'Switch effortlessly between English academic explanations and native Telugu conceptual translations for maximum clarity.',
    },
    {
      icon: Award,
      title: 'Deterministic Quiz Arena',
      desc: 'Configurable 5 or 10-question tests with Easy, Medium, and Hard tiers. Guaranteed fair countdown timers starting only upon question render.',
    },
    {
      icon: Layers,
      title: 'Smart Spaced Flashcards',
      desc: 'Active recall decks with Again, Hard, Good, and Easy ratings. Real-time background autosave and offline sync support.',
    },
    {
      icon: MessageSquare,
      title: 'Contextual AI Study Tutor',
      desc: 'Interactive chat assistant grounded in your uploaded notes. Ask follow-up questions, request counter-examples, or debug code.',
    },
    {
      icon: BarChart3,
      title: 'Weak-Topic Progress Analytics',
      desc: 'Automated mastery breakdown identifying your weak engineering areas so you can focus revision where it matters most.',
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
    <div className="min-h-screen bg-[#000000] text-white font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* ---------------- NAVIGATION BAR ---------------- */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-[#000000]/80 backdrop-blur-md border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                Snap2Learn<span className="text-indigo-400 ml-0.5">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300 hidden sm:inline">
                v2.5 Pro
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#subjects" className="hover:text-white transition-colors">Subjects</a>
            <a href="#flashcards" className="hover:text-white transition-colors">Flashcards</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95"
            >
              Launch Workspace
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/[0.04] text-neutral-400 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0f] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-3">
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
            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs"
              >
                Launch Workspace
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="relative pt-24 sm:pt-32">
        {/* ---------------- HERO SECTION ---------------- */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8 pb-20">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs text-neutral-300 hover:border-white/20 transition-all cursor-pointer group">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="font-medium text-neutral-200">Multimodal AI Engineering Tutor</span>
            <span className="text-neutral-500 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Turn Handwritten Notes into Exam Mastery with AI
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Snap photos of complex lecture derivations, textbook formulas, or engineering proofs. Snap2Learn AI extracts LaTeX math, delivers English & Telugu explanations, and generates targeted quizzes with deterministic timers.
          </p>

          {/* Hero Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Start Scanning Free</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('workflow');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore 5-Step Workflow</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          {/* Split Interactive Showcase Mockup */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl bg-[#0a0a0f] border border-white/[0.1] shadow-2xl overflow-hidden text-left">
              {/* Window Header */}
              <div className="px-4 py-3 bg-[#0e0e14] border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="font-mono text-[11px] text-neutral-300 ml-2">
                    snap2learn-session // linear_algebra_eigenvalues.jpg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    ● OCR Verified
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">KaTeX Math Engine</span>
                </div>
              </div>

              {/* Window Body: Split Scan on Left, AI Breakdown on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                {/* Left: Input Scan & Extracted Math */}
                <div className="p-6 space-y-4 bg-[#0a0a0f]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Step 1: Extracted Note Text
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.05] text-indigo-300 border border-white/[0.08]">
                      Vision Confidence: 99.4%
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
                    <p className="text-xs text-neutral-300 font-mono">
                      Characteristic Equation of Matrix A:
                    </p>
                    <div className="text-center py-2 text-white">
                      <MathRenderer content={"\\det(A - \\lambda I) = 0"} block />
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Where <MathRenderer content={"\\lambda"} /> represents eigenvalues and <MathRenderer content={"I"} /> is identity matrix.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Formula Breakdown:</span>
                    <div className="text-xs text-indigo-300 font-mono">
                      <MathRenderer content={"A v = \\lambda v \\iff (A - \\lambda I) v = 0"} />
                    </div>
                  </div>
                </div>

                {/* Right: AI Explanation & Telugu Translation */}
                <div className="p-6 space-y-4 bg-[#0d0d14]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                      Step 2: Bilingual Intelligence
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono">
                      Telugu Enabled
                    </span>
                  </div>

                  {/* English Explanation */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white">Academic Definition (English):</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      An eigenvalue is a scalar by which an eigenvector is stretched or compressed when transformed by matrix A without rotating off its span.
                    </p>
                  </div>

                  {/* Telugu Vernacular */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                    <h4 className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>తెలుగు వివరణ (Intuition in Telugu):</span>
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      ఐగన్‌విలువ అనేది ఒక మ్యాట్రిక్స్ ద్వారా వెక్టార్ దిశ మారకుండా దాని పొడవు ఎంత స్కేల్ అవుతుందో తెలిపే గుణకం.
                    </p>
                  </div>

                  {/* Instant Action Pills */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/auth')}
                      className="flex-1 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-white text-center transition-colors cursor-pointer"
                    >
                      Take 5-Q Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/auth')}
                      className="flex-1 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-medium text-indigo-300 text-center transition-colors cursor-pointer"
                    >
                      Make Flashcard Deck
                    </button>
                  </div>
                </div>
              </div>
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
                      : 'bg-[#0c0c11] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="font-mono text-xs text-indigo-400 block mb-1">{step.step}</span>
                  <p className="text-xs font-bold truncate">{step.title}</p>
                </button>
              ))}
            </div>

            {/* Active Step Showcase Card */}
            <div className="rounded-2xl bg-[#0c0c11] border border-white/[0.08] p-6 sm:p-8 space-y-4">
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

        {/* ---------------- CORE CAPABILITIES GRID ---------------- */}
        <section id="features" className="py-24 border-t border-white/[0.08] relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
                <span>Features & Tooling</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built for Engineering Students
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Everything required to convert dense lecture notes into guaranteed test readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-6 rounded-2xl bg-[#0c0c11] border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- SUBJECTS COVERED ---------------- */}
        <section id="subjects" className="py-24 border-t border-white/[0.08] relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-neutral-300">
                <span>Curriculum</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Trained Across Core Engineering Disciplines
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Recognizes university-level proofs, equations, diagrams, and programming syntax.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'Linear Algebra', tag: 'Eigenvalues & Inverses' },
                { name: 'Multivariate Calculus', tag: 'Gradients & Integrals' },
                { name: 'Machine Learning', tag: 'Backprop & CNNs' },
                { name: 'Operating Systems', tag: 'Deadlocks & Semaphores' },
                { name: 'Data Structures', tag: 'Trees, Graphs, DP' },
                { name: 'Digital Electronics', tag: 'K-Maps & Logic Gates' },
              ].map((subj) => (
                <div
                  key={subj.name}
                  className="p-4 rounded-xl bg-[#0c0c11] border border-white/[0.08] hover:border-indigo-400/30 transition-all text-center space-y-1"
                >
                  <p className="text-xs font-bold text-white">{subj.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{subj.tag}</p>
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
                    className="rounded-xl bg-[#0c0c11] border border-white/[0.08] overflow-hidden transition-all"
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
      <footer className="relative bg-[#050507] border-t border-white/[0.08] pt-14 pb-10 text-neutral-400 text-xs">
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
