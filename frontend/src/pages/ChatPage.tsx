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
  RefreshCw
} from 'lucide-react';
import { SidebarLayout } from '../components/Sidebar';
import { MathRenderer } from '../components/MathRenderer';
import { api } from '../services/api';
import { ChatMessage, Language } from '../types';

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const studyContext = location.state?.studyContext ||
    'Let A be an n × n square matrix. A scalar λ is called an eigenvalue of A if there exists a non-zero column vector v such that A v = λ v. The characteristic equation is det(A - λ I) = 0.';
  const subject = location.state?.subject || 'Engineering Mathematics';
  const topic = location.state?.topic || 'Eigenvalues & Characteristic Equation';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content:
        `Hello! I am your AI Study Tutor. I have loaded your notes on **${topic}**.\n\n` +
        `Feel free to ask for step-by-step proofs, Telugu explanations, intuitive analogies, or coding examples!`,
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
      const res = await api.chatWithTutor({
        message: text,
        study_context: studyContext,
        subject,
        history: newHistory,
        language,
      });

      setMessages((prev) => [...prev, { role: 'model', content: res.reply }]);
      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setSuggestedFollowups(res.suggested_followups);
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

  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        content: `Chat session refreshed. Grounded in **${topic}**. What would you like to explore next?`,
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
      <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen bg-background">
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
              </div>
              <p className="text-[10px] text-foreground-muted truncate max-w-xs sm:max-w-md">
                Topic: {topic} ({subject})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="flex rounded-xl bg-surface-elevated p-1 border border-border text-[11px]">
              {(['english', 'bilingual', 'telugu'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
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
              className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-border transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-accent to-primary text-white text-xs font-bold'
                    : 'bg-surface-elevated border border-border text-secondary'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none shadow-md'
                    : 'glass-card text-foreground rounded-tl-none border border-border'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  <MathRenderer content={msg.content} />
                </div>

                {/* Bubble action footer */}
                {msg.role === 'model' && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-foreground-muted">
                    <span>Snap2Learn AI</span>
                    <button
                      onClick={() => handleCopyMessage(msg.content, idx)}
                      className="hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-secondary">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-card p-4 rounded-2xl rounded-tl-none text-xs text-foreground-muted flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-secondary" />
                <span>AI Tutor is crafting explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Follow-up Prompts */}
        {suggestedFollowups.length > 0 && (
          <div className="px-6 py-2 bg-surface/40 border-t border-border/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {suggestedFollowups.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-full bg-surface border border-border hover:border-secondary text-[11px] text-foreground-muted hover:text-foreground whitespace-nowrap transition-colors shrink-0"
              >
                {prompt}
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
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              placeholder={`Ask a follow-up question in ${language}... (e.g. Can you explain in simple Telugu?)`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-secondary placeholder:text-foreground-muted"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-3 rounded-2xl bg-primary text-white shadow-md glow-primary hover:bg-primary-hover disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};
