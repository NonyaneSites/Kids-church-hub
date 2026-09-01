import React, { useState } from 'react';
import {
  Clock,
  Radio,
  Send,
  Bell,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  ChevronRight,
  Sparkles,
  Volume2,
  Users,
  Mic,
  ArrowRight,
  Flame,
  MessageSquare
} from 'lucide-react';
import { ServiceSegment, QuickMessageType, Role } from '../types/hub';

interface CommsDashboardProps {
  segments: ServiceSegment[];
  currentSegment: ServiceSegment;
  nextSegment: ServiceSegment | null;
  localTimer: {
    remainingSeconds: number;
    formattedTime: string;
    isOvertime: boolean;
    overtimeSeconds: number;
    progressPercentage: number;
    targetEndTimeFormatted: string;
  };
  sendStageCue: (type: QuickMessageType, customMessage?: string) => void;
  sendNotification: (to: string, message: string) => void;
  notifications: { id: string; to: string; message: string; timestamp: string }[];
  startSegment: (segmentId: string, durationMinutes?: number) => void;
  completeSegment: (segmentId: string) => void;
  onOpenHolySpiritModal: () => void;
  onSwitchToPresenter: () => void;
}

export const CommsDashboard: React.FC<CommsDashboardProps> = ({
  segments,
  currentSegment,
  nextSegment,
  localTimer,
  sendStageCue,
  sendNotification,
  notifications,
  startSegment,
  completeSegment,
  onOpenHolySpiritModal,
  onSwitchToPresenter,
}) => {
  const [customCueText, setCustomCueText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('Lebo (Presenter)');
  const [customNotificationText, setCustomNotificationText] = useState('');
  const [lastClickedCue, setLastClickedCue] = useState<string | null>(null);

  const quickTriggers: {
    type: QuickMessageType;
    label: string;
    color: string;
    border: string;
    text: string;
    icon: string;
  }[] = [
    { type: 'wrap_up', label: 'Wrap Up', color: 'bg-amber-950/60 hover:bg-amber-900/80', border: 'border-amber-500/50', text: 'text-amber-300', icon: '⏱️' },
    { type: 'slow_down', label: 'Slow Down', color: 'bg-blue-950/60 hover:bg-blue-900/80', border: 'border-blue-500/50', text: 'text-blue-300', icon: '🐢' },
    { type: 'speed_up', label: 'Speed Up', color: 'bg-orange-950/60 hover:bg-orange-900/80', border: 'border-orange-500/50', text: 'text-orange-300', icon: '⚡' },
    { type: 'mic_closer', label: 'Mic Closer', color: 'bg-purple-950/60 hover:bg-purple-900/80', border: 'border-purple-500/50', text: 'text-purple-300', icon: '🎙️' },
    { type: 'pray', label: 'Pray', color: 'bg-emerald-950/60 hover:bg-emerald-900/80', border: 'border-emerald-500/50', text: 'text-emerald-300', icon: '🙏' },
    { type: 'finish', label: 'Finish', color: 'bg-rose-950/60 hover:bg-rose-900/80', border: 'border-rose-500/50', text: 'text-rose-300', icon: '🏁' },
  ];

  const handleQuickTrigger = (type: QuickMessageType, label: string) => {
    setLastClickedCue(label);
    sendStageCue(type);
    setTimeout(() => setLastClickedCue(null), 1500);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotificationText.trim()) return;
    sendNotification(selectedRecipient.split(' ')[0], customNotificationText);
    setCustomNotificationText('');
  };

  // Completed segment count
  const completedCount = segments.filter((s) => s.status === 'completed').length;
  const totalCount = segments.length;
  const overallPercentage = Math.round((completedCount / totalCount) * 100);

  // SVG circular countdown calculations for mini-widget
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (localTimer.progressPercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">1. COMMUNICATIONS (COMMS) DESK</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-widest uppercase">
                PRODUCER ACTIVE
              </span>
            </div>
            <p className="text-xs text-gray-400">Keep everyone informed in real time. Ephemeral stage cues & timeline progression.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-holy-spirit-quick-comms"
            onClick={onOpenHolySpiritModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Holy Spirit Flow (+3m)</span>
          </button>

          <button
            id="btn-switch-presenter-view"
            onClick={onSwitchToPresenter}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Stage HUD</span>
            <ChevronRight className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout from Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Service Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">TIMELINE PROGRESS</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Live Service Flow</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    Day 3
                  </span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Timeline Rows */}
            <div className="space-y-2">
              {segments.map((seg) => {
                const isActive = seg.id === currentSegment.id;
                const isCompleted = seg.status === 'completed';

                return (
                  <div
                    key={seg.id}
                    className={`group relative p-3 rounded-xl border transition-all flex items-center justify-between overflow-hidden ${
                      isActive
                        ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                        : isCompleted
                        ? 'bg-black/30 border-white/5 text-gray-500'
                        : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>}

                    <div className="flex items-center gap-3 pl-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                            : isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-black/40 text-gray-400 border border-white/5'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : seg.order}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isActive ? 'text-white' : isCompleted ? 'text-gray-500' : 'text-gray-200'}`}>
                            {seg.title}
                          </h4>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500 text-[9px] font-black text-white uppercase tracking-wider shadow-[0_0_8px_rgba(147,51,234,0.6)]">
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-mono text-[11px] text-gray-300">{seg.plannedStartTime}</span>
                          <span>•</span>
                          <span className="text-purple-300/90 font-medium">{seg.assignedLead}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/40">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {isActive && (
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn-complete-${seg.id}`}
                            onClick={() => completeSegment(seg.id)}
                            title="Mark segment complete & advance"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all"
                          >
                            Done ✓
                          </button>
                        </div>
                      )}

                      {!isActive && !isCompleted && (
                        <button
                          id={`btn-start-${seg.id}`}
                          onClick={() => startSegment(seg.id)}
                          className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(147,51,234,0.4)]"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Segment Note / Scripture Banner */}
          {currentSegment.keyScripture && (
            <div className="mt-4 pt-3 border-t border-white/5 bg-black/40 p-3.5 rounded-xl border border-purple-500/20 text-xs">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-0.5">Active Scripture Focus</span>
              <p className="text-gray-200 font-medium italic">"{currentSegment.keyScripture}"</p>
            </div>
          )}
        </div>

        {/* Center Column: Notifications & Quick Stage Cues (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Presenter Notifications Card */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Presenter Notifications</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Stage Pings</span>
            </div>

            {/* Notification List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center mt-0.5">
                      ✝
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{notif.to}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{notif.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Dispatch Form */}
            <form onSubmit={handleSendNotification} className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">Quick preset ping:</span>
                <div className="flex gap-1">
                  {['5 mins to go', 'Move backstage', 'Check Mic'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCustomNotificationText(tag)}
                      className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 hover:text-purple-300 hover:bg-white/10 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  id="input-comms-custom-notif"
                  value={customNotificationText}
                  onChange={(e) => setCustomNotificationText(e.target.value)}
                  placeholder="Type stage notice..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="submit"
                  id="btn-send-comms-notif"
                  disabled={!customNotificationText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Messages (Stage Cues) Card */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Quick Stage Messages</h3>
              </div>
              <span className="text-[10px] font-bold text-green-400 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 uppercase tracking-widest">
                1-TAP EPHEMERAL
              </span>
            </div>

            {/* Quick Trigger Buttons Grid with Immersive UI Styling */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-cue-wrap_up"
                onClick={() => handleQuickTrigger('wrap_up', 'Wrap Up')}
                className="bg-amber-500/10 border border-amber-500/30 text-amber-400 py-3 px-3 rounded-xl text-xs font-bold hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>⏱️</span>
                <span>Wrap Up</span>
              </button>

              <button
                id="btn-cue-mic_closer"
                onClick={() => handleQuickTrigger('mic_closer', 'Mic Closer')}
                className="bg-blue-500/10 border border-blue-500/30 text-blue-400 py-3 px-3 rounded-xl text-xs font-bold hover:bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>🎙️</span>
                <span>Mic Closer</span>
              </button>

              <button
                id="btn-cue-speed_up"
                onClick={() => handleQuickTrigger('speed_up', 'Speed Up')}
                className="bg-purple-500/10 border border-purple-500/30 text-purple-400 py-3 px-3 rounded-xl text-xs font-bold hover:bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>⚡</span>
                <span>Speed Up</span>
              </button>

              <button
                id="btn-cue-slow_down"
                onClick={() => handleQuickTrigger('slow_down', 'Slow Down')}
                className="bg-teal-500/10 border border-teal-500/30 text-teal-400 py-3 px-3 rounded-xl text-xs font-bold hover:bg-teal-500/20 shadow-[0_0_12px_rgba(20,184,166,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>🐢</span>
                <span>Slow Down</span>
              </button>

              <button
                id="btn-cue-pray"
                onClick={() => handleQuickTrigger('pray', 'Pray')}
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-3 px-3 rounded-xl text-xs font-bold hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>🙏</span>
                <span>Pray</span>
              </button>

              <button
                id="btn-cue-finish"
                onClick={() => handleQuickTrigger('finish', 'Finish')}
                className="bg-red-500/10 border border-red-500/30 text-red-400 py-3 px-3 rounded-xl text-xs font-bold hover:bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>🏁</span>
                <span>Finish</span>
              </button>
            </div>

            {/* Feedback notification when clicked */}
            {lastClickedCue && (
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-200 text-xs font-semibold text-center shadow-[0_0_10px_rgba(147,51,234,0.3)] animate-fadeIn">
                Dispatched stage cue: <span className="font-bold text-white">"{lastClickedCue}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Presenter Countdown Preview & Service Progress (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Presenter Countdown Preview Widget */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl text-center flex flex-col items-center justify-between">
            <div className="w-full pb-3 border-b border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 block">
                Presenter Countdown View
              </span>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">{currentSegment.title}</h4>
            </div>

            {/* Circular SVG Ring */}
            <div className="relative my-4 flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#1e1e30"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Glowing Progress Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`transition-all duration-300 ${
                    localTimer.isOvertime
                      ? 'hud-ring-glow-rose'
                      : localTimer.remainingSeconds < 120
                      ? 'hud-ring-glow-amber'
                      : 'hud-ring-glow'
                  }`}
                  strokeWidth="8"
                  stroke={localTimer.isOvertime ? '#f43f5e' : localTimer.remainingSeconds < 120 ? '#f59e0b' : '#9333ea'}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Inside Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">You have</span>
                <span
                  className={`text-3xl font-bold font-timer tracking-tight ${
                    localTimer.isOvertime
                      ? 'text-rose-400 animate-pulse'
                      : localTimer.remainingSeconds < 120
                      ? 'text-amber-300'
                      : 'text-white'
                  }`}
                >
                  {localTimer.formattedTime}
                </span>
                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">
                  {localTimer.isOvertime ? 'OVERTIME' : 'REMAINING'}
                </span>
              </div>
            </div>

            <div className="w-full pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Target End:</span>
              <span className="font-mono font-bold text-purple-300">{localTimer.targetEndTimeFormatted}</span>
            </div>
          </div>

          {/* Service Progress (Everyone) */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-white">Service Progress (Everyone)</h3>
              <span className="text-[11px] font-bold text-purple-300">{completedCount} of {totalCount} completed</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 shadow-[0_0_10px_rgba(147,51,234,0.5)] transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>

            {/* Checklist items list */}
            <div className="space-y-1.5 text-xs pt-1">
              {segments.slice(0, 5).map((seg) => (
                <div key={seg.id} className="flex items-center justify-between text-gray-300 py-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        seg.status === 'completed'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                          : seg.status === 'in_progress'
                          ? 'bg-purple-500 text-white shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'border border-gray-600'
                      }`}
                    >
                      {seg.status === 'completed' ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : seg.status === 'in_progress' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      ) : null}
                    </div>
                    <span className={seg.status === 'completed' ? 'line-through text-gray-500' : ''}>
                      {seg.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      seg.status === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : seg.status === 'in_progress'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                        : 'text-gray-500'
                    }`}
                  >
                    {seg.status === 'completed' ? 'Done' : seg.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
