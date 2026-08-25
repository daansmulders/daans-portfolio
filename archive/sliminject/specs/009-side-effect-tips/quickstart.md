# Quickstart: Side Effect Management Tips

**Feature**: 009-side-effect-tips
**Date**: 2026-03-17

## Prerequisites

- Node.js 18+
- Supabase project with existing Sliminject schema

## Local Development

```bash
cd prototypes/sliminject
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Key Files to Modify

### Data layer
- `src/lib/supabase.ts` — Update `progress_entries` types (symptoms → SymptomEntry[])
- `src/lib/db.ts` — Update Dexie schema for offline entries

### Symptom tips system
- `src/features/patient/symptoms/symptomTips.ts` — Expand to multi-variant tips for all 9 symptoms
- `src/features/patient/symptoms/useSymptomTipThrottle.ts` — Add variant rotation tracking

### Patient log form
- `src/features/patient/dashboard/LogEntryForm.tsx` — Add severity selector per symptom chip

### Post-log feedback
- `src/features/patient/dashboard/LogEntryForm.tsx` — Update tip card display + add doctor-contact nudge

### Doctor view
- `src/features/doctor/patient/PatientProfile.tsx` — Show symptoms with severity in log history

### i18n
- `src/i18n/nl.ts` — Add severity labels, nudge text, new tip content

## Testing

```bash
cd prototypes/sliminject
npm run test      # Vitest
npm run lint      # ESLint
```

## Feature Flags / Toggles

None needed — this is a direct upgrade to the existing tip system.
