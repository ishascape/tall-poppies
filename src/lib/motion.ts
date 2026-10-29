/**
 * Shared motion vocabulary. Every sequence reads from here so timings stay
 * consistent and reduced-motion can collapse them in one place.
 */
export const ease = {
  grow: [0.22, 1, 0.36, 1] as const,
  soft: [0.4, 0, 0.2, 1] as const,
  drop: [0.55, 0, 0.75, 0.3] as const,
};

export const spring = {
  gentle: { type: 'spring', stiffness: 120, damping: 18 } as const,
  bouncy: { type: 'spring', stiffness: 260, damping: 16 } as const,
  press: { type: 'spring', stiffness: 500, damping: 30 } as const,
};

/** Celebration timelines in seconds. First win is the long, magical one. */
export const CELEBRATION = {
  first: { drop: 0.5, settle: 0.2, grow: 0.85, open: 0.55, hold: 0.7 },
  later: { drop: 0.3, settle: 0.1, grow: 0.45, open: 0.3, hold: 0.35 },
  reduced: { drop: 0, settle: 0, grow: 0, open: 0, hold: 1.2 },
};

export type Timeline = (typeof CELEBRATION)['first'];

export function timelineTotal(t: Timeline): number {
  return t.drop + t.settle + t.grow + t.open + t.hold;
}

export const swayTransition = (duration = 6, delay = 0) => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
});
