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
} from './supabase';

const DB_NAME = 'CRCKidsChurchDB';
const DB_VERSION = 1;
const STORE_ACCOUNTS = 'accounts';
const STORE_META = 'metadata';

const LOCAL_STORAGE_ACCOUNTS_KEY = 'crc_kids_church_accounts_db_v6';
const LOCAL_STORAGE_DELETED_KEY = 'crc_kids_church_deleted_accounts_v6';
const LOCAL_STORAGE_CLEARED_FLAG = 'crc_kids_church_seed_cleared_v6';

// Track deleted account IDs and emails permanently so they aren't accidentally revived
function getPermanentlyDeletedKeys(): { ids: string[]; emails: string[] } {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ids: Array.isArray(parsed.ids) ? parsed.ids : [],
        emails: Array.isArray(parsed.emails) ? parsed.emails : [],
      };
    }
  } catch (e) {
    console.warn('Error reading deleted keys:', e);
  }
  return { ids: [], emails: [] };
}

function savePermanentlyDeletedKey(id: string, email?: string): void {
  try {
    const current = getPermanentlyDeletedKeys();
    if (id && !current.ids.includes(id)) {
      current.ids.push(id);
    }
    if (email && !current.emails.includes(email.toLowerCase())) {
      current.emails.push(email.toLowerCase());
    }
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Error recording deleted key:', e);
  }
}

// -------------------------------------------------------------
// INDEXED-DB ASYNCHRONOUS DATABASE STORAGE ENGINE
// -------------------------------------------------------------
let idbInstance: IDBDatabase | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    if (idbInstance) {
      resolve(idbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ACCOUNTS)) {
        const store = db.createObjectStore(STORE_ACCOUNTS, { keyPath: 'id' });
        store.createIndex('email', 'email', { unique: false });
        store.createIndex('assignedClassId', 'assignedClassId', { unique: false });
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
 * Filters out any accounts that were deleted by the user.
 */
export function dbGetAccounts(): AuthUser[] {
  try {
    const isCleared = localStorage.getItem(LOCAL_STORAGE_CLEARED_FLAG) === 'true';
    const deleted = getPermanentlyDeletedKeys();
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
    }

    // Filter out any permanently deleted accounts
    const sanitized = accounts.filter(
      (a) => !deleted.ids.includes(a.id) && !deleted.emails.includes((a.email || '').toLowerCase())
    );

    // If cleaned list is different, update storage
    if (sanitized.length !== accounts.length) {
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(sanitized));
      syncToIndexedDB(sanitized);
    }

    return sanitized;
  } catch (e) {
    console.error('Error fetching accounts from database:', e);
    return [];
  }
}

/**
 * Insert or update an account in the database.
 * Persists to IndexedDB/localStorage AND syncs immediately to Supabase if configured.
 */
export function dbSaveAccount(user: AuthUser): AuthUser[] {
  try {
    const list = dbGetAccounts();
    const filtered = list.filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase());
    const updated = [user, ...filtered];

    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
    syncToIndexedDB(updated);

    // Sync to Supabase cloud database
    saveAccountToSupabase(user).then((success) => {
      if (success) {
        console.debug('Saved account to Supabase:', user.email);
      }
    });

    return updated;
  } catch (e) {
    console.error('Failed to save account to database:', e);
    return dbGetAccounts();
  }
}

/**
 * Permanently delete an account from the database.
 * Adds ID and email to the permanent deletion registry and deletes from Supabase.
 */
export function dbDeleteAccount(userId: string): AuthUser[] {
  try {
    const list = dbGetAccounts();
    const target = list.find((u) => u.id === userId);

    if (target) {
      savePermanentlyDeletedKey(target.id, target.email);
    } else {
      savePermanentlyDeletedKey(userId);
    }

    const updated = list.filter((u) => u.id !== userId && (!target || u.email.toLowerCase() !== target.email.toLowerCase()));
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
    syncToIndexedDB(updated);

    // Remove from Supabase cloud database
    deleteAccountFromSupabase(userId).then((success) => {
      if (success) {
        console.debug('Deleted account from Supabase:', userId);
      }
    });

    return updated;
  } catch (e) {
    console.error('Failed to delete account from database:', e);
    return dbGetAccounts();
  }
}

/**
 * Remove ALL default demo seed accounts from the database.
 */
export function dbClearDefaultAccounts(): AuthUser[] {
  try {
    localStorage.setItem(LOCAL_STORAGE_CLEARED_FLAG, 'true');

    PRECONFIGURED_USERS.forEach((pre) => {
      savePermanentlyDeletedKey(pre.id, pre.email);
      deleteAccountFromSupabase(pre.id);
    });

    const list = dbGetAccounts();
    const defaultIds = PRECONFIGURED_USERS.map((u) => u.id);
    const defaultEmails = PRECONFIGURED_USERS.map((u) => u.email.toLowerCase());

    const remaining = list.filter(
      (u) => !defaultIds.includes(u.id) && !defaultEmails.includes((u.email || '').toLowerCase())
    );

    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(remaining));
    syncToIndexedDB(remaining);

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
    localStorage.removeItem(LOCAL_STORAGE_DELETED_KEY);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(PRECONFIGURED_USERS));
    syncToIndexedDB(PRECONFIGURED_USERS);
    
    // Push seed accounts to Supabase
    syncAllAccountsToSupabase(PRECONFIGURED_USERS);
    return PRECONFIGURED_USERS;
  } catch (e) {
    console.error('Failed to reset default accounts:', e);
    return PRECONFIGURED_USERS;
  }
}

/**
 * Bidirectional sync between local storage and Supabase
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

    if (remoteAccounts && remoteAccounts.length > 0) {
      // Remote Supabase has accounts -> store locally as authoritative
      const deleted = getPermanentlyDeletedKeys();
      const sanitized = remoteAccounts.filter(
        (a) => !deleted.ids.includes(a.id) && !deleted.emails.includes((a.email || '').toLowerCase())
      );
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(sanitized));
      syncToIndexedDB(sanitized);
      return { synced: true, accounts: sanitized, source: 'supabase' };
    } else if (remoteAccounts && remoteAccounts.length === 0 && localAccounts.length > 0) {
      // Supabase table is empty, push existing local accounts to Supabase
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
  return updated;
}

// Aliases for unified import across modules
export const getStoredAccountsList = dbGetAccounts;
export const saveNewAccount = dbSaveAccount;
export const deleteAccount = dbDeleteAccount;
export const clearAllSeedAccounts = dbClearDefaultAccounts;
export const resetToSeedAccounts = dbResetDefaultAccounts;
