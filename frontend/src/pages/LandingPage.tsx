import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  BookOpen,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Cpu,
  BrainCircuit,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MathRenderer } from '../components/MathRenderer';
import Antigravity from '../components/Antigravity';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const workflowSteps = [
    {
      title: '1. Snap Note or Page',
      badge: 'Multimodal Vision',
      desc: 'Use your phone/laptop camera or upload a photo of handwritten notes or textbooks.',
      sampleInput: 'Handwritten notes on Characteristic Equation: det(A - λI) = 0'
    },
    {
      title: '2. Review & Refine Text',
      badge: 'Formula-Aware OCR',
      desc: 'Gemini Vision extracts formulas, code, and diagrams while preserving mathematical syntax.',
      sampleInput: 'Extracted: A v = λ v => (A - λ I) v = 0 with high confidence.'
    },
    {
      title: '3. Deep AI Explanation',
      badge: 'English + Telugu',
      desc: 'Get structured breakdown: definitions, formulas, real-world examples, and Telugu translations.',
      sampleInput: 'ఐగన్‌విలువలు: మ్యాట్రిక్స్ ద్వారా వెక్టార్ దిశ మారకుండా స్కేల్ అయ్యే గుణకం.'
    },
    {
      title: '4. Practice Quiz Arena',
      badge: 'Deterministic Scoring',
      desc: 'Assess your understanding with instant MCQs, mistake explanations, and weak concept tracking.',
      sampleInput: 'Quiz Score: 80% • Recommended: Review Trace vs Determinant properties.'
    }
  ];

  const features = [
    {
      icon: Camera,
      title: 'Smart Note Scanner',
      desc: 'Point your camera at notebook pages or textbook exercises. Automatically extracts clean text with LaTeX equations preserved.'
    },
    {
      icon: Globe2,
      title: 'Bilingual English & Telugu',
      desc: 'First-year college students can toggle seamlessly between clear English, authentic Telugu (తెలుగు), or side-by-side bilingual explanations.'
    },
    {
      icon: Award,
      title: 'AI Quiz Arena',
      desc: 'Generate 5, 10, or 15 multiple-choice questions grounded strictly on your confirmed notes. Server-side deterministic grading with zero hallucinations.'
    },
    {
      icon: BrainCircuit,
      title: 'Contextual AI Tutor',
      desc: 'Ask follow-up questions directly on your scanned notes. Get step-by-step math proofs, Python code snippets, and exam tips.'
    },
    {
      icon: Layers,
      title: 'Smart Flashcards',
      desc: 'Transform complex formulas and definitions into interactive 3D flip cards with spaced repetition ease ratings (Easy, Medium, Hard).'
    },
    {
      icon: Cpu,
      title: 'Progress Analytics',
      desc: 'Track accuracy over time, identify weak academic concepts, and receive targeted recommendations for upcoming semester exams.'
    }
  ];

  const faqs = [
    {
      q: 'Does it work with messy handwriting?',
      a: 'Yes! Gemini 2.5 Flash Multimodal Vision is designed to transcribe cursive, diagrams, and handwriting. You can also review and edit the transcribed text before generating explanations.'
    },
    {
      q: 'How does Telugu bilingual support work?',
      a: 'You can choose between English, pure Telugu, or Bilingual (English + Telugu). In Bilingual mode, core definitions and takeaways are explained side-by-side in Telugu to help Telugu-medium students bridge technical terminology smoothly.'
    },
    {
      q: 'How are quizzes scored?',
      a: 'Quiz scoring is calculated deterministically in our application code, comparing selected options against the server-verified answer key. Correct answers are never sent to the client ahead of time.'
    },
    {
      q: 'Can I use this without a Gemini API key or Supabase account?',
      a: 'Yes! Snap2Learn AI includes an autonomous Guest Demo Mode out of the box with sample engineering notes, flashcards, and quizzes.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden gradient-mesh">
        {/* Interactive Antigravity Particle Field Background */}
        <div className="absolute inset-0 z-0 opacity-55 pointer-events-auto">
          <Antigravity
            colors={['#5227FF', '#38bdf8', '#FF9FFC', '#818cf8']}
            count={1400}
            magnetRadius={9}
            ringRadius={7}
            particleSize={0.9}
            autoAnimate={true}
          />
        </div>

        {/* Subtle decorative glow spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[200px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border shadow-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold tracking-wide text-foreground-muted">
              Built for First-Year CSE & AIML Engineering Students
            </span>
          </div>

          {/* Animated Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Turn Any Note Into Your <br />
            <span className="gradient-text">Personal AI Tutor</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-foreground-muted mb-10 leading-relaxed">
            Snap handwritten notebook pages, textbook formulas, or coding problems.
            Get instant step-by-step explanations in <strong>English & Telugu</strong>,
            interactive practice quizzes, and smart flashcards.
          </p>

          {/* CTA Cluster */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/scanner')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary text-white font-semibold text-sm shadow-xl glow-primary hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Start Learning Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-surface border border-border hover:border-border-highlight text-foreground font-semibold text-sm hover:bg-surface-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-secondary" />
              <span>Explore Live Demo</span>
            </button>
          </div>

          {/* Interactive Scan -> Explain -> Quiz Preview Card */}
          <div className="relative max-w-4xl mx-auto glass-card p-4 sm:p-6 shadow-2xl text-left border border-white/10">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-foreground-muted">snap2learn-session-preview.ai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-[11px] font-semibold text-secondary">Multimodal Active</span>
              </div>
            </div>

            {/* Step Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {workflowSteps.map((step, idx) => (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(idx)}
                  className={`p-2.5 rounded-xl text-left transition-all text-xs ${
                    activeStep === idx
                      ? 'bg-primary text-white font-semibold shadow-md glow-primary'
                      : 'bg-surface text-foreground-muted hover:bg-surface-hover'
                  }`}
                >
                  <p className="font-semibold truncate">{step.title}</p>
                  <span className="text-[10px] opacity-80">{step.badge}</span>
                </button>
              ))}
            </div>

            {/* Active Preview Content */}
            <div className="p-4 rounded-xl bg-surface-elevated border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  {workflowSteps[activeStep].badge}
                </span>
                <span className="text-[10px] text-foreground-muted">Simulated Real Output</span>
              </div>
              <p className="text-xs text-foreground-muted mb-3">
                {workflowSteps[activeStep].desc}
              </p>
              <div className="p-3 rounded-lg bg-black/40 border border-border font-mono text-xs text-foreground">
                <MathRenderer content={workflowSteps[activeStep].sampleInput} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to Master Engineering Concepts
          </h2>
          <p className="text-foreground-muted text-sm sm:text-base">
            Designed specifically for undergraduate university students tackling complex Mathematics,
            Machine Learning, Data Structures, and Electronics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="glass-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-secondary mb-4 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-xs text-foreground-muted leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* English + Telugu Learning Highlight */}
      <section id="bilingual" className="py-20 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold mb-4">
                <Globe2 className="w-4 h-4" />
                <span>Localized Regional Learning</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Understand in English or <br />
                <span className="text-secondary">స్పష్టమైన తెలుగు (Clear Telugu)</span>
              </h2>
              <p className="text-foreground-muted text-sm sm:text-base leading-relaxed mb-6">
                Never get blocked by difficult technical jargon again. Snap2Learn AI translates
                complex definitions into intuitive Telugu explanations with formulas and code side-by-side,
                empowering students from state board and regional language backgrounds to excel.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Telugu explanations with English technical terms in brackets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bilingual mode for seamless comparison during exam preparation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Tutor answers questions natively in Telugu script</span>
                </li>
              </ul>
            </div>

            {/* Comparison Showcase Card */}
            <div className="glass-card p-6 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="text-xs font-semibold text-secondary">Bilingual Comparison Preview</span>
                <span className="text-[10px] text-foreground-muted">Linear Algebra • Eigenvalues</span>
              </div>
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] uppercase font-bold text-primary block mb-1">English Explanation</span>
                  <p className="text-foreground-muted">
                    An eigenvalue $\lambda$ is a scalar that specifies how an eigenvector is scaled during a linear transformation: $A v = \lambda v$.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-secondary/30">
                  <span className="text-[10px] uppercase font-bold text-secondary block mb-1">తెలుగు వివరణ (Telugu Translation)</span>
                  <p className="text-foreground">
                    ఐగన్‌విలువ $\lambda$ అనేది ఒక సంఖ్య. ఒక మ్యాట్రిక్స్ $A$ ద్వారా వెక్టార్ $v$ ని గుణించినప్పుడు, దాని దిశ మారకుండా కేవలం $\lambda$ రెట్లు పొడవు మాత్రమే మారుతుంది.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-foreground-muted">
            Everything you need to know about using Snap2Learn AI in your coursework.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={faq.q} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-medium text-xs sm:text-sm text-foreground hover:bg-surface-hover/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-secondary' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-foreground-muted leading-relaxed border-t border-border/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full mb-12">
        <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden border border-secondary/30">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
              Ready to Ace Your CSE-AIML Exams?
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-xl mx-auto mb-8">
              Start scanning textbook questions and lecture notes right away.
              No complex setup required.
            </p>
            <button
              onClick={() => navigate('/scanner')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary text-white font-semibold text-sm shadow-xl glow-primary hover:opacity-95 transition-all inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Note Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
