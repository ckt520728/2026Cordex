/**
 * Local-first persistence. All training data stays on-device (AsyncStorage);
 * there is no backend and no account in the MVP. See CLAUDE.md "Data & privacy".
 *
 * If/when cloud sync is added, keep this module as the single storage seam so
 * the rest of the app never talks to a persistence backend directly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { SessionResult } from '@/metrics/types';

const SESSIONS_KEY = 'neuroplay.sessions.v1';
const PROFILE_KEY = 'neuroplay.profile.v1';

export interface UserProfile {
  displayName: string;
  /** Larger text / slower pacing for users who need it. */
  highSupportMode: boolean;
  createdAt: string;
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadSessions(): Promise<SessionResult[]> {
  const raw = await getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionResult[];
  } catch {
    return [];
  }
}

export async function appendSession(session: SessionResult): Promise<void> {
  const all = await loadSessions();
  all.push(session);
  await setItem(SESSIONS_KEY, JSON.stringify(all));
}

export async function clearAllData(): Promise<void> {
  await removeItems([SESSIONS_KEY, PROFILE_KEY]);
}

function webStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return window.localStorage ?? null;
}

async function getItem(key: string): Promise<string | null> {
  const storage = webStorage();
  if (storage) return storage.getItem(key);
  return AsyncStorage.getItem(key);
}

async function setItem(key: string, value: string): Promise<void> {
  const storage = webStorage();
  if (storage) {
    storage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function removeItems(keys: string[]): Promise<void> {
  const storage = webStorage();
  if (storage) {
    keys.forEach((key) => storage.removeItem(key));
    return;
  }
  await AsyncStorage.multiRemove(keys);
}
