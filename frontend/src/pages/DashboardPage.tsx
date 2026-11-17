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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-20 lg:pb-8 min-w-0 bg-[#0e131f]">
        {/* Aditya Maya Student Profile & Welcome Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#141a27] border border-[#1e2638] shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            {/* Student Avatar with Aditya Maya Gradient Ring */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-[#ff6b35] via-[#38bdf8] to-[#8b5cf6] p-[2.5px] shrink-0 shadow-[0_0_20px_rgba(255,107,53,0.35)]">
              <div className="w-full h-full rounded-full bg-[#0e131f] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'Y'}
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff6b35]/15 text-[#ff6b35] border border-[#ff6b35]/30">
                  CODING_IGC_2030_B5_ADVANCED
                </span>
                <span className="text-[11px] text-[#38bdf8] font-semibold">
                  Problem Solving & AI Vision
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white truncate">
                {user?.displayName || 'CHOPPERLA YASWANTH KUMAR RAJU'}
              </h1>
              <p className="text-xs text-[#94a3b8] font-mono flex items-center gap-2">
                <span>{user?.collegeBranch || '26811AI216'}</span>
                <span className="text-[#38bdf8]">•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Synced
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => navigate('/scanner')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f95721] hover:from-[#ff7a45] hover:to-[#fa622f] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,107,53,0.4)] border border-[#ff6b35]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>+ Scan New Note</span>
            </button>
          </div>
        </div>

        {/* Aditya Maya Stats Row (Trainer, Trainee, LeetCode, Streak) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Maya Sky Blue: Notes Scanned / Trainer Problems */}
          <div className="p-5 rounded-2xl bg-[#141a27] border border-[#1e2638] shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-[#38bdf8]/50 transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2 gap-2">
              <span className="text-xs font-semibold text-[#38bdf8]">Notes Scanned</span>
              <div className="p-2 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.25)] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white truncate">
                {loading ? '...' : analytics?.total_notes || 0}
              </p>
              <span className="text-[11px] text-[#94a3b8] mt-1 block truncate">Active study notes</span>
            </div>
            <div className="mt-3 h-1 w-full bg-[#0e131f] rounded-full overflow-hidden">
              <div className="h-full bg-[#38bdf8] w-2/3 rounded-full" />
            </div>
          </div>

          {/* Maya Purple: Quizzes Completed / Trainee Problems */}
          <div className="p-5 rounded-2xl bg-[#141a27] border border-[#1e2638] shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-[#8b5cf6]/50 transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2 gap-2">
              <span className="text-xs font-semibold text-[#a855f7]">Trainee Problems Solved</span>
              <div className="p-2 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-[#a855f7] shadow-[0_0_10px_rgba(139,92,246,0.25)] shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white truncate">
                {loading ? '...' : analytics?.quizzes_completed ? `${analytics.quizzes_completed * 20}/112` : '84/112'}
              </p>
              <span className="text-[11px] text-[#94a3b8] mt-1 block truncate">Deterministic evaluations</span>
            </div>
            <div className="mt-3 h-1 w-full bg-[#0e131f] rounded-full overflow-hidden">
              <div className="h-full bg-[#8b5cf6] w-3/4 rounded-full" />
            </div>
          </div>

          {/* Maya Orange: Average Accuracy */}
          <div className="p-5 rounded-2xl bg-[#141a27] border border-[#1e2638] shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-[#ff6b35]/50 transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2 gap-2">
              <span className="text-xs font-semibold text-[#ff6b35]">Average Accuracy</span>
              <div className="p-2 rounded-xl bg-[#ff6b35]/15 border border-[#ff6b35]/30 text-[#ff6b35] shadow-[0_0_10px_rgba(255,107,53,0.25)] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white truncate">
                {loading ? '...' : `${analytics?.average_accuracy || 80}%`}
              </p>
              <span className="text-[11px] text-[#94a3b8] mt-1 block truncate">Pass benchmark: 60%</span>
            </div>
            <div className="mt-3 h-1 w-full bg-[#0e131f] rounded-full overflow-hidden">
              <div className="h-full bg-[#ff6b35] w-4/5 rounded-full" />
            </div>
          </div>

          {/* Maya Amber: Study Streak / Batch Leaderboard */}
          <div className="p-5 rounded-2xl bg-[#141a27] border border-[#1e2638] shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-[#f59e0b]/50 transition-all min-w-0 overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2 gap-2">
              <span className="text-xs font-semibold text-[#f59e0b]">Batch Leaderboard</span>
              <div className="p-2 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white truncate">
                {loading ? '...' : `${analytics?.study_streak_days || 3} Days`}
              </p>
              <span className="text-[11px] text-[#94a3b8] mt-1 block truncate">Rank #1 • Problems solved + AI score</span>
            </div>
            <div className="mt-3 h-1 w-full bg-[#0e131f] rounded-full overflow-hidden">
              <div className="h-full bg-[#f59e0b] w-1/2 rounded-full" />
            </div>
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

        {/* Course Modules & Learning Sessions (Aditya Maya Module Card Styling) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#141a27] border border-[#1e2638] shadow-[0_4px_20px_rgba(0,0,0,0.4)] min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6b35] font-bold">
                  Active Course Curriculum
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Course Modules & Practice Units</span>
              </h3>
              <p className="text-xs text-[#94a3b8]">Review formula-based units, practice MCQs and resume revision</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="text-xs text-[#ff6b35] hover:text-[#ff7a45] flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {notes.length === 0 ? (
              <div className="text-center py-10 rounded-xl bg-[#0e131f] border border-dashed border-[#1e2638]">
                <BookOpen className="w-8 h-8 text-[#ff6b35] mx-auto mb-2 opacity-60" />
                <p className="text-xs text-[#94a3b8]">No course modules scanned yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/scanner')}
                  className="mt-3 px-5 py-2 rounded-full bg-[#ff6b35] hover:bg-[#fa5a1e] text-white font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(255,107,53,0.35)]"
                >
                  Scan Your First Note
                </button>
              </div>
            ) : (
              notes.map((note, idx) => (
                <div
                  key={note.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0e131f] border border-[#1e2638] border-l-4 border-l-[#ff6b35] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-l-[#ff7a45] hover:border-[#ff6b35]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Module Index Badge (1, 2, 3...) */}
                    <div className="w-9 h-9 rounded-xl bg-[#141a27] border border-[#1e2638] flex items-center justify-center font-bold text-xs text-[#ff6b35] shrink-0 shadow-sm">
                      {idx + 1}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">{note.title}</h4>
                      
                      {/* Aditya Maya Status Chips Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#38bdf8]/10 border border-[#38bdf8]/25 text-[#38bdf8] flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>Articles 0/0</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 flex items-center gap-1">
                          <span>Notes 1/1</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#8b5cf6]/10 border border-[#8b5cf6]/25 text-[#a855f7] flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>Problems 20/20</span>
                        </span>
                        <span className="text-[10px] text-[#94a3b8] font-mono truncate">
                          {note.subject} • {note.topic}
                        </span>
                      </div>

                      {/* Aditya Maya Progress Bar */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="h-1.5 flex-1 bg-[#141a27] rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-[#ff6b35] to-[#f95721] rounded-full"
                            style={{ width: `${Math.min(100, 25 + (idx * 25))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#ff6b35] font-mono shrink-0">
                          {Math.min(100, 25 + (idx * 25))}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Resume (Aditya Maya Pill Button) */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/explain', { state: { text: note.raw_text, subject: note.subject, topic: note.topic } })}
                      className="flex-1 md:flex-none text-center px-4 py-2 rounded-full bg-[#141a27] hover:bg-[#1b2337] border border-[#1e2638] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Read Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/quiz', { state: { text: note.raw_text, subject: note.subject, topic: note.topic } })}
                      className="flex-1 md:flex-none text-center px-6 py-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f95721] hover:from-[#ff7a45] hover:to-[#fa622f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,107,53,0.35)] transition-all cursor-pointer"
                    >
                      Resume
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
