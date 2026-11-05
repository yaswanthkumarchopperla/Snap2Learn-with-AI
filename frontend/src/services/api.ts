import {
  ScanResponse,
  ScanHistoryItem,
  ExplainResponse,
  ChatResponse,
  ChatMessage,
  ChatSessionItem,
  QuizGenerateResponse,
  QuizSubmitResponse,
  ActiveQuizResponse,
  NoteItem,
  FlashcardItem,
  ProgressAnalytics,
  Language,
  ExplanationMode,
  Difficulty,
  UserPreferences,
  LearningStatus
} from '../types';

const API_BASE = '/api';

export function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('snap2learn_token');
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async getMe(token?: string): Promise<any> {
    const activeToken = token || localStorage.getItem('snap2learn_token');
    if (!activeToken) throw new Error('No authentication token found');
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${activeToken}`,
      },
    });
    if (!res.ok) {
      throw new Error('Session is invalid or expired');
    }
    return res.json();
  },

  async getPreferences(): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/auth/preferences`, { headers: getAuthHeaders() });
    if (!res.ok) {
      return {
        preferred_language: 'en',
        default_difficulty: 'medium',
        default_quiz_questions: 5,
        study_mode: 'standard',
        theme: 'dark',
        auto_save_enabled: true
      };
    }
    return res.json();
  },

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error('Failed to autosave preferences');
    return res.json();
  },

  async scanImage(file: File, subjectHint?: string): Promise<ScanResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (subjectHint) formData.append('subject_hint', subjectHint);

    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to scan image' }));
      throw new Error(err.detail || 'Failed to scan image');
    }
    return res.json();
  },

  async getScanHistory(): Promise<ScanHistoryItem[]> {
    const res = await fetch(`${API_BASE}/scan/history`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
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
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate explanation' }));
      throw new Error(err.detail || 'Failed to generate explanation');
    }
    return res.json();
  },

  async chatWithTutor(params: {
    session_id?: string;
    message: string;
    study_context?: string;
    subject?: string;
    topic?: string;
    history: ChatMessage[];
    language: Language;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to reach AI Tutor' }));
      throw new Error(err.detail || 'Failed to reach AI Tutor');
    }
    return res.json();
  },

  async getChatSessions(): Promise<ChatSessionItem[]> {
    const res = await fetch(`${API_BASE}/chat/sessions`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getChatSession(sessionId: string): Promise<ChatSessionItem> {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Chat session not found');
    return res.json();
  },

  async generateQuiz(params: {
    study_text: string;
    subject: string;
    topic: string;
    num_questions: number;
    difficulty: Difficulty;
    is_retake?: boolean;
    user_id?: string;
  }): Promise<QuizGenerateResponse> {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate quiz' }));
      throw new Error(err.detail || 'Failed to generate quiz');
    }
    return res.json();
  },

  async saveQuizProgress(params: {
    quiz_id: string;
    answers: Record<string, number>;
    current_question_index: number;
    time_taken_seconds: number;
    is_completed?: boolean;
    title?: string;
    subject?: string;
    topic?: string;
    difficulty?: Difficulty;
    total_questions?: number;
    questions?: any[];
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/quiz/${params.quiz_id}/progress`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to autosave quiz progress');
    return res.json();
  },

  async getActiveQuiz(): Promise<ActiveQuizResponse> {
    const res = await fetch(`${API_BASE}/quiz/active`, { headers: getAuthHeaders() });
    if (!res.ok) return { has_active_quiz: false, questions: [], answers: {}, current_question_index: 0, time_taken_seconds: 0, is_completed: true };
    return res.json();
  },

  async submitQuiz(params: {
    quiz_id: string;
    answers: Record<string, number>;
    time_taken_seconds: number;
    user_id?: string;
  }): Promise<QuizSubmitResponse> {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load notes');
    return res.json();
  },

  async getNote(id: string): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/notes/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load note');
    return res.json();
  },

  async createNote(data: {
    id?: string;
    title: string;
    subject: string;
    topic: string;
    raw_text: string;
    summary?: string;
    telugu_summary?: string;
  }): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to autosave note');
    return res.json();
  },

  async updateNote(id: string, data: {
    title?: string;
    subject?: string;
    topic?: string;
    raw_text?: string;
    summary?: string;
    telugu_summary?: string;
  }): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to autosave note modifications');
    return res.json();
  },

  async deleteNote(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete note');
  },

  async getFlashcards(subject?: string): Promise<FlashcardItem[]> {
    const url = subject ? `${API_BASE}/flashcards?subject=${encodeURIComponent(subject)}` : `${API_BASE}/flashcards`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load flashcards');
    return res.json();
  },

  async createFlashcard(data: {
    id?: string;
    note_id?: string;
    subject: string;
    topic: string;
    front_prompt: string;
    back_answer: string;
    formula_or_code?: string;
    difficulty?: Difficulty;
    is_bookmarked?: boolean;
    learning_status?: LearningStatus;
  }): Promise<FlashcardItem> {
    const res = await fetch(`${API_BASE}/flashcards`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to autosave flashcard');
    return res.json();
  },

  async createFlashcardsBatch(cards: {
    id?: string;
    note_id?: string;
    subject: string;
    topic: string;
    front_prompt: string;
    back_answer: string;
    formula_or_code?: string;
    difficulty?: Difficulty;
    is_bookmarked?: boolean;
    learning_status?: LearningStatus;
  }[]): Promise<FlashcardItem[]> {
    const res = await fetch(`${API_BASE}/flashcards/batch`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ cards }),
    });
    if (!res.ok) throw new Error('Failed to autosave flashcard set');
    return res.json();
  },

  async updateFlashcard(cardId: string, updates: {
    front_prompt?: string;
    back_answer?: string;
    formula_or_code?: string;
    difficulty?: Difficulty;
    is_bookmarked?: boolean;
    learning_status?: LearningStatus;
  }): Promise<FlashcardItem> {
    const res = await fetch(`${API_BASE}/flashcards/${cardId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update flashcard');
    return res.json();
  },

  async reviewFlashcard(cardId: string, rating: Difficulty, learningStatus?: LearningStatus): Promise<FlashcardItem> {
    const res = await fetch(`${API_BASE}/flashcards/${cardId}/review`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ rating, learning_status: learningStatus }),
    });
    if (!res.ok) throw new Error('Failed to record flashcard review');
    return res.json();
  },

  async getProgress(): Promise<ProgressAnalytics> {
    const res = await fetch(`${API_BASE}/progress`, { headers: getAuthHeaders() });
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

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; email: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send reset code' }));
      throw new Error(err.detail || 'Failed to send password reset code');
    }
    return res.json();
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Reset failed' }));
      throw new Error(err.detail || 'Failed to reset password');
    }
    return res.json();
  },

  async loginWithPassword(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Incorrect email or password');
    }
    return res.json();
  },
};
