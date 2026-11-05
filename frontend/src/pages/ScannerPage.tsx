import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Camera,
  UploadCloud,
  FileImage,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Trash2,
  BookOpen,
  Award,
  Clock,
  Copy,
  Check,
  Bookmark,
  Sliders,
  Globe2,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileText,
  Info,
  History,
  Play,
  Pause
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { CameraCapture } from '../components/CameraCapture';
import { MathRenderer } from '../components/MathRenderer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosave } from '../contexts/AutosaveContext';
import { api } from '../services/api';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { getQuizDurationSeconds, formatQuizTime } from '../config/quizConfig';
import {
  ScanResponse,
  ScanHistoryItem,
  ExplainResponse,
  ExplanationMode,
  Language,
  Difficulty,
  QuizGenerateResponse,
  QuizSubmitResponse,
  QuestionClientView
} from '../types';

type StepNumber = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1, title: 'Upload or Capture', short: 'Scan' },
  { num: 2, title: 'Extract Text', short: 'Extract' },
  { num: 3, title: 'Simple Notes', short: 'Explain' },
  { num: 4, title: 'Practice Quiz', short: 'Quiz' },
  { num: 5, title: 'View Score', short: 'Score' },
];

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { triggerAutosave } = useAutosave();

  const searchParams = new URLSearchParams(location.search);
  const searchStep = Number(searchParams.get('step')) as StepNumber;
  const initialStep = (searchStep >= 1 && searchStep <= 5) ? searchStep : (location.state?.step as StepNumber) || 1;
  const initialText = location.state?.text || 'Let A be an n x n square matrix with eigenvalue lambda and non-zero eigenvector v such that A v = lambda v. Trace equals sum of eigenvalues and determinant equals product of eigenvalues.';
  const initialSubject = location.state?.subject || 'Engineering Mathematics';
  const initialTopic = location.state?.topic || 'Eigenvalues & Vectors';

  // Stepper state
  const [currentStep, setCurrentStep] = useState<StepNumber>(initialStep);
  const [maxStepReached, setMaxStepReached] = useState<StepNumber>(initialStep);

  // Autosave and History tracking
  const [autoSavedNoteId, setAutoSavedNoteId] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Step 1: Camera & Image state
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [subjectHint, setSubjectHint] = useState('');

  // Step 2: OCR Extraction state
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [editedText, setEditedText] = useState(initialText);
  const [editedSubject, setEditedSubject] = useState(initialSubject);
  const [editedTopic, setEditedTopic] = useState(initialTopic);

  // Step 3: Explanation state
  const [explainMode, setExplainMode] = useState<ExplanationMode>('standard');
  const [explainLang, setExplainLang] = useState<Language>('bilingual');
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [savedNoteSuccess, setSavedNoteSuccess] = useState(false);

  // Step 4 & 5: Quiz state
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>('medium');
  const [quizData, setQuizData] = useState<QuizGenerateResponse | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isRetakeMode, setIsRetakeMode] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Step 5: Submission state
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);

  // References to avoid stale closures in timer expiration callback
  const quizDataRef = useRef<QuizGenerateResponse | null>(null);
  quizDataRef.current = quizData;
  const selectedAnswersRef = useRef<Record<string, number>>({});
  selectedAnswersRef.current = selectedAnswers;

  // Keep max reached step updated
  const goToStep = (step: StepNumber) => {
    setCurrentStep(step);
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
  };

  // Submit Quiz handler forward declaration for timer expiration
  const handleSubmitQuiz = useCallback(async (isTimeout: boolean = false) => {
    const activeQuiz = quizDataRef.current;
    if (!activeQuiz) return;
    stopQuizTimer();
    setIsSubmittingQuiz(true);
    setQuizError(null);

    try {
      const result = await api.submitQuiz({
        quiz_id: activeQuiz.quiz_id,
        answers: selectedAnswersRef.current,
        time_taken_seconds: quizTimeTaken,
      });
      setQuizResult(result);
      goToStep(5);

      if (result.passed) {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#7559FF', '#22D3EE', '#A855F7', '#10B981'],
        });
      }
    } catch (err: any) {
      console.error('Quiz submit error:', err);
      setQuizError(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  }, []);

  // Reliable countdown timer based on absolute end timestamp
  const {
    remainingSeconds: quizRemainingSeconds,
    totalDurationSeconds: quizTotalDuration,
    timeTakenSeconds: quizTimeTaken,
    isRunning: isQuizTimerRunning,
    isPaused: isQuizTimerPaused,
    formattedTime: formattedQuizTimer,
    startTimer: startQuizTimer,
    pauseTimer: pauseQuizTimer,
    resumeTimer: resumeQuizTimer,
    stopTimer: stopQuizTimer,
    resetTimer: resetQuizTimer,
  } = useQuizTimer({
    onTimeExpired: () => {
      handleSubmitQuiz(true);
    },
  });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load scan history on mount
  useEffect(() => {
    api.getScanHistory().then((data) => {
      if (Array.isArray(data)) setScanHistory(data);
    }).catch(() => {});
  }, []);

  // Debounced autosave for note edits in Step 2 & Step 3
  useEffect(() => {
    if (!autoSavedNoteId || !editedText.trim()) return;
    const timer = setTimeout(() => {
      triggerAutosave(async () => {
        return await api.updateNote(autoSavedNoteId, {
          title: editedTopic || editedSubject || 'Scanned Study Notes',
          subject: editedSubject || 'Engineering',
          topic: editedTopic || 'Core Lecture Notes',
          raw_text: editedText,
          summary: explanation?.short_summary,
          telugu_summary: explanation?.telugu_summary,
        });
      }, {
        type: 'note',
        action: 'update',
        endpoint: `/api/notes/${autoSavedNoteId}`,
        payload: {
          id: autoSavedNoteId,
          title: editedTopic || editedSubject || 'Scanned Study Notes',
          subject: editedSubject || 'Engineering',
          topic: editedTopic || 'Core Lecture Notes',
          raw_text: editedText,
        }
      });
    }, 750);
    return () => clearTimeout(timer);
  }, [editedText, editedSubject, editedTopic, autoSavedNoteId, explanation]);

  // -------------------------------------------------------------
  // STEP 1 HANDLERS: File Selection & Camera
  // -------------------------------------------------------------
  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validImageTypes.includes(file.type)) {
      setUploadError(`Unsupported file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP image.`);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size for images is 10MB.`);
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleCameraCapture = (file: File, url: string) => {
    setShowCamera(false);
    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  // Instant Engineering Sample loader
  const handleLoadSample = () => {
    const sampleText =
      '# Characteristic Equation & Eigenvalues\n\n' +
      'Let $A$ be an $n \\times n$ square matrix over field $\\mathbb{R}$. A scalar $\\lambda$ is an eigenvalue of $A$ if there exists a non-zero column vector $v$ such that:\n\n' +
      '$$\\[ A v = \\lambda v \\]$$\n\n' +
      'Rearranging gives $(A - \\lambda I) v = 0$. Since $v \\neq 0$, the matrix must be singular:\n\n' +
      '$$\\[ \\det(A - \\lambda I) = 0 \\]$$\n\n' +
      'This polynomial equation is called the Characteristic Equation. Roots are eigenvalues.\n\n' +
      '| Property | Mathematical Rule |\n' +
      '|---|---|\n' +
      '| Trace Rule | $\\sum \\lambda_i = \\text{tr}(A)$ |\n' +
      '| Determinant Rule | $\\prod \\lambda_i = \\det(A)$ |\n' +
      '| Angular Frequency | $\\omega = 2\\pi f$ |';

    setEditedText(sampleText);
    setEditedSubject('Engineering Mathematics');
    setEditedTopic('Eigenvalues & Characteristic Equation');
    setScanResult({
      text: sampleText,
      subject: 'Engineering Mathematics',
      topic: 'Eigenvalues & Characteristic Equation',
      confidence: 'Demo Mode (Pre-loaded Sample Notes)',
      uncertain_segments: [],
      is_demo: true,
    });
    setUploadError(null);
    goToStep(2);
  };

  // Extract Notes (Image Scan)
  const handleExtractNotes = async () => {
    if (!selectedFile) {
      setUploadError('Please select or capture a study photo first.');
      return;
    }

    setIsScanning(true);
    setUploadError(null);

    try {
      // Standard Image Scan pipeline
      const result = await api.scanImage(selectedFile, subjectHint || undefined);
      setScanResult(result);
      setEditedText(result.text);
      setEditedSubject(result.subject);
      setEditedTopic(result.topic);

      // Autosave newly extracted note
      const note = await triggerAutosave(async () => {
        return await api.createNote({
          title: result.topic || result.subject || 'Scanned Study Notes',
          subject: result.subject || 'Computer Science & Engineering',
          topic: result.topic || 'Core Lecture Notes',
          raw_text: result.text,
        });
      }, {
        type: 'note',
        action: 'create',
        endpoint: '/api/notes',
        payload: {
          title: result.topic || result.subject || 'Scanned Study Notes',
          subject: result.subject || 'Computer Science & Engineering',
          topic: result.topic || 'Core Lecture Notes',
          raw_text: result.text,
        }
      });
      if (note) setAutoSavedNoteId(note.id);

      // Refresh scan history
      api.getScanHistory().then((data) => {
        if (Array.isArray(data)) setScanHistory(data);
      }).catch(() => {});

      goToStep(2);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setUploadError(err.message || 'Failed to extract text. Please ensure the backend server is running and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2 HANDLERS: OCR Confirmation & Proceed to Explain
  // -------------------------------------------------------------
  const handleConfirmAndGenerateNotes = async () => {
    if (!editedText.trim()) {
      return;
    }
    goToStep(3);
    await triggerExplanation(editedText, editedSubject, editedTopic, explainMode, explainLang);
  };

  // -------------------------------------------------------------
  // STEP 3 HANDLERS: AI Explanations
  // -------------------------------------------------------------
  const triggerExplanation = async (
    text: string,
    subject: string,
    topic: string,
    mode: ExplanationMode,
    language: Language
  ) => {
    setIsExplaining(true);
    setExplainError(null);

    try {
      const data = await api.explainNotes({
        text,
        subject: subject || 'Computer Science & Engineering',
        topic: topic || 'Core Lecture Concepts',
        mode,
        language,
      });
      setExplanation(data);

      // Autosave generated summaries to note
      if (autoSavedNoteId) {
        triggerAutosave(async () => {
          return await api.updateNote(autoSavedNoteId, {
            summary: data.short_summary,
            telugu_summary: data.telugu_summary,
          });
        });
      }
    } catch (err: any) {
      console.error('Explanation error:', err);
      setExplainError(err.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleExplainModeChange = (newMode: ExplanationMode) => {
    setExplainMode(newMode);
    triggerExplanation(editedText, editedSubject, editedTopic, newMode, explainLang);
  };

  const handleExplainLangChange = (newLang: Language) => {
    setExplainLang(newLang);
    triggerExplanation(editedText, editedSubject, editedTopic, explainMode, newLang);
  };

  const handleCopyNotes = () => {
    if (!explanation) return;
    const content = [
      `# ${editedTopic} (${editedSubject})`,
      `\n## Core Concept Overview\n${explanation.short_summary}`,
      explanation.telugu_summary ? `\n## తెలుగు సారాంశం\n${explanation.telugu_summary}` : '',
      `\n## Step-by-Step Breakdown\n${explanation.detailed_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
      `\n## Key Definitions\n${explanation.key_definitions.map((k) => `- ${k.term}: ${k.definition}`).join('\n')}`,
      `\n## Formulas\n${explanation.formulas.map((f) => `- ${f.name}: $$${f.latex}$$ (${f.explanation})`).join('\n')}`,
      `\n## Real-Life Example\n${explanation.real_life_example}`,
      `\n## University Exam Model Answer\n${explanation.exam_answer}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(content);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleSaveNote = async () => {
    try {
      await api.createNote({
        title: editedTopic || 'Scanned Study Notes',
        subject: editedSubject || 'Computer Science & Engineering',
        topic: editedTopic || 'Core Lecture Notes',
        raw_text: editedText,
        summary: explanation?.short_summary,
      });
      setSavedNoteSuccess(true);
      setTimeout(() => setSavedNoteSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  // -------------------------------------------------------------
  // STEP 4 HANDLERS: Practice Quiz
  // -------------------------------------------------------------
  const handleStartQuiz = async () => {
    goToStep(4);
    await triggerQuizGeneration(numQuestions, quizDifficulty);
  };

  const triggerQuizGeneration = async (num: number, diff: Difficulty, isRetake: boolean = false) => {
    // 5. Keep the quiz timer completely stopped during question generation
    stopQuizTimer();
    resetQuizTimer();
    setQuizData(null); // Clear previous quiz data so no timer can run
    setIsGeneratingQuiz(true);
    setIsRetakeMode(isRetake);
    setQuizError(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentQIndex(0);

    try {
      const data = await api.generateQuiz({
        study_text: editedText,
        subject: editedSubject || 'Computer Science & Engineering',
        topic: editedTopic || 'Core Lecture Notes',
        num_questions: num,
        difficulty: diff,
        is_retake: isRetake,
      });
      // 6 & 7. Wait until all questions are successfully generated and rendered
      setQuizData(data);

      // 8. Start the countdown timer only when the first question is visible and the quiz is ready
      const allocatedDuration = getQuizDurationSeconds(num, diff);
      startQuizTimer(allocatedDuration);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      // 4. If generation fails: stop loading state, do not start timer, show error
      setQuizError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    const newAnswers = {
      ...selectedAnswers,
      [qId]: optIndex,
    };
    setSelectedAnswers(newAnswers);

    if (quizData) {
      triggerAutosave(async () => {
        return await api.saveQuizProgress({
          quiz_id: quizData.quiz_id,
          answers: newAnswers,
          current_question_index: currentQIndex,
          time_taken_seconds: quizTimeTaken,
        });
      }, {
        type: 'quiz_progress',
        action: 'update',
        endpoint: `/api/quiz/${quizData.quiz_id}/progress`,
        payload: {
          quiz_id: quizData.quiz_id,
          answers: newAnswers,
          current_question_index: currentQIndex,
          time_taken_seconds: quizTimeTaken,
        }
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeQuestion: QuestionClientView | undefined = quizData?.questions[currentQIndex];

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Camera className="w-6 h-6 text-secondary" />
              <span>Smart Study Scanner</span>
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Complete 5-step learning workflow: Scan → Extract → Explain → Quiz → Score
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <AutosaveIndicator compact={false} />
            {scanHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(!showHistoryModal)}
                className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground hover:border-secondary/40 text-xs font-semibold hover:bg-surface-hover transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <History className="w-3.5 h-3.5 text-secondary" />
                <span>Recent Scans ({scanHistory.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground hover:border-secondary/40 text-xs font-semibold hover:bg-surface-hover transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Load Engineering Sample</span>
            </button>
          </div>
        </div>

        {/* Recent Scans Revisit Drawer */}
        {showHistoryModal && (
          <div className="glass-card p-4 sm:p-5 border border-secondary/30 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-bold text-foreground">Recent Scans History</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-foreground-muted hover:text-foreground cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
              {scanHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setEditedText(item.text);
                    setEditedSubject(item.subject);
                    setEditedTopic(item.topic);
                    setScanResult({
                      scan_id: item.id,
                      text: item.text,
                      subject: item.subject,
                      topic: item.topic,
                      confidence: item.confidence,
                      uncertain_segments: item.uncertain_segments || [],
                      is_demo: false,
                      created_at: item.created_at
                    });
                    setShowHistoryModal(false);
                    goToStep(2);
                  }}
                  className="p-3 rounded-xl bg-surface hover:bg-surface-elevated border border-border hover:border-secondary/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-secondary">{item.subject}</span>
                    <span className="text-foreground-muted">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">{item.topic || 'Untitled Scan'}</h4>
                  <p className="text-[11px] text-foreground-muted line-clamp-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* MODERN STEPPER: Desktop Horizontal / Mobile Compact       */}
        {/* --------------------------------------------------------- */}
        <div className="glass-card p-4 sm:p-5">
          {/* Desktop Stepper */}
          <div className="hidden md:flex items-center justify-between relative">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;
              const isAccessible = step.num <= maxStepReached;

              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => isAccessible && goToStep(step.num as StepNumber)}
                    className={`flex items-center gap-3 transition-all text-left ${
                      isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isActive
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md glow-primary ring-2 ring-secondary/50'
                          : 'bg-surface border border-border text-foreground-muted'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isActive
                            ? 'text-foreground'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-foreground-muted'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] text-foreground-muted">
                        {step.num === 1 && (selectedFile ? 'Image ready' : 'Choose material')}
                        {step.num === 2 && (editedText ? 'Text confirmed' : 'Awaiting OCR')}
                        {step.num === 3 && (explanation ? 'Notes generated' : 'AI breakdown')}
                        {step.num === 4 && (quizData ? `${quizData.total_questions} Questions` : 'Assessment')}
                        {step.num === 5 && (quizResult ? `Score: ${quizResult.score_percentage}%` : 'Evaluation')}
                      </p>
                    </div>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 h-0.5 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentStep > step.num
                            ? 'bg-gradient-to-r from-primary to-secondary'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Stepper */}
          <div className="md:hidden space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-secondary">
                Step {currentStep} of 5: {STEPS[currentStep - 1].title}
              </span>
              <span className="text-[11px] text-foreground-muted">
                {Math.round((currentStep / 5) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 overflow-x-auto gap-1">
              {STEPS.map((s) => (
                <button
                  key={s.num}
                  type="button"
                  disabled={s.num > maxStepReached}
                  onClick={() => s.num <= maxStepReached && goToStep(s.num as StepNumber)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
                    currentStep === s.num
                      ? 'bg-primary text-white'
                      : s.num <= maxStepReached
                      ? 'bg-surface text-foreground-muted'
                      : 'opacity-40 text-foreground-muted'
                  }`}
                >
                  {s.short}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Camera Modal Component */}
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
            onSwitchToUpload={() => {
              setShowCamera(false);
              fileInputRef.current?.click();
            }}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: UPLOAD OR CAPTURE                                     */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Error Notification */}
            {uploadError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Upload or Scan Notice</p>
                  <p className="mt-0.5 leading-relaxed">{uploadError}</p>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {!selectedFile ? (
              /* Dropzone / Capture Option Box */
              <div className="glass-card p-6 sm:p-10 space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Capture or Upload Your Study Material
                  </h2>
                  <p className="text-xs sm:text-sm text-foreground-muted">
                    Take a picture of handwritten notes, textbooks, or problem sets using your webcam, or upload an image file.
                  </p>
                </div>

                {/* Subject hint input */}
                <div className="max-w-md mx-auto">
                  <label className="block text-[11px] font-semibold text-foreground-muted mb-1.5 text-center sm:text-left">
                    Subject Hint (Optional — helps AI classify chapter & formulas)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AC Circuits, Linear Algebra, Operating Systems"
                    value={subjectHint}
                    onChange={(e) => setSubjectHint(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Drag and drop interactive area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`max-w-xl mx-auto border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
                    isDragOver
                      ? 'border-secondary bg-secondary/10 scale-[1.01]'
                      : 'border-border hover:border-secondary/40 bg-surface/30'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-secondary mx-auto mb-4 shadow-sm">
                    <UploadCloud className="w-8 h-8 text-secondary" />
                  </div>

                  <p className="text-sm font-semibold text-foreground mb-1">
                    Drag and drop your study photo here
                  </p>
                  <p className="text-xs text-foreground-muted mb-6">
                    Supports JPG, PNG, or WEBP (Max 10MB)
                  </p>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow-lg glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Open Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground font-semibold text-xs border border-border transition-colors flex items-center justify-center gap-2"
                    >
                      <FileImage className="w-4 h-4 text-secondary" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                </div>

                {/* Privacy Guarantee */}
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-surface border border-border text-xs text-foreground-muted flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Student Data Privacy:</strong> Documents and camera streams are processed securely with end-to-end user isolation. Files are preserved for your account only.
                  </p>
                </div>
              </div>
            ) : (
              /* Selected Image Preview with Clear Action Buttons */
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Selected Study Photo</h2>
                    <p className="text-xs text-foreground-muted">
                      Review your image below. Click &quot;Extract Notes&quot; to transcribe text and math.
                    </p>
                  </div>

                  {/* File Metadata Pill */}
                  <div className="flex items-center gap-2 text-xs text-foreground-muted">
                    <span className="px-2.5 py-1 rounded-lg bg-surface border border-border font-medium text-foreground">
                      {selectedFile.name}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-surface border border-border">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>

                {/* Large Image Preview */}
                <div className="relative w-full max-h-[480px] min-h-[280px] bg-black/60 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
                  <img
                    src={previewUrl!}
                    alt="Study material preview"
                    className="w-full max-h-[480px] object-contain"
                  />

                  {isScanning && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-10 h-10 text-secondary animate-spin" />
                      <p className="text-sm font-semibold text-foreground">
                        Extracting text & mathematical notation with Gemini AI...
                      </p>
                      <p className="text-xs text-foreground-muted">Preserving LaTeX formulas and topic tags</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons Toolbar: Large, Accessible, Clearly Visible */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground font-semibold text-xs border border-border transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-secondary" />
                      <span>Replace Photo</span>
                    </button>

                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={() => setShowCamera(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground font-semibold text-xs border border-border transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-secondary" />
                      <span>Retake with Camera</span>
                    </button>

                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={handleRemoveFile}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary Extract Notes Button */}
                  <button
                    type="button"
                    onClick={handleExtractNotes}
                    disabled={isScanning || !selectedFile}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs sm:text-sm shadow-lg glow-primary hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Extracting Notes...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extract Notes</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: REVIEW EXTRACTED TEXT                                 */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="glass-card p-6 sm:p-8 space-y-6">
            {/* Header with Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground">Review Extracted Notes</h2>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Verify or edit the text and mathematical formulas transcribed from your study notes before generating simple explanations.
                </p>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {scanResult?.is_demo ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    ⚡ Demo Mode
                  </span>
                ) : scanResult ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Confidence: {scanResult.confidence}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Subject & Topic inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Academic Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Engineering, Engineering Mathematics"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Chapter / Topic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. AC Circuit Fundamentals & Average Values"
                  value={editedTopic}
                  onChange={(e) => setEditedTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            {/* Uncertain segments highlight */}
            {scanResult?.uncertain_segments && scanResult.uncertain_segments.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-300 mb-1">
                  Unclear or Ambiguous Segments Flagged by OCR:
                </p>
                <ul className="list-disc list-inside text-xs text-amber-300/80 space-y-0.5">
                  {scanResult.uncertain_segments.map((seg, idx) => (
                    <li key={idx}>{seg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content Display: Textarea & Live KaTeX formula preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-foreground">
                  Extracted Note Content (Editable)
                </label>
                <span className="text-[11px] text-foreground-muted font-mono">
                  {editedText.length} characters
                </span>
              </div>
              <textarea
                rows={12}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Transcribed lecture notes with LaTeX formulas ($...$ or $$...$$) will appear here..."
                className="w-full p-4 rounded-xl bg-surface border border-border text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:border-secondary leading-relaxed resize-y"
              />

              {/* Live Formula Preview below textarea if LaTeX is present in raw text */}
              {(editedText.includes('$') || editedText.includes('\\[')) && (
                <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary block tracking-wider">
                    Rendered LaTeX Formula Preview
                  </span>
                  <div className="text-xs sm:text-sm text-foreground leading-relaxed pt-1">
                    <MathRenderer content={editedText} />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndGenerateNotes}
                disabled={!editedText.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg glow-primary hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <span>Generate Simple Notes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: GENERATE SIMPLE NOTES (EXPLANATION)                   */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Toolbar: Mode & Language Controls */}
            <div className="glass-card p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                {/* Language selection */}
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-xs font-semibold text-foreground-muted">Language:</span>
                  <div className="flex rounded-xl bg-surface p-1 border border-border text-xs">
                    {(
                      [
                        { id: 'english', label: 'English' },
                        { id: 'bilingual', label: 'Bilingual (En+Te)' },
                        { id: 'telugu', label: 'తెలుగు (Telugu)' },
                      ] as const
                    ).map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => handleExplainLangChange(lang.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          explainLang === lang.id
                            ? 'bg-secondary text-black font-bold shadow-xs'
                            : 'text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode selection */}
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground-muted">Mode:</span>
                  <div className="flex rounded-xl bg-surface p-1 border border-border text-xs">
                    {(
                      [
                        { id: 'beginner', label: 'Beginner' },
                        { id: 'standard', label: 'Standard' },
                        { id: 'exam', label: 'Exam Prep' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleExplainModeChange(m.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          explainMode === m.id
                            ? 'bg-primary text-white font-semibold shadow-xs'
                            : 'text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions: Copy Notes & Save */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopyNotes}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5"
                >
                  {copiedNotes ? (
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
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-primary" />
                  <span>{savedNoteSuccess ? 'Saved!' : 'Save Note'}</span>
                </button>
              </div>
            </div>

            {/* Error banner */}
            {explainError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {explainError}
              </div>
            )}

            {/* Loading Indicator */}
            {isExplaining && (
              <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
                <p className="text-sm font-semibold text-foreground">
                  Generating simplified study notes in {explainLang} ({explainMode} mode)...
                </p>
                <p className="text-xs text-foreground-muted">Structuring formulas, real-world analogies, and revision notes</p>
              </div>
            )}

            {/* Content Display */}
            {!isExplaining && explanation && (
              <div className="space-y-6">
                {/* 1. Core Summary Card */}
                <div className="glass-card p-6 border-l-4 border-l-secondary space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block">
                    Core Concept Overview
                  </span>
                  <div className="text-sm sm:text-base text-foreground leading-relaxed">
                    <MathRenderer content={explanation.short_summary} />
                  </div>

                  {explanation.telugu_summary && (
                    <div className="mt-3 p-3.5 rounded-xl bg-secondary/5 border border-secondary/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                        తెలుగు సారాంశం (Telugu Key Takeaway)
                      </span>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                        <MathRenderer content={explanation.telugu_summary} />
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Step-by-Step Breakdown */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Step-by-Step Breakdown</span>
                  </h3>
                  <div className="space-y-3">
                    {explanation.detailed_steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-surface border border-border flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="text-xs sm:text-sm text-foreground leading-relaxed flex-1">
                          <MathRenderer content={step} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Definitions & Formulas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Definitions */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Key Definitions</span>
                    </h3>
                    <div className="space-y-3">
                      {explanation.key_definitions.map((def, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-surface border border-border">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-secondary">{def.term}</span>
                            {def.telugu_translation && (
                              <span className="text-[10px] text-foreground-muted bg-surface-elevated px-2 py-0.5 rounded-md">
                                {def.telugu_translation}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-foreground-muted leading-relaxed">
                            <MathRenderer content={def.definition} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formulas */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Formulas & Equations</span>
                    </h3>
                    <div className="space-y-3">
                      {explanation.formulas.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border">
                          <span className="font-semibold text-xs text-foreground block mb-1.5">
                            {item.name}
                          </span>
                          <div className="p-2.5 rounded-lg bg-black/40 border border-border text-center text-xs text-secondary my-1.5 overflow-x-auto">
                            <MathRenderer content={item.latex} block />
                          </div>
                          <div className="text-[11px] text-foreground-muted leading-relaxed mt-1.5">
                            <MathRenderer content={item.explanation} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Real Life Example & Common Mistakes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 border-l-4 border-l-amber-400 space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Real-Life Engineering Application</span>
                    </h3>
                    <div className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                      <MathRenderer content={explanation.real_life_example} />
                    </div>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-l-red-400 space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Common Student Mistakes to Avoid</span>
                    </h3>
                    <div className="space-y-2.5 mt-2">
                      {explanation.common_mistakes.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1.5">
                          <div className="text-red-400 font-medium line-through flex items-start gap-1.5">
                            <span className="shrink-0">✕</span>
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

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit Text
                  </button>

                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg glow-primary hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Generate Practice Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: GENERATE QUIZ                                         */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Quiz Configuration Toolbar: Stacked on mobile (Questions -> Difficulty -> Timer), horizontal on tablet/desktop */}
            <div className="glass-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">
              {/* Selectors Group: Stacked on mobile, side-by-side on tablet/desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
                {/* 1. Questions Selector (Top on mobile) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground-muted shrink-0">
                    Questions
                  </span>
                  <div className="grid grid-cols-2 sm:flex rounded-xl bg-surface p-1 border border-border text-xs w-full sm:w-auto">
                    {[5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumQuestions(num)}
                        className={`py-2 px-4 sm:py-1.5 sm:px-3.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          numQuestions === num
                            ? 'bg-primary text-white shadow-xs glow-primary'
                            : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Difficulty Selector (Directly BELOW Questions on mobile) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground-muted shrink-0">
                    Difficulty
                  </span>
                  <div className="grid grid-cols-3 sm:flex rounded-xl bg-surface p-1 border border-border text-xs w-full sm:w-auto">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setQuizDifficulty(d)}
                        className={`py-2 px-3 sm:py-1.5 sm:px-3 rounded-lg capitalize font-bold text-center transition-all cursor-pointer ${
                          quizDifficulty === d
                            ? 'bg-secondary text-black shadow-xs font-extrabold'
                            : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated/50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Quiz Timer / Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground-muted shrink-0 sm:hidden">
                  Timer
                </span>
                <div className="flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2 sm:py-1.5 rounded-xl bg-surface border border-border text-xs font-mono text-secondary w-full sm:w-auto shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className={`font-bold tracking-wider ${
                      quizRemainingSeconds <= 60 && isQuizTimerRunning ? 'text-red-400 animate-pulse' : ''
                    }`}>
                      {isQuizTimerRunning || isQuizTimerPaused
                        ? formattedQuizTimer
                        : isGeneratingQuiz
                        ? 'Stopped'
                        : formatQuizTime(getQuizDurationSeconds(numQuestions, quizDifficulty))}
                    </span>
                  </div>
                  {isQuizTimerRunning && (
                    <button
                      type="button"
                      onClick={pauseQuizTimer}
                      title="Pause quiz countdown"
                      className="p-1 px-2 rounded-lg bg-surface-elevated border border-border text-[11px] text-foreground-muted hover:text-foreground font-sans flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                  )}
                  {isQuizTimerPaused && (
                    <button
                      type="button"
                      onClick={resumeQuizTimer}
                      title="Resume quiz countdown"
                      className="p-1 px-2.5 rounded-lg bg-secondary text-black text-[11px] font-bold font-sans flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Resume</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Changed Settings Banner when quiz is already active */}
            {quizData && !isGeneratingQuiz && (quizData.questions.length !== numQuestions || quizData.difficulty !== quizDifficulty) && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <span className="text-foreground">
                  Settings changed to <strong>{numQuestions} questions ({quizDifficulty})</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => triggerQuizGeneration(numQuestions, quizDifficulty)}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-hover transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Start Quiz with New Settings</span>
                </button>
              </div>
            )}

            {/* Error notification with Retry */}
            {quizError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{quizError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerQuizGeneration(numQuestions, quizDifficulty, isRetakeMode)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-semibold text-xs flex items-center gap-1.5 self-end sm:self-auto transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Generation</span>
                </button>
              </div>
            )}

            {/* Unstarted Quiz State: Configuration & Start Button */}
            {!isGeneratingQuiz && !quizData && (
              <div className="glass-card p-6 sm:p-8 space-y-6 text-center animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary mx-auto flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Practice Assessment Ready
                  </h3>
                  <p className="text-xs text-foreground-muted max-w-md mx-auto">
                    Select your questions and difficulty above. When you click Start Quiz, fresh questions will be generated. The quiz timer starts only when Question 1 appears.
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-surface border border-border text-xs">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-foreground-muted">Allocated Duration:</span>
                  <strong className="text-secondary font-mono font-bold">
                    {formatQuizTime(getQuizDurationSeconds(numQuestions, quizDifficulty))} ({Math.round(getQuizDurationSeconds(numQuestions, quizDifficulty) / 60)} mins)
                  </strong>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => triggerQuizGeneration(numQuestions, quizDifficulty)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg glow-primary hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Practice Quiz Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator during Question Generation */}
            {isGeneratingQuiz && (
              <div className="glass-card p-10 sm:p-12 text-center flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Preparing your quiz...
                </h4>
                <p className="text-xs text-foreground-muted max-w-md">
                  {isRetakeMode
                    ? "Filtering previously attempted questions to provide fresh practice"
                    : `Generating ${numQuestions} multiple-choice questions grounded in your notes at ${quizDifficulty} difficulty...`}
                </p>
                <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[11px] text-secondary font-mono">
                  ⏱ Quiz timer is stopped and will begin only when Question 1 appears
                </div>
              </div>
            )}

            {/* Offline Bank Notice if applicable */}
            {!isGeneratingQuiz && quizData?.notice && (
              <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{quizData.notice}</span>
              </div>
            )}

            {/* Paused Overlay */}
            {!isGeneratingQuiz && quizData && isQuizTimerPaused && (
              <div className="glass-card p-10 sm:p-12 text-center space-y-4 border border-secondary/30 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary mx-auto flex items-center justify-center">
                  <Pause className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">Quiz Assessment Paused</h3>
                  <p className="text-xs text-foreground-muted">
                    Timer is paused at <strong className="text-secondary font-mono">{formattedQuizTimer}</strong>. The question is hidden while paused.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resumeQuizTimer}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md glow-primary hover:opacity-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume Assessment</span>
                </button>
              </div>
            )}

            {/* Interactive Question Card */}
            {!isGeneratingQuiz && quizData && activeQuestion && !isQuizTimerPaused && (
              <div className="glass-card p-6 sm:p-8 space-y-6">
                {/* Question Header & Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-foreground-muted">
                    <span className="font-bold text-foreground">
                      Question {currentQIndex + 1} of {quizData.total_questions}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-surface border border-border text-[11px] text-secondary">
                      {activeQuestion.topic_tag}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{
                        width: `${((currentQIndex + 1) / quizData.total_questions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Stem */}
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed pt-2">
                  <MathRenderer content={activeQuestion.question} />
                </h3>

                {/* 4 Choices */}
                <div className="space-y-3">
                  {activeQuestion.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === optIdx;
                    const letters = ['A', 'B', 'C', 'D'];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-white shadow-md glow-primary'
                            : 'bg-surface border border-border text-foreground-muted hover:border-border-highlight hover:text-foreground'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-surface-elevated text-foreground-muted border border-border'
                          }`}
                        >
                          {letters[optIdx]}
                        </span>
                        <div className="text-xs sm:text-sm flex-1 leading-relaxed">
                          <MathRenderer content={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation and Submission Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQIndex < quizData.total_questions - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentQIndex((prev) =>
                            Math.min(quizData.total_questions - 1, prev + 1)
                          )
                        }
                        className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmitQuiz(false)}
                        disabled={isSubmittingQuiz}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSubmittingQuiz ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Grading...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit Quiz</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 5: VIEW SCORE & RATIONALE                                */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 5 && quizResult && (
          <div className="space-y-6">
            {/* Score Banner */}
            <div
              className={`glass-card p-6 sm:p-8 text-center border-2 ${
                quizResult.passed ? 'border-emerald-500/50' : 'border-amber-500/50'
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-lg ${
                  quizResult.passed
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/40'
                }`}
              >
                {quizResult.score_percentage}%
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-1">
                {quizResult.passed ? 'Mastery Achieved! 🎉' : 'Keep Practicing! 📚'}
              </h2>
              <p className="text-xs sm:text-sm text-foreground-muted mb-4">
                You scored {quizResult.correct_count} out of {quizResult.total_questions} questions correct in {formatQuizTime(quizResult.time_taken_seconds)}.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    goToStep(4);
                    triggerQuizGeneration(numQuestions, quizDifficulty, true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>

                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-secondary" /> Review Notes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleRemoveFile();
                    goToStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-accent" /> Start New Scan
                </button>
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">
                Question Breakdown & Explanations
              </h3>

              {quizResult.question_reviews.map((item, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                return (
                  <div
                    key={item.id}
                    className={`glass-card p-5 sm:p-6 border-l-4 ${
                      item.is_correct ? 'border-l-emerald-500' : 'border-l-red-500'
                    } space-y-4`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        Question {idx + 1}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.is_correct
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground leading-relaxed">
                      <MathRenderer content={item.question} />
                    </h4>

                    {/* Options status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === item.correct_index;
                        const isSelected = optIdx === item.selected_index;

                        let style = 'bg-surface border-border text-foreground-muted';
                        if (isCorrect) {
                          style = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          style = 'bg-red-500/15 border-red-500/40 text-red-300 line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${style}`}
                          >
                            <span className="font-bold">{letters[optIdx]}.</span>
                            <div className="flex-1">
                              <MathRenderer content={opt} />
                            </div>
                            {isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground-muted space-y-1">
                      <span className="font-bold text-foreground text-[11px] block">
                        Concept Rationale:
                      </span>
                      <div className="leading-relaxed">
                        <MathRenderer content={item.explanation} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
