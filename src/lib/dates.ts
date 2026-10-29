/** Local calendar day as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as a local date (not UTC midnight). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function isISODate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISODate(s);
  return toISODate(d) === s;
}

/** "14 October" (adds the year when it isn't this year). */
export function formatDay(iso: string, now = new Date()): string {
  const d = parseISODate(iso);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  return new Intl.DateTimeFormat('en-GB', opts).format(d);
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(parseISODate(iso));
}

export function formatMonth(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(parseISODate(iso));
}

export function daysBetween(aISO: string, bISO: string): number {
  const ms = parseISODate(bISO).getTime() - parseISODate(aISO).getTime();
  return Math.round(ms / 86_400_000);
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Hello, night owl';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
