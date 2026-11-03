# Tall Poppies

*Let yourself grow.* A mobile-first web app for noticing your wins. Every win you log becomes a flower in your own garden, and together they help your signature poppy grow from a seed into a tall poppy.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve the build on http://localhost:4173
```

## Test it

```bash
npm test             # unit tests: growth, variation, storage, layout, reflection, motion timing
npm run build && npm run preview -- --port 4173 &
npm run test:e2e     # browser walkthrough of the whole journey (needs Playwright + Chromium)
```

The walkthrough covers onboarding, the first win, stage changes at 1, 3, 7 and 15 wins, editing and deleting with undo, stable flowers after a refresh, persistence, empty states, corrupted data, a 130-win garden, keyboard-only use, reduced motion and mobile layouts. It saves screenshots to `./screenshots`.

## How it's built

React 19, TypeScript, Vite, Tailwind CSS 4, Motion for React and Lucide. Fonts (Fraunces and Instrument Sans) are bundled, and a small service worker caches the app, so it keeps working offline after the first visit.

```
src/lib/          pure logic, unit tested
  growth.ts         GROWTH_STAGES thresholds and post-maturity flourishes
  variation.ts      seeded PRNG: each win id deterministically picks its flower
  wins.ts           create / edit / sort / remove
  storage.ts        versioned localStorage schema, validation, repair, backups
  repository.ts     WinRepository interface (the seam for a future Supabase sync)
  layout.ts         garden patches of 28 and depth-row slot ordering
  reflection.ts     deterministic daily "Remember this?" pick
  motion.ts         shared easings and celebration timelines
src/state/        GardenProvider (app state + actions) and hash router
src/components/
  art/              hand-built SVG: SignaturePoppy, GardenFlower, PoppyHead, Leaf, Stem, Bud, Seed, Soil, GardenBackdrop
  ui/               Button, Dialog, ConfirmDialog, CategoryChips, Nav, Toasts
src/screens/      Welcome, Home, Garden, Journal, PlantSheet, Celebration
```

### Product rules the code keeps

- The poppy's stage is always worked out from the number of wins and never stored. Deleting wins quietly recalculates it, with no wilting.
- Flowers vary only by their win's id, never by what the win says, so every win counts equally.
- Growth animations play only when a win is planted during the visit. Opening the app never replays them.
- `prefers-reduced-motion` turns the sequences into fades and stops the ambient sway.
- Wins are private and stay on this device. You can download a JSON copy from the journal.

See [docs/PLAN.md](docs/PLAN.md) for the information architecture, design system and growth logic.

## Not built yet

These are planned for later: a friends' poppy field (sharing would be opt-in per win, with no follower counts or leaderboards), a home-screen widget, and gentle opt-in reminders with no streaks.
