import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Role,
  ServiceSegment,
  ServiceState,
  PreServiceCheckItem,
  WorshipSong,
  StageCueBroadcast,
  StageCueCopyAck,
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
  DirectorAnnouncement,
  CalendarEvent,
  QuickStagePreset,
  CommsEmergencyAlert,
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
  clearAllSeedAccounts,
  resetToSeedAccounts,
  updateAccountAdminStatus,
  updateAccountPin,
  dbSyncWithSupabase,
  subscribeToSupabaseAccounts,
  subscribeToSupabaseHubBroadcast,
  sendSupabaseHubBroadcast,
} from '../lib/supabase';
import { dbSyncRemoteAccounts } from '../lib/database';
import { CLASSES_CONFIG, getAllDefaultClassHubs } from '../data/classHubsData';

// Persistent storage keys
const LOCAL_CLASS_HUBS_KEY = 'kids_church_multi_class_hubs_v6';
const LOCAL_CALENDAR_KEY = 'kids_church_calendar_events_v6';
const LOCAL_QUICK_PRESETS_KEY = 'kids_church_quick_cues_presets_v6';
const LOCAL_PRAYERS_KEY = 'kids_church_saved_prayers_v6';
const LOCAL_MONDAY_RESET_KEY = 'kids_church_last_monday_reset_v6';

// Pristine blank initial state - Class Admin creates accounts, checklist, timeline, calendar, and quick cues
const INITIAL_SEGMENTS: ServiceSegment[] = [];
const INITIAL_CHECKLIST: PreServiceCheckItem[] = [];
const INITIAL_WORSHIP_QUEUE: WorshipSong[] = [];
const INITIAL_INCIDENTS: IncidentLog[] = [];
const INITIAL_TEAM: TeamMember[] = [];
const INITIAL_LESSON: LessonNotesData = {
  title: '',
  mainScripture: '',
  keyPoint: '',
  memoryVerse: '',
  illustrationGame: '',
  slidesCount: 0,
  notes: [],
};
const INITIAL_REVIEW: ServiceReviewData = {
  ratings: {
    equipment: 0,
    timing: 0,
    communication: 0,
    kidsEngagement: 0,
    holySpiritFlow: 0,
    overall: 0,
  },
  whatWentWell: '',
  notes: '',
};

export const DEFAULT_QUICK_PRESETS: QuickStagePreset[] = [
  { id: 'qp-1', label: 'Wrap Up (1 Min)', message: 'Please wrap up this point (1 min remaining)', priority: 'urgent', color: 'amber' },
  { id: 'qp-2', label: 'Mic Closer', message: 'Hold microphone closer to mouth', priority: 'urgent', color: 'purple' },
  { id: 'qp-3', label: 'Slow Down', message: 'Slow down pacing for kids understanding', priority: 'normal', color: 'blue' },
  { id: 'qp-4', label: 'Speed Up', message: 'Pick up pace to stay on schedule', priority: 'normal', color: 'orange' },
  { id: 'qp-5', label: 'Pray / Response', message: 'Lead into altar/prayer response moment', priority: 'normal', color: 'emerald' },
  { id: 'qp-6', label: 'Finish Segment', message: 'Transition to next item now', priority: 'urgent', color: 'rose' },
];

export function getMostRecentMonday(): string {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday
  const diff = (day + 6) % 7; // days since last Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().split('T')[0];
}

const CHANNEL_NAME = 'kids_church_service_hub_channel';


export function useServiceSync(activeRoleProp: Role = 'admin') {
  // Authentication & Role State
  const [authUser, setAuthUser] = useState<AuthUser>(() => getStoredAuthUser());

  // Registered Accounts State (Supabase / Local DB)
  const [registeredAccounts, setRegisteredAccounts] = useState<AuthUser[]>(() => getStoredAccountsList());
  const [isSyncingAccounts, setIsSyncingAccounts] = useState<boolean>(true);
  const [accountsSyncError, setAccountsSyncError] = useState<string | null>(null);
  const [accountsFetchAttempted, setAccountsFetchAttempted] = useState<boolean>(false);

  // Multi-Class Hubs Master State
  const [allClassHubs, setAllClassHubs] = useState<Record<ClassId, ClassHubData>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CLASS_HUBS_KEY);
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

  // Active Service State for the current room (starts blank / unstarted)
  const [serviceState, setServiceState] = useState<ServiceState>(() => initialHubData?.serviceState || {
    serviceId: 'srv-' + Date.now(),
    serviceName: 'Sunday Service',
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    theme: '',
    currentSegmentId: null,
    targetEndTime: null,
    targetDurationSeconds: 0,
    isPaused: false,
    lastUpdated: new Date().toISOString(),
    currentSlideIndex: 1,
    totalSlides: 1,
    activeWorshipSongId: null,
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
  
  // Permanent Saved Prayer Requests (Never wiped on Monday reset)
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PRAYERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialHubData?.prayerRequests || [];
  });

  // Calendar Events (Configured by Class Admin)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CALENDAR_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Quick Stage Cues / Presets (Configured by Class Admin)
  const [quickStagePresets, setQuickStagePresets] = useState<QuickStagePreset[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_QUICK_PRESETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_QUICK_PRESETS;
  });

  // Active Emergency Alerts from Comms (Comms is the primary communicator)
  const [commsEmergencyAlerts, setCommsEmergencyAlerts] = useState<CommsEmergencyAlert[]>([]);

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
        localStorage.setItem(LOCAL_CLASS_HUBS_KEY, JSON.stringify(updatedAll));
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

  // Save prayer requests permanently
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PRAYERS_KEY, JSON.stringify(prayerRequests));
    } catch (e) {}
  }, [prayerRequests]);

  // Save calendar events
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CALENDAR_KEY, JSON.stringify(calendarEvents));
    } catch (e) {}
  }, [calendarEvents]);

  // Save quick presets
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_QUICK_PRESETS_KEY, JSON.stringify(quickStagePresets));
    } catch (e) {}
  }, [quickStagePresets]);

  // Service Templates Table State (Postgres `service_templates`)
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(() => getStoredTemplates());

  // Real-time Incident Alert Popup State
  const [activeIncidentAlert, setActiveIncidentAlert] = useState<IncidentLog | null>(null);

  // Director Real-time Screen Pop-up Announcement State
  const [activeDirectorAnnouncement, setActiveDirectorAnnouncement] = useState<DirectorAnnouncement | null>(null);

  // Presenter notification log (starts blank)
  const [notifications, setNotifications] = useState<{ id: string; to: string; message: string; timestamp: string }[]>([]);

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

  // Radio 'Roger / Copy That' dual-tone acknowledgment sound
  const playRogerBeep = useCallback(() => {
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.07); // D6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.16);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }, []);

  // Unified incoming broadcast handler for both same-machine BroadcastChannel and cross-device Supabase Realtime
  const handleIncomingBroadcast = useCallback((data: BroadcastChannelEvent) => {
    if (!data || data.senderId === clientIdRef.current) return;

    switch (data.event) {
      case 'STAGE_CUE': {
        const cue = data.payload as StageCueBroadcast;
        setActiveCues((prev) => [cue, ...prev.filter((c) => c.id !== cue.id)]);
        playCueSound(cue.priority);
        break;
      }
      case 'CUE_COPIED': {
        const { cueId, ack } = data.payload as { cueId: string; ack: StageCueCopyAck };
        if (cueId && ack) {
          setActiveCues((prev) =>
            prev.map((c) => {
              if (c.id === cueId) {
                const copies = c.copies || [];
                if (!copies.some((cp) => cp.userId === ack.userId)) {
                  return { ...c, copies: [...copies, ack] };
                }
              }
              return c;
            })
          );
          playRogerBeep();
        }
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
        setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)]);
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
      case 'DIRECTOR_ANNOUNCEMENT': {
        const announcement = data.payload as DirectorAnnouncement;
        setActiveDirectorAnnouncement(announcement);
        playCueSound(
          announcement.severity === 'emergency'
            ? 'emergency'
            : announcement.severity === 'important'
            ? 'urgent'
            : 'normal'
        );
        break;
      }
      case 'COMMS_EMERGENCY': {
        const alert = data.payload as CommsEmergencyAlert;
        setCommsEmergencyAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
        playCueSound('emergency');
        break;
      }
      case 'CALENDAR_UPDATE': {
        const events = data.payload as CalendarEvent[];
        setCalendarEvents(events);
        break;
      }
      case 'QUICK_PRESETS_UPDATE': {
        const presets = data.payload as QuickStagePreset[];
        setQuickStagePresets(presets);
        break;
      }
      case 'WEEKLY_RESET': {
        setServiceState({
          serviceId: 'srv-' + Date.now(),
          serviceName: 'Sunday Service',
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          theme: '',
          currentSegmentId: null,
          targetEndTime: null,
          targetDurationSeconds: 0,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
          currentSlideIndex: 1,
          totalSlides: 1,
          activeWorshipSongId: null,
          isEmergencyActive: false,
          activeEmergencyType: null,
        });
        setSegments((prev) => prev.map((s) => ({ ...s, status: 'upcoming' })));
        setChecklist((prev) => prev.map((item) => ({ ...item, isChecked: false })));
        setReviewData({
          ratings: { equipment: 0, timing: 0, communication: 0, kidsEngagement: 0, holySpiritFlow: 0, overall: 0 },
          whatWentWell: '',
          notes: '',
        });
        setActiveCues([]);
        setCommsEmergencyAlerts([]);
        setIncidents([]);
        setNotifications([]);
        break;
      }
      case 'AUTH_USER_CHANGE': {
        const payload = data.payload as any;
        if (payload?.action === 'deleted' && payload?.deletedId) {
          setRegisteredAccounts((prev) => prev.filter((a) => a.id !== payload.deletedId));
        } else if (payload?.action === 'saved' && payload?.user) {
          const user = payload.user as AuthUser;
          setRegisteredAccounts((prev) => [user, ...prev.filter((a) => a.id !== user.id)]);
        } else if (payload?.action === 'cleared_defaults' && Array.isArray(payload?.remaining)) {
          setRegisteredAccounts(payload.remaining);
        } else if (payload?.action === 'reset_defaults' && Array.isArray(payload?.accounts)) {
          setRegisteredAccounts(payload.accounts);
        }
        break;
      }
    }
  }, [playCueSound, playRogerBeep]);

  // Real Broadcast dispatch method sending over BOTH BroadcastChannel and Supabase Realtime Channel
  const dispatchBroadcast = useCallback(<T,>(event: BroadcastChannelEvent<T>['event'], payload: T) => {
    const message: BroadcastChannelEvent<T> = {
      type: 'broadcast',
      event,
      payload,
      sentAt: new Date().toISOString(),
      senderId: clientIdRef.current,
    };

    // 1. Same-device cross-tab / cross-window BroadcastChannel API
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Real cross-device Supabase Realtime Channel send: reaches phones, tablets, stage computers!
    sendSupabaseHubBroadcast(event, message).catch((err) => {
      console.warn(`[Supabase Realtime Broadcast Error for ${event}]:`, err);
    });
  }, []);

  // Initialize Broadcast Channel listener for instant cross-tab / cross-window sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event: MessageEvent<BroadcastChannelEvent>) => {
        handleIncomingBroadcast(event.data);
      };

      return () => {
        channel.close();
      };
    }
  }, [handleIncomingBroadcast]);

  // Connect to Supabase Realtime Broadcast Channel for true multi-device synchronization
  useEffect(() => {
    const unsubscribeHub = subscribeToSupabaseHubBroadcast((message) => {
      const rawPayload = message?.payload as any;
      const eventName = rawPayload?.event || message?.event;
      const senderId = rawPayload?.senderId;

      // Ignore echoes from ourselves
      if (senderId && senderId === clientIdRef.current) {
        return;
      }

      // Handle payload whether wrapped in BroadcastChannelEvent or sent as direct payload
      const eventPayload = rawPayload?.payload !== undefined ? rawPayload.payload : rawPayload;

      const normalizedEvent: BroadcastChannelEvent = {
        type: 'broadcast',
        event: eventName,
        payload: eventPayload,
        sentAt: rawPayload?.sentAt || new Date().toISOString(),
        senderId: senderId || 'remote-peer',
      };

      if (normalizedEvent.event) {
        handleIncomingBroadcast(normalizedEvent);
      }
    });

    return () => {
      unsubscribeHub();
    };
  }, [handleIncomingBroadcast]);

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
    if (segments.length === 0) return null;
    return segments.find((s) => s.id === serviceState.currentSegmentId) || segments[0] || null;
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

  // Acknowledge a stage cue or message by saying "Copy That"
  const acknowledgeCopyCue = useCallback(
    (cueId: string) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const ack: StageCueCopyAck = {
        userId: authUser.id || `usr_${Date.now()}`,
        userName: authUser.name || 'Team Member',
        userRole: authUser.role || activeRole,
        copiedAt: timeStr,
      };

      setActiveCues((prev) =>
        prev.map((c) => {
          if (c.id === cueId) {
            const copies = c.copies || [];
            if (!copies.some((cp) => cp.userId === ack.userId)) {
              return { ...c, copies: [...copies, ack] };
            }
          }
          return c;
        })
      );

      // Sync to all class hubs storage
      setAllClassHubs((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((cid) => {
          const classHub = updated[cid as ClassId];
          if (classHub && classHub.activeCues) {
            updated[cid as ClassId] = {
              ...classHub,
              activeCues: classHub.activeCues.map((c) => {
                if (c.id === cueId) {
                  const copies = c.copies || [];
                  if (!copies.some((cp) => cp.userId === ack.userId)) {
                    return { ...c, copies: [...copies, ack] };
                  }
                }
                return c;
              }),
            };
          }
        });
        return updated;
      });

      dispatchBroadcast('CUE_COPIED', { cueId, ack });
      playRogerBeep();
    },
    [authUser, activeRole, dispatchBroadcast, playRogerBeep]
  );

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
        segmentId: currentSegment?.id || 'live-service',
        segmentTitle: currentSegment?.title || 'Live Service',
        adjustmentMinutes,
        newTargetEndTime: newTargetIso,
        reason: reason || 'Holy Spirit Flow Adjustment',
        notifications: {
          presenter: `${currentSegment?.title || 'Current moment'} ${action === 'extend' ? `extended by +${adjustmentMinutes} mins` : 'adjusted'}. New target countdown updated!`,
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
    setAuthUser(newUser);
    saveStoredAuthUser(newUser);
    if (newUser.assignedClassId && newUser.assignedClassId !== 'all') {
      switchClassHub(newUser.assignedClassId);
    }
    return updated;
  }, [switchClassHub]);

  const promoteToClassAdmin = useCallback((userId: string) => {
    if (authUser.role !== 'director') {
      alert('Permission Denied: Only a Director can grant Class Admin rights.');
      return registeredAccounts;
    }
    const updated = updateAccountAdminStatus(userId, true, authUser.name || 'Pastor Hope (Director)');
    setRegisteredAccounts(updated);
    return updated;
  }, [authUser, registeredAccounts]);

  const revokeClassAdmin = useCallback((userId: string) => {
    if (authUser.role !== 'director') {
      alert('Permission Denied: Only a Director can revoke Class Admin rights.');
      return registeredAccounts;
    }
    const updated = updateAccountAdminStatus(userId, false, authUser.name || 'Pastor Hope (Director)');
    setRegisteredAccounts(updated);
    return updated;
  }, [authUser, registeredAccounts]);

  const deleteUserAccount = useCallback((userId: string) => {
    const targetUser = registeredAccounts.find((u) => u.id === userId);
    const updated = deleteAccount(userId);
    setRegisteredAccounts(updated);
    if (targetUser) {
      // Also remove from active room team members if present
      setTeamMembers((prev) => prev.filter((m) => m.id !== userId && m.name !== targetUser.name));
    }
    return updated;
  }, [registeredAccounts]);

  const clearAllDefaultAccounts = useCallback(() => {
    const updated = clearAllSeedAccounts();
    setRegisteredAccounts(updated);
    return updated;
  }, []);

  const resetDefaultAccounts = useCallback(() => {
    const updated = resetToSeedAccounts();
    setRegisteredAccounts(updated);
    return updated;
  }, []);

  // Supabase cloud sync & realtime listener for staff accounts
  useEffect(() => {
    let isMounted = true;
    setIsSyncingAccounts(true);
    setAccountsSyncError(null);

    // 1. Initial authoritative sync directly from Supabase
    dbSyncWithSupabase()
      .then((res) => {
        if (!isMounted) return;
        setIsSyncingAccounts(false);
        setAccountsFetchAttempted(true);
        if (res.synced) {
          setRegisteredAccounts(res.accounts);
          setAccountsSyncError(null);
        } else {
          // Fetch failed (network drop, offline, etc.)
          const errorMsg = res.error?.message || 'Could not connect to church database. Check internet connection.';
          setAccountsSyncError(errorMsg);
          if (res.accounts && res.accounts.length > 0) {
            setRegisteredAccounts(res.accounts);
          }
        }
      })
      .catch((err) => {
        console.warn('Initial cloud accounts sync error:', err);
        if (isMounted) {
          setIsSyncingAccounts(false);
          setAccountsFetchAttempted(true);
          setAccountsSyncError(err?.message || 'Network connection failed. Tap to retry.');
        }
      });

    // 2. Realtime listener for accounts table changes (cross-device adds/deletes/promotions)
    const unsubscribe = subscribeToSupabaseAccounts((updatedAccounts) => {
      if (isMounted && Array.isArray(updatedAccounts)) {
        const merged = dbSyncRemoteAccounts(updatedAccounts);
        setRegisteredAccounts(merged);
        setAccountsSyncError(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const syncAccountsWithCloud = useCallback(async () => {
    setIsSyncingAccounts(true);
    setAccountsSyncError(null);
    try {
      const res = await dbSyncWithSupabase();
      if (res.synced) {
        setRegisteredAccounts(res.accounts);
        setAccountsSyncError(null);
      } else {
        const errorMsg = res.error?.message || 'Could not connect to church database. Tap to retry.';
        setAccountsSyncError(errorMsg);
        if (res.accounts && res.accounts.length > 0) {
          setRegisteredAccounts(res.accounts);
        }
      }
      return res;
    } catch (e: any) {
      console.warn('Cloud sync error:', e);
      const msg = e?.message || 'Network connection failed';
      setAccountsSyncError(msg);
      return { synced: false, accounts: registeredAccounts, source: 'local' as const, error: { message: msg }, isEmptyConfirmed: false };
    } finally {
      setIsSyncingAccounts(false);
      setAccountsFetchAttempted(true);
    }
  }, [registeredAccounts]);

  const removeTeamMember = useCallback((memberId: string) => {
    const isDirector = authUser.role === 'director' || (authUser.role === 'admin' && authUser.assignedClassId === 'all');
    const isClassAdmin = authUser.isClassAdmin || authUser.role === 'admin';
    if (!isDirector && !isClassAdmin) {
      alert('Permission Denied: Only a Director or the assigned Class Admin can remove team members from this class.');
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, [authUser]);

  // Director Global Pop-up Announcement
  const sendDirectorAnnouncement = useCallback((
    title: string,
    message: string,
    severity: 'normal' | 'important' | 'emergency' = 'important',
    targetClassId: ClassId | 'all' = 'all'
  ) => {
    const announcement: DirectorAnnouncement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      senderName: authUser.name || 'Pastor Hope (Director)',
      senderRoleTitle: authUser.roleTitle || 'Kids Ministry Director',
      targetClassId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity,
    };
    setActiveDirectorAnnouncement(announcement);
    dispatchBroadcast('DIRECTOR_ANNOUNCEMENT', announcement);
    playCueSound(severity === 'emergency' ? 'emergency' : severity === 'important' ? 'urgent' : 'normal');
    return announcement;
  }, [authUser, dispatchBroadcast, playCueSound]);

  const dismissDirectorAnnouncement = useCallback(() => {
    setActiveDirectorAnnouncement(null);
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

  // Tech Checklist Admin Operations
  const addChecklistItem = useCallback((label: string, category: 'hardware' | 'audio' | 'media' | 'presentation' | 'general' = 'hardware') => {
    const newItem: PreServiceCheckItem = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label,
      statusText: 'Pending',
      isChecked: false,
      category,
    };
    setChecklist((prev) => {
      const next = [...prev, newItem];
      dispatchBroadcast('CHECKLIST_UPDATE', next);
      return next;
    });
    return newItem;
  }, [dispatchBroadcast]);

  const editChecklistItem = useCallback((id: string, updates: Partial<PreServiceCheckItem>) => {
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      dispatchBroadcast('CHECKLIST_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  const deleteChecklistItem = useCallback((id: string) => {
    setChecklist((prev) => {
      const next = prev.filter((item) => item.id !== id);
      dispatchBroadcast('CHECKLIST_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  // Timeline Segments Admin Operations
  const addSegment = useCallback((segmentData: {
    title: string;
    plannedStartTime?: string;
    durationMinutes: number;
    assignedLead?: string;
    assignedRole?: string;
    notes?: string;
    keyScripture?: string;
  }) => {
    setSegments((prev) => {
      const newOrder = prev.length + 1;
      const newSeg: ServiceSegment = {
        id: `seg_${Date.now()}_${newOrder}`,
        order: newOrder,
        title: segmentData.title,
        plannedStartTime: segmentData.plannedStartTime || '09:00 AM',
        durationMinutes: segmentData.durationMinutes || 15,
        assignedLead: segmentData.assignedLead || 'Leader',
        assignedRole: segmentData.assignedRole || 'Speaker',
        status: prev.length === 0 ? 'in_progress' : 'upcoming',
        notes: segmentData.notes || '',
        keyScripture: segmentData.keyScripture || undefined,
      };
      const next = [...prev, newSeg];
      if (prev.length === 0) {
        const durationSec = newSeg.durationMinutes * 60;
        const targetEnd = new Date(Date.now() + durationSec * 1000).toISOString();
        const updatedState: ServiceState = {
          ...serviceState,
          currentSegmentId: newSeg.id,
          targetEndTime: targetEnd,
          targetDurationSeconds: durationSec,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
        };
        setServiceState(updatedState);
        dispatchBroadcast('SERVICE_STATE_UPDATE', updatedState);
      }
      return next;
    });
  }, [serviceState, dispatchBroadcast]);

  const editSegment = useCallback((id: string, updates: Partial<ServiceSegment>) => {
    setSegments((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      return next;
    });
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setSegments((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      const reindexed = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
      if (serviceState.currentSegmentId === id) {
        const nextSeg = reindexed[0] || null;
        setServiceState((st) => ({
          ...st,
          currentSegmentId: nextSeg?.id || null,
          targetEndTime: nextSeg ? new Date(Date.now() + nextSeg.durationMinutes * 60 * 1000).toISOString() : null,
          targetDurationSeconds: nextSeg ? nextSeg.durationMinutes * 60 : 0,
        }));
      }
      return reindexed;
    });
  }, [serviceState.currentSegmentId]);

  // Calendar Admin Operations
  const addCalendarEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `calevt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setCalendarEvents((prev) => {
      const next = [...prev, newEvent];
      dispatchBroadcast('CALENDAR_UPDATE', next);
      return next;
    });
    return newEvent;
  }, [dispatchBroadcast]);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) => {
      const next = prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt));
      dispatchBroadcast('CALENDAR_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents((prev) => {
      const next = prev.filter((evt) => evt.id !== id);
      dispatchBroadcast('CALENDAR_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  // Quick Stage Presets Admin Operations
  const addQuickStagePreset = useCallback((presetData: Omit<QuickStagePreset, 'id'>) => {
    const newPreset: QuickStagePreset = {
      ...presetData,
      id: `qp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setQuickStagePresets((prev) => {
      const next = [...prev, newPreset];
      dispatchBroadcast('QUICK_PRESETS_UPDATE', next);
      return next;
    });
    return newPreset;
  }, [dispatchBroadcast]);

  const updateQuickStagePreset = useCallback((id: string, updates: Partial<QuickStagePreset>) => {
    setQuickStagePresets((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      dispatchBroadcast('QUICK_PRESETS_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  const deleteQuickStagePreset = useCallback((id: string) => {
    setQuickStagePresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      dispatchBroadcast('QUICK_PRESETS_UPDATE', next);
      return next;
    });
  }, [dispatchBroadcast]);

  // Comms Emergency Dispatch (Comms is the primary communicator)
  const sendCommsEmergency = useCallback((target: 'tech' | 'presenter' | 'all', message: string) => {
    const alert: CommsEmergencyAlert = {
      id: `emerg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      target,
      message,
      senderName: authUser?.name ? `${authUser.name} (Comms)` : 'Comms Desk',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledged: false,
    };
    setCommsEmergencyAlerts((prev) => [alert, ...prev]);
    playCueSound('emergency');
    dispatchBroadcast('COMMS_EMERGENCY', alert);

    const newIncident: IncidentLog = {
      id: `inc_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `[COMMS URGENT -> ${target.toUpperCase()}]: ${message}`,
      status: 'open',
      severity: 'critical',
      reportedBy: authUser?.name ? `${authUser.name} (Comms)` : 'Comms Desk',
    };
    setIncidents((prev) => [newIncident, ...prev]);
    dispatchBroadcast('INCIDENT_ADDED', newIncident);
    return alert;
  }, [authUser?.name, dispatchBroadcast, playCueSound]);

  const acknowledgeCommsEmergency = useCallback((id: string) => {
    setCommsEmergencyAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Saved Prayer Requests Operations (Saved permanently)
  const addPrayerRequest = useCallback((text: string, category: 'team' | 'kids' | 'service' | 'general' = 'team', customAuthor?: string) => {
    const newReq: PrayerRequest = {
      id: `prayer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: customAuthor || authUser?.name || 'Leader',
      text,
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAnswered: false,
      category,
    };
    setPrayerRequests((prev) => [newReq, ...prev]);
    return newReq;
  }, [authUser?.name]);

  const togglePrayerAnswered = useCallback((id: string) => {
    setPrayerRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, isAnswered: !req.isAnswered } : req))
    );
  }, []);

  const deletePrayerRequest = useCallback((id: string) => {
    setPrayerRequests((prev) => prev.filter((req) => req.id !== id));
  }, []);

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

  const resetReview = useCallback(() => {
    setReviewData({
      ratings: { equipment: 0, timing: 0, communication: 0, kidsEngagement: 0, holySpiritFlow: 0, overall: 0 },
      whatWentWell: '',
      notes: '',
    });
  }, []);

  // Weekly Monday Reset (Every Monday state resets to clean slate)
  const resetWeeklyServiceState = useCallback(() => {
    setServiceState({
      serviceId: 'srv-' + Date.now(),
      serviceName: 'Sunday Service',
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      theme: '',
      currentSegmentId: null,
      targetEndTime: null,
      targetDurationSeconds: 0,
      isPaused: false,
      lastUpdated: new Date().toISOString(),
      currentSlideIndex: 1,
      totalSlides: 1,
      activeWorshipSongId: null,
      isEmergencyActive: false,
      activeEmergencyType: null,
    });
    setSegments((prev) => prev.map((s) => ({ ...s, status: 'upcoming' })));
    setChecklist((prev) => prev.map((item) => ({ ...item, isChecked: false })));
    setReviewData({
      ratings: { equipment: 0, timing: 0, communication: 0, kidsEngagement: 0, holySpiritFlow: 0, overall: 0 },
      whatWentWell: '',
      notes: '',
    });
    setActiveCues([]);
    setCommsEmergencyAlerts([]);
    setIncidents([]);
    setNotifications([]);

    try {
      localStorage.setItem(LOCAL_MONDAY_RESET_KEY, getMostRecentMonday());
    } catch (e) {}

    dispatchBroadcast('WEEKLY_RESET', null);
  }, [dispatchBroadcast]);

  // Check if today is Monday or past an un-reset Monday
  useEffect(() => {
    try {
      const currentMonday = getMostRecentMonday();
      const lastReset = localStorage.getItem(LOCAL_MONDAY_RESET_KEY);
      if (lastReset !== currentMonday) {
        resetWeeklyServiceState();
      }
    } catch (e) {
      console.warn('Weekly reset check error:', e);
    }
  }, [resetWeeklyServiceState]);

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
    acknowledgeCopyCue,
    holySpiritOverride,
    triggerEmergency,
    clearEmergency,
    setSlideIndex,
    toggleChecklistItem,
    markAllChecksDone,
    addChecklistItem,
    editChecklistItem,
    deleteChecklistItem,
    addSegment,
    editSegment,
    deleteSegment,
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    quickStagePresets,
    addQuickStagePreset,
    updateQuickStagePreset,
    deleteQuickStagePreset,
    commsEmergencyAlerts,
    sendCommsEmergency,
    acknowledgeCommsEmergency,
    setWorshipSong,
    startSegment,
    completeSegment,
    addIncident,
    resolveIncident,
    sendNotification,
    addPrayerRequest,
    togglePrayerAnswered,
    deletePrayerRequest,
    updateReview,
    resetReview,
    resetWeeklyServiceState,
    setLessonNotes,
    selectedClassId,
    switchClassHub,
    activeClassInfo,
    allClassesConfig: CLASSES_CONFIG,
    allClassHubs,
    registeredAccounts,
    isSyncingAccounts,
    accountsSyncError,
    accountsFetchAttempted,
    addNewAccount,
    deleteUserAccount,
    clearAllDefaultAccounts,
    resetDefaultAccounts,
    syncAccountsWithCloud,
    promoteToClassAdmin,
    revokeClassAdmin,
    removeTeamMember,
    activeDirectorAnnouncement,
    sendDirectorAnnouncement,
    dismissDirectorAnnouncement,
    broadcastCueToAllClasses,
    sendCueToClass,
  };
}
