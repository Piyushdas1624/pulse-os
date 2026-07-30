<div align="center">

# ⚡ PulseOS
### Restaurant Operating Intelligence

> *Restaurants don't need more software. They need operating intelligence.*

[![Next.js 15](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPiyushdas1624%2Fpulse-os)

**VibeAthon 6.0 — Smart Restaurant Management System**  
Built by [**@piyushdas1624**](https://github.com/Piyushdas1624) · Siliguri Govt. Polytechnic

</div>

---

## 🚀 What it is

**PulseOS** is a full-stack restaurant management platform that treats the dining room like an operating system. A live 2D floor-twin mirrors every table, ticket, and ingredient in real time; an AI "Governor" audits the floor state and recommends concrete actions (batch the curry, swap the gravy, defer the naan); and a QR-bound guest menu closes the loop from scan → order → kitchen → payment.

It's built around a single insight: restaurants don't suffer from a lack of software, they suffer from **disconnected, reactive** software. PulseOS shows operators what's *about* to happen, not just what already did.

---

## 🎬 Demo Flow

```text
[Guest QR Menu] ──► [Live Order Stream] ──► [2D Digital Twin Floor]
                                                    │
                                                    ▼
                                        [Kitchen CPU Scheduler]
                                                    │
                                                    ▼
                                       [PulseAI Governor Audit]
                                                    │
                                                    ▼
                                     [GST Checkout & Loyalty Rewards]
```

1. **Guest Places Order**: Guest scans a table QR or accesses `/customer?table=N` menu to order dishes (e.g., Galouti Kebab, Butter Chicken, Hyderabadi Dum Biryani).
2. **Floor & KDS Sync**: `/operations` updates table status to `IN KITCHEN` and reflects revenue on the 2D floor blueprint instantly.
3. **CPU Batching Trigger**: Kitchen scheduler detects concurrent dish orders across tables, issuing a batching directive: *"Batch 4x Butter Chicken across Tables 2 & 5 to save 12 mins prep."*
4. **Predictive Inventory Alert**: Inventory engine flags `Aged Truffle Butter` depleting in 38 minutes with ₹2,400 revenue exposed.
5. **Executive AI Audit**: General manager triggers a one-click audit via `/ai-ops` or `/settings`, executing operational reasoning against Gemini 3.6 Flash / OpenAI / Anthropic / OpenRouter.
6. **Checkout & Billing**: Guest checks out with itemized bill, 18% GST, tip, simulated payment progress, printable receipt, and loyalty reward points reveal.

---

## ✅ User Stories & Feature Breakdown

### User Story Status (VibeAthon 6.0 Matrix)

| Tier | Stories | Status |
|:---|:---|:---:|
| **Bronze** | Modern, intuitive UI for guests and management | ✅ |
| **Silver** | Secure auth (email + OTP, Google OAuth, role-based access); digital menu with live availability; smart table QR ordering; order management; checkout, billing & receipts; customer notifications | ✅ |
| **Gold** | Management dashboard — orders, tables (floor twin), inventory, staff roster, sales/revenue analytics, AI cost telemetry | ✅ |
| **Platinum** | Intelligent operations — multi-provider AI Governor, predictive inventory ("runs out in X min" + revenue exposed), demand-aware dish recommendations, smart batching, operational explainability | ✅ |
| **Bonus** | Public restaurant experience page (maps, gallery, 360° tour), loyalty rewards & PulsePoints, GST/tip checkout with confetti + receipt | ✅ |

### Feature Breakdown

#### 🔑 Authentication & Role-Based Access Control (RBAC)
- [x] **Email + Password with OTP Verification**: A 6-digit code verifies email before account creation (real email via Resend if `RESEND_API_KEY` set, or honest on-screen demo code).
- [x] **Google OAuth**: Includes a role-picker modal step (Owner / Manager / Kitchen Staff / Customer) to ensure role allocation.
- [x] **Phone OTP (Beta)**: Deterministic demo verification (`123456`) running smoothly on Firebase free tier.
- [x] **Role-Gated Routes**: Management routes are protected by role (`ProtectedRoute`); navigation items filter based on user permissions.

#### 🏛️ Floor Twin & Kitchen CPU Scheduler
- [x] **2D Digital Twin Floor Map**: Interactive SVG blueprint displaying seating geometry (2-seaters, 4-seaters, 8-seater booths), table status, and real-time revenue.
- [x] **Kitchen CPU Batching Engine**: Treats incoming orders like OS CPU processes, grouping identical dish preparations within time windows to boost kitchen throughput by up to 18%.
- [x] **Per-Table QR Code Generator**: Generates and prints custom QR codes binding the guest menu directly to specific tables (`/qr`).

#### 💳 Billing, Checkout & Public Experience
- [x] **Checkout Modal**: Itemized billing, 18% GST calculation, tip options (default 15%), 4-second simulated payment, confetti animation, and printable receipt.
- [x] **Loyalty Rewards & PulsePoints**: Earn points on checkout unlockable for future discounts.
- [x] **Public Restaurant Experience Page**: Interactive page showcasing location maps, food gallery, and 360° virtual tour (`/restaurant`).

---

## 🤖 AI Usage & Explainability

- **Multi-Provider Governor**: Supports Gemini 3.6 Flash / 2.5 Flash, OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and OpenRouter behind a unified execution engine with live model discovery.
- **INR (₹) Spend Telemetry**: Real-time tracking of input/output token usage converted to INR cost estimates, displaying cost-savings achieved with Governor optimizations.
- **Operational Explainability**: Every AI recommendation includes underlying reasoning and explicitly listed rejected alternatives ("why not") to build operator trust.
- **Predictive Inventory**: Computes real-time minutes-to-runout and rupee value exposed based on depletion velocity.

---

## 🛠️ Tech Stack

| Category | Choice |
|:---|:---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Warm-obsidian semantic design system `#0B0F14`) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (Reactive single-source-of-truth store) |
| **Auth** | Firebase Auth (Email/Password, Google OAuth, Phone OTP demo) |
| **Database & Profiles** | Cloud Firestore (`profiles` & `email_otps` collections) |
| **Email Verification** | Custom `/api/auth/email-otp` route via [Resend](https://resend.com/) API or demo mode |
| **AI Infrastructure** | Google Gemini API, OpenAI, Anthropic, OpenRouter |
| **QR Code Generation** | `qrcode.react` (Per-table QR code generator & print grid) |
| **Animations** | Framer Motion |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📐 Architecture Overview

```text
PulseOS Architecture
├── app/
│   ├── page.tsx                     # Executive Briefing & Operations Overview
│   ├── customer/page.tsx            # Guest QR Ordering & Checkout Portal
│   ├── operations/page.tsx          # 2D Digital Twin Floor & KDS Pass
│   ├── orders/page.tsx              # Order History & Revenue Analytics
│   ├── inventory/page.tsx           # Predictive Inventory & Stock Countdown
│   ├── kitchen/page.tsx             # Kitchen CPU Scheduler
│   ├── qr/page.tsx                  # Per-Table QR Code Generator & Print Grid
│   ├── restaurant/page.tsx          # Public Restaurant Experience (360° Tour & Gallery)
│   ├── staff/page.tsx               # Staff Roster Management
│   ├── ai-ops/page.tsx              # Intelligence Center & Cost Telemetry
│   ├── settings/page.tsx            # AI Provider & Key Config
│   ├── login/page.tsx               # Auth Login Screen
│   ├── register/page.tsx            # Auth Registration & OTP Verification
│   ├── api/ai/health-scan/route.ts  # Multi-Provider Serverless AI Audit
│   └── api/auth/email-otp/route.ts  # Email OTP Generation & Verification
├── components/
│   ├── FloorPlanSvg.tsx             # 2D Architectural SVG Floor Map
│   ├── KitchenCPUScheduler.tsx      # CPU Order Batching Component
│   ├── CheckoutModal.tsx            # GST + Tip Payment & Receipt Modal
│   ├── RolePickerModal.tsx          # Post-login Role Selector
│   ├── Navbar.tsx                   # Role-filtered Navigation Bar
│   └── ui/                          # Design System Primitives & Toast Host
└── lib/
    ├── ai/                          # Multi-provider AI abstraction & Governor
    ├── firebase/                    # Auth, RBAC ProtectedRoute, Firestore
    ├── store/                       # Zustand store (single source of truth)
    ├── types/                       # Shared TypeScript domain models
    └── utils/                       # Shared time & formatting helpers
```

---

## 🔑 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase and API keys:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Real Email OTP Delivery (Resend API)
RESEND_API_KEY=your_resend_api_key

# Optional: Server-side AI Provider Keys
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 💻 Installation & Local Development

```bash
# 1. Clone repository
git clone https://github.com/Piyushdas1624/pulse-os.git

# 2. Navigate to project directory
cd pulse-os

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev      # http://localhost:3000

# 5. Build for production (verifies zero TypeScript errors)
npm run build
```

---

## 🌐 Live Deployment (Vercel)

PulseOS is pre-configured for zero-config serverless deployment on **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPiyushdas1624%2Fpulse-os)

1. Import `Piyushdas1624/pulse-os` into Vercel.
2. Next.js App Router preset is auto-detected.
3. Configure `NEXT_PUBLIC_FIREBASE_*` and `GEMINI_API_KEY` in Environment Variables.
4. Deploy!

---

## 🧪 Demo & Operational Notes

- **In-Memory Demo Seeding**: Business data (tables, menu, orders, inventory) is maintained in the Zustand store and seeded with realistic Indian fine-dining demo data on load, enabling immediate flow exploration without requiring database migrations. User profiles and roles persist in Firestore.
- **Phone OTP Beta**: Phone OTP uses a deterministic demo code (`123456`) because Firebase Phone Auth requires the paid Blaze plan. It is clearly badged as Beta in the UI.

---

## 🔮 Future Scope

1. **Computer Vision Table Seating**: Integration of RTSP overhead camera feeds with YOLOv8 for automated table occupancy and clearing detection.
2. **Automated Inventory Re-ordering**: Automatic purchase order creation sent to supplier APIs when ingredient stock breaches critical thresholds.
3. **Hardware Printer Integration**: ESC/POS Bluetooth/USB physical thermal ticket printer support for kitchen pass printing.

---

## 🎯 Why PulseOS Stands Out

Most restaurant tools show you **what happened**. PulseOS shows you what's **about to happen** — then closes the loop end-to-end, from the QR scan in a guest's hand to the floor twin on the manager's screen to the settled bill and the loyalty reward that brings them back.

---

## 👤 Author & Maintainer

**Piyush Das** ([@piyushdas1624](https://github.com/Piyushdas1624))  
Siliguri Govt. Polytechnic — Computer Science & Technology  
- **GitHub**: [@piyushdas1624](https://github.com/Piyushdas1624)  
- **Repository**: [Piyushdas1624/pulse-os](https://github.com/Piyushdas1624/pulse-os)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Piyushdas1624">@piyushdas1624</a> for VibeAthon 6.0</sub>
</div>
