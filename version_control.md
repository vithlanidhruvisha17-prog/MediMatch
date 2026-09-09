# 📦 MediMatch — Version Control & Release Ledger

Welcome to the **MediMatch Version Control & Release Ledger**. This document tracks all version iterations, what was developed in each sub-version, exact Git commands to restore or inspect any version, and rules for all future prompts.

---

## 🏷️ 1. Versioning Strategy & System

MediMatch follows a **Daily Sub-Version Scheme (`DD.MM.X`)**:
- `DD`: Day of the month (e.g., `09`)
- `MM`: Month (e.g., `09` for September)
- `X`: Incremental sub-version counter for that day (`1, 2, 3, 4...`)

> **Protocol for Every New Prompt**: Every new user prompt or feature request will be assigned a new incremental sub-version (e.g., `09.09.3`, `09.09.4`, `10.09.1`, etc.).

---

## 📜 2. Complete Version History & Changelog

| Sub-Version | Git Commit Hash | Date | Milestone & Changes Summary |
| :--- | :--- | :--- | :--- |
| **`09.09.5`** *(Current)* | *(Working Tree)* | 2026-09-09 | **Strict Medical Symptom & Gibberish Shield**: Upgraded clinical validation with comprehensive anatomical term lexicon (`knee`, `chest`, `stomach`, `spine`, etc.), clinical signs dictionary (`pain`, `swelling`, `fever`, `bleeding`, etc.), strict keyboard mashing detection (`qwertyuiop`, `asdfghjkl`, etc.), and consonant cluster analysis. Prevents bypass with vague phrases like &quot;i am not well qwertyuiop&quot; or non-medical filler text. |
| **`09.09.4`** | *(Working Tree)* | 2026-09-09 | **Clinical Symptom Relevancy & Anti-Placeholder Shield**: Fixed vulnerability where entering "NA", "none", or random text still triggered AI surgery predictions. Added multi-tier clinical validation (`validateClinicalInput`) in `@medimatch/shared`, real-time character counter (min 15 chars) and placeholder blocker in `StepIllness.tsx`, server-side 400 enforcement in `assessments.routes.ts`, and fallback "Insufficient Clinical Information" protection with "Back to Edit Symptoms" CTA in `StepDiagnosis.tsx` and `aiProvider.service.ts`. |
| **`09.09.3`** | *(Working Tree)* | 2026-09-09 | **Health Daily Table & Dock Redesign**: Refactored all 5 tables (`SubmissionsTable`, `InquiriesTable`, `HospitalsManager`, `DoctorsManager`, `StepDiagnosis`) with Health Daily 3-column KPI ribbons, dark circular badges, frosted glass containers (`#0b1d2d/80`), hairline dividers, and solid mint/teal pill navigation dock. Added `mindmap.md` & `version_control.md`. |
| **`09.09.2`** | `f1061ec` | 2026-09-09 | **Complete Glassmorphic Theme Overhaul**: Converted all cards, modals, headers, footers, forms, and patient wizard to deep obsidian glass aesthetic (`#07162d` / `#0b1d2d`), cyan/emerald accents, and backdrop blur. |
| **`09.09.1`** | `ec0ee19` | 2026-09-09 | **Design Tokens & Dark Glass Foundations**: Introduced `tokens.css` with dark frosted variables, tailwind custom colors, and updated UI component primitives (`Card`, `Badge`, `Button`, `Stepper`). |
| **`08.09.6`** | `67003f8` | 2026-09-08 | **Dual Resend Email Notification System**: Implemented automated email dispatch via Resend API when patient books an appointment — sends booking confirmation to patient and notification alert to hospital/doctor. |
| **`07.09.5`** | `b731ac7` | 2026-09-08 | **Multi-factor Hospital Matching Engine**: Refined scoring weights for city matching, budget ceilings, ICU availability, and NABH/JCI accreditation. |
| **`08.09.4`** | `2156939` | 2026-09-08 | **Doctor Specialty Management & Fee Calculator**: Added specialist surgeon faculty management, consult fee tracking, and credential verification. |
| **`08.09.3`** | `77b31cc` | 2026-09-08 | **Hospital Capacity & Bed Tracker**: Added hospital bed metrics (total beds, ICU units), contact emails, and tier classification. |
| **`08.09.2`** | `12223e9` | 2026-09-08 | **Admin Patient Submissions Dossier**: Added detailed patient dossier view with AI prediction summary, symptom chips, and timeline. |
| **`08.09.1.5`** | `c3a0dd9` | 2026-09-08 | **Vite Bundle Optimization**: Optimized client vendor chunking, split large icon packages, and eliminated build chunk warnings. |
| **`08.09.1.4`** | `238b4df` | 2026-09-08 | **Environment Variable Cleanup**: Cleaned unused variables and updated `.env.example`. |
| **`08.09.1.3`** | `eeb07ba` | 2026-09-08 | **Gemini Model Upgrade**: Updated default AI model to `gemini-2.5-flash` with robust markdown JSON parsing fallback. |
| **`08.09.1`** | `2343d0e` | 2026-09-08 | **Patient Assessment Wizard**: Created 3-step assessment flow (Profile, Symptoms, AI Indication). |
| **`08.09.0`** | `089faa2` | 2026-09-08 | **Gemini AI Integration**: Added fallback support for `GEMINI_API_KEY` from server environment. |
| **`07.08.5`** | `b38ea81` | 2026-09-07 | **Database & Cloud Deployment**: Configured Supabase IPv4 connection pooler and trust proxy for Render hosting. |
| **`07.08.4`** | `e8a1938` | 2026-09-07 | **Database Seeder**: Initialized seed data for top Indian hospitals (Apollo, Fortis, Max, AIIMS) and sample doctors. |
| **`07.08.3`** | `16f8238` | 2026-09-07 | **Cost Calculation Engine**: Created itemized surgical cost schedule formula. |
| **`07.08.2`** | `85058c8` | 2026-09-07 | **Authentication & Security**: Implemented JWT auth, password hashing, and route protection. |
| **`07.09.1`** | `d305e83` | 2026-09-07 | **Initial Project Setup**: Monorepo structure, Express backend, React Vite frontend, Prisma ORM. |

---

## 🛠️ 3. How to Restore or Checkout Any Version (Commands)

You can rollback, inspect, or restore any version using the commands below:

### 🔍 Option A: Temporarily Inspect/Test an Older Version (Safe - Read Only)
If you want to view the project exactly as it was at a specific version (e.g. `09.09.1`):
```bash
# Checkout to commit hash without changing main branch
git checkout ec0ee19

# When done testing, return to the latest version:
git checkout main
```

### 🌿 Option B: Create a New Branch from an Older Version
If you want to branch off and do separate experiments starting from a specific version:
```bash
# Create and switch to a new branch from version 09.09.1
git checkout -b experiment-from-09.09.1 ec0ee19
```

### 📄 Option C: Restore a Single File from a Previous Version
If you only want to restore one file (e.g., `DoctorsManager.tsx` back to version `09.09.2`):
```bash
# Restore specific file from commit f1061ec
git checkout f1061ec -- apps/client/src/components/admin/DoctorsManager.tsx
```

### ⏪ Option D: Undo the Latest Commit Safely (Creates a New Revert Commit)
If you want to safely undo changes while preserving complete Git history:
```bash
# Revert the latest commit
git revert HEAD

# Or revert a specific commit:
git revert f1061ec
```

### ⚠️ Option E: Hard Reset to a Specific Version (Permanent Rollback)
> **Note**: This will wipe changes made after that commit. Use only if you want to completely roll back.
```bash
# Roll back your local code to version 09.09.2
git reset --hard f1061ec

# Or roll back to version 09.09.1
git reset --hard ec0ee19
```

---

## 🛡️ 4. Version Control Rules For All Future Prompts

For every future prompt and task you request, the following rules are strictly enforced:

1. **Incremental Sub-Version Tagging**:
   - Every prompt starts under a new sub-version (e.g. `09.09.3`, `09.09.4`, `10.09.1`).
   - The sub-version name, description, and list of modified files will be updated in this file.

2. **Strictly Local Changes (No Automatic Git Push)**:
   - All code edits remain local in your VS Code workspace.
   - No `git push` command is ever executed without your explicit instruction. You can inspect the code and push whenever you want.

3. **Build Integrity Check Before Version Finalization**:
   - Every sub-version must pass `npm run build` with 0 TypeScript/Vite errors before being marked ready.

4. **Synchronized Documentation**:
   - If new files, routes, or algorithms are introduced in a sub-version, `mindmap.md` will be updated simultaneously so your architecture map is never out of date.

---

## 📝 5. How to Save Your Current Version Locally (In VS Code Terminal)

When you are satisfied with the current changes (`09.09.3`), run this in your VS Code terminal:

```bash
# 1. Stage all changes
git add .

# 2. Commit with sub-version name
git commit -m "09.09.3: Health Daily table redesign, dock navigation & documentation"

# 3. (Optional) Create a local Git Tag for quick reference:
git tag v09.09.3

# 4. (Whenever you want to push to GitHub yourself):
# git push origin main
```

