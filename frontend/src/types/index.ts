export type Language = 'english' | 'telugu' | 'bilingual';
export type ExplanationMode = 'beginner' | 'standard' | 'exam';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type LearningStatus = 'known' | 'learning' | 'unknown';
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

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
  scan_id?: string;
  text: string;
  subject: string;
  topic: string;
  confidence: string;
  uncertain_segments: string[];
  is_demo: boolean;
  image_preview_url?: string;
  created_at?: string;
}

export interface ScanHistoryItem {
  id: string;
  text: string;
  subject: string;
  topic: string;
  confidence: string;
  uncertain_segments: string[];
  created_at: string;
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
  session_id?: string;
  reply: string;
  suggested_followups: string[];
  is_demo: boolean;
}

export interface ChatSessionItem {
  session_id: string;
  user_id?: string;
  title: string;
  subject: string;
  topic: string;
  messages: ChatMessage[];
  updated_at: string;
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
  is_fresh_retake?: boolean;
  notice?: string;
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
  attempt_id?: string;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  passed: boolean;
  time_taken_seconds: number;
  question_reviews: QuestionReview[];
  weak_topics: string[];
  revision_recommendation: string;
}

export interface ActiveQuizResponse {
  has_active_quiz: boolean;
  quiz_id?: string;
  title?: string;
  subject?: string;
  topic?: string;
  difficulty?: Difficulty;
  total_questions?: number;
  questions: QuestionClientView[];
  answers: Record<string, number>;
  current_question_index: number;
  time_taken_seconds: number;
  is_completed: boolean;
  updated_at?: string;
}

export interface NoteItem {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  topic: string;
  raw_text: string;
  summary?: string;
  telugu_summary?: string;
  created_at: string;
  updated_at?: string;
  quiz_count: number;
  accuracy: number;
}

export interface FlashcardItem {
  id: string;
  user_id?: string;
  note_id?: string;
  subject: string;
  topic: string;
  front_prompt: string;
  back_answer: string;
  formula_or_code?: string;
  difficulty: Difficulty;
  is_bookmarked?: boolean;
  learning_status?: LearningStatus;
  review_count: number;
  next_review?: string;
  updated_at?: string;
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
  flashcards_reviewed?: number;
  subject_performance: SubjectPerformance[];
  weak_topics: string[];
  recent_activity: any[];
  recommended_revision?: string;
}

export interface UserPreferences {
  preferred_language: 'en' | 'te';
  default_difficulty: Difficulty;
  default_quiz_questions: number;
  study_mode: 'standard' | 'exam_cram' | 'deep_dive';
  theme: string;
  auto_save_enabled: boolean;
}

export interface PageExtractItem {
  page_number: number;
  text: string;
  markdown: string;
  is_ocr: boolean;
  has_math: boolean;
  has_table: boolean;
}

export interface PdfProcessResponse {
  doc_id: string;
  file_name: string;
  file_size_bytes: number;
  page_count: number;
  selected_page_range: string;
  extracted_markdown: string;
  extracted_text: string;
  subject: string;
  topic: string;
  pages: PageExtractItem[];
  has_math: boolean;
  has_scanned_pages: boolean;
  download_url: string;
  markdown_download_url: string;
  created_at: string;
}

export interface PdfUpdateRequest {
  edited_markdown?: string;
  subject?: string;
  topic?: string;
  selected_page_range?: string;
}

export interface PdfHistoryItem {
  id: string;
  doc_id: string;
  user_id: string;
  file_name: string;
  file_size_bytes: number;
  page_count: number;
  selected_page_range: string;
  subject: string;
  topic: string;
  has_math: boolean;
  created_at: string;
  download_url: string;
  markdown_download_url: string;
}
