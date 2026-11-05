import { useState, useEffect, useRef, useCallback } from 'react';
import { formatQuizTime } from '../config/quizConfig';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired' | 'completed';

export interface UseQuizTimerOptions {
  onTimeExpired?: () => void;
}

export interface UseQuizTimerReturn {
  remainingSeconds: number;
  totalDurationSeconds: number;
  timeTakenSeconds: number;
  status: TimerStatus;
  isRunning: boolean;
  isPaused: boolean;
  isExpired: boolean;
  formattedTime: string;
  startTimer: (durationSeconds: number, initialRemainingSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: (newDurationSeconds?: number) => void;
}

export function useQuizTimer(options?: UseQuizTimerOptions): UseQuizTimerReturn {
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(0);
  const onTimeExpiredRef = useRef(options?.onTimeExpired);
  const hasExpiredTriggeredRef = useRef(false);

  // Keep callback ref updated to avoid stale closures
  useEffect(() => {
    onTimeExpiredRef.current = options?.onTimeExpired;
  }, [options?.onTimeExpired]);

  // Clear any existing active interval
  const clearIntervalSafely = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearIntervalSafely();
    };
  }, [clearIntervalSafely]);

  // Start the countdown timer based on an absolute end timestamp
  const startTimer = useCallback((durationSeconds: number, initialRemainingSeconds?: number) => {
    clearIntervalSafely();

    const duration = Math.max(1, Math.floor(durationSeconds));
    const initialRemaining = initialRemainingSeconds !== undefined
      ? Math.max(0, Math.floor(initialRemainingSeconds))
      : duration;

    setTotalDurationSeconds(duration);
    setRemainingSeconds(initialRemaining);
    hasExpiredTriggeredRef.current = false;

    if (initialRemaining <= 0) {
      setStatus('expired');
      if (!hasExpiredTriggeredRef.current) {
        hasExpiredTriggeredRef.current = true;
        onTimeExpiredRef.current?.();
      }
      return;
    }

    // Set absolute end timestamp
    endTimeRef.current = Date.now() + initialRemaining * 1000;
    setStatus('running');

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diffMs = endTimeRef.current - now;
      const secondsLeft = Math.max(0, Math.ceil(diffMs / 1000));

      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        clearIntervalSafely();
        setStatus('expired');
        if (!hasExpiredTriggeredRef.current) {
          hasExpiredTriggeredRef.current = true;
          onTimeExpiredRef.current?.();
        }
      }
    }, 250); // Frequent tick ensures sub-second accuracy with zero drift
  }, [clearIntervalSafely]);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (status !== 'running') return;
    clearIntervalSafely();

    const now = Date.now();
    const currentRemaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
    pausedRemainingRef.current = currentRemaining;
    setRemainingSeconds(currentRemaining);
    setStatus('paused');
  }, [status, clearIntervalSafely]);

  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (status !== 'paused') return;
    clearIntervalSafely();

    const remaining = pausedRemainingRef.current;
    if (remaining <= 0) {
      setStatus('expired');
      if (!hasExpiredTriggeredRef.current) {
        hasExpiredTriggeredRef.current = true;
        onTimeExpiredRef.current?.();
      }
      return;
    }

    endTimeRef.current = Date.now() + remaining * 1000;
    setStatus('running');

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diffMs = endTimeRef.current - now;
      const secondsLeft = Math.max(0, Math.ceil(diffMs / 1000));

      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        clearIntervalSafely();
        setStatus('expired');
        if (!hasExpiredTriggeredRef.current) {
          hasExpiredTriggeredRef.current = true;
          onTimeExpiredRef.current?.();
        }
      }
    }, 250);
  }, [status, clearIntervalSafely]);

  // Stop the timer (e.g. upon submission)
  const stopTimer = useCallback(() => {
    clearIntervalSafely();
    setStatus('completed');
  }, [clearIntervalSafely]);

  // Reset the timer back to idle
  const resetTimer = useCallback((newDurationSeconds?: number) => {
    clearIntervalSafely();
    hasExpiredTriggeredRef.current = false;
    const dur = newDurationSeconds !== undefined ? newDurationSeconds : totalDurationSeconds;
    setTotalDurationSeconds(dur);
    setRemainingSeconds(dur);
    setStatus('idle');
  }, [clearIntervalSafely, totalDurationSeconds]);

  const timeTakenSeconds = Math.max(0, totalDurationSeconds - remainingSeconds);

  return {
    remainingSeconds,
    totalDurationSeconds,
    timeTakenSeconds,
    status,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isExpired: status === 'expired',
    formattedTime: formatQuizTime(remainingSeconds),
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  };
}

