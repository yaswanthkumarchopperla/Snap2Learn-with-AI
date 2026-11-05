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
  Filter,
  Bookmark,
  Check,
  X
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosave } from '../contexts/AutosaveContext';
import { api } from '../services/api';
import { FlashcardItem, Difficulty, LearningStatus } from '../types';

export const FlashcardsPage: React.FC = () => {
  const { triggerAutosave } = useAutosave();
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // New Flashcard Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('Engineering Mathematics');
  const [newTopic, setNewTopic] = useState('Calculus');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newFormula, setNewFormula] = useState('');

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
    const computedStatus: LearningStatus =
      rating === 'easy' ? 'known' : rating === 'medium' ? 'learning' : 'unknown';

    const updatedCard = {
      ...currentCard,
      difficulty: rating,
      learning_status: computedStatus,
      review_count: (currentCard.review_count || 0) + 1,
    };
    setFlashcards((prev) => prev.map((c) => (c.id === currentCard.id ? updatedCard : c)));

    triggerAutosave(async () => {
      return await api.reviewFlashcard(currentCard.id, rating, computedStatus);
    }, {
      type: 'flashcard',
      action: 'review',
      endpoint: `/api/flashcards/${currentCard.id}/review`,
      payload: { id: currentCard.id, rating, learning_status: computedStatus }
    });

    setReviewSuccess(`Marked as ${rating.toUpperCase()} (${computedStatus.toUpperCase()})`);
    setTimeout(() => setReviewSuccess(null), 1500);

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFlipped(false);
      setCurrentIndex(0);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    const newStatus = !currentCard.is_bookmarked;
    const updatedCard = { ...currentCard, is_bookmarked: newStatus };
    setFlashcards((prev) => prev.map((c) => (c.id === currentCard.id ? updatedCard : c)));

    triggerAutosave(async () => {
      return await api.updateFlashcard(currentCard.id, { is_bookmarked: newStatus });
    }, {
      type: 'flashcard',
      action: 'update',
      endpoint: `/api/flashcards/${currentCard.id}`,
      payload: { id: currentCard.id, is_bookmarked: newStatus }
    });
  };

  // Quick Learning Status change
  const handleStatusChange = (e: React.MouseEvent, status: LearningStatus) => {
    e.stopPropagation();
    if (!currentCard) return;
    const updatedCard = { ...currentCard, learning_status: status };
    setFlashcards((prev) => prev.map((c) => (c.id === currentCard.id ? updatedCard : c)));

    triggerAutosave(async () => {
      return await api.updateFlashcard(currentCard.id, { learning_status: status });
    }, {
      type: 'flashcard',
      action: 'update',
      endpoint: `/api/flashcards/${currentCard.id}`,
      payload: { id: currentCard.id, learning_status: status }
    });
  };

  // Create Custom Flashcard
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const payload = {
      subject: newSubject,
      topic: newTopic,
      front_prompt: newFront,
      back_answer: newBack,
      formula_or_code: newFormula.trim() || undefined,
      difficulty: 'medium' as Difficulty,
      is_bookmarked: false,
      learning_status: 'learning' as LearningStatus,
    };

    const created = await triggerAutosave(async () => {
      return await api.createFlashcard(payload);
    }, {
      type: 'flashcard',
      action: 'create',
      endpoint: '/api/flashcards',
      payload
    });

    if (created) {
      setFlashcards((prev) => [created, ...prev]);
    }
    setShowAddModal(false);
    setNewFront('');
    setNewBack('');
    setNewFormula('');
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

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <AutosaveIndicator compact={false} />
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Card</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === subj
                  ? 'bg-primary text-white shadow-sm glow-primary'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Add Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4 text-secondary" />
                  <span>Create Custom Flashcard</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCard} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground-muted mb-1">Subject</label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-foreground-muted mb-1">Topic</label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">Question / Prompt (Front)</label>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                    placeholder="e.g. State Baye's Theorem formula..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">Answer / Proof (Back)</label>
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                    placeholder="e.g. P(A|B) = P(B|A)*P(A) / P(B)..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">LaTeX Formula / Code (Optional)</label>
                  <input
                    type="text"
                    value={newFormula}
                    onChange={(e) => setNewFormula(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-mono focus:outline-none focus:border-secondary"
                    placeholder="e.g. P(A|B) = \frac{P(B|A)P(A)}{P(B)}"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground text-xs cursor-pointer hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary cursor-pointer hover:bg-primary-hover"
                  >
                    Autosave Flashcard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
              Scan a note or click "+ New Card" to start building your deck.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Deck Progress Indicator */}
            <div className="flex items-center justify-between text-xs font-medium text-foreground-muted">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="capitalize text-secondary">
                  Difficulty: {currentCard?.difficulty} • Reviews: {currentCard?.review_count || 0}
                </span>
              </div>
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

                <div className="flex items-center gap-2">
                  {/* Learning Status Pill */}
                  <span
                    onClick={(e) => handleStatusChange(e, currentCard?.learning_status === 'known' ? 'learning' : 'known')}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      currentCard?.learning_status === 'known'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : currentCard?.learning_status === 'unknown'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    }`}
                    title="Click to toggle known/learning status"
                  >
                    {currentCard?.learning_status?.toUpperCase() || 'LEARNING'}
                  </span>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      currentCard?.is_bookmarked
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-surface border-border text-foreground-muted hover:text-foreground'
                    }`}
                    title={currentCard?.is_bookmarked ? 'Bookmarked' : 'Add bookmark'}
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={currentCard?.is_bookmarked ? 'currentColor' : 'none'} />
                  </button>

                  <span className="text-[11px] text-foreground-muted flex items-center gap-1 group-hover:text-secondary transition-colors">
                    <RotateCw className="w-3.5 h-3.5" /> Flip
                  </span>
                </div>
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
                      <div className="p-3 rounded-xl bg-black/40 border border-border inline-block text-xs text-secondary max-w-full overflow-x-auto">
                        <MathRenderer content={currentCard.formula_or_code} block />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="text-center text-[10px] text-foreground-muted">
                {isFlipped ? 'How well did you know this concept? (Rating is auto-saved)' : 'Tap card to reveal answer and recall rating'}
              </div>
            </div>

            {/* Ease Rating Toolbar */}
            {isFlipped && (
              <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <span className="text-xs font-medium text-foreground-muted">Rate your recall ease:</span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleRate('hard')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Hard (Review Soon)
                  </button>
                  <button
                    onClick={() => handleRate('medium')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Medium (Good)
                  </button>
                  <button
                    onClick={() => handleRate('easy')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors cursor-pointer"
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
