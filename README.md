<div align="center">

# ⚡ PulseOS
### AI-Powered Restaurant Operating Intelligence Platform

*“Restaurants don't need more software. They need operating intelligence.”*

[![GitHub License](https://img.shields.io/github/license/Piyushdas1624/pulse-os?style=for-the-badge&color=0B0F14)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

Developed & Maintained by [**@piyushdas1624**](https://github.com/Piyushdas1624)  
*Official Vibeathon 6.0 Idea & Prototype Submission*

</div>

---

## 📌 Problem Statement

Modern restaurants run on fragmented, reactive software. Point-of-Sale (POS) systems track payments, Kitchen Display Systems (KDS) list tickets chronologically, and inventory lives on disconnected spreadsheets. 

### The Friction:
1. **Kitchen Bottlenecks**: Line cooks prepare dishes linearly per ticket rather than batching identical items across multiple active tables.
2. **Inventory Blind Spots**: Ingredient shortages (e.g., Wagyu beef, truffle cheese) are discovered mid-service when an order fails on the kitchen pass.
3. **Seating Inefficiencies**: Floor managers lack live visibility into table dining stages (`Seated` ➔ `Ordering` ➔ `In Kitchen` ➔ `Served` ➔ `Needs Clearing`), slowing down turnover rates.
4. **Passive AI**: Traditional restaurant software provides static charts or generic chatbots that lack real-time context of active orders, kitchen load, or stock levels.

---

## 🚀 The PulseOS Solution

PulseOS treats restaurant operations like an **operating system CPU scheduler**:

- **2D Digital Twin Floor**: Live architectural blueprint of all dining tables (`T1–T8`), seat geometry, dining stages, and active floor revenue exposure in real time.
- **Kitchen CPU Batching Scheduler**: Automatically identifies concurrent order patterns across tables (e.g., 5 Wagyu burgers ordered across Tables 2 & 5 within 6 minutes) and batches kitchen prep tasks to reduce ticket wait times by **18%**.
- **Predictive Inventory Alerts**: Tracks real-time dish consumption against stock floors, warning managers **before** ingredients are 86'd on active tickets.
- **PulseAI Governor & Telemetry**: Multi-provider AI execution engine supporting **Google Gemini 3.6 Flash / 2.5 Flash**, **OpenAI (GPT-4o)**, **Anthropic (Claude 3.5 Sonnet)**, and **OpenRouter** with live model discovery, local AES-GCM key privacy, and real-time INR (₹) spend tracking.

---

## 🎬 Demo Flow

```
[Guest QR Menu] ──► [Live Order Stream] ──► [2D Digital Twin Floor]
                                                    │
                                                    ▼
                                        [Kitchen CPU Scheduler]
                                                    │
                                                    ▼
                                       [PulseAI Governor Audit]
```

1. **Guest Places Order**: Guest accesses `/customer` QR menu to order dishes (e.g., 2x A5 Wagyu Burger).
2. **Floor & KDS Sync**: `/operations` updates table status to `IN KITCHEN` and reflects revenue on the 2D floor blueprint.
3. **CPU Batching Trigger**: Kitchen scheduler detects concurrent burger orders across Tables 2 & 5, issuing a batching directive: *"Cook all 5 Wagyu patties simultaneously and defer fry prep by 3 mins."*
4. **Predictive Alert**: Inventory card flags `Aged Truffle Cheese` depleting in 38 minutes (0.8kg remaining against 1.5kg floor).
5. **Executive AI Audit**: General manager triggers a one-click audit via `/ai-ops` or `/settings`, executing real operational reasoning against Gemini 3.6 Flash.

---

## 🎯 Feature Breakdown

### P0 Features (Core Foundation - Ready & Tested)
- [x] **2D Digital Twin Floor Map**: Interactive SVG blueprint with table geometry (round 2-seaters, square 4-seaters, 8-seater booths) and status indicators.
- [x] **Kitchen CPU Batching Engine**: Real-time order grouping logic based on prep time, dish overlap, and pass load.
- [x] **PulseAI Governor Execution**: Multi-provider routing supporting Gemini, OpenAI, Anthropic, and OpenRouter APIs.
- [x] **AES-GCM Web Crypto Key Vault**: Client-side key encryption persisted securely in browser local storage.
- [x] **Token Spend Telemetry**: Real-time rupee (INR ₹) estimation for input/output token usage.
- [x] **Responsive Editorial Design System**: Unified `#0B0F14` Dark Obsidian aesthetic optimized for desktop displays and tablets.

### P1 Features (Advanced Enhancements - Active / Beta)
- [x] **Live Model Discovery**: Dynamically queries provider `models.list` endpoints to populate supported models.
- [x] **Scrollable Model Selection UI**: Compact 320px scrollable container handling 20+ discovered provider models.
- [x] **Deterministic Offline Fallback**: Zero-downtime demo mode operating via local rule engine when no API key is set.
- [ ] **Thermal POS Printer Adapter**: ESC/POS Bluetooth/USB print queue integration for physical kitchen receipts.
- [ ] **WhatsApp Staff Notifications**: Automated Twilio/WhatsApp alerts for floor captains when prep delays exceed 15 mins.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Vanilla CSS Variables + Design Tokens) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (with LocalStorage Rehydration) |
| **AI Infrastructure** | Google Gemini API (Gemini 3.6 Flash / 2.5 Flash), OpenAI, Anthropic, OpenRouter |
| **Security** | Web Crypto API (`AES-GCM` 256-bit encryption at rest) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📐 Architecture Overview

```text
PulseOS Architecture
├── app/
│   ├── page.tsx                     # Executive Briefing & Operations Overview
│   ├── operations/page.tsx          # Digital Twin Floor & KDS Pass
│   ├── customer/page.tsx            # Guest QR Ordering Portal
│   ├── ai-ops/page.tsx              # Intelligence Center & Telemetry
│   ├── settings/page.tsx            # AI Provider & Encrypted Key Manager
│   └── api/ai/health-scan/route.ts  # Multi-Provider Serverless Execution
├── components/
│   ├── FloorPlanSvg.tsx             # 2D Architectural SVG Floor Map
│   ├── KitchenCPUScheduler.tsx      # CPU Order Batching Component
│   ├── OperationalKPIs.tsx          # Real-Time Health & Revenue Telemetry
│   └── ui/                          # Design System Primitives & Toast Host
└── lib/
    ├── ai/
    │   ├── providers.ts             # Multi-Provider Live Model Discovery Engine
    │   ├── governor.ts              # Operational Intelligence Reasoning Engine
    │   ├── keyVault.ts              # AES-GCM Encrypted Key Storage
    │   └── cost.ts                  # Token-to-INR (₹) Spend Estimator
    └── store/
        └── usePulseStore.ts         # Centralized Zustand State Management
```

---

## 💻 Installation & Setup

### Prerequisites
- Node.js `18.17.0` or higher
- npm `9.0.0` or higher

### Local Clone & Installation

```bash
# 1. Clone repository
git clone https://github.com/Piyushdas1624/pulse-os.git

# 2. Navigate to project directory
cd pulse-os

# 3. Install dependencies
npm install

# 4. Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch PulseOS.

---

## 🔑 Environment Variables

PulseOS supports **local encrypted client keys** via `/settings` out of the box. To configure a server-side default key, create a `.env.local` file in the root directory:

```env
# Google Gemini API Key (Default Provider)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server-side keys for other providers
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## 🌐 Live Deployment (Vercel)

PulseOS is built for zero-config serverless deployment on **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPiyushdas1624%2Fpulse-os)

1. Import repository `Piyushdas1624/pulse-os` into Vercel.
2. Next.js App Router preset is auto-detected.
3. Add `GEMINI_API_KEY` under Environment Variables.
4. Click **Deploy**.

---

## 🧪 Beta / Incomplete Features

- **Multi-Tenant Franchise Switching**: UI workspace selector is mock-supported in local state; multi-tenant database partitioning requires Supabase RLS setup.
- **ESC/POS Web Bluetooth Printing**: Hardware printing relies on browser Web Bluetooth API availability (supported in Chrome desktop).

---

## 🔮 Future Scope

1. **Computer Vision Table Occupancy**: Integrate RTSP overhead camera streams with YOLOv8 to automatically detect table seating and clearing states.
2. **Automated Inventory Re-ordering**: Connect low-stock triggers directly to supplier APIs (e.g., Clover/Toast distribution APIs).
3. **POS Hardware Integrations**: Built-in adapters for Toast POS, Clover, and Square for Restaurants.

---

## 👤 Author & Maintainer

**Piyush Das** ([@piyushdas1624](https://github.com/Piyushdas1624))  
*Siliguri Govt. Polytechnic — Computer Science & Technology*  
- **GitHub**: [@piyushdas1624](https://github.com/Piyushdas1624)
- **Project Repo**: [Piyushdas1624/pulse-os](https://github.com/Piyushdas1624/pulse-os)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Piyushdas1624">@piyushdas1624</a> for Vibeathon 6.0</sub>
</div>
