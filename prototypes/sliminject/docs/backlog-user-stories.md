# Backlog — Sliminject Prototype

> **Status**: Active — updated 2026-03-17
> **Authors**: Designer + Product Owner
> **Sources**: GLP-1 UX Research Database (`glp1-data.md`), Customer Journey Map (`customer-journey-map.md`), backlog review session (2026-03-16)

---

## Completed

| # | Feature | Source | Spec |
|---|---------|--------|------|
| 1 | Dose adherence tracking | Theme 2: Medication Tinkering | 003 |
| 3 | Food noise tracking | Theme 12: Food Noise Reduction | 004 |
| 4 | Weekly wellbeing check-in | Themes 1, 9: Normalcy + Identity Shift | 004 |
| 6 | Unified injection-day experience | Journey Map Phases 2–5 | 006 |
| 7 | Dose increase announcement | Journey Map Phase 4 + Theme 3 | 007 |
| 8 | Dose annotations on progress chart | Journey Map Phases 4–5 + Theme 11 | 007 |

Also completed (from earlier tiers):
- Patient info on doctor's patient view, concern notification handling, inline notifications (Tier 1, spec 002)
- Hunger/side-effect split, chart improvements, milestone moments (Tier 2)

---

## Open — Patient Experience

### 2. Side effect management tips

**Source**: Theme 3: Side Effect Endurance
**Size**: Medium | **Spec**: None yet

Inline tips shown immediately after logging symptoms — brief, per-symptom guidance (nausea, diarrhea, fatigue, etc.). Max once per week per symptom. Severity 4–5 triggers a nudge to contact the doctor. Existing educational article system continues unchanged.

**Design note**: Editorial design and tone are critical. Multiple layout variants should be explored.

---

### 9. Weekly food noise check-in (injection-day rhythm)

**Source**: Journey Map Phases 3–5 + Theme 12: Food Noise Reduction
**Size**: Small | **Spec**: None yet | **Status**: Needs design refinement

Move food noise from daily log to weekly injection-day rhythm. Daily logs keep weight, hunger, symptoms, notes. Historical daily data stays on the chart. Milestone recalibrated for weekly data points.

**Open question**: Where exactly food noise lives and how it's framed now that the injection-day card and daily log are separate flows.

---

### 10. Treatment phase summary cards

**Source**: Journey Map Phases 5–6 + Theme 5: Weight Regain Fear
**Size**: Medium | **Spec**: None yet

Auto-generated summary cards at weeks 4, 8, 12, 16: weight change, adherence rate, wellbeing trends. Dismissible. Warm, informative tone — not gamified.

---

### 11. Plateau acknowledgement

**Source**: Journey Map Phase 6 + Theme 5: Weight Regain Fear
**Size**: Small | **Spec**: None yet

When weight is stable (< 0.5 kg change) across 3+ weekly logs, a card normalises the plateau. Includes link to message the doctor. Not shown in first 4 weeks. Dismissible.

---

### 12. Onboarding — titration preview

**Source**: Journey Map Phase 1 (gap: "no visibility into the plan ahead")
**Size**: Small | **Spec**: None yet

Add a "Jouw plan" step to onboarding showing the titration schedule: "In week 5 gaat je dosis omhoog naar 0.5 mg. Je arts heeft dit al ingepland." Reduces anxiety about the unknown.

---

### 13. Onboarding — injection-day framing

**Source**: Journey Map Phase 1 (gap: "onboarding has no mention of the injection itself")
**Size**: Small | **Spec**: None yet

Reframe onboarding step 3 around the first injection day instead of generic logging tips: "Je eerste injectiedag is [datum]. Hier is wat je kunt verwachten."

---

### 14. Proactive side effect guidance on injection day

**Source**: Journey Map Phase 2 (gap: "nausea tips are reactive instead of proactive")
**Size**: Small | **Spec**: None yet

On first injection day and each dose-increase injection day, show a brief anticipatory tip: "Kans op misselijkheid de eerste paar dagen — eet kleine maaltijden." Shown before symptoms, not after. Suppressed after weeks 1, 5, 7, 9, 11 (first injection + each dose increase).

**Relationship to item 2**: Item 2 is reactive (after logging); this is proactive (before symptoms). They complement each other.

---

### 15. Long-term streak recognition

**Source**: Journey Map Phase 6 (gap: "no long-term motivation")
**Size**: Small | **Spec**: None yet

Milestone cards at 3 months, 6 months, 12 months of continuous treatment. Reframes "still going" as an achievement. Uses the established warm milestone tone.

---

### 5. Shareable visit summary

**Source**: Theme 11: Doctor–Patient Tension
**Size**: Large | **Spec**: 005 (spec only, not implemented)

One-tap summary for doctor appointments. Full-screen, share-optimised view with weight change, dose, logs, side effects, concerns, wellbeing. Patient and doctor views identical. Share as PDF or native share sheet.

---

## Open — Doctor Experience

### 16. Patient list — attention bucketing

**Source**: Backlog review 2026-03-16 (Tier 5, item N)
**Size**: Medium | **Spec**: None yet

Patient list bucketed by attention type: needs attention / on track / no recent data. Currently displayed as a flat list in random order.

---

### 17. Prescription overview

**Source**: Backlog review 2026-03-16 (Tier 5, item O)
**Size**: Medium | **Spec**: None yet

Auto-generated prescription ready to approve per patient. Reduces manual administrative work.

---

## Open — Onboarding & Setup

### 18. Doctor-initiated patient intake

**Source**: Backlog review 2026-03-16 (Tier 4, item A)
**Size**: Medium | **Spec**: None yet

Doctor records starting weight, medication scheme, goal weight during intake. Currently done via direct database setup.

---

### 19. Patient onboarding flow (expanded)

**Source**: Backlog review 2026-03-16 (Tier 4, item B) + Journey Map Phase 1
**Size**: Medium | **Spec**: None yet

3-step flow: Welcome → What your doctor set up → First injection guide or first measurement. Subsumes items 12 and 13 if built together.

**Note**: Items 12 (titration preview) and 13 (injection-day framing) can be built incrementally as improvements to the existing onboarding, or folded into this larger redesign.

---

## Open — Medication & Scheduling

### 20. Medication timeline (patient-facing)

**Source**: Backlog review 2026-03-16 (Tier 3, item F)
**Size**: Medium | **Spec**: None yet

Medication schedule as visual timeline on the patient side. Tap a point to see dosage + what to expect for that dose adjustment. Currently only visible to the doctor.

---

### 21. Appointment scheduling improvements

**Source**: Backlog review 2026-03-16 (Tier 6, items H/I/J)
**Size**: Medium | **Spec**: None yet

Recurring/standing appointments, doctor dashboard overview, next appointment more prominent on patient view. Low priority — external scheduling tools already cover this.

---

## Deferred — Future Phases

These require significant design work or depend on features not yet built.

| Feature | Source | Depends on |
|---------|--------|------------|
| Goal weight tracking + chart goal line | Journey Map Phase 6 | Goal-setting UX design |
| Wellbeing history view (patient-facing) | Journey Map Phase 6 | Wellbeing data maturity |
| Goal celebration screen | Journey Map Phase 7 | Goal weight tracking |
| Transition guidance / maintenance mode | Journey Map Phase 7 | Post-titration phase design |
| Post-discontinuer flow | Theme 5: Weight Regain Fear | Offboarding phase design |
| Supervisor / handover / practice grouping | Backlog review (Tier 7, item Q) | Multi-doctor architecture |

---

## Sources

| Source | What it contains |
|--------|-----------------|
| `glp1-data.md` | 14 research themes from real-world GLP-1 user communities |
| `customer-journey-map.md` | 7-phase patient journey with current-state gaps and future-state proposals |
| Backlog review (2026-03-16) | Prioritised improvement tiers agreed after initial prototype build |
