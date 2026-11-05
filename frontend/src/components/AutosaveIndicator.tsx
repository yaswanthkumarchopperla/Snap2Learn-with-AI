import React from 'react';
import { useAutosave } from '../contexts/AutosaveContext';
import { CheckCircle2, AlertCircle, WifiOff, Loader2 } from 'lucide-react';

interface Props {
  compact?: boolean;
  className?: string;
}

export const AutosaveIndicator: React.FC<Props> = ({ compact = false, className = '' }) => {
  const { status, lastSaved, pendingOfflineCount, isOnline, syncNow } = useAutosave();

  const formattedTime = lastSaved
    ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      onClick={() => status === 'offline' && syncNow()}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        status === 'saving'
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          : status === 'saved' || (status === 'idle' && lastSaved)
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : status === 'error'
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : status === 'offline' || !isOnline
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20'
          : 'bg-surface text-foreground-muted border border-border'
      } ${className}`}
      title={
        status === 'offline' || !isOnline
          ? `Offline: changes stored locally${pendingOfflineCount > 0 ? ` (${pendingOfflineCount} pending)` : ''}. Click to retry sync.`
          : lastSaved
          ? `Last synced with cloud at ${lastSaved.toLocaleTimeString()}`
          : 'Auto-save sync active and connected to cloud'
      }
    >
      {/* 1. Saving state */}
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
          <span>Saving...</span>
        </>
      )}

      {/* 2. Synced state (active saved confirmation or idle with last sync time) */}
      {(status === 'saved' || (status === 'idle' && lastSaved)) && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{formattedTime ? `Synced ${formattedTime}` : 'Synced'}</span>
        </>
      )}

      {/* 3. Sync Failed state */}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{compact ? 'Sync Failed' : 'Sync Failed (retrying)'}</span>
        </>
      )}

      {/* 4. Offline state */}
      {(status === 'offline' || !isOnline) && status !== 'saving' && (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {compact
              ? `Offline${pendingOfflineCount > 0 ? ` (${pendingOfflineCount})` : ''}`
              : `Offline (saved locally${pendingOfflineCount > 0 ? ` · ${pendingOfflineCount} pending` : ''})`}
          </span>
        </>
      )}

      {/* 5. Clean connected idle state before first action */}
      {status === 'idle' && !lastSaved && isOnline && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
          <span>Synced</span>
        </>
      )}
    </div>
  );
};
