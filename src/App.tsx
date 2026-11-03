import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { GardenProvider, useGarden } from './state/GardenProvider';
import { useRoute } from './state/router';
import { TopBar, BottomNav } from './components/ui/Nav';
import { Toasts } from './components/ui/Toasts';
import { Home } from './screens/Home';
import { Garden } from './screens/Garden';
import { Journal } from './screens/Journal';
import { Welcome } from './screens/Welcome';
import { PlantSheet } from './screens/PlantSheet';
import { CelebrationLayer } from './screens/Celebration';
import { useEffect } from 'react';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <GardenProvider>
        <Shell />
      </GardenProvider>
    </MotionConfig>
  );
}

function Shell() {
  const { ready, wins, preferences, recovered, toast, celebration } = useGarden();
  const { path } = useRoute();

  useEffect(() => {
    if (recovered) toast('Some saved data couldn’t be read, so we kept a backup and carried on.');
  }, [recovered, toast]);

  if (!ready) return <div className="min-h-[100dvh] bg-ivory" />;

  const showWelcome = wins.length === 0 && !preferences.welcomed && !celebration;

  return (
    <>
      <a href="#main" className="sr-only z-[80] rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <div className="paper-grain" aria-hidden="true" />
      {showWelcome ? (
        <Welcome />
      ) : (
        <div className="flex min-h-[100dvh] flex-col">
          <TopBar />
          <main id="main" className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {path === '/garden' ? <Garden /> : path === '/journal' ? <Journal /> : <Home />}
              </motion.div>
            </AnimatePresence>
          </main>
          <BottomNav />
        </div>
      )}
      <PlantSheet />
      <CelebrationLayer />
      <Toasts />
    </>
  );
}
