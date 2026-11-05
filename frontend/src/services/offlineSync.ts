import { api } from './api';

export interface OfflineTask {
  id: string;
  type: 'note' | 'flashcard' | 'quiz_progress' | 'preferences';
  action: 'create' | 'update' | 'review';
  endpoint: string;
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = 'snap2learn_offline_queue';

class OfflineSyncManager {
  private queue: OfflineTask[] = [];
  private isProcessing = false;
  private listeners: ((count: number) => void)[] = [];
  private drainedListeners: (() => void)[] = [];
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Quota exceeded or private storage restricted
    }
    this.notify();
  }

  public subscribe(listener: (count: number) => void) {
    this.listeners.push(listener);
    listener(this.queue.length);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public onQueueDrained(listener: () => void) {
    this.drainedListeners.push(listener);
    return () => {
      this.drainedListeners = this.drainedListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.queue.length));
    if (this.queue.length === 0) {
      this.drainedListeners.forEach(l => l());
    }
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public get isSyncing(): boolean {
    return this.isProcessing;
  }

  public enqueue(task: Omit<OfflineTask, 'id' | 'timestamp'>) {
    // Deduplicate updates for the same target entity ID
    const targetId = task.payload.id || task.payload.quiz_id || task.payload.note_id;
    if (targetId) {
      this.queue = this.queue.filter(t => {
        const tId = t.payload.id || t.payload.quiz_id || t.payload.note_id;
        return !(t.type === task.type && tId === targetId && t.action === task.action);
      });
    }

    const newTask: OfflineTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    this.queue.push(newTask);
    this.saveQueue();

    // Trigger immediate attempt if browser reports online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processQueue();
    }
  }

  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue[0];
      try {
        if (task.type === 'note') {
          if (task.action === 'create') {
            await api.createNote(task.payload);
          } else if (task.action === 'update') {
            await api.updateNote(task.payload.id, task.payload);
          }
        } else if (task.type === 'flashcard') {
          if (task.action === 'create') {
            await api.createFlashcard(task.payload);
          } else if (task.action === 'update') {
            await api.updateFlashcard(task.payload.id, task.payload);
          } else if (task.action === 'review') {
            await api.reviewFlashcard(task.payload.id, task.payload.rating, task.payload.learning_status);
          }
        } else if (task.type === 'quiz_progress') {
          await api.saveQuizProgress(task.payload);
        } else if (task.type === 'preferences') {
          await api.updatePreferences(task.payload);
        }

        // Task succeeded, remove from queue
        this.queue.shift();
        this.saveQueue();
      } catch (err: any) {
        console.warn('Offline sync attempt paused:', err);
        const errMsg = String(err?.message || err).toLowerCase();
        const isPermanentClientError = errMsg.includes('400') || errMsg.includes('422') || errMsg.includes('required');

        if (isPermanentClientError) {
          // Discard invalid task to avoid wedging queue
          console.error('Discarding malformed offline task:', task);
          this.queue.shift();
          this.saveQueue();
          continue;
        }

        // Temporary network or server glitch: pause and schedule automatic retry in 6s
        this.retryTimeout = setTimeout(() => {
          this.processQueue();
        }, 6000);
        break;
      }
    }

    this.isProcessing = false;
  }
}

export const offlineSync = new OfflineSyncManager();
