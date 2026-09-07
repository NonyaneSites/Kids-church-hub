import React, { useState, useEffect } from 'react';
import {
  Clock,
  Mic,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  ChevronRight,
  BookOpen,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import {
  ServiceSegment,
  StageCueBroadcast,
  LessonNotesData
} from '../types/hub';

interface PresenterModeProps {
  currentSegment: ServiceSegment | null;
  nextSegment: ServiceSegment | null;
  localTimer: {
    remainingSeconds: number;
    formattedTime: string;
    isOvertime: boolean;
    overtimeSeconds: number;
    progressPercentage: number;
    targetEndTimeFormatted: string;
  };
  activeCues: StageCueBroadcast[];
  dismissCue: (id: string) => void;
  onCopyCue?: (cueId: string) => void;
  currentUserId?: string;
  lessonNotes: LessonNotesData;
  onOpenHolySpiritModal: () => void;
}

export const PresenterMode: React.FC<PresenterModeProps> = ({
  currentSegment,
  nextSegment,
  localTimer,
  activeCues,
  dismissCue,
  onCopyCue,
  currentUserId,
  lessonNotes,
  onOpenHolySpiritModal,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // SVG circular dimensions
  const size = 320;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (localTimer.progressPercentage / 100) * circumference;

  // Determine timer color archetype
  const timerColor = localTimer.isOvertime
    ? 'text-rose-500 stroke-rose-500'
    : localTimer.remainingSeconds < 60
    ? 'text-rose-400 stroke-rose-400'
    : localTimer.remainingSeconds < 180
    ? 'text-amber-400 stroke-amber-400'
    : 'text-emerald-400 stroke-emerald-400';

  return (
    <div className={`relative w-full rounded-3xl bg-[#161626] border border-white/5 p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[620px] transition-all overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none p-8 bg-[#0b0b12]' : ''
    }`}>
      
      {/* Top Background Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Active Stage Cues / Toasts Bar */}
      <div className="w-full max-w-xl z-20 space-y-2 mb-4">
        {activeCues.map((cue) => {
          const hasCopied = cue.copies?.some((c) => c.userId === currentUserId);

          return (
            <div
              key={cue.id}
              className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-2xl transition-all ${
                cue.priority === 'urgent'
                  ? 'bg-amber-950/95 border-amber-400/60 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                  : cue.priority === 'emergency'
                  ? 'bg-red-950/95 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.45)]'
                  : 'bg-purple-950/95 border-purple-400/60 text-purple-100 shadow-[0_0_25px_rgba(147,51,234,0.35)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {cue.type === 'mic_closer'
                      ? '🎙️'
                      : cue.type === 'wrap_up'
                      ? '⏱️'
                      : cue.type === 'speed_up'
                      ? '⚡'
                      : cue.type === 'slow_down'
                      ? '🐢'
                      : cue.type === 'pray'
                      ? '🙏'
                      : '📢'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        DIRECTIVE: {cue.title}
                      </span>
                      <span className="text-[10px] text-gray-300 font-mono">{cue.timestamp}</span>
                      <span className="text-[10px] text-purple-300">from {cue.senderName}</span>
                    </div>
                    <p className="text-sm font-bold mt-1 leading-snug">{cue.message}</p>
                  </div>
                </div>

                <button
                  onClick={() => dismissCue(cue.id)}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white transition-colors self-start"
                  title="Dismiss cue"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* COPY / ROGER THAT ACTION BAR */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                {hasCopied ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ You Copied This (Roger That)</span>
                  </span>
                ) : (
                  <button
                    id={`btn-copy-presenter-${cue.id}`}
                    onClick={() => onCopyCue && onCopyCue(cue.id)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 animate-pulse"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Say "Copy"</span>
                  </button>
                )}

                <div className="text-[11px] text-gray-300">
                  {cue.copies && cue.copies.length > 0 ? (
                    <span className="text-emerald-300 font-medium">
                      ✓ Copied by: {cue.copies.map((c) => `${c.userName} (${c.userRole})`).join(', ')}
                    </span>
                  ) : (
                    <span className="text-amber-300/80 italic text-[11px]">
                      Awaiting acknowledgment
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 block mb-0.5">
              PRESENTER STAGE VIEW • {currentSegment?.assignedLead || 'Standing By'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentSegment?.title || 'Waiting for Service to Begin'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-holy-spirit-stage"
            onClick={onOpenHolySpiritModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Holy Spirit Mode</span>
          </button>

          <button
            id="btn-toggle-fullscreen-presenter"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Confidence Monitor'}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Massive Circular Countdown Timer */}
      <div className="relative my-8 flex items-center justify-center z-10">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-black/40 stroke-white/5"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Animated Countdown Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${timerColor} transition-all duration-200`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Countdown Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
            {localTimer.isOvertime ? 'OVERTIME RUNNING' : 'TIME REMAINING'}
          </span>
          <span
            className={`text-5xl sm:text-6xl font-black font-timer tracking-tight my-1 ${
              localTimer.isOvertime
                ? 'text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : localTimer.remainingSeconds < 60
                ? 'text-rose-400 animate-pulse drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]'
                : localTimer.remainingSeconds < 180
                ? 'text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.4)]'
                : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'
            }`}
          >
            {localTimer.formattedTime}
          </span>
          <span className="text-xs font-mono font-semibold text-purple-300/80 mt-1">
            Target End: {localTimer.targetEndTimeFormatted}
          </span>
        </div>
      </div>

      {/* Bottom Information Panel: Scripture Prompt & Next Up Preview */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
        
        {/* Left: Memory Verse / Key Scripture Card */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">Today's Key Scripture</span>
            <p className="text-xs sm:text-sm font-medium text-gray-200 italic mt-0.5">
              {lessonNotes.memoryVerse}
            </p>
          </div>
        </div>

        {/* Right: Next Up Teaser */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Next Up in Order</span>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {nextSegment ? `${nextSegment.title} (${nextSegment.assignedLead})` : 'Dismissal & Parents Pick-up'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {nextSegment ? `Starts at ${nextSegment.plannedStartTime}` : 'End of service flow'}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-mono font-bold text-purple-300 border border-white/10">
            {nextSegment ? `${nextSegment.durationMinutes}m` : 'Done'}
          </span>
        </div>

      </div>

    </div>
  );
};
