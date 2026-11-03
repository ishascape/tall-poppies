import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useGarden } from '../../state/GardenProvider';

export function Toasts() {
  const { toasts, dismissToast } = useGarden();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[55] flex flex-col items-center gap-2 px-4 md:bottom-8" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-paper shadow-lg"
          >
            <span>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="rounded-full px-3 py-1.5 font-semibold text-blush underline-offset-4 hover:underline"
                onClick={() => {
                  t.action!.run();
                  dismissToast(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => dismissToast(t.id)} className="grid h-8 w-8 place-items-center rounded-full text-paper/70 hover:text-paper" aria-label="Dismiss">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
