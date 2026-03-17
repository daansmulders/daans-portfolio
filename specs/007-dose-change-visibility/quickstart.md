# Quickstart: Dose Change Visibility

## Test scenarios

### Scenario 1: Chart dose markers (patient view)

1. Run `npm run seed`
2. Log in as `patient@demo.nl` / `demo1234` (Lars — 2 approved doses: 0.25 mg, 0.5 mg)
3. Open the dashboard → progress chart is visible
4. **Expected**: A dashed vertical marker appears at the point corresponding to 28 days ago (when Lars's dose changed from 0.25 to 0.5 mg)
5. Tap or hover the marker → tooltip: "0.5 mg — gestart op [date]"

### Scenario 2: Chart dose markers (doctor view)

1. Log in as `dokter@demo.nl` / `demo1234`
2. Open Lars's patient profile → Overzicht tab
3. **Expected**: The same dashed vertical marker and label appear on Lars's progress chart

### Scenario 3: No markers for single-dose patient

1. Log in as `patient3@demo.nl` / `demo1234` (Mohamed — 1 dose: 0.25 mg)
2. Open the dashboard → if chart is visible (may not be — Mohamed has only 2 entries)
3. **Expected**: No dose markers on the chart

### Scenario 4: Pre-increase announcement card

1. Log in as `patient@demo.nl` / `demo1234` (Lars — next increase: 1.0 mg in 14 days, status: draft)
2. **Expected**: No announcement card (draft status excluded by FR-013)
3. Change Lars's 1.0 mg entry to `status: 'approved'` and `start_date` to 5 days from now in the seed
4. Re-run seed, log in as Lars
5. **Expected**: Announcement card appears: "Volgende week gaat je dosis omhoog naar 1.0 mg"

### Scenario 5: Announcement card dismissal

1. Continue from Scenario 4
2. Tap the dismiss button (✕) on the announcement card
3. **Expected**: Card disappears
4. Refresh the page
5. **Expected**: Card does not reappear

### Scenario 6: Injection-day "Nieuwe dosis" marker

1. Log in as `nieuw@demo.nl` / `demo1234` (Sara — injection day today, first dose ever: 0.25 mg)
2. **Expected**: Injection-day card shows, but NO "Nieuwe dosis" marker (first dose is not an increase)
3. To test the marker: modify seed so Sara has a previous dose at 0.125 mg (or any lower dose) before today's 0.25 mg entry
4. Re-seed and log in
5. **Expected**: "Nieuwe dosis: 0.25 mg" marker appears inside the injection-day card above the confirmation question

### Scenario 7: "Nieuwe dosis" marker disappears after 2 confirmed injections

1. Continue from Scenario 6
2. Confirm the injection → complete the log
3. Re-seed to add a second confirmed adherence record for Sara at 0.25 mg
4. **Expected**: On the next injection day at the same dose, no "Nieuwe dosis" marker appears

### Scenario 8: No retroactive announcements

1. Log in as any patient whose last dose change was more than 7 days ago
2. **Expected**: No announcement card appears — past dose changes are not retroactively announced
