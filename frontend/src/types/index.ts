export type Language = 'english' | 'telugu' | 'bilingual';
export type ExplanationMode = 'beginner' | 'standard' | 'exam';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface KeyDefinition {
  term: string;
  definition: string;
  telugu_translation?: string;
}


export interface FormulaItem {
  name: string;
  latex: string;
  explanation: string;
}

export interface CommonMistake {
  mistake: string;
  correction: string;
}

export interface ScanResponse {
  text: string;
  subject: string;
  topic: string;
  confidence: string;
  uncertain_segments: string[];
  is_demo: boolean;
  image_preview_url?: string;
}

export interface ExplainResponse {
  subject: string;
  topic: string;
  mode: ExplanationMode;
  language: Language;
  short_summary: string;
  detailed_steps: string[];
  key_definitions: KeyDefinition[];
  formulas: FormulaItem[];
  real_life_example: string;
  common_mistakes: CommonMistake[];
  exam_answer: string;
  quick_revision_notes: string[];
  telugu_summary?: string;
  is_demo: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatResponse {
  reply: string;
  suggested_followups: string[];
  is_demo: boolean;
}

export interface QuestionClientView {
  id: string;
  question: string;
  options: string[];
  topic_tag: string;
}

export interface QuizGenerateResponse {
  quiz_id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  total_questions: number;
  questions: QuestionClientView[];
  is_demo: boolean;
}

export interface QuestionReview {
  id: string;
  question: string;
  options: string[];
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
  topic_tag: string;
}

export interface QuizSubmitResponse {
  quiz_id: string;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  passed: boolean;
  time_taken_seconds: number;
  question_reviews: QuestionReview[];
  weak_topics: string[];
  revision_recommendation: string;
}

export interface NoteItem {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  topic: string;
  raw_text: string;
  summary?: string;
  created_at: string;
  quiz_count: number;
  accuracy: number;
}

export interface FlashcardItem {
  id: string;
  note_id?: string;
  subject: string;
  topic: string;
  front_prompt: string;
  back_answer: string;
  formula_or_code?: string;
  difficulty: Difficulty;
  review_count: number;
  next_review?: string;
}

export interface SubjectPerformance {
  subject: string;
  accuracy: number;
  quizzes_taken: number;
}

export interface ProgressAnalytics {
  total_notes: number;
  quizzes_completed: number;
  average_accuracy: number;
  study_streak_days: number;
  subject_performance: SubjectPerformance[];
  weak_topics: string[];
  recent_activity: any[];
  recommended_revision?: string;
}
