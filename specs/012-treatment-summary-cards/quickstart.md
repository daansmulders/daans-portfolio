# Quickstart: Treatment Phase Summary Cards

**Feature**: 012-treatment-summary-cards
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

## Testing milestones

The seed data sets `treatment_start_date` for each patient. To test milestone cards:

1. **Adjust seed dates**: Modify `treatment_start_date` in `supabase/seed.js` to be 4+ weeks ago for a test patient
2. Run `npm run seed` to repopulate
3. Log in as that patient — milestone card should appear on dashboard

### Test scenarios

- **Week 4 milestone**: Set `treatment_start_date` to 28+ days ago
- **Missed milestone**: Set to 42+ days ago (week 6) — should show week 4 card
- **Multiple milestones**: Set to 56+ days ago (week 8) — should show only week 8
- **Dismiss and check**: Dismiss the card, refresh — should not reappear
- **Doctor view**: Log in as doctor, open patient profile — milestones section shows all reached milestones

## Key Files

### New
- `src/features/patient/milestones/useTreatmentMilestone.ts` — Milestone logic + data aggregation
- `src/features/patient/milestones/MilestoneSummaryCard.tsx` — Card UI component

### Modified
- `src/features/patient/dashboard/PatientDashboard.tsx` — Milestone card in celebration zone
- `src/features/doctor/patient/PatientProfile.tsx` — Milestones section in Overzicht tab
- `src/i18n/nl.ts` — Milestone-related i18n keys

## Testing

```bash
cd prototypes/sliminject
npm run test      # Vitest
npm run lint      # ESLint
```
