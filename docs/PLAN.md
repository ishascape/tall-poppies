# Tall Poppies — MVP plan

*Let yourself grow. Every win deserves to bloom.*

## 1. Information architecture

```
Tall Poppies
├── Welcome (first visit only, never after the first win)
├── Home            #/
│   ├── Signature poppy (hero, tap → growth journey summary)
│   ├── Reflection ("Remember this?") — only when an older win exists
│   ├── Plant a win (primary action)
│   └── Garden preview → Garden
├── Garden          #/garden  (?win=<id> focuses a flower)
│   ├── Patches of up to 28 flowers, newest patch first
│   └── Flower → Win detail (text, date, category, edit, see in journal)
├── Journal         #/journal (?category=courage)
│   ├── Month-grouped chronological list, category filter
│   ├── Edit / delete (with confirmation) / see flower
│   └── Download my wins (JSON) — users own their entries
└── Plant / Edit sheet (modal over any screen)
    └── Celebration overlay (seed → soil → bloom → "Look what you grew.")
```

Hash routing keeps the app a static bundle that works offline and deep-links straight to a flower.

## 2. Screen structure

| Screen | Hierarchy |
| --- | --- |
| **Welcome** | Wordmark · seed in soil illustration · "You're allowed to be proud of yourself." · supporting line · **Plant your first win** |
| **Home** | Wordmark · time-of-day greeting · signature poppy (sways, tappable) · stage line + encouraging copy · **Plant a win** · reflection card (sometimes) · garden strip preview · bottom nav |
| **Plant sheet** | "What went well today?" · textarea · category chips (optional) · date (defaults today) · **Plant this win** |
| **Celebration** | Seed drops, soil puffs, flower grows and opens, signature poppy stage change if any, "Look what you grew." · Skip. First win ≈ 2.6s, later wins ≈ 1.4s |
| **Garden** | Title + count · layered landscape (sky wash, far hills, mid hills, grass) with three depth rows of flowers · patch pager · win detail sheet |
| **Journal** | Editorial heading · category filter chips · month sections · entries (date, text, tag, actions) · export link |

Bottom nav (Home · Garden · Journal) on mobile, top nav on wide screens. The Plant action is always one tap away.

## 3. Component architecture

```
src/
  lib/            pure, framework-free, unit tested
    types.ts        Win, WinCategory, FlowerVariant
    growth.ts       GROWTH_STAGES constant, getGrowth(count), flourishes
    variation.ts    seeded PRNG → FlowerVariant from win id
    wins.ts         createWin / updateWin / sortWins (CRUD on arrays)
    storage.ts      versioned schema, validation, migration, corruption recovery
    repository.ts   WinRepository interface + LocalWinRepository (Supabase-ready seam)
    layout.ts       garden patches, slot order, depth rows
    reflection.ts   deterministic daily "Remember this?" pick
    motion.ts       durations, easings, celebration timeline
    dates.ts        formatting helpers
  state/
    GardenProvider.tsx   context: wins, actions, celebration + "just grew" signals
  components/
    art/          SignaturePoppy, GardenFlower, PoppyHead, Stem, Leaf, Seed, Soil,
                  GardenBackdrop, Wordmark, PaperGrain
    ui/           Button, Sheet, ConfirmDialog, CategoryChips, Nav, WinDetail
  screens/        Welcome, Home, Garden, Journal, PlantSheet, Celebration
```

Every SVG part is its own component that accepts motion props, so stems draw, leaves unfurl and petals open independently.

## 4. Visual design system

- **Palette:** ivory `#F6EFE2`, paper `#FBF7EE`, ink `#2A241E`, poppy `#C7352B`, poppy deep `#8F1F1C`, coral `#E8775C`, botanical green `#3E6A3A`, sage `#A3B48E`, blush `#EBC7BA`, gold `#C9A04A`, soil `#6E4B36`.
- **Type:** Fraunces (soft, slightly wonky variable serif) for editorial headings and win text; Instrument Sans for UI and body. Both self-hosted so the app works offline.
- **Texture:** a faint paper-grain filter over ivory, hand-drawn ink outlines on illustrations, no gradients beyond soft sky washes.
- **Shape:** pill buttons, generous radii only on sheets, hairline rules instead of cards in the journal.
- **Motion:** spring-based, slow ease-outs, ambient sway of 1–2°. `prefers-reduced-motion` swaps every sequence for gentle fades and stops ambient motion.

## 5. Growth-state logic

```ts
export const GROWTH_STAGES = [
  { id: 'seed',   min: 0  },
  { id: 'sprout', min: 1  },
  { id: 'bud',    min: 3  },
  { id: 'bloom',  min: 7  },
  { id: 'mature', min: 15 },
];
```

- Stage is always derived from `wins.length`; it is never stored.
- After maturity, flourishes unlock at 20, 30, 45, 65, 90 and 120 wins (extra leaves, companion buds, meadow grasses, golden seed heads, a butterfly). Height stops growing at maturity.
- Deleting wins simply re-derives the stage; the poppy re-renders quietly with no wilting.
- Growth animations play only when the count changes during the session, never on app open.
