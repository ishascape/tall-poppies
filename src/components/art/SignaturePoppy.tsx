import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getGrowth, type GrowthStageId } from '../../lib/growth';
import { swayTransition } from '../../lib/motion';
import { Bud } from './Bud';
import { Leaf } from './Leaf';
import { PoppyHead } from './PoppyHead';
import { Seed } from './Seed';
import { Soil } from './Soil';
import { Stem, pointOn, type StemCurve } from './Stem';
import { CORAL, GOLD, GREEN, INK, PIVOT, POPPY, SAGE, shade } from './palette';

const BASE = { x: 160, y: 414 };

type LeafSpec = { t: number; side: 1 | -1; length: number; tilt?: number; kind?: 'lobed' | 'cotyledon' };

type StageArt = {
  /** Framing for this stage: the view pulls back as the poppy grows, so it is always the hero. */
  view: string;
  curve: StemCurve | null;
  width: number;
  leaves: LeafSpec[];
  head: 'none' | 'cotyledon' | 'bud' | 'bloom';
  headScale: number;
  halo: { x: number; y: number; r: number };
};

const curve = (c1: [number, number], c2: [number, number], end: [number, number]): StemCurve => ({
  start: BASE,
  c1: { x: c1[0], y: c1[1] },
  c2: { x: c2[0], y: c2[1] },
  end: { x: end[0], y: end[1] },
});

const ART: Record<GrowthStageId, StageArt> = {
  seed: { view: '60 262 200 196', curve: null, width: 0, leaves: [], head: 'none', headScale: 1, halo: { x: 160, y: 372, r: 72 } },
  sprout: {
    view: '45 222 230 236',
    curve: curve([160, 394], [152, 368], [162, 342]),
    width: 3.2,
    leaves: [
      { t: 1, side: -1, length: 42, tilt: -14, kind: 'cotyledon' },
      { t: 1, side: 1, length: 42, tilt: 14, kind: 'cotyledon' },
    ],
    head: 'cotyledon',
    headScale: 1,
    halo: { x: 160, y: 346, r: 84 },
  },
  bud: {
    view: '5 104 310 354',
    curve: curve([154, 326], [192, 166], [206, 204]),
    width: 4.2,
    leaves: [
      { t: 0.1, side: -1, length: 74 },
      { t: 0.18, side: 1, length: 66 },
    ],
    head: 'bud',
    headScale: 1.75,
    halo: { x: 186, y: 236, r: 90 },
  },
  bloom: {
    view: '0 4 320 456',
    curve: curve([148, 320], [176, 214], [164, 150]),
    width: 4.6,
    leaves: [
      { t: 0.1, side: -1, length: 80 },
      { t: 0.18, side: 1, length: 72 },
      { t: 0.38, side: -1, length: 56 },
    ],
    head: 'bloom',
    headScale: 1.3,
    halo: { x: 164, y: 116, r: 92 },
  },
  mature: {
    view: '-6 -34 332 494',
    curve: curve([146, 300], [180, 186], [160, 122]),
    width: 5,
    leaves: [
      { t: 0.08, side: -1, length: 86 },
      { t: 0.16, side: 1, length: 78 },
      { t: 0.34, side: -1, length: 60 },
      { t: 0.5, side: 1, length: 52 },
    ],
    head: 'bloom',
    headScale: 1.55,
    halo: { x: 160, y: 72, r: 100 },
  },
};

const FLOURISH_LEAVES: LeafSpec[] = [
  { t: 0.04, side: 1, length: 64, tilt: 18 },
  { t: 0.26, side: 1, length: 58 },
  { t: 0.62, side: -1, length: 40 },
];

export type SignaturePoppyProps = {
  count: number;
  className?: string;
  /** Play ambient motion (sway, glint). */
  ambient?: boolean;
  title?: string;
};

export function SignaturePoppy({ count, className, ambient = true, title }: SignaturePoppyProps) {
  const reduced = useReducedMotion() ?? false;
  const growth = getGrowth(count);
  const art = ART[growth.stage.id];

  // Grow only when wins were added during this visit. Opening the app, or
  // removing wins, never replays a sequence.
  const mounted = useRef(false);
  const prevCount = useRef(count);
  const grew = mounted.current && !reduced && count > prevCount.current;
  const shrank = mounted.current && count < prevCount.current;
  useEffect(() => {
    mounted.current = true;
    prevCount.current = count;
  }, [count]);

  const dur = grew ? 1 : 0;
  const sway = ambient && !reduced;
  const flourishes = growth.flourishes;
  const end = art.curve ? pointOn(art.curve, 1) : null;

  const leaves = [...art.leaves, ...(growth.stage.id === 'mature' && flourishes.has('leaves') ? FLOURISH_LEAVES : [])];

  return (
    <motion.svg
      viewBox={art.view}
      initial={false}
      animate={{ viewBox: art.view }}
      transition={{ duration: grew ? 1.4 : 0, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      role="img"
      aria-label={title ?? `Your signature poppy: ${growth.stage.name.toLowerCase()}`}
    >
      <defs>
        <radialGradient id="sp-halo">
          <stop offset="0%" stopColor={GOLD} stopOpacity={0.32} />
          <stop offset="70%" stopColor={GOLD} stopOpacity={0.12} />
          <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Golden halo: the mark of a signature poppy. */}
      <motion.g initial={false} animate={{ x: art.halo.x, y: art.halo.y }} transition={{ duration: grew ? 1.1 : 0, ease: [0.22, 1, 0.36, 1] }}>
        <motion.circle initial={false} animate={{ r: art.halo.r * 1.25 }} transition={{ duration: dur }} fill="url(#sp-halo)" />
        <motion.circle
          initial={false}
          animate={{ r: art.halo.r }}
          transition={{ duration: dur }}
          fill="none"
          stroke={GOLD}
          strokeOpacity={0.45}
          strokeWidth={1}
        />
        <motion.circle
          initial={false}
          animate={{ r: art.halo.r + 9, rotate: sway ? 360 : 0 }}
          transition={{ r: { duration: dur }, rotate: { duration: 160, repeat: Infinity, ease: 'linear' } }}
          fill="none"
          stroke={GOLD}
          strokeOpacity={0.5}
          strokeWidth={1.4}
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
      </motion.g>

      {growth.stage.id === 'mature' && flourishes.has('grasses') && <Grasses animateIn={grew} />}
      {growth.stage.id === 'mature' && flourishes.has('seedHeads') && <SeedHeads animateIn={grew} sway={sway} />}

      <motion.g key={shrank ? `quiet-${count}` : 'plant'} initial={shrank ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <g transform={`translate(${BASE.x} ${BASE.y})`}>
          <motion.g
            style={PIVOT}
            animate={sway ? { rotate: [-1.4, 1.6] } : { rotate: 0 }}
            transition={sway ? swayTransition(5.5) : { duration: 0.3 }}
          >
            <g transform={`translate(${-BASE.x} ${-BASE.y})`}>
              {growth.stage.id === 'mature' && flourishes.has('companionBud') && art.curve && (
                <SideStem from={pointOn(art.curve, 0.46)} to={{ x: 214, y: 232 }} animateIn={grew} kind="bud" />
              )}
              {growth.stage.id === 'mature' && flourishes.has('secondBloom') && art.curve && (
                <SideStem from={pointOn(art.curve, 0.3)} to={{ x: 92, y: 214 }} animateIn={grew} kind="bloom" />
              )}

              {art.curve && <Stem curve={art.curve} width={art.width} animateIn={grew && count === 1} duration={grew ? 1 : 0} hairs={growth.stageIndex >= 2 ? 16 : 0} />}

              {art.curve &&
                leaves.map((l, i) => {
                  const p = pointOn(art.curve!, l.t);
                  const angle = (l.side === -1 ? -160 : -20) + (l.tilt ?? 0) + (l.kind === 'cotyledon' ? 0 : l.side * -10);
                  return (
                    <Leaf
                      key={`${l.kind ?? 'lobed'}-${i}`}
                      x={p.x}
                      y={p.y}
                      length={l.length}
                      angle={angle}
                      kind={l.kind}
                      color={l.kind === 'cotyledon' ? shade(GREEN, 0.15) : i % 2 ? shade(GREEN, 0.06) : GREEN}
                      animateIn={grew}
                      delay={grew ? 0.45 + i * 0.12 : 0}
                      duration={grew ? 0.8 : 0}
                    />
                  );
                })}

              {end && (
                <motion.g
                  style={PIVOT}
                  initial={false}
                  animate={{
                    x: end.x,
                    y: end.y,
                    rotate: art.head === 'bud' ? end.angle - 90 : art.head === 'bloom' ? end.angle + 90 : 0,
                    scale: art.headScale,
                  }}
                  transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.g
                    style={PIVOT}
                    animate={sway && art.head === 'bloom' ? { rotate: [-3, 3] } : { rotate: 0 }}
                    transition={sway ? swayTransition(4.2, 0.6) : { duration: 0.3 }}
                  >
                    <AnimatePresence initial={false}>
                      {art.head === 'bud' && (
                        <motion.g
                          key="bud"
                          initial={grew ? { scale: 0, opacity: 0 } : false}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.35 } }}
                          transition={{ duration: 0.8, delay: grew ? 0.5 : 0 }}
                          style={PIVOT}
                        >
                          <Bud petal={POPPY} ripeness={Math.min(1, growth.progress + 0.2)} />
                        </motion.g>
                      )}
                      {art.head === 'bloom' && (
                        <motion.g key="bloom" initial={grew ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: grew ? 0.35 : 0 }}>
                          <PoppyHead color={POPPY} signature animateOpen={grew} delay={0.5} duration={1} petalVariant={growth.stage.id === 'mature' ? 1 : 0} />
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </motion.g>
                </motion.g>
              )}
            </g>
          </motion.g>
        </g>
      </motion.g>

      {/* Seed waiting in the soil. */}
      <AnimatePresence initial={false}>
        {growth.stage.id === 'seed' && (
          <motion.g key="seed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.5 } }}>
            <g transform="translate(160 396)">
              <Seed size={2} glint={sway} />
            </g>
          </motion.g>
        )}
      </AnimatePresence>

      <Soil cx={160} cy={414} width={growth.stageIndex >= 3 ? 230 : 190} />

      {growth.stage.id === 'mature' && flourishes.has('butterfly') && <Butterfly sway={sway} />}
    </motion.svg>
  );
}

function SideStem({ from, to, animateIn, kind }: { from: { x: number; y: number }; to: { x: number; y: number }; animateIn: boolean; kind: 'bud' | 'bloom' }) {
  const c: StemCurve = {
    start: from,
    c1: { x: from.x + (to.x - from.x) * 0.5, y: from.y - 12 },
    c2: { x: to.x + (to.x > from.x ? 4 : -4), y: to.y + 34 },
    end: to,
  };
  const end = pointOn(c, 1);
  return (
    <g>
      <Stem curve={c} width={2.8} animateIn={animateIn} duration={animateIn ? 1 : 0} />
      <g transform={`translate(${end.x} ${end.y})`}>
        <motion.g initial={animateIn ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: animateIn ? 0.8 : 0 }} style={PIVOT}>
          <g transform={`rotate(${kind === 'bud' ? end.angle - 90 : end.angle + 90})`}>
            {kind === 'bud' ? (
              <Bud size={0.8} petal={POPPY} ripeness={0.4} />
            ) : (
              <g transform="scale(0.75)">
                <PoppyHead color={CORAL} petalVariant={2} animateOpen={animateIn} delay={1} />
              </g>
            )}
          </g>
        </motion.g>
      </g>
    </g>
  );
}

function Grasses({ animateIn }: { animateIn: boolean }) {
  const blades = [
    [70, 420, -14, 70], [82, 420, -4, 92], [94, 422, 8, 60], [228, 420, -6, 80], [240, 420, 10, 104], [252, 422, 18, 64], [60, 424, -22, 50], [262, 424, 24, 46],
  ];
  return (
    <motion.g initial={animateIn ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
      {blades.map(([x, y, lean, h], i) => (
        <path
          key={i}
          d={`M${x},${y} Q${x + lean * 0.3},${y - h * 0.6} ${x + lean},${y - h}`}
          fill="none"
          stroke={i % 3 === 0 ? SAGE : shade(GREEN, 0.2)}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      ))}
    </motion.g>
  );
}

function SeedHeads({ animateIn, sway }: { animateIn: boolean; sway: boolean }) {
  const heads = [
    { x: 52, y: 424, tx: 44, ty: 300 },
    { x: 272, y: 424, tx: 284, ty: 318 },
  ];
  return (
    <motion.g initial={animateIn ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      {heads.map((h, i) => (
        <g key={i}>
          <path d={`M${h.x},${h.y} Q${h.x - 4},${(h.y + h.ty) / 2} ${h.tx},${h.ty}`} fill="none" stroke={shade(GOLD, -0.25)} strokeWidth={1.6} />
          <g transform={`translate(${h.tx} ${h.ty})`}>
            <motion.g style={PIVOT} animate={sway ? { rotate: [-4, 4] } : { rotate: 0 }} transition={sway ? swayTransition(5 + i, i) : undefined}>
              <ellipse cx={0} cy={-8} rx={6.5} ry={8.5} fill={GOLD} stroke={INK} strokeOpacity={0.5} strokeWidth={0.9} />
              <path d="M-6,-15 L6,-15 L4,-18 L0,-16 L-4,-18 Z" fill={shade(GOLD, -0.3)} />
              {[-3, 0, 3].map((dx) => (
                <line key={dx} x1={dx} y1={-14} x2={dx * 0.6} y2={-1} stroke={shade(GOLD, -0.3)} strokeWidth={0.6} />
              ))}
            </motion.g>
          </g>
        </g>
      ))}
    </motion.g>
  );
}

function Butterfly({ sway }: { sway: boolean }) {
  return (
    <motion.g
      initial={{ x: 248, y: 120 }}
      animate={sway ? { x: [248, 230, 256, 248], y: [120, 100, 92, 120] } : { x: 248, y: 120 }}
      transition={sway ? { duration: 12, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <motion.g animate={sway ? { scaleX: [1, 0.35, 1] } : undefined} transition={sway ? { duration: 0.5, repeat: Infinity } : undefined}>
        <path d="M0,0 C-10,-14 -18,-6 -14,2 C-12,6 -4,4 0,0Z" fill={CORAL} stroke={INK} strokeOpacity={0.6} strokeWidth={0.8} />
        <path d="M0,0 C10,-14 18,-6 14,2 C12,6 4,4 0,0Z" fill={CORAL} stroke={INK} strokeOpacity={0.6} strokeWidth={0.8} />
        <path d="M0,0 C-6,6 -10,10 -6,12 C-3,12 -1,6 0,0Z" fill={GOLD} />
        <path d="M0,0 C6,6 10,10 6,12 C3,12 1,6 0,0Z" fill={GOLD} />
      </motion.g>
      <line x1={0} y1={-3} x2={0} y2={6} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
    </motion.g>
  );
}
