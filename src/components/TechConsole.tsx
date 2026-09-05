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
  commsEmergencyAlerts = [],
  onAcknowledgeEmergency,
  incidents = [],
  onAddIncident,
  onResolveIncident,
  isClassAdmin = false,
}) => {
  // Worship Presenter Connection State
  // "Plus the app is connected to the worship presenter we use, so unless it can be connected there’s no need for the emergency buttons, audio playlist, presentation of the slides."
  const [isWorshipPresenterConnected, setIsWorshipPresenterConnected] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kch_worship_presenter_connected') === 'true';
    } catch {
      return false;
    }
  });

  const toggleWorshipPresenterConnection = () => {
    const nextState = !isWorshipPresenterConnected;
    setIsWorshipPresenterConnected(nextState);
    try {
      localStorage.setItem('kch_worship_presenter_connected', String(nextState));
    } catch {}
  };

  // Add Checklist Modal State (for Class Admin)
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<'hardware' | 'audio' | 'media' | 'presentation' | 'general'>('hardware');

  // Slide notes expanded
  const [showSlideNotes, setShowSlideNotes] = useState(false);

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

  // Emergency buttons (only visible when Worship Presenter is connected)
  const emergencyButtons: {
    action: EmergencyActionType;
    label: string;
    color: string;
    border: string;
    icon: any;
  }[] = [
    { action: 'play_instrumental', label: 'Play Soft Instrumental', color: 'bg-blue-600 hover:bg-blue-500 text-white', border: 'border-blue-400/40', icon: Music },
    { action: 'mute_music', label: 'Mute Audio Output', color: 'bg-red-600 hover:bg-red-500 text-white', border: 'border-red-400/40', icon: VolumeX },
    { action: 'mute_mic', label: 'Mute Speaker Mic', color: 'bg-amber-600 hover:bg-amber-500 text-white', border: 'border-amber-400/40', icon: MicOff },
    { action: 'blank_screen', label: 'Blackout / Blank Screen', color: 'bg-[#282840] hover:bg-[#343452] text-slate-200', border: 'border-slate-500/40', icon: Tv },
  ];

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
      {/* Top Banner with Worship Presenter Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">TECH & SYSTEMS CONSOLE</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                INCOMING CUES RECEIVER
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tech crew receives directives from Comms & Presenter. Audio/slides/emergency active when Worship Presenter is connected.
            </p>
          </div>
        </div>

        {/* Worship Presenter Connection Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleWorshipPresenterConnection}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isWorshipPresenterConnected
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
            title="Toggle Worship Presenter connection"
          >
            {isWorshipPresenterConnected ? (
              <>
                <Link className="w-4 h-4 text-emerald-400" />
                <span>Worship Presenter: Connected</span>
              </>
            ) : (
              <>
                <Unlink className="w-4 h-4 text-gray-400" />
                <span>Worship Presenter: Disconnected</span>
              </>
            )}
          </button>

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
                  Live Incidents ({incidents.filter((i) => i.status === 'open').length})
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
              {incidents.filter((i) => i.status === 'open').length === 0 ? (
                <div className="p-3 rounded-xl bg-black/30 text-center text-[11px] text-gray-500">
                  No active equipment incidents reported.
                </div>
              ) : (
                incidents
                  .filter((i) => i.status === 'open')
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

        {/* Center & Right Columns: Conditional on Worship Presenter Connection */}
        {isWorshipPresenterConnected ? (
          <>
            {/* Center Column: Worship Queue & Lesson Slides (4 cols) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Worship Queue Card */}
              <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-0.5">
                      AUDIO PLAYLIST (REMOTE)
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-blue-400" />
                      <span>Worship Queue</span>
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {worshipQueue.map((song) => (
                    <div
                      key={song.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        song.isPlaying
                          ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          id={`btn-play-song-${song.id}`}
                          onClick={() => setWorshipSong(song.id, !song.isPlaying)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            song.isPlaying
                              ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                              : 'bg-black/40 text-gray-300 hover:bg-black/60'
                          }`}
                        >
                          {song.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{song.title}</span>
                            {song.isPlaying && (
                              <span className="flex items-end gap-0.5 h-3">
                                <span className="w-1 bg-blue-400 rounded-full animate-bounce h-2"></span>
                                <span className="w-1 bg-blue-400 rounded-full animate-bounce delay-100 h-3"></span>
                                <span className="w-1 bg-blue-400 rounded-full animate-bounce delay-200 h-1.5"></span>
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-gray-400">{song.artist}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-semibold text-gray-300">{song.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson Slides Presentation Card */}
              <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-0.5">
                      SLIDE PRESENTER (REMOTE)
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-blue-400" />
                      <span>Lesson Slides</span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                    {currentSlideIndex} / {totalSlides}
                  </span>
                </div>

                {/* Slide Canvas */}
                <div className="relative aspect-video rounded-xl bg-[#0e0e1a] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-blue-300 border border-white/10">
                    SLIDE {currentSlideIndex}
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-wide uppercase">
                    Slide {currentSlideIndex} Presentation View
                  </h4>
                  <p className="text-xs text-gray-300 max-w-xs mt-1">
                    {lessonNotes.memoryVerse || 'Scripture / Teaching Content'}
                  </p>
                </div>

                {/* Slide Navigation Controls */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    id="btn-prev-slide"
                    onClick={() => setSlideIndex(currentSlideIndex - 1)}
                    disabled={currentSlideIndex <= 1}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-gray-200 flex items-center justify-center gap-1 border border-white/10 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    id="btn-slide-notes"
                    onClick={() => setShowSlideNotes(!showSlideNotes)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      showSlideNotes
                        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </button>

                  <button
                    id="btn-next-slide"
                    onClick={() => setSlideIndex(currentSlideIndex + 1)}
                    disabled={currentSlideIndex >= totalSlides}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {showSlideNotes && (
                  <div className="p-3 bg-black/40 rounded-xl border border-blue-500/30 text-xs space-y-1 animate-fadeIn">
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Slide Notes:</span>
                    <p className="text-gray-300">
                      {lessonNotes.notes?.[(currentSlideIndex - 1) % (lessonNotes.notes?.length || 1)] || 'No specific notes for this slide.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Emergency Controls & Incoming Feed (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Emergency Buttons Card */}
              <div className="bg-[#161626] rounded-2xl border border-rose-500/30 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">Emergency Triggers</h3>
                  </div>
                  {isEmergencyActive && (
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-[10px] font-black text-white animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {emergencyButtons.map((btn) => {
                    const IconComponent = btn.icon;
                    const isThisActive = isEmergencyActive && activeEmergencyType === btn.action;

                    return (
                      <button
                        key={btn.action}
                        id={`btn-emergency-${btn.action}`}
                        onClick={() => triggerEmergency(btn.action)}
                        className={`w-full p-2.5 rounded-xl border ${btn.border} ${btn.color} text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                          isThisActive ? 'ring-2 ring-white animate-pulse' : ''
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{btn.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Incoming Feed for Tech (Tech only receives info, never sends) */}
              <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Incoming Directives</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Comms & Presenter</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCues.length === 0 ? (
                    <div className="p-3 rounded-xl bg-black/30 text-center text-xs text-gray-500">
                      No active cues from Comms or Presenter.
                    </div>
                  ) : (
                    activeCues.map((cue) => (
                      <div
                        key={cue.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          cue.priority === 'urgent'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                            : 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{cue.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{cue.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-gray-300">{cue.message}</p>
                        <div className="text-[10px] text-gray-400">From: {cue.senderName} ({cue.senderRole})</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SFX Triggers */}
              <div className="bg-[#161626] rounded-2xl border border-white/5 p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Booth SFX Audio</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'Cheer', freq: 587, type: 'sine' as OscillatorType },
                    { name: 'Horn', freq: 440, type: 'sawtooth' as OscillatorType },
                    { name: 'Chime', freq: 880, type: 'triangle' as OscillatorType },
                  ].map((sfx) => (
                    <button
                      key={sfx.name}
                      onClick={() => playSoundEffect(sfx.name, sfx.freq, sfx.type)}
                      className={`p-2 rounded-lg text-xs font-bold transition-all ${
                        sfxPlaying === sfx.name
                          ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      🔊 {sfx.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* When Worship Presenter is Disconnected (8 cols) */
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#161626] rounded-2xl border border-white/5 p-6 sm:p-8 shadow-xl space-y-5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Tv className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <h3 className="text-base font-bold text-white">External Worship Presenter in Use</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 max-w-xl">
                    As configured, your room uses external worship presenter software (ProPresenter, EasyWorship, or physical video switcher).
                    Slide presentation, worship audio playlist, and emergency buttons are handled directly by that hardware software and are hidden here.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-300 space-y-0.5">
                  <span className="font-bold text-white block">Need remote presentation & audio controls here?</span>
                  <span>Connect this web app to your worship presenter bridge to enable remote slides and emergency blackout.</span>
                </div>
                <button
                  onClick={toggleWorshipPresenterConnection}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all shrink-0"
                >
                  <Link className="w-4 h-4" />
                  <span>Connect Worship Presenter</span>
                </button>
              </div>
            </div>

            {/* Incoming Directives & Cues Receiver (Tech only receives, never sends) */}
            <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                    INCOMING COMMUNICATION FEED
                  </span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-purple-400" />
                    <span>Directives from Comms & Presenter (Read-Only)</span>
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  {activeCues.length} Active Directives
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {activeCues.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-400 space-y-1.5">
                    <Clock className="w-6 h-6 mx-auto text-gray-500 opacity-60" />
                    <p>No active directives from Comms or Presenter.</p>
                    <p className="text-[11px] text-gray-500">
                      When Comms or the Presenter posts stage cues or timeline adjustments, they will appear here automatically.
                    </p>
                  </div>
                ) : (
                  activeCues.map((cue) => (
                    <div
                      key={cue.id}
                      className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                        cue.priority === 'urgent'
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-sm'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{cue.title}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                            {cue.senderRole.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{cue.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-200">{cue.message}</p>
                      <div className="text-[10px] text-gray-400">
                        Dispatched by: <span className="text-gray-300">{cue.senderName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Checklist Item Modal (Class Admin) */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>Add Tech Checklist Item (Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddChecklistModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Category</label>
                <select
                  value={newChecklistCategory}
                  onChange={(e) => setNewChecklistCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
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
          <div className="bg-[#161626] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Log Tech Incident</h3>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-gray-400 hover:text-white"
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
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
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
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all"
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg transition-all"
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
