# MediMatch — Surgical Financial Counseling & Medical AI Prediction

MediMatch is a medical platform connecting patients seeking surgical financial counseling with AI-predicted procedure recommendations, itemized cost estimates across accredited hospitals, and top surgical specialists under their budget.

---

## Architecture & Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router 6, TanStack React Query.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase adapter) & In-Memory Resilient Repository.
- **AI Engine**: Pluggable provider (Google Gemini `gemini-1.5-flash` or `gemini-2.5-flash`) with live Prompt Sandbox and clinical heuristic fallback.
- **Monorepo**: npm workspaces (`apps/client`, `apps/server`, `packages/shared`).

---

## Quick Start

### 1. Install Monorepo Dependencies
From the repository root (`C:\Users\vithl\.gemini\antigravity\scratch\medimatch`):
```bash
npm install
```

### 2. Build the Shared Package
```bash
npm run build --workspace=@medimatch/shared
```

### 3. Start Backend Server (Port 5000)
```bash
npm run dev:server
```

### 4. Start Frontend Client (Port 5173)
```bash
npm run dev:client
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Admin Portal Access

- **URL**: `http://localhost:5173/admin`
- **Default Email**: `admin@medimatch.health`
- **Default Password**: `admin123`
*(Or click the one-touch "Autofill Demo Admin Credentials" button on the login screen)*

---

## Features & Portals

### 1. Patient Portal (Public)
- **AI Health Assessment Wizard (3 Steps)**:
  1. **Profile**: Patient details, location, and interactive budget slider (₹).
  2. **Illness Details**: Symptom description, 30+ categorized conditions, duration selector, 1-10 severity slider, 40-symptom chip grid, comorbidities, and medical history.
  3. **AI Diagnosis & Matching**: Indication for predicted procedure, priority pill (e.g. *Moderate Priority / Schedule Within 1-2 Weeks*), clinical summary, 2x2 recommended specialists, matching hospitals with 2x2 itemized cost breakdowns (Surgeon Fee, OT, Room, Medicines), and "View Full Cost Breakdown" modal.
- **Hospitals Directory (`/hospitals`)**: Directory of 100 accredited Indian hospitals across major cities with city and accreditation filters and visit booking.
- **Specialists Directory (`/specialists`)**: Faculty of surgeons across oncology, cardiology, orthopedics, urology, etc.
- **Virtual Health & Surgical Counselor**: Floating conversational AI widget with 4 common question quick-reply chips.

### 2. Admin Portal (`/admin`)
- **Patient Health Submissions**: Real-time table of clinical submissions and AI predictions with dossier modal.
- **AI Model Integration & Prompt Sandbox**: Configure Gemini API keys (encrypted at rest), system prompt, and execute live prompt tests.
- **Inquiries**: Review incoming booking requests and update status (*New / Contacted / Closed*).
- **Hospitals Manager**: Full CRUD on the 100-hospital catalog.
- **Doctors Manager**: Full CRUD on specialist doctors.
- **Database Seeder**: One-click bulk seeding of 100 hospitals, 16 doctors, and demo clinical submissions with live terminal execution logs.

---

## Supabase PostgreSQL Setup (Optional)

When you are ready to connect a live remote Supabase PostgreSQL database:
1. In `apps/server/.env`, set your connection string:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
2. Push the schema and seed:
   ```bash
   npm run prisma:push --workspace=@medimatch/server
   npm run prisma:seed --workspace=@medimatch/server
   ```
*(Note: If no database URL is set, the server runs smoothly on its pre-seeded repository, guaranteeing 100% offline testability!)*

