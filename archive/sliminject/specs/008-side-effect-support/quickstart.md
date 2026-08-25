# Quickstart: Side Effect Support

## Test scenarios

### Scenario 1: Reactive tip — single symptom

1. Run `npm run seed`
2. Log in as `patient@demo.nl` / `demo1234` (Lars)
3. Navigate to "Log vandaag" form
4. Select "Misselijkheid" as a symptom, fill in weight + hunger, submit
5. **Expected**: Confirmation screen shows "✓ Meting opgeslagen" AND a tip card: "Tip bij misselijkheid — Eet kleine, droge maaltijden..."
6. **Expected**: No auto-navigate. A "Terug naar dashboard" button is shown.
7. Tap "Terug naar dashboard" → returns to dashboard

### Scenario 2: Reactive tip — multiple symptoms, priority ordering

1. Navigate to log form again
2. Select both "Vermoeidheid" and "Obstipatie", submit
3. **Expected**: Only the Vermoeidheid tip shows (priority 2 > priority 4)

### Scenario 3: Reactive tip — once per week throttle

1. Continue from Scenario 1 (nausea tip was shown)
2. Navigate to log form, select "Misselijkheid" again, submit
3. **Expected**: No tip shown (nausea tip already shown within 7 days). Auto-navigate fires normally after 1.2s.

### Scenario 4: No tip for unmapped symptoms

1. Navigate to log form
2. Select "Hoofdpijn" only (no tip mapped for this symptom), submit
3. **Expected**: Standard confirmation, no tip card, auto-navigate fires normally

### Scenario 5: Log with no symptoms

1. Navigate to log form
2. Fill weight + hunger only, no symptoms, submit
3. **Expected**: Standard confirmation, no tip card, auto-navigate fires normally

### Scenario 6: Proactive tip — first injection ever

1. Clear localStorage (or use incognito)
2. Log in as `nieuw@demo.nl` / `demo1234` (Sara — injection day today, no prior adherence records)
3. **Expected**: Injection-day card shows with proactive tip: "Dit is je eerste injectie. Misselijkheid is normaal de eerste dagen..."
4. The tip appears in the confirm step, before the "Heb je je injectie gezet?" question

### Scenario 7: Proactive tip — dose increase

1. Log in as a patient with a dose increase injection day (requires seed modification — set Sara's 0.25 mg as a previous dose with a lower amount before it)
2. **Expected**: Injection-day card shows both "Nieuwe dosis: 0.25 mg" marker AND proactive side-effect tip below it
3. The two are visually distinct blocks

### Scenario 8: No proactive tip — regular injection day

1. Confirm Sara's injection (Scenario 6), re-seed
2. Set up Sara with a second injection day at the same dose (add another schedule entry at the same dose_mg, confirmed adherence for the first)
3. After 2 confirmed injections at 0.25 mg, set a third injection day
4. **Expected**: No proactive tip — 3rd+ injection at same dose shows standard injection-day card
