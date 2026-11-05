import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AutosaveStatus } from '../types';
import { offlineSync } from '../services/offlineSync';
import { api } from '../services/api';

interface AutosaveContextType {
  status: AutosaveStatus;
  lastSaved: Date | null;
  isOnline: boolean;
  pendingOfflineCount: number;
  triggerAutosave: <T>(saveFn: () => Promise<T>, fallbackOfflineTask?: {
    type: 'note' | 'flashcard' | 'quiz_progress' | 'preferences';
    action: 'create' | 'update' | 'review';
    endpoint: string;
    payload: any;
  }) => Promise<T | null>;
  setAutosaveStatus: (status: AutosaveStatus) => void;
  syncNow: () => Promise<void>;
}

const AutosaveContext = createContext<AutosaveContextType | null>(null);

export const AutosaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(offlineSync.pendingCount);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPingingRef = useRef<boolean>(false);

  // Proactive Backend Connectivity Check
  const checkBackendReachability = useCallback(async () => {
    if (isPingingRef.current) return;
    isPingingRef.current = true;

    try {
      const isReachable = await api.ping();
      setIsOnline(isReachable);

      if (isReachable) {
        if (offlineSync.pendingCount > 0) {
          offlineSync.processQueue();
        } else {
          setStatus((prev) => (prev === 'offline' ? (lastSaved ? 'saved' : 'idle') : prev));
        }
      } else {
        setStatus('offline');
      }
    } catch {
      setIsOnline(false);
      setStatus('offline');
    } finally {
      isPingingRef.current = false;
    }
  }, [lastSaved]);

  useEffect(() => {
    // Initial check on mount
    checkBackendReachability();

    // Browser network events
    const handleOnline = () => {
      checkBackendReachability();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to offline queue changes
    const unsubCount = offlineSync.subscribe((count) => {
      setPendingOfflineCount(count);
      if (count > 0 && !isOnline) {
        setStatus('offline');
      }
    });

    // Notify when queued tasks drain successfully
    const unsubDrained = offlineSync.onQueueDrained(() => {
      setLastSaved(new Date());
      setStatus('saved');
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 3500);
    });

    // Periodic heartbeat to detect waking server or network reconnection (every 10 seconds)
    const intervalId = setInterval(() => {
      checkBackendReachability();
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubCount();
      unsubDrained();
      clearInterval(intervalId);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [checkBackendReachability, isOnline]);

  const triggerAutosave = useCallback(async <T,>(
    saveFn: () => Promise<T>,
    fallbackOfflineTask?: {
      type: 'note' | 'flashcard' | 'quiz_progress' | 'preferences';
      action: 'create' | 'update' | 'review';
      endpoint: string;
      payload: any;
    }
  ): Promise<T | null> => {
    // Check local network state first
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (fallbackOfflineTask) {
        offlineSync.enqueue(fallbackOfflineTask);
      }
      setIsOnline(false);
      setStatus('offline');
      return null;
    }

    setStatus('saving');
    try {
      const result = await saveFn();
      // Confirmed persistence on backend
      setStatus('saved');
      setLastSaved(new Date());
      setIsOnline(true);

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 3500);

      return result;
    } catch (err: any) {
      console.error('Autosave operation failed:', err);
      const errMsg = String(err?.message || err).toLowerCase();
      const isNetworkIssue =
        errMsg.includes('failed to fetch') ||
        errMsg.includes('network') ||
        errMsg.includes('timeout') ||
        errMsg.includes('503') ||
        errMsg.includes('502') ||
        errMsg.includes('504') ||
        errMsg.includes('load failed');

      if (isNetworkIssue) {
        setIsOnline(false);
        if (fallbackOfflineTask) {
          offlineSync.enqueue(fallbackOfflineTask);
          setStatus('offline');
        } else {
          setStatus('error');
        }
        // Schedule immediate check in 3 seconds
        setTimeout(() => checkBackendReachability(), 3000);
      } else {
        // Permanent application error or validation error
        setStatus('error');
      }
      return null;
    }
  }, [checkBackendReachability]);

  const syncNow = useCallback(async () => {
    await checkBackendReachability();
    if (offlineSync.pendingCount > 0) {
      setStatus('saving');
      await offlineSync.processQueue();
    }
  }, [checkBackendReachability]);

  return (
    <AutosaveContext.Provider
      value={{
        status,
        lastSaved,
        isOnline,
        pendingOfflineCount,
        triggerAutosave,
        setAutosaveStatus: setStatus,
        syncNow,
      }}
    >
      {children}
    </AutosaveContext.Provider>
  );
};

export function useAutosave(): AutosaveContextType {
  const context = useContext(AutosaveContext);
  if (!context) {
    throw new Error('useAutosave must be used within an AutosaveProvider');
  }
  return context;
}
