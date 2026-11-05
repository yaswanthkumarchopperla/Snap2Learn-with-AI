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
      // quota or local storage unavailable
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

  private notify() {
    this.listeners.forEach(l => l(this.queue.length));
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public enqueue(task: Omit<OfflineTask, 'id' | 'timestamp'>) {
    // Deduplicate note/progress updates for same target ID
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

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0 && navigator.onLine) {
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
      } catch (err) {
        // If permanent error or network cut off, break loop
        console.warn('Offline sync attempt paused:', err);
        break;
      }
    }

    this.isProcessing = false;
  }
}

export const offlineSync = new OfflineSyncManager();

