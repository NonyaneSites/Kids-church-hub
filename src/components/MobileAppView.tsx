import React, { useState } from 'react';
import {
  Clock,
  Radio,
  Tv,
  Users,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ChevronDown,
  Monitor,
  Send,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  UserCheck,
  UserPlus,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Maximize2,
  X,
  Bell,
  Crown,
  ShieldCheck,
  Database,
  Lock
} from 'lucide-react';
import {
  AuthUser,
  Role,
  ClassId,
  ClassInfo,
  ServiceSegment,
  ChecklistItem,
  WorshipSong,
  IncidentItem,
  TeamMember,
  PrayerRequest
} from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';
import { getSouthAfricaWhatsAppLink } from '../utils/southAfricaPhone';

interface MobileAppViewProps {
  onExitMobileMode: () => void;
  authUser: AuthUser;
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  selectedClassId: ClassId;
  onSelectClass: (classId: ClassId) => void;
  currentSegment: ServiceSegment;
  nextSegment: ServiceSegment | null;
  segments: ServiceSegment[];
  localTimer: {
    remainingSeconds: number;
    formattedTime: string;
    isOvertime: boolean;
    overtimeSeconds: number;
    progressPercentage: number;
    targetEndTimeFormatted: string;
  };
  startSegment: (id: string) => void;
  completeSegment: (id: string) => void;
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  markAllChecksDone: () => void;
  worshipQueue: WorshipSong[];
  setWorshipSong: (id: string) => void;
  activeCues: string[];
  sendStageCue: (cue: string) => void;
  dismissCue: (cue: string) => void;
  teamMembers: TeamMember[];
  registeredAccounts: AuthUser[];
  onAddNewAccount: (user: AuthUser) => void;
  onDeleteAccount: (userId: string) => void;
  onClearDefaultAccounts: () => void;
  onResetDefaultAccounts: () => void;
  onPromoteToClassAdmin: (userId: string) => void;
  onRevokeClassAdmin: (userId: string) => void;
  onSwitchUser: (user: AuthUser) => void;
  onOpenAuthModal: (tab?: 'quick_switch' | 'login' | 'register' | 'manage' | 'permissions') => void;
  onOpenHolySpiritModal: () => void;
  isEmergencyActive: boolean;
  onToggleEmergency: () => void;
  lessonNotes: string;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  onExitMobileMode,
  authUser,
  selectedClassId,
  onSelectClass,
  currentSegment,
  nextSegment,
  segments,
  localTimer,
  startSegment,
  completeSegment,
  checklist,
  toggleChecklistItem,
  markAllChecksDone,
  worshipQueue,
  setWorshipSong,
  activeCues,
  sendStageCue,
  dismissCue,
  teamMembers,
  registeredAccounts,
  onDeleteAccount,
  onClearDefaultAccounts,
  onResetDefaultAccounts,
  onSwitchUser,
  onOpenAuthModal,
  onOpenHolySpiritModal,
  isEmergencyActive,
  onToggleEmergency,
  lessonNotes,
}) => {
  // Mobile Active Bottom Tab
  const [mobileTab, setMobileTab] = useState<'runsheet' | 'stage' | 'tech' | 'team'>('runsheet');
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false);
  const [presenterAlertNotice, setPresenterAlertNotice] = useState<string | null>(null);
  
  // Custom in-app confirmation states for database accounts
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [isConfirmingClearDefaults, setIsConfirmingClearDefaults] = useState(false);
  const [isConfirmingResetDefaults, setIsConfirmingResetDefaults] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const activeClass = CLASSES_CONFIG.find(c => c.id === selectedClassId) || CLASSES_CONFIG[2]; // default KB

  const showTemporaryNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleCallPresenter = () => {
    const speaker = currentSegment.speaker || 'Presenter';
    setPresenterAlertNotice(`📢 Call dispatched: "${speaker}, please come to ${activeClass.name} class in 5 minutes!"`);
    sendStageCue(`📢 Alert: ${speaker} requested in class immediately!`);
    setTimeout(() => setPresenterAlertNotice(null), 7000);
  };

  const handleExecuteDeleteUser = () => {
    if (!userToDelete) return;
    onDeleteAccount(userToDelete.id);
    showTemporaryNotice(`Account for "${userToDelete.name}" permanently deleted from database.`);
    setUserToDelete(null);
  };

  const handleExecuteClearDefaults = () => {
    onClearDefaultAccounts();
    setIsConfirmingClearDefaults(false);
    showTemporaryNotice('Default demo accounts removed from database.');
  };

  const handleExecuteResetDefaults = () => {
    onResetDefaultAccounts();
    setIsConfirmingResetDefaults(false);
    showTemporaryNotice('Reset database back to default staff roster.');
  };

  return (
    <div className="min-h-screen bg-[#090912] text-slate-100 flex flex-col font-sans pb-20 select-none">
      
      {/* TOP STATUS & APP BAR */}
      <header className="sticky top-0 z-40 bg-[#121222]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-md shrink-0">
            KC
          </div>
          
          <button
            onClick={() => setIsClassSheetOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors min-w-0"
          >
            <span className={`w-2 h-2 rounded-full ${activeClass.themeBadge.split(' ')[0] || 'bg-red-500'} shrink-0 animate-pulse`}></span>
            <div className="truncate">
              <div className="text-[11px] font-bold text-white leading-tight truncate">
                {selectedClassId === 'all' ? 'All Classes' : activeClass.name}
              </div>
              <div className="text-[9px] text-purple-300 font-semibold leading-tight truncate">
                {selectedClassId === 'all' ? 'Director Console' : activeClass.ageGroup}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-0.5" />
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Holy Spirit Override Button */}
          <button
            onClick={onOpenHolySpiritModal}
            className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-colors"
            title="Holy Spirit Mode"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* Emergency Alert Button */}
          <button
            onClick={onToggleEmergency}
            className={`p-2 rounded-xl border transition-colors ${
              isEmergencyActive
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-red-400'
            }`}
            title="Emergency Blank Screen"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Return to Desktop View Button */}
          <button
            id="btn-exit-mobile"
            onClick={onExitMobileMode}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all active:scale-95"
            title="Switch back to full desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">Desktop</span>
          </button>
        </div>
      </header>

      {/* TEMPORARY NOTICE BANNER */}
      {noticeMessage && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PRESENTER CALL DISPATCH BANNER */}
      {presenterAlertNotice && (
        <div className="mx-4 mt-2 p-3 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-between gap-2 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>{presenterAlertNotice}</span>
          </div>
          <button onClick={() => setPresenterAlertNotice(null)} className="text-purple-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE CUES FLOATING NOTIFICATION */}
      {activeCues.length > 0 && (
        <div className="mx-4 mt-2 space-y-1.5">
          {activeCues.map((cue, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span>STAGE CUE: {cue}</span>
              </div>
              <button
                onClick={() => dismissCue(cue)}
                className="text-amber-400 hover:text-white text-[11px] px-2 py-0.5 rounded bg-amber-500/30"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PROMINENT LIVE SERVICE TIMER CARD */}
      <section className="mx-4 mt-3 p-4 rounded-3xl bg-gradient-to-b from-[#18182c] to-[#121222] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
              {currentSegment.status === 'in_progress' ? 'CURRENTLY LIVE' : 'UPCOMING'}
            </span>
          </div>

          <div className="text-[11px] text-gray-400 font-mono">
            Ends: <strong className="text-white">{localTimer.targetEndTimeFormatted}</strong>
          </div>
        </div>

        {/* Current Segment Name & Big Countdown */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white leading-tight">
              {currentSegment.title}
            </h2>
            <div className="text-xs text-purple-300 font-semibold mt-0.5">
              Leader: {currentSegment.speaker || 'Team Leader'} • {currentSegment.durationMinutes}m
            </div>
            {currentSegment.scripture && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-serif">
                📖 {currentSegment.scripture}
              </span>
            )}
          </div>

          {/* Massive Digital Timer */}
          <div className="text-right">
            <div
              className={`font-mono font-black text-3xl sm:text-4xl tracking-tight leading-none ${
                localTimer.isOvertime ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {localTimer.formattedTime}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
              {localTimer.isOvertime ? '⚠️ OVERTIME' : 'TIME REMAINING'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-1000 ${
              localTimer.isOvertime ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, localTimer.progressPercentage))}%` }}
          ></div>
        </div>

        {/* Fast Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => completeSegment(currentSegment.id)}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Done & Next</span>
          </button>

          <button
            onClick={handleCallPresenter}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            title="Send notification to presenter to come to class in 5 minutes"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Call Presenter (5m)</span>
          </button>
        </div>
      </section>

      {/* TAB CONTENT AREA */}
      <main className="p-4 space-y-4">
        
        {/* TAB 1: RUN-SHEET (COMMS) */}
        {mobileTab === 'runsheet' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">
                Order of Service ({segments.length} Items)
              </span>
              <span className="text-purple-400 font-semibold text-[11px]">
                Tap item to toggle status
              </span>
            </div>

            {/* Quick Stage Cues Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">Fast Cues:</span>
              {['5m to Stage', 'Wrap Up (2m)', 'Quiet Please', 'Praise High', 'Ministry Time'].map((cue) => (
                <button
                  key={cue}
                  onClick={() => {
                    sendStageCue(cue);
                    showTemporaryNotice(`Sent Stage Cue: "${cue}"`);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600 border border-white/10 text-gray-300 hover:text-white text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3 text-purple-400" />
                  <span>{cue}</span>
                </button>
              ))}
            </div>

            {/* Service Segments List */}
            <div className="space-y-2.5">
              {segments.map((seg, idx) => {
                const isCurrent = seg.id === currentSegment.id;
                const isCompleted = seg.status === 'completed';

                return (
                  <div
                    key={seg.id}
                    onClick={() => {
                      if (seg.status === 'completed') {
                        startSegment(seg.id);
                      } else {
                        completeSegment(seg.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
                        : isCompleted
                        ? 'bg-black/20 border-white/5 opacity-60'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isCurrent ? (
                          <span className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                          </span>
                        ) : (
                          <Circle className="w-5 h-5 text-gray-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-purple-400 font-bold">
                            #{idx + 1} • {seg.plannedStartTime}
                          </span>
                          <span className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                            {seg.title}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{seg.durationMinutes} min</span>
                          <span>•</span>
                          <span className="text-purple-300 truncate">{seg.speaker || 'Leader'}</span>
                          {seg.scripture && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300 font-serif truncate">{seg.scripture}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : isCurrent
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        {isCompleted ? 'Done' : isCurrent ? 'Live' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STAGE HUD (PRESENTER PHONE VIEW) */}
        {mobileTab === 'stage' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Radio className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-bold">Stage Teleprompter Mode</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">
                High-Contrast HUD
              </span>
            </div>

            {/* Huge Scripture Display */}
            {currentSegment.scripture && (
              <div className="p-4 rounded-2xl bg-[#16162a] border border-purple-500/40 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 block">
                  SCRIPTURE READING
                </span>
                <h3 className="text-base font-bold text-white font-serif">
                  {currentSegment.scripture}
                </h3>
                <p className="text-xs text-gray-300 italic font-serif leading-relaxed">
                  "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God’s will is."
                </p>
              </div>
            )}

            {/* Lesson Notes & Talking Points */}
            <div className="p-4 rounded-2xl bg-[#16162a] border border-white/5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                LESSON TALKING POINTS
              </span>
              <div className="space-y-2 text-xs text-gray-200 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <span><strong>1. God Made You Unique:</strong> You are fearfully and wonderfully made by God with purpose.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <span><strong>2. Stand Strong at School:</strong> Shine the light of Jesus everywhere you go.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <span><strong>3. Memory Verse Practice:</strong> Have kids repeat with loud actions and clapping!</span>
                </div>
              </div>
            </div>

            {/* Upcoming Next Segment Preview */}
            {nextSegment && (
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    UP NEXT ON STAGE
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {nextSegment.title} ({nextSegment.durationMinutes} min)
                  </div>
                </div>
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {nextSegment.plannedStartTime}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOUND & MEDIA (TECH) */}
        {mobileTab === 'tech' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Checklist Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                Pre-Service Checklist ({checklist.filter(c => c.isDone).length}/{checklist.length})
              </span>
              <button
                onClick={markAllChecksDone}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
              >
                Mark All Done
              </button>
            </div>

            {/* Checklist Items with 48px touch targets */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`min-h-[48px] p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    item.isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-300'
                      : 'bg-white/5 border-white/5 hover:border-white/15 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 border-white/20">
                      {item.isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${item.isDone ? 'line-through opacity-70' : ''}`}>
                        {item.task}
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Worship Queue */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Praise & Worship Playlist
              </span>
              <div className="space-y-2">
                {worshipQueue.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => setWorshipSong(song.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                      song.isPlaying
                        ? 'bg-purple-950/40 border-purple-500/60'
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Volume2 className={`w-4 h-4 ${song.isPlaying ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
                      <div>
                        <div className="text-xs font-bold text-white">{song.title}</div>
                        <div className="text-[10px] text-gray-400">{song.artist} • {song.key} • {song.duration}</div>
                      </div>
                    </div>
                    {song.isPlaying && (
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Playing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STAFF & DATABASE (ACCOUNTS PERSISTENCE) */}
        {mobileTab === 'team' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Real Database Persistence Status Banner */}
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Staff Database Storage Active</span>
                  <p className="text-[10px] text-emerald-400/80">IndexedDB & Synced Local Storage (Permanent)</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                Persistent
              </span>
            </div>

            {/* Quick Actions: Clear Demo Seed / Add Account / Quick Switch */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsConfirmingClearDefaults(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Demo Accounts</span>
              </button>

              <button
                onClick={() => setIsConfirmingResetDefaults(true)}
                title="Reset defaults"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenAuthModal('register')}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register Staff</span>
              </button>
            </div>

            {/* Custom Confirmation Dialog: Delete Specific Account */}
            {userToDelete && (
              <div className="p-4 bg-red-950/80 border border-red-500 rounded-2xl space-y-2.5 shadow-2xl animate-in fade-in">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Confirm Account Deletion</span>
                </div>
                <p className="text-xs text-gray-200">
                  Permanently remove <strong>"{userToDelete.name}"</strong> ({userToDelete.email}) from the database?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteDeleteUser}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-red-900/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Confirmation Dialog: Clear All Defaults */}
            {isConfirmingClearDefaults && (
              <div className="p-4 bg-red-950/80 border border-red-500 rounded-2xl space-y-2.5 shadow-2xl animate-in fade-in">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Remove All Demo Seed Accounts?</span>
                </div>
                <p className="text-xs text-gray-200">
                  This will permanently wipe all preloaded demo volunteer profiles so only your real church volunteers remain.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsConfirmingClearDefaults(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteClearDefaults}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-red-900/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove All</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Confirmation Dialog: Reset Defaults */}
            {isConfirmingResetDefaults && (
              <div className="p-4 bg-purple-950/80 border border-purple-500 rounded-2xl space-y-2.5 shadow-2xl animate-in fade-in">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Reset Database to Defaults?</span>
                </div>
                <p className="text-xs text-gray-200">
                  Restore standard default staff accounts for all 5 classes?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsConfirmingResetDefaults(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteResetDefaults}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-purple-900/50"
                  >
                    <span>Yes, Reset</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Registered Accounts in Database with Working Delete */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Saved Database Staff Roster ({registeredAccounts.length})
              </span>

              {registeredAccounts.map((account) => {
                const isCurrent = authUser.id === account.id;
                const canDelete = !isCurrent;
                const isDirector = account.role === 'director' || (account.role === 'admin' && account.assignedClassId === 'all');
                const isClassAdmin = Boolean(account.isClassAdmin) || (account.role === 'admin' && account.assignedClassId !== 'all');

                return (
                  <div
                    key={account.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-colors ${
                      isCurrent
                        ? 'bg-purple-950/30 border-purple-500/50'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${account.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow`}>
                        {account.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">{account.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                              You
                            </span>
                          )}
                          {isDirector ? (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Director
                            </span>
                          ) : isClassAdmin ? (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              Admin
                            </span>
                          ) : null}
                        </div>

                        <div className="text-[10px] text-gray-400 truncate">
                          {account.roleTitle || account.role} • {account.assignedClassId.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Actions: WhatsApp Chat, Phone Call, and Working Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {account.phone && (
                        <>
                          <a
                            href={getSouthAfricaWhatsAppLink(account.phone, `Hi ${account.name}, from CRC Kids Church ${activeClass.name}!`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`tel:${account.phone}`}
                            className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            title="Call Phone"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}

                      {/* Working Delete Button */}
                      {canDelete ? (
                        <button
                          onClick={() => setUserToDelete(account)}
                          className="p-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                          title={`Permanently delete ${account.name} from database`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="p-1.5 text-gray-600" title="Active login session">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* CLASS SELECTOR BOTTOM SHEET DRAWER */}
      {isClassSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#16162a] border-t border-white/10 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-sm font-black text-white">Select Kids Church Class</h3>
                <p className="text-[11px] text-gray-400">CRC Johannesburg Multi-Class Service Hub</p>
              </div>
              <button
                onClick={() => setIsClassSheetOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {CLASSES_CONFIG.map((cls) => {
                const isSelected = selectedClassId === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => {
                      onSelectClass(cls.id);
                      setIsClassSheetOpen(false);
                      showTemporaryNotice(`Switched to ${cls.name} (${cls.ageGroup})`);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30'
                        : 'bg-white/5 text-gray-300 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>{cls.name}</span>
                        <span className="text-[10px] font-mono opacity-80">({cls.shortCode})</span>
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {cls.ageGroup} • {cls.room}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#121222]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setMobileTab('runsheet')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-colors ${
            mobileTab === 'runsheet' ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Run-Sheet</span>
        </button>

        <button
          onClick={() => setMobileTab('stage')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-colors ${
            mobileTab === 'stage' ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px]">Stage HUD</span>
        </button>

        <button
          onClick={() => setMobileTab('tech')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-colors ${
            mobileTab === 'tech' ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Sound & Media</span>
        </button>

        <button
          onClick={() => setMobileTab('team')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-colors ${
            mobileTab === 'team' ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Staff & DB</span>
        </button>
      </nav>
    </div>
  );
};
