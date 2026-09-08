import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { 
  Role, 
  AuthUser, 
  IncidentLog, 
  ServiceTemplate, 
  ServiceTemplateSegment,
  RealtimeIncidentEvent,
  BroadcastChannelEvent
} from '../types/hub';

// Storage keys for custom client-side Supabase configuration
const STORAGE_SUPABASE_URL_KEY = 'kch_custom_supabase_url';
const STORAGE_SUPABASE_KEY_KEY = 'kch_custom_supabase_anon_key';

// Default Supabase project credentials for CRC Kids Church Hub
export const DEFAULT_SUPABASE_URL = 'https://ifyhflqwdlgnqfryojxi.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_oOQnfQSz1hRmshsKyQK0WQ_vvtdldEO';

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing /rest/v1 or /rest/v1/ if user pasted full REST endpoint
  url = url.replace(/\/rest\/v1\/?$/, '');
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  return url;
}

/**
 * Resolve active Supabase URL & Anon Key:
 * 1. Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * 2. In-app localStorage credentials entered by user
 * 3. Default production CRC Kids Church Hub Supabase project
 */
export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isCustom: boolean;
} {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  let customUrl = '';
  let customKey = '';
  if (typeof window !== 'undefined') {
    try {
      customUrl = (localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || '').trim();
      customKey = (localStorage.getItem(STORAGE_SUPABASE_KEY_KEY) || '').trim();
    } catch (e) {}
  }

  const rawUrl = customUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = customKey || envKey || DEFAULT_SUPABASE_ANON_KEY;
  const url = sanitizeSupabaseUrl(rawUrl);
  const isCustom = Boolean(customUrl && customKey);
  const isConfigured = Boolean(url && anonKey && url.startsWith('http'));

  return {
    url,
    anonKey,
    isConfigured,
    isCustom,
  };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();
    if (!cleanUrl || !cleanKey) return false;

    localStorage.setItem(STORAGE_SUPABASE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_SUPABASE_KEY_KEY, cleanKey);
    // Reset singleton instance so client recreates with new credentials
    supabaseInstance = null;
    hubChannelInstance = null;
    return true;
  } catch (e) {
    console.warn('Failed to store custom Supabase config:', e);
    return false;
  }
}

export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);
    localStorage.removeItem(STORAGE_SUPABASE_KEY_KEY);
    supabaseInstance = null;
    hubChannelInstance = null;
  } catch (e) {}
}

let supabaseInstance: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  const clientKey = `${url}::${anonKey}`;
  if (!supabaseInstance || currentClientKey !== clientKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 15,
          },
        },
      });
      currentClientKey = clientKey;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

// -------------------------------------------------------------
// SUPABASE REALTIME BROADCAST HUB (CROSS-DEVICE COMMS)
// -------------------------------------------------------------
export const SUPABASE_HUB_CHANNEL_NAME = 'kids_church_hub_live';

let hubChannelInstance: RealtimeChannel | null = null;
let currentHubClientKey = '';
const hubListeners = new Set<(message: { event: string; payload: any }) => void>();

export function getSupabaseHubChannel(): RealtimeChannel | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { url, anonKey } = getSupabaseConfig();
  const clientKey = `${url}::${anonKey}`;

  if (hubChannelInstance && currentHubClientKey === clientKey) {
    return hubChannelInstance;
  }

  try {
    currentHubClientKey = clientKey;
    hubChannelInstance = supabase.channel(SUPABASE_HUB_CHANNEL_NAME, {
      config: {
        broadcast: {
          self: false,
          ack: true,
        },
      },
    });

    // Attach broadcast listener BEFORE calling .subscribe() to avoid lifecycle errors
    hubChannelInstance.on('broadcast', { event: '*' }, (message: { event: string; payload: any }) => {
      hubListeners.forEach((listener) => {
        try {
          listener(message);
        } catch (e) {
          console.warn('Error in hub broadcast listener:', e);
        }
      });
    });

    hubChannelInstance.subscribe((status: string) => {
      console.debug('[Supabase Realtime Hub] Subscription Status:', status);
    });

    return hubChannelInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase Hub Channel:', err);
    return null;
  }
}

/**
 * Subscribe to realtime broadcast events from other devices over the Supabase Hub
 */
export function subscribeToSupabaseHubBroadcast(
  onBroadcast: (message: { event: string; payload: any }) => void
): () => void {
  hubListeners.add(onBroadcast);
  // Ensure hub channel is initialized and connected
  getSupabaseHubChannel();

  return () => {
    hubListeners.delete(onBroadcast);
  };
}

/**
 * Broadcast an event over the shared Supabase Realtime channel.
 * Reaches all other connected devices across networks and browsers instantly!
 */
export async function sendSupabaseHubBroadcast<T>(event: string, payload: T): Promise<boolean> {
  const channel = getSupabaseHubChannel();
  if (!channel) {
    console.debug('[Supabase Broadcast Skipped]: Supabase client or channel not ready');
    return false;
  }

  try {
    const res = await channel.send({
      type: 'broadcast',
      event,
      payload,
    });
    return res === 'ok';
  } catch (err) {
    console.warn(`[Supabase Realtime Send Error for ${event}]:`, err);
    return false;
  }
}

// -------------------------------------------------------------
// POSTGRES TABLE SETUP SCRIPT FOR USER TO RUN IN SUPABASE SQL EDITOR
// -------------------------------------------------------------
export const SUPABASE_STAFF_ACCOUNTS_SQL = `-- ========================================================
-- CRC KIDS CHURCH HUB - STAFF ACCOUNTS TABLE & REALTIME POLICIES
-- Copy and run this script in your Supabase Project -> SQL Editor
-- ========================================================

-- 1. Create staff_accounts table with UNIQUE email constraint
CREATE TABLE IF NOT EXISTS public.staff_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'volunteer',
  role_title TEXT DEFAULT '',
  assigned_class_id TEXT DEFAULT 'kb',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  avatar_color TEXT DEFAULT 'from-purple-600 to-indigo-600',
  is_class_admin BOOLEAN DEFAULT FALSE,
  pin TEXT DEFAULT '',
  is_admin_promoted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure UNIQUE constraint on email if table was previously created without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_accounts_email_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.staff_accounts ADD CONSTRAINT staff_accounts_email_unique UNIQUE (email);
    EXCEPTION WHEN duplicate_table THEN
      -- Already exists or constraint name variation
    END;
  END IF;
END $$;

-- 2. Helpful indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_staff_accounts_email ON public.staff_accounts(email);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_role ON public.staff_accounts(role);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_class ON public.staff_accounts(assigned_class_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for Church production hub operations
DROP POLICY IF EXISTS "Allow all operations for staff_accounts" ON public.staff_accounts;
CREATE POLICY "Allow all operations for staff_accounts"
  ON public.staff_accounts
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_accounts;
`;

// -------------------------------------------------------------
// SUPABASE ACCOUNTS CLOUD CRUD METHODS
// -------------------------------------------------------------

export interface SupabaseRowAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  role_title?: string | null;
  assigned_class_id?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  avatar_color?: string | null;
  is_class_admin?: boolean | null;
  pin?: string | null;
  is_admin_promoted_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function mapRowToAuthUser(row: SupabaseRowAccount): AuthUser {
  return {
    id: row.id,
    name: row.name || 'Team Member',
    email: (row.email || '').toLowerCase().trim(),
    role: (row.role as Role) || 'volunteer',
    roleTitle: row.role_title || '',
    assignedClassId: (row.assigned_class_id as any) || 'kb',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    avatarColor: row.avatar_color || 'from-purple-600 to-indigo-600',
    isClassAdmin: Boolean(row.is_class_admin),
    pin: row.pin || '',
    isAdminPromotedBy: row.is_admin_promoted_by || undefined,
    isAuthenticated: true,
  };
}

export function mapAuthUserToRow(user: AuthUser): SupabaseRowAccount {
  return {
    id: user.id,
    name: user.name || 'Team Member',
    email: (user.email || '').toLowerCase().trim(),
    role: user.role || 'volunteer',
    role_title: user.roleTitle || '',
    assigned_class_id: user.assignedClassId || 'kb',
    phone: user.phone || '',
    whatsapp: user.whatsapp || '',
    avatar_color: user.avatarColor || 'from-purple-600 to-indigo-600',
    is_class_admin: Boolean(user.isClassAdmin),
    pin: user.pin || '',
    is_admin_promoted_by: user.isAdminPromotedBy || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all registered accounts from Supabase PostgreSQL
 */
export async function fetchAccountsFromSupabase(): Promise<AuthUser[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('staff_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch accounts error:', error);
      return null;
    }

    if (!data) return [];
    return (data as SupabaseRowAccount[]).map(mapRowToAuthUser);
  } catch (err) {
    console.warn('Supabase fetch accounts exception:', err);
    return null;
  }
}

/**
 * Save or update an account in Supabase with duplicate email prevention
 */
export async function saveAccountToSupabase(user: AuthUser): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client is not configured.' };

  try {
    const cleanEmail = (user.email || '').toLowerCase().trim();

    // Check if email already belongs to a different user ID
    if (cleanEmail) {
      const { data: existingAccounts, error: checkErr } = await supabase
        .from('staff_accounts')
        .select('id, email')
        .eq('email', cleanEmail);

      if (!checkErr && existingAccounts && existingAccounts.length > 0) {
        const conflict = existingAccounts.find((r) => r.id !== user.id);
        if (conflict) {
          return {
            success: false,
            error: `An account with email "${cleanEmail}" already exists. Please choose a unique email.`,
          };
        }
      }
    }

    const row = mapAuthUserToRow(user);
    const { error } = await supabase
      .from('staff_accounts')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
        return {
          success: false,
          error: `An account with email "${cleanEmail}" already exists. Please choose a unique email.`,
        };
      }
      console.warn('Supabase save account error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase save account exception:', err);
    return { success: false, error: err?.message || 'Failed to save account to Supabase' };
  }
}

/**
 * Delete an account strictly by its unique ID from Supabase
 */
export async function deleteAccountFromSupabase(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('staff_accounts')
      .delete()
      .eq('id', userId);

    if (error) {
      console.warn('Supabase delete account error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete account exception:', err);
    return false;
  }
}

/**
 * Update Class Admin rights in Supabase
 */
export async function updateAccountAdminInSupabase(
  userId: string,
  isClassAdmin: boolean,
  promotedBy?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('staff_accounts')
      .update({
        is_class_admin: isClassAdmin,
        is_admin_promoted_by: isClassAdmin ? (promotedBy || 'Director') : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.warn('Supabase update admin error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update admin exception:', err);
    return false;
  }
}

/**
 * Update PIN in Supabase
 */
export async function updateAccountPinInSupabase(userId: string, pin: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('staff_accounts')
      .update({
        pin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.warn('Supabase update pin error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update pin exception:', err);
    return false;
  }
}

/**
 * Sync all local accounts to Supabase (e.g. on initial connection)
 */
export async function syncAllAccountsToSupabase(
  accounts: AuthUser[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, count: 0, error: 'Supabase client is not configured.' };
  }

  try {
    if (accounts.length === 0) {
      return { success: true, count: 0 };
    }

    const rows = accounts.map(mapAuthUserToRow);
    const { error } = await supabase
      .from('staff_accounts')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Unknown sync failure' };
  }
}

/**
 * Test Supabase connection and verify table status
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
  accountsCount: number;
}> {
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();

  if (!config.isConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing.',
      tableExists: false,
      accountsCount: 0,
    };
  }

  try {
    const { data, error, count } = await supabase
      .from('staff_accounts')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      // If table doesn't exist yet in Supabase (Postgres 42P01: relation does not exist)
      if (error.code === '42P01' || error.message.includes('relation "public.staff_accounts" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project! Note: The table "staff_accounts" does not exist yet. Run the SQL script below to create it.',
          tableExists: false,
          accountsCount: 0,
        };
      }
      return {
        success: false,
        message: `Supabase Error (${error.code || 'query'}): ${error.message}`,
        tableExists: false,
        accountsCount: 0,
      };
    }

    const total = count ?? (data ? data.length : 0);
    return {
      success: true,
      message: `Successfully connected to Supabase! Table 'staff_accounts' is ready with ${total} account(s).`,
      tableExists: true,
      accountsCount: total,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || 'Network error'}`,
      tableExists: false,
      accountsCount: 0,
    };
  }
}

let accountsChannelInstance: RealtimeChannel | null = null;
const accountsListeners = new Set<(accounts: AuthUser[]) => void>();

/**
 * Realtime subscription to `staff_accounts` changes in Supabase.
 * Uses a safe shared subscriber registry to avoid "cannot add postgres_changes callbacks after subscribe()".
 */
export function subscribeToSupabaseAccounts(
  onUpdate: (accounts: AuthUser[]) => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  accountsListeners.add(onUpdate);

  if (!accountsChannelInstance) {
    try {
      const channelName = `staff_accounts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      accountsChannelInstance = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'staff_accounts',
          },
          async () => {
            const fresh = await fetchAccountsFromSupabase();
            if (fresh) {
              accountsListeners.forEach((listener) => {
                try {
                  listener(fresh);
                } catch (e) {
                  console.warn('Error in account realtime listener:', e);
                }
              });
            }
          }
        );

      accountsChannelInstance.subscribe((status: string) => {
        console.debug('[Supabase Realtime Accounts] Subscription Status:', status);
      });
    } catch (err) {
      console.warn('Failed to subscribe to Supabase realtime accounts:', err);
    }
  }

  return () => {
    accountsListeners.delete(onUpdate);
    if (accountsListeners.size === 0 && accountsChannelInstance) {
      try {
        supabase.removeChannel(accountsChannelInstance);
      } catch {}
      accountsChannelInstance = null;
    }
  };
}

// -------------------------------------------------------------
// DEFAULT PRE-CONFIGURED USERS & ROLES TABLE (SOUTH AFRICA CONTEXT)
// -------------------------------------------------------------
export const PRECONFIGURED_USERS: AuthUser[] = [
  {
    id: 'usr-director',
    email: 'director@crc.church',
    name: 'Pastor Hope',
    role: 'director',
    roleTitle: 'Ministry Director (Overall Oversight)',
    assignedClassId: 'all',
    avatarColor: 'from-amber-500 to-orange-600',
    phone: '+27 82 123 4567',
    whatsapp: '27821234567',
    pin: '7492',
    isAuthenticated: true,
  },
  {
    id: 'usr-class-admin',
    email: 'admin@crc.church',
    name: 'Class Lead Admin',
    role: 'admin',
    roleTitle: 'Kids Church Lead Admin',
    assignedClassId: 'all',
    avatarColor: 'from-purple-600 to-indigo-600',
    phone: '+27 82 234 5678',
    whatsapp: '27822345678',
    pin: '5813',
    isClassAdmin: true,
    isAuthenticated: true,
  },
  {
    id: 'usr-tech-lead',
    email: 'tech@crc.church',
    name: 'Thabo',
    role: 'tech',
    roleTitle: 'Technical Lead',
    assignedClassId: 'kb',
    avatarColor: 'from-blue-600 to-cyan-600',
    phone: '+27 82 345 6789',
    whatsapp: '27823456789',
    pin: '3924',
    isAuthenticated: true,
  },
  {
    id: 'usr-comms-lead',
    email: 'comms@crc.church',
    name: 'Nomsa',
    role: 'comms',
    roleTitle: 'Comms Desk Lead',
    assignedClassId: 'kb',
    avatarColor: 'from-emerald-600 to-teal-600',
    phone: '+27 82 456 7890',
    whatsapp: '27824567890',
    pin: '8165',
    isAuthenticated: true,
  },
  {
    id: 'usr-presenter-lead',
    email: 'presenter@crc.church',
    name: 'Sis Sarah',
    role: 'presenter',
    roleTitle: 'Lead Presenter & Storyteller',
    assignedClassId: 'kb',
    avatarColor: 'from-purple-600 to-pink-600',
    phone: '+27 82 567 8901',
    whatsapp: '27825678901',
    pin: '4207',
    isAuthenticated: true,
  },
];

import {
  dbGetAccounts,
  dbSaveAccount,
  dbDeleteAccount,
  dbClearDefaultAccounts,
  dbResetDefaultAccounts,
} from './database';

export function getStoredAccountsList(): AuthUser[] {
  return dbGetAccounts();
}

export function saveNewAccount(newUser: AuthUser): AuthUser[] {
  return dbSaveAccount(newUser);
}

export function deleteAccount(userId: string): AuthUser[] {
  return dbDeleteAccount(userId);
}

export function clearAllSeedAccounts(): AuthUser[] {
  return dbClearDefaultAccounts();
}

export function resetToSeedAccounts(): AuthUser[] {
  return dbResetDefaultAccounts();
}

// -------------------------------------------------------------
// DEFAULT SERVICE TEMPLATES
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
      if (parsed && parsed.email && parsed.role && parsed.isAuthenticated) {
        return {
          ...parsed,
          assignedClassId: parsed.assignedClassId || 'all',
        };
      }
    }
  } catch (e) {
    console.warn('Error reading stored auth user:', e);
  }
  return {
    id: 'unauthenticated',
    email: '',
    name: '',
    role: 'volunteer',
    roleTitle: 'Unauthenticated',
    assignedClassId: 'kb',
    avatarColor: 'from-gray-600 to-gray-800',
    isAuthenticated: false,
  };
}

export function saveStoredAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Error saving auth user:', e);
  }
}

// -------------------------------------------------------------
// SERVICE TEMPLATES STORAGE HELPERS
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

// Re-export persistent database accounts engine & status helper
export { 
  getDatabaseStatus, 
  updateAccountAdminStatus, 
  updateAccountPin,
  dbSyncWithSupabase,
} from './database';

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
