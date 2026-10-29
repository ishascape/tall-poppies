import type { Win } from './types';
import { randomFor } from './variation';

/**
 * The garden is split into patches so it stays calm at any size. Inside a
 * patch, flowers sit in three depth rows; slot order is fixed so early
 * flowers spread out nicely instead of bunching at one edge.
 */
export const PATCH_CAPACITY = 28;

export type Row = { id: 'back' | 'middle' | 'front'; y: number; scale: number; count: number };

export const ROWS: readonly Row[] = [
  { id: 'back', y: 46, scale: 0.6, count: 10 },
  { id: 'middle', y: 27, scale: 0.8, count: 9 },
  { id: 'front', y: 8, scale: 1, count: 9 },
];

export type Slot = { x: number; y: number; scale: number; row: number };

const SLOTS: Slot[] = ROWS.flatMap((row, r) =>
  Array.from({ length: row.count }, (_, i) => {
    const offset = r % 2 === 0 ? 0 : 0.5;
    const span = 86;
    const x = 7 + ((i + 0.5 + offset * (r === 1 ? 0.6 : 0)) / row.count) * span;
    return { x, y: row.y, scale: row.scale, row: r };
  }),
);

/** Farthest-point ordering starting front-centre: deterministic and well spread. */
export const SLOT_ORDER: number[] = (() => {
  const order: number[] = [];
  const dist = (a: Slot, b: Slot) => Math.hypot(a.x - b.x, (a.y - b.y) * 2.4);
  let first = 0;
  let best = Infinity;
  SLOTS.forEach((s, i) => {
    const d = Math.abs(s.x - 50) + (s.row === 2 ? 0 : 100);
    if (d < best) {
      best = d;
      first = i;
    }
  });
  order.push(first);
  while (order.length < SLOTS.length) {
    let pick = -1;
    let pickScore = -1;
    SLOTS.forEach((s, i) => {
      if (order.includes(i)) return;
      const nearest = Math.min(...order.map((o) => dist(s, SLOTS[o])));
      // Gentle bias toward the front rows so small gardens feel close.
      const score = nearest + (s.row === 2 ? 6 : s.row === 1 ? 3 : 0);
      if (score > pickScore) {
        pickScore = score;
        pick = i;
      }
    });
    order.push(pick);
  }
  return order;
})();

export type PlacedFlower = {
  win: Win;
  x: number;
  y: number;
  scale: number;
  row: number;
  /** Paint order: back rows first, lower flowers on top. */
  z: number;
};

export type Patch = {
  index: number;
  flowers: PlacedFlower[];
  from: string;
  to: string;
};

/** Wins must be sorted oldest → newest. */
export function layoutGarden(wins: Win[]): Patch[] {
  const patches: Patch[] = [];
  for (let start = 0; start < wins.length; start += PATCH_CAPACITY) {
    const chunk = wins.slice(start, start + PATCH_CAPACITY);
    const flowers = chunk.map((win, i) => {
      const slot = SLOTS[SLOT_ORDER[i]];
      const rand = randomFor(win.id, 'place');
      const x = slot.x + (rand() - 0.5) * 5;
      const y = slot.y + (rand() - 0.5) * 4;
      return { win, x, y, scale: slot.scale, row: slot.row, z: Math.round(100 - y) };
    });
    patches.push({ index: patches.length, flowers, from: chunk[0].date, to: chunk[chunk.length - 1].date });
  }
  return patches;
}

export function patchIndexOf(wins: Win[], id: string): number {
  const i = wins.findIndex((w) => w.id === id);
  return i < 0 ? -1 : Math.floor(i / PATCH_CAPACITY);
}
