# Changelog

## 002 — UX Improvements (2026-03-17)

Branch: `002-sliminject-ux-improvements`

A structured UX design review identified 14 improvement areas across patient and doctor flows. All were implemented in this phase.

### Patient

**P1 — Prominent daily log CTA**
Dashboard now leads with a full-width "Log vandaag" button. Once logged, it switches to a quiet green confirmation. The action is above the fold every time the patient opens the app.

**P2 — Hunger scale with labelled anchors**
The 1–5 hunger scale now shows "Geen honger" and "Heel veel honger" at each end, making entries consistent and comparable over time.

**P3 — Pre-chart motivational state**
Replaced the blank area shown during the first 7 days with a `StreakDisplay` component — progress dots toward a 7-day milestone with an encouraging message.

**P4 — Prioritised symptom checklist**
The three most common GLP-1 side effects (misselijkheid, maagklachten, vermoeidheid) are always visible. The remaining four are behind a "Meer symptomen" expand toggle.

**P5 — Response time expectation after concern submission**
After submitting a concern, an inline confirmation now shows the expected response time: "binnen 1 werkdag" for routine, an urgent message for urgent submissions. Open concerns in the history list also show the expected response time.

**P6 — Structured educational content**
Content is now grouped into a curriculum with three topic groups — "Start hier", "Bijwerkingen", "Voeding & leefstijl" — ordered by recommended reading sequence. The first unread article in "Start hier" is visually highlighted. Each group shows a completion indicator when all items are viewed.

**P7 — First log entry as final onboarding step**
Onboarding extended from 3 to 4 steps. The final step is a condensed log form (weight + hunger), establishing the daily logging habit before the patient reaches the dashboard. Includes a "Sla over" option.

### Doctor

**D1 — Tabbed patient profile**
The patient profile is now split into four navigable tabs (Overzicht, Medicatie, Meldingen, Afspraken) using Radix UI Tabs. The Meldingen tab shows a red badge when open concerns exist.

**D2 — Advice editor with visibility label**
The advice textarea in the doctor's concern view now shows a persistent "Zichtbaar voor patiënt" label. On the patient side, the advice appears on the dashboard under "Van je arts".

**D3 — Dosage schedule titration curve**
The schedule editor now renders a live SVG line chart (dose vs. date) that updates whenever entries are added or removed, giving the doctor an immediate visual of the titration plan.

**D4 — Real-time urgent concern surfacing**
A Supabase Realtime subscription on the `concerns` table triggers a red badge on the doctor navigation within seconds of a patient submitting an urgent concern. The badge clears when the doctor navigates to the patient overview.

**D5 — Concern response confirmation**
Doctor responses now show a success toast on submit. On the patient side, concern replies surface as a card on the dashboard (with preview and link to the full history).

### Cross-cutting

**X1 — Empty states for all key screens**
A shared `EmptyState` component is now used on the patient dashboard, concerns screen, content screen, and doctor patient overview. Each empty state explains what will appear there and, where appropriate, provides a direct CTA.

**X2 — Daily logging reminder**
Patients can enable an optional daily notification at a configurable time. The reminder fires only if the patient has not yet logged that day. Preference is stored in `localStorage`. Uses the Web Notifications API.

**X3 — Consistent form feedback**
All six form submissions (log entry, concern, appointment, patient intake, advice, dosage schedule) now show success and error feedback via Sonner toast notifications.

### Tone of voice
All Dutch copy switched from formal (u/uw) to informal (je/jouw) throughout.

### Dashboard redesign
The patient dashboard was restructured with a clear visual hierarchy:
1. Log CTA (dominant action)
2. Doctor messages (reply or advice, highest priority first)
3. Treatment updates (next appointment + upcoming dosage change, compact)
4. Progress chart (passive, only when 7+ entries)
5. Recent entries (compact list with weekly milestone markers)
6. Content teaser (first unread article)
7. Reminder toggle (de-emphasised, bottom)

Removed from dashboard: medication mini-timeline, streak display, weekly check-in banner, new content count alert.

### Weekly milestone logic fix
The milestone toast ("Week X bereikt 🎉") previously triggered for any log near a 7-day boundary. It now only fires for the first log of each new treatment week, correctly distinguishing between the weekly check-in and in-between logs.

---

## 001 — Initial build (2026-03-10)

Branch: `001-sliminject-dashboard`

Initial prototype covering the full core feature set for both roles.

### Patient
- Auth (email/password via Supabase)
- Dashboard with progress chart, recent entries, medication mini-timeline, alerts
- Log form (weight, hunger, symptoms, notes) with offline queue
- Medication timeline (current dose, past + upcoming)
- Concern submission and history
- Educational content (trigger-based)
- Onboarding flow (3 steps)

### Doctor
- Patient overview with attention/on-track buckets
- Patient profile with progress chart, medication timeline, concern inbox, advice editor
- Dosage schedule editor
- Patient intake / invite flow
- Prescription overview and approval
- Appointment scheduling

### Infrastructure
- Supabase backend (PostgreSQL + Row Level Security)
- IndexedDB offline write queue via Dexie.js
- React Router 7 with role-based routing
- Dutch i18n via `nl.ts`
- Tailwind CSS 4 design system with custom tokens
