import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  BookOpen,
  Award,
  TrendingUp,
  Flame,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { SidebarLayout } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ProgressAnalytics, NoteItem } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [progData, notesData] = await Promise.all([
          api.getProgress(),
          api.getNotes()
        ]);
        setAnalytics(progData);
        setNotes(notesData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header / Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Hello, {user?.displayName || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Ready to turn today's lectures into exam-ready masteries?
            </p>
          </div>

          <button
            onClick={() => navigate('/scanner')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-md glow-primary hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Scan className="w-4 h-4" />
            <span>Scan New Note</span>
          </button>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">Notes Scanned</span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {loading ? '...' : analytics?.total_notes || 0}
            </p>
            <span className="text-[11px] text-foreground-muted mt-1 block">Active study sources</span>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">Quizzes Completed</span>
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {loading ? '...' : analytics?.quizzes_completed || 0}
            </p>
            <span className="text-[11px] text-foreground-muted mt-1 block">Deterministic tests</span>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">Average Accuracy</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {loading ? '...' : `${analytics?.average_accuracy || 0}%`}
            </p>
            <span className="text-[11px] text-foreground-muted mt-1 block">Pass benchmark: 60%</span>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">Study Streak</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {loading ? '...' : `${analytics?.study_streak_days || 0} Days`}
            </p>
            <span className="text-[11px] text-foreground-muted mt-1 block">Consistent revision</span>
          </div>
        </div>

        {/* Recommended Revision & Weak Topics Alert */}
        {analytics?.weak_topics && analytics.weak_topics.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">
                  Targeted Revision Recommended: {analytics.recommended_revision || analytics.weak_topics[0]}
                </h4>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Identified from your recent quiz attempts. Practice this topic to raise your accuracy.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shrink-0"
            >
              Practice Quiz Now
            </button>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance Chart */}
          <div className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Subject Mastery Breakdown</h3>
                <p className="text-[11px] text-foreground-muted">Quiz accuracy per academic subject</p>
              </div>
            </div>

            <div className="h-60 w-full">
              {analytics?.subject_performance && analytics.subject_performance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.subject_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="subject" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#11162A', borderColor: '#2e303a', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="accuracy" fill="#7559FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-foreground-muted">
                  No subject quizzes taken yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Quiz Attempts Trend */}
          <div className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Performance Over Time</h3>
                <p className="text-[11px] text-foreground-muted">Recent quiz accuracy trends</p>
              </div>
            </div>

            <div className="h-60 w-full">
              {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.recent_activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="topic" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#11162A', borderColor: '#2e303a', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="score_percentage" stroke="#22D3EE" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-foreground-muted">
                  Take a quiz to see your performance timeline.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Notes & Learning Sessions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Learning Sessions</h3>
              <p className="text-[11px] text-foreground-muted">Jump straight back into your study notes</p>
            </div>
            <button
              onClick={() => navigate('/notes')}
              className="text-xs text-secondary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-foreground-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-foreground-muted">No notes scanned yet.</p>
                <button
                  onClick={() => navigate('/scanner')}
                  className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                >
                  Scan Your First Note
                </button>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-surface border border-border hover:border-border-highlight transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{note.title}</h4>
                      <p className="text-[11px] text-foreground-muted line-clamp-1">{note.summary || note.raw_text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-surface-elevated text-secondary">
                          {note.subject}
                        </span>
                        <span className="text-[10px] text-foreground-muted">{note.topic}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => navigate('/explain', { state: { text: note.raw_text, subject: note.subject, topic: note.topic } })}
                      className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground text-xs font-medium transition-colors"
                    >
                      Read Explanation
                    </button>
                    <button
                      onClick={() => navigate('/quiz', { state: { text: note.raw_text, subject: note.subject, topic: note.topic } })}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover shadow-sm transition-colors"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};
