import React, { useState } from 'react';
import { 
  Megaphone, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronDown, 
  ChevronUp,
  RadioTower,
  Sparkles
} from 'lucide-react';
import { SentUrgentTrackerItem, AuthUser, ClassId } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

interface UrgentAcknowledgmentBannerProps {
  tracker: SentUrgentTrackerItem | null;
  registeredAccounts: AuthUser[];
  onDismiss: () => void;
}

export const UrgentAcknowledgmentBanner: React.FC<UrgentAcknowledgmentBannerProps> = ({
  tracker,
  registeredAccounts,
  onDismiss,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!tracker) return null;

  // Determine target classes
  const targetClasses: { id: ClassId; name: string; shortCode: string; colorBadge: string }[] = 
    tracker.targetClassId === 'all'
      ? CLASSES_CONFIG.map(c => ({ id: c.id, name: c.name, shortCode: c.shortCode, colorBadge: c.themeBadge }))
      : CLASSES_CONFIG.filter(c => c.id === tracker.targetClassId).map(c => ({ id: c.id, name: c.name, shortCode: c.shortCode, colorBadge: c.themeBadge }));

  // List of acknowledged stations/users from copies
  const acknowledgedList = tracker.copies || [];

  // Determine which target classes have at least one acknowledgment
  const acknowledgedClassIds = new Set(
    acknowledgedList.map(ack => ack.classId).filter(Boolean) as ClassId[]
  );

  // Awaiting classes/stations that haven't responded yet
  const pendingClasses = targetClasses.filter(c => !acknowledgedClassIds.has(c.id));

  // Compute stats
  const totalStations = targetClasses.length;
  const ackStationsCount = targetClasses.filter(c => acknowledgedClassIds.has(c.id)).length;
  const isAllAcknowledged = totalStations > 0 && ackStationsCount === totalStations;
  const percentComplete = totalStations > 0 ? Math.round((ackStationsCount / totalStations) * 100) : 100;

  const isEmergency = tracker.severity === 'emergency';
  const isImportant = tracker.severity === 'important';

  const glowBorder = isEmergency 
    ? 'border-red-500/70 shadow-[0_10px_40px_rgba(239,68,68,0.35)] bg-[#180d12]/95'
    : isImportant
    ? 'border-purple-500/70 shadow-[0_10px_40px_rgba(168,85,247,0.35)] bg-[#120f24]/95'
    : 'border-amber-500/70 shadow-[0_10px_40px_rgba(245,158,11,0.35)] bg-[#1a150b]/95';

  const badgeBg = isEmergency 
    ? 'bg-red-500/20 text-red-300 border-red-500/40'
    : isImportant
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  return (
    <aside 
      aria-label="Live Acknowledgment Tracker"
      className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-[9000] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className={`backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-200 ${glowBorder}`}>
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${badgeBg}`}>
              {tracker.type === 'director_announcement' ? (
                <Megaphone className="w-4 h-4 text-purple-300" />
              ) : tracker.type === 'comms_emergency' ? (
                <ShieldAlert className="w-4 h-4 text-red-300" />
              ) : (
                <Radio className="w-4 h-4 text-amber-300" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Acknowledgment Tracker
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${badgeBg}`}>
                  {tracker.severity}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  Target: <strong className="text-white">{tracker.targetClassId === 'all' ? 'All 5 Classes' : tracker.targetClassId.toUpperCase()}</strong>
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
                "{tracker.title}" — <span className="font-normal text-gray-300">{tracker.message}</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? 'Expand tracker' : 'Minimize tracker'}
            >
              {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Dismiss tracker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Body */}
        {!isMinimized && (
          <div className="p-3.5 sm:p-4 space-y-3.5 bg-black/30">
            {/* Progress Bar & Status */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <RadioTower className="w-3.5 h-3.5 text-purple-400" />
                  Station Confirmation Progress:
                </span>
                <span className={isAllAcknowledged ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-purple-300 font-bold'}>
                  {isAllAcknowledged && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {ackStationsCount} of {totalStations} Stations Acknowledged ({percentComplete}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isAllAcknowledged 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  }`}
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            {/* Two Columns: Acknowledged vs Awaiting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. Acknowledged Column */}
              <div className="rounded-2xl bg-emerald-950/25 border border-emerald-500/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Acknowledged ({acknowledgedList.length})
                  </span>
                  <span className="text-[10px] text-emerald-400/80 lowercase">"copied that"</span>
                </div>

                {acknowledgedList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    Waiting for first station or class lead to copy...
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {acknowledgedList.map((ack, idx) => (
                      <div 
                        key={`${ack.userId}_${idx}`}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-black/40 border border-emerald-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                          <span className="font-bold text-white truncate">
                            {ack.userName}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            ({ack.stationName || (ack.classId ? ack.classId.toUpperCase() : ack.userRole)})
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-mono shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {ack.copiedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Pending Column */}
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                    Awaiting Response ({pendingClasses.length})
                  </span>
                  <span className="text-[10px] text-amber-400/80">Pending</span>
                </div>

                {pendingClasses.length === 0 ? (
                  <div className="py-2 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    All targeted classes have acknowledged!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {pendingClasses.map((cls) => (
                      <div 
                        key={cls.id}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-gray-300"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-amber-400/80 shrink-0 animate-pulse"></span>
                          <span className="font-semibold truncate">
                            {cls.name} ({cls.shortCode})
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          Awaiting
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Summary Notice */}
            <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
              <span>Dispatched at {tracker.timestamp} by {tracker.senderName}</span>
              <span className="text-gray-500">Real-time sync via Supabase Realtime</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
