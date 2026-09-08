import React, { useState } from 'react';
import {
  Tv,
  CheckCircle2,
  Music,
  Play,
  Pause,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Volume2,
  VolumeX,
  MicOff,
  Radio,
  ShieldAlert,
  AlertTriangle,
  Film,
  Check,
  X,
  Trash2,
  Link,
  Unlink,
  Bell,
  ArrowDownLeft,
  Clock
} from 'lucide-react';
import {
  PreServiceCheckItem,
  WorshipSong,
  EmergencyActionType,
  LessonNotesData,
  IncidentLog,
  StageCueBroadcast,
  CommsEmergencyAlert
} from '../types/hub';

interface TechConsoleProps {
  checklist: PreServiceCheckItem[];
  toggleChecklistItem: (id: string) => void;
  markAllChecksDone: () => void;
  addChecklistItem?: (label: string, category: 'hardware' | 'audio' | 'media' | 'presentation' | 'general') => void;
  deleteChecklistItem?: (id: string) => void;
  worshipQueue: WorshipSong[];
  setWorshipSong: (songId: string, isPlaying: boolean) => void;
  currentSlideIndex: number;
  totalSlides: number;
  setSlideIndex: (index: number) => void;
  triggerEmergency: (action: EmergencyActionType, message?: string) => void;
  clearEmergency: () => void;
  isEmergencyActive: boolean;
  activeEmergencyType: EmergencyActionType | null;
  lessonNotes: LessonNotesData;
  activeCues?: StageCueBroadcast[];
  onCopyCue?: (cueId: string) => void;
  currentUserId?: string;
  commsEmergencyAlerts?: CommsEmergencyAlert[];
  onAcknowledgeEmergency?: (id: string) => void;
  incidents?: IncidentLog[];
  onAddIncident?: (description: string, severity: 'low' | 'medium' | 'critical') => void;
  onResolveIncident?: (id: string) => void;
  isClassAdmin?: boolean;
}

export const TechConsole: React.FC<TechConsoleProps> = ({
  checklist,
  toggleChecklistItem,
  markAllChecksDone,
  addChecklistItem,
  deleteChecklistItem,
  worshipQueue,
  setWorshipSong,
  currentSlideIndex,
  totalSlides,
  setSlideIndex,
  triggerEmergency,
  clearEmergency,
  isEmergencyActive,
  activeEmergencyType,
  lessonNotes,
  activeCues = [],
  onCopyCue,
  currentUserId,
  commsEmergencyAlerts = [],
  onAcknowledgeEmergency,
  incidents = [],
  onAddIncident,
  onResolveIncident,
  isClassAdmin = false,
}) => {
  // Add Checklist Modal State (for Class Admin)
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<'hardware' | 'audio' | 'media' | 'presentation' | 'general'>('hardware');

  // Sound effects
  const [sfxPlaying, setSfxPlaying] = useState<string | null>(null);

  // New Incident Modal State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'critical'>('medium');

  // Filter comms emergency alerts targeted to Tech or All
  const techEmergencyAlerts = commsEmergencyAlerts.filter(
    (a) => a.target === 'tech' || a.target === 'all'
  );

  const handleCreateChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistLabel.trim() || !addChecklistItem) return;
    addChecklistItem(newChecklistLabel.trim(), newChecklistCategory);
    setNewChecklistLabel('');
    setShowAddChecklistModal(false);
  };

  // DJ Booth SFX
  const playSoundEffect = (name: string, frequency: number, type: OscillatorType = 'sine') => {
    setSfxPlaying(name);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        if (name === 'Cheer') {
          osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.4);
        }
        gain.connect(ctx.destination);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {}
    setTimeout(() => setSfxPlaying(null), 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">TECH & SYSTEMS CONSOLE</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE COMMS DESK</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tech booth receives stage cues & directives from Comms & Presenters. Tap "Copy" to confirm receipt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isEmergencyActive && (
            <button
              onClick={clearEmergency}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset Emergency</span>
            </button>
          )}
        </div>
      </div>

      {/* Emergency Alerts from Comms Banner */}
      {techEmergencyAlerts.length > 0 && (
        <div className="space-y-2">
          {techEmergencyAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-white shadow-2xl flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-[10px] font-black uppercase tracking-wider">
                      COMMS EMERGENCY DIRECTIVE
                    </span>
                    <span className="text-xs text-rose-200 font-mono">{alert.timestamp}</span>
                    <span className="text-xs text-rose-300">From: {alert.senderName}</span>
                  </div>
                  <p className="text-sm font-bold mt-1 text-white">{alert.message}</p>
                </div>
              </div>

              {onAcknowledgeEmergency && (
                <button
                  onClick={() => onAcknowledgeEmergency(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-white text-rose-900 hover:bg-rose-100 font-bold text-xs shrink-0 transition-all shadow-md"
                >
                  ✓ Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Pre-Service Checklist (4 cols) */}
        <div className="lg:col-span-4 bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-0.5">
                AUDIO & VISUAL READY
              </span>
              <h3 className="text-sm font-bold text-white">Pre-Service Checklist</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-purple-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                {checklist.filter((c) => c.isChecked).length} / {checklist.length}
              </span>
              {isClassAdmin && addChecklistItem && (
                <button
                  onClick={() => setShowAddChecklistModal(true)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-colors"
                  title="Class Admin: Add Checklist Item"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {checklist.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-400 space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto text-gray-500 opacity-60" />
                <p>Checklist is blank.</p>
                {isClassAdmin && addChecklistItem && (
                  <button
                    onClick={() => setShowAddChecklistModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                  >
                    + Add Item (Class Admin)
                  </button>
                )}
              </div>
            ) : (
              checklist.map((item) => (
                <div
                  key={item.id}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    item.isChecked
                      ? 'bg-black/30 border-green-500/30 text-gray-300'
                      : 'bg-white/5 border-amber-500/30 text-white'
                  }`}
                >
                  <button
                    id={`chk-item-${item.id}`}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-2.5 flex-1 text-left"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        item.isChecked
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-500 bg-black/30'
                      }`}
                    >
                      {item.isChecked && <Check className="w-3 h-3 text-green-400" />}
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.isChecked
                          ? 'text-green-400 bg-green-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {item.isChecked ? 'Verified' : 'Pending'}
                    </span>

                    {isClassAdmin && deleteChecklistItem && (
                      <button
                        onClick={() => deleteChecklistItem(item.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                        title="Delete checklist item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {checklist.length > 0 && (
            <button
              id="btn-all-good-checklist"
              onClick={markAllChecksDone}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark All Checks Complete ✓</span>
            </button>
          )}

          {/* Incidents Feed */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Incidents ({incidents.filter((i) => i?.status === 'open').length})
                </h4>
              </div>
              <button
                onClick={() => setShowIncidentModal(true)}
                className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Log</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {incidents.filter((i) => i?.status === 'open').length === 0 ? (
                <div className="p-3 rounded-xl bg-black/30 text-center text-[11px] text-gray-500">
                  No active equipment incidents reported.
                </div>
              ) : (
                incidents
                  .filter((i) => i?.status === 'open')
                  .map((inc) => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-rose-300">{inc.time}</span>
                        {onResolveIncident && (
                          <button
                            onClick={() => onResolveIncident(inc.id)}
                            className="text-[10px] text-emerald-400 hover:underline"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                      <p className="text-gray-200 text-[11px]">{inc.description}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Center & Right Columns: Tech Operations & Incoming Directives (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Incoming Directives & Cues Receiver with Copy / Roger That Acknowledgment */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                  LIVE DIRECTIVES & STAGE CUES FEED
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-purple-400" />
                  <span>Directives from Comms & Presenter (Incoming)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-purple-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  {activeCues.length} Active Directives
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activeCues.length === 0 ? (
                <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-gray-500 opacity-60" />
                  <p className="font-bold text-gray-300">No active directives or cues.</p>
                  <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                    When Comms or the Presenter dispatches stage cues, timing alerts, or instructions, they appear here in real-time. Click "Copy" on any message to let the sender know you've received it.
                  </p>
                </div>
              ) : (
                activeCues.map((cue) => {
                  const hasCopied = cue.copies?.some((c) => c.userId === currentUserId);

                  return (
                    <div
                      key={cue.id}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        cue.priority === 'urgent'
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">{cue.title}</span>
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                            {cue.senderRole.toUpperCase()}
                          </span>
                          {cue.priority === 'urgent' && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold animate-pulse">
                              Urgent
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{cue.timestamp}</span>
                      </div>

                      <p className="text-sm font-semibold text-gray-100 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        {cue.message}
                      </p>

                      <div className="text-[11px] text-gray-400">
                        Dispatched by: <strong className="text-white">{cue.senderName}</strong> ({cue.senderRole})
                      </div>

                      {/* COPY / ROGER THAT ACKNOWLEDGMENT BAR */}
                      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          {hasCopied ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>✓ You Copied This Directive</span>
                            </span>
                          ) : (
                            <button
                              id={`btn-copy-tech-${cue.id}`}
                              onClick={() => onCopyCue && onCopyCue(cue.id)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 animate-pulse cursor-pointer"
                            >
                              <Radio className="w-4 h-4" />
                              <span>Say "Copy" (Confirm Receipt)</span>
                            </button>
                          )}
                        </div>

                        {/* List of everyone who said copy */}
                        <div className="text-[11px] text-gray-400">
                          {cue.copies && cue.copies.length > 0 ? (
                            <span className="text-emerald-400 font-medium">
                              ✓ Received by: {cue.copies.map((c) => `${c.userName} (${c.userRole})`).join(', ')}
                            </span>
                          ) : (
                            <span className="text-amber-400/80 italic text-[11px]">
                              ⏳ Awaiting acknowledgments
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Booth Quick SFX Audio Soundboard */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-0.5">
                  AUDIO BOOTH
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span>Quick SFX Audio Soundboard</span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { name: 'Cheer', freq: 587, type: 'sine' as OscillatorType },
                { name: 'Horn', freq: 440, type: 'sawtooth' as OscillatorType },
                { name: 'Chime', freq: 880, type: 'triangle' as OscillatorType },
                { name: 'Roger Beep', freq: 1200, type: 'sine' as OscillatorType },
                { name: 'Alert', freq: 650, type: 'square' as OscillatorType },
                { name: 'Victory', freq: 784, type: 'sine' as OscillatorType },
              ].map((sfx) => (
                <button
                  key={sfx.name}
                  onClick={() => playSoundEffect(sfx.name, sfx.freq, sfx.type)}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                    sfxPlaying === sfx.name
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                      : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-base">🔊</span>
                  <span>{sfx.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Add Checklist Item Modal (Class Admin) */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>Add Tech Checklist Item (Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddChecklistModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChecklistItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Checklist Item Name *</label>
                <input
                  required
                  type="text"
                  value={newChecklistLabel}
                  onChange={(e) => setNewChecklistLabel(e.target.value)}
                  placeholder="e.g. Wireless Mic 1 Battery Check, Stage Projector HDMI sync"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Category</label>
                <select
                  value={newChecklistCategory}
                  onChange={(e) => setNewChecklistCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
                >
                  <option value="hardware">Hardware & Inputs</option>
                  <option value="audio">Audio & Microphones</option>
                  <option value="media">Media & Video</option>
                  <option value="presentation">Presentation & Slides</option>
                  <option value="general">General Stage Ops</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChecklistModal(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md min-h-[44px]"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161626] border border-white/10 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Log Tech Incident</h3>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Incident Description
                </label>
                <textarea
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  placeholder="e.g. Wireless Mic 2 battery indicator flashing red (5% remaining)"
                  rows={3}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { level: 'low', label: 'Low', color: 'text-blue-300 border-blue-500/40 bg-blue-500/10' },
                    { level: 'medium', label: 'Medium', color: 'text-amber-300 border-amber-500/40 bg-amber-500/10' },
                    { level: 'critical', label: 'Critical', color: 'text-rose-300 border-rose-500/40 bg-rose-500/10' },
                  ].map((sev) => (
                    <button
                      key={sev.level}
                      type="button"
                      onClick={() => setIncidentSeverity(sev.level as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                        incidentSeverity === sev.level
                          ? `${sev.color} ring-2 ring-blue-400`
                          : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (incidentText.trim() && onAddIncident) {
                      onAddIncident(incidentText.trim(), incidentSeverity);
                      setIncidentText('');
                      setShowIncidentModal(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg transition-all min-h-[44px]"
                >
                  Submit Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
