import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoJob, UserCredits } from '../types';

const KEYS = {
  HISTORY: '@bloom:history',
  CREDITS: '@bloom:credits',
} as const;

// ─── Video History ─────────────────────────────────────────────────────────────

export async function getHistory(): Promise<VideoJob[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? (JSON.parse(raw) as VideoJob[]) : [];
  } catch {
    return [];
  }
}

export async function upsertVideoJob(job: VideoJob): Promise<void> {
  const history = await getHistory();
  const idx = history.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    history[idx] = job;
  } else {
    history.unshift(job); // newest first
  }
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export async function deleteVideoJob(id: string): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter((j) => j.id !== id);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(filtered));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

// ─── Credits ───────────────────────────────────────────────────────────────────

export async function getCredits(): Promise<UserCredits> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CREDITS);
    return raw ? (JSON.parse(raw) as UserCredits) : { balance: 0, plan: 'free' };
  } catch {
    return { balance: 0, plan: 'free' };
  }
}

export async function setCredits(credits: UserCredits): Promise<void> {
  await AsyncStorage.setItem(KEYS.CREDITS, JSON.stringify(credits));
}

/**
 * Deduct credits. Returns false if balance is insufficient.
 */
export async function deductCredits(amount: number): Promise<boolean> {
  const credits = await getCredits();
  if (credits.balance < amount) return false;
  await setCredits({ ...credits, balance: credits.balance - amount });
  return true;
}

export async function addCredits(amount: number): Promise<void> {
  const credits = await getCredits();
  await setCredits({ ...credits, balance: credits.balance + amount });
}
