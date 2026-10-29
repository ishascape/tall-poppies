import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { GardenPatch } from '../components/GardenPatch';
import { WinDetail } from '../components/WinDetail';
import { Button } from '../components/ui/Button';
import { Seed } from '../components/art/Seed';
import { useGarden } from '../state/GardenProvider';
import { navigate, useRoute } from '../state/router';
import { layoutGarden, patchIndexOf, PATCH_CAPACITY } from '../lib/layout';
import { formatDay } from '../lib/dates';
import type { Win } from '../lib/types';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const numeral = (i: number) => ROMAN[i] ?? String(i + 1);

export function Garden() {
  const { wins, freshWinId, openPlant } = useGarden();
  const { params } = useRoute();
  const focusId = params.get('win');
  const patches = useMemo(() => layoutGarden(wins), [wins]);
  const last = Math.max(0, patches.length - 1);
  const [index, setIndex] = useState(() => {
    const i = focusId ? patchIndexOf(wins, focusId) : -1;
    return i >= 0 ? i : last;
  });
  const [selected, setSelected] = useState<Win | null>(null);
  const [direction, setDirection] = useState(0);

  // Jump to a requested flower, or to the newest patch when something new is planted.
  useEffect(() => {
    if (focusId) {
      const i = patchIndexOf(wins, focusId);
      if (i >= 0) setIndex(i);
    }
  }, [focusId, wins]);
  useEffect(() => {
    if (freshWinId) setIndex(patchIndexOf(wins, freshWinId));
  }, [freshWinId, wins]);
  useEffect(() => {
    setIndex((i) => Math.min(i, last));
  }, [last]);

  useEffect(() => {
    if (!focusId) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-win-id="${CSS.escape(focusId)}"]`);
      el?.focus({ preventScroll: true });
      el?.closest('.garden-patch')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 350);
    return () => window.clearTimeout(t);
  }, [focusId, index]);

  const patch = patches[index] ?? null;
  const go = (d: number) => {
    setDirection(d);
    setIndex((i) => Math.max(0, Math.min(last, i + d)));
    if (focusId) navigate('/garden', { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-8 md:pb-16">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="eyebrow">Your garden</p>
          <h1 className="display mt-1 text-[2.6rem] leading-none text-ink sm:text-6xl">
            {wins.length === 0 ? 'Room to grow' : wins.length === 1 ? 'One flower, blooming' : `${wins.length} flowers, blooming`}
          </h1>
        </div>
        {wins.length > 0 && <p className="max-w-xs text-sm leading-relaxed text-ink-soft">Every flower is something you did. Tap one to remember it.</p>}
      </header>

      <div className="relative overflow-hidden rounded-[28px] ring-1 ring-line shadow-[0_30px_60px_-40px_rgba(62,106,58,0.6)]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={patch?.index ?? 'empty'}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <GardenPatch
              patch={patch}
              onSelect={setSelected}
              freshWinId={freshWinId}
              highlightId={focusId}
              className="h-[min(58dvh,500px)] min-h-[360px] w-full sm:h-[min(68dvh,620px)]"
            >
              {wins.length === 0 && (
                <div className="absolute inset-0 z-[500] flex flex-col items-center justify-end pb-[18%] text-center">
                  <svg viewBox="-20 -20 40 40" className="mb-3 h-14 w-14" aria-hidden="true">
                    <Seed size={1.2} />
                  </svg>
                  <p className="display max-w-[16rem] text-xl leading-snug text-ink">Your garden is waiting for its first flower.</p>
                  <Button className="mt-4" icon={<Sprout size={17} />} onClick={openPlant}>
                    Plant a win
                  </Button>
                </div>
              )}
            </GardenPatch>
          </motion.div>
        </AnimatePresence>
      </div>

      {patches.length > 1 && (
        <nav aria-label="Garden patches" className="mt-5 flex items-center justify-between gap-3 px-1">
          <Button variant="secondary" size="sm" icon={<ChevronLeft size={16} />} onClick={() => go(-1)} disabled={index === 0} aria-label="Older patch">
            <span className="hidden sm:inline">Older</span>
          </Button>
          <div className="min-w-0 text-center">
            <p className="display text-lg leading-tight text-ink">
              Patch {numeral(index)} <span className="text-ink-faint">of {numeral(last)}</span>
            </p>
            {patch && (
              <p className="text-xs text-ink-soft">
                {formatDay(patch.from)} – {formatDay(patch.to)} · {patch.flowers.length} of {PATCH_CAPACITY}
              </p>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choose a patch">
              {patches.map((p) => (
                <button
                  key={p.index}
                  type="button"
                  onClick={() => {
                    setDirection(p.index > index ? 1 : -1);
                    setIndex(p.index);
                  }}
                  aria-label={`Patch ${p.index + 1}, ${formatDay(p.from)} to ${formatDay(p.to)}`}
                  aria-current={p.index === index ? 'true' : undefined}
                  className={`h-2.5 rounded-full transition-all ${p.index === index ? 'w-6 bg-poppy' : 'w-2.5 bg-ink/20 hover:bg-ink/40'}`}
                />
              ))}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => go(1)} disabled={index === last} aria-label="Newer patch">
            <span className="hidden sm:inline">Newer</span>
            <ChevronRight size={16} />
          </Button>
        </nav>
      )}

      {wins.length > 0 && (
        <p className="mt-6 text-center text-sm text-ink-soft">
          Looking for something? <a href="#/journal" className="font-semibold text-poppy-deep underline decoration-poppy/30 underline-offset-4 hover:decoration-poppy">Browse your journal</a>
        </p>
      )}

      <WinDetail win={selected} onClose={() => setSelected(null)} context="garden" />
    </div>
  );
}
