# Data Flow: Patient → Doctor

> **Date**: 2026-03-17
> **Purpose**: Document all pathways through which patient actions surface on the doctor's view — both automated and manual.

---

## Summary

The prototype has **no automated threshold-based alerts** that create new records for the doctor. All data flows are either:
- **Patient-initiated**: the patient explicitly submits something (concern, log, check-in)
- **Computed on read**: the doctor's view derives insights from existing data (inactivity detection, adherence badges)

There are no hidden triggers where a score silently creates a doctor-facing notification.

---

## Data flows

### 1. Concerns (patient-initiated, real-time)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Patient manually submits via `/patient/meldingen/nieuw` |
| **Data** | `concerns` table: severity (routine/urgent), description |
| **Doctor sees** | PatientProfile → Meldingen tab; open count as badge on tab |
| **Real-time** | Yes — urgent concerns trigger a Supabase Realtime subscription (`useUrgentConcerns`). Red badge appears on doctor's navigation without refresh. |
| **Files** | `useConcerns.ts`, `ConcernScreen.tsx`, `ConcernInbox.tsx`, `useUrgentConcerns.ts` |

### 2. Progress entries (patient-initiated, read on load)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Patient submits daily log form or injection-day card log step |
| **Data** | `progress_entries` table: weight, hunger, food noise, symptoms, notes |
| **Doctor sees** | PatientProfile → Overzicht tab (chart + entries); also used for inactivity computation |
| **Real-time** | No — loaded when doctor opens patient profile |
| **Files** | `useProgressEntries.ts`, `LogEntryForm.tsx`, `useInjectionDayCard.ts` |

### 3. Injection adherence (patient-initiated, read on load)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Patient confirms, skips, or adjusts injection via injection-day card |
| **Data** | `injection_adherence` table: response (confirmed/skipped/adjusted), optional note |
| **Doctor sees** | PatientProfile → Medicatie tab; per-dose badge (Genomen/Overgeslagen/Aangepaste dosis); weight + hunger inline for confirmed doses |
| **Real-time** | No — lazy-loaded when Medicatie tab first opened |
| **Files** | `useAdherenceCheckIn.ts`, `useAdherence.ts`, `PatientProfile.tsx` |

### 4. Wellbeing check-ins (patient-initiated, read on load)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Patient submits weekly wellbeing form, or energy score captured during injection-day log |
| **Data** | `weekly_wellbeing_checkins` table: energy, mood, confidence (1–5), optional note |
| **Doctor sees** | PatientProfile → Overzicht tab; `WellbeingDoctorSummary` showing latest scores with trend arrows vs. previous check-in |
| **Real-time** | No — loaded when doctor opens patient profile |
| **Files** | `useWellbeingCheckIn.ts`, `useInjectionDayCard.ts`, `useWellbeingHistory.ts`, `PatientProfile.tsx` |

### 5. Inactivity detection (computed, no data written)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Automatic — computed when doctor loads the patient overview |
| **Logic** | If no `progress_entries` in ≥14 days, or no entries at all → `needs_attention = true` |
| **Doctor sees** | DoctorOverview: patient sorted into "Aandacht nodig" section; amber "Inactief X dagen" badge or "Nog niet ingecheckt" badge |
| **Real-time** | No — computed on each fetch |
| **Data written** | None — purely derived |
| **Files** | `usePatients.ts`, `DoctorOverview.tsx`, `PatientListItem.tsx` |

---

## What does NOT trigger doctor-facing alerts

These patient data points are tracked but do **not** automatically notify the doctor:

| Data point | Where it lives | Why no auto-alert |
|-----------|----------------|-------------------|
| Hunger score (1–5) | `progress_entries.hunger_score` | Doctor sees it in chart/entries, but no threshold triggers a notification |
| Food noise score (1–5) | `progress_entries.food_noise_score` | Tracked for patient milestones only; doctor sees on chart |
| Wellbeing scores declining | `weekly_wellbeing_checkins` | Doctor sees trend arrows but no alert on decline |
| Symptom patterns (repeated nausea, etc.) | `progress_entries.symptoms` | Visible in patient log history; no pattern detection on doctor side |
| Consecutive missed injections | `injection_adherence` | Patient sees a nudge + link to message doctor; doctor only sees if patient actually sends a concern |
| Weight plateau | `progress_entries.weight_kg` | Planned as patient-facing card (backlog #11); no doctor notification |

---

## Design implications

1. **The doctor's view is pull-based, not push-based.** Except for urgent concerns (real-time badge), the doctor must actively open a patient's profile to see their data. There are no automated "patient X needs attention because score Y dropped" notifications.

2. **The inactivity threshold (14 days) is the only automated triage signal.** This is a blunt instrument — a patient could log every day with worsening symptoms and the doctor would never be flagged, because "inactivity" only measures logging frequency, not content.

3. **The consecutive miss nudge routes through the patient.** When a patient skips 2 injections, they see "Stuur je arts een berichtje" — but the doctor only learns about it if the patient actually sends the concern. The skip data is in `injection_adherence` and visible on the Medicatie tab, but there's no proactive flag on the doctor overview.

4. **Future opportunity**: Threshold-based alerts on the doctor overview (e.g., "Patient's hunger score increased 2+ points over 2 weeks", "Patient logged severe symptoms 3x this week", "Wellbeing declined across all dimensions"). This would require a new alerting layer that computes patient risk signals and surfaces them alongside the existing inactivity/open-concern bucketing.
