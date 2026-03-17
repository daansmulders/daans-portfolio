# Quickstart: Testing the Injection-Day Experience

## Prerequisites

- Dev server running (`npm run dev` in `prototypes/sliminject/`)
- Logged in as a test user with a dosage schedule that has Lars (injection day = today)
- `npm run seed` has been run

---

## Scenario 1 — Full injection-day flow (happy path)

1. Log in as Lars (`lars@test.sliminject.nl`)
2. Open the patient dashboard
3. **Expect**: A single "Injectiedag" card in place of the separate adherence card and log CTA
4. Tap **"Ja, genomen"**
5. **Expect**: Card expands to show log fields — weight, hunger, food noise (weekly framing), energy, note
6. Enter weight `83.5`, set hunger to `2`, set food noise to `1`, set energy to `4`
7. Tap **"Opslaan"**
8. **Expect**: Acknowledgement message: "Injectie genoteerd. Zo houd je je behandeling op koers."
9. **Expect**: Card disappears after ~2 seconds
10. **Expect**: No standalone adherence card or log CTA visible
11. Check `injection_adherence` table: row with `response = 'confirmed'` for Lars
12. Check `progress_entries` table: row with `weight_kg = 83.5`, `hunger_score = 2`, `food_noise_score = 1`
13. Check `weekly_wellbeing_checkins` table: row with `energy_score = 4`

---

## Scenario 2 — Skip log after confirming

1. Same setup as Scenario 1 (reset: delete today's adherence record and progress entry)
2. Tap **"Ja, genomen"**
3. Do not fill in any fields
4. Tap **"Sla log over"**
5. **Expect**: Acknowledgement message shown
6. **Expect**: Only `injection_adherence` row saved (confirmed), no `progress_entries` row

---

## Scenario 3 — Skip injection

1. Reset adherence record
2. Tap **"Nee, overgeslagen"**
3. **Expect**: Card closes immediately, no log fields shown
4. Check `injection_adherence`: row with `response = 'skipped'`
5. **Expect**: No `progress_entries` row for today from this flow

---

## Scenario 4 — Adjusted dose

1. Reset adherence record
2. Tap **"Andere dosis"**
3. **Expect**: Note textarea appears
4. Enter "Halve dosis gezet vanwege misselijkheid"
5. Tap **"Opslaan"**
6. Check `injection_adherence`: row with `response = 'adjusted'`, note populated

---

## Scenario 5 — Non-injection day

1. Log in as Lars
2. Change system date to a non-injection day (or create a test user without a schedule)
3. **Expect**: Standard daily log CTA appears ("Log vandaag") — no Injectiedag card

---

## Scenario 6 — Visual distinction in entries list

1. After completing Scenario 1, scroll down to the recent entries section on the dashboard
2. **Expect**: Today's entry shows an "Injectiedag" badge alongside the week badge

---

## Scenario 7 — Visual distinction in doctor view

1. Log in as the doctor
2. Open Lars's patient profile → Medicatie tab
3. **Expect**: Lars's confirmed injection for today shows weight and hunger score inline below the adherence badge

---

## Scenario 8 — Wellbeing check-in suppressed on injection day

1. Ensure Lars has not had a wellbeing check-in in the past 7 days (so `isDue = true` for wellbeing)
2. Load dashboard on injection day
3. **Expect**: No standalone wellbeing check-in card visible (suppressed because injection-day card is shown)
4. After completing the injection-day card, reload dashboard
5. **Expect**: Wellbeing card remains absent (7-day gate satisfied by the check-in just saved)
