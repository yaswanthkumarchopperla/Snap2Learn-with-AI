import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosave } from '../contexts/AutosaveContext';
import { api } from '../services/api';
import { FlashcardItem, Difficulty, LearningStatus, NoteItem } from '../types';

export const FlashcardsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerAutosave } = useAutosave();

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('Engineering Mathematics');
  const [newTopic, setNewTopic] = useState('Calculus');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newFormula, setNewFormula] = useState('');

  // AI Flashcards Generator State
  const [showAiModal, setShowAiModal] = useState(false);
  const [genTopic, setGenTopic] = useState('Eigenvalues & Characteristic Equation');
  const [genSubject, setGenSubject] = useState('Engineering Mathematics');
  const [genCount, setGenCount] = useState<number>(5);
  const [genDifficulty, setGenDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [genContext, setGenContext] = useState('');
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Suggested Topics for quick one-click generation
  const SUGGESTED_TOPICS = [
    { topic: 'Eigenvalues & Matrices', subject: 'Engineering Mathematics' },
    { topic: "Bayes' Theorem & Probability", subject: 'Machine Learning' },
    { topic: 'Gradient Descent & Loss Functions', subject: 'Machine Learning' },
    { topic: 'Fourier Transforms & Signals', subject: 'Electrical Engineering' },
    { topic: 'Process Scheduling & Semaphores', subject: 'Operating Systems' },
  ];

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

  // Fetch student's saved notes for optional generation context
  const loadSavedNotes = async () => {
    try {
      const notes = await api.getNotes();
      setSavedNotes(notes);
    } catch {
      // Non-critical, fallback to empty notes
    }
  };

  useEffect(() => {
    loadFlashcards(selectedSubject === 'All' ? undefined : selectedSubject);
    loadSavedNotes();
  }, [selectedSubject]);

  // Handle incoming navigation state (e.g., from NotesPage or ScannerPage)
  useEffect(() => {
    if (location.state?.generateTopic) {
      setGenTopic(location.state.generateTopic);
      if (location.state.generateSubject) setGenSubject(location.state.generateSubject);
      if (location.state.contextText) setGenContext(location.state.contextText);
      if (location.state.noteId) setSelectedNoteId(location.state.noteId);
      setShowAiModal(true);
    }
  }, [location.state]);

  // Dynamic subjects computed from existing flashcards
  const dynamicSubjects = useMemo(() => {
    const set = new Set<string>();
    flashcards.forEach((c) => {
      if (c.subject && c.subject.trim()) set.add(c.subject.trim());
    });
    return ['All', ...Array.from(set)];
  }, [flashcards]);

  // Filtered flashcard deck
  const activeDeck = useMemo(() => {
    if (selectedSubject === 'All') return flashcards;
    return flashcards.filter(
      (c) => c.subject?.toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [flashcards, selectedSubject]);

  const currentCard: FlashcardItem | undefined = activeDeck[currentIndex];

  // Easy / Medium / Hard review ratings (Autosaved continuous progress)
  const handleRate = async (rating: Difficulty) => {
    if (!currentCard) return;
    const computedStatus: LearningStatus =
      rating === 'easy' ? 'known' : rating === 'medium' ? 'learning' : 'unknown';

    const updatedCard: FlashcardItem = {
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

    // Advance to next card
    if (currentIndex < activeDeck.length - 1) {
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

  // Delete Card
  const handleDeleteCard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    if (!window.confirm('Delete this flashcard from your deck?')) return;
    const cardId = currentCard.id;
    try {
      await api.deleteFlashcard(cardId);
      setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
      if (currentIndex >= activeDeck.length - 1 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
      setIsFlipped(false);
      setReviewSuccess('Flashcard deleted');
      setTimeout(() => setReviewSuccess(null), 1500);
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
    }
  };

  // Manual Card Creation
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
      setCurrentIndex(0);
      setIsFlipped(false);
      setNotificationMsg(`Flashcard created and saved.`);
      setTimeout(() => setNotificationMsg(null), 3000);
    }
    setShowAddModal(false);
    setNewFront('');
    setNewBack('');
    setNewFormula('');
  };

  // AI Flashcard Generation on Topic
  const handleGenerateAiFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      setGenError('Please specify a topic for flashcard generation.');
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    try {
      const response = await api.generateFlashcards({
        topic: genTopic.trim(),
        subject: genSubject.trim() || 'General',
        context_text: genContext.trim() || undefined,
        card_count: genCount,
        difficulty_focus: genDifficulty,
        note_id: selectedNoteId || undefined,
      });

      if (response && response.cards && response.cards.length > 0) {
        // Prepend new cards to state
        setFlashcards((prev) => [...response.cards, ...prev]);
        setSelectedSubject('All');
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowAiModal(false);

        // Flash celebratory banner
        setNotificationMsg(
          `⚡ Generated & autosaved ${response.cards.length} active-recall flashcards on "${response.topic}"! Ready to revise anytime.`
        );
        setTimeout(() => setNotificationMsg(null), 5000);
      } else {
        setGenError('No flashcards were returned. Please try a different topic.');
      }
    } catch (err: any) {
      console.error('Failed to generate flashcards:', err);
      setGenError(err?.message || 'Failed to generate flashcards. Please check your network and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle note selection in AI Generator
  const handleSelectNoteContext = (noteId: string) => {
    setSelectedNoteId(noteId);
    if (!noteId) {
      setGenContext('');
      return;
    }
    const found = savedNotes.find((n) => n.id === noteId);
    if (found) {
      setGenTopic(found.topic || found.title);
      setGenSubject(found.subject || 'General');
      setGenContext(found.raw_text || '');
    }
  };

  // Deck Navigation
  const handlePrevCard = () => {
    if (activeDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeDeck.length - 1));
  };

  const handleNextCard = () => {
    if (activeDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < activeDeck.length - 1 ? prev + 1 : 0));
  };

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
              onClick={() => {
                setGenError(null);
                setShowAiModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-xs font-semibold shadow-md glow-secondary hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>⚡ AI Generate</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Card</span>
            </button>
          </div>
        </div>

        {/* Success / Notification Banner */}
        {notificationMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium flex-1">{notificationMsg}</span>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-emerald-400/70 hover:text-emerald-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dynamic Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {dynamicSubjects.map((subj) => (
            <button
              key={subj}
              onClick={() => {
                setSelectedSubject(subj);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
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

        {/* ============================================================= */}
        {/* MODAL 1: AI Flashcard Generator Modal                         */}
        {/* ============================================================= */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 border border-secondary/30">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span>AI Flashcard Generator (Topic Based)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="text-foreground-muted hover:text-foreground cursor-pointer"
                  disabled={isGenerating}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGenerateAiFlashcards} className="space-y-3.5">
                {/* Topic Input */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                    Topic / Concept to Generate Flashcards For *
                  </label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                    placeholder="e.g. Eigenvalues & Eigenvectors, Bayes' Theorem, Backpropagation..."
                    required
                    disabled={isGenerating}
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <span className="block text-[10px] text-foreground-muted mb-1 font-medium">Quick suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TOPICS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGenTopic(item.topic);
                          setGenSubject(item.subject);
                        }}
                        disabled={isGenerating}
                        className="px-2 py-0.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-[10px] text-foreground-muted hover:text-secondary transition-colors"
                      >
                        {item.topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject & Card Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground-muted mb-1">Subject</label>
                    <input
                      type="text"
                      value={genSubject}
                      onChange={(e) => setGenSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                      placeholder="e.g. Engineering Mathematics"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground-muted mb-1">Cards to Generate</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                      disabled={isGenerating}
                    >
                      <option value={3}>3 Flashcards (Quick review)</option>
                      <option value={5}>5 Flashcards (Standard set)</option>
                      <option value={8}>8 Flashcards (In-depth deck)</option>
                      <option value={10}>10 Flashcards (Comprehensive)</option>
                    </select>
                  </div>
                </div>

                {/* Difficulty Focus */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">Difficulty Distribution</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'mixed', label: 'Mixed' },
                      { key: 'easy', label: 'Easy' },
                      { key: 'medium', label: 'Medium' },
                      { key: 'hard', label: 'Hard' }
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setGenDifficulty(d.key as any)}
                        disabled={isGenerating}
                        className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          genDifficulty === d.key
                            ? 'bg-secondary/20 text-secondary border-secondary/50'
                            : 'bg-surface border-border text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional: Import from Saved Notes */}
                {savedNotes.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-medium text-foreground-muted mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-secondary" />
                      <span>Optional: Ground in a Saved Note</span>
                    </label>
                    <select
                      value={selectedNoteId}
                      onChange={(e) => handleSelectNoteContext(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                      disabled={isGenerating}
                    >
                      <option value="">None (Generate from general academic principles)</option>
                      {savedNotes.map((note) => (
                        <option key={note.id} value={note.id}>
                          {note.title} ({note.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error Banner */}
                {genError && (
                  <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{genError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    disabled={isGenerating}
                    className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground text-xs cursor-pointer hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-xs font-semibold shadow-md glow-secondary cursor-pointer hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating & Autosaving...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Generate & Auto-Save</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* MODAL 2: Create Manual Custom Flashcard                       */}
        {/* ============================================================= */}
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

        {/* ============================================================= */}
        {/* MAIN DECK VIEW                                                */}
        {/* ============================================================= */}
        {loading ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
            <span className="text-xs text-foreground-muted">Loading study cards...</span>
          </div>
        ) : activeDeck.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-foreground-muted mx-auto opacity-40" />
            <h3 className="font-bold text-foreground text-sm">No flashcards found in this category</h3>
            <p className="text-xs text-foreground-muted max-w-md mx-auto">
              Generate topic-focused active recall flashcards using Gemini AI or click "+ New Card" to build custom cards.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowAiModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-xs font-semibold shadow-md glow-secondary flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Generate on Topic</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-medium"
              >
                + Create Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Deck Progress & Navigation Header */}
            <div className="flex items-center justify-between text-xs font-medium text-foreground-muted">
              <div className="flex items-center gap-2">
                <span>
                  Card {currentIndex + 1} of {activeDeck.length}
                </span>
                <span className="text-border">•</span>
                <span className="text-foreground-muted">
                  Deck: <span className="text-foreground font-semibold">{selectedSubject}</span>
                </span>
              </div>

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
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
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

                  {/* Delete Card Button */}
                  <button
                    type="button"
                    onClick={handleDeleteCard}
                    className="p-1.5 rounded-lg border border-border bg-surface text-foreground-muted hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                    title="Delete flashcard"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                {isFlipped ? 'How well did you recall this concept? (Rating auto-saves to your profile)' : 'Tap card to reveal answer and recall rating'}
              </div>
            </div>

            {/* Navigation & Ease Rating Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border">
              {/* Prev / Next Deck Steppers */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-border text-foreground text-xs font-semibold border border-border flex items-center gap-1 transition-colors cursor-pointer"
                  title="Previous flashcard"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-border text-secondary text-xs font-semibold border border-secondary/30 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Flip Card
                </button>
                <button
                  type="button"
                  onClick={handleNextCard}
                  className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-border text-foreground text-xs font-semibold border border-border flex items-center gap-1 transition-colors cursor-pointer"
                  title="Next flashcard"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Recall Rating Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleRate('hard')}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors cursor-pointer"
                  title="Hard: review again soon"
                >
                  Hard
                </button>
                <button
                  onClick={() => handleRate('medium')}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-colors cursor-pointer"
                  title="Medium: good recall"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleRate('easy')}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors cursor-pointer"
                  title="Easy: mastered concept"
                >
                  Easy
                </button>
              </div>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-semibold animate-in fade-in">
                {reviewSuccess}
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
