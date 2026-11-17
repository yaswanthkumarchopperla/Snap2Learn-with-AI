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

  const truncateLabel = (val: string, maxLen = 10) => {
    if (!val) return '';
    return val.length > maxLen ? `${val.substring(0, maxLen)}…` : val;
  };

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-20 lg:pb-8 min-w-0 bg-black">
        {/* Top Header / Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Workspace Active & Cloud Synced</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 font-extrabold">{user?.displayName || 'Student'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300">
              Turn today's lectures into exam-ready mastery with AI vision, active recall, and real-time autosave.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/scanner')}
            className="self-stretch sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-400/40 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Scan className="w-4 h-4 text-cyan-100" />
            <span>Scan New Note</span>
          </button>
        </div>

        {/* KPI Metrics Row: 4 Cards on Pure Black with Distinct Colored Edge Highlighters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cyan Edge Highlighter: Notes Scanned */}
          <div className="p-5 rounded-2xl bg-[#060609] border-2 border-cyan-500/40 shadow-[0_0_22px_rgba(6,182,212,0.22)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.40)] transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-neutral-200 mb-2 gap-2">
              <span className="text-xs font-semibold text-cyan-300">Notes Scanned</span>
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white truncate group-hover:text-cyan-200 transition-colors">
              {loading ? '...' : analytics?.total_notes || 0}
            </p>
            <span className="text-[11px] text-neutral-300 mt-1 block truncate">Active study sources</span>
          </div>

          {/* Purple Edge Highlighter: Quizzes Completed */}
          <div className="p-5 rounded-2xl bg-[#060609] border-2 border-purple-500/40 shadow-[0_0_22px_rgba(168,85,247,0.22)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.40)] transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-neutral-200 mb-2 gap-2">
              <span className="text-xs font-semibold text-purple-300">Quizzes Completed</span>
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)] shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white truncate group-hover:text-purple-200 transition-colors">
              {loading ? '...' : analytics?.quizzes_completed || 0}
            </p>
            <span className="text-[11px] text-neutral-300 mt-1 block truncate">Deterministic tests</span>
          </div>

          {/* Emerald Edge Highlighter: Average Accuracy */}
          <div className="p-5 rounded-2xl bg-[#060609] border-2 border-emerald-500/40 shadow-[0_0_22px_rgba(16,185,129,0.22)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.40)] transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-neutral-200 mb-2 gap-2">
              <span className="text-xs font-semibold text-emerald-300">Average Accuracy</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white truncate group-hover:text-emerald-200 transition-colors">
              {loading ? '...' : `${analytics?.average_accuracy || 0}%`}
            </p>
            <span className="text-[11px] text-neutral-300 mt-1 block truncate">Pass benchmark: 60%</span>
          </div>

          {/* Amber Edge Highlighter: Study Streak */}
          <div className="p-5 rounded-2xl bg-[#060609] border-2 border-amber-500/40 shadow-[0_0_22px_rgba(245,158,11,0.22)] hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.40)] transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-neutral-200 mb-2 gap-2">
              <span className="text-xs font-semibold text-amber-300">Study Streak</span>
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] shrink-0">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white truncate group-hover:text-amber-200 transition-colors">
              {loading ? '...' : `${analytics?.study_streak_days || 0} Days`}
            </p>
            <span className="text-[11px] text-neutral-300 mt-1 block truncate">Consistent revision</span>
          </div>
        </div>

        {/* Recommended Revision & Weak Topics Alert */}
        {analytics?.weak_topics && analytics.weak_topics.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-amber-300 break-words">
                  Targeted Revision Recommended: {analytics.recommended_revision || analytics.weak_topics[0]}
                </h4>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Identified from your recent quiz attempts. Practice this topic to raise your accuracy.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/quiz')}
              className="self-stretch sm:self-auto px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors shrink-0 text-center cursor-pointer"
            >
              Practice Quiz Now
            </button>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 min-w-0">
          {/* Subject Performance Chart */}
          <div className="p-5 rounded-2xl bg-[#060609] border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col justify-between min-w-0 overflow-hidden w-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Subject Mastery Breakdown</span>
                </h3>
                <p className="text-[11px] text-neutral-300">Quiz accuracy per academic subject</p>
              </div>
            </div>

            <div className="h-60 w-full min-w-0 overflow-hidden relative">
              {analytics?.subject_performance && analytics.subject_performance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.subject_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="subject"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => truncateLabel(val, 12)}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(99,102,241,0.5)', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}
                    />
                    <Bar dataKey="accuracy" fill="#818cf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                  No subject quizzes taken yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Quiz Attempts Trend */}
          <div className="p-5 rounded-2xl bg-[#060609] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between min-w-0 overflow-hidden w-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Performance Over Time</span>
                </h3>
                <p className="text-[11px] text-neutral-300">Recent quiz accuracy trends</p>
              </div>
            </div>

            <div className="h-60 w-full min-w-0 overflow-hidden relative">
              {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.recent_activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="topic"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => truncateLabel(val, 10)}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(6,182,212,0.5)', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}
                    />
                    <Area type="monotone" dataKey="score_percentage" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                  Take a quiz to see your performance timeline.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Notes & Learning Sessions */}
        <div className="p-5 rounded-2xl bg-[#060609] border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Recent Learning Sessions</span>
              </h3>
              <p className="text-[11px] text-neutral-300">Jump straight back into your study notes</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-10 rounded-xl bg-black border border-dashed border-white/15">
                <BookOpen className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-neutral-300">No notes scanned yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/scanner')}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Scan Your First Note
                </button>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-black border border-white/15 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{note.title}</h4>
                      <p className="text-[11px] text-neutral-200 line-clamp-1 break-words">{note.summary || note.raw_text}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-cyan-500/15 border border-cyan-500/30 text-cyan-200">
                          {note.subject}
                        </span>
                        <span className="text-[10px] text-neutral-300 truncate">{note.topic}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => navigate('/explain', { state: { text: note.raw_text, subject: note.subject, topic: note.topic } })}
                      className="flex-1 sm:flex-none text-center px-3.5 py-1.5 rounded-xl bg-black hover:bg-white/5 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Read Explanation
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/quiz', { state: { text: note.raw_text, subject: note.subject, topic: note.topic } })}
                      className="flex-1 sm:flex-none text-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:opacity-90 text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                    >
                      Practice Quiz
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
