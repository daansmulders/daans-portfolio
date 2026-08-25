# Data Model: Side Effect Management Tips

**Feature**: 009-side-effect-tips
**Date**: 2026-03-17

## Entity Changes

### Progress Entry (modified)

**Table**: `progress_entries` (Supabase) / `offline_progress_entries` (Dexie)

| Field | Type | Change | Notes |
|-------|------|--------|-------|
| symptoms | `string[]` → `SymptomEntry[]` | **Modified** | Was array of names, now array of objects |

**SymptomEntry structure**:
```
{
  name: string        // Symptom display name (e.g., "Misselijkheid")
  severity: number    // 1 (mild) to 5 (very severe)
}
```

**Backward compatibility**: Historical entries may contain plain strings instead of objects. Application code must handle both:
- `"Misselijkheid"` → legacy, display without severity
- `{ name: "Misselijkheid", severity: 3 }` → new format, display with severity

### Symptom Tip (modified)

**Source**: Static data in `symptomTips.ts` (no database table)

| Field | Type | Change | Notes |
|-------|------|--------|-------|
| symptom | string | Unchanged | Symptom display name |
| tips | `{ heading: string, body: string }[]` | **New** | Replaces single `tip: string`. 2–3 variants per symptom |
| priority | number | Unchanged | Clinical priority (1 = highest) |

**Previous structure** (single tip per symptom):
```
{ symptom: "Misselijkheid", tip: "Eet kleine...", priority: 1 }
```

**New structure** (multiple tips per symptom):
```
{
  symptom: "Misselijkheid",
  tips: [
    { heading: "Tip bij misselijkheid", body: "Eet kleine, droge maaltijden..." },
    { heading: "Tip bij misselijkheid", body: "Vermijd vette of sterk geurende..." },
    { heading: "Tip bij misselijkheid", body: "Gember(thee) kan helpen..." }
  ],
  priority: 1
}
```

### Tip Throttle Record (modified)

**Storage**: localStorage (no database table)

**Key pattern**: `sliminject_tip_last_{symptom_name}`

| Field | Type | Change | Notes |
|-------|------|--------|-------|
| timestamp | number | Unchanged | Unix ms when tip was last shown |
| variantIndex | number | **New** | Which tip variant was shown (for rotation) |

**Previous value**: `"1710633600000"` (timestamp string)
**New value**: `'{"timestamp":1710633600000,"variantIndex":0}'` (JSON string)

**Backward compatibility**: If parsing returns a plain number (old format), treat as `{ timestamp: <number>, variantIndex: 0 }`.

## Entities Unchanged

- **Patient** — no schema changes
- **Doctor** — no schema changes
- **Concerns** — no schema changes (nudge links to existing concern flow)
- **Dosage Schedule** — no changes
- **Wellbeing Check-ins** — no changes

## Symptom Coverage Matrix

All 9 symptoms must have tip content (2–3 variants each):

| Symptom | i18n Key | Current Tips | New Tips Needed |
|---------|----------|-------------|-----------------|
| Misselijkheid | symptoom_misselijkheid | 1 | +1–2 variants |
| Maagklachten | symptoom_maagklachten | 0 | +2–3 variants |
| Vermoeidheid | symptoom_vermoeidheid | 1 | +1–2 variants |
| Hoofdpijn | symptoom_hoofdpijn | 0 | +2–3 variants |
| Droge mond | symptoom_droge_mond | 0 | +2–3 variants |
| Duizeligheid | symptoom_duizeligheid | 0 | +2–3 variants |
| Obstipatie | symptoom_constipatie | 1 | +1–2 variants |
| Haaruitval | symptoom_haaruitval | 1 | +1–2 variants |
| Injectieplaatsreactie | symptoom_injectieplaatsreactie | 1 | +1–2 variants |

**Total new tip variants needed**: ~18–22 (including expanding existing single tips to 2–3 variants)
