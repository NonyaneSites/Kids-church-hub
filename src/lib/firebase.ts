import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AuthUser } from '../types/hub';

let dbInstance: Firestore | null = null;

export function getFirestoreDB(): Firestore | null {
  try {
    if (dbInstance) return dbInstance;
    if (!firebaseConfig || !firebaseConfig.projectId) {
      console.warn('Firebase config missing projectId');
      return null;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Connect to specific database if databaseId is specified
    if (firebaseConfig.firestoreDatabaseId) {
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      dbInstance = getFirestore(app);
    }

    return dbInstance;
  } catch (e) {
    console.error('Failed to initialize Firestore DB:', e);
    return null;
  }
}

const COLLECTION_STAFF_ACCOUNTS = 'staff_accounts';

/**
 * Save an account to Firestore cloud database
 */
export async function saveAccountToFirestore(user: AuthUser): Promise<boolean> {
  try {
    const db = getFirestoreDB();
    if (!db) return false;

    const accountDocRef = doc(db, COLLECTION_STAFF_ACCOUNTS, user.id);
    const payload = {
      id: user.id,
      name: user.name || '',
      email: (user.email || '').toLowerCase(),
      role: user.role || 'volunteer',
      roleTitle: user.roleTitle || '',
      assignedClassId: user.assignedClassId || 'all',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      avatarColor: user.avatarColor || 'from-blue-600 to-indigo-600',
      isClassAdmin: Boolean(user.isClassAdmin),
      pin: user.pin || '2026',
      isAdminPromotedBy: user.isAdminPromotedBy || null,
      updatedAt: new Date().toISOString(),
      createdAt: user.createdAt || new Date().toISOString(),
    };

    await setDoc(accountDocRef, payload, { merge: true });
    return true;
  } catch (e) {
    console.warn('Firestore save account notice:', e);
    return false;
  }
}

/**
 * Delete an account from Firestore cloud database
 */
export async function deleteAccountFromFirestore(userId: string): Promise<boolean> {
  try {
    const db = getFirestoreDB();
    if (!db) return false;

    const accountDocRef = doc(db, COLLECTION_STAFF_ACCOUNTS, userId);
    await deleteDoc(accountDocRef);
    return true;
  } catch (e) {
    console.warn('Firestore delete account notice:', e);
    return false;
  }
}

/**
 * Fetch all staff accounts from Firestore
 */
export async function fetchAccountsFromFirestore(): Promise<AuthUser[]> {
  try {
    const db = getFirestoreDB();
    if (!db) return [];

    const colRef = collection(db, COLLECTION_STAFF_ACCOUNTS);
    const snapshot = await getDocs(colRef);
    const list: AuthUser[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.id && data.email) {
        list.push({
          id: data.id,
          name: data.name || '',
          email: data.email,
          role: data.role || 'volunteer',
          roleTitle: data.roleTitle || '',
          assignedClassId: data.assignedClassId || 'all',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          avatarColor: data.avatarColor || 'from-blue-600 to-indigo-600',
          isClassAdmin: Boolean(data.isClassAdmin),
          pin: data.pin || '2026',
          isAdminPromotedBy: data.isAdminPromotedBy,
          createdAt: data.createdAt,
          isAuthenticated: true,
        });
      }
    });

    return list;
  } catch (e) {
    console.warn('Firestore fetch accounts notice:', e);
    return [];
  }
}

/**
 * Live real-time subscription to accounts from Firestore
 */
export function subscribeToFirestoreAccounts(onAccounts: (accounts: AuthUser[]) => void): () => void {
  try {
    const db = getFirestoreDB();
    if (!db) return () => {};

    const colRef = collection(db, COLLECTION_STAFF_ACCOUNTS);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: AuthUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.email) {
            list.push({
              id: data.id,
              name: data.name || '',
              email: data.email,
              role: data.role || 'volunteer',
              roleTitle: data.roleTitle || '',
              assignedClassId: data.assignedClassId || 'all',
              phone: data.phone || '',
              whatsapp: data.whatsapp || '',
              avatarColor: data.avatarColor || 'from-blue-600 to-indigo-600',
              isClassAdmin: Boolean(data.isClassAdmin),
              pin: data.pin || '2026',
              isAdminPromotedBy: data.isAdminPromotedBy,
              createdAt: data.createdAt,
              isAuthenticated: true,
            });
          }
        });

        if (list.length > 0) {
          onAccounts(list);
        }
      },
      (err) => {
        console.warn('Firestore accounts listener error:', err);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Firestore subscription failed:', e);
    return () => {};
  }
}
