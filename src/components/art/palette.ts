/** Japanese pop art palette: flat, saturated inks with a near-black keyline. */
export const INK = '#14101F';
export const POPPY = '#E60033';
export const POPPY_DEEP = '#A10021';
export const CORAL = '#FF4F9A';
export const GREEN = '#00A651';
export const GREEN_DEEP = '#006B3C';
export const SAGE = '#7EE05A';
export const BLUSH = '#FFB3D9';
export const GOLD = '#FFB800';
export const SOIL = '#2E3192';
export const SOIL_DEEP = '#1B1D6B';
export const IVORY = '#FFD93B';
export const SKY = '#4CC3FF';
export const PINK = '#FF4F9A';
export const MINT = '#2EE6C5';
export const WHITE = '#FFFFFF';

/** Keyline weights (screen pixels, used with non-scaling strokes). */
export const KEYLINE = 1.8;
export const KEYLINE_BOLD = 2.4;

/**
 * Saved wins store their flower colour from the original soft palette.
 * Map those to pop equivalents at render time so existing gardens restyle
 * without touching anyone's data. Unknown colours pass through.
 */
const POP_EQUIVALENT: Record<string, string> = {
  '#d23a2e': '#E60033', // field red → vermilion
  '#e8775c': '#FF6A00', // coral → orange
  '#f09a7a': '#FF4F9A', // apricot → hot pink
  '#e6b0a3': '#FF8AC4', // blush → bubblegum
  '#b8323f': '#C2006B', // crimson → magenta
  '#f2e4d3': '#FFFFFF', // ivory → white
  '#e9a23b': '#FFC400', // marigold → lemon
  '#9c3d5b': '#7B2FF7', // plum → violet
  '#c7352b': '#E60033',
};

export function popColor(hex: string): string {
  return POP_EQUIVALENT[hex.toLowerCase()] ?? hex;
}

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
