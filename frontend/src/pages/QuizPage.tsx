import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosave } from '../contexts/AutosaveContext';
import { api } from '../services/api';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { getQuizDurationSeconds, formatQuizTime } from '../config/quizConfig';
import {
  QuizGenerateResponse,
  QuizSubmitResponse,
  ActiveQuizResponse,
  Difficulty,
  QuestionClientView
} from '../types';

export const QuizPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerAutosave } = useAutosave();

  const studyText = location.state?.text ||
    'Let A be an n × n square matrix. A scalar λ is called an eigenvalue of A if there exists a non-zero column vector v such that A v = λ v. The characteristic equation is det(A - λ I) = 0. Trace equals sum of eigenvalues and determinant equals product of eigenvalues.';
  const subject = location.state?.subject || 'Engineering Mathematics';
  const topic = location.state?.topic || 'Eigenvalues & Matrix Properties';

  // Configuration State
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timedMode, setTimedMode] = useState<boolean>(true);

  // Active Quiz State & Recovery
  const [activeQuizRestored, setActiveQuizRestored] = useState<ActiveQuizResponse | null>(null);
  const [quizState, setQuizState] = useState<'config' | 'taking' | 'submitted'>('config');
  const [quizData, setQuizData] = useState<QuizGenerateResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Results State
  const [submitResult, setSubmitResult] = useState<QuizSubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // References to avoid stale closures in timer expiration callback
  const quizDataRef = useRef<QuizGenerateResponse | null>(null);
  quizDataRef.current = quizData;
  const selectedAnswersRef = useRef<Record<string, number>>({});
  selectedAnswersRef.current = selectedAnswers;

  // Submit Quiz: calls backend /api/quiz/submit
  const handleSubmitQuiz = useCallback(async (isTimeout: boolean = false) => {
    const activeQuiz = quizDataRef.current;
    if (!activeQuiz) return;
    stopTimer();
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await api.submitQuiz({
        quiz_id: activeQuiz.quiz_id,
        answers: selectedAnswersRef.current,
        time_taken_seconds: timeTakenSeconds,
      });
      setSubmitResult(result);
      setQuizState('submitted');

      // Trigger confetti celebration if passed!
      if (result.passed) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7559FF', '#22D3EE', '#A855F7'],
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Countdown Timer based on absolute end timestamp
  const {
    remainingSeconds,
    totalDurationSeconds,
    timeTakenSeconds,
    status: timerStatus,
    isRunning: isTimerRunning,
    isPaused: isTimerPaused,
    formattedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  } = useQuizTimer({
    onTimeExpired: () => {
      handleSubmitQuiz(true);
    },
  });

  // Check for active incomplete quiz on mount
  useEffect(() => {
    api.getActiveQuiz().then((res) => {
      if (res.has_active_quiz && res.questions && res.questions.length > 0) {
        setActiveQuizRestored(res);
      }
    }).catch(() => {});
  }, []);

  const handleResumeActiveQuiz = () => {
    if (!activeQuizRestored) return;
    const duration = getQuizDurationSeconds(
      activeQuizRestored.total_questions || activeQuizRestored.questions.length,
      (activeQuizRestored.difficulty as Difficulty) || 'medium'
    );
    const elapsed = activeQuizRestored.time_taken_seconds || 0;
    const remaining = Math.max(0, duration - elapsed);

    setQuizData({
      quiz_id: activeQuizRestored.quiz_id || 'active-quiz',
      title: activeQuizRestored.title || 'In-Progress Assessment',
      subject: activeQuizRestored.subject || 'Engineering',
      topic: activeQuizRestored.topic || 'Core Concepts',
      difficulty: activeQuizRestored.difficulty || 'medium',
      total_questions: activeQuizRestored.total_questions || activeQuizRestored.questions.length,
      questions: activeQuizRestored.questions,
      is_demo: false,
    });
    setCurrentIndex(activeQuizRestored.current_question_index || 0);
    setSelectedAnswers(activeQuizRestored.answers || {});
    setQuizState('taking');
    setActiveQuizRestored(null);

    // If remaining time has already expired, immediately submit
    if (timedMode) {
      if (remaining <= 0) {
        handleSubmitQuiz(true);
      } else {
        startTimer(duration, remaining);
      }
    }
  };

  // Start Quiz: calls backend /api/quiz/generate
  const handleStartQuiz = async () => {
    setLoading(true);
    setErrorMsg(null);
    resetTimer(); // 5. Keep quiz timer completely stopped during question generation
    try {
      const data = await api.generateQuiz({
        study_text: studyText,
        subject,
        topic,
        num_questions: numQuestions,
        difficulty,
      });
      // 6 & 7. Wait until all questions are successfully generated and rendered
      setQuizData(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setQuizState('taking');

      // 8. Start the countdown timer ONLY when the first question is visible and the quiz is ready
      const allocatedDuration = getQuizDurationSeconds(numQuestions, difficulty);
      if (timedMode) {
        startTimer(allocatedDuration);
      }
    } catch (err: any) {
      // 4. If generation fails: stop loading state, do not start timer, show error and retry
      setErrorMsg(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select option for current question and immediately autosave
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: optionIndex,
    };
    setSelectedAnswers(newAnswers);

    if (quizData) {
      triggerAutosave(async () => {
        return await api.saveQuizProgress({
          quiz_id: quizData.quiz_id,
          answers: newAnswers,
          current_question_index: currentIndex,
          time_taken_seconds: timeTakenSeconds,
        });
      }, {
        type: 'quiz_progress',
        action: 'update',
        endpoint: `/api/quiz/${quizData.quiz_id}/progress`,
        payload: {
          quiz_id: quizData.quiz_id,
          answers: newAnswers,
          current_question_index: currentIndex,
          time_taken_seconds: timeTakenSeconds,
        }
      });
    }
  };

  const goToQuestion = (targetIdx: number) => {
    setCurrentIndex(targetIdx);
    if (quizData) {
      api.saveQuizProgress({
        quiz_id: quizData.quiz_id,
        answers: selectedAnswers,
        current_question_index: targetIdx,
        time_taken_seconds: timeTakenSeconds,
      }).catch(() => {});
    }
  };

  const currentQ: QuestionClientView | undefined = quizData?.questions[currentIndex];

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                {subject}
              </span>
              <span className="text-xs text-foreground-muted">{topic}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Award className="w-6 h-6 text-secondary" />
              <span>AI Quiz Arena</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <AutosaveIndicator compact={quizState === 'taking'} />
            {quizState === 'taking' && timedMode && (
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                    remainingSeconds <= 60
                      ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse font-bold'
                      : 'bg-surface border-border text-secondary'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-bold tracking-wider">{formattedTime}</span>
                </div>
                {isTimerRunning && (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    title="Pause timer"
                    className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-elevated text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pause</span>
                  </button>
                )}
                {isTimerPaused && (
                  <button
                    type="button"
                    onClick={resumeTimer}
                    title="Resume timer"
                    className="px-3 py-1.5 rounded-xl bg-secondary text-black font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Unfinished Quiz Auto-Restoration Alert */}
        {activeQuizRestored && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Unfinished Assessment Detected
                </h4>
              </div>
              <p className="text-xs text-foreground-muted">
                You have a saved quiz session: <strong className="text-foreground">{activeQuizRestored.title}</strong> with{' '}
                {Object.keys(activeQuizRestored.answers || {}).length} of {activeQuizRestored.total_questions || activeQuizRestored.questions.length} questions already answered.
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveQuizRestored(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-foreground-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                Start Fresh
              </button>
              <button
                type="button"
                onClick={handleResumeActiveQuiz}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-md glow-primary hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume Saved Quiz</span>
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={handleStartQuiz}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-semibold text-xs flex items-center gap-1.5 self-end sm:self-auto transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
            </button>
          </div>
        )}

        {/* ----------------- STATE 1: CONFIGURATION ----------------- */}
        {quizState === 'config' && (
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Configure Your Assessment</h3>
              <p className="text-xs text-foreground-muted">
                Questions will be generated dynamically from your confirmed study notes. The quiz timer starts only after questions are ready.
              </p>
            </div>

            {/* Questions count */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumQuestions(num)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      numQuestions === num
                        ? 'bg-primary text-white border-primary shadow-md glow-primary'
                        : 'bg-surface border-border text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selection */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { id: 'easy', label: 'Easy', desc: 'Direct recall & definitions' },
                    { id: 'medium', label: 'Medium', desc: 'Formula application' },
                    { id: 'hard', label: 'Hard', desc: 'Complex problem solving' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      difficulty === lvl.id
                        ? 'bg-secondary/15 border-secondary text-secondary shadow-md'
                        : 'bg-surface border-border text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    <p className="font-bold text-xs">{lvl.label}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Timed Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Timed Exam Mode</p>
                  <p className="text-[11px] text-foreground-muted">
                    Allocated duration: <strong className="text-secondary font-mono">{formatQuizTime(getQuizDurationSeconds(numQuestions, difficulty))}</strong> ({Math.round(getQuizDurationSeconds(numQuestions, difficulty)/60)} minutes)
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={timedMode}
                onChange={(e) => setTimedMode(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </div>

            {/* Dedicated Loading Card during question generation */}
            {loading ? (
              <div className="p-8 rounded-2xl bg-surface border border-secondary/30 text-center flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Preparing your quiz...
                </h4>
                <p className="text-xs text-foreground-muted max-w-md">
                  Generating {numQuestions} fresh questions grounded in your notes at {difficulty} difficulty with KaTeX formatting and deterministic scoring.
                </p>
                <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[11px] text-secondary font-mono">
                  ⏱ Quiz timer is stopped and will start only when Question 1 appears
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow-lg glow-primary hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Start Practice Quiz ({formatQuizTime(getQuizDurationSeconds(numQuestions, difficulty))})</span>
              </button>
            )}
          </div>
        )}

        {/* ----------------- STATE 2: TAKING QUIZ ----------------- */}
        {quizState === 'taking' && quizData && currentQ && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-foreground-muted font-medium">
                <span>
                  Question {currentIndex + 1} of {quizData.total_questions}
                </span>
                <span>
                  {Object.keys(selectedAnswers).length}/{quizData.total_questions} Answered
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / quizData.total_questions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Paused Overlay */}
            {isTimerPaused ? (
              <div className="glass-card p-10 sm:p-12 text-center space-y-4 border border-secondary/30 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary mx-auto flex items-center justify-center">
                  <Pause className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">Quiz Assessment Paused</h3>
                  <p className="text-xs text-foreground-muted">
                    Timer is safely paused at <strong className="text-secondary font-mono">{formattedTime}</strong>. Questions are hidden while paused.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resumeTimer}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md glow-primary hover:opacity-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume Assessment</span>
                </button>
              </div>
            ) : (
              /* Question Card */
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-surface text-secondary border border-border">
                    {currentQ.topic_tag}
                  </span>
                  <span className="text-xs text-foreground-muted capitalize">
                    {quizData.difficulty}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                  <MathRenderer content={currentQ.question} />
                </h2>

                {/* 4 Choices */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;
                    const optionLetters = ['A', 'B', 'C', 'D'];
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-white shadow-md glow-primary'
                            : 'bg-surface border-border text-foreground-muted hover:border-border-highlight hover:text-foreground'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-surface-elevated text-foreground-muted border border-border'
                          }`}
                        >
                          {optionLetters[optIdx]}
                        </span>
                        <div className="text-xs sm:text-sm flex-1">
                          <MathRenderer content={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  {currentIndex < quizData.total_questions - 1 ? (
                    <button
                      type="button"
                      onClick={() => goToQuestion(Math.min(quizData.total_questions - 1, currentIndex + 1))}
                      className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmitQuiz(false)}
                      disabled={loading}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Final Answers</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- STATE 3: SUBMISSION RESULTS & DETAILED REVIEW ----------------- */}
        {quizState === 'submitted' && submitResult && (
          <div className="space-y-6">
            {/* Score Summary Banner */}
            <div
              className={`glass-card p-6 sm:p-8 text-center border-2 ${
                submitResult.passed ? 'border-emerald-500/50' : 'border-amber-500/50'
              }`}
            >
              <div className="inline-flex p-3 rounded-full bg-surface-elevated mb-3">
                {submitResult.passed ? (
                  <Award className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
                {submitResult.passed ? 'Congratulations! You Passed!' : 'Good Effort! Keep Practicing!'}
              </h2>
              <p className="text-xs text-foreground-muted mb-6">
                {submitResult.revision_recommendation}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] text-foreground-muted block">Score</span>
                  <span className="text-xl font-extrabold text-foreground">
                    {submitResult.correct_count} / {submitResult.total_questions}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] text-foreground-muted block">Accuracy</span>
                  <span className="text-xl font-extrabold text-secondary">
                    {submitResult.score_percentage}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] text-foreground-muted block">Status</span>
                  <span
                    className={`text-xl font-extrabold ${
                      submitResult.passed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {submitResult.passed ? 'PASS' : 'REVIEW'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] text-foreground-muted block">Time Taken</span>
                  <span className="text-xl font-extrabold text-foreground">
                    {formatQuizTime(submitResult.time_taken_seconds)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setQuizState('config')}
                  className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Configure New Quiz</span>
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
                >
                  <span>View Progress Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question by Question Review */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">
                Detailed Answer Key & Mistake Analysis
              </h3>

              {submitResult.question_reviews.map((rev, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                return (
                  <div
                    key={rev.id}
                    className={`glass-card p-5 border-l-4 ${
                      rev.is_correct ? 'border-l-emerald-500' : 'border-l-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">
                          Q{idx + 1}. {rev.topic_tag}
                        </span>
                        {rev.is_correct ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Correct (+1)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Incorrect (0)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-foreground mb-3">
                      <MathRenderer content={rev.question} />
                    </p>

                    {/* Choices Review */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {rev.options.map((opt, oIdx) => {
                        const isSelected = rev.selected_index === oIdx;
                        const isCorrect = rev.correct_index === oIdx;
                        let borderStyle = 'border-border bg-surface text-foreground-muted';
                        if (isCorrect) {
                          borderStyle = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          borderStyle = 'border-red-500/60 bg-red-500/10 text-red-300 line-through';
                        }
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${borderStyle}`}
                          >
                            <span className="font-bold shrink-0">{letters[oIdx]}.</span>
                            <span className="flex-1">
                              <MathRenderer content={opt} />
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-lg bg-surface-elevated border border-border text-xs text-foreground-muted leading-relaxed">
                      <span className="font-bold text-secondary block mb-0.5">Why this is correct:</span>
                      <MathRenderer content={rev.explanation} />
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
