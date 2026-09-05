import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { AuthUser } from '../types/hub';
import firebaseConfigData from '../../firebase-applet-config.json';

const FIREBASE_CONFIG = {
  projectId: firebaseConfigData.projectId || 'gen-lang-client-0297349205',
  appId: firebaseConfigData.appId || '1:504215512188:web:6e1d8d4db5a9b0445615f9',
  apiKey: firebaseConfigData.apiKey || 'AIzaSyBA6k7qsRwPN56Mb1yhdTfqszmBJFHTMwM',
  authDomain: firebaseConfigData.authDomain || 'gen-lang-client-0297349205.firebaseapp.com',
  storageBucket: firebaseConfigData.storageBucket || 'gen-lang-client-0297349205.firebasestorage.app',
  messagingSenderId: firebaseConfigData.messagingSenderId || '504215512188',
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId || 'ai-studio-kidschurchservic-754b5840-446a-42a1-81ee-62f054c11115',
};

const COLLECTION_STAFF_ACCOUNTS = 'staff_accounts';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(FIREBASE_CONFIG);
    }
  }
  return appInstance;
}

export function getFirestoreDb(): Firestore | null {
  try {
    if (!firestoreInstance) {
      const app = getFirebaseApp();
      // Connect to the specific firestoreDatabaseId provisioned for this project
      firestoreInstance = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
    }
    return firestoreInstance;
  } catch (error) {
    console.warn('Could not initialize Cloud Firestore client:', error);
    return null;
  }
}

/**
 * Check if Firebase is available and configured
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey);
}

/**
 * Save / Upsert an account directly into Firestore cloud database
 */
export async function saveAccountToFirestore(account: AuthUser): Promise<boolean> {
  try {
    const db = getFirestoreDb();
    if (!db) return false;

    const accountRef = doc(db, COLLECTION_STAFF_ACCOUNTS, account.id);
    const payload = {
      id: account.id,
      name: account.name || '',
      email: (account.email || '').toLowerCase(),
      role: account.role || 'volunteer',
      roleTitle: account.roleTitle || '',
      assignedClassId: account.assignedClassId || 'kb',
      phone: account.phone || '',
      whatsapp: account.whatsapp || '',
      avatarColor: account.avatarColor || 'from-purple-600 to-indigo-600',
      isClassAdmin: Boolean(account.isClassAdmin),
      pin: account.pin || '2026',
      isAdminPromotedBy: account.isAdminPromotedBy || null,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(accountRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('Failed to save account to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Delete an account permanently from Cloud Firestore
 */
export async function deleteAccountFromFirestore(accountId: string): Promise<boolean> {
  try {
    const db = getFirestoreDb();
    if (!db) return false;

    const accountRef = doc(db, COLLECTION_STAFF_ACCOUNTS, accountId);
    await deleteDoc(accountRef);
    return true;
  } catch (error) {
    console.warn('Failed to delete account from Cloud Firestore:', error);
    return false;
  }
}

/**
 * Update Class Admin rights in Cloud Firestore
 */
export async function updateAccountAdminInFirestore(
  userId: string,
  isClassAdmin: boolean,
  promotedBy?: string
): Promise<boolean> {
  try {
    const db = getFirestoreDb();
    if (!db) return false;

    const accountRef = doc(db, COLLECTION_STAFF_ACCOUNTS, userId);
    await updateDoc(accountRef, {
      isClassAdmin,
      isAdminPromotedBy: isClassAdmin ? (promotedBy || 'Director') : null,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('Failed to update admin role in Cloud Firestore:', error);
    return false;
  }
}

/**
 * Update Security PIN in Cloud Firestore
 */
export async function updateAccountPinInFirestore(userId: string, pin: string): Promise<boolean> {
  try {
    const db = getFirestoreDb();
    if (!db) return false;

    const accountRef = doc(db, COLLECTION_STAFF_ACCOUNTS, userId);
    await updateDoc(accountRef, {
      pin,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('Failed to update PIN in Cloud Firestore:', error);
    return false;
  }
}

/**
 * Fetch all accounts from Cloud Firestore
 */
export async function fetchAccountsFromFirestore(): Promise<AuthUser[] | null> {
  try {
    const db = getFirestoreDb();
    if (!db) return null;

    const colRef = collection(db, COLLECTION_STAFF_ACCOUNTS);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }

    const accounts: AuthUser[] = [];
    snap.forEach((d) => {
      const data = d.data();
      accounts.push({
        id: d.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'volunteer',
        roleTitle: data.roleTitle || '',
        assignedClassId: data.assignedClassId || 'kb',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        avatarColor: data.avatarColor || 'from-purple-600 to-indigo-600',
        isClassAdmin: Boolean(data.isClassAdmin),
        pin: data.pin || '2026',
        isAdminPromotedBy: data.isAdminPromotedBy || undefined,
        isAuthenticated: true,
      });
    });

    return accounts;
  } catch (error) {
    console.warn('Failed to fetch accounts from Cloud Firestore:', error);
    return null;
  }
}

/**
 * Real-time listener for team accounts in Cloud Firestore
 */
export function subscribeToFirestoreAccounts(
  callback: (accounts: AuthUser[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const db = getFirestoreDb();
    if (!db) {
      return () => {};
    }

    const colRef = collection(db, COLLECTION_STAFF_ACCOUNTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const accounts: AuthUser[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          accounts.push({
            id: d.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'volunteer',
            roleTitle: data.roleTitle || '',
            assignedClassId: data.assignedClassId || 'kb',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            avatarColor: data.avatarColor || 'from-purple-600 to-indigo-600',
            isClassAdmin: Boolean(data.isClassAdmin),
            pin: data.pin || '2026',
            isAdminPromotedBy: data.isAdminPromotedBy || undefined,
            isAuthenticated: true,
          });
        });
        callback(accounts);
      },
      (error) => {
        console.warn('Firestore accounts realtime subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to start Firestore subscription:', err);
    return () => {};
  }
}
