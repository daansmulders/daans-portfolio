# UI Contract: Side Effect Support

## 1. symptomTips.ts — tip content and selection

### Interface

```ts
interface SymptomTip {
  symptom: string    // matches the display name from the log form chip
  tip: string        // the guidance text shown to the patient
  priority: number   // 1 = highest (nausea), 6 = lowest
}

// Static ordered array of all tips
const SYMPTOM_TIPS: SymptomTip[]

// Given a list of logged symptoms and a throttle check function,
// returns the highest-priority tip that hasn't been shown this week, or null
function selectTip(
  loggedSymptoms: string[],
  wasShownRecently: (symptom: string) => boolean
): SymptomTip | null
```

### Behaviour

- `selectTip` iterates `SYMPTOM_TIPS` in priority order
- For each tip, checks if `loggedSymptoms` includes the symptom AND `wasShownRecently(symptom)` is false
- Returns the first match, or null if no eligible tip exists
- Symptoms not in the tip map are silently ignored

---

## 2. useSymptomTipThrottle hook

### Interface

```ts
interface UseSymptomTipThrottleReturn {
  wasShownRecently: (symptom: string) => boolean  // true if shown within 7 days
  markShown: (symptom: string) => void             // records current timestamp
}

function useSymptomTipThrottle(): UseSymptomTipThrottleReturn
```

### Behaviour

- `wasShownRecently` reads `localStorage.getItem('sliminject_tip_last_{symptom}')`, parses as number, returns `Date.now() - stored < 7 * 86400 * 1000`
- `markShown` writes `localStorage.setItem('sliminject_tip_last_{symptom}', String(Date.now()))`
- No React state needed — reads directly from localStorage on each call

---

## 3. LogEntryForm — reactive tip card

### Integration point

After log submission succeeds (lines 67–71 in current code), when `symptomen.length > 0`:

1. Call `selectTip(symptomen, wasShownRecently)`
2. If a tip is returned:
   - Set `succes` state to `'tip'` (new variant alongside `'online'`, `'offline'`, `'mijlpaal'`)
   - Call `markShown(tip.symptom)`
   - **Do NOT** set `setTimeout(() => navigate(...))` — let the patient dismiss manually
3. If no tip (all throttled or no mapped symptoms):
   - Continue with existing behaviour (auto-navigate after 1.2s)

### Visual specification

```
┌─────────────────────────────────────────┐
│ ✓ Meting opgeslagen                     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 Tip bij misselijkheid            │ │
│ │                                     │ │
│ │ Eet kleine, droge maaltijden.       │ │
│ │ Gember kan helpen. Vermijd vette    │ │
│ │ of sterk geurende gerechten.        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Terug naar dashboard]                  │
└─────────────────────────────────────────┘
```

- Success message: existing `.alert-brand` style
- Tip card: `.card` with warm styling — `bg-warm-50`, `border-l-2 border-brand-600`
- Tip header: symptom name with a subtle emoji or icon prefix
- Manual navigate button: `.btn btn-primary w-full`
- The submit button area is replaced by the tip + navigate button when in `'tip'` state

---

## 4. InjectionDayCard — proactive tip

### New props

```ts
interface InjectionDayCardProps {
  // ... existing props ...
  isNewDose?: boolean
  newDoseMg?: number | null
  isFirstInjection?: boolean     // NEW
}
```

### Visual specification

When `step === 'confirm'` and (`isFirstInjection` or `isNewDose`):

```
┌─────────────────────────────────────────┐
│ ● Injectiedag                           │
│                                         │
│ [Nieuwe dosis: 0.5 mg block — if dose   │
│  increase, from Feature 007]            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Kans op misselijkheid de eerste     │ │
│ │ dagen — eet licht en drink          │ │
│ │ voldoende water.                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Heb je je injectie gezet?               │
│ [Ja, genomen] [Nee, overgeslagen] ...   │
└─────────────────────────────────────────┘
```

- Proactive tip renders as a subtle card: `bg-warm-50`, `text-sm`, `rounded-lg px-3 py-2`
- Positioned below the "Nieuwe dosis" marker (if present) and above the confirmation question
- Different content for first-ever injection vs dose increase (see data-model.md)
- Only shown in `step === 'confirm'`

---

## 5. useDoseChanges — new `isFirstInjection` field

### Updated return type

```ts
interface UseDoseChangesReturn {
  // ... existing fields ...
  isFirstInjection: boolean  // NEW — true when no adherence records exist at all
}
```

### Behaviour

- `isFirstInjection = adherenceRecords.length === 0 && current !== null`
- Separate from `isNewDose` — they don't overlap (first injection has no previous dose)

---

## 6. i18n keys

```ts
// Bijwerkingen tips (feature 008)
tip_bij_symptoom: 'Tip bij {symptoom}',
tip_eerste_injectie: 'Dit is je eerste injectie. Misselijkheid is normaal de eerste dagen — eet licht en drink voldoende water.',
tip_dosisverhoging_bijwerking: 'Nieuwe dosis — bijwerkingen zoals misselijkheid kunnen tijdelijk terugkomen. Dit is normaal en trekt meestal bij.',
tip_terug_dashboard: 'Terug naar dashboard',

// Nieuwe symptomen
symptoom_haaruitval: 'Haaruitval',
symptoom_injectieplaatsreactie: 'Injectieplaatsreactie',
```
