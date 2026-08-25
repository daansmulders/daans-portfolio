# UI Contract: Dose Change Visibility

## 1. ProgressChart — `doseSteps` prop

### Interface

```ts
interface DoseStep {
  date: string      // YYYY-MM-DD
  dose_mg: number
}

interface ProgressChartProps {
  entries: ProgressEntry[]
  showFoodNoise?: boolean
  onToggleFoodNoise?: () => void
  doseSteps?: DoseStep[]   // NEW — optional, no markers when omitted or empty
}
```

### Visual specification

- Each dose step renders as a **dashed vertical line** spanning the full chart height
- Line style: `stroke="#AAA49C"`, `strokeWidth="1"`, `strokeDasharray="2 2"`, `opacity="0.6"`
- A small **label** at the top of the line: `"0.5 mg"` — `fontSize="7"`, `fill="#6B6660"`, positioned above `PAD_TOP`
- **Tooltip on tap/hover**: Not an HTML tooltip — render as an SVG `<text>` element that appears on interaction, positioned near the marker. Format: `"0.5 mg — gestart op 17 feb 2026"`
- If `doseSteps` is undefined, null, or has fewer than 2 entries (meaning no change from starting dose), render nothing
- Skip the first entry in `doseSteps` — it's the starting dose, not a change

### Positioning

Dose markers are positioned by finding the closest `entry.logged_at` date to the dose step's `start_date`, then using that entry's index in the sorted entries array to compute `toX(index, total)`.

---

## 2. useDoseChanges hook

### Interface

```ts
interface DoseChange {
  entryId: string       // dosage_schedule_entries.id
  date: string          // start_date (YYYY-MM-DD)
  dose_mg: number
  previousDose_mg: number
}

interface UseDoseChangesReturn {
  doseSteps: DoseStep[]           // For ProgressChart prop
  announcement: {                  // Pre-increase card data (null if nothing to show)
    entryId: string
    dose_mg: number
    daysUntil: number
  } | null
  dismissAnnouncement: (entryId: string) => void
  isNewDose: boolean              // For injection-day card marker
  newDoseMg: number | null        // Current new dose amount (null if not new)
  confirmedAtCurrentDose: number  // Count of confirmed injections at this dose level
}
```

### Behaviour

- **`doseSteps`**: Derived from approved schedule entries. Includes all entries (including starting dose) — the chart skips the first one when rendering markers.
- **`announcement`**: The first upcoming approved entry where `dose_mg > current dose_mg`, `start_date` is within 7 days, and the entry has not been dismissed in localStorage. Returns null if none qualifies.
- **`dismissAnnouncement`**: Writes `sliminject_dose_dismissed_{entryId}` to localStorage and updates state.
- **`isNewDose`**: True if the current dose level is different from the previous dose level AND fewer than 2 confirmed adherence records exist for entries at this dose level.
- **`confirmedAtCurrentDose`**: Count of confirmed adherence records for entries at the current dose level.

---

## 3. Announcement card (inline in PatientDashboard)

### Visual specification

```
┌─────────────────────────────────────────┐
│ ▲ Dosisverhoging                    ✕   │
│                                         │
│ Volgende week gaat je dosis omhoog      │
│ naar 0.5 mg.                            │
│                                         │
│ Bijwerkingen zoals misselijkheid        │
│ kunnen tijdelijk terugkomen.            │
└─────────────────────────────────────────┘
```

- Uses `.alert-amber` class (existing)
- Dismiss button (✕) calls `dismissAnnouncement(entryId)`
- Positioned between the injection-day card section and the doctor messages section

---

## 4. Injection-day "Nieuwe dosis" marker (inline in InjectionDayCard)

### Visual specification

When `isNewDose` is true and `step === 'confirm'`:

```
┌─────────────────────────────────────────┐
│ ● Injectiedag                           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Nieuwe dosis: 0.5 mg               │ │
│ │ Bijwerkingen kunnen tijdelijk       │ │
│ │ terugkomen.                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Heb je je injectie gezet?               │
│ [Ja, genomen] [Nee, overgeslagen] ...   │
└─────────────────────────────────────────┘
```

- Renders as a small `.alert-amber` block inside the card, before the question
- Only shown when `step === 'confirm'` (not during log or done steps)
- Disappears after 2 confirmed injections at this dose level

---

## 5. i18n keys

```ts
// Dosisverhoging (feature 007)
dosis_marker_label: 'mg',
dosis_aankondiging_titel: 'Dosisverhoging',
dosis_aankondiging_tekst: 'Volgende week gaat je dosis omhoog naar {dosis} mg.',
dosis_aankondiging_bijwerking: 'Bijwerkingen zoals misselijkheid kunnen tijdelijk terugkomen.',
dosis_nieuw_label: 'Nieuwe dosis: {dosis} mg',
dosis_nieuw_bijwerking: 'Bijwerkingen kunnen tijdelijk terugkomen.',
dosis_tooltip: '{dosis} mg — gestart op {datum}',
```
