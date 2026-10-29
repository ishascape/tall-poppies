import { motion } from 'motion/react';
import { BookOpen, Flower2, Home, Plus } from 'lucide-react';
import { useGarden } from '../../state/GardenProvider';
import { useRoute, type Route } from '../../state/router';
import { Wordmark } from '../art/Wordmark';

const ITEMS: { path: Route['path']; label: string; icon: typeof Home }[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/garden', label: 'Garden', icon: Flower2 },
  { path: '/journal', label: 'Journal', icon: BookOpen },
];

export function TopBar() {
  const { path } = useRoute();
  const { openPlant } = useGarden();
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
      <a href="#/" className="rounded-md py-2" aria-label="Tall Poppies, home">
        <Wordmark />
      </a>
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {ITEMS.map((item) => {
          const active = path === item.path;
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              aria-current={active ? 'page' : undefined}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}
            >
              {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink/[0.06]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">{item.label}</span>
            </a>
          );
        })}
        <motion.button
          type="button"
          onClick={openPlant}
          whileTap={{ scale: 0.95 }}
          className="ml-3 inline-flex h-10 items-center gap-2 rounded-full bg-poppy px-4 text-sm font-semibold text-paper hover:bg-poppy-deep"
        >
          <Plus size={16} strokeWidth={2.4} />
          Plant a win
        </motion.button>
      </nav>
    </header>
  );
}

export function BottomNav() {
  const { path } = useRoute();
  const { openPlant } = useGarden();
  const link = (item: (typeof ITEMS)[number]) => {
    const active = path === item.path;
    const Icon = item.icon;
    return (
      <a
        key={item.path}
        href={`#${item.path}`}
        aria-current={active ? 'page' : undefined}
        className={`flex h-16 flex-1 flex-col items-center justify-end gap-1 rounded-xl pb-2.5 text-[0.7rem] font-semibold tracking-wide transition-colors ${active ? 'text-poppy' : 'text-ink-soft'}`}
      >
        <Icon size={22} strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
        {item.label}
      </a>
    );
  };
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center px-3">
        {ITEMS.map(link)}
        <div className="flex h-16 flex-1 flex-col items-center justify-end pb-2.5">
          <motion.button
            type="button"
            onClick={openPlant}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center gap-1 text-[0.7rem] font-semibold tracking-wide text-poppy"
          >
            <span className="-mb-0.5 grid h-8 w-8 place-items-center rounded-full bg-poppy text-paper shadow-[0_6px_14px_-6px_rgba(143,31,28,0.8)]">
              <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
            </span>
            Plant
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
