export const INK = '#2A241E';
export const POPPY = '#C7352B';
export const POPPY_DEEP = '#8F1F1C';
export const CORAL = '#E8775C';
export const GREEN = '#3E6A3A';
export const GREEN_DEEP = '#2C4F2B';
export const SAGE = '#A3B48E';
export const BLUSH = '#EBC7BA';
export const GOLD = '#C9A04A';
export const SOIL = '#6E4B36';
export const SOIL_DEEP = '#4E3324';
export const IVORY = '#F6EFE2';

/** Lighten (amt > 0) or darken (amt < 0) a hex colour by mixing toward white/black. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (target - c) * p);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Pivot SVG transforms around the element's local origin (Motion defaults to the box centre). */
export const PIVOT = { transformBox: 'view-box', originX: 0, originY: 0 } as const;
