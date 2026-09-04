import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Role,
  ServiceSegment,
  ServiceState,
  PreServiceCheckItem,
  WorshipSong,
  StageCueBroadcast,
  QuickMessageType,
  EmergencyActionType,
  EmergencyBroadcast,
  HolySpiritOverridePayload,
  IncidentLog,
  TeamMember,
  LessonNotesData,
  ServiceReviewData,
  PrayerRequest,
  BroadcastChannelEvent,
  AuthUser,
  ServiceTemplate,
  ServiceTemplateSegment,
  RealtimeIncidentEvent,
  ClassId,
  ClassInfo,
  ClassHubData,
} from '../types/hub';
import {
  getStoredAuthUser,
  saveStoredAuthUser,
  getStoredTemplates,
  saveStoredTemplates,
  getSupabaseClient,
  broadcastIncidentRealtime,
  PRECONFIGURED_USERS,
  DEFAULT_SERVICE_TEMPLATES,
  getStoredAccountsList,
  saveNewAccount,
  deleteAccount,
} from '../lib/supabase';
import { CLASSES_CONFIG, getAllDefaultClassHubs } from '../data/classHubsData';

// Seed initial service segments based on mockup
const INITIAL_SEGMENTS: ServiceSegment[] = [
  {
    id: 'seg-1',
    order: 1,
    title: 'Welcome',
    plannedStartTime: '08:30 AM',
    durationMinutes: 10,
    assignedLead: 'Pastor Hope',
    assignedRole: 'Teacher',
    status: 'completed',
    notes: 'High energy welcome, welcome new first-time kids & high fives',
  },
  {
    id: 'seg-2',
    order: 2,
    title: 'Praise & Worship',
    plannedStartTime: '08:40 AM',
    durationMinutes: 20,
    assignedLead: 'Sarah',
    assignedRole: 'Worship Leader',
    status: 'completed',
    notes: 'Praise songs with action motions, prepare for memory verse',
  },
  {
    id: 'seg-3',
    order: 3,
    title: 'Memory Verse',
    plannedStartTime: '09:00 AM',
    durationMinutes: 15,
    assignedLead: 'Lebo',
    assignedRole: 'Presenter',
    status: 'in_progress',
    keyScripture: '1 Timothy 5:22 (TPT)',
    notes: 'Break kids into groups for reciting game with visual cue slides',
    slideRange: [1, 14],
  },
  {
    id: 'seg-4',
    order: 4,
    title: 'Offering',
    plannedStartTime: '09:15 AM',
    durationMinutes: 10,
    assignedLead: 'Thabo',
    assignedRole: 'Tech & Host',
    status: 'upcoming',
    notes: 'Kids giving animation video & short giving prayer',
  },
  {
    id: 'seg-5',
    order: 5,
    title: 'Lesson: David & Goliath',
    plannedStartTime: '09:25 AM',
    durationMinutes: 30,
    assignedLead: 'Lebo',
    assignedRole: 'Presenter',
    status: 'upcoming',
    keyScripture: '1 Samuel 17:45-47',
    notes: 'Main story, Giant Ball interactive illustration game',
    slideRange: [15, 23],
  },
  {
    id: 'seg-6',
    order: 6,
    title: 'Small Groups',
    plannedStartTime: '09:55 AM',
    durationMinutes: 15,
    assignedLead: 'Small Group Leaders',
    assignedRole: '8 Leaders',
    status: 'upcoming',
    notes: 'Discussion cards, activity sheet & prayer in circles',
  },
  {
    id: 'seg-7',
    order: 7,
    title: 'Salvation & Ministry',
    plannedStartTime: '10:10 AM',
    durationMinutes: 10,
    assignedLead: 'Pastor Hope',
    assignedRole: 'Teacher',
    status: 'upcoming',
    notes: 'Altar call, soft instrumental pad playing',
  },
  {
    id: 'seg-8',
    order: 8,
    title: 'Announcements',
    plannedStartTime: '10:20 AM',
    durationMinutes: 10,
    assignedLead: 'Pastor Hope',
    assignedRole: 'Teacher',
    status: 'upcoming',
    notes: 'Dream Week next session reminders & prize draw',
  },
  {
    id: 'seg-9',
    order: 9,
    title: 'Dismissal & Parents Pick-up',
    plannedStartTime: '10:30 AM',
    durationMinutes: 15,
    assignedLead: 'Nomsa',
    assignedRole: 'Comms',
    status: 'upcoming',
    notes: 'Match security tags with parent checkout QR',
  },
];

const INITIAL_CHECKLIST: PreServiceCheckItem[] = [
  { id: 'chk-1', label: 'TV / Screens', statusText: 'Connected', isChecked: true, category: 'hardware' },
  { id: 'chk-2', label: 'HDMI / Cables', statusText: 'Working', isChecked: true, category: 'hardware' },
  { id: 'chk-3', label: 'Clicker / Remote', statusText: 'Charged', isChecked: true, category: 'hardware' },
  { id: 'chk-4', label: 'Mic / Batteries', statusText: 'Checked', isChecked: true, category: 'audio' },
  { id: 'chk-5', label: 'Laptop', statusText: 'Charging', isChecked: true, category: 'hardware' },
  { id: 'chk-6', label: 'Songs Loaded', statusText: 'Done', isChecked: true, category: 'media' },
  { id: 'chk-7', label: 'Lesson Slides', statusText: 'Loaded', isChecked: true, category: 'media' },
  { id: 'chk-8', label: 'Videos Tested', statusText: 'Done', isChecked: true, category: 'media' },
  { id: 'chk-9', label: 'Background Music', statusText: 'Ready', isChecked: true, category: 'audio' },
];

const INITIAL_WORSHIP_QUEUE: WorshipSong[] = [
  { id: 'song-1', order: 1, title: 'Open The Eyes', artist: 'Newsboys', duration: '03:48', durationSeconds: 228, isPlaying: false, bpm: 110 },
  { id: 'song-2', order: 2, title: 'Way Maker', artist: 'Sinach', duration: '04:50', durationSeconds: 290, isPlaying: true, bpm: 68 },
  { id: 'song-3', order: 3, title: 'Praise Medley', artist: 'Various Artists', duration: '06:20', durationSeconds: 380, isPlaying: false, bpm: 128 },
];

const INITIAL_INCIDENTS: IncidentLog[] = [
  { id: 'inc-1', time: '08:43 AM', description: 'Mic 2 battery low (< 20%)', status: 'resolved', severity: 'medium', resolvedAt: '08:46 AM', reportedBy: 'Thabo (Tech)' },
  { id: 'inc-2', time: '09:02 AM', description: 'HDMI switched to backup port 2', status: 'resolved', severity: 'low', resolvedAt: '09:03 AM', reportedBy: 'Thabo (Tech)' },
];

const INITIAL_TEAM: TeamMember[] = [
  { id: 'team-1', name: 'Pastor Hope', roleTitle: 'Teacher / Director', roleType: 'admin', avatarColor: 'from-amber-500 to-orange-600', isOnline: true, phone: '+1 (555) 019-2834' },
  { id: 'team-2', name: 'Lebo', roleTitle: 'Lesson Presenter', roleType: 'presenter', avatarColor: 'from-purple-500 to-indigo-600', isOnline: true, phone: '+1 (555) 019-8821' },
  { id: 'team-3', name: 'Sarah', roleTitle: 'Worship Leader', roleType: 'tech', avatarColor: 'from-pink-500 to-rose-600', isOnline: true, phone: '+1 (555) 019-3342' },
  { id: 'team-4', name: 'Nomsa', roleTitle: 'Communications Lead', roleType: 'comms', avatarColor: 'from-emerald-500 to-teal-600', isOnline: true, phone: '+1 (555) 019-4490' },
  { id: 'team-5', name: 'Thabo', roleTitle: 'Tech & Systems Master', roleType: 'tech', avatarColor: 'from-blue-500 to-cyan-600', isOnline: true, phone: '+1 (555) 019-5512' },
  { id: 'team-6', name: 'Small Group Team', roleTitle: '8 Group Leaders', roleType: 'admin', avatarColor: 'from-violet-500 to-purple-600', isOnline: true },
];

const INITIAL_LESSON: LessonNotesData = {
  title: 'David & Goliath',
  mainScripture: '1 Samuel 17:45-47',
  keyPoint: 'God gives us the strength to face any giant.',
  memoryVerse: '1 Timothy 5:22 (TPT) "Keep yourself pure and holy with your standards high."',
  illustrationGame: 'Giant Ball Challenge (Throw foam balls at cardboard Goliath target)',
  slidesCount: 23,
  notes: [
    'Remind kids that Goliath was over 9 feet tall!',
    'David only needed 1 smooth stone because God was on his side.',
    'Ask 3 volunteers from junior and senior groups for the Memory Verse recitation.',
  ],
};

const INITIAL_REVIEW: ServiceReviewData = {
  ratings: {
    equipment: 5,
    timing: 4,
    communication: 5,
    kidsEngagement: 5,
    holySpiritFlow: 5,
    overall: 5,
  },
  whatWentWell: 'The worship time was powerful! Kids recited memory verse with high enthusiasm.',
  notes: 'Recommend charging backup wireless mic batteries on Saturday evening.',
};

const INITIAL_PRAYERS: PrayerRequest[] = [
  { id: 'p-1', author: 'Pastor Hope', text: 'Wisdom for next session leaders & energy for volunteers', timestamp: '08:15 AM', isAnswered: false, category: 'team' },
  { id: 'p-2', author: 'Nomsa', text: 'More volunteers for Sunday check-in desks', timestamp: '08:45 AM', isAnswered: false, category: 'service' },
  { id: 'p-3', author: 'Sarah', text: 'Kids to encounter Jesus deeply during worship today', timestamp: '09:05 AM', isAnswered: true, category: 'kids' },
];

const CHANNEL_NAME = 'kids_church_service_hub_channel';

// Helper to compute initial targetEndTime (set ~3 mins 42 sec remaining for Memory Verse as in mockup)
function getMockInitialEndTime(): string {
  const target = new Date(Date.now() + (3 * 60 + 42) * 1000);
  return target.toISOString();
}

export function useServiceSync(activeRoleProp: Role = 'admin') {
  // Authentication & Role State
  const [authUser, setAuthUser] = useState<AuthUser>(() => getStoredAuthUser());

  // Registered Accounts State (Supabase / Local DB)
  const [registeredAccounts, setRegisteredAccounts] = useState<AuthUser[]>(() => getStoredAccountsList());

  // Multi-Class Hubs Master State
  const [allClassHubs, setAllClassHubs] = useState<Record<ClassId, ClassHubData>>(() => {
    try {
      const saved = localStorage.getItem('kids_church_multi_class_hubs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.jy && parsed.tb && parsed.kb && parsed['la-orange'] && parsed['la-yellow']) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading class hubs:', e);
    }
    return getAllDefaultClassHubs();
  });

  // Selected Active Class Hub
  const [selectedClassId, setSelectedClassId] = useState<ClassId>(() => {
    try {
      const saved = localStorage.getItem('kch_selected_class_id');
      if (saved && ['jy', 'tb', 'kb', 'la-orange', 'la-yellow', 'all'].includes(saved)) {
        return saved as ClassId;
      }
    } catch (e) {}
    const auth = getStoredAuthUser();
    if (auth.assignedClassId && auth.assignedClassId !== 'all') {
      return auth.assignedClassId;
    }
    return 'kb';
  });

  const activeHubKey: ClassId = selectedClassId === 'all' ? 'kb' : selectedClassId;
  const initialHubData = allClassHubs[activeHubKey] || allClassHubs.kb;

  // Active Service State for the current room
  const [serviceState, setServiceState] = useState<ServiceState>(() => initialHubData?.serviceState || {
    serviceId: 'srv-dreamweek-day3',
    serviceName: 'Dream Week Conference CRC',
    date: 'Wed, June 18, 2026',
    theme: 'Bigger Together',
    currentSegmentId: 'seg-3',
    targetEndTime: getMockInitialEndTime(),
    targetDurationSeconds: 15 * 60,
    isPaused: false,
    lastUpdated: new Date().toISOString(),
    currentSlideIndex: 14,
    totalSlides: 23,
    activeWorshipSongId: 'song-2',
    isEmergencyActive: false,
    activeEmergencyType: null,
  });

  const [segments, setSegments] = useState<ServiceSegment[]>(() => initialHubData?.segments || INITIAL_SEGMENTS);
  const [checklist, setChecklist] = useState<PreServiceCheckItem[]>(() => initialHubData?.checklist || INITIAL_CHECKLIST);
  const [worshipQueue, setWorshipQueue] = useState<WorshipSong[]>(() => initialHubData?.worshipQueue || INITIAL_WORSHIP_QUEUE);
  const [activeCues, setActiveCues] = useState<StageCueBroadcast[]>(() => initialHubData?.activeCues || []);
  const [incidents, setIncidents] = useState<IncidentLog[]>(() => initialHubData?.incidents || INITIAL_INCIDENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => initialHubData?.teamMembers || INITIAL_TEAM);
  const [lessonNotes, setLessonNotes] = useState<LessonNotesData>(() => initialHubData?.lessonNotes || INITIAL_LESSON);
  const [reviewData, setReviewData] = useState<ServiceReviewData>(() => initialHubData?.reviewData || INITIAL_REVIEW);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => initialHubData?.prayerRequests || INITIAL_PRAYERS);

  // Active class configuration helper
  const activeClassInfo = useMemo(() => {
    return CLASSES_CONFIG.find((c) => c.id === selectedClassId) || CLASSES_CONFIG.find((c) => c.id === 'kb') || CLASSES_CONFIG[0];
  }, [selectedClassId]);

  // Keep allClassHubs in sync with active room changes and persist to localStorage
  useEffect(() => {
    const hubKey = selectedClassId === 'all' ? 'kb' : selectedClassId;
    setAllClassHubs((prev) => {
      const existing = prev[hubKey];
      if (!existing) return prev;
      const updatedHub: ClassHubData = {
        ...existing,
        serviceState,
        segments,
        checklist,
        worshipQueue,
        activeCues,
        incidents,
        teamMembers,
        lessonNotes,
        reviewData,
        prayerRequests,
      };
      const updatedAll = {
        ...prev,
        [hubKey]: updatedHub,
      };
      try {
        localStorage.setItem('kids_church_multi_class_hubs_v2', JSON.stringify(updatedAll));
      } catch (e) {
        console.warn('Error persisting class hubs:', e);
      }
      return updatedAll;
    });
  }, [
    selectedClassId,
    serviceState,
    segments,
    checklist,
    worshipQueue,
    activeCues,
    incidents,
    teamMembers,
    lessonNotes,
    reviewData,
    prayerRequests,
  ]);

  // Service Templates Table State (Postgres `service_templates`)
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(() => getStoredTemplates());

  // Real-time Incident Alert Popup State
  const [activeIncidentAlert, setActiveIncidentAlert] = useState<IncidentLog | null>(null);

  // Presenter notification log (ephemeral history)
  const [notifications, setNotifications] = useState<{ id: string; to: string; message: string; timestamp: string }[]>([
    { id: 'notif-1', to: 'Lebo', message: "You're up in 5 minutes", timestamp: '08:55 AM' },
    { id: 'notif-2', to: 'Lebo', message: '2 minutes to go', timestamp: '08:58 AM' },
    { id: 'notif-3', to: 'Lebo', message: 'Please move backstage --', timestamp: '09:00 AM' },
  ]);

  // Active role derived from authenticated user or prop
  const activeRole = authUser.role || activeRoleProp;

  // Real-time broadcast channel reference
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const clientIdRef = useRef<string>(`client_${Math.random().toString(36).substring(2, 9)}`);

  // Ephemeral cue sound synthesizer using Web Audio API (no external sound file dependency)
  const playCueSound = useCallback((priority: 'normal' | 'urgent' | 'emergency') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (priority === 'emergency') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (priority === 'urgent') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        // Subtle soft chime for stage
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be blocked if user has not interacted yet
    }
  }, []);

  // Broadcast dispatch method supporting Supabase broadcast and BroadcastChannel API
  const dispatchBroadcast = useCallback(<T,>(event: BroadcastChannelEvent<T>['event'], payload: T) => {
    const message: BroadcastChannelEvent<T> = {
      type: 'broadcast',
      event,
      payload,
      sentAt: new Date().toISOString(),
      senderId: clientIdRef.current,
    };

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Mock Supabase channel send interface log for protocol compatibility:
    // supabase.channel('room').send({ type: 'broadcast', event, payload })
    console.debug(`[Supabase Realtime Broadcast] ${event}:`, payload);
  }, []);

  // Initialize Broadcast Channel listener for instant cross-tab / cross-window sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event: MessageEvent<BroadcastChannelEvent>) => {
        const { data } = event;
        if (!data || data.senderId === clientIdRef.current) return;

        switch (data.event) {
          case 'STAGE_CUE': {
            const cue = data.payload as StageCueBroadcast;
            setActiveCues((prev) => [cue, ...prev.filter((c) => c.id !== cue.id)]);
            playCueSound(cue.priority);
            break;
          }
          case 'SERVICE_STATE_UPDATE': {
            const newState = data.payload as ServiceState;
            setServiceState(newState);
            break;
          }
          case 'HOLY_SPIRIT_OVERRIDE': {
            const override = data.payload as HolySpiritOverridePayload;
            setServiceState((prev) => ({
              ...prev,
              targetEndTime: override.newTargetEndTime,
              lastUpdated: new Date().toISOString(),
            }));
            playCueSound('urgent');
            break;
          }
          case 'EMERGENCY_OVERRIDE': {
            const emergency = data.payload as EmergencyBroadcast;
            setServiceState((prev) => ({
              ...prev,
              isEmergencyActive: emergency.isActive,
              activeEmergencyType: emergency.isActive ? emergency.action : null,
              lastUpdated: new Date().toISOString(),
            }));
            if (emergency.isActive) playCueSound('emergency');
            break;
          }
          case 'CHECKLIST_UPDATE': {
            const updatedList = data.payload as PreServiceCheckItem[];
            setChecklist(updatedList);
            break;
          }
          case 'SLIDE_CHANGE': {
            const { slideIndex } = data.payload as { slideIndex: number };
            setServiceState((prev) => ({ ...prev, currentSlideIndex: slideIndex }));
            break;
          }
          case 'WORSHIP_CHANGE': {
            const { songId, isPlaying } = data.payload as { songId: string; isPlaying: boolean };
            setWorshipQueue((prev) =>
              prev.map((s) => ({
                ...s,
                isPlaying: s.id === songId ? isPlaying : false,
              }))
            );
            break;
          }
          case 'NOTIFICATION': {
            const notif = data.payload as { id: string; to: string; message: string; timestamp: string };
            setNotifications((prev) => [notif, ...prev]);
            break;
          }
          case 'INCIDENT_ADDED': {
            const inc = data.payload as IncidentLog;
            setIncidents((prev) => [inc, ...prev.filter(i => i.id !== inc.id)]);
            setActiveIncidentAlert(inc);
            playCueSound(inc.severity === 'critical' ? 'emergency' : inc.severity === 'medium' ? 'urgent' : 'normal');
            break;
          }
          case 'SERVICE_TEMPLATES_UPDATE': {
            const tmpls = data.payload as ServiceTemplate[];
            setServiceTemplates(tmpls);
            saveStoredTemplates(tmpls);
            break;
          }
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [playCueSound]);

  // Connect to Supabase Realtime Channel if client is available
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const channel = supabase.channel('incident_logs_realtime');
      channel
        .on('broadcast', { event: 'incident_event' }, ({ payload }) => {
          if (payload && payload.incident) {
            const inc = payload.incident as IncidentLog;
            setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)]);
            setActiveIncidentAlert(inc);
            playCueSound(inc.severity === 'critical' ? 'emergency' : inc.severity === 'medium' ? 'urgent' : 'normal');
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Supabase subscription error:', err);
    }
  }, [playCueSound]);

  // Clean up expired stage cues every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setActiveCues((prev) => prev.filter((cue) => new Date(cue.expiresAt).getTime() > now));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * ZERO-STREAMING TIMER CALCULATION
   * Local High-Resolution Countdown via requestAnimationFrame & Delta Timing.
   * Calculates time remaining purely from targetEndTime ISO string.
   */
  const [localRemainingSeconds, setLocalRemainingSeconds] = useState<number>(() => {
    if (!serviceState.targetEndTime) return 0;
    const diff = Math.floor((new Date(serviceState.targetEndTime).getTime() - Date.now()) / 1000);
    return diff;
  });

  useEffect(() => {
    let animFrameId: number;

    const updateTimer = () => {
      if (serviceState.targetEndTime && !serviceState.isPaused) {
        const diff = Math.floor((new Date(serviceState.targetEndTime).getTime() - Date.now()) / 1000);
        setLocalRemainingSeconds(diff);
      }
      animFrameId = requestAnimationFrame(updateTimer);
    };

    animFrameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animFrameId);
  }, [serviceState.targetEndTime, serviceState.isPaused]);

  // Format local timer output for display
  const localTimer = useMemo(() => {
    const isOvertime = localRemainingSeconds < 0;
    const absSeconds = Math.abs(localRemainingSeconds);
    const minutes = Math.floor(absSeconds / 60);
    const seconds = absSeconds % 60;
    const formattedTime = `${isOvertime ? '+' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const totalSecs = serviceState.targetDurationSeconds || 15 * 60;
    const elapsedSecs = totalSecs - localRemainingSeconds;
    const progressPercentage = Math.min(100, Math.max(0, (elapsedSecs / totalSecs) * 100));

    let endTimeFormatted = '09:15 AM';
    if (serviceState.targetEndTime) {
      const d = new Date(serviceState.targetEndTime);
      let hours = d.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(d.getMinutes()).padStart(2, '0');
      endTimeFormatted = `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }

    return {
      remainingSeconds: localRemainingSeconds,
      formattedTime,
      isOvertime,
      overtimeSeconds: isOvertime ? absSeconds : 0,
      progressPercentage,
      targetEndTimeFormatted: endTimeFormatted,
    };
  }, [localRemainingSeconds, serviceState.targetEndTime, serviceState.targetDurationSeconds]);

  // Current & next segment lookup
  const currentSegment = useMemo(() => {
    return segments.find((s) => s.id === serviceState.currentSegmentId) || segments[2];
  }, [segments, serviceState.currentSegmentId]);

  const nextSegment = useMemo(() => {
    if (!currentSegment) return null;
    return segments.find((s) => s.order === currentSegment.order + 1) || null;
  }, [segments, currentSegment]);

  // Send quick stage cues (ephemeral)
  const sendStageCue = useCallback(
    (type: QuickMessageType, customMessage?: string) => {
      const titles: Record<QuickMessageType, string> = {
        wrap_up: 'Wrap Up',
        slow_down: 'Slow Down',
        speed_up: 'Speed Up',
        mic_closer: 'Mic Closer',
        pray: 'Pray / Response',
        finish: 'Finish Segment',
        custom: 'Stage Cue',
      };

      const messages: Record<QuickMessageType, string> = {
        wrap_up: 'Please wrap up this point (1 min remaining)',
        slow_down: 'Slow down pacing for kids understanding',
        speed_up: 'Pick up pace to stay on schedule',
        mic_closer: 'Hold microphone closer to mouth',
        pray: 'Lead into altar/prayer response moment',
        finish: 'Transition to next item now',
        custom: customMessage || 'Notice from production booth',
      };

      const priorities: Record<QuickMessageType, 'normal' | 'urgent' | 'emergency'> = {
        wrap_up: 'urgent',
        slow_down: 'normal',
        speed_up: 'normal',
        mic_closer: 'urgent',
        pray: 'normal',
        finish: 'urgent',
        custom: 'normal',
      };

      const newCue: StageCueBroadcast = {
        id: `cue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        title: titles[type],
        message: customMessage || messages[type],
        senderRole: activeRole,
        senderName: activeRole === 'comms' ? 'Nomsa (Comms)' : activeRole === 'tech' ? 'Thabo (Tech)' : 'Director',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expiresAt: new Date(Date.now() + 18000).toISOString(), // 18 seconds on screen
        priority: priorities[type],
      };

      setActiveCues((prev) => [newCue, ...prev]);
      playCueSound(newCue.priority);
      dispatchBroadcast('STAGE_CUE', newCue);
    },
    [activeRole, dispatchBroadcast, playCueSound]
  );

  const dismissCue = useCallback((cueId: string) => {
    setActiveCues((prev) => prev.filter((c) => c.id !== cueId));
  }, []);

  // Holy Spirit Mode Override Handler
  const holySpiritOverride = useCallback(
    (options: {
      action: 'extend' | 'shorten' | 'skip';
      adjustmentMinutes: number;
      reason?: string;
    }) => {
      const { action, adjustmentMinutes, reason } = options;
      const currentTargetMs = serviceState.targetEndTime
        ? new Date(serviceState.targetEndTime).getTime()
        : Date.now();

      let newTargetMs = currentTargetMs;
      if (action === 'extend') {
        newTargetMs = Math.max(Date.now(), currentTargetMs) + adjustmentMinutes * 60 * 1000;
      } else if (action === 'shorten') {
        newTargetMs = Math.max(Date.now() + 60 * 1000, currentTargetMs - adjustmentMinutes * 60 * 1000);
      } else if (action === 'skip') {
        // Skip current segment
        const currentIndex = segments.findIndex((s) => s.id === serviceState.currentSegmentId);
        const nextSeg = segments[currentIndex + 1];
        if (nextSeg) {
          const nextTarget = new Date(Date.now() + nextSeg.durationMinutes * 60 * 1000).toISOString();
          const updatedState: ServiceState = {
            ...serviceState,
            currentSegmentId: nextSeg.id,
            targetEndTime: nextTarget,
            targetDurationSeconds: nextSeg.durationMinutes * 60,
            lastUpdated: new Date().toISOString(),
          };
          setServiceState(updatedState);
          setSegments((prev) =>
            prev.map((s) => (s.id === serviceState.currentSegmentId ? { ...s, status: 'completed' } : s.id === nextSeg.id ? { ...s, status: 'in_progress' } : s))
          );
          dispatchBroadcast('SERVICE_STATE_UPDATE', updatedState);
          return;
        }
      }

      const newTargetIso = new Date(newTargetMs).toISOString();

      const overridePayload: HolySpiritOverridePayload = {
        action,
        segmentId: currentSegment.id,
        segmentTitle: currentSegment.title,
        adjustmentMinutes,
        newTargetEndTime: newTargetIso,
        reason: reason || 'Holy Spirit Flow Adjustment',
        notifications: {
          presenter: `${currentSegment.title} ${action === 'extend' ? `extended by +${adjustmentMinutes} mins` : 'adjusted'}. New target countdown updated!`,
          comms: 'Timeline adjusted. All downstream segments synced.',
          tech: 'Continue current media & lighting cue.',
        },
      };

      setServiceState((prev) => ({
        ...prev,
        targetEndTime: newTargetIso,
        targetDurationSeconds: prev.targetDurationSeconds + (action === 'extend' ? adjustmentMinutes * 60 : -adjustmentMinutes * 60),
        lastUpdated: new Date().toISOString(),
      }));

      playCueSound('urgent');
      dispatchBroadcast('HOLY_SPIRIT_OVERRIDE', overridePayload);

      // Send active cue banner to presenter
      sendStageCue('custom', `✨ HOLY SPIRIT EXTENSION: +${adjustmentMinutes} MINS. Continue ministering!`);
    },
    [serviceState, segments, currentSegment, dispatchBroadcast, playCueSound, sendStageCue]
  );

  // Emergency Mode triggers
  const triggerEmergency = useCallback(
    (action: EmergencyActionType, message?: string) => {
      const emergencyBroadcast: EmergencyBroadcast = {
        action,
        isActive: true,
        triggeredBy: activeRole === 'tech' ? 'Thabo (Tech Console)' : 'Admin',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: message || `Emergency Override: ${action.replace('_', ' ').toUpperCase()}`,
      };

      setServiceState((prev) => ({
        ...prev,
        isEmergencyActive: true,
        activeEmergencyType: action,
        lastUpdated: new Date().toISOString(),
      }));

      playCueSound('emergency');
      dispatchBroadcast('EMERGENCY_OVERRIDE', emergencyBroadcast);

      // Add to incident log
      const newIncident: IncidentLog = {
        id: `inc_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: `Emergency trigger: ${action.replace('_', ' ').toUpperCase()}`,
        status: 'open',
        severity: 'critical',
        reportedBy: `${activeRole.toUpperCase()} Console`,
      };
      setIncidents((prev) => [newIncident, ...prev]);
      dispatchBroadcast('INCIDENT_ADDED', newIncident);
    },
    [activeRole, dispatchBroadcast, playCueSound]
  );

  const clearEmergency = useCallback(() => {
    const broadcast: EmergencyBroadcast = {
      action: 'play_instrumental',
      isActive: false,
      triggeredBy: 'System Reset',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setServiceState((prev) => ({
      ...prev,
      isEmergencyActive: false,
      activeEmergencyType: null,
      lastUpdated: new Date().toISOString(),
    }));

    dispatchBroadcast('EMERGENCY_OVERRIDE', broadcast);
  }, [dispatchBroadcast]);

  // Slides and Media control
  const setSlideIndex = useCallback(
    (index: number) => {
      const safeIndex = Math.max(1, Math.min(serviceState.totalSlides, index));
      setServiceState((prev) => ({ ...prev, currentSlideIndex: safeIndex }));
      dispatchBroadcast('SLIDE_CHANGE', { slideIndex: safeIndex });
    },
    [serviceState.totalSlides, dispatchBroadcast]
  );

  // Pre-service checklist toggle
  const toggleChecklistItem = useCallback(
    (id: string) => {
      setChecklist((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item));
        dispatchBroadcast('CHECKLIST_UPDATE', next);
        return next;
      });
    },
    [dispatchBroadcast]
  );

  const markAllChecksDone = useCallback(() => {
    setChecklist((prev) => {
      const next = prev.map((item) => ({ ...item, isChecked: true }));
      dispatchBroadcast('CHECKLIST_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  // Worship Queue Control
  const setWorshipSong = useCallback(
    (songId: string, isPlaying: boolean) => {
      setWorshipQueue((prev) => {
        const next = prev.map((s) => ({
          ...s,
          isPlaying: s.id === songId ? isPlaying : false,
        }));
        return next;
      });
      dispatchBroadcast('WORSHIP_CHANGE', { songId, isPlaying });
    },
    [dispatchBroadcast]
  );

  // Service Segment Progression
  const startSegment = useCallback(
    (segmentId: string, durationMinutes?: number) => {
      const targetSeg = segments.find((s) => s.id === segmentId);
      const duration = durationMinutes || targetSeg?.durationMinutes || 15;
      const targetEnd = new Date(Date.now() + duration * 60 * 1000).toISOString();

      const updatedState: ServiceState = {
        ...serviceState,
        currentSegmentId: segmentId,
        targetEndTime: targetEnd,
        targetDurationSeconds: duration * 60,
        isPaused: false,
        lastUpdated: new Date().toISOString(),
      };

      setServiceState(updatedState);
      setSegments((prev) =>
        prev.map((s) => {
          if (s.id === segmentId) return { ...s, status: 'in_progress' };
          return s;
        })
      );

      dispatchBroadcast('SERVICE_STATE_UPDATE', updatedState);
    },
    [segments, serviceState, dispatchBroadcast]
  );

  const completeSegment = useCallback(
    (segmentId: string) => {
      setSegments((prev) =>
        prev.map((s) => (s.id === segmentId ? { ...s, status: 'completed' } : s))
      );
      // Auto move to next if available
      const currentIndex = segments.findIndex((s) => s.id === segmentId);
      const nextSeg = segments[currentIndex + 1];
      if (nextSeg) {
        startSegment(nextSeg.id);
      }
    },
    [segments, startSegment]
  );

  // Switch between Class Hubs
  const switchClassHub = useCallback((newClassId: ClassId) => {
    setSelectedClassId(newClassId);
    try {
      localStorage.setItem('kch_selected_class_id', newClassId);
    } catch (e) {}

    const targetKey = newClassId === 'all' ? 'kb' : newClassId;
    const targetHub = allClassHubs[targetKey] || allClassHubs.kb;
    if (targetHub) {
      setServiceState(targetHub.serviceState);
      setSegments(targetHub.segments);
      setChecklist(targetHub.checklist);
      setWorshipQueue(targetHub.worshipQueue);
      setActiveCues(targetHub.activeCues || []);
      setIncidents(targetHub.incidents || []);
      setTeamMembers(targetHub.teamMembers || INITIAL_TEAM);
      setLessonNotes(targetHub.lessonNotes);
      setReviewData(targetHub.reviewData);
      setPrayerRequests(targetHub.prayerRequests);
    }
  }, [allClassHubs]);

  // Auth User Management & Account Registration
  const loginUser = useCallback((email: string, role?: Role, name?: string, classId?: ClassId) => {
    const existing = registeredAccounts.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `usr_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: role || 'admin',
      roleTitle: role === 'admin' ? 'Administrator' : role === 'tech' ? 'Tech & Systems' : role === 'presenter' ? 'Lesson Presenter' : 'Comms Lead',
      assignedClassId: classId || 'all',
      avatarColor: role === 'admin' ? 'from-amber-500 to-orange-600' : role === 'tech' ? 'from-blue-500 to-cyan-600' : role === 'presenter' ? 'from-purple-500 to-indigo-600' : 'from-emerald-500 to-teal-600',
      isAuthenticated: true,
    };
    setAuthUser(existing);
    saveStoredAuthUser(existing);
    if (existing.assignedClassId && existing.assignedClassId !== 'all') {
      switchClassHub(existing.assignedClassId);
    }
    return existing;
  }, [registeredAccounts, switchClassHub]);

  const switchAuthUser = useCallback((user: AuthUser) => {
    setAuthUser(user);
    saveStoredAuthUser(user);
    if (user.assignedClassId && user.assignedClassId !== 'all') {
      switchClassHub(user.assignedClassId);
    }
  }, [switchClassHub]);

  const addNewAccount = useCallback((newUser: AuthUser) => {
    const updated = saveNewAccount(newUser);
    setRegisteredAccounts(updated);
    return updated;
  }, []);

  const deleteUserAccount = useCallback((userId: string) => {
    const updated = deleteAccount(userId);
    setRegisteredAccounts(updated);
    return updated;
  }, []);

  const logoutUser = useCallback(() => {
    const guestUser: AuthUser = {
      id: 'guest',
      email: '',
      name: 'Guest',
      role: 'presenter',
      roleTitle: 'Viewer',
      assignedClassId: 'all',
      avatarColor: 'from-gray-600 to-gray-800',
      isAuthenticated: false,
    };
    setAuthUser(guestUser);
    saveStoredAuthUser(guestUser);
  }, []);

  // Multi-Class Broadcast Helpers
  const broadcastCueToAllClasses = useCallback((title: string, message: string, priority: 'normal' | 'urgent' | 'emergency' = 'normal') => {
    const newCue: StageCueBroadcast = {
      id: `cue_global_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'custom',
      title,
      message,
      senderRole: activeRole,
      senderName: authUser?.name || 'Central Command',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority,
      expiresAt: new Date(Date.now() + 25000).toISOString(),
    };
    setActiveCues((prev) => [newCue, ...prev]);
    playCueSound(priority);
    dispatchBroadcast('STAGE_CUE', newCue);

    setAllClassHubs((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as ClassId[]).forEach((cid) => {
        updated[cid] = {
          ...updated[cid],
          activeCues: [newCue, ...(updated[cid].activeCues || [])],
        };
      });
      try {
        localStorage.setItem('kids_church_multi_class_hubs_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [activeRole, authUser?.name, dispatchBroadcast, playCueSound]);

  const sendCueToClass = useCallback((classId: ClassId, type: QuickMessageType, customMessage?: string) => {
    const titles: Record<QuickMessageType, string> = {
      wrap_up: 'Wrap Up',
      slow_down: 'Slow Down',
      speed_up: 'Speed Up',
      mic_closer: 'Mic Closer',
      pray: 'Pray / Response',
      finish: 'Finish Segment',
      custom: 'Stage Cue',
    };
    const newCue: StageCueBroadcast = {
      id: `cue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: titles[type] || 'Stage Cue',
      message: customMessage || 'Notice from control booth',
      senderRole: activeRole,
      senderName: authUser?.name || 'Booth',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: type === 'wrap_up' || type === 'finish' ? 'urgent' : 'normal',
      expiresAt: new Date(Date.now() + 20000).toISOString(),
    };

    if (selectedClassId === classId || selectedClassId === 'all') {
      setActiveCues((prev) => [newCue, ...prev]);
      playCueSound(newCue.priority);
    }

    setAllClassHubs((prev) => {
      const classData = prev[classId] || prev.kb;
      const updated = {
        ...prev,
        [classId]: {
          ...classData,
          activeCues: [newCue, ...(classData.activeCues || [])],
        },
      };
      try {
        localStorage.setItem('kids_church_multi_class_hubs_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    dispatchBroadcast('STAGE_CUE', newCue);
  }, [activeRole, authUser?.name, dispatchBroadcast, playCueSound, selectedClassId]);

  // Service Templates CRUD
  const createTemplate = useCallback((newTemplateData: Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ServiceTemplate = {
      ...newTemplateData,
      id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setServiceTemplates((prev) => {
      const updated = [newTemplate, ...prev];
      saveStoredTemplates(updated);
      dispatchBroadcast('SERVICE_TEMPLATES_UPDATE', updated);
      return updated;
    });
    return newTemplate;
  }, [dispatchBroadcast]);

  const updateTemplate = useCallback((id: string, updates: Partial<ServiceTemplate>) => {
    setServiceTemplates((prev) => {
      const updated = prev.map((tmpl) =>
        tmpl.id === id ? { ...tmpl, ...updates, updatedAt: new Date().toISOString() } : tmpl
      );
      saveStoredTemplates(updated);
      dispatchBroadcast('SERVICE_TEMPLATES_UPDATE', updated);
      return updated;
    });
  }, [dispatchBroadcast]);

  const deleteTemplate = useCallback((id: string) => {
    setServiceTemplates((prev) => {
      const updated = prev.filter((tmpl) => tmpl.id !== id);
      saveStoredTemplates(updated);
      dispatchBroadcast('SERVICE_TEMPLATES_UPDATE', updated);
      return updated;
    });
  }, [dispatchBroadcast]);

  const resetTemplatesToDefault = useCallback(() => {
    setServiceTemplates(DEFAULT_SERVICE_TEMPLATES);
    saveStoredTemplates(DEFAULT_SERVICE_TEMPLATES);
    dispatchBroadcast('SERVICE_TEMPLATES_UPDATE', DEFAULT_SERVICE_TEMPLATES);
  }, [dispatchBroadcast]);

  const applyTemplateToLiveService = useCallback((templateId: string) => {
    const template = serviceTemplates.find((t) => t.id === templateId);
    if (!template) return false;

    // Convert template segments into active service segments
    let currentPlannedMinutes = 8 * 60 + 30; // 08:30 AM default start
    const newSegments: ServiceSegment[] = template.segments.map((ts, idx) => {
      const hours = Math.floor(currentPlannedMinutes / 60);
      const mins = currentPlannedMinutes % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const plannedTime = `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;

      currentPlannedMinutes += ts.defaultDurationMinutes;

      return {
        id: `seg_applied_${Date.now()}_${idx + 1}`,
        order: idx + 1,
        title: ts.title,
        plannedStartTime: plannedTime,
        durationMinutes: ts.defaultDurationMinutes,
        assignedLead: ts.assignedLead || 'Team Lead',
        assignedRole: ts.assignedRole || 'Speaker',
        status: idx === 0 ? 'in_progress' : 'upcoming',
        notes: ts.notes || '',
        keyScripture: ts.keyScripture || undefined,
        slideRange: [1, 15],
      };
    });

    setSegments(newSegments);

    const firstSeg = newSegments[0];
    const firstDurationSec = (firstSeg?.durationMinutes || 15) * 60;
    const targetEndIso = new Date(Date.now() + firstDurationSec * 1000).toISOString();

    const updatedState: ServiceState = {
      ...serviceState,
      serviceName: template.name,
      currentSegmentId: firstSeg?.id || null,
      targetEndTime: targetEndIso,
      targetDurationSeconds: firstDurationSec,
      isPaused: false,
      lastUpdated: new Date().toISOString(),
    };

    setServiceState(updatedState);
    dispatchBroadcast('SERVICE_STATE_UPDATE', updatedState);

    // Send stage cue banner
    sendStageCue('custom', `📋 Applied Template: "${template.name}" with ${template.segments.length} segments`);
    return true;
  }, [serviceTemplates, serviceState, dispatchBroadcast, sendStageCue]);

  // Enhanced Incident Logger with Real-Time Broadcast & Alert Trigger
  const addIncident = useCallback(
    (description: string, severity: 'low' | 'medium' | 'critical' = 'low', customReportedBy?: string) => {
      const reporter = customReportedBy || (authUser?.name ? `${authUser.name} (${authUser.role.toUpperCase()})` : 'Tech Staff');
      const newInc: IncidentLog = {
        id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description,
        status: 'open',
        severity,
        reportedBy: reporter,
      };

      setIncidents((prev) => [newInc, ...prev]);
      setActiveIncidentAlert(newInc);

      // Play audio cue
      playCueSound(severity === 'critical' ? 'emergency' : severity === 'medium' ? 'urgent' : 'normal');

      // Dispatch to cross-tab BroadcastChannel
      dispatchBroadcast('INCIDENT_ADDED', newInc);

      // Dispatch to remote Supabase Realtime channel
      broadcastIncidentRealtime({
        incident: newInc,
        action: 'created',
        triggeredBy: reporter,
        timestamp: new Date().toISOString(),
      });

      // Also trigger a stage cue notice if critical
      if (severity === 'critical' || severity === 'medium') {
        sendStageCue('custom', `⚠️ ALERT [${severity.toUpperCase()}]: ${description}`);
      }
    },
    [authUser, dispatchBroadcast, playCueSound, sendStageCue]
  );

  const dismissIncidentAlert = useCallback(() => {
    setActiveIncidentAlert(null);
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'resolved',
              resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : inc
      )
    );
    setActiveIncidentAlert((prev) => (prev?.id === id ? null : prev));
  }, []);

  // Notifications
  const sendNotification = useCallback(
    (to: string, message: string) => {
      const notif = {
        id: `notif_${Date.now()}`,
        to,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [notif, ...prev]);
      dispatchBroadcast('NOTIFICATION', notif);
      sendStageCue('custom', `${to}: ${message}`);
    },
    [dispatchBroadcast, sendStageCue]
  );

  // Prayer & Reviews
  const addPrayerRequest = useCallback((text: string, category: 'team' | 'kids' | 'service' = 'team') => {
    const newReq: PrayerRequest = {
      id: `prayer_${Date.now()}`,
      author: authUser?.name || 'Team Leader',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAnswered: false,
      category,
    };
    setPrayerRequests((prev) => [newReq, ...prev]);
  }, [authUser?.name]);

  const updateReview = useCallback((review: Partial<ServiceReviewData>) => {
    setReviewData((prev) => ({
      ...prev,
      ...review,
      ratings: {
        ...prev.ratings,
        ...(review.ratings || {}),
      },
    }));
  }, []);

  return {
    authUser,
    loginUser,
    switchAuthUser,
    logoutUser,
    serviceTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resetTemplatesToDefault,
    applyTemplateToLiveService,
    activeIncidentAlert,
    dismissIncidentAlert,
    serviceState,
    segments,
    checklist,
    worshipQueue,
    activeCues,
    incidents,
    teamMembers,
    lessonNotes,
    reviewData,
    prayerRequests,
    notifications,
    currentSegment,
    nextSegment,
    localTimer,
    sendStageCue,
    dismissCue,
    holySpiritOverride,
    triggerEmergency,
    clearEmergency,
    setSlideIndex,
    toggleChecklistItem,
    markAllChecksDone,
    setWorshipSong,
    startSegment,
    completeSegment,
    addIncident,
    resolveIncident,
    sendNotification,
    addPrayerRequest,
    updateReview,
    setLessonNotes,
    selectedClassId,
    switchClassHub,
    activeClassInfo,
    allClassesConfig: CLASSES_CONFIG,
    allClassHubs,
    registeredAccounts,
    addNewAccount,
    deleteUserAccount,
    broadcastCueToAllClasses,
    sendCueToClass,
  };
}
