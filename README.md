<div align="center">

# ⚡ PulseOS
### Restaurant Operating Intelligence

> *Restaurants don't need more software. They need operating intelligence.*

[![Next.js 15](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**VibeAthon 6.0 — Smart Restaurant Management System**
Built by [**@piyushdas1624**](https://github.com/Piyushdas1624) · Siliguri Govt. Polytechnic

</div>

---

## 🚀 What it is

**PulseOS** is a full-stack restaurant management platform that treats the
dining room like an operating system. A live 2D floor-twin mirrors every table,
ticket and ingredient in real time; an AI "Governor" audits the floor state and
recommends concrete actions (batch the curry, swap the gravy, defer the naan);
and a QR-bound guest menu closes the loop from scan → order → kitchen → payment.

It's built around a single insight: restaurants don't suffer from a lack of
software, they suffer from **disconnected, reactive** software. PulseOS shows
operators what's *about* to happen, not just what already did.

---

## 🧭 Hosted application

> **Live link:** _add your Vercel URL here before submitting_
>
> ```
> https://your-pulseos-url.vercel.app
> ```

---

## 🛠️ Tech stack

| Layer | Choice |
|:---|:---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS (warm-obsidian semantic design system) |
| State | Zustand (reactive store driving every surface) |
| Auth | Firebase Auth — email/password, Google OAuth, phone OTP (demo) |
| Profiles | Cloud Firestore (`profiles` collection, role-linked) |
| Email verification | Custom OTP route — real email via Resend if `RESEND_API_KEY` is set, else an honest on-screen demo code |
| AI | Multi-provider Governor (Gemini / OpenAI / Anthropic / OpenRouter) with live model discovery, cost telemetry and explainability |
| QR | `qrcode.react` — per-table codes binding the guest menu to a table |
| Animations | Framer Motion |
| Deployment | Vercel |

> **Honest note:** business data (tables, menu, orders, inventory) is held in
> the in-memory Zustand store and seeds realistic Indian-restaurant demo data
> on load, so the full flow is explorable without a database migration. User
> profiles and roles persist in Firestore. Phone OTP runs in a deterministic
> **Beta** demo mode because Firebase Phone Auth requires the paid Blaze plan —
> it's clearly labelled as such in the UI.

---

## ✅ User stories completed

| Tier | Stories | Status |
|:---|:---|:---:|
| **Bronze** | Modern, intuitive UI for guests and management | ✅ |
| **Silver** | Secure auth (email + OTP, Google OAuth, role-based access); digital menu with live availability; smart table QR ordering; order management; checkout, billing & receipts; customer notifications | ✅ |
| **Gold** | Management dashboard — orders, tables (floor twin), inventory, staff roster, sales/revenue analytics, AI cost telemetry | ✅ |
| **Platinum** | Intelligent operations — multi-provider AI Governor, predictive inventory ("runs out in X min" + revenue exposed), demand-aware dish recommendations, smart batching, operational explainability | ✅ |
| **Bonus** | Public restaurant experience page (maps, gallery, 360° tour), loyalty rewards & PulsePoints, GST/tip checkout with confetti + receipt | ✅ |

### Authentication & roles
- **Email + password with OTP verification** — a 6-digit code verifies the
  email before the account is created (real email via Resend, or an honest
  demo code on-screen).
- **Google OAuth** — with a role-picker step so OAuth users choose
  Owner / Manager / Kitchen Staff / Customer (not silently defaulted).
- **Phone OTP (Beta)** — deterministic demo code (`123456`) that works on the
  Firebase free tier; clearly badged as Beta.
- **RBAC** — every management route is gated by role; the navbar filters links
  per role (owners/managers see everything, kitchen staff sees operations +
  orders, customers see the guest menu).

### The ordering loop
1. A guest scans a table QR → `/customer?table=N` opens the menu already bound
   to that table.
2. They order from a **live Indian fine-dining menu** (Galouti Kebab, Butter
   Chicken, Hyderabadi Dum Biryani, …); stock decrements in real time and the
   kitchen station routes automatically (Tandoor/Grill, Curry/Handi,
   Tawa/Biryani, Assembly/Desserts).
3. The order appears on the **operations floor-twin** and the **kitchen CPU
   scheduler** instantly.
4. At the end, the guest checks out — itemized bill, **18% GST**, tip
   (15% default), simulated payment with a 4-second progress, confetti, a
   printable receipt and a **loyalty reward** reveal.

---

## 🤖 AI usage

- **Multi-provider Governor** — Gemini, OpenAI, Anthropic and OpenRouter
  behind one abstraction, with live model discovery, key validation and per-
  request INR cost tracking (with vs. without-Governor savings).
- **Explainability** — every recommendation shows its reasoning *and* the
  rejected alternatives ("why not"), to make the AI trustworthy.
- **Predictive inventory** — each ingredient shows minutes-to-runout and the
  rupee value exposed, computed from live depletion.
- **Smart batching** — the kitchen scheduler treats identical dishes ordered
  across tables within a window as one batch (CPU-scheduling metaphor).
- This README, the spec and the implementation plan were authored with AI
  assistance (ZCode), then reviewed and committed by hand.

---

## 🗂️ Project structure

```
app/
  api/auth/email-otp/   OTP generation + verification (Resend or demo)
  api/ai/health-scan/   Multi-provider AI audit + advisor chat
  customer/             Guest QR menu + checkout
  operations/           Floor twin + kitchen scheduler + inventory
  orders/               Order history + revenue
  qr/                   Per-table QR generator + print grid
  restaurant/           Public experience (maps, gallery, 360°)
  staff/                Staff roster management
  ai-ops/, settings/    AI advisor + provider config
  login/, register/     Auth (email/Google/phone) + OTP verify
components/             FloorPlan, KitchenCPUScheduler, CheckoutModal, ...
lib/
  firebase/             Auth, RBAC (ProtectedRoute), RolePicker, OTP
  store/                Zustand store (single source of truth)
  ai/                   Provider abstraction + Governor
  types/                Shared TypeScript domain model
```

---

## 🔑 Environment variables

Copy `.env.local.example` to `.env.local` and fill in the Firebase keys:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# Optional — enables real email OTP delivery (else on-screen demo code):
RESEND_API_KEY=
# Optional — server-side AI key for env provider mode:
GEMINI_API_KEY=
```

---

## 💻 Run locally

```bash
git clone https://github.com/Piyushdas1624/pulse-os.git
cd pulse-os
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (zero TypeScript errors)
```

---

## 🎯 Why PulseOS stands out

Most restaurant tools show you **what happened**. PulseOS shows you what's
**about to happen** — then closes the loop end-to-end, from the QR scan in a
guest's hand to the floor twin on the manager's screen to the settled bill and
the loyalty reward that brings them back.

---

## 👤 Author

**Piyush Das** ([@piyushdas1624](https://github.com/Piyushdas1624))
Siliguri Govt. Polytechnic — Computer Science & Technology

---

*Built for VibeAthon 6.0 — Smart Restaurant Management System.*
