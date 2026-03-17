# UI Contract: InjectionDayCard

## Purpose

A single card that replaces both `<AdherenceCheckIn>` and the daily log CTA on scheduled injection days. Guides the patient through a two-step flow: confirm the injection, then optionally fill in log fields.

---

## Component: `InjectionDayCard`

**File**: `src/features/patient/adherence/InjectionDayCard.tsx`

### Props

```ts
interface InjectionDayCardProps {
  isDue: boolean                    // from useInjectionDayCard — if false, renders null
  step: 'confirm' | 'log' | 'done'  // managed internally via useInjectionDayCard
  submitting: boolean
  onConfirm: () => void             // advances step to 'log'
  onSkip: (note?: string) => Promise<void>
  onAdjust: (note?: string) => Promise<void>
  onSubmitLog: (data: InjectionDayLogData) => Promise<void>
}

interface InjectionDayLogData {
  weight_kg: number | null
  hunger_score: number              // 1–5, required (defaults to 3)
  food_noise_score: number | null   // 1–5, optional — weekly framing
  energy_score: number | null       // 1–5, optional
  note: string | null               // max 200 chars
}
```

*In practice the component is thin UI; all state and async logic lives in `useInjectionDayCard`.*

---

## Hook: `useInjectionDayCard`

**File**: `src/features/patient/adherence/useInjectionDayCard.ts`

### Returns

```ts
{
  isDue: boolean              // true only on injection days with no adherence record yet
  step: 'confirm' | 'log' | 'done'
  submitting: boolean
  currentEntryId: string | null  // the current schedule_entry_id
  confirmInjection: () => void   // sets step to 'log'; saves nothing yet
  submitLog: (data: InjectionDayLogData) => Promise<void>  // saves all 3 records, sets step to 'done'
  skipInjection: (note?: string) => Promise<void>          // saves adherence only
  adjustInjection: (note?: string) => Promise<void>        // saves adherence only
}
```

### Internal composition

Wraps `useAdherenceCheckIn` (for `isDue`, `currentEntry`, `submitAdherence`) and calls `addEntry` from `useProgressEntries` and the Supabase insert for `weekly_wellbeing_checkins` directly.

---

## Step flow

```
step = 'confirm'
  ├── "Ja, genomen"   → step = 'log'
  ├── "Overgeslagen"  → submitAdherence('skipped') → card dismissed
  └── "Andere dosis"  → note field → submitAdherence('adjusted') → card dismissed

step = 'log'  (only reached after 'Ja, genomen')
  └── submit → saveProgressEntry + saveAdherence('confirmed') + saveWellbeingCheckIn → step = 'done'

step = 'done'
  └── acknowledgement message shown for ~2s → card dismissed (isDue becomes false)
```

---

## Visual contract

### Step: confirm

```
┌─────────────────────────────────────┐
│ [label] Injectiedag                 │
│ Heb je je injectie gezet?           │
│                                     │
│ [btn-primary]  ✓ Ja, genomen        │
│ [btn-ghost]    Nee, overgeslagen    │
│ [btn-ghost]    Andere dosis         │
└─────────────────────────────────────┘
```

### Step: log (after confirming)

```
┌─────────────────────────────────────┐
│ [label] Injectie genoteerd ✓        │
│ Hoe gaat het deze week?             │
│                                     │
│ Gewicht (kg) [input, optional]      │
│                                     │
│ Hongergevoel [1–5 buttons]          │
│                                     │
│ Eetgedachten deze week [1–5, opt]   │
│ "Nauwelijks" ←————→ "Constant"      │
│                                     │
│ Energie [1–5 buttons, optional]     │
│ "Laag" ←————→ "Hoog"               │
│                                     │
│ Notitie [textarea, 200 chars, opt]  │
│                                     │
│ [btn-primary, full-width] Opslaan   │
│ [btn-ghost, sm] Sla log over        │
└─────────────────────────────────────┘
```

"Sla log over" saves only the adherence record (confirmed) without a log entry and closes the card.

### Step: done

```
┌─────────────────────────────────────┐
│ ✓  Injectie genoteerd.              │
│    Zo houd je je behandeling        │
│    op koers.                        │
└─────────────────────────────────────┘
```

Shown for ~2 seconds then card collapses/disappears. Uses `.alert-brand` styling.

---

## Visual marker: injection-day entries in history

In `PatientDashboard` recent entries list, entries on injection days get a badge alongside the existing "Week N" badge:

```
[Injectiedag]  [Week 4]   ma 3 mrt      83.2 kg   Honger 2/5
```

The "Injectiedag" badge uses the same brand-green pill style as "Week N": `background: #EDF7F4, color: #2D7A5E`.

In `PatientProfile` Medicatie tab, the adherence list item for confirmed injections shows the associated log data inline if available:

```
0.5 mg — 3 mrt 2026                    [Genomen]
  83.2 kg · Honger 2/5
```

---

## i18n keys to add (`src/i18n/nl.ts`)

```ts
injectiedag_titel:            'Injectiedag'
injectiedag_vraag:            'Heb je je injectie gezet?'
injectiedag_bevestigd_label:  'Injectie genoteerd ✓'
injectiedag_log_subtitel:     'Hoe gaat het deze week?'
injectiedag_sla_log_over:     'Sla log over'
injectiedag_bevestiging:      'Injectie genoteerd. Zo houd je je behandeling op koers.'
injectiedag_badge:            'Injectiedag'
log_voedselruis_week:         'Eetgedachten deze week'
log_energie:                  'Energie'
```
