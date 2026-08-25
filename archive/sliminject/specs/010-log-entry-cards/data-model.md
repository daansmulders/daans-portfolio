# Data Model: Log Entry Card Redesign

**Feature**: 010-log-entry-cards
**Date**: 2026-03-18

## Entity Changes

None. This feature is a display-only change — no data model modifications.

## Entities Used (read-only)

### ProgressEntry (unchanged)

**Source**: `useProgressEntries` hook, fetched from Supabase `progress_entries` table

| Field | Type | Display in card |
|-------|------|-----------------|
| id | string | Not displayed (key only) |
| patient_id | string | Not displayed |
| logged_at | string (ISO) | Always shown as formatted date |
| weight_kg | number \| null | Shown if non-null, with "kg" suffix |
| hunger_score | number \| null | Shown if non-null, as "Honger N/5" badge |
| food_noise_score | number \| null | Shown if non-null, as "Voedselruis N/5" badge |
| symptoms | SymptomEntry[] | Shown as chips (max 3), with severity if > 0 |
| notes | string \| null | Shown if non-null, truncated to 2 lines |

### SymptomEntry (unchanged)

| Field | Type | Notes |
|-------|------|-------|
| name | string | Displayed as chip label |
| severity | number | Shown as "N/5" next to name if > 0; hidden if 0 (legacy) |

## Display Rules

- **Null/empty fields**: Not rendered — no placeholder, no gap
- **Symptom overflow**: Max 3 chips shown; remainder as "+N meer" text
- **Notes truncation**: CSS line-clamp at 2 lines
- **Legacy entries**: `severity === 0` means legacy — show name only, no severity badge
- **Injection day**: Badge determined by parent via `isInjectionDay` prop, not from entry data
