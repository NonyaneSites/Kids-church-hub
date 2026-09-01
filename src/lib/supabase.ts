import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Role, 
  AuthUser, 
  IncidentLog, 
  ServiceTemplate, 
  ServiceTemplateSegment,
  RealtimeIncidentEvent 
} from '../types/hub';

// Environment variable retrieval
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// -------------------------------------------------------------
// DEFAULT PRE-CONFIGURED USERS & ROLES TABLE
// -------------------------------------------------------------
export const PRECONFIGURED_USERS: AuthUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@crc.church',
    name: 'Pastor Hope',
    role: 'admin',
    roleTitle: 'Kids Ministry Director / Admin',
    avatarColor: 'from-amber-500 to-orange-600',
    phone: '+1 (555) 019-2834',
    isAuthenticated: true,
  },
  {
    id: 'usr-tech-1',
    email: 'tech@crc.church',
    name: 'Thabo',
    role: 'tech',
    roleTitle: 'Tech & Systems Master',
    avatarColor: 'from-blue-500 to-cyan-600',
    phone: '+1 (555) 019-5512',
    isAuthenticated: true,
  },
  {
    id: 'usr-presenter-1',
    email: 'presenter@crc.church',
    name: 'Lebo',
    role: 'presenter',
    roleTitle: 'Lead Lesson Presenter',
    avatarColor: 'from-purple-500 to-indigo-600',
    phone: '+1 (555) 019-8821',
    isAuthenticated: true,
  },
  {
    id: 'usr-comms-1',
    email: 'comms@crc.church',
    name: 'Nomsa',
    role: 'comms',
    roleTitle: 'Communications Lead',
    avatarColor: 'from-emerald-500 to-teal-600',
    phone: '+1 (555) 019-4490',
    isAuthenticated: true,
  },
];

// -------------------------------------------------------------
// DEFAULT SERVICE TEMPLATES (POSTGRES `service_templates` TABLE)
// -------------------------------------------------------------
export const DEFAULT_SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'tmpl-dream-week-90',
    name: 'Dream Week Conference Session',
    description: 'High-energy 90-minute multi-segment conference flow with extended worship, interactive games, and altar response.',
    category: 'conference',
    targetDurationMinutes: 90,
    isDefault: true,
    createdBy: 'Pastor Hope',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-18T10:00:00.000Z',
    segments: [
      {
        id: 'ts-1',
        order: 1,
        title: 'Welcome & High-Five Hype',
        defaultDurationMinutes: 10,
        assignedRole: 'Admin',
        assignedLead: 'Pastor Hope',
        category: 'welcome',
        notes: 'High energy welcome music, introduce first-time kids, group cheer challenge',
      },
      {
        id: 'ts-2',
        order: 2,
        title: 'Praise & Worship (Action Songs)',
        defaultDurationMinutes: 20,
        assignedRole: 'Tech & Worship',
        assignedLead: 'Sarah',
        category: 'worship',
        notes: 'Full worship set with dance captains on stage',
      },
      {
        id: 'ts-3',
        order: 3,
        title: 'Memory Verse Challenge',
        defaultDurationMinutes: 15,
        assignedRole: 'Presenter',
        assignedLead: 'Lebo',
        category: 'scripture',
        keyScripture: '1 Timothy 5:22 (TPT)',
        notes: 'Junior vs Senior recite-off on visual LED screen',
      },
      {
        id: 'ts-4',
        order: 4,
        title: 'Offering & Generosity Moment',
        defaultDurationMinutes: 10,
        assignedRole: 'Host',
        assignedLead: 'Thabo',
        category: 'offering',
        notes: 'Animated giving video and bucket pass-around',
      },
      {
        id: 'ts-5',
        order: 5,
        title: 'Main Lesson & Drama Illustration',
        defaultDurationMinutes: 25,
        assignedRole: 'Presenter',
        assignedLead: 'Lebo',
        category: 'lesson',
        keyScripture: '1 Samuel 17:45-47',
        notes: 'Giant Ball challenge, interactive prop story',
      },
      {
        id: 'ts-6',
        order: 6,
        title: 'Altar Call & Ministry Time',
        defaultDurationMinutes: 10,
        assignedRole: 'Admin',
        assignedLead: 'Pastor Hope',
        category: 'ministry',
        notes: 'Soft instrumental synth, one-on-one prayer circles',
      },
    ],
  },
  {
    id: 'tmpl-sunday-regular-75',
    name: 'Standard Sunday Morning Service',
    description: 'Balanced 75-minute Sunday morning service structure with small group breakout.',
    category: 'sunday_regular',
    targetDurationMinutes: 75,
    isDefault: false,
    createdBy: 'Pastor Hope',
    createdAt: '2026-05-15T09:00:00.000Z',
    updatedAt: '2026-06-10T14:30:00.000Z',
    segments: [
      {
        id: 'ts-s1',
        order: 1,
        title: 'Welcome & Rules Rap',
        defaultDurationMinutes: 8,
        assignedRole: 'Admin',
        assignedLead: 'Pastor Hope',
        category: 'welcome',
        notes: 'Countdown clock on LED wall, welcoming new visitors',
      },
      {
        id: 'ts-s2',
        order: 2,
        title: 'Praise & Worship',
        defaultDurationMinutes: 15,
        assignedRole: 'Tech & Worship',
        assignedLead: 'Sarah',
        category: 'worship',
        notes: '2 fast songs + 1 deep worship reflection',
      },
      {
        id: 'ts-s3',
        order: 3,
        title: 'Offering & Kids News',
        defaultDurationMinutes: 7,
        assignedRole: 'Host',
        assignedLead: 'Thabo',
        category: 'offering',
        notes: 'Quick video announcement & giving cheer',
      },
      {
        id: 'ts-s4',
        order: 4,
        title: 'Memory Verse Drill',
        defaultDurationMinutes: 10,
        assignedRole: 'Presenter',
        assignedLead: 'Lebo',
        category: 'scripture',
        notes: 'Fill-in-the-blank slide cues',
      },
      {
        id: 'ts-s5',
        order: 5,
        title: 'Biblical Object Lesson',
        defaultDurationMinutes: 20,
        assignedRole: 'Presenter',
        assignedLead: 'Lebo',
        category: 'lesson',
        notes: 'Core scripture story with interactive visual aids',
      },
      {
        id: 'ts-s6',
        order: 6,
        title: 'Small Groups Breakout',
        defaultDurationMinutes: 15,
        assignedRole: 'Small Groups',
        assignedLead: 'Group Leaders',
        category: 'groups',
        notes: 'Worksheet activity and group prayer',
      },
    ],
  },
  {
    id: 'tmpl-family-service-60',
    name: 'Family Sunday & Kids Takeover',
    description: 'Fast-paced 60-minute family combined service featuring kids choir and family blessings.',
    category: 'family_service',
    targetDurationMinutes: 60,
    isDefault: false,
    createdBy: 'Pastor Hope',
    createdAt: '2026-06-05T11:00:00.000Z',
    updatedAt: '2026-06-12T16:00:00.000Z',
    segments: [
      {
        id: 'ts-f1',
        order: 1,
        title: 'Kids Choir Entrance & Welcome',
        defaultDurationMinutes: 10,
        assignedRole: 'All',
        assignedLead: 'Kids Choir',
        category: 'welcome',
        notes: 'High energy procession with flags and banner',
      },
      {
        id: 'ts-f2',
        order: 2,
        title: 'Family Praise & Motion Songs',
        defaultDurationMinutes: 15,
        assignedRole: 'Tech & Worship',
        assignedLead: 'Sarah',
        category: 'worship',
        notes: 'Parents and kids doing actions together',
      },
      {
        id: 'ts-f3',
        order: 3,
        title: 'Kids Skit / Scripture Recital',
        defaultDurationMinutes: 15,
        assignedRole: 'Presenter',
        assignedLead: 'Lebo',
        category: 'lesson',
        notes: 'Costumed presentation by junior class',
      },
      {
        id: 'ts-f4',
        order: 4,
        title: 'Family Tithes & Blessing',
        defaultDurationMinutes: 10,
        assignedRole: 'Admin',
        assignedLead: 'Pastor Hope',
        category: 'offering',
        notes: 'Pastoral blessing over children & parents',
      },
      {
        id: 'ts-f5',
        order: 5,
        title: 'Closing Praise & Refreshments',
        defaultDurationMinutes: 10,
        assignedRole: 'Admin',
        assignedLead: 'Pastor Hope',
        category: 'dismissal',
        notes: 'Ice lollies and photo booth in foyer',
      },
    ],
  },
];

// -------------------------------------------------------------
// LOCAL STORAGE KEYS (FOR ROBUST PERSISTENCE)
// -------------------------------------------------------------
const STORAGE_KEYS = {
  AUTH_USER: 'kch_current_auth_user',
  TEMPLATES: 'kch_service_templates_table',
  INCIDENTS: 'kch_incident_logs_table',
};

// -------------------------------------------------------------
// AUTHENTICATION & ROLE TABLE HELPERS
// -------------------------------------------------------------
export function getStoredAuthUser(): AuthUser {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email && parsed.role) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored auth user:', e);
  }
  // Default to Admin / Pastor Hope for seamless access
  return PRECONFIGURED_USERS[0];
}

export function saveStoredAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Error saving auth user:', e);
  }
}

// -------------------------------------------------------------
// SERVICE TEMPLATES STORAGE HELPERS (`service_templates` Postgres table)
// -------------------------------------------------------------
export function getStoredTemplates(): ServiceTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored templates:', e);
  }
  return DEFAULT_SERVICE_TEMPLATES;
}

export function saveStoredTemplates(templates: ServiceTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.warn('Error saving templates:', e);
  }
}

// -------------------------------------------------------------
// SUPABASE REALTIME HELPER FOR INCIDENT LOGS BROADCAST
// -------------------------------------------------------------
export function broadcastIncidentRealtime(event: RealtimeIncidentEvent): void {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const channel = supabase.channel('incident_logs_realtime');
      channel.send({
        type: 'broadcast',
        event: 'incident_event',
        payload: event,
      });
    } catch (err) {
      console.warn('Supabase realtime broadcast error:', err);
    }
  }
}
