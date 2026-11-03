import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { GOLD, GREEN, INK, SAGE, shade } from './palette';

/**
 * Layered storybook landscape. Each layer takes a share of the pointer
 * parallax so the garden has depth without moving the flowers themselves.
 */
export function GardenBackdrop({ px, seed = 0 }: { px: MotionValue<number>; seed?: number }) {
  const reduced = useReducedMotion();
  const far = useTransform(px, (v) => v * -6);
  const mid = useTransform(px, (v) => v * -12);
  const flip = seed % 2 === 1;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F3E3CF" />
            <stop offset="55%" stopColor="#F7EEE1" />
            <stop offset="100%" stopColor="#EFE6D2" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#sky-${seed})`} />
      </svg>
      {/* Sun */}
      <div className="absolute" style={{ left: flip ? '18%' : '72%', top: '9%', width: '13%', aspectRatio: '1' }}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="40" fill={GOLD} opacity={0.22} />
          <circle cx="50" cy="50" r="28" fill={GOLD} opacity={0.3} />
          <circle cx="50" cy="50" r="47" fill="none" stroke={GOLD} strokeOpacity={0.4} strokeDasharray="1 6" strokeLinecap="round" />
        </svg>
      </div>
      {/* Drifting clouds */}
      {[
        { top: '12%', w: '22%', d: 70, delay: 0, from: '-25%' },
        { top: '24%', w: '15%', d: 95, delay: -40, from: '-20%' },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, width: c.w, left: 0 }}
          initial={{ x: '0%' }}
          animate={reduced ? undefined : { x: ['-30%', '560%'] }}
          transition={{ duration: c.d, repeat: Infinity, ease: 'linear', delay: c.delay }}
        >
          <svg viewBox="0 0 120 40" className="w-full">
            <path
              d="M10,32 C2,32 2,20 12,20 C12,10 28,6 34,14 C38,4 58,2 62,14 C70,6 88,8 88,20 C100,18 108,32 96,32 Z"
              fill="#FBF7EE"
              stroke={INK}
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          </svg>
        </motion.div>
      ))}
      {/* Far hills */}
      <motion.svg style={{ x: far }} className="absolute bottom-0 left-[-4%] h-[72%] w-[108%]" viewBox="0 0 400 200" preserveAspectRatio="none">
        <path
          d={flip ? 'M0,70 C60,40 120,62 190,50 C260,38 320,30 400,58 L400,200 L0,200Z' : 'M0,56 C70,30 140,52 210,44 C280,36 340,58 400,40 L400,200 L0,200Z'}
          fill={shade(SAGE, 0.42)}
        />
        <path
          d={flip ? 'M0,96 C80,70 150,92 230,80 C300,70 350,84 400,76 L400,200 L0,200Z' : 'M0,90 C60,72 130,96 200,84 C270,72 330,96 400,82 L400,200 L0,200Z'}
          fill={shade(SAGE, 0.24)}
        />
      </motion.svg>
      {/* Mid meadow */}
      <motion.svg style={{ x: mid }} className="absolute bottom-0 left-[-6%] h-[58%] w-[112%]" viewBox="0 0 400 200" preserveAspectRatio="none">
        <path d="M0,60 C90,40 170,66 250,52 C320,40 360,50 400,46 L400,200 L0,200Z" fill={shade(SAGE, 0.05)} />
        <path d="M0,110 C80,92 160,112 240,100 C310,90 360,104 400,98 L400,200 L0,200Z" fill={shade(GREEN, 0.38)} opacity={0.9} />
        {/* tiny distant poppies */}
        {Array.from({ length: 22 }, (_, i) => {
          const x = ((i * 53 + seed * 31) % 400) + 4;
          const y = 66 + ((i * 37) % 34);
          return <circle key={i} cx={x} cy={y} r={1.6} fill={i % 3 ? '#D9644F' : '#C7352B'} opacity={0.55} />;
        })}
      </motion.svg>
      {/* Near ground the flowers stand in */}
      <svg className="absolute bottom-0 left-0 h-[36%] w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,18 C100,6 200,22 300,12 C350,8 380,12 400,10 L400,100 L0,100Z" fill={shade(GREEN, 0.28)} />
        <path d="M0,58 C120,46 240,62 400,50 L400,100 L0,100Z" fill={shade(GREEN, 0.18)} />
      </svg>
    </div>
  );
}

/** Foreground grass blades layered in front of the flowers. */
export function GardenForeground({ px, seed = 0 }: { px: MotionValue<number>; seed?: number }) {
  const near = useTransform(px, (v) => v * 10);
  return (
    <motion.svg
      style={{ x: near }}
      className="pointer-events-none absolute bottom-[-2%] left-[-3%] h-[14%] w-[106%]"
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: 70 }, (_, i) => {
        const x = (i * 5.9 + ((i * 7 + seed * 13) % 5)) % 400;
        const h = 14 + ((i * 13 + seed) % 22);
        const lean = ((i * 17) % 11) - 5;
        return (
          <path
            key={i}
            d={`M${x},42 Q${x + lean * 0.4},${42 - h * 0.6} ${x + lean},${42 - h}`}
            fill="none"
            stroke={i % 4 === 0 ? SAGE : i % 3 === 0 ? shade(GREEN, -0.1) : GREEN}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        );
      })}
    </motion.svg>
  );
}
