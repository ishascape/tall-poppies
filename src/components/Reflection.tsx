import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useGarden } from '../state/GardenProvider';
import { navigate } from '../state/router';
import { pickReflection } from '../lib/reflection';
import { formatDay, todayISO } from '../lib/dates';
import { GardenFlower } from './art/GardenFlower';

/** "Remember this?" Resurfaces a real past win, word for word. */
export function Reflection() {
  const { wins, preferences, dismissReflection } = useGarden();
  const today = todayISO();
  const win = pickReflection(wins, today, preferences.reflectionDismissedOn);
  if (!win) return null;
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[26px] bg-paper px-6 pb-6 pt-5 ring-1 ring-line"
      aria-labelledby="reflection-title"
    >
      <GardenFlower variant={win.flowerVariant} headOnly className="absolute -right-3 -top-2 h-24 w-24 rotate-12 opacity-25" />
      <button
        type="button"
        onClick={() => dismissReflection(today)}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-ink"
        aria-label="Tuck this memory away for today"
      >
        <X size={17} />
      </button>
      <p id="reflection-title" className="display text-2xl italic text-poppy-deep">
        Remember this?
      </p>
      <p className="mt-1 text-sm text-ink-soft">You did something wonderful on {formatDay(win.date)}.</p>
      <button
        type="button"
        onClick={() => navigate(`/garden?win=${win.id}`)}
        className="display mt-3 block text-left text-[1.35rem] leading-snug text-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-poppy/40 [overflow-wrap:anywhere]"
      >
        “{win.text}”
      </button>
    </motion.aside>
  );
}
