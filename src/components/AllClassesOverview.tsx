import React, { useState } from 'react';
import { 
  Radio, 
  Tv, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  ChevronRight, 
  Volume2, 
  Music, 
  Layers, 
  UserPlus,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';
import { ClassId, ClassInfo, ClassHubData, QuickMessageType, Role, AuthUser } from '../types/hub';
import { CLASSES_CONFIG, getAllDefaultClassHubs } from '../data/classHubsData';

interface AllClassesOverviewProps {
  allClassHubs?: Record<ClassId, ClassHubData>;
  hubsData?: Record<ClassId, ClassHubData>;
  classes?: ClassInfo[];
  selectedClassId?: ClassId;
  onSelectClass?: (classId: ClassId) => void;
  onOpenClassTab?: (classId: ClassId, tab: 'comms' | 'tech' | 'presenter') => void;
  onBroadcastGlobalCue?: (title: string, message: string, priority: 'normal' | 'urgent' | 'emergency') => void;
  onBroadcastAll?: (title: string, message: string, priority: 'normal' | 'urgent' | 'emergency') => void;
  onSendClassCue?: (classId: ClassId, type: QuickMessageType, message: string) => void;
  onSendCueToClass?: (classId: ClassId, type: QuickMessageType, message: string) => void;
  currentUser?: AuthUser;
  onOpenAuthModal?: () => void;
  onOpenDirectorAnnouncement?: () => void;
}

export const AllClassesOverview: React.FC<AllClassesOverviewProps> = ({
  allClassHubs,
  hubsData,
  classes = CLASSES_CONFIG,
  selectedClassId = 'all',
  onSelectClass,
  onOpenClassTab,
  onBroadcastGlobalCue,
  onBroadcastAll,
  onSendClassCue,
  onSendCueToClass,
  currentUser,
  onOpenAuthModal,
  onOpenDirectorAnnouncement,
}) => {
  const defaultHubs = getAllDefaultClassHubs();
  const safeHubs = allClassHubs || hubsData || defaultHubs;

  const [globalMessage, setGlobalMessage] = useState('');
  const [globalPriority, setGlobalPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [targetClassForCue, setTargetClassForCue] = useState<ClassId | 'all'>('all');
  const [showGlobalBroadcastForm, setShowGlobalBroadcastForm] = useState(false);
  const [cueSentNotice, setCueSentNotice] = useState<string | null>(null);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalMessage.trim()) return;

    const broadcastFn = onBroadcastGlobalCue || onBroadcastAll;
    const sendCueFn = onSendClassCue || onSendCueToClass;

    if (targetClassForCue === 'all') {
      if (broadcastFn) {
        broadcastFn('Central Broadcast', globalMessage.trim(), globalPriority);
      }
      setCueSentNotice(`Broadcast sent to all 5 classes!`);
    } else {
      if (sendCueFn) {
        sendCueFn(targetClassForCue, 'custom', globalMessage.trim());
      }
      const classInfo = CLASSES_CONFIG.find(c => c.id === targetClassForCue);
      setCueSentNotice(`Cue sent directly to ${classInfo?.name || targetClassForCue}!`);
    }

    setGlobalMessage('');
    setTimeout(() => setCueSentNotice(null), 3000);
  };

  // Helper to compute live remaining time string
  const getRemainingTimeString = (targetEndTime: string | null): string => {
    if (!targetEndTime) return '--:--';
    const diff = Math.floor((new Date(targetEndTime).getTime() - Date.now()) / 1000);
    const isOver = diff < 0;
    const abs = Math.abs(diff);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${isOver ? '+' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Mission Command Header */}
      <div className="bg-gradient-to-r from-[#16162a] via-[#1a1436] to-[#141d30] border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Central Overseer Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40">
                🇿🇦 CRC KIDS CHURCH JOHANNESBURG
              </span>
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                5 Classes Live & Synchronized
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              All Classes Master Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              Real-time monitoring across Junior Youth, TRAILBLAZERS, Kingdom Builders, Little Adventures Orange, and Little Adventures Yellow in Johannesburg.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenDirectorAnnouncement && (
              <button
                onClick={onOpenDirectorAnnouncement}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Director Announcement (Pop-up)</span>
              </button>
            )}

            <button
              onClick={() => setShowGlobalBroadcastForm(!showGlobalBroadcastForm)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Cue / Alert</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#202038] hover:bg-[#282846] text-purple-200 border border-purple-500/30 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add / Switch Account</span>
            </button>
          </div>
        </div>

        {/* Global Broadcast Drawer */}
        {showGlobalBroadcastForm && (
          <form onSubmit={handleSendBroadcast} className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Target Class Hub</label>
              <select
                value={targetClassForCue}
                onChange={(e) => setTargetClassForCue(e.target.value as ClassId | 'all')}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="all">🌐 ALL 5 Classes (Global Network Broadcast)</option>
                <option value="jy">🔵 Junior Youth (Blue Class, Gr 6-7)</option>
                <option value="tb">🌸 TRAILBLAZERS (Pink Class, Gr 4-5)</option>
                <option value="kb">🔴 Kingdom Builders (Red Class, Gr 1-3)</option>
                <option value="la-orange">🟠 Little Adventures Orange (5-6 yrs)</option>
                <option value="la-yellow">🟡 Little Adventures Yellow (3-4 yrs)</option>
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Message Content</label>
              <input
                type="text"
                value={globalMessage}
                onChange={(e) => setGlobalMessage(e.target.value)}
                placeholder="e.g. Combined pickup in 10 mins, or Altar prayer response"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <select
                value={globalPriority}
                onChange={(e) => setGlobalPriority(e.target.value as 'normal' | 'urgent' | 'emergency')}
                className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>

              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit</span>
              </button>
            </div>
          </form>
        )}

        {cueSentNotice && (
          <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{cueSentNotice}</span>
          </div>
        )}
      </div>

      {/* Grid of All 5 Individual Class Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CLASSES_CONFIG.map((classInfo) => {
          const hubData = safeHubs?.[classInfo.id] || defaultHubs[classInfo.id];
          const serviceState = hubData?.serviceState;
          const currentSegment = hubData?.segments?.find(s => s.id === serviceState?.currentSegmentId) || hubData?.segments?.[2];
          const isCurrentActive = selectedClassId === classInfo.id;
          const checkedCount = hubData?.checklist?.filter(c => c.isChecked).length || 0;
          const totalChecks = hubData?.checklist?.length || 0;
          const timeRemaining = getRemainingTimeString(serviceState?.targetEndTime || null);

          // Class-specific color borders & glows
          const borderGlow = classInfo.id === 'jy' 
            ? 'border-blue-500/40 hover:border-blue-400/80 shadow-blue-500/10'
            : classInfo.id === 'tb'
            ? 'border-pink-500/40 hover:border-pink-400/80 shadow-pink-500/10'
            : classInfo.id === 'kb'
            ? 'border-red-500/40 hover:border-red-400/80 shadow-red-500/10'
            : classInfo.id === 'la-orange'
            ? 'border-orange-500/40 hover:border-orange-400/80 shadow-orange-500/10'
            : 'border-yellow-500/40 hover:border-yellow-400/80 shadow-yellow-500/10';

          const accentBadge = classInfo.id === 'jy'
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : classInfo.id === 'tb'
            ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
            : classInfo.id === 'kb'
            ? 'bg-red-500/20 text-red-300 border-red-500/40'
            : classInfo.id === 'la-orange'
            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';

          const indicatorDot = classInfo.id === 'jy'
            ? 'bg-blue-400'
            : classInfo.id === 'tb'
            ? 'bg-pink-400'
            : classInfo.id === 'kb'
            ? 'bg-red-400'
            : classInfo.id === 'la-orange'
            ? 'bg-orange-400'
            : 'bg-yellow-400';

          return (
            <div
              key={classInfo.id}
              className={`bg-[#121222] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg ${borderGlow} ${
                isCurrentActive ? 'ring-2 ring-purple-500/60' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-white/5 bg-[#16162a]/60">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${indicatorDot} shadow-sm animate-pulse`}></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${accentBadge}`}>
                        {classInfo.colorName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded">
                        {classInfo.grade}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-tight flex items-center gap-1.5">
                      {classInfo.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {classInfo.colorName} • {classInfo.ageGroup}
                    </p>
                  </div>

                  {/* Countdown Timer Display */}
                  <div className="text-right bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
                    <div className="text-[9px] font-extrabold uppercase text-gray-400 font-mono">Timer</div>
                    <div className="text-lg font-extrabold font-mono text-white tracking-wider">
                      {timeRemaining}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body: Current Activity & Details */}
              <div className="p-4 space-y-3 flex-1">
                {/* Current Active Segment */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase mb-1">
                    <span>Active Segment ({currentSegment ? `#${currentSegment.order}` : 'Current'})</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      LIVE
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {currentSegment?.title || 'Main Service Flow'}
                  </div>
                  <div className="text-[11px] text-purple-300 mt-0.5 flex items-center justify-between">
                    <span>Lead: <strong>{currentSegment?.assignedLead || 'Leader'}</strong></span>
                    <span className="text-gray-400">{currentSegment?.plannedStartTime}</span>
                  </div>
                </div>

                {/* Tech & Audio Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#18182c] p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase font-bold">Equipment Checks</div>
                    <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{checkedCount}/{totalChecks} Ready</span>
                    </div>
                  </div>

                  <div className="bg-[#18182c] p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase font-bold">Incidents</div>
                    <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                      {hubData?.incidents && hubData.incidents.filter(i => i.status === 'open').length > 0 ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-300 font-bold">{hubData.incidents.filter(i => i.status === 'open').length} Open</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          <span className="text-gray-300">All Clear</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Theme & Lesson snippet */}
                <div className="text-[11px] text-gray-400 leading-snug line-clamp-2 italic bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  "{hubData?.lessonNotes?.keyPoint || classInfo.description}"
                </div>
              </div>

              {/* Card Footer: Navigation Actions */}
              <div className="p-3 bg-black/40 border-t border-white/5 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onSelectClass?.(classInfo.id);
                    onOpenClassTab?.(classInfo.id, 'comms');
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    classInfo.id === 'jy'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : classInfo.id === 'tb'
                      ? 'bg-pink-600 hover:bg-pink-500'
                      : classInfo.id === 'kb'
                      ? 'bg-red-600 hover:bg-red-500'
                      : classInfo.id === 'la-orange'
                      ? 'bg-orange-600 hover:bg-orange-500'
                      : 'bg-yellow-600 hover:bg-yellow-500'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Open Class Hub</span>
                </button>

                <button
                  onClick={() => {
                    onSelectClass?.(classInfo.id);
                    onOpenClassTab?.(classInfo.id, 'presenter');
                  }}
                  title="Open Presenter Stage HUD for this class"
                  className="p-2 bg-[#1d1d33] hover:bg-[#252542] text-amber-300 border border-amber-500/30 rounded-xl text-xs transition-colors"
                >
                  <Clock className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectClass?.(classInfo.id);
                    onOpenClassTab?.(classInfo.id, 'tech');
                  }}
                  title="Open Tech & Systems for this class"
                  className="p-2 bg-[#1d1d33] hover:bg-[#252542] text-blue-300 border border-blue-500/30 rounded-xl text-xs transition-colors"
                >
                  <Tv className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Roles & Duties Quick Reference Guide */}
      <div className="bg-[#141424] border border-white/10 rounded-2xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span>Multi-Class Ministry Structure & Duties</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="font-bold text-blue-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Junior Youth (JY - Blue Class)
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Target: Grade 6–7 (11–13 yrs). Emphasis on youth praise band, deep discussion breakouts, life skills & high school transition faith.
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="font-bold text-pink-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              TRAILBLAZERS (TB - Pink Class)
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Target: Grade 4–5 (9–10 yrs). Emphasis on Squad competition points, Sword drills, high energy physical games & Armor of God teaching.
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="font-bold text-red-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Kingdom Builders (KB - Red Class)
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Target: Grade 1–3 (6–8 yrs). Emphasis on action songs with dance motions, puppet theater, foundational hero stories & memory verse chants.
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="font-bold text-orange-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              Little Adventures Orange (5–6 yrs)
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Target: Pre-K & Grade R. Emphasis on oversized picture book storytelling, tactile crafts, animal sound miming & safe snack circle time.
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="font-bold text-yellow-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              Little Adventures Yellow (3–4 yrs)
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Target: Toddlers & Preschool. Soft mat play, bubble machine celebration, simple fingerplay worship, lullaby blessing & strict tag checkout.
            </p>
          </div>

          <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/30 space-y-1 flex flex-col justify-between">
            <div>
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Account & Duty Assignment</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Volunteers and teachers sign in with their assigned class to open their dedicated class hub automatically.
              </p>
            </div>
            <button
              onClick={onOpenAuthModal}
              className="mt-2 text-[11px] text-purple-300 hover:text-white font-bold underline flex items-center gap-1"
            >
              <span>Manage Volunteer Accounts</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
