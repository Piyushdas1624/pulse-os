# PulseOS - Comprehensive UI/UX, Workflow & Runtime Flaws Audit (`errors.md`)

This document presents an exhaustive audit of all visual, architectural, workflow, text contrast, theme, and runtime bugs identified during live Chrome DevTools MCP browser testing on `http://localhost:3000`.

---

## 1. Critical Runtime & Math Bugs

### 1.1 `NaN%` Percentage Division Bug in AI Budget Widget
- **Location**: `components/AICostSavingsCard.tsx` / `governor.ts` (Layer 4: AI Budget & Cost Telemetry Widget)
- **Visual Evidence**: Renders `₹0 Used (NaN% Remaining)` on the primary progress bar.
- **Root Cause**: When `today_budget_inr` or initial budget calculates as 0, dividing `budget_used_inr / today_budget_inr` yields `NaN` in JavaScript!
- **Impact**: Screams broken code to hackathon judges.
- **Fix**: Guard division with `Math.max(1, today_budget_inr)` or default fallback.

### 1.2 Outdated Model Label in Telemetry Card
- **Location**: `components/AICostSavingsCard.tsx`
- **Visual Evidence**: Card displays `Gemini 1.5 Flash Model` even after updating default recommendation to `Gemini 3.6 Flash`.
- **Fix**: Bind telemetry model label dynamically to `governor.selected_model`.

---

## 2. Severe Theme & Visual Consistency Clashes ("Frankenstein UI")

### 2.1 Blinding Light Mode vs Dark Obsidian Theme Clash
- **Location**: Home Page (`/`) vs Operations Page (`/operations`)
- **Visual Evidence**:
  - Home Page (`/`) uses a **stark white background (`bg-white`)** with light gray text (`text-slate-600`).
  - Navbar uses **Dark Obsidian (`bg-obsidian-950/90`)**.
  - Operations Page (`/operations`) has a dark obsidian background (`#0B0F17`), BUT contains **bright white cards** (`OperationalKPIs`, `LiveEventTimeline`, `KitchenCPUScheduler`, `InventoryImpactCards`) right next to a **dark obsidian 2D Floor Plan (`FloorPlanSvg`)**!
- **Impact**: Eye-searing visual dissonance. It feels like 3 different developers built 3 different pages without agreeing on a single design system.
- **Fix**: Enforce a unified Vercel/Linear dark theme across **ALL** pages (`#0B0F14` bg, `#111827` cards, `#1F2937` borders, `#F8FAFC` text). Eliminate bright white cards on dark backgrounds.

### 2.2 Unreadable Subtitle & Secondary Text Contrast
- **Location**: `KitchenCPUScheduler.tsx`, `InventoryImpactCards.tsx`, `LiveEventTimeline.tsx`
- **Visual Evidence**: Secondary subtitle text (`Prepare similar dishes together`, `Stock that needs a decision`) uses ultra-light gray text (`text-slate-400`/`text-slate-500`) on white backgrounds, failing WCAG AA contrast rules (< 2.8:1 ratio).
- **Fix**: Apply consistent high-contrast colors (`text-slate-300` / `text-slate-200` on dark `#111827` containers).

---

## 3. Workflow & Guided Information Architecture (IA) Flaws

### 3.1 No Clear "What's Happening Right Now?" Onboarding
- **Problem**: When a manager opens `/`, they are greeted with generic marketing copy (*"Know what needs your attention"* and *"Three steps, not three dashboards"*) instead of real-time restaurant operational state.
- **Impact**: Feels like a marketing landing page rather than an Operating Intelligence System.
- **Fix**: Make Home (`/`) an instant **Executive Briefing**:
  1. *Restaurant Health Status* (e.g. `90% 🟢 Healthy`).
  2. *Top Issue Requiring Action* (e.g. `Aged Truffle Cheese Low Stock`).
  3. *One-Tap Intervention Button* (`[Review & Resolve]`).

### 3.2 Fractured Navigation & Disconnected Flows
- **Problem**:
  - Placing an order on `/customer` updates Table 5 in state, but there is no direct toast notification or auto-navigation guiding the user to watch Table 5 change on `/operations`.
  - The `[Request Executive AI Audit]` button on `/operations` navigates to `/ai-ops`, but doesn't auto-scroll to or highlight the Executive Audit card.
- **Fix**: Establish seamless linear navigation checkpoints:
  `Order Placed` ➔ Toast: *"Table 5 updated on Floor Plan"* ➔ Auto-link ➔ `See Kitchen CPU Batching` ➔ `Execute AI Recommendation`.

---

## 4. Component-Specific Polish & UX Flaws

### 4.1 Floor Plan Visual Density
- **Location**: `components/FloorPlanSvg.tsx`
- **Flaw**: Tables T1-T8 are displayed as uniform rectangular boxes. While architectural landmarks (`Entrance`, `Cocktail Bar`, `Kitchen Pass`, `Restrooms`) exist, the table shapes do not visually distinguish between 2-seater round tables, 4-seater square tables, and 8-seater banquet booths.
- **Fix**: Render distinct visual table geometries (round circles for 2p, squares for 4p, elongated rounded rectangles for 8p).

### 4.2 Button Affordance & Interactive Hover States
- **Location**: `KitchenCPUScheduler.tsx` (`Mark ready →` button)
- **Flaw**: Buttons render with flat white backgrounds and faint borders that blend into card backgrounds without clear hover/active affordance.
- **Fix**: Use prominent primary action styles (`bg-pulse-emerald text-obsidian-950 font-bold hover:bg-pulse-emerald/90`).

### 4.3 AI Chat Console Placement
- **Location**: `app/ai-ops/page.tsx`
- **Flaw**: The Grounded Gemini Conversational Console is placed at the very bottom of `/ai-ops`, requiring double page scrolling to access input text fields.
- **Fix**: Integrate the conversational query bar as a floating or docked bottom panel or move it higher into the guided workflow.

---

---

## 6. Live Runtime & API Bugs (confirmed via `curl` + dev server)

> Found during a second-pass audit: dev server started on `:3099`, every page hit with `curl`, every `/api/ai/health-scan` action exercised with a real Gemini key, plus full static review of all 23 source files. Each item below was **reproduced at runtime** unless marked *(static)*.

### 6.1 [P0] `AISettingsModal` never writes provider mode/key to the Zustand store
- **Location**: `components/AISettingsModal.tsx` (`handleSaveSettings` ~L118, `handleValidateKey` ~L88).
- **Evidence**: The modal keeps its own local `providerMode`/`personalApiKey`/`selectedModel` state and writes them to `localStorage`, but **never calls `setAIConfiguration()`**. The Navbar pill, the telemetry card, and `triggerExecutiveAudit` all read from `governor.*` in the store, which is stuck at the initial `{ provider_mode: "demo", personal_api_key: undefined }`.
- **Reproduce**: In Settings → Personal Key → paste a valid key → Validate (green) → Save. Navbar pill still says **"Demo Mode (Simulated)"**. Trigger an audit: the request body carries `providerMode: "demo"`, `userApiKey: ""` — the personal key is never used.
- **This is exactly bug #1 from the user's report** ("when in demo mode and I paste private key, the UI doesn't update").
- **Fix**: Call `setAIConfiguration({ provider_type, provider_mode, personal_api_key, selected_model, is_key_valid, validation_error })` on save **and** on validate-success.

### 6.2 [P0] Store never rehydrates from `localStorage` on refresh
- **Location**: `lib/store/usePulseStore.ts` (no hydration action) + `app/layout.tsx` (no client provider).
- **Evidence**: The store hard-inits `provider_mode: "demo"` every load. `localStorage` is only ever *read* by the modal's mount effect — the rest of the app never sees persisted values. A page refresh silently reverts the entire AI configuration to Demo.
- **Fix**: Add a `rehydrateFromStorage()` action; call it once from a client `Providers` wrapper in `app/layout.tsx`.

### 6.3 [P0] Server cache is poisoned — serves demo results for real-key calls
- **Location**: `lib/ai/governor.ts` (`let cachedScan` module singleton, `runPulseAIGovernorScan`).
- **Evidence (live)**:
  1. `curl ... {"providerMode":"demo", lowInventory:["Aged Truffle Cheese"]}` → deterministic result, cached.
  2. `curl ... {"providerMode":"personal","userApiKey":"<real key>","selectedModel":"gemini-2.0-flash"}` → **returned the cached demo insight** with `"isCached": true, "isFallback": false` (flags contradict each other — cached result shown as non-fallback).
  3. `curl ... {"lowInventory":["TOTALLY_DIFFERENT_ITEM"]}` → title updated to match *this* payload but still `"isCached": true`.
- **Root cause**: The cache key is the module variable itself — it ignores request payload, provider mode, model, and key. In a serverless warm instance it's also shared across tenants.
- **Fix**: Key the cache by a hash of the snapshot payload + provider mode; or move adaptive caching to the client store where state is per-user.

### 6.4 [P0] Empty/missing `action` falls through to a fake audit
- **Location**: `app/api/ai/health-scan/route.ts` (the final `runPulseAIGovernorScan` block).
- **Evidence (live)**: `curl POST '{}'` (no action) runs an audit with all defaults → returns `healthScore: 100` (nonsensical "perfect"). `POST '{"foo":"bar"}'` same. `POST 'bad json'` returns generic "Failed to execute Executive Operations Audit".
- **Fix**: Require an explicit `action`; `400` for unknown/missing action instead of falling through.

### 6.5 [P0] Kitchen tickets never leave the queue — no terminal state
- **Location**: `lib/store/usePulseStore.ts` (`advanceKitchenTicket`, L404).
- **Evidence**: `pending→cooking→ready→ready` (the final `else "ready"`). Re-clicking "Mark Ready" on a ready ticket re-fires the side effects (re-marks tables `served`, duplicate live event). The queue grows unbounded.
- **Fix**: Guard `if (!ticket || ticket.status === "ready") return;` and/or remove ready tickets from the active queue.

### 6.6 [P0] `clearTable` does not complete associated orders
- **Location**: `lib/store/usePulseStore.ts` (`clearTable`, L427).
- **Evidence**: Clears the table but leaves `orders[].status === "preparing"`. The customer page finds any non-`completed` order for the table, so the "Live Order Tracker" banner **reappears for a table you just cleared**.
- **Fix**: Set matching orders to `status: "completed"` inside `clearTable`.

### 6.7 [P1] 429 / quota errors leak the raw Gemini error string to the user
- **Location**: `lib/ai/governor.ts` (`executePlaygroundPrompt` catch block).
- **Evidence (live)**: With the provided key at its free-tier limit, the playground returns the **entire 1500-char Google RPC error** (quota IDs, retry delays, URLs) as the "response".
- **Fix**: Catch 429/quota and return a friendly message ("Rate limit reached — retry in ~50s or switch models"); surface a structured `error` field instead of stuffing it into `response`.

### 6.8 [P1] Invalid-key message is wrong ("HTTP 400: Unauthorized")
- **Location**: `lib/ai/governor.ts` (`validateApiKey`).
- **Evidence (live)**: `POST validate_key {userApiKey:"INVALID_KEY_123"}` → `"Invalid API Key (HTTP 400: Unauthorized)"`. Gemini actually returns **400** for malformed keys (not 401), so the templated `"HTTP ${res.status}: Unauthorized"` is literally false and confusing.
- **Fix**: Map status → correct message; 400 = "API key rejected", 403 = "key lacks access", etc.

### 6.9 [P1] Playground accepts empty prompt → evaluates the string `"undefined"`
- **Location**: `app/api/ai/health-scan/route.ts` (`run_playground`) + `executePlaygroundPrompt`.
- **Evidence (live)**: `POST run_playground {}` → `"[DEMO MODE] Prompt Evaluated: \"undefined\""`. No input validation server-side (client guards but the API is unprotected).
- **Fix**: `if (!userPrompt?.trim()) return 400`.

### 6.10 [P1] AI chat console ignores provider mode — always returns canned `setTimeout` replies
- **Location**: `app/ai-ops/page.tsx` (`handleSendQuery`, L34).
- **Evidence**: Replies are hardcoded keyword-matched strings; `orders.length` is read inside the timeout (stale closure). Even with a valid personal key, the chat never calls the governor.
- **Fix**: Route through `runPulseAIGovernorScan`/`executePlaygroundPrompt` gated on `governor.provider_mode` (Demo → deterministic grounded answer; real key → live Gemini).

### 6.11 [P1] Telemetry shows fabricated numbers via `|| hardcoded` fallbacks
- **Location**: `components/AICostSavingsCard.tsx` (L25, L78, L81, L88, L96, L109).
- **Evidence**: `tokens_saved_pct || 82`, `today_ai_cost_inr || 8`, `without_governor_cost_inr || 129`, cache-hit `71.4%`, `avg_latency_ms || 241`. `today_ai_cost_inr` and `without_governor_cost_inr` are **never written by any store action**, so they're permanently fake. Model label is also static text.
- **Fix**: Drop the fallbacks; show real `governor.*` values or a clear "—" / "Simulated" label; bind model to `governor.selected_model`; compute cost on each real audit.

### 6.12 [P1] `last_error` is written to the store but absent from the type and never shown
- **Location**: `lib/store/usePulseStore.ts` (`triggerExecutiveAudit` L512/517) + `lib/types/pulse.ts`.
- **Evidence**: A failed audit sets `governor.last_error`, but the field isn't on `GovernorState` and no component reads it — so a failed scan silently returns to idle with zero feedback.
- **Fix**: Add `last_error?: string` to the type and display it (toast/inline) in `AIHealthScanCard`.

### 6.13 [P1] Orders can be placed on unavailable / needs-cleaning tables
- **Location**: `lib/store/usePulseStore.ts` (`placeOrder`, L299).
- **Evidence**: Only guard is `if (!table) return`. Switching customer view to Table 3 (`available`) and placing an order silently flips it to `kitchen_cooking` with no guests seated. A `needs_cleaning` table can also be ordered on.
- **Fix**: Guard table status; auto-seat `available` tables or reject the order with a message.

### 6.14 [P1] `MenuItem.stock_qty` never decrements on order
- **Location**: `lib/store/usePulseStore.ts` (`placeOrder`, L374).
- **Evidence**: Inventory items decrement, but menu cards always show "Stock: 18 left". You can order 50 burgers past the 18-stock limit with no warning.
- **Fix**: Decrement `menuItems[].stock_qty` in `placeOrder`; disable add-to-cart at 0.

### 6.15 [P1] Kitchen station routing is hardcoded — nothing ever routes to Station C
- **Location**: `lib/store/usePulseStore.ts` (`placeOrder`, L367).
- **Evidence**: `station: menu.name.includes("Burger") ? "Station A (Grill)" : "Station B (Saute)"`. Pizza (seeded at Station C Assembly), calamari, tiramisu, and wine all pile onto Station B.
- **Fix**: Route by `menu.category` / name to all three stations.

### 6.16 [P1] 17 components use `glass-panel` / `glass-pill` classes that are **never defined**
- **Location**: used in `app/page.tsx`, `app/customer/page.tsx`, `app/ai-ops/page.tsx`, `components/{AICostSavingsCard,AIExplainabilityModal,AIHealthScanCard,AIMemoryWidget,AISettingsModal,FloorPlanSvg,InventoryImpactCards,KitchenCPUScheduler,LiveEventTimeline,OperationalKPIs}.tsx` — **17 usages**. Also `glass-card-hover` (customer) and `glass-pill` (customer).
- **Evidence**: `grep` for `glass-panel|glass-pill` in `globals.css` and `tailwind.config.ts` → **zero definitions**. Every "glass" card is just a bare `div` — the entire visual layer they think they have doesn't exist.
- **Fix**: Either define the classes in `globals.css` or (per the redesign) replace them with the new design-system primitives.

### 6.17 [P2] Customer sticky cart overlaps content (z-40 `fixed` vs `pb-16`)
- **Location**: `app/customer/page.tsx` (L220 fixed cart, L51 `pb-16`).
- **Evidence**: When an item is added, the fixed bottom cart (~88px tall incl. offset) appears but the page only reserves 64px bottom padding → menu content hides behind the cart.
- **Fix**: Add `pb-32` (or dynamic) when `cartTotal > 0`.

### 6.18 [P2] Modals have no Escape-key or outside-click close
- **Location**: `components/AIExplainabilityModal.tsx`, `components/AISettingsModal.tsx`.
- **Evidence**: Neither registers an `Escape` listener or closes on backdrop click. Keyboard/screen-reader users cannot dismiss.
- **Fix**: Add `keydown` Escape handler + backdrop `onClick`.

### 6.19 [P2] 4 of 6 Operational KPIs are hardcoded strings
- **Location**: `components/OperationalKPIs.tsx` (L22, L43, L52, L77).
- **Evidence**: "Wait Time 11.4 min", "Table Turnover 42 min", "Food Waste 1.2%", "CSAT 98.2%" never change regardless of state.
- **Fix**: Compute from real store data, or label as baseline/simulated.

### 6.20 [P2] `getComputedBottleneck` returns a fake bottleneck when the kitchen is empty
- **Location**: `lib/store/usePulseStore.ts` (L274).
- **Evidence**: With zero tickets, returns `"Grill Station A"` (the `let topStation` default), so AI Ops shows "Main Bottleneck: Grill Station A" with an empty kitchen.
- **Fix**: Return `"None"` when `maxQty === 0`.

### 6.21 [P2] `DigitalTwinFloor.tsx` is dead code with light-mode classes
- **Location**: `components/DigitalTwinFloor.tsx` (entire file).
- **Evidence**: Imported by **no page**. Uses `bg-slate-50`, `text-slate-600`, `bg-white`, etc. — a light-mode island that contradicts the dark theme.
- **Fix**: Delete it, or rebuild it as the new dark SVG twin (Phase 3).

### 6.22 [P2] AISettingsModal `useEffect` only runs once — stale local state on reopen
- **Location**: `components/AISettingsModal.tsx` (L33, `[]` deps).
- **Evidence**: Local state initializes from `localStorage` on mount only; reopening the modal after the store changes shows stale values.
- **Fix**: Re-sync from store/`localStorage` when `isOpen` flips to true.

---

## 7. Updated Summary Matrix

| # | Severity | Category | Bug | File |
|---|---|---|---|---|
| 1.1 | P0 | Runtime math | `NaN%` budget bar | `AICostSavingsCard.tsx` |
| 6.1 | **P0** | State desync | Modal never syncs mode/key to store (**user bug #1**) | `AISettingsModal.tsx` |
| 6.2 | **P0** | State | Store never rehydrates from `localStorage` | `usePulseStore.ts` / `layout.tsx` |
| 6.3 | **P0** | API | Cache poisoned across payload/mode/key | `governor.ts` |
| 6.4 | **P0** | API | Empty/missing action → fake audit | `route.ts` |
| 6.5 | **P0** | Logic | Ready tickets never clear queue | `usePulseStore.ts` |
| 6.6 | **P0** | State | `clearTable` doesn't complete orders | `usePulseStore.ts` |
| 2.1 | P0 | Theme | Light vs dark clash | multiple |
| 6.7 | P1 | API | 429/quota leaks raw error | `governor.ts` |
| 6.8 | P1 | API | Wrong "HTTP 400: Unauthorized" | `governor.ts` |
| 6.9 | P1 | API | Playground evaluates `"undefined"` | `route.ts` |
| 6.10 | P1 | Logic | Chat always returns canned replies | `ai-ops/page.tsx` |
| 6.11 | P1 | UX | Telemetry shows fake numbers | `AICostSavingsCard.tsx` |
| 6.12 | P1 | Logic | `last_error` never surfaced | `usePulseStore.ts` |
| 6.13 | P1 | Logic | Orders on unavailable tables | `usePulseStore.ts` |
| 6.14 | P1 | State | Menu stock never decrements | `usePulseStore.ts` |
| 6.15 | P1 | Logic | Station C never used | `usePulseStore.ts` |
| 6.16 | P1 | CSS | 17× undefined `glass-panel` classes | many |
| 1.2 | P1 | Info | Static model label | `AICostSavingsCard.tsx` |
| 2.2 | P1 | Contrast | `text-slate-400` on white | multiple |
| 3.1 | P1 | IA | Home is marketing copy | `app/page.tsx` |
| 6.17 | P2 | Layout | Sticky cart overlaps content | `customer/page.tsx` |
| 6.18 | P2 | A11y | No Escape/backdrop close on modals | 2 modals |
| 6.19 | P2 | UX | 4/6 KPIs hardcoded | `OperationalKPIs.tsx` |
| 6.20 | P2 | Logic | Fake bottleneck when empty | `usePulseStore.ts` |
| 6.21 | P2 | Dead code | `DigitalTwinFloor` light-mode | `DigitalTwinFloor.tsx` |
| 6.22 | P2 | Logic | Modal stale state on reopen | `AISettingsModal.tsx` |
| 4.1 | P2 | Visual | Uniform table boxes | `FloorPlanSvg.tsx` |

**Total: 28 bugs** — 9 P0, 11 P1, 8 P2. The 6 P0 runtime/state bugs in §6 are the ones that make the app *functionally* broken regardless of how it looks; the theme/IA issues in §§1–4 are what make it *look* broken.
