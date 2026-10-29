import { motion } from 'motion/react';
import { GREEN, INK } from './palette';

export type Pt = { x: number; y: number };
export type StemCurve = { start: Pt; c1: Pt; c2: Pt; end: Pt };

export function stemPath({ start, c1, c2, end }: StemCurve): string {
  const f = (n: number) => n.toFixed(2);
  return `M${f(start.x)},${f(start.y)} C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(end.x)},${f(end.y)}`;
}

/** Point and tangent angle (degrees) along a cubic bezier, t in 0–1. */
export function pointOn({ start, c1, c2, end }: StemCurve, t: number): Pt & { angle: number } {
  const mt = 1 - t;
  const x = mt ** 3 * start.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t ** 3 * end.x;
  const y = mt ** 3 * start.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t ** 3 * end.y;
  const dx = 3 * mt * mt * (c1.x - start.x) + 6 * mt * t * (c2.x - c1.x) + 3 * t * t * (end.x - c2.x);
  const dy = 3 * mt * mt * (c1.y - start.y) + 6 * mt * t * (c2.y - c1.y) + 3 * t * t * (end.y - c2.y);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

export type StemProps = {
  curve: StemCurve;
  width?: number;
  color?: string;
  /** Draw the stem from the ground up. */
  animateIn?: boolean;
  delay?: number;
  duration?: number;
  /** Fine hairs along the stem, a real poppy detail. */
  hairs?: number;
  outline?: boolean;
};

export function Stem({ curve, width = 4, color = GREEN, animateIn = false, delay = 0, duration = 0.9, hairs = 0, outline = true }: StemProps) {
  const d = stemPath(curve);
  const transition = { duration, delay, ease: [0.22, 1, 0.36, 1] as const };
  return (
    <g>
      {outline && (
        <motion.path
          d={d}
          initial={animateIn ? { pathLength: 0, d } : false}
          animate={{ pathLength: 1, d }}
          transition={transition}
          fill="none"
          stroke={INK}
          strokeOpacity={0.5}
          strokeWidth={width + 1.6}
          strokeLinecap="round"
        />
      )}
      <motion.path
        d={d}
        initial={animateIn ? { pathLength: 0, d } : false}
        animate={{ pathLength: 1, d }}
        transition={transition}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {hairs > 0 && (
        <motion.g
          initial={animateIn ? { opacity: 0 } : false}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.4, delay: delay + duration * 0.8 }}
        >
          {Array.from({ length: hairs }, (_, i) => {
            const t = 0.08 + (i / hairs) * 0.86;
            const p = pointOn(curve, t);
            const side = i % 2 === 0 ? 1 : -1;
            const a = ((p.angle + 90 * side - 35 * side) * Math.PI) / 180;
            const len = 4 + (i % 3);
            return (
              <line
                key={i}
                x1={p.x}
                y1={p.y}
                x2={p.x + Math.cos(a) * len}
                y2={p.y + Math.sin(a) * len}
                stroke={GREEN}
                strokeWidth={0.8}
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>
      )}
    </g>
  );
}
