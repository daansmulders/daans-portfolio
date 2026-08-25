# Quickstart: Log Entry Card Redesign

**Feature**: 010-log-entry-cards
**Date**: 2026-03-18

## Prerequisites

- Node.js 18+
- Supabase project with existing Sliminject schema + seed data

## Local Development

```bash
cd prototypes/sliminject
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Viewing variants

- **Variant B (full detail, default)**: `http://localhost:5173/patient/dashboard`
- **Variant A (expandable)**: `http://localhost:5173/patient/dashboard?card=a`
- Same parameter works on doctor view: `/dokter/patient/:id?card=a`

## Key Files

### New
- `src/features/patient/dashboard/LogEntryCard.tsx` — Shared card component with variant support

### Modified
- `src/features/patient/dashboard/PatientDashboard.tsx` — Uses LogEntryCard for recent entries
- `src/features/doctor/patient/PatientProfile.tsx` — Uses LogEntryCard for log history
- `src/i18n/nl.ts` — New card-related i18n keys

## Testing

```bash
cd prototypes/sliminject
npm run test      # Vitest
npm run lint      # ESLint
```

## Seed data for evaluation

Run `npm run seed` to populate entries with varying data density (some with all fields, some minimal) to evaluate both card variants.
