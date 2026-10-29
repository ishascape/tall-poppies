import { motion } from 'motion/react';
import type { FlowerVariant } from '../../lib/types';
import { Leaf } from './Leaf';
import { PoppyHead } from './PoppyHead';
import { Stem, pointOn, type StemCurve } from './Stem';
import { GREEN, PIVOT, shade } from './palette';

const LEAF_LAYOUTS: { t: number; side: 1 | -1; length: number }[][] = [
  [{ t: 0.26, side: -1, length: 26 }],
  [
    { t: 0.2, side: 1, length: 28 },
    { t: 0.46, side: -1, length: 22 },
  ],
  [
    { t: 0.14, side: -1, length: 30 },
    { t: 0.18, side: 1, length: 26 },
  ],
  [{ t: 0.36, side: 1, length: 24 }],
];

const HEAD_SCALE = 0.78;
const HEAD_ROOM = 60;

export function flowerGeometry(v: FlowerVariant) {
  const stemH = 70 + v.height * 90;
  const lean = v.bloomAngle * 0.55;
  const curve: StemCurve = {
    start: { x: 0, y: 0 },
    c1: { x: lean * 0.1, y: -stemH * 0.35 },
    c2: { x: lean * 0.85, y: -stemH * 0.7 },
    end: { x: lean, y: -stemH },
  };
  const viewHeight = stemH + HEAD_ROOM + 6;
  return { stemH, curve, viewHeight, viewBox: `-50 ${-(stemH + HEAD_ROOM)} 100 ${viewHeight}` };
}

export type GardenFlowerProps = {
  variant: FlowerVariant;
  /** Grow from the ground: stem draws, leaves unfurl, petals open. */
  animateIn?: boolean;
  /** Seconds for the whole grow sequence. */
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Render only the bloom, for small glyphs. */
  headOnly?: boolean;
  /** Adds transparent hit shapes so only the flower itself is clickable. */
  hitArea?: boolean;
};

export function GardenFlower({ variant, animateIn = false, duration = 1.2, delay = 0, className, style, headOnly = false, hitArea = false }: GardenFlowerProps) {
  const { curve, viewBox, stemH } = flowerGeometry(variant);
  const end = pointOn(curve, 1);
  const headRotate = end.angle + 90 + variant.bloomAngle * 0.4;
  const grow = duration * 0.55;

  if (headOnly) {
    return (
      <svg viewBox="-52 -76 104 84" className={className} style={style} aria-hidden="true">
        <g transform={`rotate(${variant.bloomAngle * 0.4})`}>
          <PoppyHead color={variant.color} petalVariant={variant.petalVariant} />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox={viewBox} className={className} style={style} aria-hidden="true" overflow="visible">
      <Stem curve={curve} width={2.6} animateIn={animateIn} delay={delay} duration={grow} color={shade(GREEN, (variant.height - 0.5) * 0.12)} />
      {LEAF_LAYOUTS[variant.leafVariant].map((l, i) => {
        const p = pointOn(curve, l.t);
        return (
          <Leaf
            key={i}
            x={p.x}
            y={p.y}
            length={l.length * (1.15 + variant.height * 0.35)}
            angle={l.side === -1 ? -150 : -30}
            color={i % 2 ? shade(GREEN, 0.1) : GREEN}
            animateIn={animateIn}
            delay={delay + grow * (0.3 + l.t * 0.6)}
            duration={duration * 0.35}
          />
        );
      })}
      <g transform={`translate(${end.x} ${end.y})`}>
        <motion.g
          style={PIVOT}
          initial={animateIn ? { rotate: headRotate - 30, scale: 0.4 } : false}
          animate={{ rotate: headRotate, scale: HEAD_SCALE }}
          transition={{ duration: duration * 0.45, delay: delay + grow * 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <PoppyHead
            color={variant.color}
            petalVariant={variant.petalVariant}
            animateOpen={animateIn}
            delay={delay + grow * 0.9}
            duration={duration * 0.4}
          />
        </motion.g>
      </g>
      {hitArea && (
        <g className="flower-hit" fill="transparent" stroke="transparent">
          <circle cx={end.x} cy={end.y - 26} r={34} />
          <path d={`M0,0 L${end.x},${end.y}`} strokeWidth={22} />
          <rect x={-14} y={-stemH * 0.6} width={28} height={stemH * 0.6} />
        </g>
      )}
    </svg>
  );
}
