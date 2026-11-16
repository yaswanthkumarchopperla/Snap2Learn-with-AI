import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Send, X } from 'lucide-react';

export const FramerPartner: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [appName, setAppName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
      setAppName('');
      setEmail('');
    }, 2000);
  };

  return (
    <section className="py-20 border-t border-white/[0.08] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#121217] to-[#0c0c0e] border border-white/[0.1] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-left relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono text-neutral-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Partner Ecosystem</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bring Framer to your AI product
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Connect your MCP client to Framer so users can create, edit, and manage Framer projects directly from your product interface.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              type="button"
              className="px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Submit your app</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Partner Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#121215] border border-white/15 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white">Partner App Submission</h4>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="text-base font-bold text-white">Submission Received!</h5>
                <p className="text-xs text-neutral-400">Our ecosystem team will review your application within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Product / App Name</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. MyAIStudio"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Developer Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
