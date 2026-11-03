import type { Preferences, Win } from './types';
import { WIN_CATEGORIES } from './types';
import { isISODate } from './dates';
import { hashString, isValidVariant, variantFor } from './variation';
import { MAX_WIN_LENGTH } from './wins';

/**
 * Versioned localStorage schema. Bump SCHEMA_VERSION and add a step to
 * `migrate` whenever the stored shape changes.
 */
export const STORAGE_KEY = 'tall-poppies';
export const SCHEMA_VERSION = 1;

export type StoredData = {
  version: typeof SCHEMA_VERSION;
  wins: Win[];
  preferences: Preferences;
};

export type LoadResult = {
  data: StoredData;
  /** Something unreadable was found and set aside rather than lost. */
  recovered: boolean;
  /** Data was readable but needed small repairs worth writing back. */
  repaired?: boolean;
};

export const emptyData = (): StoredData => ({
  version: SCHEMA_VERSION,
  wins: [],
  preferences: { welcomed: false },
});

/** Validate one stored win, repairing what can be repaired. */
export function parseWin(raw: unknown): Win | null {
  if (!raw || typeof raw !== 'object') return null;
  const w = raw as Record<string, unknown>;
  if (typeof w.id !== 'string' || !w.id) return null;
  if (typeof w.text !== 'string' || !w.text.trim()) return null;
  if (!isISODate(w.date)) return null;
  const createdAt = typeof w.createdAt === 'string' && !isNaN(Date.parse(w.createdAt)) ? w.createdAt : `${w.date}T12:00:00.000Z`;
  const updatedAt = typeof w.updatedAt === 'string' && !isNaN(Date.parse(w.updatedAt)) ? w.updatedAt : createdAt;
  const category = WIN_CATEGORIES.includes(w.category as never) ? (w.category as Win['category']) : undefined;
  return {
    id: w.id,
    text: w.text.slice(0, MAX_WIN_LENGTH),
    category,
    date: w.date,
    createdAt,
    updatedAt,
    // A damaged variant is regenerated from the id, which gives the same flower.
    flowerVariant: isValidVariant(w.flowerVariant) ? w.flowerVariant : variantFor(w.id),
  };
}

function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  // Pre-release builds stored a bare array of wins.
  if (Array.isArray(raw)) return { version: 1, wins: raw, preferences: { welcomed: raw.length > 0 } };
  return raw;
}

export function parseData(text: string | null): LoadResult {
  if (text == null) return { data: emptyData(), recovered: false };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { data: emptyData(), recovered: true };
  }
  if (!parsed || typeof parsed !== 'object') return { data: emptyData(), recovered: true };
  const obj = migrate(parsed as Record<string, unknown>);
  if (typeof obj.version === 'number' && obj.version > SCHEMA_VERSION) {
    // Written by a newer app version: read what we understand, keep the rest untouched on disk.
    console.warn('[tall-poppies] Data is from a newer version; reading compatible fields only.');
  }
  const rawWins = Array.isArray(obj.wins) ? obj.wins : [];
  const seen = new Set<string>();
  const wins: Win[] = [];
  let repaired = obj.version !== SCHEMA_VERSION;
  for (const r of rawWins) {
    const win = parseWin(r);
    if (win && !seen.has(win.id)) {
      seen.add(win.id);
      wins.push(win);
      if (!isValidVariant((r as Record<string, unknown>).flowerVariant)) repaired = true;
    }
  }
  const prefs = (obj.preferences && typeof obj.preferences === 'object' ? obj.preferences : {}) as Record<string, unknown>;
  const preferences: Preferences = {
    welcomed: prefs.welcomed === true || wins.length > 0,
    reflectionDismissedOn: isISODate(prefs.reflectionDismissedOn) ? prefs.reflectionDismissedOn : undefined,
  };
  const recovered = wins.length !== rawWins.length || !Array.isArray(obj.wins);
  return { data: { version: SCHEMA_VERSION, wins, preferences }, recovered, repaired: repaired || recovered };
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function safeStorage(): StorageLike | null {
  try {
    const s = globalThis.localStorage;
    const probe = '__tp_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** Fallback so the app still works (for this visit) when storage is blocked. */
const memory = new Map<string, string>();
const memoryStorage: StorageLike = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
};

export function getStorage(): StorageLike {
  return safeStorage() ?? memoryStorage;
}

export function loadData(storage: StorageLike = getStorage()): LoadResult {
  const text = storage.getItem(STORAGE_KEY);
  const result = parseData(text);
  if (result.recovered && text != null) {
    // Keep the unreadable original so nothing is silently destroyed.
    try {
      storage.setItem(`${STORAGE_KEY}:backup:${hashString(text).toString(36)}`, text);
    } catch {
      /* storage full; nothing more we can do */
    }
  }
  return result;
}

export function saveData(data: StoredData, storage: StorageLike = getStorage()): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
