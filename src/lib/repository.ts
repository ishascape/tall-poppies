import type { Preferences, Win } from './types';
import { loadData, saveData, type StoredData } from './storage';

/**
 * The seam for syncing later (e.g. Supabase). Screens talk to the provider,
 * the provider talks to a repository; swapping in a remote implementation
 * means writing one class, not touching UI. Methods are async for that reason.
 *
 * Privacy note for the future poppy field: wins are private by default.
 * Sharing will be an explicit, per-win choice stored alongside the win.
 */
export interface WinRepository {
  load(): Promise<{ wins: Win[]; preferences: Preferences; recovered: boolean; repaired?: boolean }>;
  saveAll(wins: Win[], preferences: Preferences): Promise<boolean>;
}

export class LocalWinRepository implements WinRepository {
  async load() {
    const { data, recovered, repaired } = loadData();
    return { wins: data.wins, preferences: data.preferences, recovered, repaired };
  }

  async saveAll(wins: Win[], preferences: Preferences) {
    const data: StoredData = { version: 1, wins, preferences };
    return saveData(data);
  }
}
