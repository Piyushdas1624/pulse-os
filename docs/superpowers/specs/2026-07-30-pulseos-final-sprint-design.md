# PulseOS Final Sprint — Design Spec

> **Date**: 2026-07-30 (deadline 23:59 IST) · **Event**: VibeAthon 6.0 — Smart Restaurant Management System
> **Scope**: Close the gap between the existing `implementation_plan.md` and codebase reality, to complete Silver → Gold → Platinum tiers and ship bonus features.
> **Time budget**: ~8–9 hours.

---

## 0. Architecture Stance

**Reality (verified by codebase audit):**
- Firebase Auth + Firestore `profiles` collection is the **only live** auth/data backend.
- `lib/supabase/` and `supabase/schema.sql` are **dead code**: no env vars, zero imports anywhere in `app/`, `components/`, `lib/`. `isSupabaseConfigured` is always `false`.
- All business data (tables, menu, orders, inventory, kitchen queue, staff) lives **in-memory in the Zustand store** (`lib/store/usePulseStore.ts`) and resets on refresh.

**Decision:** Standardize on **Firebase (auth) + Firestore (profiles) + Zustand (business data, in-memory)** for the demo. Delete dead Supabase files. Business data stays in-memory to avoid schema/migration/RLS risk on deadline night; the README states this honestly (pratfall effect).

**Rationale:** Attempting a Supabase migration on the final evening is high-risk for zero demo benefit. The Zustand store already powers a working floor plan + kitchen + AI flow.

---

## 1. Authentication Overhaul (`lib/firebase/AuthContext.tsx`)

### 1.1 Fix slowness
- **Root cause:** `loading` starts `true` and only flips `false` *after* `onAuthStateChanged` fires AND `await loadProfile(...)` completes. The login page fully blocks render on `loading`.
- **Fix:** Flip `loading=false` the instant `onAuthStateChanged` first fires. Run the Firestore profile read in the background; UI renders immediately and role/badge fills in when ready. Login page renders the form (with skeleton) instead of a spinner wall during initial load.

### 1.2 Fix role assignment for Google + Phone
- **Bug:** `signInWithGoogle` never passes a role, so `onAuthStateChanged` → `loadProfile(u)` uses the default `"customer"`. Google/phone users are permanently locked to customer and can never reach `/operations`, `/staff`, etc.
- **Fix:** Introduce `needsRoleSelection` flag in auth state + a **`RolePickerModal`** component. After any signup/login whose profile lacks a role (Google, phone, returning users with no role), force the modal before redirecting. Choices: Owner / Manager / Kitchen Staff / Customer. The picked role is written to the Firestore `profiles/{uid}` doc.

### 1.3 Email OTP (primary verification path — real & free)
- On registration, gate the account behind a 6-digit OTP:
  - Server route `/api/auth/email-otp` (crypto-random 6-digit code) stores it hashed + TTL in a Firestore `email_otps` doc keyed by email.
  - **If `RESEND_API_KEY` is set** → send a real email via Resend (free, 100/day).
  - Use `re_xxxxxxxxx` placeholder for Resend API Key.

Ask the user to replace `re_xxxxxxxxx` with their real API key.

```javascript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'piyushgsc1@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});
```
"
  - **Otherwise (Demo mode)** → display the code on-screen in a clearly labeled "Demo mode" banner.
  - Additionally fire Firebase's native `sendEmailVerification` in the background so a real email genuinely lands.
- Verification logic is real; delivery is demo-safe. This satisfies the "Email & Password with OTP (or equivalent verification)" requirement honestly.

### 1.4 Phone OTP (honest Beta)
- **Bug:** Demo OTP accepts *any* 6-digit code (logic: `code !== "123456" && code !== "000000" && code.length !== 6` — a 6-digit non-123456 code passes because the AND short-circuits).
- **Fix:** Deterministic — **only `123456` passes**.
- **Persistence bug:** Demo phone user is a fabricated in-memory object that vanishes on refresh.
- **Fix:** Persist demo phone session to `localStorage`; re-hydrate on mount.
- Keep visible **`(Beta)`** badge + tooltip explaining it needs Firebase's Blaze (paid) plan in production.

### 1.5 Cleanup
- Remove `lib/supabase/`, `supabase/schema.sql`. Remove `@supabase/supabase-js` from `package.json` (after confirming no live imports — none exist).

---

## 2. RBAC (new)

- **`lib/firebase/ProtectedRoute.tsx`** — component with `allowedRoles: Role[]` prop. If `user` is null → redirect to `/login`. If `profile.role` not in `allowedRoles` → show "No access" view. While auth is resolving → skeleton (no full block).
- **Navbar role gating** — per matrix:
  - Owner / Manager: all links (Overview, Operations, Staff, Orders, Guest Ordering, QR Codes, AI Advisor, Settings)
  - Kitchen Staff: Operations, Orders
  - Customer: Guest Ordering only
- Fix role badge fallback bug (`Navbar.tsx:75` — fallback "Manager" → actual role / "Guest").
- **Route wrapping:**
  - `/` (Overview), `/operations`, `/staff`, `/orders`, `/ai-ops`, `/settings`, `/qr` → `allowedRoles={['owner','manager']}` (plus kitchen_staff where noted).
  - `/customer` → public (guest QR menu).
  - `/login`, `/register` → public.

| Route | Owner | Manager | Kitchen Staff | Customer | Public |
|:---|:---:|:---:|:---:|:---:|:---:|
| `/login`, `/register` | — | — | — | — | ✅ |
| `/` Overview | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/operations` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/orders` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/customer` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/staff` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/ai-ops`, `/settings` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/qr` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 3. Indian Fine-Dining Menu (full replacement)

Replace the 6 Western/Italian items (`INITIAL_MENU` in `usePulseStore.ts`) with ~12 Indian fine-dining dishes:

- **Starters:** Galouti Kebab, Paneer Tikka Shashlik, Tandoori Prawns
- **Mains:** Butter Chicken, Hyderabadi Dum Biryani, Dal Bukhara, Rogan Josh, Malai Kofta
- **Desserts:** Gulab Jamun, Phirni
- **Beverages:** Masala Chai, Salted Lassi

Each item: id, name, category, price (₹), description, prep_time_min, stock_qty, inventory_keys.

- Update **`stationFor()`** routing to Indian stations: **Tandoor/Grill**, **Curry/Handi**, **Tawa/Biryani**, **Assembly/Desserts**.
- Update **inventory** seed to match (Mutton, Paneer, Basmati Rice, Ghee, Saffron, Fresh Cream, Yogurt, Tandoor Masala).
- Update kitchen ticket + live event seeds to reference Indian dishes.

---

## 4. QR Ordering System (new)

`qrcode.react` is already installed but unused.

- **`/qr` page** — grid of 8 per-table QR cards. Each encodes `{origin}/customer?table=N`. Features: per-card download (PNG/SVG), "Print All" → printable full-page grid. Each card shows Table #, capacity, zone.
- **Customer page** — read `?table=N` via `useSearchParams`; auto-select that table; show "Scanned Table N" banner. Completes the QR → order → floor plan pipeline.
- **Psychology:** concrete proof the system works in a real restaurant; judges can scan it themselves (endowment effect).

---

## 5. Checkout & Billing (new)

Add missing types (confirmed absent):
- **`PaymentInfo`** — method, subtotal, tax_amount (GST 18%), tip_amount, tip_percent, grand_total, status (`unpaid | paid | refunded`), paid_at.
- **`OrderHistoryItem`** — order_id, table_number, customer_name, items, total_amount, tax_amount, tip_amount, payment_status, payment_method, created_at, completed_at.

**`components/CheckoutModal.tsx`** (triggered on customer page after ordering):
- Itemized bill → Subtotal → **GST 18%** → **Tip** (buttons: 10/15/18/20/Custom; **15% pre-selected** = anchoring) → Grand Total.
- Payment methods: UPI QR (mock), Card (mock), Cash.
- "Pay" → **4-second progress bar** (goal-gradient) → **confetti + expanding-checkmark** (peak-end) → **rewards/loyalty offer reveal** (reciprocity + endowment).
- Printable **receipt view** (thermal-style).
- Store actions: extend `placeOrder`/`clearTable` to push to `orderHistory` with payment info; `/orders` and home page reflect paid orders.

---

## 6. Psychology Polish (selective, from `psychology.md`)

Woven into the above, not bolted on:
- Breathing animation (scale 1.0→1.02 over 3s) on top AI recommendation card — Von Restorff.
- Order-confirmation animation (expanding circle + checkmark) on customer page — peak-end dopamine.
- Countdown timer (seconds) on the most critical inventory item — urgency amplification.
- "PulseOS saved ₹X tonight" banner on home — value proof.
- "AI Actions Applied: N" counter on home — gamification.
- Tip anchoring + payment confetti (§5).

---

## 7. Bonus Features (after §1–§6 are solid)

Priority order, cuttable without hurting tier ladder:
1. **Public Restaurant experience page:** Google Maps embed + info card (dining hours, min spend, public transport, charging points) + restaurant images + **Kuula 360° embed** (high visual wow, low effort).
2. **Smart Reservations:** date/time/party-size booking with confirmation + scarcity ("only 2 tables left tonight").
3. **Customer reviews/loyalty:** post-checkout rating + loyalty reward redemption.

---

## Build Sequence

1. Auth overhaul + RBAC (gate — must work first)
2. Indian menu + inventory + station routing
3. QR system + customer `?table=` wiring
4. Checkout/billing + types
5. Psychology polish
6. Bonus features (if time) → README → build check → commit

---

## Verification Plan

1. **Auth:** Register (email) → OTP → role picker → dashboard. Google → role picker. Phone → Beta 123456 → persists on refresh. Speed: form renders immediately, no spinner wall.
2. **RBAC:** Customer login can't reach `/operations`. Kitchen staff sees only Operations/Orders.
3. **Menu:** Customer page shows Indian dishes; kitchen routes to Indian stations.
4. **QR:** `/qr` generates 8 codes; scanning `/customer?table=3` auto-selects Table 3.
5. **Billing:** Place order → checkout → 18% GST + 15% tip default → pay → confetti → receipt → appears in `/orders`.
6. **Build:** `npm run build` passes with zero TS errors.
