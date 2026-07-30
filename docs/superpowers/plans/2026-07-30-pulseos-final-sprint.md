# PulseOS Final Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gap between `implementation_plan.md` and codebase reality to ship a complete Silver→Gold→Platinum restaurant management system by 23:59 IST tonight.

**Architecture:** Firebase Auth (email/Google/phone) + Firestore `profiles` + Zustand in-memory business data. Dead Supabase code removed. New RBAC gate, Indian menu, QR ordering, checkout/billing, and selective psychology polish. Business data stays in-memory (demo-safe, no migration risk on deadline night).

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Zustand · Firebase 12 · Firestore · `qrcode.react` · `framer-motion` · Tailwind (warm-obsidian semantic tokens).

## Global Constraints

- **Verification gate (not TDD):** This codebase has no test runner. Every task's verification is `npm run build` (zero TS errors) + lint + a manual check described in the task. Do NOT add a unit-test harness — out of scope for deadline night.
- **No blocking spinner walls:** Auth must render UI immediately; profile loads in background.
- **Honesty for pratfall effect:** Beta/demo features are explicitly labeled, not hidden.
- **Currency ₹ INR, Indian fine-dining context** throughout menu/inventory/staff.
- **Frequent commits:** one logical change per commit, clear `feat:`/`fix:` prefixes.
- **Follow existing patterns:** use `components/ui/primitives.tsx` (Panel, Button, Tag, Stat, cx, etc.) and the obsidian semantic color tokens; do not introduce neon glows.
- **Touch only what each task needs;** don't reformat unrelated files.

---

## File Structure

**New files:**
- `lib/firebase/ProtectedRoute.tsx` — RBAC gate component (`allowedRoles` prop).
- `lib/firebase/RolePickerModal.tsx` — forces role selection for Google/phone/roleless logins.
- `lib/firebase/emailOtp.ts` — client helpers for email OTP (request + verify) calling the API route.
- `app/api/auth/email-otp/route.ts` — generates/verifies 6-digit OTP; Resend email if key present else demo-mode.
- `components/CheckoutModal.tsx` — itemized bill, GST 18%, tip anchoring, 4s pay, confetti, receipt.
- `components/RewardOffer.tsx` — post-payment loyalty reward reveal (reciprocity/endowment).
- `app/qr/page.tsx` — per-table QR grid + print-all.
- `app/restaurant/page.tsx` — public experience page (maps, info, images, Kuula 360°). [Bonus]
- `lib/data/menu.ts` — Indian fine-dining menu seed + station routing (extracted from store for clarity).

**Modified files:**
- `lib/firebase/AuthContext.tsx` — speed fix, role selection flag, deterministic phone OTP, persist demo session, remove Supabase dependency on auth.
- `lib/firebase/config.ts` — (only if needed) expose db readiness.
- `lib/types/pulse.ts` — add `PaymentInfo`, `OrderHistoryItem`; align menu category strings; ensure `Role` type exported.
- `lib/store/usePulseStore.ts` — Indian menu/inventory/kitchen/live-event seeds, `stationFor` routing, `orderHistory` state + actions, payment info on orders.
- `app/login/page.tsx` — no full-block on loading; wire email-OTP verification step.
- `app/register/page.tsx` — email-OTP gate; wire `phoneNum`; remove dead-field bug.
- `app/layout.tsx` — mount `RolePickerModal` globally.
- `components/Navbar.tsx` — role-gated links; fix badge fallback.
- `app/customer/page.tsx` — read `?table=N`; checkout button → `CheckoutModal`; Indian menu renders automatically via store.
- `app/page.tsx` — "saved ₹X tonight" banner + "AI Actions Applied" counter.
- `app/orders/page.tsx`, `app/staff/page.tsx`, `app/operations/page.tsx`, `app/ai-ops/page.tsx`, `app/settings/page.tsx`, `/qr` — wrap with `ProtectedRoute`.
- `app/operations/page.tsx` (or relevant inventory component) — countdown timer on critical item.
- `components/AIHealthScanCard.tsx` (or top recommendation card) — breathing animation.
- `README.md` — honest submission content.
- `package.json` — remove `@supabase/supabase-js`.

**Deleted files:**
- `lib/supabase/client.ts`, `supabase/schema.sql` (and `supabase/` dir if empty).

---

## Task 1: Remove dead Supabase code

**Files:**
- Delete: `lib/supabase/client.ts`
- Delete: `supabase/schema.sql` (+ remove `supabase/` dir if empty)
- Modify: `package.json` (remove `@supabase/supabase-js`)
- Modify: `.env.local.example` (remove any Supabase lines if present)

**Interfaces:**
- Produces: a codebase with zero `supabase` references. No consumer exists (verified by grep in spec).

- [ ] **Step 1:** Grep to confirm no live imports: `grep -ri "supabase" app components lib` → expect zero hits in source (only the to-be-deleted files).
- [ ] **Step 2:** Delete the two files and the dir.
- [ ] **Step 3:** Remove the `"@supabase/supabase-js"` line from `package.json` deps.
- [ ] **Step 4:** Run `npm install` to update lockfile.
- [ ] **Step 5:** Run `npm run build` → expect success with zero references.
- [ ] **Step 6:** Commit: `chore: remove dead supabase code`

---

## Task 2: Types — add payment, order history, export Role

**Files:**
- Modify: `lib/types/pulse.ts`

**Interfaces:**
- Produces (used by Tasks 5, 6, 8):
  - `export type Role = 'owner' | 'manager' | 'kitchen_staff' | 'customer';`
  - `export interface PaymentInfo { method: 'upi'|'card'|'cash'; subtotal: number; tax_amount: number; tip_amount: number; tip_percent: number; grand_total: number; status: 'unpaid'|'paid'|'refunded'; paid_at?: string; }`
  - `export interface OrderHistoryItem { order_id: string; table_number: number; customer_name: string; items: { name: string; qty: number; price: number }[]; total_amount: number; tax_amount: number; tip_amount: number; payment_status: PaymentInfo['status']; payment_method?: PaymentInfo['method']; created_at: string; completed_at?: string; }`

- [ ] **Step 1:** Add the three exports above to `lib/types/pulse.ts`. Reuse `Role` in `StaffMember`/profile types if a local role string exists; otherwise leave existing staff role union untouched.
- [ ] **Step 2:** `npm run build` → success.
- [ ] **Step 3:** Commit: `feat(types): add PaymentInfo, OrderHistoryItem, Role`

---

## Task 3: Auth speed + role selection flag (AuthContext)

**Files:**
- Modify: `lib/firebase/AuthContext.tsx`

**Interfaces:**
- Produces (consumed by Tasks 4, 6, layout): auth context now exposes `needsRoleSelection: boolean` and `setRoleAndContinue(role: Role): Promise<void>`. `loading` flips false on first `onAuthStateChanged` fire (profile loads in background).

- [ ] **Step 1:** Read current `AuthContext.tsx` fully to capture exact line anchors.
- [ ] **Step 2:** Change initial-load gating: in `onAuthStateChanged` callback, call `setLoading(false)` immediately on first invocation (before awaiting `loadProfile`). Move the `await loadProfile(...)` into a non-blocking `.then()`/async fire-and-forget so the UI renders while the profile resolves.
- [ ] **Step 3:** Add `needsRoleSelection` state. Set it `true` when a logged-in user's profile is missing a `role` (or role is empty/unknown) — i.e. inside `loadProfile` after the Firestore read. Reset to `false` in `signOut` and after `setRoleAndContinue`.
- [ ] **Step 4:** Implement `setRoleAndContinue(role)`: writes `{ role }` to `doc(db,'profiles',uid)` via `setDoc(merge)`, updates local `profile` state, sets `needsRoleSelection=false`.
- [ ] **Step 5:** Fix the phone demo-OTP acceptance bug — change the condition so **only** `123456` (and documented `000000` as alternate) passes; reject all others including any 6-digit code.
- [ ] **Step 6:** Persist the demo phone session: on successful demo phone verify, write the stub user to `localStorage` key `pulseos.demo.phone`; on provider mount, if `getAuth().currentUser` is null and that key exists, re-hydrate it into user/profile state. Clear key on `signOut`.
- [ ] **Step 7:** `npm run build` → success.
- [ ] **Step 8:** Manual check: refresh on a logged-out page renders instantly (no spinner wall).
- [ ] **Step 9:** Commit: `fix(auth): unblock UI during profile load, add role selection, fix phone OTP, persist demo session`

---

## Task 4: RolePickerModal + global mount

**Files:**
- Create: `lib/firebase/RolePickerModal.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `useAuth()` → `needsRoleSelection`, `setRoleAndContinue`, `user`. `Role` type from Task 2.
- Produces: a modal overlay shown whenever `needsRoleSelection === true`, rendering four role cards (Owner/Manager/Kitchen Staff/Customer) that call `setRoleAndContinue(role)`.

- [ ] **Step 1:** Create `lib/firebase/RolePickerModal.tsx` — a `"use client"` component. If `!needsRoleSelection` return `null`. Otherwise render a centered overlay (use Panel primitive) with 4 cards. Each card: role label, one-line description, click → `setRoleAndContinue(role)`. Match obsidian tokens; use `framer-motion` for a subtle entrance.
- [ ] **Step 2:** In `app/layout.tsx`, render `<RolePickerModal />` alongside existing providers (inside `AuthProvider`).
- [ ] **Step 3:** `npm run build` → success.
- [ ] **Step 4:** Manual check: Google login with a fresh user → modal appears → pick "Owner" → badge shows Owner; refresh persists role.
- [ ] **Step 5:** Commit: `feat(auth): role picker modal for google/phone/roleless logins`

---

## Task 5: Email OTP (real & free)

**Files:**
- Create: `app/api/auth/email-otp/route.ts`
- Create: `lib/firebase/emailOtp.ts`
- Modify: `app/register/page.tsx`
- Modify: `app/login/page.tsx` (loading-block fix only, here)

**Interfaces:**
- Produces:
  - POST `/api/auth/email-otp` body `{ email: string }` → `{ ok: true, demo?: { code: string } }` (code only returned when no Resend key).
  - POST `/api/auth/email-otp` body `{ email, code }` → `{ ok: boolean }`.
  - Client `requestEmailOtp(email)` / `verifyEmailOtp(email, code)` in `lib/firebase/emailOtp.ts`.

- [ ] **Step 1:** Create `app/api/auth/email-otp/route.ts`. On POST: parse body. If `code` present → verify against hashed doc in Firestore `email_otps/{email}` (compare hash, check `expiresAt > now`, not consumed) → set consumed, return `{ok}`. If no `code` → generate crypto-random 6 digits, hash, store `{hash, expiresAt: now+10m, consumed:false}` in `email_otps/{email}`; if `process.env.RESEND_API_KEY` → send email via Resend (`/emails`, from `onboarding@resend.dev`), else return `{ok:true, demo:{code}}`.
- [ ] **Step 2:** Create `lib/firebase/emailOtp.ts` — thin fetch wrappers around the route above; throw on non-ok.
- [ ] **Step 3:** In `register/page.tsx`, add a 2-step flow: (a) fill form → "Send code" → (b) 6-digit input → "Verify & create". On verify success call existing `signUpWithEmail`. Show demo code on-screen if returned. Wire the previously-dead `phoneNum` into the profile payload (fix dead-field bug).
- [ ] **Step 4:** In `login/page.tsx`, replace the full-block `if (loading) return <spinner>` with rendering the form + skeleton so the page is never blank.
- [ ] **Step 5:** `npm run build` → success.
- [ ] **Step 6:** Manual check: register → receive/show code → verify → account created → role picker.
- [ ] **Step 7:** Commit: `feat(auth): email OTP verification (Resend or demo mode)`

---

## Task 6: RBAC — ProtectedRoute + Navbar gating

**Files:**
- Create: `lib/firebase/ProtectedRoute.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `app/page.tsx`, `app/operations/page.tsx`, `app/orders/page.tsx`, `app/staff/page.tsx`, `app/ai-ops/page.tsx`, `app/settings/page.tsx`

**Interfaces:**
- Produces: `ProtectedRoute({ allowedRoles, children })` — null user → redirect `/login`; wrong role → "No access" view; resolving → skeleton (no block).
- Consumes: `useAuth()` (`user`, `profile`, `loading`), `Role`.

- [ ] **Step 1:** Create `lib/firebase/ProtectedRoute.tsx` per interface. Use `useRouter` for redirect. Role check: `profile?.role` (await profile arrival; show skeleton while `loading` or `!profile && user`).
- [ ] **Step 2:** Navbar: build link sets by role per the spec matrix. Fix badge fallback `profile?.role || "Manager"` → `profile?.role || "Guest"`.
- [ ] **Step 3:** Wrap each management page's content with `<ProtectedRoute allowedRoles={[...]}>`. Overview/Operations/Orders → `['owner','manager','kitchen_staff']`; Staff/AI/Settings → `['owner','manager']`.
- [ ] **Step 4:** `npm run build` → success.
- [ ] **Step 5:** Manual check: log in as customer → `/operations` redirects or shows no-access; as owner → full nav.
- [ ] **Step 6:** Commit: `feat(auth): RBAC protected routes + role-gated navbar`

---

## Task 7: Indian fine-dining menu + station routing

**Files:**
- Create: `lib/data/menu.ts`
- Modify: `lib/store/usePulseStore.ts` (INITIAL_MENU, inventory, kitchen/live-event seeds, `stationFor`)
- Modify: `lib/types/pulse.ts` only if category union needs new values (it already covers starters/mains/desserts/beverages)

**Interfaces:**
- Produces: `INITIAL_MENU: MenuItem[]` (12 Indian dishes) and updated `stationFor(name, category)` returning one of `"Tandoor/Grill" | "Curry/Handi" | "Tawa/Biryani" | "Assembly/Desserts"`. Note: `KitchenTicket.station` union in `pulse.ts` (currently Station A/B/C) must be widened to these 4 strings — update it here.

- [ ] **Step 1:** Update `KitchenTicket.station` union in `lib/types/pulse.ts` to the 4 Indian stations.
- [ ] **Step 2:** Create `lib/data/menu.ts` exporting `INDIAN_MENU: MenuItem[]` (12 dishes across categories, INR prices, prep_time_min, stock_qty, inventory_keys referencing new inventory).
- [ ] **Step 3:** In the store, replace `INITIAL_MENU` with `INDIAN_MENU`. Update inventory seed to Mutton, Paneer, Basmati Rice, Ghee, Saffron, Fresh Cream, Yogurt, Tandoor Masala — wire `inventory_keys` so stock depletion maps correctly (mirror existing `placeOrder` inventory-decrement logic).
- [ ] **Step 4:** Rewrite `stationFor`: kebab/tikka/tandoori/prawns → Tandoor/Grill; butter chicken/dal/rogan josh/malai kofta → Curry/Handi; biryani → Tawa/Biryani; desserts/beverages → Assembly/Desserts.
- [ ] **Step 5:** Update kitchen ticket + live event seed text to Indian dishes.
- [ ] **Step 6:** `npm run build` → success.
- [ ] **Step 7:** Manual check: `/customer` shows Indian menu; place a Butter Chicken order → kitchen ticket routes to Curry/Handi; inventory decrements.
- [ ] **Step 8:** Commit: `feat(menu): Indian fine-dining menu, inventory, and station routing`

---

## Task 8: Checkout & billing — types already in place, store + modal

**Files:**
- Modify: `lib/store/usePulseStore.ts` (orderHistory state + actions; payment on orders)
- Create: `components/CheckoutModal.tsx`
- Create: `components/RewardOffer.tsx`
- Modify: `app/customer/page.tsx` (checkout button, QR table param)

**Interfaces:**
- Produces: store state `orderHistory: OrderHistoryItem[]`; actions `checkoutTable(tableId, payment: PaymentInfo)`, `getRevenueToday()`. `CheckoutModal({ tableId, onClose })`.

- [ ] **Step 1:** Add `orderHistory: OrderHistoryItem[]` (seed `[]`) + `checkoutTable` action: computes totals from the table's open order, applies GST 18% + tip, pushes an `OrderHistoryItem`, marks order completed, clears table. Add `getRevenueToday()` selector (sum `total_amount + tax_amount + tip_amount` for today's items).
- [ ] **Step 2:** Create `components/RewardOffer.tsx` — post-pay loyalty card: "You earned 250 PulsePoints" + a redeemable offer (e.g. "₹200 off your next visit"). Beautiful UI; framer-motion reveal.
- [ ] **Step 3:** Create `components/CheckoutModal.tsx` — itemized bill, GST 18%, tip buttons 10/15/18/20/Custom with **15% pre-selected**, grand total; method selector (UPI QR mock/Card mock/Cash); "Pay" → 4s progress bar → confetti (framer-motion burst) + expanding checkmark → `<RewardOffer/>` → "View Receipt" (printable thermal layout, `window.print()`). Calls `checkoutTable`.
- [ ] **Step 4:** Customer page: read `?table=N` via `useSearchParams`, auto-select table, show "Scanned Table N" banner; add "Checkout / Pay" button → opens `CheckoutModal`.
- [ ] **Step 5:** `npm run build` → success.
- [ ] **Step 6:** Manual check: order → checkout → 15% tip default → pay → confetti → reward → receipt; `/orders` shows the paid order.
- [ ] **Step 7:** Commit: `feat(billing): checkout modal, GST+tip, payment flow, rewards, receipts`

---

## Task 9: QR ordering system

**Files:**
- Create: `app/qr/page.tsx`
- Modify: `app/layout.tsx` or Navbar (link)

**Interfaces:**
- Produces: `/qr` page — grid of 8 per-table QR cards encoding `{origin}/customer?table=N`, per-card download, "Print All". Uses `qrcode.react`.

- [ ] **Step 1:** Create `app/qr/page.tsx` (wrap with ProtectedRoute owner/manager). Use `qrcode.react`'s `QRCodeCanvas` (or SVG). Each card: QR (value = `${window.location.origin}/customer?table=${n}`), Table #, capacity, zone, "Download" (canvas → PNG blob), "Print All" opens print-optimized layout.
- [ ] **Step 2:** Ensure Navbar includes the QR link for owner/manager.
- [ ] **Step 3:** `npm run build` → success.
- [ ] **Step 4:** Manual check: `/qr` renders 8 codes; open `/customer?table=3` → auto-selects Table 3 banner.
- [ ] **Step 5:** Commit: `feat(qr): per-table QR code generator and print grid`

---

## Task 10: Psychology polish (selective)

**Files:**
- Modify: top AI recommendation card component (e.g. `components/AIHealthScanCard.tsx` or the recommendation card on `/`)
- Modify: critical inventory component (countdown timer)
- Modify: `app/page.tsx` (banners)
- Modify: `app/customer/page.tsx` (order confirmation animation)

- [ ] **Step 1:** Breathing animation: add a framer-motion `animate={{scale:[1,1.02,1]}} transition={{duration:3, repeat:Infinity}}` wrapper to the top AI recommendation card.
- [ ] **Step 2:** Countdown timer: on the most critical inventory item, render a live `mm:ss` countdown (driven by a `setInterval` + the item's depletion estimate). Red pulse when < 10 min.
- [ ] **Step 3:** Home banners: "PulseOS saved ₹X tonight" (derive from `getRevenueToday()` or AI savings) + "AI Actions Applied: N" (from `aiMemory.length`).
- [ ] **Step 4:** Order confirmation animation on customer page: expanding circle + checkmark after `placeOrder` (peak-end).
- [ ] **Step 5:** `npm run build` → success.
- [ ] **Step 6:** Manual check: breathing card visible; countdown ticks; banners show; order shows confirmation.
- [ ] **Step 7:** Commit: `feat(polish): breathing AI card, inventory countdown, saved₹ banner, order confirmation`

---

## Task 11: Bonus — public Restaurant experience page (if time)

**Files:**
- Create: `app/restaurant/page.tsx`

- [ ] **Step 1:** Create page: Google Maps `<iframe>` embed; info card (dining hours, min spend, public transport, charging points); image gallery (Google images URLs); Kuula 360° embed via the provided `<script>` tag (use `next/script`, `dangerouslySetInnerHTML` wrapper or the Kuula embed snippet).
- [ ] **Step 2:** Link from Navbar (public).
- [ ] **Step 3:** Build + manual check + commit: `feat(restaurant): public experience page with maps, gallery, 360° tour`

> Smart Reservations and Customer reviews/loyalty are deferred — only if Tasks 1–11 finish with comfortable margin. Cut without hurting the tier ladder.

---

## Task 12: README + final build + commit

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Rewrite README: Team Name, Tech Stack (Next.js 15, Firebase Auth+Firestore, Zustand, Gemini/multi-provider AI, qrcode.react, framer-motion), User Stories Completed (Bronze✅ Silver✅ Gold✅ Platinum✅), AI Usage, Hosted Link placeholder, honest note on in-memory demo data + Beta phone auth. Subtle (not boastful) framing of why it stands out.
- [ ] **Step 2:** `npm run build` → zero errors.
- [ ] **Step 3:** Final commit: `docs: hackathon submission README`.

---

## Self-Review (run after writing)

**Spec coverage:** §0 cleanup→T1; §1.1 speed→T3; §1.2 role→T3/T4; §1.3 email OTP→T5; §1.4 phone→T3; §2 RBAC→T6; §3 menu→T7; §4 QR→T9 (+T8 wires `?table=`); §5 billing→T8; §6 psych→T10; §7 bonus→T11. All covered. README→T12.

**Type consistency:** `Role`, `PaymentInfo`, `OrderHistoryItem` defined in T2, consumed in T3/T4/T6/T8. `KitchenTicket.station` widened in T7 (called out). `checkoutTable`/`getRevenueToday` defined T8, used T10. Consistent.

**Placeholder scan:** No TBDs; each task has exact files, steps, and a build/manual verification gate adapted for this no-test-runner codebase.
