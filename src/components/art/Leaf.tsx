import { motion } from 'motion/react';
import { GREEN, GREEN_DEEP, INK, PIVOT, shade } from './palette';

/** Deeply lobed poppy leaf pointing along +x, base at the origin. Drawn at length 100. */
const LOBED =
  'M0,0 C14,-8 20,-20 30,-16 C33,-24 42,-26 48,-20 C52,-27 62,-26 66,-18 C72,-22 82,-18 84,-10 C92,-10 98,-4 100,0 C96,5 90,10 82,9 C78,17 68,19 63,13 C57,21 47,20 44,13 C37,19 28,16 27,9 C18,10 8,7 0,0Z';
/** Simple seed leaf (cotyledon) for sprouts. */
const COTYLEDON = 'M0,0 C18,-14 62,-20 100,-4 C70,14 26,14 0,0Z';
const RIB = 'M2,0 C30,-2 64,-2 96,0';

export type LeafProps = {
  x: number;
  y: number;
  length: number;
  /** Angle in degrees; 0 points right, negative tilts upward. */
  angle: number;
  kind?: 'lobed' | 'cotyledon';
  color?: string;
  /** Unfurl from the stem instead of appearing fully grown. */
  animateIn?: boolean;
  delay?: number;
  duration?: number;
  outline?: boolean;
};

export function Leaf({
  x,
  y,
  length,
  angle,
  kind = 'lobed',
  color = GREEN,
  animateIn = false,
  delay = 0,
  duration = 0.7,
  outline = true,
}: LeafProps) {
  const s = length / 100;
  const pointsLeft = Math.abs(angle) > 90;
  return (
    <motion.g initial={false} animate={{ x, y }} transition={{ duration, ease: [0.22, 1, 0.36, 1] }}>
      <motion.g
        style={PIVOT}
        initial={animateIn ? { rotate: angle + (pointsLeft ? 50 : -50), scale: 0 } : false}
        animate={{ rotate: angle, scale: 1 }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <g transform={`scale(${s} ${pointsLeft ? -s : s})`}>
          <path
            d={kind === 'lobed' ? LOBED : COTYLEDON}
            fill={color}
            stroke={outline ? INK : 'none'}
            strokeOpacity={0.55}
            strokeWidth={0.9}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path d={RIB} fill="none" stroke={shade(GREEN_DEEP, -0.1)} strokeWidth={0.8} opacity={0.5} vectorEffect="non-scaling-stroke" />
        </g>
      </motion.g>
    </motion.g>
  );
}
