import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Globe2,
  BookOpen,
  User,
  Bot,
  RefreshCw,
  History,
  X
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosave } from '../contexts/AutosaveContext';
import { api } from '../services/api';
import { ChatMessage, ChatSessionItem, Language } from '../types';

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const { triggerAutosave } = useAutosave();

  const studyContext = location.state?.studyContext ||
    'Let A be an n × n square matrix. A scalar λ is called an eigenvalue of A if there exists a non-zero column vector v such that A v = λ v. The characteristic equation is det(A - λ I) = 0.';
  const subject = location.state?.subject || 'Engineering Mathematics';
  const topic = location.state?.topic || 'Eigenvalues & Characteristic Equation';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionsList, setSessionsList] = useState<ChatSessionItem[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content:
        `Hello! I am your AI Study Tutor. I have loaded your notes on **${topic}**.\n\n` +
        `Feel free to ask for step-by-step proofs, Telugu explanations, intuitive analogies, or coding examples! All conversations are automatically saved.`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [loading, setLoading] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    'How do I calculate eigenvalues of a 2x2 matrix by hand?',
    'What does this mean in simple Telugu (తెలుగులో వివరించండి)?',
    'How is this concept applied in Principal Component Analysis (PCA)?',
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat session history on mount
  useEffect(() => {
    api.getChatSessions().then((sessions) => {
      if (Array.isArray(sessions)) setSessionsList(sessions);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await triggerAutosave(async () => {
        return await api.chatWithTutor({
          session_id: sessionId || undefined,
          message: text,
          study_context: studyContext,
          subject,
          topic,
          history: newHistory,
          language,
        });
      });

      if (res) {
        if (res.session_id) setSessionId(res.session_id);
        setMessages((prev) => [...prev, { role: 'model', content: res.reply }]);
        if (res.suggested_followups && res.suggested_followups.length > 0) {
          setSuggestedFollowups(res.suggested_followups);
        }

        // Refresh sessions list
        api.getChatSessions().then((s) => {
          if (Array.isArray(s)) setSessionsList(s);
        }).catch(() => {});
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Sorry, I encountered an issue connecting to the tutor service. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSession = async (targetSessionId: string) => {
    try {
      setLoading(true);
      const sess = await api.getChatSession(targetSessionId);
      setSessionId(sess.session_id);
      setMessages(sess.messages);
      setShowHistoryDrawer(false);
    } catch (err) {
      console.error('Failed to restore chat session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setSessionId(null);
    setMessages([
      {
        role: 'model',
        content: `New chat session started. Grounded in **${topic}**. What would you like to explore next?`,
      },
    ]);
  };

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen bg-background relative overflow-hidden">
        {/* Tutor Topbar */}
        <div className="px-6 py-3.5 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-sm">
              <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">AI Tutor</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                  Grounded Context
                </span>
                <AutosaveIndicator compact={true} />
              </div>
              <p className="text-[10px] text-foreground-muted truncate max-w-xs sm:max-w-md">
                Topic: {topic} ({subject})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Past Conversations Button */}
            {sessionsList.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                className="px-2.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-secondary" />
                <span>History ({sessionsList.length})</span>
              </button>
            )}

            {/* Language switch */}
            <div className="flex rounded-xl bg-surface-elevated p-1 border border-border text-[11px]">
              {(['english', 'bilingual', 'telugu'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    language === l
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {l === 'english' ? 'English' : l === 'bilingual' ? 'Bilingual' : 'తెలుగు'}
                </button>
              ))}
            </div>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-border transition-colors cursor-pointer"
              title="Start fresh conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Past Sessions Drawer */}
        {showHistoryDrawer && (
          <div className="p-4 bg-surface-elevated border-b border-border space-y-2 animate-in fade-in slide-in-from-top-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Past Saved Discussions</span>
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="text-foreground-muted hover:text-foreground text-xs cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {sessionsList.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => handleRestoreSession(s.session_id)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 max-w-xs transition-all cursor-pointer ${
                    sessionId === s.session_id
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-surface border-border text-foreground-muted hover:text-foreground hover:border-secondary/40'
                  }`}
                >
                  <p className="text-xs font-bold truncate line-clamp-1">{s.title}</p>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {s.topic} • {s.messages.length} msgs
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-accent to-primary text-white'
                    : 'bg-surface-elevated border border-border text-secondary'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`group relative p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'glass-card border border-border text-foreground'
                }`}
              >
                <MathRenderer content={msg.content} />

                {/* Copy button */}
                <button
                  onClick={() => handleCopyMessage(msg.content, idx)}
                  className={`absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                    msg.role === 'user'
                      ? 'bg-black/30 text-white hover:bg-black/50'
                      : 'bg-surface text-foreground-muted hover:text-foreground'
                  }`}
                  title="Copy message"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-foreground-muted">
              <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-secondary">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-foreground-muted ml-1">AI Tutor thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Toolbar */}
        {suggestedFollowups.length > 0 && !loading && (
          <div className="px-4 py-2 bg-surface/60 border-t border-border shrink-0 flex items-center gap-2 overflow-x-auto">
            <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="text-[10px] uppercase font-bold text-foreground-muted shrink-0">Suggested:</span>
            {suggestedFollowups.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="px-2.5 py-1 rounded-full bg-surface-elevated hover:bg-surface-hover border border-border text-[11px] text-foreground-muted hover:text-foreground whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-surface shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask any doubt on ${topic}...`}
              className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-secondary transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-md glow-primary hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};
