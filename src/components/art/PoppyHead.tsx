import { motion, type Transition } from 'motion/react';
import { INK, GOLD, shade, PIVOT } from './palette';

/**
 * A poppy in three-quarter view. Local origin is where the stem meets the
 * cup; the flower opens upward toward negative y. Each petal is its own
 * motion element so the bloom can unfold petal by petal.
 */

const BACK_PETALS = [
  'M0,-6 C-10,-8 -40,-18 -42,-40 C-44,-58 -26,-68 -10,-64 C-4,-62 -1,-56 0,-48 Z',
  'M0,-6 C-12,-8 -36,-14 -40,-30 Q-46,-36 -42,-44 Q-44,-54 -36,-60 Q-28,-68 -18,-66 Q-10,-68 -4,-62 L0,-48 Z',
  'M0,-6 C-8,-10 -30,-24 -32,-46 C-33,-62 -20,-72 -8,-68 C-3,-64 -1,-58 0,-50 Z',
  'M0,-6 C-14,-6 -48,-14 -50,-32 C-52,-48 -36,-58 -20,-56 C-10,-58 -3,-54 0,-46 Z',
];

const FRONT_PETALS = [
  'M0,0 C-8,0 -34,-6 -36,-24 C-37,-36 -26,-42 -14,-40 C-6,-39 -1,-36 3,-30 C4,-20 2,-8 0,0Z',
  'M0,0 C-10,0 -30,-6 -34,-18 Q-38,-24 -34,-30 Q-34,-38 -26,-40 Q-18,-44 -10,-40 Q-2,-40 3,-32 C4,-20 2,-8 0,0Z',
  'M0,0 C-6,-2 -26,-10 -28,-28 C-29,-40 -18,-46 -8,-44 C-2,-42 2,-38 3,-32 C4,-20 2,-8 0,0Z',
  'M0,0 C-12,0 -42,-4 -44,-20 C-45,-32 -32,-38 -18,-36 C-8,-36 -1,-34 3,-28 C4,-18 2,-8 0,0Z',
];

const BLOTCH = 'M1,-2 C-6,-3 -13,-8 -13,-15 C-10,-19 -4,-19 2,-14 Z';
const VEINS = ['M0,-2 Q-10,-14 -22,-30', 'M0,-2 Q-4,-18 -7,-36', 'M0,-2 Q-16,-8 -30,-18'];

export type PoppyHeadProps = {
  color: string;
  petalVariant?: number;
  /** Signature poppies get gold edging and a richer crown. */
  signature?: boolean;
  /** Animate the petals opening from a closed cup. */
  animateOpen?: boolean;
  delay?: number;
  duration?: number;
  outline?: boolean;
};

export function PoppyHead({
  color,
  petalVariant = 0,
  signature = false,
  animateOpen = false,
  delay = 0,
  duration = 0.8,
  outline = true,
}: PoppyHeadProps) {
  const v = Math.max(0, Math.min(3, petalVariant));
  const back = shade(color, -0.18);
  const deep = shade(color, -0.42);
  const pale = color.toLowerCase() === '#f2e4d3';
  const stroke = outline ? (pale ? shade(color, -0.45) : shade(color, -0.5)) : 'none';
  const edge = signature ? GOLD : stroke;
  const sw = signature ? 1.1 : 0.9;
  const t = (extra: number): Transition => ({ duration, delay: delay + extra, ease: [0.22, 1, 0.36, 1] });
  const init = animateOpen ? undefined : false;

  const petal = (d: string, fill: string, side: 1 | -1, closedRotate: number, extra: number, front: boolean) => (
    <motion.g
      style={PIVOT}
      initial={init ?? { rotate: closedRotate * side, scale: 0.35, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={t(extra)}
    >
      <g transform={side === -1 ? 'scale(-1 1)' : undefined}>
        <path d={d} fill={fill} stroke={edge} strokeWidth={sw} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {front && (
          <>
            <path d={BLOTCH} fill={pale ? shade(color, -0.3) : INK} opacity={pale ? 0.35 : 0.42} />
            {VEINS.map((vd) => (
              <path key={vd} d={vd} fill="none" stroke={deep} strokeWidth={0.7} opacity={0.35} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </>
        )}
        {!front && <path d="M0,-8 Q-14,-28 -18,-52" fill="none" stroke={deep} strokeWidth={0.7} opacity={0.3} vectorEffect="non-scaling-stroke" />}
      </g>
    </motion.g>
  );

  return (
    <g>
      {petal(BACK_PETALS[v], back, -1, -28, 0, false)}
      {petal(BACK_PETALS[v], back, 1, -28, 0.04, false)}
      {/* Crown: seed pod, stigma rays and a ring of stamens. */}
      <motion.g
        style={PIVOT}
        initial={init ?? { scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={t(0.08)}
      >
        <g transform="translate(0 -42)">
          {Array.from({ length: signature ? 16 : 11 }, (_, i) => {
            const a = (Math.PI * i) / ((signature ? 16 : 11) - 1);
            const x = -Math.cos(a) * (signature ? 15 : 13);
            const y = -Math.sin(a) * (signature ? 7 : 6) - 1;
            return (
              <g key={i}>
                <line x1={x * 0.55} y1={y * 0.4} x2={x} y2={y} stroke={INK} strokeWidth={0.7} opacity={0.75} vectorEffect="non-scaling-stroke" />
                <circle cx={x} cy={y} r={signature ? 1.6 : 1.3} fill={signature ? GOLD : INK} />
              </g>
            );
          })}
          <ellipse rx={signature ? 9 : 8} ry={signature ? 5.2 : 4.6} fill={signature ? '#3A3A1E' : '#35321C'} />
          <ellipse rx={signature ? 6 : 5} ry={2.2} cy={-1.2} fill={signature ? GOLD : '#8A8A4A'} opacity={0.85} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={0} y1={-1.2} x2={Math.cos((i / 6) * Math.PI * 2) * 5} y2={-1.2 + Math.sin((i / 6) * Math.PI * 2) * 2} stroke="#2E2A14" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </motion.g>
      {petal(FRONT_PETALS[v], color, -1, 24, 0.12, true)}
      {petal(FRONT_PETALS[v], shade(color, 0.04), 1, 24, 0.18, true)}
    </g>
  );
}
