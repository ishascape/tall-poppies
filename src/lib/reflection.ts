import type { Win } from './types';
import { daysBetween } from './dates';
import { hashString } from './variation';

export const REFLECTION_MIN_WINS = 3;
export const REFLECTION_MIN_AGE_DAYS = 3;

/**
 * Picks a past win to resurface, purely from today's date and the wins
 * themselves: same answer all day, no randomness, nothing invented. It
 * shows on roughly three days out of four so it stays a gentle surprise.
 */
export function pickReflection(wins: Win[], today: string, dismissedOn?: string): Win | null {
  if (dismissedOn === today) return null;
  if (wins.length < REFLECTION_MIN_WINS) return null;
  const eligible = wins.filter((w) => daysBetween(w.date, today) >= REFLECTION_MIN_AGE_DAYS);
  if (eligible.length === 0) return null;
  if (hashString(`rest:${today}`) % 4 === 3) return null;
  return eligible[hashString(`pick:${today}`) % eligible.length];
}
