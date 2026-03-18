# Research: Side Effect Management Tips

**Feature**: 009-side-effect-tips
**Date**: 2026-03-17

## Decision 1: Symptom data model migration

**Decision**: Change `symptoms` from `string[]` to a JSONB array of `{ name: string, severity: number }` objects in both Supabase (`progress_entries`) and Dexie (`offline_progress_entries`).

**Rationale**: The current `string[]` column in Postgres is already an array type. Changing to JSONB objects (`[{"name":"Misselijkheid","severity":3}]`) allows per-symptom severity without adding a separate table or column. Supabase supports JSONB natively with good query performance at this scale.

**Alternatives considered**:
- Separate `symptom_severities: number[]` column (parallel arrays — fragile, ordering must match)
- Separate `symptom_logs` junction table (over-engineered for a prototype with <100 patients)
- Keep `string[]` and add severity as suffix like `"Misselijkheid:3"` (hacky, breaks existing code)

**Backward compatibility**: Historical entries have plain strings without severity. The application layer treats entries without severity objects as legacy — displays symptom name only, no severity badge. No data migration needed; the code handles both formats.

## Decision 2: Tip rotation strategy

**Decision**: Track the last-shown tip variant index per symptom in localStorage alongside the existing timestamp. On next eligible display, advance to the next variant (wrapping around).

**Rationale**: Simple sequential rotation is predictable and ensures all variants are seen. Random selection risks repeats. The localStorage key changes from storing just a timestamp to storing `{ timestamp: number, variantIndex: number }`.

**Alternatives considered**:
- Random selection (could show same tip twice in a row)
- Weighted by severity (adds complexity, tips are already short and general)
- Shuffle bag (unnecessary for 2–3 items)

## Decision 3: Severity selector UI pattern

**Decision**: When a symptom chip is tapped, it activates at severity 1 and reveals a compact inline 1–5 button row below the chip (similar to the existing hunger score selector but smaller). Tapping the chip again deselects it entirely.

**Rationale**: The existing hunger/food-noise pattern (row of 5 numbered buttons) is already familiar to patients. Making severity selection inline per-chip keeps the form scannable. The default-to-1 behavior means patients who don't care about severity can just tap and move on.

**Alternatives considered**:
- Slider per symptom (too much visual weight for optional input)
- Long-press to set severity (poor discoverability)
- Separate severity step after symptom selection (adds a form step, slows flow)

## Decision 4: Doctor-contact nudge destination

**Decision**: The nudge links to the existing concerns/messaging flow (`/patient/concerns`). The ConcernScreen already allows free-text messages to the doctor.

**Rationale**: No new communication channel needed. The concerns flow is the established patient→doctor communication path in the app. The nudge pre-fills or suggests mentioning the severe symptom.

**Alternatives considered**:
- Direct phone call link (too aggressive for a nudge)
- New "urgent message" flow (over-engineered for prototype scope)
- Just informational with no action (misses the opportunity to guide the patient)

## Decision 5: Doctor-side symptom visibility

**Decision**: Add a symptoms column to the existing log entries grid in the PatientProfile Overzicht tab. Show symptom chips with severity badges inline per entry row.

**Rationale**: The PatientProfile component already renders log entries (weight, hunger) in a list/grid. Adding symptoms there is the minimal change that satisfies FR-011. No new tab or screen needed.

**Alternatives considered**:
- Separate "Klachten" tab on PatientProfile (too much for a list of chips)
- Symptom trend chart (valuable but separate feature, beyond scope)
- Symptom filter on existing chart (complex, better as future work)
