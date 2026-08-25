# Implementation Plan: Side Effect Management Tips

**Branch**: `009-side-effect-tips` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-side-effect-tips/spec.md`

## Summary

Upgrade the existing binary symptom logging to include per-symptom severity (1–5), expand the tip system to cover all 9 symptoms with 2–3 rotating tip variants each, add a doctor-contact nudge for severity 4–5, and make symptoms visible on the doctor's patient view. The existing tip throttle (7 days per symptom) and editorial article system remain unchanged.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: React Router 7, Tailwind CSS 4, Sonner (toasts), Supabase JS v2, Dexie.js 4
**Storage**: Supabase PostgreSQL (primary), Dexie IndexedDB (offline queue), localStorage (tip throttle)
**Testing**: Vitest 4.1 + Testing Library (setup exists, no tests yet)
**Target Platform**: Mobile-first web app (responsive)
**Project Type**: Prototype web application
**Performance Goals**: Logging flow no more than 30s slower than current (SC-005)
**Constraints**: Offline-capable, Dutch language only, no new dependencies
**Scale/Scope**: <100 patients, 9 symptoms, ~22 tip variants

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | N/A | Applies to Jekyll site, not prototypes |
| II. Content-Driven Architecture | N/A | Applies to Jekyll site |
| III. Design Integrity | PASS | Editorial tip design is a spec requirement (US-5) |
| IV. No Regression on v1 | N/A | Changes are scoped to `prototypes/sliminject/` |
| V. Performance by Default | PASS | No new assets; tip data is static |
| VI. Tools are Sandboxed | PASS | All changes within `prototypes/sliminject/` |
| VII. Security First | PASS | Severity data follows existing RLS patterns; tip throttle is non-sensitive local data |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/009-side-effect-tips/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files to modify/create)

```text
prototypes/sliminject/src/
├── features/
│   ├── patient/
│   │   ├── dashboard/
│   │   │   └── LogEntryForm.tsx          # MODIFY — severity selector + updated post-log flow
│   │   └── symptoms/
│   │       ├── symptomTips.ts            # MODIFY — multi-variant tips, all 9 symptoms
│   │       ├── useSymptomTipThrottle.ts  # MODIFY — variant rotation tracking
│   │       ├── SeveritySelector.tsx      # NEW — inline 1–5 severity buttons per chip
│   │       ├── TipCard.tsx               # NEW — editorial tip card component
│   │       └── DoctorNudge.tsx           # NEW — doctor-contact nudge component
│   └── doctor/
│       └── patient/
│           └── PatientProfile.tsx        # MODIFY — show symptoms in log history
├── i18n/
│   └── nl.ts                            # MODIFY — severity labels, nudge text, tip content
└── lib/
    ├── supabase.ts                       # MODIFY — SymptomEntry type in progress_entries
    └── db.ts                             # MODIFY — Dexie schema version bump
```

**Structure Decision**: No new directories needed. New components go in `features/patient/symptoms/` which already exists. The data layer changes are minimal (type updates in existing files).

## Implementation Phases

### Phase A: Data model + severity input (P1 — User Stories 1 & 4)

1. **Update types** — Define `SymptomEntry` type (`{ name: string, severity: number }`). Update Supabase types in `supabase.ts` and Dexie schema in `db.ts`. Add backward-compat helper to normalize legacy `string` entries to `SymptomEntry` objects.

2. **Severity selector component** — Create `SeveritySelector.tsx`: compact inline row of 5 buttons (1–5), matching the visual pattern of the hunger score selector but smaller. Appears below an active symptom chip.

3. **Update LogEntryForm** — Replace binary chip toggles with chip + severity flow. Tapping a chip activates it at severity 1 and reveals the severity selector. Tapping again deselects. Submit stores `SymptomEntry[]` instead of `string[]`.

4. **i18n: severity labels** — Add Dutch labels for severity scale (1 = Licht, 2 = Mild, 3 = Matig, 4 = Ernstig, 5 = Zeer ernstig).

### Phase B: Tip content expansion + rotation (P1/P2 — User Stories 2 & 4)

5. **Expand symptomTips.ts** — Restructure from single `tip: string` to `tips: { heading, body }[]` with 2–3 variants per symptom. Add tips for the 3 missing symptoms (maagklachten, hoofdpijn, droge mond, duizeligheid — actually 4 missing). All content in Dutch, warm editorial tone.

6. **Update useSymptomTipThrottle** — Change localStorage value from plain timestamp to `{ timestamp, variantIndex }`. Add backward compat for old format. Add `getNextVariantIndex()` helper.

7. **Update selectTip()** — Return the correct variant based on rotation index. Accept severity data to enable nudge logic (phase C).

### Phase C: Doctor-contact nudge (P2 — User Story 3)

8. **DoctorNudge component** — Create `DoctorNudge.tsx`: warm-toned card with message like "Je arts kan je helpen" + button linking to `/patient/concerns`. Visually distinct from regular tips (e.g., different border color, slightly larger).

9. **Update post-log flow in LogEntryForm** — After submit, check if any symptom has severity 4–5. If yes → show DoctorNudge instead of tip. If no → show tip per existing logic (with rotation). If no eligible tip → navigate to dashboard.

### Phase D: Editorial tip card design (P3 — User Story 5)

10. **TipCard component** — Extract tip display from LogEntryForm into a dedicated `TipCard.tsx` component. Add symptom-category icon (inline SVG), typography hierarchy (heading + body), warm background styling using design tokens.

11. **Visual refinement** — Style both TipCard and DoctorNudge with the Sliminject design system (brand colors, warm palette, card patterns). Ensure visual distinction between regular tips and doctor nudges.

### Phase E: Doctor-side visibility (P2 — FR-011)

12. **Update PatientProfile** — In the Overzicht tab's log entries section, add symptom chips with severity indicators per entry. Handle legacy entries (name-only, no severity badge). Use existing chip styling.

### Phase F: i18n + polish

13. **Complete i18n** — Add all new keys to `nl.ts`: severity labels, doctor nudge text, dismiss labels, all tip content (18–22 tip variants).

14. **Edge case handling** — Verify: multiple severe symptoms → single nudge, all tips throttled → standard success, offline logging → tips work, historical entries → display gracefully.
