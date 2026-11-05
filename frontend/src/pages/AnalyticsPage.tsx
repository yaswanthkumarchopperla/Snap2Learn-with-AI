import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { SidebarLayout } from '../components/Sidebar';
import { api } from '../services/api';
import { ProgressAnalytics } from '../types';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await api.getProgress();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const truncateLabel = (val: string, maxLen = 10) => {
    if (!val) return '';
    return val.length > maxLen ? `${val.substring(0, maxLen)}…` : val;
  };

  return (
    <SidebarLayout>
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-5 sm:space-y-6 pb-20 lg:pb-8 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-secondary" />
              <span>Progress Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Real evaluation metrics calculated deterministically from your completed quizzes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="self-stretch sm:self-auto px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Take Practice Quiz</span>
          </button>
        </div>

        {loading ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
            <span className="text-xs text-foreground-muted">Aggregating progress telemetry...</span>
          </div>
        ) : (
          <div className="space-y-6 min-w-0">
            {/* Overview KPI Cards: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="glass-card p-4 min-w-0 overflow-hidden">
                <span className="text-xs font-medium text-foreground-muted block mb-1 truncate">Average Accuracy</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-secondary truncate">
                  {analytics?.average_accuracy}%
                </p>
                <span className="text-[10px] text-foreground-muted mt-1 block truncate">Semester benchmark: 60%</span>
              </div>

              <div className="glass-card p-4 min-w-0 overflow-hidden">
                <span className="text-xs font-medium text-foreground-muted block mb-1 truncate">Completed Quizzes</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground truncate">
                  {analytics?.quizzes_completed}
                </p>
                <span className="text-[10px] text-foreground-muted mt-1 block truncate">Full evaluations</span>
              </div>

              <div className="glass-card p-4 min-w-0 overflow-hidden">
                <span className="text-xs font-medium text-foreground-muted block mb-1 truncate">Study Notes</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground truncate">
                  {analytics?.total_notes}
                </p>
                <span className="text-[10px] text-foreground-muted mt-1 block truncate">Scanned materials</span>
              </div>

              <div className="glass-card p-4 min-w-0 overflow-hidden">
                <span className="text-xs font-medium text-foreground-muted block mb-1 truncate">Active Streak</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 truncate">
                  {analytics?.study_streak_days} Days
                </p>
                <span className="text-[10px] text-foreground-muted mt-1 block truncate">Consistent study habit</span>
              </div>
            </div>

            {/* Recommendations & Weak Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 min-w-0">
              {/* Weak Concepts Card */}
              <div className="glass-card p-4 sm:p-5 border-l-4 border-l-amber-500 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Frequently Missed Concepts</span>
                  </h3>
                  <p className="text-[11px] text-foreground-muted mb-4">
                    Topics where questions were answered incorrectly in recent assessments:
                  </p>

                  <div className="space-y-2">
                    {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
                      analytics.weak_topics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-surface border border-border text-xs flex items-center justify-between gap-2 min-w-0"
                        >
                          <span className="font-medium text-foreground truncate">{topic}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shrink-0">
                            Needs Review
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-foreground-muted">No weak topics detected yet.</p>
                    )}
                  </div>
                </div>

                {analytics?.recommended_revision && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <span className="text-[10px] uppercase font-bold text-secondary block mb-1">
                      Action Recommendation
                    </span>
                    <p className="text-xs text-foreground-muted font-medium break-words">
                      {analytics.recommended_revision}
                    </p>
                  </div>
                )}
              </div>

              {/* Subject Breakdown Chart */}
              <div className="glass-card p-4 sm:p-5 min-w-0 overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">Subject Performance</h3>
                  <p className="text-[11px] text-foreground-muted mb-4">Accuracy percentages across enrolled subjects</p>
                </div>

                <div className="h-56 w-full min-w-0 overflow-hidden relative">
                  {analytics?.subject_performance && analytics.subject_performance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.subject_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                          dataKey="subject"
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => truncateLabel(val, 12)}
                        />
                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#11162A', borderColor: '#2e303a', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Bar dataKey="accuracy" fill="#22D3EE" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-foreground-muted">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Assessment Attempts Log */}
            <div className="glass-card p-4 sm:p-5 min-w-0">
              <h3 className="text-sm font-bold text-foreground mb-1">Recent Quiz Attempts</h3>
              <p className="text-[11px] text-foreground-muted mb-4">Chronological log of verified student attempts</p>

              <div className="space-y-2">
                {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
                  analytics.recent_activity.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            act.passed ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{act.topic || 'General Practice'}</p>
                          <span className="text-[10px] text-foreground-muted truncate block">{act.subject}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-border/40">
                        <span className="font-bold text-foreground">{act.score_percentage}%</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.passed
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {act.passed ? 'PASSED' : 'RETRY'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-foreground-muted">No quiz activity logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
