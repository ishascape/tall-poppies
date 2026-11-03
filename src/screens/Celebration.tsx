import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useGarden, stageNameAfter, type Celebration as CelebrationData } from '../state/GardenProvider';
import { navigate, useRoute } from '../state/router';
import { GardenFlower } from '../components/art/GardenFlower';
import { Seed } from '../components/art/Seed';
import { Soil } from '../components/art/Soil';
import { CELEBRATION, timelineTotal } from '../lib/motion';
import { hashString } from '../lib/variation';
import { GOLD } from '../components/art/palette';

const LINES = ['Look what you grew.', 'Another one blooms.', 'That deserves to bloom.', 'Look at that grow.', 'Something lovely, planted.'];

const STAGE_LINES: Record<string, string> = {
  sprout: 'And look, your own poppy has sprouted.',
  bud: 'Your poppy is forming a bud.',
  bloom: 'Your poppy has bloomed.',
  mature: 'Your poppy is standing tall.',
};

export function CelebrationLayer() {
  const { celebration } = useGarden();
  return <AnimatePresence>{celebration && <CelebrationOverlay key={celebration.win.id} data={celebration} />}</AnimatePresence>;
}

function CelebrationOverlay({ data }: { data: CelebrationData }) {
  const { finishCelebration } = useGarden();
  const { path } = useRoute();
  const reduced = useReducedMotion() ?? false;
  const t = reduced ? CELEBRATION.reduced : data.first ? CELEBRATION.first : CELEBRATION.later;
  const growAt = t.drop + t.settle;
  const textAt = reduced ? 0.1 : growAt + t.grow * 0.85;
  const readTime = data.first ? 1.7 : 1.1;
  const stage = stageNameAfter(data);
  const skip = useRef<HTMLButtonElement>(null);
  const done = useRef(false);

  const line = data.first ? LINES[0] : LINES[hashString(data.win.id) % LINES.length];

  const close = useMemo(
    () => () => {
      if (done.current) return;
      done.current = true;
      finishCelebration();
      if ((data.first || stage) && path !== '/') navigate('/');
    },
    [finishCelebration, data.first, stage, path],
  );

  useEffect(() => {
    skip.current?.focus();
    const timer = window.setTimeout(close, (timelineTotal(t) + readTime) * 1000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [close, t, readTime]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-ivory/95 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      transition={{ duration: 0.25 }}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Your win has been planted"
    >
      <button
        ref={skip}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink"
      >
        Skip
      </button>

      <div className="relative flex h-[min(52vh,420px)] w-full max-w-xs items-end justify-center">
        {/* Warm light that swells as the flower opens. */}
        <motion.div
          className="absolute bottom-[18%] left-1/2 aspect-square w-[120%] -translate-x-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}44 0%, ${GOLD}14 45%, transparent 70%)` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: t.grow + t.open, delay: reduced ? 0 : growAt, ease: [0.22, 1, 0.36, 1] }}
        />

        {!reduced && (
          <motion.svg
            viewBox="-20 -20 40 40"
            className="absolute bottom-[8%] left-1/2 h-10 w-10 -translate-x-1/2"
            initial={{ y: -320, rotate: -40, opacity: 1 }}
            animate={{ y: 0, rotate: 20, opacity: [1, 1, 0] }}
            transition={{ duration: t.drop, ease: [0.55, 0, 0.75, 0.3], opacity: { duration: t.drop + t.settle, times: [0, 0.8, 1] } }}
            aria-hidden="true"
          >
            <Seed size={1.2} glint={false} />
          </motion.svg>
        )}

        {/* Soil puff when the seed lands. */}
        {!reduced &&
          Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI + (i / 6) * Math.PI;
            return (
              <motion.span
                key={i}
                className="absolute bottom-[9%] left-1/2 h-1.5 w-1.5 rounded-full bg-soil"
                initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
                animate={{ x: Math.cos(a) * 34, y: Math.sin(a) * 22, opacity: [0, 0.9, 0], scale: 0.4 }}
                transition={{ duration: 0.55, delay: t.drop - 0.02, ease: 'easeOut' }}
                aria-hidden="true"
              />
            );
          })}

        <div className="relative z-10 mb-[9%] w-[58%]">
          <GardenFlower variant={data.win.flowerVariant} animateIn={!reduced} delay={growAt} duration={t.grow + t.open} className="w-full" />
        </div>
        <svg viewBox="-110 -12 220 34" className="absolute bottom-0 left-1/2 w-[92%] -translate-x-1/2" aria-hidden="true">
          <Soil width={210} />
        </svg>
      </div>

      <motion.div
        className="relative mt-6 max-w-sm text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: textAt, ease: [0.22, 1, 0.36, 1] }}
        aria-live="assertive"
      >
        <h2 className="display text-[2.4rem] leading-[1.05] text-ink sm:text-5xl">{line}</h2>
        <p className="display mt-3 text-lg italic leading-snug text-ink-soft">“{data.win.text}”</p>
        <AnimatePresence>
          {stage && (
            <motion.p
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-poppy-deep ring-1 ring-gold/40"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: textAt + 0.35, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              {STAGE_LINES[stage]}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
