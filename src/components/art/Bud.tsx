import { motion } from 'motion/react';
import { GREEN, INK, shade } from './palette';

/** A nodding, hairy poppy bud hanging along +y from its origin. A hint of petal shows at the seam. */
export function Bud({ size = 1, petal = '#C7352B', ripeness = 0.5 }: { size?: number; petal?: string; ripeness?: number }) {
  const hairs = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const x = Math.cos(a) * 9.5;
    const y = 17 + Math.sin(a) * 15.5;
    return { x, y, x2: x + Math.cos(a) * 3, y2: y + Math.sin(a) * 3 };
  });
  return (
    <g transform={`scale(${size})`}>
      <path d="M0,0 C0,2 0,3 0,4" stroke={GREEN} strokeWidth={3} />
      {hairs.map((h, i) => (
        <line key={i} x1={h.x} y1={h.y} x2={h.x2} y2={h.y2} stroke={GREEN} strokeWidth={0.7} opacity={0.6} strokeLinecap="round" />
      ))}
      <ellipse cx={0} cy={17} rx={9.5} ry={15.5} fill={shade(GREEN, 0.12)} stroke={INK} strokeOpacity={0.55} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {/* The seam where the sepals part, showing a sliver of red. */}
      <motion.path
        d={`M${-1 - ripeness * 2},6 C${-3 - ripeness * 3},16 ${-2 - ripeness * 3},26 0,32 C${2 + ripeness * 3},26 ${3 + ripeness * 3},16 ${1 + ripeness * 2},6 Z`}
        fill={petal}
        initial={false}
        animate={{ opacity: 0.35 + ripeness * 0.6 }}
      />
      <path d="M0,4 C-2,14 -1,24 0,32" fill="none" stroke={shade(GREEN, -0.3)} strokeWidth={0.8} opacity={0.6} vectorEffect="non-scaling-stroke" />
      <ellipse cx={-4} cy={11} rx={2} ry={5} fill="#fff" opacity={0.18} />
    </g>
  );
}
