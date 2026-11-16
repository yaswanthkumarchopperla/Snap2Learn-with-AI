import { Difficulty } from '../types';

export interface QuizDurationMap {
  [numQuestions: number]: {
    easy: number;   // seconds
    medium: number; // seconds
    hard: number;   // seconds
  };
}

/**
 * Centrally configured default durations for Snap2Learn AI quizzes.
 *
 * Configurable default durations:
 * | Question Count | Easy       | Medium     | Hard       |
 * |----------------|------------|------------|------------|
 * | 5 questions    | 5 minutes  | 7 minutes  | 10 minutes |
 * | 10 questions   | 10 minutes | 15 minutes | 20 minutes |
 * | 15 questions   | 15 minutes | 20 minutes | 30 minutes |
 */
export const DEFAULT_QUIZ_DURATIONS: QuizDurationMap = {
  5: {
    easy: 5 * 60,    // 300 seconds (5 mins)
    medium: 7 * 60,  // 420 seconds (7 mins)
    hard: 10 * 60,   // 600 seconds (10 mins)
  },
  10: {
    easy: 10 * 60,   // 600 seconds (10 mins)
    medium: 15 * 60, // 900 seconds (15 mins)
    hard: 20 * 60,   // 1200 seconds (20 mins)
  },
  15: {
    easy: 15 * 60,   // 900 seconds (15 mins)
    medium: 20 * 60, // 1200 seconds (20 mins)
    hard: 30 * 60,   // 1800 seconds (30 mins)
  },
};

/**
 * Returns the allocated quiz time in seconds based on question count and difficulty.
 */
export function getQuizDurationSeconds(
  numQuestions: number,
  difficulty: Difficulty = 'medium'
): number {
  const normalizedCount = numQuestions <= 5 ? 5 : numQuestions <= 10 ? 10 : 15;
  const config = DEFAULT_QUIZ_DURATIONS[normalizedCount] || DEFAULT_QUIZ_DURATIONS[5];
  const safeDiff = (difficulty?.toLowerCase() as Difficulty) || 'medium';
  return config[safeDiff] ?? config.medium;
}

/**
 * Formats a duration in seconds to standard MM:SS display.
 * Example: 155 -> "02:35", 0 -> "00:00"
 */
export function formatQuizTime(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safeSecs / 60);
  const s = safeSecs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export type QuizPerformanceStatus = 'EXCELLENT' | 'GOOD' | 'REVIEW';

export interface QuizStatusMeta {
  status: QuizPerformanceStatus;
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Calculates dynamic status based on actual quiz score and accuracy:
 * - 80% to 100%: EXCELLENT
 * - 60% to 79%: GOOD
 * - Below 60%: REVIEW
 */
export function getQuizPerformanceStatus(scorePercentage: number): QuizStatusMeta {
  const score = Math.round(scorePercentage || 0);
  if (score >= 80) {
    return {
      status: 'EXCELLENT',
      label: 'EXCELLENT',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    };
  }
  if (score >= 60) {
    return {
      status: 'GOOD',
      label: 'GOOD',
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
    };
  }
  return {
    status: 'REVIEW',
    label: 'REVIEW',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  };
}


