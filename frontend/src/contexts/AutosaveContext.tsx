import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AutosaveStatus } from '../types';
import { offlineSync } from '../services/offlineSync';

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
}

const AutosaveContext = createContext<AutosaveContextType | null>(null);

export const AutosaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(offlineSync.pendingCount);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineSync.processQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = offlineSync.subscribe((count) => {
      setPendingOfflineCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  const triggerAutosave = useCallback(async <T,>(
    saveFn: () => Promise<T>,
    fallbackOfflineTask?: {
      type: 'note' | 'flashcard' | 'quiz_progress' | 'preferences';
      action: 'create' | 'update' | 'review';
      endpoint: string;
      payload: any;
    }
  ): Promise<T | null> => {
    if (!navigator.onLine) {
      if (fallbackOfflineTask) {
        offlineSync.enqueue(fallbackOfflineTask);
      }
      setStatus('offline');
      return null;
    }

    setStatus('saving');
    try {
      const result = await saveFn();
      setStatus('saved');
      setLastSaved(new Date());

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 3500);

      return result;
    } catch (err) {
      console.error('Autosave operation failed:', err);
      if (fallbackOfflineTask) {
        offlineSync.enqueue(fallbackOfflineTask);
        setStatus('offline');
      } else {
        setStatus('error');
      }
      return null;
    }
  }, []);

  return (
    <AutosaveContext.Provider
      value={{
        status,
        lastSaved,
        isOnline,
        pendingOfflineCount,
        triggerAutosave,
        setAutosaveStatus: setStatus,
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
