import React, { useState } from 'react';
import {
  Tv,
  CheckCircle2,
  Music,
  Play,
  Pause,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Volume2,
  VolumeX,
  MicOff,
  Video,
  Layers,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  FolderOpen,
  Film,
  Disc3,
  Sliders,
  Flame,
  Check,
  Radio,
  X,
  Send
} from 'lucide-react';
import {
  PreServiceCheckItem,
  WorshipSong,
  EmergencyActionType,
  LessonNotesData,
  IncidentLog
} from '../types/hub';

interface TechConsoleProps {
  checklist: PreServiceCheckItem[];
  toggleChecklistItem: (id: string) => void;
  markAllChecksDone: () => void;
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
  onOpenHolySpiritModal: () => void;
  onSendStageCue: (type: any, msg?: string) => void;
  incidents?: IncidentLog[];
  onAddIncident?: (description: string, severity: 'low' | 'medium' | 'critical') => void;
  onResolveIncident?: (id: string) => void;
}

export const TechConsole: React.FC<TechConsoleProps> = ({
  checklist,
  toggleChecklistItem,
  markAllChecksDone,
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
  onOpenHolySpiritModal,
  onSendStageCue,
  incidents = [],
  onAddIncident,
  onResolveIncident,
}) => {
  const [showSlideNotes, setShowSlideNotes] = useState(false);
  const [selectedMediaTab, setSelectedMediaTab] = useState<'slides' | 'videos' | 'songs' | 'sfx'>('slides');
  const [sfxPlaying, setSfxPlaying] = useState<string | null>(null);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [showAddSongModal, setShowAddSongModal] = useState(false);

  // New Incident Report State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'critical'>('medium');

  // Web Audio SFX player for DJ Booth Sound Effects
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
        if (name === 'Kids Cheer') {
          osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.4);
        }
        gain.connect(ctx.destination);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio might be blocked
    }
    setTimeout(() => setSfxPlaying(null), 600);
  };

  const emergencyButtons: {
    action: EmergencyActionType;
    label: string;
    color: string;
    border: string;
    icon: any;
  }[] = [
    { action: 'play_instrumental', label: 'Play Instrumental', color: 'bg-blue-600 hover:bg-blue-500 text-white', border: 'border-blue-400/40', icon: Music },
    { action: 'mute_music', label: 'Mute Music', color: 'bg-red-600 hover:bg-red-500 text-white', border: 'border-red-400/40', icon: VolumeX },
    { action: 'mute_mic', label: 'Mute Mic', color: 'bg-amber-600 hover:bg-amber-500 text-white', border: 'border-amber-400/40', icon: MicOff },
    { action: 'blank_screen', label: 'Blank Screen', color: 'bg-[#282840] hover:bg-[#343452] text-slate-200', border: 'border-slate-500/40', icon: Tv },
    { action: 'show_crc_logo', label: 'Show CRC Logo', color: 'bg-purple-700 hover:bg-purple-600 text-white', border: 'border-purple-400/40', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">2. TECH & SYSTEMS MODULE</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                DJ BOOTH ASSISTANT
              </span>
            </div>
            <p className="text-xs text-gray-400">Audio, worship queue, slide presenter, prompt triggers & emergency controls.</p>
          </div>
        </div>

        {isEmergencyActive ? (
          <button
            id="btn-clear-emergency"
            onClick={clearEmergency}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all animate-pulse"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Reset Emergency Mode</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        )}
      </div>

      {/* Main 3-Column Grid from Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Pre-Service Checklist (4 cols) */}
        <div className="lg:col-span-4 bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">AUDIO & VISUAL READY</span>
              <h3 className="text-sm font-bold text-white">Pre-Service Checklist</h3>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
              {checklist.filter((c) => c.isChecked).length} / {checklist.length} Done
            </span>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {checklist.map((item) => (
              <button
                key={item.id}
                id={`chk-item-${item.id}`}
                onClick={() => toggleChecklistItem(item.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  item.isChecked
                    ? 'bg-black/30 border-green-500/30 text-gray-300'
                    : 'bg-white/5 border-amber-500/30 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      item.isChecked
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-500 bg-black/30'
                    }`}
                  >
                    {item.isChecked && <Check className="w-3 h-3 text-green-400" />}
                  </div>
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.isChecked
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-amber-400 bg-amber-500/10 animate-pulse'
                  }`}
                >
                  {item.statusText}
                </span>
              </button>
            ))}
          </div>

          <button
            id="btn-all-good-checklist"
            onClick={markAllChecksDone}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>All Good! ✓</span>
          </button>

          {/* Real-time Incident Feed (`incident_logs` Supabase Channel) */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Incidents ({incidents.filter(i => i.status === 'open').length})
                </h4>
              </div>
              <button
                onClick={() => setShowIncidentModal(true)}
                className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Report</span>
              </button>
            </div>

            {/* Incidents items */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {incidents.length === 0 ? (
                <div className="p-3 rounded-xl bg-black/20 text-center text-gray-500 text-[11px]">
                  No active incidents recorded.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                      inc.status === 'resolved'
                        ? 'bg-black/20 border-white/5 opacity-60'
                        : inc.severity === 'critical'
                        ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : inc.severity === 'medium'
                        ? 'bg-amber-950/40 border-amber-500/50'
                        : 'bg-blue-950/30 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            inc.severity === 'critical'
                              ? 'bg-red-500 text-white animate-pulse'
                              : inc.severity === 'medium'
                              ? 'bg-amber-500 text-black'
                              : 'bg-blue-500/30 text-blue-300'
                          }`}
                        >
                          {inc.severity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{inc.time}</span>
                      </div>

                      {inc.status === 'open' && onResolveIncident ? (
                        <button
                          onClick={() => onResolveIncident(inc.id)}
                          className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold transition-colors"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-mono">Resolved ✓</span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-200 font-medium leading-tight">
                      {inc.description}
                    </p>

                    <div className="text-[10px] text-gray-400 flex items-center justify-between pt-0.5 border-t border-white/5">
                      <span>By: {inc.reportedBy}</span>
                      <span className="font-mono text-[9px] text-purple-300">Supabase Channel</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Worship Queue & Lesson Slides (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Worship Queue Card */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">AUDIO PLAYLIST</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>Worship Queue</span>
                </h3>
              </div>
              <div className="flex gap-1">
                <button
                  id="btn-add-song"
                  onClick={() => setShowAddSongModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-purple-300 flex items-center gap-1 border border-white/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Song items */}
            <div className="space-y-2">
              {worshipQueue.map((song) => (
                <div
                  key={song.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    song.isPlaying
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      id={`btn-play-song-${song.id}`}
                      onClick={() => setWorshipSong(song.id, !song.isPlaying)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        song.isPlaying
                          ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
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
                            <span className="w-1 bg-purple-400 rounded-full animate-bounce h-2"></span>
                            <span className="w-1 bg-purple-400 rounded-full animate-bounce delay-100 h-3"></span>
                            <span className="w-1 bg-purple-400 rounded-full animate-bounce delay-200 h-1.5"></span>
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

          {/* Lesson Slides Card */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">PRESENTATION</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Lesson Slides</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                {currentSlideIndex} / {totalSlides}
              </span>
            </div>

            {/* Slide Visual Display Canvas */}
            <div className="relative aspect-video rounded-xl bg-[#0e0e1a] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-purple-300 border border-white/10">
                SLIDE {currentSlideIndex}
              </div>

              <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-400/40 flex items-center justify-center mb-2 text-purple-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                🗡️
              </div>
              <h4 className="text-sm font-extrabold text-white tracking-wide uppercase">
                {currentSlideIndex <= 14 ? 'Memory Verse 1 Timothy 5:22' : 'David & Goliath: The Victory'}
              </h4>
              <p className="text-xs text-gray-300 max-w-xs mt-1">
                {currentSlideIndex <= 14
                  ? '"Keep yourself pure and holy with your standards high."'
                  : '"The battle is the Lord\'s, and He will deliver Goliath into our hands."'}
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
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.4)]'
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
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide notes expanded */}
            {showSlideNotes && (
              <div className="p-3 bg-black/40 rounded-xl border border-purple-500/30 text-xs space-y-1 animate-fadeIn">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Slide Notes for Presenter:</span>
                <p className="text-gray-300">
                  {lessonNotes.notes[(currentSlideIndex - 1) % lessonNotes.notes.length]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cue Cards & Emergency Mode (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Cue Cards / Prompts Card */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">QUICK DISPATCH</span>
                <h3 className="text-sm font-bold text-white">Cue Cards / Prompts</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Stage Sync</span>
            </div>

            <div className="space-y-2">
              <button
                id="btn-cue-play-video"
                onClick={() => onSendStageCue('custom', '🎬 VIDEO: David & Goliath started')}
                className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-gray-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="block font-bold">Play Video</span>
                    <span className="text-[10px] text-gray-400">Video: David & Goliath</span>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-purple-300" />
              </button>

              <button
                id="btn-cue-next-slide"
                onClick={() => {
                  setSlideIndex(currentSlideIndex + 1);
                  onSendStageCue('custom', `📑 Advance Slide ${currentSlideIndex + 1}`);
                }}
                className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-gray-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="block font-bold">Next Slide</span>
                    <span className="text-[10px] text-gray-400">Advance to Slide {currentSlideIndex + 1}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
              </button>

              <button
                id="btn-cue-play-song"
                onClick={() => onSendStageCue('custom', '🎵 Soft Instrumental Pad active')}
                className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-gray-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block font-bold">Play Song</span>
                    <span className="text-[10px] text-gray-400">Instrumental Moment</span>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-emerald-300" />
              </button>

              <button
                id="btn-cue-extend-worship"
                onClick={onOpenHolySpiritModal}
                className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left flex items-center justify-between text-xs font-semibold text-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div>
                    <span className="block font-bold">Extend Worship</span>
                    <span className="text-[10px] text-amber-300/80">Worship extended by 3 mins</span>
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Emergency Mode Card */}
          <div className="bg-[#161626] rounded-2xl border border-red-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Emergency Mode</h3>
              </div>
              {isEmergencyActive && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-black text-white animate-pulse">
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

          {/* DJ Booth Sound Effects Trigger */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-4 space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Booth SFX Triggers</span>
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
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  🔊 {sfx.name}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Report Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161626] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Report Tech Incident</h3>
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
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
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
                    { level: 'critical', label: 'Critical', color: 'text-red-300 border-red-500/40 bg-red-500/10' },
                  ].map((sev) => (
                    <button
                      key={sev.level}
                      type="button"
                      onClick={() => setIncidentSeverity(sev.level as any)}
                      className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        incidentSeverity === sev.level
                          ? `${sev.color} ring-1 ring-white/40 shadow-sm`
                          : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (incidentText.trim() && onAddIncident) {
                    onAddIncident(incidentText, incidentSeverity);
                    setIncidentText('');
                    setShowIncidentModal(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Incident</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
