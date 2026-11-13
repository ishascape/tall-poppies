import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { GREEN, GREEN_DEEP, INK, KEYLINE, MINT, PINK, POPPY, SAGE, SKY, WHITE, shade } from './palette';

/**
 * Layered storybook landscape. Each layer takes a share of the pointer
 * parallax so the garden has depth without moving the flowers themselves.
 */
/** Seigaiha (blue ocean waves) tile: overlapping rings, drawn back to front. */
function Seigaiha({ id, fill, line, size = 20 }: { id: string; fill: string; line: string; size?: number }) {
  const r = size;
  const centres = [
    [0, r / 2],
    [2 * r, r / 2],
    [r, r],
    [0, 1.5 * r],
    [2 * r, 1.5 * r],
    [r, 2 * r],
  ];
  return (
    <pattern id={id} width={2 * r} height={r} patternUnits="userSpaceOnUse">
      {centres.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={fill} />
          {[0.95, 0.7, 0.45, 0.2].map((k) => (
            <circle key={k} cx={cx} cy={cy} r={r * k} fill="none" stroke={line} strokeWidth={r * 0.06} />
          ))}
        </g>
      ))}
    </pattern>
  );
}

/**
 * Layered pop art landscape: flat sky with halftone dots, a vermilion sun,
 * inked clouds and hills, and a seigaiha wave meadow. Each layer takes a
 * share of the pointer parallax so the garden has depth without moving the
 * flowers themselves.
 */
export function GardenBackdrop({ px, seed = 0 }: { px: MotionValue<number>; seed?: number }) {
  const reduced = useReducedMotion();
  const far = useTransform(px, (v) => v * -6);
  const mid = useTransform(px, (v) => v * -12);
  const flip = seed % 2 === 1;
  const ink = { stroke: INK, strokeWidth: KEYLINE, vectorEffect: 'non-scaling-stroke' as const, strokeLinejoin: 'round' as const };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: SKY }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.55) 1.4px, transparent 1.8px)',
          backgroundSize: '11px 11px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
        }}
      />
      {/* Sun */}
      <div className="absolute" style={{ left: flip ? '14%' : '70%', top: '7%', width: '16%', aspectRatio: '1' }}>
        <svg viewBox="0 0 100 100" className="h-full w-full" overflow="visible">
          <circle cx="50" cy="50" r="48" fill="none" stroke={PINK} strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
          <circle cx="50" cy="50" r="38" fill={POPPY} {...ink} />
          <path d="M28,40 C32,30 40,24 50,22" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />
        </svg>
      </div>
      {/* Drifting clouds */}
      {[
        { top: '12%', w: '22%', d: 70, delay: 0 },
        { top: '26%', w: '15%', d: 95, delay: -40 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, width: c.w, left: 0 }}
          initial={{ x: '0%' }}
          animate={reduced ? undefined : { x: ['-30%', '560%'] }}
          transition={{ duration: c.d, repeat: Infinity, ease: 'linear', delay: c.delay }}
        >
          <svg viewBox="0 0 120 40" className="w-full" overflow="visible">
            <path
              d="M10,32 C2,32 2,20 12,20 C12,10 28,6 34,14 C38,4 58,2 62,14 C70,6 88,8 88,20 C100,18 108,32 96,32 Z"
              fill={WHITE}
              {...ink}
            />
            <path d="M40,22 C44,16 52,16 54,22" fill="none" stroke={SKY} strokeWidth={2} strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}
      {/* Far hills */}
      <motion.svg style={{ x: far }} className="absolute bottom-0 left-[-4%] h-[72%] w-[108%]" viewBox="0 0 400 200" preserveAspectRatio="none">
        <path
          d={flip ? 'M0,70 C60,40 120,62 190,50 C260,38 320,30 400,58 L400,200 L0,200Z' : 'M0,56 C70,30 140,52 210,44 C280,36 340,58 400,40 L400,200 L0,200Z'}
          fill={MINT}
          {...ink}
        />
        <path
          d={flip ? 'M0,96 C80,70 150,92 230,80 C300,70 350,84 400,76 L400,200 L0,200Z' : 'M0,90 C60,72 130,96 200,84 C270,72 330,96 400,82 L400,200 L0,200Z'}
          fill={SAGE}
          {...ink}
        />
      </motion.svg>
      {/* Mid meadow, patterned with seigaiha waves */}
      <motion.svg style={{ x: mid }} className="absolute bottom-0 left-[-6%] h-[58%] w-[112%]" viewBox="0 0 400 200" preserveAspectRatio="none">
        <defs>
          <Seigaiha id={`waves-${seed}`} fill={shade(GREEN, 0.15)} line={shade(GREEN, 0.4)} size={14} />
        </defs>
        <path d="M0,60 C90,40 170,66 250,52 C320,40 360,50 400,46 L400,200 L0,200Z" fill={`url(#waves-${seed})`} {...ink} />
        <path d="M0,110 C80,92 160,112 240,100 C310,90 360,104 400,98 L400,200 L0,200Z" fill={GREEN} {...ink} />
        {/* tiny distant poppies */}
        {Array.from({ length: 22 }, (_, i) => {
          const x = ((i * 53 + seed * 31) % 400) + 4;
          const y = 66 + ((i * 37) % 34);
          return <circle key={i} cx={x} cy={y} r={1.9} fill={i % 3 ? PINK : POPPY} stroke={INK} strokeWidth={0.6} />;
        })}
      </motion.svg>
      {/* Near ground the flowers stand in */}
      <svg className="absolute bottom-0 left-0 h-[36%] w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,18 C100,6 200,22 300,12 C350,8 380,12 400,10 L400,100 L0,100Z" fill={shade(GREEN, -0.12)} {...ink} />
        <path d="M0,58 C120,46 240,62 400,50 L400,100 L0,100Z" fill={GREEN_DEEP} {...ink} />
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
            stroke={i % 4 === 0 ? SAGE : i % 3 === 0 ? MINT : INK}
            strokeWidth={i % 4 === 0 || i % 3 === 0 ? 2 : 1.6}
            strokeLinecap="round"
          />
        );
      })}
    </motion.svg>
  );
}
