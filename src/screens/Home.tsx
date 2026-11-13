import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sprout } from 'lucide-react';
import { useGarden } from '../state/GardenProvider';
import { navigate } from '../state/router';
import { SignaturePoppy } from '../components/art/SignaturePoppy';
import { GardenPatch } from '../components/GardenPatch';
import { Reflection } from '../components/Reflection';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { FLOURISHES, GROWTH_STAGES, getGrowth } from '../lib/growth';
import { layoutGarden } from '../lib/layout';
import { formatDay, greeting, todayISO } from '../lib/dates';
import { hashString } from '../lib/variation';

const ENCOURAGEMENTS = [
  'Small things count. They always have.',
  "Nothing here needs to be earned. It's already yours.",
  "You're doing better than you think.",
  'Proud looks good on you.',
  'Let yourself grow, at your own pace.',
  'Every win deserves to bloom.',
];

const PREVIEW_COUNT = 9;

export function Home() {
  const { wins, displayCount, openPlant } = useGarden();
  const [journeyOpen, setJourneyOpen] = useState(false);
  const growth = getGrowth(displayCount);
  const today = todayISO();
  const encouragement = displayCount === 0 ? 'Your seed is waiting. What went well today?' : ENCOURAGEMENTS[hashString(today) % ENCOURAGEMENTS.length];
  const preview = useMemo(() => layoutGarden(wins.slice(-PREVIEW_COUNT))[0] ?? null, [wins]);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-x-12 px-5 pb-32 pt-2 sm:px-8 md:pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-6">
      <motion.p
        className="display text-center text-base text-ink-soft lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {greeting()}.
      </motion.p>

      {/* Hero: the signature poppy */}
      <div className="relative mx-auto w-full max-w-[25rem] lg:row-span-2 lg:max-w-[32rem]">
        <button
          type="button"
          onClick={() => setJourneyOpen(true)}
          className="group relative block w-full rounded-[40px]"
          aria-label={`Your signature poppy, ${growth.stage.name.toLowerCase()}. ${displayCount} ${displayCount === 1 ? 'win' : 'wins'} planted. Open your growth journey.`}
        >
          <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
            <SignaturePoppy count={displayCount} className="mx-auto block h-[min(46dvh,480px)] w-full lg:h-[min(70dvh,640px)]" />
          </motion.div>
        </button>
      </div>

      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <p className="display hidden text-lg text-ink-soft lg:block">{greeting()}.</p>
        <h1 className="display pop-headline mt-3 max-w-md text-[1.8rem] leading-[1.1] text-ink sm:text-[2.5rem] lg:text-[2.8rem]">{growth.stage.line}</h1>
        <p className="mt-3 max-w-sm text-[1rem] font-medium leading-relaxed text-ink-soft">{encouragement}</p>
        <Button size="lg" className="mt-6" icon={<Sprout size={19} />} onClick={openPlant}>
          Plant a win
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-6 lg:col-start-2 lg:mt-8">
        <Reflection />

        {wins.length > 0 && (
          <section aria-labelledby="preview-title">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 id="preview-title" className="display text-xl text-ink">
                Your garden
              </h2>
              <a href="#/garden" className="inline-flex items-center gap-1 text-sm font-bold text-poppy-deep underline decoration-2 underline-offset-4 hover:text-ink">
                Visit <ArrowRight size={15} />
              </a>
            </div>
            <button
              type="button"
              onClick={() => navigate('/garden')}
              className="block w-full overflow-hidden rounded-[24px] border-[3px] border-ink shadow-[5px_5px_0_var(--color-ink)] transition-shadow hover:shadow-[7px_7px_0_var(--color-pink)]"
              aria-label={`Visit your garden of ${wins.length} ${wins.length === 1 ? 'flower' : 'flowers'}`}
            >
              <GardenPatch patch={preview} preview className="h-44 w-full sm:h-52" />
            </button>
          </section>
        )}
      </div>

      <JourneyDialog open={journeyOpen} onClose={() => setJourneyOpen(false)} />
    </div>
  );
}

function JourneyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { wins } = useGarden();
  const growth = getGrowth(wins.length);
  const first = wins[0];
  const unlocked = FLOURISHES.filter((f) => growth.flourishes.has(f.id));

  return (
    <Dialog open={open} onClose={onClose} title="Your poppy's journey">
      <div className="flex flex-col gap-5">
        <p className="text-[1rem] leading-relaxed text-ink-soft">
          {wins.length === 0 ? (
            <>A seed, resting in warm soil. The first win you plant will wake it.</>
          ) : (
            <>
              You've planted <strong className="font-semibold text-ink">{wins.length} {wins.length === 1 ? 'win' : 'wins'}</strong> since {formatDay(first.date)}. Each one helped your
              poppy grow. It never wilts, so there's no rush.
            </>
          )}
        </p>
        <ol className="grid grid-cols-5 gap-1" aria-label="Growth stages">
          {GROWTH_STAGES.map((s, i) => {
            const reached = i <= growth.stageIndex;
            const current = i === growth.stageIndex;
            return (
              <li key={s.id} className="flex flex-col items-center gap-1 text-center" aria-current={current ? 'step' : undefined}>
                <div className={`w-full rounded-2xl ${current ? 'border-2 border-ink bg-ivory' : 'border-2 border-transparent'} ${reached ? '' : 'opacity-35 grayscale'}`}>
                  <SignaturePoppy count={s.min} ambient={false} className="mx-auto h-20 w-full" title={s.name} />
                </div>
                <span className={`text-[0.68rem] font-semibold leading-tight ${current ? 'text-poppy-deep' : 'text-ink-soft'}`}>{s.name}</span>
              </li>
            );
          })}
        </ol>
        {growth.stage.id === 'mature' && (
          <p className="text-sm leading-relaxed text-ink-soft">
            {unlocked.length > 0
              ? `Fully grown, and still finding new ways to flourish: ${unlocked.map((f) => f.name).join(', ')}.`
              : 'Fully grown. From here it keeps flourishing in small ways as you plant more.'}
          </p>
        )}
      </div>
    </Dialog>
  );
}
