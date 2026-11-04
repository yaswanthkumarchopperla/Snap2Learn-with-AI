import {
  ScanResponse,
  ExplainResponse,
  ChatResponse,
  ChatMessage,
  QuizGenerateResponse,
  QuizSubmitResponse,
  NoteItem,
  FlashcardItem,
  ProgressAnalytics,
  Language,
  ExplanationMode,
  Difficulty
} from '../types';

const API_BASE = '/api';

export const api = {
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async scanImage(file: File, subjectHint?: string): Promise<ScanResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (subjectHint) formData.append('subject_hint', subjectHint);

    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to scan image' }));
      throw new Error(err.detail || 'Failed to scan image');
    }
    return res.json();
  },

  async explainNotes(params: {
    text: string;
    subject: string;
    topic: string;
    mode: ExplanationMode;
    language: Language;
  }): Promise<ExplainResponse> {
    const res = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate explanation' }));
      throw new Error(err.detail || 'Failed to generate explanation');
    }
    return res.json();
  },

  async chatWithTutor(params: {
    message: string;
    study_context?: string;
    subject?: string;
    history: ChatMessage[];
    language: Language;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to reach AI Tutor' }));
      throw new Error(err.detail || 'Failed to reach AI Tutor');
    }
    return res.json();
  },

  async generateQuiz(params: {
    study_text: string;
    subject: string;
    topic: string;
    num_questions: number;
    difficulty: Difficulty;
  }): Promise<QuizGenerateResponse> {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate quiz' }));
      throw new Error(err.detail || 'Failed to generate quiz');
    }
    return res.json();
  },

  async submitQuiz(params: {
    quiz_id: string;
    answers: Record<string, number>;
    time_taken_seconds: number;
  }): Promise<QuizSubmitResponse> {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit quiz' }));
      throw new Error(err.detail || 'Failed to submit quiz');
    }
    return res.json();
  },

  async getNotes(subject?: string): Promise<NoteItem[]> {
    const url = subject ? `${API_BASE}/notes?subject=${encodeURIComponent(subject)}` : `${API_BASE}/notes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load notes');
    return res.json();
  },

  async getNote(id: string): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/notes/${id}`);
    if (!res.ok) throw new Error('Failed to load note');
    return res.json();
  },

  async createNote(data: {
    title: string;
    subject: string;
    topic: string;
    raw_text: string;
    summary?: string;
  }): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save note');
    return res.json();
  },

  async deleteNote(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');
  },

  async getFlashcards(subject?: string): Promise<FlashcardItem[]> {
    const url = subject ? `${API_BASE}/flashcards?subject=${encodeURIComponent(subject)}` : `${API_BASE}/flashcards`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load flashcards');
    return res.json();
  },

  async reviewFlashcard(cardId: string, rating: Difficulty): Promise<FlashcardItem> {
    const res = await fetch(`${API_BASE}/flashcards/${cardId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) throw new Error('Failed to record flashcard review');
    return res.json();
  },

  async getProgress(): Promise<ProgressAnalytics> {
    const res = await fetch(`${API_BASE}/progress`);
    if (!res.ok) throw new Error('Failed to load progress analytics');
    return res.json();
  },

  async sendOtp(email: string, name?: string): Promise<{ success: boolean; message: string; email: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send OTP' }));
      throw new Error(err.detail || 'Failed to send OTP via Brevo');
    }
    return res.json();
  },

  async verifyOtp(email: string, otp: string, name?: string): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Invalid or expired OTP code');
    }
    return res.json();
  },

  async guestLogin(): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/guest`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start guest session');
    return res.json();
  },
};
