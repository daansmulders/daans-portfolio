# Sliminject

A GLP-1 medication management prototype for patients and doctors. Built to demonstrate end-to-end product design and implementation — from concept and user stories through to a working, offline-capable web app.

## What it is

GLP-1 medications (Ozempic, Wegovy) require weeks of titration and close monitoring. This prototype explores what a dedicated care coordination tool could look like: patients log their progress and submit concerns; doctors manage schedules, review data, and respond — all in one place.

Two roles, one codebase:
- **Patient** — daily logging, medication timeline, concern submission, educational content
- **Doctor** — patient overview, dosage schedule editor, concern inbox, prescriptions, appointments

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript 5.9 + Vite 5 |
| Styling | Tailwind CSS 4 + custom design tokens |
| Components | Radix UI primitives |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Offline | Dexie.js (IndexedDB write queue) |
| Realtime | Supabase Realtime (urgent concern badge) |
| Routing | React Router 7 |
| Toasts | Sonner |

## Getting started

```bash
cd prototypes/sliminject
npm install
npm run dev
```

Requires a `.env` file with Supabase credentials:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Seed demo data:
```bash
npm run seed
```

## Demo accounts

| Email | Password | Role | Notes |
|---|---|---|---|
| `dokter@demo.nl` | `demo1234` | Doctor | Dr. Fatima el-Amin |
| `patient@demo.nl` | `demo1234` | Patient | Lars Veenstra — 8 entries, upcoming appointment |
| `patient2@demo.nl` | `demo1234` | Patient | Anouk de Boer — open concern |
| `patient3@demo.nl` | `demo1234` | Patient | Mohamed Bouazza — 2 entries |
| `nieuw@demo.nl` | `demo1234` | Patient | Sara Dijkstra — no entries → triggers onboarding |

## Patient features

- **Dashboard** — prominent log CTA (suppressed once logged today), progress chart after 7 entries, recent measurements with weekly milestone markers, doctor advice card, upcoming appointment, content teaser
- **Log form** — weight, hunger scale (1–5, labelled anchors), prioritised symptom checklist (3 primary + expand toggle), notes
- **Medication** — visual timeline of current and upcoming doses
- **Concerns** — routine/urgent submission with response time expectations; history with doctor replies
- **Content** — articles and videos grouped into curriculum ("Start hier", "Bijwerkingen", "Voeding & leefstijl")
- **Onboarding** — 4-step flow ending with first log entry
- **Reminders** — opt-in daily notification via Web Notifications API; only fires if not yet logged that day

## Doctor features

- **Patient list** — split into "Aandacht nodig" and "Op schema" buckets; pending invitations shown separately
- **Patient profile** — tabbed (Overzicht, Medicatie, Meldingen, Afspraken); unread concern badge on tab
- **Schedule editor** — add/remove dosage entries; live SVG titration curve preview
- **Concern inbox** — review and respond; advice editor with "Zichtbaar voor patiënt" label
- **Realtime badge** — urgent concerns surface immediately via Supabase Realtime subscription
- **Prescriptions** — approve pending prescriptions, forward to pharmacy
- **Appointments** — schedule follow-ups per patient

## Offline behaviour

All form submissions go through a Dexie.js write queue. If the device is offline, the entry is saved locally and synced automatically when connectivity returns. The UI shows an offline indicator and confirms local saves explicitly.

## Build history

| Branch | What was built |
|---|---|
| `001-sliminject-dashboard` | Core app: auth, patient dashboard + log form, medication timeline, concerns, educational content, doctor overview + patient profile, schedule editor, intake flow, prescriptions, appointments |
| `002-sliminject-ux-improvements` | 14 UX improvements across patient and doctor flows — see [CHANGELOG.md](CHANGELOG.md) |
