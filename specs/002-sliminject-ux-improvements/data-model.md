# Data Model: Sliminject UX Improvements

**Feature**: 002-sliminject-ux-improvements
**Date**: 2026-03-16

---

## No New Supabase Tables Required (P1–P3)

All P1, P2, and P3 improvements are UI-only changes to existing components. They consume existing Supabase data without schema modifications.

---

## Existing Entities Affected

### `progress_entries` (read-only changes)

No schema change. Existing fields consumed by new features:

| Field | Type | Used by |
|-------|------|---------|
| `patient_id` | string | Streak calculation, empty state detection |
| `logged_at` | string (ISO timestamp) | Streak calculation (consecutive day check) |
| `wellbeing_score` | number (1–5) | Hunger scale labels (UI only, field name unchanged) |
| `symptoms` | string[] | Prioritised checklist (UI grouping only) |

**Streak logic** (client-side, no DB change):
- Query: all entries for the current patient, ordered by `logged_at` DESC.
- Derive: consecutive calendar days from today going backward.
- Output: integer streak count, or 0 if no entry today or yesterday.

---

### `concerns` (read-only schema, new realtime subscription)

No schema change. New usage:

| Field | Type | Used by |
|-------|------|---------|
| `severity` | 'routine' \| 'urgent' | Realtime subscription filter, response time message |
| `status` | 'open' \| 'reviewed' | Unread badge count in doctor navigation |
| `doctor_response` | string \| null | Concern response confirmation state |

**Realtime channel** (no migration required):
- Channel: `urgent-concerns`
- Event: `INSERT` on `concerns` where `severity = 'urgent'`
- Scoped by Supabase RLS to the authenticated doctor's patients

---

### `advice` (no schema change)

Current schema already has a `body` field. Existing assumption: all advice is visible to the patient. The visibility label is a UI-only addition. No `is_visible_to_patient` field needed for prototype scope.

---

## New Client-Side State

### Notification Preferences (localStorage)

Stored per-patient in `localStorage` — no Supabase table for prototype scope.

| Key | Type | Description |
|-----|------|-------------|
| `sliminject_reminder_enabled` | boolean | Whether daily reminder is active |
| `sliminject_reminder_time` | string (HH:MM) | Preferred daily reminder time, e.g. "20:00" |

---

## P4: Educational Content Groups (Static Config)

The educational content table is not in the current TypeScript `Database` schema. Topic grouping is implemented via a static config file:

**File**: `src/features/patient/content/contentGroups.ts`

```ts
// Structure (not implementation):
type ContentGroup = {
  id: string          // e.g. 'start-here'
  label: string       // from nl.ts i18n key
  contentIds: string[] // ordered list of content item IDs
  isRecommendedStart: boolean
}
```

Content items are grouped at the config layer; the Supabase query remains unchanged. No DB migration required for prototype scope.

---

## Symptom Priority Grouping (Static Config)

The symptom checklist reordering is a UI-only change in `LogEntryForm.tsx`. The top 3 symptoms (misselijkheid, reactie injectieplaats, vermoeidheid) are shown by default; remaining 4 are under an expand control. All 7 symptoms continue to save correctly to `progress_entries.symptoms`.

---

## Summary: What Requires DB Migration

| Item | DB Change | Notes |
|------|-----------|-------|
| P1–P3 all items | None | UI changes only |
| P4 realtime badges | None | New Supabase channel; existing RLS covers it |
| P4 reminders | None | localStorage only |
| P4 content groups | None | Static config |
| Future: content topic columns | `topic_group`, `sort_order` on content table | Out of scope for this prototype iteration |
