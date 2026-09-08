import { AuthUser } from '../types/hub';
import { 
  PRECONFIGURED_USERS, 
  getSupabaseClient,
  isSupabaseConfigured,
  getSupabaseConfig,
  saveAccountToSupabase,
  deleteAccountFromSupabase,
  updateAccountAdminInSupabase,
  updateAccountPinInSupabase,
  fetchAccountsFromSupabase,
  syncAllAccountsToSupabase,
  sendSupabaseHubBroadcast,
} from './supabase';

const DB_NAME = 'CRCKidsChurchDB';
const DB_VERSION = 1;
const STORE_ACCOUNTS = 'accounts';
const STORE_META = 'metadata';

const LOCAL_STORAGE_ACCOUNTS_KEY = 'crc_kids_church_accounts_db_v6';
const LOCAL_STORAGE_CLEARED_FLAG = 'crc_kids_church_seed_cleared_v6';

// -------------------------------------------------------------
// INDEXED-DB ASYNCHRONOUS DATABASE STORAGE ENGINE
// -------------------------------------------------------------
let idbInstance: IDBDatabase | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
  if (idbInstance) return Promise.resolve(idbInstance);
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not supported in environment'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ACCOUNTS)) {
        db.createObjectStore(STORE_ACCOUNTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      idbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(idbInstance);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Persist all accounts to IndexedDB asynchronously
export async function syncToIndexedDB(accounts: AuthUser[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction([STORE_ACCOUNTS], 'readwrite');
    const store = tx.objectStore(STORE_ACCOUNTS);
    
    // Clear old records
    store.clear();
    
    // Insert all accounts
    for (const acc of accounts) {
      store.put(acc);
    }
  } catch (e) {
    console.debug('IndexedDB sync notice:', e);
  }
}

// -------------------------------------------------------------
// CORE ACCOUNTS DATABASE METHODS (INSTANT & PERSISTENT)
// -------------------------------------------------------------

/**
 * Retrieve accounts list from the database.
 */
export function dbGetAccounts(): AuthUser[] {
  try {
    const isCleared = localStorage.getItem(LOCAL_STORAGE_CLEARED_FLAG) === 'true';
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);

    let accounts: AuthUser[] = [];

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        accounts = parsed;
      }
    } else if (!isCleared) {
      // First boot: populate with initial preconfigured staff
      accounts = [...PRECONFIGURED_USERS];
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
      syncToIndexedDB(accounts);
    }

    return accounts;
  } catch (e) {
    console.error('Error fetching accounts from database:', e);
    return [];
  }
}

/**
 * Insert or update an account in the database.
 * Persists to IndexedDB/localStorage AND syncs immediately to Supabase.
 */
export function dbSaveAccount(user: AuthUser): AuthUser[] {
  try {
    const list = dbGetAccounts();
    // Match strictly by unique user ID
    const filtered = list.filter((u) => u.id !== user.id);
    const updated = [user, ...filtered];

    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
    syncToIndexedDB(updated);

    // Sync to Supabase cloud database
    saveAccountToSupabase(user).then((res) => {
      if (res.success) {
        console.debug('Saved account to Supabase:', user.email);
      } else {
        console.warn('Supabase save notice:', res.error);
      }
    });

    // Broadcast account update across real-time network
    sendSupabaseHubBroadcast('AUTH_USER_CHANGE', { action: 'saved', user }).catch(() => {});

    return updated;
  } catch (e) {
    console.error('Failed to save account to database:', e);
    return dbGetAccounts();
  }
}

/**
 * Server-Authoritative Account Deletion:
 * 1. Matches strictly by unique ID only (never by email).
 * 2. Directly deletes the row in Supabase.
 * 3. Removes from local storage and IndexedDB.
 * 4. Broadcasts deletion over Supabase Realtime channel so all other devices update immediately.
 */
export function dbDeleteAccount(userId: string): AuthUser[] {
  try {
    const list = dbGetAccounts();

    // Strictly filter out by ID only
    const updated = list.filter((u) => u.id !== userId);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
    syncToIndexedDB(updated);

    // Execute real DELETE against Supabase Postgres row
    deleteAccountFromSupabase(userId).then((success) => {
      if (success) {
        console.debug('Deleted account row from Supabase:', userId);
      }
    });

    // Broadcast deletion across all connected devices
    sendSupabaseHubBroadcast('AUTH_USER_CHANGE', { action: 'deleted', deletedId: userId }).catch(() => {});

    return updated;
  } catch (e) {
    console.error('Failed to delete account from database:', e);
    return dbGetAccounts();
  }
}

/**
 * Merge or replace remote accounts into the local database (Server-Authoritative)
 */
export function dbSyncRemoteAccounts(remoteAccounts: AuthUser[]): AuthUser[] {
  try {
    if (!Array.isArray(remoteAccounts) || remoteAccounts.length === 0) {
      return dbGetAccounts();
    }
    
    // Server is authoritative: save remote accounts list to local storage
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(remoteAccounts));
    syncToIndexedDB(remoteAccounts);
    return remoteAccounts;
  } catch (e) {
    console.warn('Error syncing remote accounts to local:', e);
    return dbGetAccounts();
  }
}

// Backward-compatible alias for existing imports
export const dbSyncFirestoreAccounts = dbSyncRemoteAccounts;

/**
 * Remove ALL default demo seed accounts from the database.
 */
export function dbClearDefaultAccounts(): AuthUser[] {
  try {
    localStorage.setItem(LOCAL_STORAGE_CLEARED_FLAG, 'true');

    const defaultIds = PRECONFIGURED_USERS.map((u) => u.id);
    PRECONFIGURED_USERS.forEach((pre) => {
      deleteAccountFromSupabase(pre.id);
    });

    const list = dbGetAccounts();
    const remaining = list.filter((u) => !defaultIds.includes(u.id));

    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(remaining));
    syncToIndexedDB(remaining);

    sendSupabaseHubBroadcast('AUTH_USER_CHANGE', { action: 'cleared_defaults', remaining }).catch(() => {});

    return remaining;
  } catch (e) {
    console.error('Failed to clear default accounts from database:', e);
    return [];
  }
}

/**
 * Reset back to default initial seed accounts.
 */
export function dbResetDefaultAccounts(): AuthUser[] {
  try {
    localStorage.removeItem(LOCAL_STORAGE_CLEARED_FLAG);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(PRECONFIGURED_USERS));
    syncToIndexedDB(PRECONFIGURED_USERS);
    
    // Push seed accounts to Supabase
    syncAllAccountsToSupabase(PRECONFIGURED_USERS);

    sendSupabaseHubBroadcast('AUTH_USER_CHANGE', { action: 'reset_defaults', accounts: PRECONFIGURED_USERS }).catch(() => {});

    return PRECONFIGURED_USERS;
  } catch (e) {
    console.error('Failed to reset default accounts:', e);
    return PRECONFIGURED_USERS;
  }
}

/**
 * Server-authoritative sync between local storage and Supabase:
 * Remote Supabase is the single source of truth.
 * Never re-upload an account that is missing from remote.
 */
export async function dbSyncWithSupabase(): Promise<{
  synced: boolean;
  accounts: AuthUser[];
  source: 'supabase' | 'local';
}> {
  if (!isSupabaseConfigured()) {
    return { synced: false, accounts: dbGetAccounts(), source: 'local' };
  }

  try {
    const remoteAccounts = await fetchAccountsFromSupabase();
    const localAccounts = dbGetAccounts();

    // 1. If remote Supabase returned accounts, remote is authoritative
    if (remoteAccounts && remoteAccounts.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(remoteAccounts));
      syncToIndexedDB(remoteAccounts);
      return { synced: true, accounts: remoteAccounts, source: 'supabase' };
    } 
    
    // 2. If remote table exists but has 0 records and local has seed/accounts, seed remote
    if (remoteAccounts && remoteAccounts.length === 0 && localAccounts.length > 0) {
      await syncAllAccountsToSupabase(localAccounts);
      return { synced: true, accounts: localAccounts, source: 'local' };
    }

    return { synced: false, accounts: localAccounts, source: 'local' };
  } catch (e) {
    console.warn('Supabase sync error:', e);
    return { synced: false, accounts: dbGetAccounts(), source: 'local' };
  }
}

/**
 * Get current database connection and storage status info.
 */
export function getDatabaseStatus(): {
  type: 'Supabase' | 'IndexedDB' | 'LocalStorage';
  status: 'connected' | 'local_fallback';
  totalAccounts: number;
  url?: string;
  isCustom?: boolean;
} {
  const accounts = dbGetAccounts();
  const config = getSupabaseConfig();
  if (config.isConfigured) {
    return {
      type: 'Supabase',
      status: 'connected',
      totalAccounts: accounts.length,
      url: config.url,
      isCustom: config.isCustom,
    };
  }
  const hasIDB = typeof window !== 'undefined' && 'indexedDB' in window;
  return {
    type: hasIDB ? 'IndexedDB' : 'LocalStorage',
    status: 'local_fallback',
    totalAccounts: accounts.length,
  };
}

/**
 * Promote or revoke Class Admin privileges for an account in the database.
 */
export function updateAccountAdminStatus(
  userId: string, 
  isClassAdmin: boolean, 
  promotedByName?: string
): AuthUser[] {
  const list = dbGetAccounts();
  const updated = list.map((u) => (u.id === userId ? { 
    ...u, 
    isClassAdmin,
    isAdminPromotedBy: isClassAdmin ? (promotedByName || 'Director') : undefined
  } : u));
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
  syncToIndexedDB(updated);

  updateAccountAdminInSupabase(userId, isClassAdmin, promotedByName);
  sendSupabaseHubBroadcast('AUTH_USER_CHANGE', { action: 'admin_updated', userId, isClassAdmin }).catch(() => {});
  return updated;
}

/**
 * Update security PIN for an account in the database.
 */
export function updateAccountPin(userId: string, pin: string): AuthUser[] {
  const list = dbGetAccounts();
  const updated = list.map((u) => (u.id === userId ? { ...u, pin } : u));
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
  syncToIndexedDB(updated);

  updateAccountPinInSupabase(userId, pin);
  sendSupabaseHubBroadcast('AUTH_USER_CHANGE', { action: 'pin_updated', userId }).catch(() => {});
  return updated;
}

// Aliases for unified import across modules
export const getStoredAccountsList = dbGetAccounts;
export const saveNewAccount = dbSaveAccount;
export const deleteAccount = dbDeleteAccount;
export const clearAllSeedAccounts = dbClearDefaultAccounts;
export const resetToSeedAccounts = dbResetDefaultAccounts;
