import type { Win, WinDraft } from './types';
import { variantFor } from './variation';

export const MAX_WIN_LENGTH = 500;

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // RFC 4122 v4 fallback for older browsers.
  const bytes = new Uint8Array(16);
  (globalThis.crypto ?? { getRandomValues: (b: Uint8Array) => b.map(() => Math.floor(Math.random() * 256)) }).getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function cleanText(text: string): string {
  return text.replace(/\s+\n/g, '\n').trim().slice(0, MAX_WIN_LENGTH);
}

export function createWin(draft: WinDraft, now = new Date(), id = newId()): Win {
  const stamp = now.toISOString();
  return {
    id,
    text: cleanText(draft.text),
    category: draft.category,
    date: draft.date,
    createdAt: stamp,
    updatedAt: stamp,
    flowerVariant: variantFor(id),
  };
}

/** Editing never touches the id or flower, so the flower keeps its look. */
export function editWin(win: Win, draft: WinDraft, now = new Date()): Win {
  return {
    ...win,
    text: cleanText(draft.text),
    category: draft.category,
    date: draft.date,
    updatedAt: now.toISOString(),
  };
}

/** Oldest first: by win date, then by when it was planted. */
export function compareWins(a: Win, b: Win): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

export function sortWins(wins: Win[]): Win[] {
  return [...wins].sort(compareWins);
}

export function upsertWin(wins: Win[], win: Win): Win[] {
  const exists = wins.some((w) => w.id === win.id);
  return sortWins(exists ? wins.map((w) => (w.id === win.id ? win : w)) : [...wins, win]);
}

export function removeWin(wins: Win[], id: string): Win[] {
  return wins.filter((w) => w.id !== id);
}
