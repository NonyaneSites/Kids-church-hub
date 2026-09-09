import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  X, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Radio,
  Sparkles,
  Globe,
  BellRing,
  ShieldAlert,
  Clock,
  UserCheck
} from 'lucide-react';
import { DirectorAnnouncement, ClassId } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

interface DirectorAnnouncementPopupProps {
  announcement: DirectorAnnouncement | null;
  onDismiss: () => void;
}

export const DirectorAnnouncementPopup: React.FC<DirectorAnnouncementPopupProps> = ({
  announcement,
  onDismiss,
}) => {
  // Mobile haptic vibration & keyboard shortcuts
  useEffect(() => {
    if (!announcement) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (announcement.severity === 'emergency') {
          navigator.vibrate([300, 100, 300, 100, 400]);
        } else {
          navigator.vibrate([200, 100, 200]);
        }
      } catch (e) {}
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [announcement, onDismiss]);

  if (!announcement) return null;

  const targetClassLabel = announcement.targetClassId === 'all'
    ? 'ALL 5 CLASSES (CHURCH-WIDE BROADCAST)'
    : CLASSES_CONFIG.find(c => c.id === announcement.targetClassId)?.name || announcement.targetClassId.toUpperCase();

  const isEmergency = announcement.severity === 'emergency';
  const isImportant = announcement.severity === 'important';

  const glowBorder = isEmergency
    ? 'border-4 sm:border-8 border-red-600 shadow-[0_0_120px_rgba(239,68,68,0.8)]'
    : isImportant
    ? 'border-4 sm:border-8 border-amber-500/90 shadow-[0_0_90px_rgba(245,158,11,0.5)]'
    : 'border-4 sm:border-8 border-purple-500/90 shadow-[0_0_90px_rgba(168,85,247,0.5)]';

  const badgeTheme = isEmergency
    ? 'bg-red-600 text-white'
    : isImportant
    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';

  return (
    <div 
      id="director-fullscreen-announcement-modal"
      className={`fixed inset-0 z-[99999] w-screen h-screen min-h-[100dvh] bg-[#070712]/98 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto ${glowBorder} animate-in fade-in duration-200`}
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 pointer-events-none ${
        isEmergency 
          ? 'bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.25)_0%,rgba(0,0,0,0.95)_70%)] animate-pulse'
          : isImportant 
          ? 'bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18)_0%,rgba(0,0,0,0.95)_70%)]' 
          : 'bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.22)_0%,rgba(0,0,0,0.95)_70%)]'
      }`}></div>

      {/* Top Header Ribbon */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${badgeTheme} flex items-center justify-center shrink-0 shadow-lg border border-white/20`}>
            {isEmergency ? (
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            ) : (
              <Megaphone className="w-6 h-6 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                isEmergency 
                  ? 'bg-red-950 text-red-200 border-red-500/40' 
                  : 'bg-white/10 text-purple-200 border-white/15'
              }`}>
                CRC KIDS CHURCH JOHANNESBURG • {isEmergency ? 'EMERGENCY DIRECTIVE' : 'DIRECTOR BROADCAST'}
              </span>
              <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {announcement.timestamp}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {announcement.title || 'DIRECTOR ANNOUNCEMENT'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Target: <strong className="text-white font-bold">{targetClassLabel}</strong></span>
          </div>

          <button
            onClick={onDismiss}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors border border-white/10"
            title="Close (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Central Giant Announcement Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 sm:py-10 max-w-5xl mx-auto text-center space-y-6">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-purple-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Priority Fullscreen Alert • All Stations</span>
        </div>

        {/* Huge Message Display Box */}
        <div className="w-full p-6 sm:p-10 rounded-3xl bg-black/60 border border-white/15 shadow-2xl backdrop-blur-xl">
          <p className={`font-black text-white leading-tight sm:leading-snug tracking-tight select-text ${
            announcement.message.length < 75 
              ? 'text-3xl sm:text-5xl md:text-6xl' 
              : announcement.message.length < 160 
              ? 'text-2xl sm:text-4xl md:text-5xl' 
              : 'text-xl sm:text-2xl md:text-3xl'
          }`}>
            "{announcement.message}"
          </p>
        </div>

        {/* Sender & Target Information */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>From: <strong className="text-purple-300 font-bold">{announcement.senderName}</strong> ({announcement.senderRoleTitle || 'Director'})</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 sm:hidden">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Target: <strong className="text-white font-bold">{targetClassLabel}</strong></span>
          </div>
        </div>
      </main>

      {/* Bottom Giant Acknowledge Bar */}
      <footer className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Broadcast active across all connected church devices. Press [ENTER] or [SPACE] to acknowledge.</span>
        </div>

        <button
          id="btn-ack-director-announcement-full"
          onClick={onDismiss}
          className={`w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
            isEmergency
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/50'
              : isImportant
              ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:to-yellow-500 shadow-amber-600/50'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/50'
          }`}
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>Acknowledge & Close</span>
        </button>
      </footer>
    </div>
  );
};

interface DirectorComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAnnouncement: (
    title: string,
    message: string,
    severity: 'normal' | 'important' | 'emergency',
    targetClassId: ClassId | 'all'
  ) => void;
}

export const DirectorComposeModal: React.FC<DirectorComposeModalProps> = ({
  isOpen,
  onClose,
  onSendAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'normal' | 'important' | 'emergency'>('important');
  const [targetClassId, setTargetClassId] = useState<ClassId | 'all'>('all');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendAnnouncement(
      title.trim() || 'Director Announcement',
      message.trim(),
      severity,
      targetClassId
    );
    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141424] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/40 flex items-center justify-center border border-white/20">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-purple-200 uppercase">
                CRC KIDS CHURCH JOHANNESBURG
              </div>
              <h3 className="text-sm sm:text-base font-black">Broadcast Screen Pop-up</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-gray-400">
            Send an instant full-screen pop-up alert to teachers, tech leads, and presenters across all church screens.
          </p>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
              ⚡ Quick Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTitle('EMERGENCY: HOLD & SECURE');
                  setMessage('All classes hold in place immediately. Ensure all children remain inside until ministry leadership arrives.');
                  setSeverity('emergency');
                  setTargetClassId('all');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 transition-colors"
              >
                🚨 Emergency Hold
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Wrap Up All Classes');
                  setMessage('All classes please wrap up lessons in 5 minutes and prepare children for combined pickup.');
                  setSeverity('important');
                  setTargetClassId('all');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-200 transition-colors"
              >
                ⏱️ 5-Min Wrap Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Altar Call Ready');
                  setMessage('Altar prayer response starting now. Prayer stewards please step forward to the front stage.');
                  setSeverity('important');
                  setTargetClassId('all');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 transition-colors"
              >
                🙏 Altar Call
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Service Dismissal');
                  setMessage('Main service has concluded. Parent check-out desks are now active.');
                  setSeverity('normal');
                  setTargetClassId('all');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-200 transition-colors"
              >
                🔔 Parent Dismissal
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1">
              Announcement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5-Minute Altar Call Notice or Emergency Dismissal"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1">
              Target Audience *
            </label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value as ClassId | 'all')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="all">🌐 ALL 5 Classes (Global Network Broadcast)</option>
              <option value="jy">🔵 Junior Youth (Blue Class, Gr 6-7)</option>
              <option value="tb">🌸 TRAILBLAZERS (Pink Class, Gr 4-5)</option>
              <option value="kb">🔴 Kingdom Builders (Red Class, Gr 1-3)</option>
              <option value="la-orange">🟠 Little Adventures Orange (Pre-K & Gr R)</option>
              <option value="la-yellow">🟡 Little Adventures Yellow (Ages 1-4)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSeverity('normal')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  severity === 'normal'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                    : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                Normal Info
              </button>
              <button
                type="button"
                onClick={() => setSeverity('important')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  severity === 'important'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                Important
              </button>
              <button
                type="button"
                onClick={() => setSeverity('emergency')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  severity === 'emergency'
                    ? 'bg-red-600 text-white border-red-400 shadow-md animate-pulse'
                    : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                🚨 Emergency
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1">
              Message Content *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here... (e.g. All classes wrap up games immediately and gather children to the main stage.)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-purple-600/40 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Screen Pop-up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
