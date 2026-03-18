# Quickstart: Collapsed Entry Card Indicators

**Feature**: 011-collapsed-card-indicators
**Date**: 2026-03-18

## Prerequisites

- Node.js 18+
- Supabase project with seed data (entries with symptoms and scores)

## Local Development

```bash
cd prototypes/sliminject
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## What to verify

1. **Patient dashboard** (`/patient/dashboard`): Collapsed entry cards show:
   - Green dot when symptoms logged (all mild)
   - Amber dot when any symptom severity ≥ 4
   - Compact "H3 V2" style scores when hunger/food noise present
   - No indicators when no symptoms or scores logged

2. **Doctor view** (`/dokter/patient/:id`): Same indicators in Overzicht tab entries

3. **Mobile**: All indicators fit on one line without wrapping (test at 375px width)

## Key File

- `src/features/patient/dashboard/LogEntryCard.tsx` — Only file modified

## Seed data

Run `npm run seed` to populate entries. Lars has entries with symptoms (Misselijkheid, Vermoeidheid) that will show the side-effect dot.
