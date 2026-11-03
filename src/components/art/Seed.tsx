import { motion } from 'motion/react';
import { INK, SOIL_DEEP, GOLD } from './palette';

/** A plump storybook seed, centred on its origin. */
export function Seed({ size = 1, glint = true }: { size?: number; glint?: boolean }) {
  return (
    <g transform={`scale(${size})`}>
      <path
        d="M0,-11 C7,-10 10,-3 9,3 C8,9 3,12 -1,12 C-6,12 -10,7 -9,1 C-8,-6 -5,-11 0,-11Z"
        fill="#7A5236"
        stroke={INK}
        strokeOpacity={0.6}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <path d="M-3,-7 C1,-3 2,3 0,9" fill="none" stroke={SOIL_DEEP} strokeWidth={1} opacity={0.6} vectorEffect="non-scaling-stroke" />
      <path d="M3,-7 C5,-4 5,-1 4,1" fill="none" stroke="#C8A57E" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
      {glint && (
        <motion.path
          d="M12,-14 L13,-11 L16,-10 L13,-9 L12,-6 L11,-9 L8,-10 L11,-11Z"
          fill={GOLD}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '12px', originY: '-10px' }}
        />
      )}
    </g>
  );
}
