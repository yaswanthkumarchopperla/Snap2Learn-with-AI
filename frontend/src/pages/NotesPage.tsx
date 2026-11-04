import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Trash2,
  MessageSquare,
  Award,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { api } from '../services/api';
import { NoteItem } from '../types';

export const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  const fetchNotes = async (subj?: string) => {
    setLoading(true);
    try {
      const data = await api.getNotes(subj === 'All' ? undefined : subj);
      setNotes(data);
      if (data.length > 0 && !selectedNote) {
        setSelectedNote(data[0]);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(selectedSubject);
  }, [selectedSubject]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        const remaining = notes.filter((n) => n.id !== id);
        setSelectedNote(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.raw_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subjects = ['All', 'Engineering Mathematics', 'Machine Learning'];

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-secondary" />
              <span>My Notes Repository</span>
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Your saved lecture transcriptions, OCR extractions, and confirmed notes.
            </p>
          </div>

          <button
            onClick={() => navigate('/scanner')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Scan New Note</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, formula, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSubject === subj
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'bg-surface border border-border text-foreground-muted hover:text-foreground'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Explorer: Note List (5 cols) vs Note Details (7 cols) */}
        {loading ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
            <span className="text-xs text-foreground-muted">Loading repository notes...</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookOpen className="w-10 h-10 text-foreground-muted mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-foreground text-sm mb-1">No notes match your criteria</h3>
            <p className="text-xs text-foreground-muted mb-4">
              Try adjusting your search query or scan a new note.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Note Cards List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-surface-elevated border-secondary shadow-md'
                        : 'glass-card hover:border-border-highlight'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                        {note.title}
                      </h4>
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="text-foreground-muted hover:text-red-400 p-1 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                      {note.summary || note.raw_text}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-foreground-muted pt-2 border-t border-border/50">
                      <span className="px-2 py-0.5 rounded bg-surface font-semibold text-secondary">
                        {note.subject}
                      </span>
                      <span>{note.topic}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Note Inspector & Action Center */}
            {selectedNote && (
              <div className="lg:col-span-7 space-y-4">
                <div className="glass-card p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                        {selectedNote.subject}
                      </span>
                      <h2 className="text-lg font-bold text-foreground mt-1">
                        {selectedNote.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate('/chat', {
                            state: {
                              studyContext: selectedNote.raw_text,
                              subject: selectedNote.subject,
                              topic: selectedNote.topic,
                            },
                          })
                        }
                        className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                        title="Ask Tutor about this note"
                      >
                        <MessageSquare className="w-4 h-4 text-secondary" />
                      </button>
                      <button
                        onClick={() =>
                          navigate('/quiz', {
                            state: {
                              text: selectedNote.raw_text,
                              subject: selectedNote.subject,
                              topic: selectedNote.topic,
                            },
                          })
                        }
                        className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                        title="Generate Quiz on this note"
                      >
                        <Award className="w-4 h-4 text-accent" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Callout if available */}
                  {selectedNote.summary && (
                    <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/20">
                      <span className="text-[10px] uppercase font-bold text-secondary block mb-1">
                        Quick Summary
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">
                        {selectedNote.summary}
                      </p>
                    </div>
                  )}

                  {/* Raw Confirmed Text with Math Rendering */}
                  <div>
                    <span className="text-xs font-semibold text-foreground-muted block mb-2">
                      Full Extracted Content
                    </span>
                    <div className="p-4 rounded-xl bg-surface border border-border text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap">
                      <MathRenderer content={selectedNote.raw_text} />
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-foreground-muted">
                      ID: {selectedNote.id}
                    </span>

                    <button
                      onClick={() =>
                        navigate('/explain', {
                          state: {
                            text: selectedNote.raw_text,
                            subject: selectedNote.subject,
                            topic: selectedNote.topic,
                          },
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center gap-1.5"
                    >
                      <span>Open Full Explanation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
