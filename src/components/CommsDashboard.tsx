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
  MessageSquare,
  ShieldAlert,
  Plus,
  Trash2,
  X,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { ServiceSegment, QuickMessageType, QuickStagePreset, Role, StageCueBroadcast } from '../types/hub';

interface CommsDashboardProps {
  segments: ServiceSegment[];
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
  sendStageCue: (type: QuickMessageType, customMessage?: string) => void;
  sendCommsEmergency?: (message: string, target?: 'all' | 'tech' | 'presenter') => void;
  quickPresets?: QuickStagePreset[];
  addQuickPreset?: (preset: Omit<QuickStagePreset, 'id'>) => void;
  deleteQuickPreset?: (id: string) => void;
  addSegment?: (segment: Omit<ServiceSegment, 'id'>) => void;
  deleteSegment?: (id: string) => void;
  sendNotification: (to: string, message: string) => void;
  notifications: { id: string; to: string; message: string; timestamp: string }[];
  startSegment: (segmentId: string, durationMinutes?: number) => void;
  completeSegment: (segmentId: string) => void;
  onOpenHolySpiritModal: () => void;
  onSwitchToPresenter: () => void;
  isClassAdmin?: boolean;
  activeCues?: StageCueBroadcast[];
  dismissCue?: (id: string) => void;
  onCopyCue?: (id: string) => void;
  currentUserId?: string;
}

export const CommsDashboard: React.FC<CommsDashboardProps> = ({
  segments,
  currentSegment,
  nextSegment,
  localTimer,
  sendStageCue,
  sendCommsEmergency,
  quickPresets = [],
  addQuickPreset,
  deleteQuickPreset,
  addSegment,
  deleteSegment,
  sendNotification,
  notifications,
  startSegment,
  completeSegment,
  onOpenHolySpiritModal,
  onSwitchToPresenter,
  isClassAdmin = false,
  activeCues = [],
  dismissCue,
  onCopyCue,
  currentUserId,
}) => {
  const [customCueText, setCustomCueText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('Tech Crew');
  const [customNotificationText, setCustomNotificationText] = useState('');
  const [lastClickedCue, setLastClickedCue] = useState<string | null>(null);

  // Emergency Modal State (Comms as main communicator)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyTarget, setEmergencyTarget] = useState<'all' | 'tech' | 'presenter'>('all');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [emergencySentStatus, setEmergencySentStatus] = useState<string | null>(null);

  // Add Segment Modal (Class Admin)
  const [showAddSegmentModal, setShowAddSegmentModal] = useState(false);
  const [newSegTitle, setNewSegTitle] = useState('');
  const [newSegDuration, setNewSegDuration] = useState(15);
  const [newSegLead, setNewSegLead] = useState('');
  const [newSegRole, setNewSegRole] = useState<Role>('presenter');
  const [newSegStartTime, setNewSegStartTime] = useState('09:00 AM');
  const [newSegNotes, setNewSegNotes] = useState('');

  // Add Preset Modal (Class Admin)
  const [showAddPresetModal, setShowAddPresetModal] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetMessage, setNewPresetMessage] = useState('');
  const [newPresetSeverity, setNewPresetSeverity] = useState<'normal' | 'urgent' | 'emergency'>('normal');

  // Standard Default Triggers if no custom presets created yet
  const defaultTriggers: {
    type: QuickMessageType;
    label: string;
    color: string;
    border: string;
    text: string;
    icon: string;
  }[] = [
    { type: 'wrap_up', label: 'Wrap Up', color: 'bg-amber-950/60 hover:bg-amber-900/80', border: 'border-amber-500/50', text: 'text-amber-300', icon: '⏱️' },
    { type: 'speed_up', label: 'Speed Up', color: 'bg-orange-950/60 hover:bg-orange-900/80', border: 'border-orange-500/50', text: 'text-orange-300', icon: '⚡' },
    { type: 'slow_down', label: 'Slow Down', color: 'bg-blue-950/60 hover:bg-blue-900/80', border: 'border-blue-500/50', text: 'text-blue-300', icon: '🐢' },
    { type: 'mic_closer', label: 'Mic Closer', color: 'bg-purple-950/60 hover:bg-purple-900/80', border: 'border-purple-500/50', text: 'text-purple-300', icon: '🎙️' },
    { type: 'pray', label: 'Altar Prayer', color: 'bg-emerald-950/60 hover:bg-emerald-900/80', border: 'border-emerald-500/50', text: 'text-emerald-300', icon: '🙏' },
    { type: 'finish', label: 'Finish Now', color: 'bg-rose-950/60 hover:bg-rose-900/80', border: 'border-rose-500/50', text: 'text-rose-300', icon: '🏁' },
  ];

  const handleQuickTrigger = (type: QuickMessageType, label: string) => {
    setLastClickedCue(label);
    sendStageCue(type);
    setTimeout(() => setLastClickedCue(null), 1500);
  };

  const handleCustomCueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCueText.trim()) return;
    sendStageCue('custom', customCueText.trim());
    setLastClickedCue(customCueText.trim());
    setCustomCueText('');
    setTimeout(() => setLastClickedCue(null), 1500);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotificationText.trim()) return;
    sendNotification(selectedRecipient, customNotificationText.trim());
    setCustomNotificationText('');
  };

  const handleTriggerEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyMessage.trim() || !sendCommsEmergency) return;
    sendCommsEmergency(emergencyMessage.trim(), emergencyTarget);
    setEmergencySentStatus(`Emergency Broadcast dispatched to ${emergencyTarget.toUpperCase()}`);
    setEmergencyMessage('');
    setTimeout(() => {
      setEmergencySentStatus(null);
      setShowEmergencyModal(false);
    }, 1800);
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegTitle.trim() || !addSegment) return;
    addSegment({
      title: newSegTitle.trim(),
      durationMinutes: Number(newSegDuration) || 10,
      plannedStartTime: newSegStartTime || '09:00 AM',
      assignedLead: newSegLead.trim() || 'Teacher Lebo',
      role: newSegRole,
      notes: newSegNotes.trim() || undefined,
      status: 'upcoming',
    });
    setNewSegTitle('');
    setNewSegNotes('');
    setShowAddSegmentModal(false);
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetLabel.trim() || !newPresetMessage.trim() || !addQuickPreset) return;
    addQuickPreset({
      label: newPresetLabel.trim(),
      message: newPresetMessage.trim(),
      severity: newPresetSeverity,
      icon: newPresetSeverity === 'emergency' ? '🚨' : newPresetSeverity === 'urgent' ? '⚠️' : '📢',
    });
    setNewPresetLabel('');
    setNewPresetMessage('');
    setShowAddPresetModal(false);
  };

  // Completed segment count
  const completedCount = segments.filter((s) => s?.status === 'completed').length;
  const totalCount = segments.length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // SVG mini-timer calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (localTimer.progressPercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">COMMUNICATIONS (COMMS) DESK</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-widest uppercase">
                MAIN COMMUNICATOR
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Central dispatcher to Tech & Presenter. Broadcast stage cues, timeline advancement & emergency directives.
            </p>
          </div>
        </div>

        {/* Action Buttons: Emergency Broadcast & Stage View */}
        <div className="flex items-center gap-2">
          {sendCommsEmergency && (
            <button
              id="btn-comms-emergency"
              onClick={() => setShowEmergencyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Broadcast Emergency</span>
            </button>
          )}

          <button
            onClick={onSwitchToPresenter}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>Stage View</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Timeline Segments Progress (4 cols) */}
        <div className="lg:col-span-4 bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                FLOW OF SERVICE
              </span>
              <h3 className="text-sm font-bold text-white">Timeline Progress</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-purple-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                {completedCount} / {totalCount} Done ({overallPercentage}%)
              </span>
              {isClassAdmin && addSegment && (
                <button
                  onClick={() => setShowAddSegmentModal(true)}
                  className="p-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white transition-colors"
                  title="Class Admin: Add Service Segment"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>

          {/* Segments List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {segments.length === 0 ? (
              <div className="p-6 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-400 space-y-2">
                <Clock className="w-6 h-6 mx-auto text-gray-500 opacity-60" />
                <p>Service timeline is blank.</p>
                <p className="text-[11px] text-gray-500">
                  Every Monday starts clean. The Class Admin creates the timeline.
                </p>
                {isClassAdmin && addSegment && (
                  <button
                    onClick={() => setShowAddSegmentModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    + Create First Segment
                  </button>
                )}
              </div>
            ) : (
              segments.map((seg, idx) => (
                <div
                  key={seg.id}
                  className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                    seg?.status === 'in-progress'
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : seg?.status === 'completed'
                      ? 'bg-black/30 border-white/5 text-gray-400'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400">#{idx + 1}</span>
                      <h4 className="font-bold text-white text-xs">{seg.title}</h4>
                      {seg?.status === 'in-progress' && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500 text-[9px] font-black text-white animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-purple-300">
                        {seg.durationMinutes}m
                      </span>

                      {isClassAdmin && deleteSegment && (
                        <button
                          onClick={() => deleteSegment(seg.id)}
                          className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete Segment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Lead: {seg.assignedLead}</span>
                    <span className="font-mono text-[10px]">{seg.plannedStartTime}</span>
                  </div>

                  {/* Segment Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    {seg?.status !== 'in-progress' && seg?.status !== 'completed' && (
                      <button
                        onClick={() => startSegment(seg.id, seg.durationMinutes)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Segment</span>
                      </button>
                    )}

                    {seg?.status === 'in-progress' && (
                      <button
                        onClick={() => completeSegment(seg.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Complete</span>
                      </button>
                    )}

                    {seg?.status === 'completed' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Column: Active Segment & Quick Stage Cues (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Active Segment Display */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">
                ACTIVE STAGE ITEM
              </span>
              <span className="text-xs font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                {localTimer.targetEndTimeFormatted} End
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Mini Circular Countdown */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg width="112" height="112" className="transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="text-black/40 stroke-white/5"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className={`transition-all duration-300 ${
                      localTimer.isOvertime ? 'stroke-rose-500' : 'stroke-purple-500'
                    }`}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 - (localTimer.progressPercentage / 100) * (2 * Math.PI * 48)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-xl font-black font-mono ${localTimer.isOvertime ? 'text-rose-400' : 'text-white'}`}>
                    {localTimer.formattedTime}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-gray-400">
                    {localTimer.isOvertime ? 'OVERTIME' : 'REMAINING'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Current Presenter
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {currentSegment?.title || 'No Active Segment'}
                </h3>
                <p className="text-xs text-purple-300 font-medium">
                  {currentSegment?.assignedLead || 'Standing by for next session'}
                </p>
                {nextSegment && (
                  <p className="text-[11px] text-gray-400 pt-1">
                    Next: <span className="text-gray-300 font-semibold">{nextSegment.title}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenHolySpiritModal}
              className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Extend for Holy Spirit Flow (+3m)</span>
            </button>
          </div>

          {/* Quick Stage Messages (Admin Created & Managed) */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                  STAGE CUES DISPATCH
                </span>
                <h3 className="text-sm font-bold text-white">Quick Stage Messages</h3>
              </div>

              <div className="flex items-center gap-1">
                {isClassAdmin && addQuickPreset && (
                  <button
                    onClick={() => setShowAddPresetModal(true)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-colors"
                    title="Class Admin: Add Custom Stage Preset"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Stage triggers grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Default triggers */}
              {defaultTriggers.map((trig) => (
                <button
                  key={trig.type}
                  id={`btn-cue-${trig.type}`}
                  onClick={() => handleQuickTrigger(trig.type, trig.label)}
                  className={`p-2.5 rounded-xl border ${trig.border} ${trig.color} text-left transition-all active:scale-95 shadow-sm ${
                    lastClickedCue === trig.label ? 'ring-2 ring-white scale-105' : ''
                  }`}
                >
                  <span className="text-base block mb-0.5">{trig.icon}</span>
                  <span className={`text-xs font-bold block ${trig.text}`}>{trig.label}</span>
                </button>
              ))}

              {/* Admin-Created Quick Presets */}
              {quickPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-2.5 rounded-xl border relative group text-left transition-all ${
                    preset.severity === 'urgent'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      : preset.severity === 'emergency'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      setLastClickedCue(preset.label);
                      sendStageCue('custom', preset.message);
                      setTimeout(() => setLastClickedCue(null), 1500);
                    }}
                    className="w-full text-left"
                  >
                    <span className="text-base block mb-0.5">{preset.icon}</span>
                    <span className="text-xs font-bold block truncate">{preset.label}</span>
                  </button>

                  {isClassAdmin && deleteQuickPreset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuickPreset(preset.id);
                      }}
                      className="absolute top-1 right-1 p-1 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Cue Input */}
            <form onSubmit={handleCustomCueSubmit} className="pt-2 flex gap-2">
              <input
                type="text"
                value={customCueText}
                onChange={(e) => setCustomCueText(e.target.value)}
                placeholder="Type flash cue to presenter stage..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

            {/* Live Directives & "Copy" Acknowledgment Receipts Feed */}
            {activeCues && activeCues.length > 0 && (
              <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dispatched Cues & "Copy" Receipts ({activeCues.length})</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Live Sync</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCues.map((cue) => {
                    const hasCopied = cue.copies?.some((c) => c.userId === currentUserId);

                    return (
                      <div
                        key={cue.id}
                        className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <div className="flex items-center gap-2">
                            <span className="text-white">{cue.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              {cue.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono">{cue.timestamp}</span>
                            {dismissCue && (
                              <button
                                onClick={() => dismissCue(cue.id)}
                                className="text-gray-500 hover:text-white p-0.5"
                                title="Dismiss cue"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-300 text-[11px]">{cue.message}</p>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-white/5 text-[10px]">
                          <div>
                            {cue.copies && cue.copies.length > 0 ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Copied by: {cue.copies.map((c) => `${c.userName} (${c.userRole})`).join(', ')}</span>
                              </span>
                            ) : (
                              <span className="text-amber-400/80 italic">
                                ⏳ Waiting for Tech / Presenter to say "Copy"...
                              </span>
                            )}
                          </div>

                          {!hasCopied && onCopyCue && (
                            <button
                              onClick={() => onCopyCue(cue.id)}
                              className="px-2 py-0.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]"
                            >
                              Say "Copy"
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Direct Messaging & Emergency Dispatcher (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Emergency Dispatcher Quick Card (Comms is the main communicator) */}
          <div className="bg-[#161626] rounded-2xl border border-rose-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Emergency Directives</h3>
              </div>
              <span className="text-[10px] text-rose-300 font-mono uppercase">Direct Link</span>
            </div>

            <p className="text-xs text-gray-400">
              Comms is the primary emergency dispatcher. Broadcast critical safety, mic, or parent directives instantly to Tech & Presenter.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setEmergencyTarget('tech');
                  setEmergencyMessage('Immediate Audio Cut & Screen Blackout Required');
                  setShowEmergencyModal(true);
                }}
                className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-left transition-all"
              >
                <span className="text-xs font-bold text-rose-200 block">→ Alert Tech</span>
                <span className="text-[10px] text-gray-400">Audio / Screen cut</span>
              </button>

              <button
                onClick={() => {
                  setEmergencyTarget('presenter');
                  setEmergencyMessage('Parent Pickup Alert: Security Tag #104 Needed at Desk');
                  setShowEmergencyModal(true);
                }}
                className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-left transition-all"
              >
                <span className="text-xs font-bold text-amber-200 block">→ Alert Presenter</span>
                <span className="text-[10px] text-gray-400">Parent tag / Stage clear</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEmergencyTarget('all');
                setShowEmergencyModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Broadcast Custom Emergency</span>
            </button>
          </div>

          {/* Inter-Team Walkie / Notification Channel */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Direct Comms Walkie</h3>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">Live Dispatch</span>
            </div>

            {/* Target selector */}
            <div className="flex gap-2">
              {(['Tech Crew', 'Presenter', 'All Leads'] as const).map((recip) => (
                <button
                  key={recip}
                  type="button"
                  onClick={() => setSelectedRecipient(recip)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRecipient === recip
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {recip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendNotification} className="space-y-2">
              <textarea
                rows={2}
                value={customNotificationText}
                onChange={(e) => setCustomNotificationText(e.target.value)}
                placeholder={`Dispatch message to ${selectedRecipient}...`}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-purple-400" />
                <span>Dispatch Direct Note</span>
              </button>
            </form>

            {/* Recent Notifications Log */}
            <div className="space-y-2 pt-2 border-t border-white/5 max-h-44 overflow-y-auto pr-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Dispatched Feed ({notifications.length})
              </span>
              {notifications.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-500">No notes dispatched yet.</div>
              ) : (
                notifications.slice(-4).map((notif) => (
                  <div key={notif.id} className="p-2 rounded-xl bg-white/5 border border-white/5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>To: {notif.to}</span>
                      <span>{notif.timestamp}</span>
                    </div>
                    <p className="text-gray-200 text-[11px]">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Emergency Broadcast Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Dispatch Emergency Directive</span>
              </h3>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emergencySentStatus ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-center font-bold text-sm">
                ✓ {emergencySentStatus}
              </div>
            ) : (
              <form onSubmit={handleTriggerEmergency} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Target Recipient *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All (Tech & Presenter)' },
                      { id: 'tech', label: 'Tech Crew Only' },
                      { id: 'presenter', label: 'Presenter Only' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEmergencyTarget(t.id as any)}
                        className={`py-2 px-1 rounded-xl font-bold uppercase transition-all text-[10px] text-center ${
                          emergencyTarget === t.id
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">
                    Emergency Directive Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={emergencyMessage}
                    onChange={(e) => setEmergencyMessage(e.target.value)}
                    placeholder="e.g. MUTE ALL MICS - Medical assistance required on row 4"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Quick emergency templates */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {[
                      'Immediate Audio Cut & Screen Blackout',
                      'Parent Pickup: Security Tag Needed',
                      'Switch to Handheld Backup Mic',
                      'Clear Stage for Transition Now',
                    ].map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => setEmergencyMessage(txt)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  >
                    Broadcast Emergency Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Timeline Segment Modal (Class Admin) */}
      {showAddSegmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Add Timeline Segment (Class Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddSegmentModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Segment Title *</label>
                <input
                  required
                  type="text"
                  value={newSegTitle}
                  onChange={(e) => setNewSegTitle(e.target.value)}
                  placeholder="e.g. Welcome & Icebreaker, Praise & Worship, Sermon"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Duration (Minutes) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="180"
                    value={newSegDuration}
                    onChange={(e) => setNewSegDuration(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    value={newSegStartTime}
                    onChange={(e) => setNewSegStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Assigned Lead</label>
                  <input
                    type="text"
                    value={newSegLead}
                    onChange={(e) => setNewSegLead(e.target.value)}
                    placeholder="e.g. Teacher Sarah / Pastor Hope"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Primary Role</label>
                  <select
                    value={newSegRole}
                    onChange={(e) => setNewSegRole(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="presenter">Presenter / Teacher</option>
                    <option value="tech">Tech / Audio Visual</option>
                    <option value="comms">Comms / Stage Lead</option>
                    <option value="class-admin">Class Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={newSegNotes}
                  onChange={(e) => setNewSegNotes(e.target.value)}
                  placeholder="Optional slide hints, video file names, or props..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSegmentModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Add Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Quick Stage Preset Modal (Class Admin) */}
      {showAddPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Create Stage Cue Preset (Class Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddPresetModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePreset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Button Label *</label>
                <input
                  required
                  type="text"
                  value={newPresetLabel}
                  onChange={(e) => setNewPresetLabel(e.target.value)}
                  placeholder="e.g. 2 Min Warning, Bring Up Kids, Altar Call"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Stage Message Displayed *</label>
                <textarea
                  required
                  rows={2}
                  value={newPresetMessage}
                  onChange={(e) => setNewPresetMessage(e.target.value)}
                  placeholder="e.g. Please wrap up current story point in 2 minutes"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Urgency Level</label>
                <select
                  value={newPresetSeverity}
                  onChange={(e) => setNewPresetSeverity(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="normal">Normal (Purple Cue)</option>
                  <option value="urgent">Urgent (Amber Cue)</option>
                  <option value="emergency">Critical (Red Emergency Cue)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPresetModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
