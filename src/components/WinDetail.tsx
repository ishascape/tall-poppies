import { useState } from 'react';
import { BookOpen, Flower2, Pencil, Trash2 } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { CategoryTag } from './ui/CategoryChips';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { GardenFlower } from './art/GardenFlower';
import { useGarden } from '../state/GardenProvider';
import { navigate } from '../state/router';
import { formatDay, formatWeekday } from '../lib/dates';
import type { Win } from '../lib/types';

export function WinDetail({ win, onClose, context }: { win: Win | null; onClose: () => void; context: 'garden' | 'journal' }) {
  const { openEdit, deleteWin } = useGarden();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Dialog open={!!win && !confirming} onClose={onClose} title={win ? `${formatWeekday(win.date)}, ${formatDay(win.date)}` : ''}>
        {win && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <GardenFlower variant={win.flowerVariant} headOnly className="h-16 w-16 shrink-0" />
              <div className="min-w-0 pt-1">
                <CategoryTag category={win.category} />
                <p className="display mt-1 text-[1.45rem] leading-snug text-ink [overflow-wrap:anywhere]">{win.text}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil size={15} />}
                onClick={() => {
                  onClose();
                  openEdit(win);
                }}
              >
                Edit
              </Button>
              {context === 'garden' ? (
                <Button variant="secondary" size="sm" icon={<BookOpen size={15} />} onClick={() => navigate(`/journal?win=${win.id}`)}>
                  In journal
                </Button>
              ) : (
                <Button variant="secondary" size="sm" icon={<Flower2 size={15} />} onClick={() => navigate(`/garden?win=${win.id}`)}>
                  See its flower
                </Button>
              )}
              <Button variant="ghost" size="sm" icon={<Trash2 size={15} />} onClick={() => setConfirming(true)} className="ml-auto">
                Remove
              </Button>
            </div>
          </div>
        )}
      </Dialog>
      <ConfirmDialog
        open={confirming}
        title="Let this one go?"
        description="This win and its flower will leave your garden. Your signature poppy will be just fine."
        confirmLabel="Remove"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          if (win) deleteWin(win.id);
          setConfirming(false);
          onClose();
        }}
      />
    </>
  );
}
