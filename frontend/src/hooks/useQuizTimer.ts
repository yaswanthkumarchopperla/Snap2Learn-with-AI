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
  formattedTimeTaken: string;
  startTimer: (durationSeconds?: number, initialRemainingSeconds?: number, initialElapsedSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => number;
  resetTimer: (newDurationSeconds?: number) => void;
  getTimeTakenSeconds: () => number;
}

export function useQuizTimer(options?: UseQuizTimerOptions): UseQuizTimerReturn {
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);
  const deadlineRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const onTimeExpiredRef = useRef(options?.onTimeExpired);
  const hasExpiredTriggeredRef = useRef(false);

  // Keep callback ref updated to avoid stale closures
  useEffect(() => {
    onTimeExpiredRef.current = options?.onTimeExpired;
  }, [options?.onTimeExpired]);

  // Safely calculate elapsed active seconds using timestamps
  const calcElapsedSeconds = useCallback((now: number = Date.now()): number => {
    if (!startTimeRef.current) return 0;
    const effectiveEnd = endTimeRef.current ?? (pausedAtRef.current ?? now);
    const elapsedMs = Math.max(0, effectiveEnd - startTimeRef.current - totalPausedMsRef.current);
    return Math.round(elapsedMs / 1000);
  }, []);

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

  // Tick logic: recalculates elapsed time and countdown remaining time
  const handleTick = useCallback(() => {
    const now = Date.now();
    const elapsed = calcElapsedSeconds(now);
    setTimeTakenSeconds(elapsed);

    if (deadlineRef.current > 0) {
      const diffMs = deadlineRef.current - now;
      const secondsLeft = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        clearIntervalSafely();
        endTimeRef.current = now;
        setStatus('expired');
        const finalDur = totalDurationRef.current > 0 ? totalDurationRef.current : elapsed;
        setTimeTakenSeconds(finalDur);
        if (!hasExpiredTriggeredRef.current) {
          hasExpiredTriggeredRef.current = true;
          onTimeExpiredRef.current?.();
        }
      }
    }
  }, [calcElapsedSeconds, clearIntervalSafely]);

  // Start the timer based on real timestamps
  const startTimer = useCallback(
    (durationSeconds?: number, initialRemainingSeconds?: number, initialElapsedSeconds?: number) => {
      clearIntervalSafely();

      const now = Date.now();
      const elapsedMs = Math.max(0, (initialElapsedSeconds || 0) * 1000);
      startTimeRef.current = now - elapsedMs;
      endTimeRef.current = null;
      pausedAtRef.current = null;
      totalPausedMsRef.current = 0;
      hasExpiredTriggeredRef.current = false;

      const hasDuration = typeof durationSeconds === 'number' && durationSeconds > 0;
      if (hasDuration) {
        const duration = Math.max(1, Math.floor(durationSeconds));
        const initialRemaining =
          initialRemainingSeconds !== undefined
            ? Math.max(0, Math.floor(initialRemainingSeconds))
            : duration;

        totalDurationRef.current = duration;
        setTotalDurationSeconds(duration);
        setRemainingSeconds(initialRemaining);

        if (initialRemaining <= 0) {
          setStatus('expired');
          endTimeRef.current = now;
          setTimeTakenSeconds(duration);
          if (!hasExpiredTriggeredRef.current) {
            hasExpiredTriggeredRef.current = true;
            onTimeExpiredRef.current?.();
          }
          return;
        }

        deadlineRef.current = now + initialRemaining * 1000;
      } else {
        totalDurationRef.current = 0;
        deadlineRef.current = 0;
        setTotalDurationSeconds(0);
        setRemainingSeconds(0);
      }

      const initialElapsed = initialElapsedSeconds || 0;
      setTimeTakenSeconds(initialElapsed);
      setStatus('running');

      intervalRef.current = setInterval(handleTick, 250);
    },
    [clearIntervalSafely, handleTick]
  );

  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (status !== 'running') return;
    clearIntervalSafely();

    const now = Date.now();
    pausedAtRef.current = now;

    if (deadlineRef.current > 0) {
      const currentRemaining = Math.max(0, Math.ceil((deadlineRef.current - now) / 1000));
      setRemainingSeconds(currentRemaining);
    }
    setTimeTakenSeconds(calcElapsedSeconds(now));
    setStatus('paused');
  }, [status, clearIntervalSafely, calcElapsedSeconds]);

  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (status !== 'paused') return;
    clearIntervalSafely();

    const now = Date.now();
    if (pausedAtRef.current) {
      const pausedMs = now - pausedAtRef.current;
      totalPausedMsRef.current += pausedMs;
      if (deadlineRef.current > 0) {
        deadlineRef.current += pausedMs;
      }
      pausedAtRef.current = null;
    }

    setStatus('running');
    intervalRef.current = setInterval(handleTick, 250);
  }, [status, clearIntervalSafely, handleTick]);

  // Stop the timer upon submission or completion, returning exact elapsed seconds
  const stopTimer = useCallback((): number => {
    clearIntervalSafely();
    const now = Date.now();
    if (!endTimeRef.current) {
      endTimeRef.current = now;
    }
    setStatus('completed');

    let finalElapsed = calcElapsedSeconds(endTimeRef.current);
    if (totalDurationRef.current > 0 && status === 'expired') {
      finalElapsed = totalDurationRef.current;
    }

    setTimeTakenSeconds(finalElapsed);
    return finalElapsed;
  }, [clearIntervalSafely, calcElapsedSeconds, status]);

  // Reset the timer back to idle
  const resetTimer = useCallback(
    (newDurationSeconds?: number) => {
      clearIntervalSafely();
      hasExpiredTriggeredRef.current = false;
      startTimeRef.current = null;
      endTimeRef.current = null;
      pausedAtRef.current = null;
      totalPausedMsRef.current = 0;
      deadlineRef.current = 0;
      totalDurationRef.current = newDurationSeconds || 0;

      const dur = newDurationSeconds !== undefined ? newDurationSeconds : 0;
      setTotalDurationSeconds(dur);
      setRemainingSeconds(dur);
      setTimeTakenSeconds(0);
      setStatus('idle');
    },
    [clearIntervalSafely]
  );

  // Retrieve current elapsed seconds synchronously from timestamps
  const getTimeTakenSeconds = useCallback((): number => {
    return calcElapsedSeconds(Date.now());
  }, [calcElapsedSeconds]);

  return {
    remainingSeconds,
    totalDurationSeconds,
    timeTakenSeconds,
    status,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isExpired: status === 'expired',
    formattedTime: formatQuizTime(remainingSeconds),
    formattedTimeTaken: formatQuizTime(timeTakenSeconds),
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    getTimeTakenSeconds,
  };
}
