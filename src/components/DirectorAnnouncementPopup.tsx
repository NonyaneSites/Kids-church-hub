import React, { useState } from 'react';
import { 
  Megaphone, 
  X, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  Globe,
  BellRing
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
  if (!announcement) return null;

  const targetClassLabel = announcement.targetClassId === 'all'
    ? 'ALL 5 CLASSES (GLOBAL BROADCAST)'
    : CLASSES_CONFIG.find(c => c.id === announcement.targetClassId)?.name || announcement.targetClassId.toUpperCase();

  const isEmergency = announcement.severity === 'emergency';
  const isImportant = announcement.severity === 'important';

  const borderColor = isEmergency 
    ? 'border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.5)]' 
    : isImportant 
    ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.4)]' 
    : 'border-purple-500/80 shadow-[0_0_50px_rgba(147,51,234,0.4)]';

  const headerBg = isEmergency
    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600'
    : isImportant
    ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700'
    : 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg bg-[#121222] border-2 rounded-3xl overflow-hidden shadow-2xl transition-all transform scale-100 ${borderColor}`}
      >
        {/* Header Ribbon */}
        <div className={`${headerBg} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center shrink-0 border border-white/20">
              <Megaphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
                  CRC KIDS CHURCH • JOHANNESBURG
                </span>
                <span className="text-[10px] font-mono opacity-90">{announcement.timestamp}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {announcement.title || 'DIRECTOR ANNOUNCEMENT'}
              </h2>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Target Audience Badge */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">Target Hubs:</span>
              <strong className="text-white font-bold">{targetClassLabel}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span>From:</span>
              <span className="text-purple-300 font-bold">{announcement.senderName}</span>
            </div>
          </div>

          {/* Announcement Message Banner */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
            <p className="text-white text-base sm:text-lg font-semibold leading-relaxed whitespace-pre-wrap">
              "{announcement.message}"
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Real-time Director broadcast to all church stations</span>
            </div>

            <button
              onClick={onDismiss}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge & Close</span>
            </button>
          </div>
        </div>
      </div>
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
