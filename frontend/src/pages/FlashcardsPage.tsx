import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  Filter
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { api } from '../services/api';
import { FlashcardItem, Difficulty } from '../types';

export const FlashcardsPage: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Load flashcards from backend
  const loadFlashcards = async (subj?: string) => {
    setLoading(true);
    try {
      const data = await api.getFlashcards(subj);
      setFlashcards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcards(selectedSubject === 'All' ? undefined : selectedSubject);
  }, [selectedSubject]);

  // Handle Easy / Medium / Hard ratings
  const handleRate = async (rating: Difficulty) => {
    if (!currentCard) return;
    try {
      await api.reviewFlashcard(currentCard.id, rating);
      setReviewSuccess(`Marked as ${rating.toUpperCase()}`);
      setTimeout(() => setReviewSuccess(null), 1500);

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Completed deck
        setIsFlipped(false);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to review card:', err);
    }
  };

  const currentCard: FlashcardItem | undefined = flashcards[currentIndex];
  const subjects = ['All', 'Engineering Mathematics', 'Machine Learning'];

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="w-6 h-6 text-secondary" />
              <span>Smart Flashcards</span>
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Active recall & spaced repetition for engineering formulas and core concepts.
            </p>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === subj
                    ? 'bg-primary text-white shadow-sm glow-primary'
                    : 'bg-surface border border-border text-foreground-muted hover:text-foreground'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
            <span className="text-xs text-foreground-muted">Loading study cards...</span>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Layers className="w-10 h-10 text-foreground-muted mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-foreground text-sm mb-1">No flashcards found</h3>
            <p className="text-xs text-foreground-muted mb-4">
              Scan a note or generate an explanation to create interactive flashcards.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Deck Progress Indicator */}
            <div className="flex items-center justify-between text-xs font-medium text-foreground-muted">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span className="capitalize text-secondary">
                Difficulty: {currentCard?.difficulty} • Reviews: {currentCard?.review_count}
              </span>
            </div>

            {/* Interactive 3D Flip Flashcard */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer group relative min-h-[300px] sm:min-h-[340px] rounded-3xl glass-card border border-white/10 p-8 flex flex-col justify-between hover:border-secondary/40 transition-all shadow-xl select-none"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-elevated text-secondary border border-border">
                  {currentCard?.subject} • {currentCard?.topic}
                </span>
                <span className="text-[11px] text-foreground-muted flex items-center gap-1 group-hover:text-secondary transition-colors">
                  <RotateCw className="w-3.5 h-3.5" /> Click to Flip Card
                </span>
              </div>

              {/* Card Center Content */}
              <div className="my-auto py-6 text-center">
                {!isFlipped ? (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block mb-2">
                      Prompt / Question
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground leading-relaxed max-w-xl mx-auto">
                      <MathRenderer content={currentCard?.front_prompt || ''} />
                    </h2>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block mb-2">
                      Answer & Proof
                    </span>
                    <p className="text-sm sm:text-base text-foreground leading-relaxed max-w-xl mx-auto mb-4">
                      <MathRenderer content={currentCard?.back_answer || ''} />
                    </p>
                    {currentCard?.formula_or_code && (
                      <div className="p-3 rounded-xl bg-black/40 border border-border inline-block text-xs font-mono text-secondary">
                        <MathRenderer content={`$$${currentCard.formula_or_code}$$`} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="text-center text-[10px] text-foreground-muted">
                {isFlipped ? 'How well did you know this concept?' : 'Tap card to reveal answer and rating buttons'}
              </div>
            </div>

            {/* Ease Rating Toolbar */}
            {isFlipped && (
              <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <span className="text-xs font-medium text-foreground-muted">Rate your recall ease:</span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleRate('hard')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors"
                  >
                    Hard (Review Soon)
                  </button>
                  <button
                    onClick={() => handleRate('medium')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-colors"
                  >
                    Medium (Good)
                  </button>
                  <button
                    onClick={() => handleRate('easy')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors"
                  >
                    Easy (Mastered)
                  </button>
                </div>
              </div>
            )}

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-semibold">
                {reviewSuccess}
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
