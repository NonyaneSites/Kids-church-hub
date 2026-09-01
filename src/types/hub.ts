export type Role = 'admin' | 'comms' | 'tech' | 'presenter';

export type SegmentStatus = 'completed' | 'in_progress' | 'upcoming';

export interface ServiceSegment {
  id: string;
  order: number;
  title: string;
  plannedStartTime: string; // e.g. "08:30 AM"
  durationMinutes: number;
  assignedLead: string;
  assignedRole: string;
  status: SegmentStatus;
  notes?: string;
  keyScripture?: string;
  slideRange?: [number, number];
}

export interface ServiceState {
  serviceId: string;
  serviceName: string;
  date: string;
  theme: string;
  currentSegmentId: string | null;
  /**
   * ZERO-STREAMING TIMER RULE:
   * State stores ONLY the targetEndTime ISO string and targetDurationSeconds.
   * Countdown calculations occur client-side locally using requestAnimationFrame / delta.
   */
  targetEndTime: string | null; // ISO 8601 string, e.g. "2026-09-01T09:15:00.000Z"
  targetDurationSeconds: number;
  isPaused: boolean;
  pausedRemainingSeconds?: number;
  lastUpdated: string;
  currentSlideIndex: number;
  totalSlides: number;
  activeWorshipSongId: string | null;
  isEmergencyActive: boolean;
  activeEmergencyType: EmergencyActionType | null;
}

export interface PreServiceCheckItem {
  id: string;
  label: string;
  statusText: string;
  isChecked: boolean;
  category?: 'hardware' | 'media' | 'audio' | 'general';
}

export interface WorshipSong {
  id: string;
  order: number;
  title: string;
  artist: string;
  duration: string; // "04:50"
  durationSeconds: number;
  isPlaying: boolean;
  key?: string;
  bpm?: number;
}

export type QuickMessageType = 
  | 'wrap_up'
  | 'slow_down'
  | 'speed_up'
  | 'mic_closer'
  | 'pray'
  | 'finish'
  | 'custom';

export interface StageCueBroadcast {
  id: string;
  type: QuickMessageType;
  title: string;
  message: string;
  senderRole: Role;
  senderName: string;
  timestamp: string;
  expiresAt: string;
  priority: 'normal' | 'urgent' | 'emergency';
  acknowledged?: boolean;
}

export type EmergencyActionType = 
  | 'play_instrumental'
  | 'mute_music'
  | 'mute_mic'
  | 'blank_screen'
  | 'show_crc_logo';

export interface EmergencyBroadcast {
  action: EmergencyActionType;
  isActive: boolean;
  triggeredBy: string;
  timestamp: string;
  message?: string;
}

export interface HolySpiritOverridePayload {
  action: 'extend' | 'shorten' | 'skip' | 'custom_message';
  segmentId: string;
  segmentTitle: string;
  adjustmentMinutes: number;
  newTargetEndTime: string; // ISO string
  reason?: string;
  notifications: {
    presenter: string;
    comms: string;
    tech: string;
  };
}

export interface IncidentLog {
  id: string;
  time: string;
  description: string;
  status: 'resolved' | 'investigating' | 'open';
  severity: 'low' | 'medium' | 'critical';
  resolvedAt?: string;
  reportedBy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  roleTitle: string;
  roleType: Role;
  avatarColor: string;
  isOnline: boolean;
  phone?: string;
}

export interface LessonNotesData {
  title: string;
  mainScripture: string;
  keyPoint: string;
  memoryVerse: string;
  illustrationGame: string;
  slidesCount: number;
  notes: string[];
}

export interface ServiceReviewData {
  ratings: {
    equipment: number;
    timing: number;
    communication: number;
    kidsEngagement: number;
    holySpiritFlow: number;
    overall: number;
  };
  whatWentWell: string;
  notes: string;
  submittedAt?: string;
}

export interface PrayerRequest {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isAnswered: boolean;
  category: 'team' | 'kids' | 'service' | 'general';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleTitle: string;
  avatarColor: string;
  phone?: string;
  isAuthenticated: boolean;
}

export interface ServiceTemplateSegment {
  id: string;
  order: number;
  title: string;
  defaultDurationMinutes: number;
  assignedRole: string;
  assignedLead?: string;
  category: 'welcome' | 'worship' | 'scripture' | 'offering' | 'lesson' | 'game' | 'groups' | 'ministry' | 'announcements' | 'dismissal' | 'custom';
  notes?: string;
  keyScripture?: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sunday_regular' | 'conference' | 'outreach' | 'family_service' | 'custom';
  targetDurationMinutes: number;
  segments: ServiceTemplateSegment[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RealtimeIncidentEvent {
  incident: IncidentLog;
  action: 'created' | 'updated' | 'resolved';
  triggeredBy: string;
  timestamp: string;
}

export interface BroadcastChannelEvent<T = unknown> {
  type: 'broadcast';
  event: 
    | 'STAGE_CUE'
    | 'SERVICE_STATE_UPDATE'
    | 'HOLY_SPIRIT_OVERRIDE'
    | 'EMERGENCY_OVERRIDE'
    | 'CHECKLIST_UPDATE'
    | 'SLIDE_CHANGE'
    | 'WORSHIP_CHANGE'
    | 'NOTIFICATION'
    | 'INCIDENT_ADDED'
    | 'SERVICE_TEMPLATES_UPDATE'
    | 'AUTH_USER_CHANGE';
  payload: T;
  sentAt: string;
  senderId: string;
}
