# PulseOS UI redesign pack

Drop-in replacement files for `Piyushdas1624/pulse-os`. Everything here compiles
against the store API you already have (`usePulseStore`) and the types in
`lib/types/pulse.ts`. No store rewrite required.

---

## Install

1. Copy every folder in this zip over the repo root, keeping paths. It replaces:

```
app/globals.css              rewritten  one dark theme, no light body
app/layout.tsx               rewritten  Instrument Sans + hydrator + toasts
app/page.tsx                 rewritten  executive briefing
app/operations/page.tsx      rewritten
app/settings/page.tsx        rewritten  real settings page, fixes the pill bug
tailwind.config.ts           rewritten  new tokens, legacy keys kept as aliases
components/Navbar.tsx        rewritten
components/FloorPlanSvg.tsx  rewritten  real SVG floor, shape-coded tables
components/OperationalKPIs.tsx        rewritten
components/KitchenCPUScheduler.tsx    rewritten
components/InventoryImpactCards.tsx   rewritten
components/LiveEventTimeline.tsx      rewritten
components/AICostSavingsCard.tsx      rewritten  NaN + stale model label fixed
```

New files:

```
components/ui/primitives.tsx     Panel, Button, Tag, Pill, Stat, Gauge, Skeleton, EmptyState
components/ui/Toast.tsx          toast() from anywhere
components/GovernorHydrator.tsx  rehydrates provider config on mount
lib/ai/keyVault.ts               AES-GCM key storage
lib/ai/providerState.ts          the single write path for provider state
docs/MODAL-PATCH.md              the 6-line change AISettingsModal needs
```

2. `npm i` (no new deps; `next/font` and `lucide-react` are already in your
   package.json).
3. `npx tsc --noEmit && npm run build`

---

## What changed and why

### The demo-mode bug, actually fixed

Root cause: `AISettingsModal` kept `providerMode` in local React state and wrote
straight to `localStorage`. `Navbar` reads `governor.provider_mode` from Zustand.
Two sources of truth, so the pill never moved. Second half of the bug: the store
hard-initialises `provider_mode: "demo"` and never read `localStorage` back, so a
refresh threw the choice away.

Fix, in three parts:

- `lib/ai/providerState.ts` exposes `applyProviderConfig()`. It calls
  `setAIConfiguration()` **and** persists, in one call. Nothing else is allowed
  to write provider state.
- `components/GovernorHydrator.tsx` mounts once in the root layout, decrypts the
  stored key and seeds the store. Refresh now survives.
- `isLiveProvider(governor)` is the one place that decides demo vs live. Navbar,
  telemetry, settings and the chat all read it. They cannot disagree.

See `docs/MODAL-PATCH.md` for the change your existing modal needs.

### `NaN%` in the budget bar

`budget_used_inr / today_budget_inr` with a zero budget. The rewrite does not
invent a denominator: when there is no budget it renders a dashed "No budget set"
track. A fake `Math.max(1, budget)` would have produced a real-looking but
meaningless `0%`.

### Theme

One dark theme, warm-neutral (umber-tinted), not the blue-black every AI
dashboard ships with. Surfaces are the same hue and chroma with only lightness
varying, so depth comes from elevation rather than shadow. Colour is reserved
for meaning: table state, stock severity, kitchen status. Green/amber/red/blue
never appear as decoration. Primary buttons are bone-white, not accent-coloured.

The old `obsidian.*` and `pulse.*` Tailwind keys are kept and repointed, so any
component you have not migrated yet (`AIHealthScanCard`, `AIExplainabilityModal`,
`AIMemoryWidget`, `DigitalTwinFloor`) inherits the new palette without breaking
the build. `shadow-glow*`, `bg-glass-gradient`, `bg-ai-glow` and `animate-pulse`
are now no-ops for the same reason. Migrate them at your own pace.

### Typography

Instrument Sans, weights 400/500/600 only, via `next/font/google`. `font-mono`
is aliased to the sans stack because the old build used monospace as decoration;
use the `.num` utility (`tabular-nums`) for aligned digits instead.

### Floor plan

Real room geometry: kitchen pass with a marked pass window, bar with stools,
entrance with a door swing, restrooms as back-of-house. Tables are shape-coded
by capacity (circle = 2, square = 4, rounded booth = 6+) with individual chair
marks. `x_pos` / `y_pos` from the store are read as percentages and mapped onto
the room, so your existing data drives it unchanged.

### Home

One question answered in the first screenful: what needs me right now. The
highest-severity stock item is promoted into a single attention block with one
primary action. Marketing copy is gone. Everything below is supporting detail.

---

## Not done, on purpose

- `AISettingsModal.tsx`, `AIHealthScanCard.tsx`, `AIExplainabilityModal.tsx`,
  `AIMemoryWidget.tsx`, `DigitalTwinFloor.tsx` and `app/ai-ops/page.tsx` are not
  in this pack. They inherit the theme via the aliased tokens but still carry
  their old layout. `docs/MODAL-PATCH.md` covers the one behavioural change the
  modal needs; the rest is cosmetic and can follow.
- No browser screenshots were taken. Verification here is typecheck, lint and
  production build. If you want real interactive E2E, add Playwright.
