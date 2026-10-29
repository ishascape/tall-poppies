import type { FlowerVariant } from './types';

/** Poppy hues for ordinary garden flowers. The signature poppy has its own. */
export const FLOWER_COLORS = [
  '#D23A2E', // field red
  '#E8775C', // coral
  '#F09A7A', // apricot
  '#E6B0A3', // blush
  '#B8323F', // crimson
  '#F2E4D3', // ivory white
  '#E9A23B', // marigold
  '#9C3D5B', // plum
] as const;

/** FNV-1a string hash → 32-bit unsigned int. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32: small, fast, deterministic PRNG. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomFor(id: string, salt = ''): () => number {
  return seededRandom(hashString(id + salt));
}

/** The flower's look depends only on its win id, so it never changes across sessions. */
export function variantFor(id: string): FlowerVariant {
  const rand = randomFor(id, 'flower');
  // Weighted toward reds and corals so the garden still reads as poppies.
  const weights = [5, 4, 2, 2, 3, 1, 1, 1];
  const total = weights.reduce((a, b) => a + b, 0);
  let pick = rand() * total;
  let colorIndex = 0;
  for (; colorIndex < weights.length - 1; colorIndex++) {
    pick -= weights[colorIndex];
    if (pick < 0) break;
  }
  return {
    color: FLOWER_COLORS[colorIndex],
    height: round(0.15 + rand() * 0.85),
    petalVariant: Math.floor(rand() * 4),
    leafVariant: Math.floor(rand() * 4),
    bloomAngle: round(-16 + rand() * 32),
  };
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

export function isValidVariant(v: unknown): v is FlowerVariant {
  if (!v || typeof v !== 'object') return false;
  const f = v as Record<string, unknown>;
  return (
    typeof f.color === 'string' &&
    /^#[0-9a-f]{6}$/i.test(f.color) &&
    isNum(f.height, 0, 1) &&
    isInt(f.petalVariant, 0, 3) &&
    isInt(f.leafVariant, 0, 3) &&
    isNum(f.bloomAngle, -45, 45)
  );
}

const isNum = (n: unknown, lo: number, hi: number) => typeof n === 'number' && Number.isFinite(n) && n >= lo && n <= hi;
const isInt = (n: unknown, lo: number, hi: number) => isNum(n, lo, hi) && Number.isInteger(n);
