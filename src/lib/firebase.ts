/**
 * Supabase Migration Shim
 * All database operations are now fully powered by Supabase.
 */

import { AuthUser } from '../types/hub';
import { dbSaveAccount, dbDeleteAccount, dbGetAccounts } from './database';
import { subscribeToSupabaseAccounts } from './supabase';

export function getFirestoreDB() {
  return null;
}

export async function saveAccountToFirestore(user: AuthUser): Promise<boolean> {
  await dbSaveAccount(user);
  return true;
}

export async function deleteAccountFromFirestore(userId: string): Promise<boolean> {
  await dbDeleteAccount(userId);
  return true;
}

export async function fetchAccountsFromFirestore(): Promise<AuthUser[]> {
  return await dbGetAccounts();
}

export function subscribeToFirestoreAccounts(onAccounts: (accounts: AuthUser[]) => void): () => void {
  return subscribeToSupabaseAccounts(onAccounts);
}
