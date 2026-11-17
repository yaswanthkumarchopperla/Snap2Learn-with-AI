import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { useTheme, UNIQUE_THEMES, ThemeId } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { currentTheme, setTheme, themeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Theme Picker Trigger Button */}
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-xl bg-[#0a0a0f] border border-white/10 hover:border-cyan-400/50 text-white transition-all shadow-xs flex items-center justify-center cursor-pointer group"
          title={`Presentation Theme: ${themeMeta.name} (Click to change)`}
          aria-label="Change presentation theme"
        >
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
            style={{ backgroundColor: `${themeMeta.accentColor}25`, border: `1.5px solid ${themeMeta.accentColor}` }}
          >
            <Palette className="w-2.5 h-2.5" style={{ color: themeMeta.accentColor }} />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-[#08080C] border border-white/10 hover:border-cyan-400/40 text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-xs group"
          title="Change Presentation Theme"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              style={{ backgroundColor: `${themeMeta.accentColor}30`, border: `1.5px solid ${themeMeta.accentColor}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeMeta.accentColor }} />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-semibold text-white block truncate">{themeMeta.name}</span>
              <span className="text-[9px] text-neutral-400 block truncate">{themeMeta.badge}</span>
            </div>
          </div>
          <Palette className="w-3.5 h-3.5 text-neutral-400 group-hover:text-cyan-300 transition-colors shrink-0" />
        </button>
      )}

      {/* Presentation Theme Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-[#000000] border border-white/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 relative text-left"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Unique Presentation Themes</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">Choose Presentation Theme</h3>
                <p className="text-xs text-neutral-300">
                  All themes feature <strong className="text-white">Pure Black Background</strong> with <strong className="text-white">Crisp White Matter</strong> and signature glowing edge highlighters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close theme selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {UNIQUE_THEMES.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 bg-[#060609] ${
                      isSelected
                        ? 'shadow-lg'
                        : 'border-white/10 hover:border-white/25 hover:bg-[#0a0a0f]'
                    }`}
                    style={{
                      borderColor: isSelected ? t.accentColor : undefined,
                      boxShadow: isSelected ? `0 0 25px -4px ${t.accentColor}50` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{
                            backgroundColor: t.accentColor,
                            boxShadow: `0 0 10px ${t.accentColor}`,
                          }}
                        />
                        <span className="font-bold text-xs text-white">{t.name}</span>
                      </div>
                      {isSelected ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                          style={{ backgroundColor: t.accentColor }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                          {t.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-tight">
                      {t.description}
                    </p>

                    {/* Gradient preview bar */}
                    <div
                      className={`h-1.5 w-full rounded-full bg-gradient-to-r ${t.gradient} opacity-90`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300">
              <span>Theme preference saved automatically</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
