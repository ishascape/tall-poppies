import { motion } from 'motion/react';
import { Shuffle, Sprout } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Wordmark } from '../components/art/Wordmark';
import { SignaturePoppy } from '../components/art/SignaturePoppy';
import { PoppyHead } from '../components/art/PoppyHead';
import { useGarden } from '../state/GardenProvider';
import { CORAL, POPPY, BLUSH } from '../components/art/palette';

export function Welcome() {
  const { openPlant, plantSamples } = useGarden();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <Corners />
      <header className="relative z-10 flex justify-center sm:justify-start">
        <Wordmark />
      </header>
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
        <motion.div {...rise(0.05)} className="w-[min(58vw,15rem)]">
          <SignaturePoppy count={0} className="block h-auto w-full" title="A seed resting in soil" />
        </motion.div>
        <motion.h1 {...rise(0.2)} className="display pop-headline mt-4 text-[2rem] leading-[1.1] text-ink sm:text-[3.2rem]">
          You're allowed to be proud of yourself.
        </motion.h1>
        <motion.p {...rise(0.35)} className="mt-5 max-w-sm text-[1.08rem] font-medium leading-relaxed text-ink-soft">
          A little garden for all the things you've done, big and small.
        </motion.p>
        <motion.div {...rise(0.5)} className="mt-9 flex flex-col items-center gap-3">
          <Button size="lg" icon={<Sprout size={19} />} onClick={openPlant}>
            Plant your first win
          </Button>
          <Button variant="ghost" size="sm" icon={<Shuffle size={15} />} onClick={() => plantSamples(10)}>
            Or start with 10 sample wins
          </Button>
          <p className="text-xs font-semibold text-ink-faint">No account needed. Your wins stay on this device.</p>
        </motion.div>
      </div>
    </main>
  );
}

/** Botanical flourishes tucked into the corners, like endpapers of a storybook. */
function Corners() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg viewBox="-60 -120 160 200" className="absolute -left-12 bottom-[-6rem] w-36 rotate-[18deg] sm:bottom-[-2rem] sm:w-64">
        <path d="M0,80 C-4,30 10,-10 4,-60" stroke="#14101F" strokeWidth={4.4} fill="none" strokeLinecap="round" />
        <path d="M0,80 C-4,30 10,-10 4,-60" stroke="#00A651" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M2,20 C20,10 36,12 46,0 C30,-2 14,4 2,20Z" fill="#7EE05A" stroke="#14101F" strokeWidth={1.6} />
        <g transform="translate(4 -60) rotate(8) scale(0.9)">
          <PoppyHead color={POPPY} />
        </g>
      </svg>
      <svg viewBox="-60 -120 160 200" className="absolute -right-12 top-16 w-36 -rotate-[24deg] sm:w-52">
        <path d="M0,80 C6,30 -6,-10 0,-60" stroke="#14101F" strokeWidth={4.2} fill="none" strokeLinecap="round" />
        <path d="M0,80 C6,30 -6,-10 0,-60" stroke="#00A651" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d="M0,30 C-18,22 -34,24 -42,12 C-26,10 -12,14 0,30Z" fill="#7EE05A" stroke="#14101F" strokeWidth={1.6} />
        <g transform="translate(0 -60) rotate(-6) scale(0.8)">
          <PoppyHead color={CORAL} petalVariant={1} />
        </g>
      </svg>
      <svg viewBox="-40 -80 80 120" className="absolute bottom-24 right-4 hidden w-20 rotate-12 sm:block">
        <path d="M0,40 C2,10 -2,-20 0,-40" stroke="#14101F" strokeWidth={3.4} fill="none" />
        <g transform="translate(0 -40) scale(0.55)">
          <PoppyHead color={BLUSH} petalVariant={2} />
        </g>
      </svg>
    </div>
  );
}
