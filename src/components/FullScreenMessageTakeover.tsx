import React, { useEffect } from 'react';
import { 
  Megaphone, 
  X, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  Globe, 
  BellRing, 
  ShieldAlert, 
  Sparkles,
  Volume2,
  Clock,
  UserCheck
} from 'lucide-react';
import { DirectorAnnouncement, CommsEmergencyAlert, StageCueBroadcast, ClassId, Role } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

export interface FullScreenMessageTakeoverProps {
  // Director broadcast announcement
  directorAnnouncement: DirectorAnnouncement | null;
  onDismissDirectorAnnouncement: () => void;
  onAcknowledgeDirectorAnnouncement?: (id: string) => void;

  // Comms Emergency alert
  emergencyAlerts?: CommsEmergencyAlert[];
  onAcknowledgeEmergencyAlert?: (id: string) => void;

  // Global church emergency active
  isEmergencyActive?: boolean;
  activeEmergencyType?: string | null;
  onClearEmergency?: () => void;

  // Urgent stage cues targeted to presenter or current station
  urgentCues?: StageCueBroadcast[];
  onCopyCue?: (cueId: string) => void;
  onDismissCue?: (cueId: string) => void;

  // Context of current station/user
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: Role;
  selectedClassId?: ClassId;
  isOverallAdmin?: boolean;
}

export const FullScreenMessageTakeover: React.FC<FullScreenMessageTakeoverProps> = ({
  directorAnnouncement,
  onDismissDirectorAnnouncement,
  onAcknowledgeDirectorAnnouncement,
  emergencyAlerts = [],
  onAcknowledgeEmergencyAlert,
  isEmergencyActive = false,
  activeEmergencyType = null,
  onClearEmergency,
  urgentCues = [],
  onCopyCue,
  onDismissCue,
  currentUserId,
  currentUserName,
  currentUserRole,
  selectedClassId = 'kb',
  isOverallAdmin = false,
}) => {
  // 1. Determine which message is active (Priorities: Emergency > Director Announcement > Urgent Stage Cue)
  const activeCommsEmergency = emergencyAlerts.find(a => {
    if (a.acknowledged) return false;
    const isSender = Boolean(currentUserId && (a.senderId === currentUserId || (currentUserName && a.senderName.includes(currentUserName))));
    if (isSender) return false;
    return true;
  });

  // Check if current user is the sender of the director announcement
  const isSenderOfAnnouncement = Boolean(
    directorAnnouncement &&
    currentUserId &&
    (directorAnnouncement.senderId === currentUserId || (currentUserName && directorAnnouncement.senderName.includes(currentUserName)))
  );

  // Check if director announcement is intended for this station/user AND recipient is NOT the sender
  const isAnnouncementForUs = (directorAnnouncement && !isSenderOfAnnouncement) ? (
    directorAnnouncement.targetClassId === 'all' ||
    directorAnnouncement.targetClassId === selectedClassId ||
    isOverallAdmin ||
    currentUserRole === 'director'
  ) : false;

  const validDirectorAnnouncement = isAnnouncementForUs ? directorAnnouncement : null;

  // Check if an urgent stage cue is active and not yet copied by current user
  const activeUrgentCue = urgentCues.find(cue => {
    const isUrgent = cue.priority === 'urgent' || cue.priority === 'emergency';
    const isTargetClass = !cue.targetClassId || cue.targetClassId === 'all' || cue.targetClassId === selectedClassId;
    const isSender = Boolean(currentUserId && (cue.senderId === currentUserId || (currentUserName && cue.senderName.includes(currentUserName))));
    const hasCopied = cue.copies?.some(c => c.userId === currentUserId);
    return isUrgent && isTargetClass && !isSender && !hasCopied;
  });

  // Determine active takeover mode
  const isEmergency = Boolean(isEmergencyActive || activeCommsEmergency || (validDirectorAnnouncement?.severity === 'emergency'));
  const isAnnouncement = Boolean(validDirectorAnnouncement && !activeCommsEmergency && !isEmergencyActive);
  const isCue = Boolean(activeUrgentCue && !validDirectorAnnouncement && !activeCommsEmergency && !isEmergencyActive);

  const isTakeoverActive = isEmergency || isAnnouncement || isCue;

  // Trigger haptic vibration on mobile devices whenever takeover becomes active
  useEffect(() => {
    if (isTakeoverActive && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (isEmergency) {
          navigator.vibrate([300, 100, 300, 100, 400]);
        } else if (isAnnouncement) {
          navigator.vibrate([200, 100, 200]);
        } else if (isCue) {
          navigator.vibrate([150, 80, 150]);
        }
      } catch (e) {}
    }
  }, [isTakeoverActive, isEmergency, isAnnouncement, isCue]);

  // Keyboard shortcut listener: Enter or Space acknowledges and dismisses
  useEffect(() => {
    if (!isTakeoverActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        if (activeCommsEmergency && onAcknowledgeEmergencyAlert) {
          onAcknowledgeEmergencyAlert(activeCommsEmergency.id);
        } else if (validDirectorAnnouncement) {
          if (onAcknowledgeDirectorAnnouncement) {
            onAcknowledgeDirectorAnnouncement(validDirectorAnnouncement.id);
          } else {
            onDismissDirectorAnnouncement();
          }
        } else if (activeUrgentCue && onCopyCue) {
          onCopyCue(activeUrgentCue.id);
        } else if (isEmergencyActive && onClearEmergency && isOverallAdmin) {
          onClearEmergency();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTakeoverActive, 
    activeCommsEmergency, 
    validDirectorAnnouncement, 
    activeUrgentCue, 
    isEmergencyActive, 
    onAcknowledgeEmergencyAlert, 
    onDismissDirectorAnnouncement, 
    onAcknowledgeDirectorAnnouncement,
    onCopyCue, 
    onClearEmergency, 
    isOverallAdmin
  ]);

  if (!isTakeoverActive) return null;

  // ----------------------------------------------------
  // SCENARIO 1: EMERGENCY TAKEOVER (Highest Priority)
  // ----------------------------------------------------
  if (isEmergency) {
    const emergencyTitle = activeCommsEmergency?.message 
      ? 'EMERGENCY COMMS BROADCAST' 
      : activeEmergencyType 
      ? `EMERGENCY: ${activeEmergencyType.replace(/_/g, ' ').toUpperCase()}` 
      : validDirectorAnnouncement?.title || 'CHURCH EMERGENCY DIRECTIVE';

    const emergencyMsg = activeCommsEmergency?.message 
      || validDirectorAnnouncement?.message 
      || (activeEmergencyType === 'blank_screen' 
          ? 'Emergency screen blanking active. Keep children calm and await instructions from ministry leaders.' 
          : 'Church-wide emergency action in progress. Maintain order and follow safety protocol.');

    const emergencySender = activeCommsEmergency?.senderName 
      || validDirectorAnnouncement?.senderName 
      || 'Central Command Desk';

    const emergencyTime = activeCommsEmergency?.timestamp 
      || validDirectorAnnouncement?.timestamp 
      || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div 
        id="fullscreen-emergency-takeover"
        className="fixed inset-0 z-[99999] w-screen h-screen min-h-[100dvh] bg-black/95 flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto border-8 border-red-600 shadow-[0_0_120px_rgba(239,68,68,0.8)] animate-in fade-in duration-200"
      >
        {/* Pulsing Emergency Background Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.35)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none animate-pulse"></div>

        {/* Top Header Bar */}
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-red-500/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-bounce shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-red-300 uppercase bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/40">
                  CRC KIDS CHURCH • CRITICAL ALERT
                </span>
                <span className="text-xs font-mono text-red-200">{emergencyTime}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
                {emergencyTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-200 text-xs font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              ALL SCREENS LOCKED
            </span>
          </div>
        </header>

        {/* Center Giant Emergency Message Body */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 sm:py-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-900/60 border-4 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>

          <div className="space-y-4">
            <div className="inline-block text-xs sm:text-sm font-black tracking-widest uppercase bg-red-900/50 text-red-200 px-4 py-1.5 rounded-xl border border-red-500/40">
              IMMEDIATE ACTION DIRECTIVE
            </div>
            <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight sm:leading-snug tracking-tight drop-shadow-2xl">
              "{emergencyMsg}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-red-200/90 pt-2">
            <span className="bg-black/40 px-3 py-1.5 rounded-xl border border-red-500/20">
              Dispatched by: <strong className="text-white">{emergencySender}</strong>
            </span>
            <span className="bg-black/40 px-3 py-1.5 rounded-xl border border-red-500/20">
              Target: <strong className="text-white">ALL STATIONS & PRESENTERS</strong>
            </span>
          </div>
        </main>

        {/* Bottom Giant Acknowledge Bar */}
        <footer className="relative z-10 pt-4 border-t border-red-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-red-300/80 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Audible alert sounding on all church devices. Press Enter or Space to acknowledge.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeCommsEmergency && onAcknowledgeEmergencyAlert && (
              <button
                id="btn-ack-emergency"
                onClick={() => onAcknowledgeEmergencyAlert(activeCommsEmergency.id)}
                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_40px_rgba(239,68,68,0.7)] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>I Acknowledge (Copy That)</span>
              </button>
            )}

            {validDirectorAnnouncement && onDismissDirectorAnnouncement && !activeCommsEmergency && (
              <button
                id="btn-ack-director-emergency"
                onClick={onDismissDirectorAnnouncement}
                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_40px_rgba(239,68,68,0.7)] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>Understood & Acknowledged</span>
              </button>
            )}

            {isEmergencyActive && onClearEmergency && isOverallAdmin && (
              <button
                id="btn-clear-global-emergency"
                onClick={onClearEmergency}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm tracking-wide transition-all"
              >
                Stand Down / Clear Emergency State
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCENARIO 2: DIRECTOR ANNOUNCEMENT TAKEOVER (Whole Screen)
  // ----------------------------------------------------
  if (validDirectorAnnouncement) {
    const isImportant = validDirectorAnnouncement.severity === 'important';

    const targetClassLabel = validDirectorAnnouncement.targetClassId === 'all'
      ? 'ALL 5 CLASSES (CHURCH-WIDE NETWORK BROADCAST)'
      : CLASSES_CONFIG.find(c => c.id === validDirectorAnnouncement.targetClassId)?.name 
        || validDirectorAnnouncement.targetClassId.toUpperCase();

    const glowColor = isImportant 
      ? 'border-amber-500/80 shadow-[0_0_90px_rgba(245,158,11,0.5)]' 
      : 'border-purple-500/80 shadow-[0_0_90px_rgba(168,85,247,0.5)]';

    const headerTheme = isImportant 
      ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700' 
      : 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800';

    return (
      <div 
        id="fullscreen-director-takeover"
        className={`fixed inset-0 z-[99999] w-screen h-screen min-h-[100dvh] bg-[#0c0c18]/98 flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto border-4 sm:border-8 ${glowColor} animate-in fade-in duration-200`}
      >
        {/* Atmospheric Ambient Glow */}
        <div className={`absolute inset-0 pointer-events-none ${
          isImportant 
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18)_0%,rgba(0,0,0,0.92)_70%)]' 
            : 'bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.22)_0%,rgba(0,0,0,0.92)_70%)]'
        }`}></div>

        {/* Top Header Ribbon */}
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${headerTheme} text-white flex items-center justify-center shadow-lg shrink-0 border border-white/20`}>
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-purple-200">
                  CRC KIDS CHURCH JOHANNESBURG • DIRECTOR BROADCAST
                </span>
                <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {validDirectorAnnouncement.timestamp}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {validDirectorAnnouncement.title || 'DIRECTOR ANNOUNCEMENT'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Target: <strong className="text-white">{targetClassLabel}</strong></span>
            </div>

            <button
              onClick={onDismissDirectorAnnouncement}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors border border-white/10"
              title="Close screen takeover (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Central Giant Announcement Body */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 sm:py-12 max-w-5xl mx-auto text-center space-y-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Priority Director Pop-up • Fullscreen Takeover</span>
          </div>

          {/* Huge Message Text Display */}
          <div className="w-full p-6 sm:p-10 rounded-3xl bg-black/60 border border-white/10 shadow-2xl backdrop-blur-xl">
            <p className={`font-black text-white leading-tight sm:leading-snug tracking-tight select-text ${
              validDirectorAnnouncement.message.length < 80 
                ? 'text-3xl sm:text-5xl md:text-6xl' 
                : validDirectorAnnouncement.message.length < 180 
                ? 'text-2xl sm:text-4xl md:text-5xl' 
                : 'text-xl sm:text-3xl md:text-4xl'
            }`}>
              "{validDirectorAnnouncement.message}"
            </p>
          </div>

          {/* Sender & Destination Badge */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>From: <strong className="text-purple-300 font-bold">{validDirectorAnnouncement.senderName}</strong> ({validDirectorAnnouncement.senderRoleTitle})</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 sm:hidden">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Target: <strong className="text-white">{targetClassLabel}</strong></span>
            </div>
          </div>
        </main>

        {/* Bottom Giant Acknowledge Button */}
        <footer className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Broadcast sent to station screens. Press [ENTER] or [SPACE] to acknowledge.</span>
          </div>

          <button
            id="btn-ack-director-announcement"
            onClick={() => {
              if (onAcknowledgeDirectorAnnouncement) {
                onAcknowledgeDirectorAnnouncement(validDirectorAnnouncement.id);
              } else {
                onDismissDirectorAnnouncement();
              }
            }}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>I Acknowledge (Copy That)</span>
          </button>
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCENARIO 3: URGENT STAGE CUE HEADS-UP TAKEOVER
  // (For Presenters or Tech on live stage directives)
  // ----------------------------------------------------
  if (activeUrgentCue) {
    const isWrapUp = activeUrgentCue.type === 'wrap_up';
    const isFinish = activeUrgentCue.type === 'finish';
    const isEmergencyCue = activeUrgentCue.priority === 'emergency';

    const cueTheme = isEmergencyCue 
      ? 'border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.6)]' 
      : isFinish 
      ? 'border-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.6)]' 
      : 'border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.6)]';

    const cueIcon = isWrapUp ? '⏱️' : isFinish ? '🏁' : activeUrgentCue.type === 'mic_closer' ? '🎙️' : activeUrgentCue.type === 'pray' ? '🙏' : '⚡';

    return (
      <div 
        id="fullscreen-stage-cue-takeover"
        className={`fixed inset-0 z-[99999] w-screen h-screen min-h-[100dvh] bg-[#0b0b14]/98 flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto border-4 sm:border-8 ${cueTheme} animate-in fade-in duration-200`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none"></div>

        {/* Top Header */}
        <header className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{cueIcon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  LIVE STAGE DIRECTIVE
                </span>
                <span className="text-xs font-mono text-gray-300">{activeUrgentCue.timestamp}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                From: {activeUrgentCue.senderName}
              </h2>
            </div>
          </div>

          <button
            onClick={() => onDismissCue && onDismissCue(activeUrgentCue.id)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors border border-white/10"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Center Massive Directive */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 sm:py-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <span className="text-5xl sm:text-7xl">{cueIcon}</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase drop-shadow-2xl">
              {activeUrgentCue.title}
            </h1>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-white/15 shadow-2xl backdrop-blur-xl">
            <p className="text-2xl sm:text-4xl font-extrabold text-amber-200 leading-snug">
              "{activeUrgentCue.message}"
            </p>
          </div>
        </main>

        {/* Bottom Giant "COPY THAT" Button */}
        <footer className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-400">
            Tap "Copy That" or press [ENTER] to confirm to the control desk.
          </div>

          <button
            id="btn-copy-takeover"
            onClick={() => onCopyCue && onCopyCue(activeUrgentCue.id)}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all active:scale-95 flex items-center justify-center gap-3 animate-pulse"
          >
            <Radio className="w-6 h-6" />
            <span>Say "Copy That" (Roger)</span>
          </button>
        </footer>
      </div>
    );
  }

  return null;
};
