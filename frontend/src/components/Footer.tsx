import React from 'react';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface/50 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary p-0.5">
            <div className="w-full h-full bg-[#080B18] rounded-[6px] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div>
            <span className="font-bold text-sm text-foreground">Snap2Learn AI</span>
            <p className="text-[11px] text-foreground-muted">Snap. Understand. Practice. Master.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-foreground-muted">
          <span>College Hackathon Edition</span>
          <span>•</span>
          <span>CSE-AIML First Year Focus</span>
          <span>•</span>
          <span>Bilingual English & Telugu</span>
        </div>

        <div className="text-xs text-foreground-muted flex items-center gap-1">
          <span>Engineered with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>using Gemini 2.5 Flash</span>
        </div>
      </div>
    </footer>
  );
};
