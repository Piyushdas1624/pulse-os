# PulseOS — Vibeathon 6.0 Hackathon Submission & Slide Prompts 🎯

## 1. What PulseOS Code Does & How It Solves Restaurant Operational Chaos

PulseOS is an **AI-powered Restaurant Operating Intelligence Platform**. Instead of acting like a passive point-of-sale (POS) terminal or an offline analytics dashboard, PulseOS treats restaurant operations like an **operating system CPU scheduler**:

- **Live 2D Digital Twin Floor**: Maps active tables (`T1–T8`), dining room seats, order states (`Seated`, `Ordering`, `In Kitchen`, `Served`, `Needs Clearing`), and revenue exposure in real time.
- **Kitchen CPU Batching Scheduler**: Automatically identifies concurrent order bottlenecks across tables (e.g., 5 Wagyu burgers ordered across Tables 2 & 5 within 6 minutes) and batches kitchen prep tasks to reduce ticket wait time by **18–25%**.
- **Real-Time Predictive Inventory Alerts**: Monitors floor consumption rates against ingredient stock (e.g., Aged Truffle Cheese depleting in 38 minutes), warning managers **before** dishes are 86'd on active tickets.
- **PulseAI Governor & Telemetry**: Multi-provider AI execution layer supporting **Google Gemini (Gemini 3.6 Flash / 2.5 Flash)**, **OpenAI (GPT-4o)**, **Anthropic (Claude 3.5 Sonnet)**, and **OpenRouter**. Provides real-time token spend tracking in INR (₹) and encrypted local key security (`AES-GCM`).

---

## 2. Vibeathon 6.0 Official 6-Slide Prompts & Submission Form Text

### Slide 1 — Title Page
**Prompt:**
```text
You are writing the TITLE PAGE for a hackathon PPT.
Project: PulseOS – AI-Powered Restaurant Operating Intelligence Platform.

Generate a concise, professional title-slide block containing:
• Team Name: Codebenders
• Team Leader Name: Piyush Das
• College Name: Hackathon Submission
• Year & Department: Computer Science & Engineering
• Problem Statement / Project Title: PulseOS – AI-Powered Restaurant Operating Intelligence Platform

Tone: startup + hackathon.
Keep it short enough to fit on one slide.
Return only the final slide text (no explanations).
```

---

### Slide 2 — Current Problem
**Prompt:**
```text
Write the “CURRENT PROBLEM” slide for a hackathon PPT about PulseOS.

Context:
• Restaurants use multiple disconnected tools (POS, kitchen display, inventory sheets, staff coordination).
• Managers react after delays happen.
• Orders pile up, inventory shortages are noticed late, and table turnover slows down.

Generate 5 sections:
1. Problem Overview (2–3 lines)
2. Who Is Affected (bullet list)
3. Current Challenges (4–6 bullets)
4. Limitations of Existing Solutions (3–5 bullets)
5. Real-World Impact (2–3 measurable business consequences)

Make it presentation-ready, concise, and non-technical enough for judges.
```

---

### Slide 3 — Proposed Solution
**Prompt:**
```text
Write the “PROPOSED SOLUTION” slide for PulseOS.

Core idea:
PulseOS is an AI-powered operational intelligence platform for restaurants. It provides a live Digital Twin floor map, a Kitchen CPU Scheduler that batches similar dishes, real-time inventory monitoring, and an Executive AI Audit that recommends actions before bottlenecks occur.

Generate these sections:
1. Solution Overview (2–3 lines)
2. How It Works (4 numbered steps)
3. Key Features (5 bullets)
4. Innovative Solution (1 short paragraph)
5. Unique Value / Benefits (4 concise bullets)

Keep it concise, visually scannable, and suitable for a single PPT slide.
```

---

### Slide 4 — Technical Approach
**Prompt:**
```text
Write the “TECHNICAL APPROACH” slide for PulseOS.

Use this stack:
• Next.js 15 (App Router)
• React 19
• TypeScript
• Tailwind CSS
• Zustand State Management
• Google Gemini 3.6 Flash / Multi-Provider AI API (OpenAI, Anthropic, OpenRouter)
• AES-GCM Web Crypto API Key Vault

Architecture:
Customer QR Portal → Operations Command Center → AI Operations Center → PulseAI Governor Engine.

Generate:
1. Technologies Used
2. Tools & Frameworks
3. System Architecture (1 short paragraph)
4. Methodology / Workflow (5-step flow)
5. How the Idea Works (3–4 concise bullets)

Keep the wording judge-friendly: technical enough to sound real, but not overloaded with jargon.
```

---

### Slide 5 — Use Cases & Impact
**Prompt:**
```text
Write the “USE CASES & IMPACT” slide for PulseOS.

Generate:
1. Key Use Cases (4 bullets)
2. Target Users / Beneficiaries (4 bullets)
3. Real-World Applications (3 bullets)
4. Expected Impact (4 bullets with percentages or operational outcomes)
5. Measurable Outcomes (4 KPI-style metrics)

Use realistic hackathon-safe estimates such as reduced wait time (-18%), improved kitchen throughput (+22%), lower food waste (-15%), and faster table turnover (+14%). Keep everything concise and presentation-ready.
```

---

### Slide 6 — Future Scope & Conclusion
**Prompt:**
```text
Write the “FUTURE SCOPE & CONCLUSION” slide for PulseOS.

Generate:
1. Future Enhancements (4 bullets)
2. Integration Opportunities (3 bullets)
3. Scalability & Expansion (3 bullets)
4. Future Impact (1 short paragraph)
5. Conclusion (2–3 strong closing lines for a hackathon pitch)

End with a memorable one-line tagline: "Restaurants don't need more software. They need operating intelligence."

Tone: confident, investor-ready, and concise.
```

---

## 3. Submission Form Copy (Paste Ready)

### Form Field 1: "What does your project do?" (Under 450 chars)
> PulseOS is an AI-powered operating intelligence platform for restaurants. It pairs a live 2D Digital Twin floor map with a Kitchen CPU Scheduler that batches similar dish orders in real time. By synchronizing floor seating, inventory consumption, and kitchen load, PulseOS delivers automated AI recommendations that prevent service bottlenecks before they impact customer dining experiences.

---

### Form Field 2: "What makes it unique?" (Under 450 chars)
> PulseOS unique innovation is treating kitchen order queues like an OS CPU scheduler — batching identical prep tasks across separate table tickets to cut wait times by 18%. Unlike static POS dashboards or generic AI chatbots, the PulseAI Governor acts as a live operational co-pilot, discovering model capabilities on the fly and monitoring token spend in rupees with encrypted key privacy.

---

## 4. GitHub README & 2-Minute Demo Script Prompts

### README Prompt (For Hackathon Repository)
```text
Create a complete GitHub README for a public hackathon submission.

Project: PulseOS – AI-Powered Restaurant Operating Intelligence Platform.

Include:
• Project tagline: "Restaurants don't need more software. They need operating intelligence."
• Problem statement & Solution overview
• Demo flow & Features (P0/P1 breakdown)
• Tech stack (Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, Google Gemini 3.6 Flash)
• Architecture diagram & workflow
• Local installation steps (`npm install`, `npm run dev`)
• Environment variables setup (`GEMINI_API_KEY`)
• Deployment guide (Vercel)
• Team members & roles
• Future scope & License

Write it in polished GitHub Markdown suitable for a hackathon judge.
```

---

### 2-Minute Video Pitch Script Prompt
```text
Write a 2-minute hackathon demo video script for PulseOS.

Structure:
0:00 - 0:20 | Hook & Problem (Kitchen delays, inventory blind spots)
0:20 - 0:50 | Solution Overview & Live 2D Floor Plan Demo
0:50 - 1:20 | Kitchen CPU Batching & Real-Time Stock Risk Warning
1:20 - 1:45 | PulseAI Governor & Multi-Provider Telemetry (Gemini 3.6 Flash)
1:45 - 2:00 | Business Impact & Closing Tagline

Keep it high-energy, confident, and focused on practical operational impact.
```
