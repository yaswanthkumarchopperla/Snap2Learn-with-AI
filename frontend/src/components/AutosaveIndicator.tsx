import React from 'react';
import { useAutosave } from '../contexts/AutosaveContext';
import { CheckCircle, AlertCircle, WifiOff, Loader2 } from 'lucide-react';

interface Props {
  compact?: boolean;
  className?: string;
}

export const AutosaveIndicator: React.FC<Props> = ({ compact = false, className = '' }) => {
  const { status, lastSaved, pendingOfflineCount } = useAutosave();

  if (status === 'idle' && !lastSaved && pendingOfflineCount === 0) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        status === 'saving'
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          : status === 'saved'
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : status === 'error'
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : status === 'offline'
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
      } ${className}`}
      title={lastSaved ? `Last auto-saved: ${lastSaved.toLocaleTimeString()}` : 'Cloud auto-sync active'}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {!compact && <span>Saving...</span>}
        </>
      )}

      {status === 'saved' && (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Saved</span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          {!compact && <span>Save failed</span>}
        </>
      )}

      {status === 'offline' && (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {compact
              ? `Offline${pendingOfflineCount > 0 ? ` (${pendingOfflineCount})` : ''}`
              : `Offline (saved locally${pendingOfflineCount > 0 ? ` · ${pendingOfflineCount} pending` : ''})`}
          </span>
        </>
      )}

      {status === 'idle' && lastSaved && (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
          {!compact && (
            <span className="text-slate-400">
              Synced {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </>
      )}
    </div>
  );
};

