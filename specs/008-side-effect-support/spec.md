# Feature Specification: Side Effect Support

**Feature Branch**: `008-side-effect-support`
**Created**: 2026-03-17
**Status**: Draft
**Input**: Backlog items 2 (Side effect management tips) and 14 (Proactive side effect guidance on injection day), shipped together as complementary proactive + reactive side effect support.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Reactive side effect tips after logging (Priority: P1)

As a patient who just logged one or more side effects, I want to see a brief practical tip right away, so that I know what I can do now — not just when I get around to reading an article.

**Why this priority**: This is the most frequently triggered touchpoint. Every time a patient logs a symptom they get immediate, actionable guidance. Nausea is the #1 dropout reason (~50% of discontinuations cite side effects), so bridging the gap between "I feel bad" and "here's what to do" has the highest impact on retention.

**Independent Test**: Log in as any patient. Navigate to the daily log form, select "Misselijkheid" as a symptom, submit the log. A tip card should appear alongside the success confirmation with nausea-specific guidance. Submit another log with "Vermoeidheid" — a different tip appears. Submit another log with "Misselijkheid" within the same week — no tip appears (once per week per symptom). Log two symptoms at once (nausea + fatigue) — only the nausea tip shows (highest priority).

**Acceptance Scenarios**:

1. **Given** a patient submits a log with "Misselijkheid" selected and no nausea tip has been shown this week, **When** the log confirmation screen appears, **Then** a tip card is shown: "Eet kleine, droge maaltijden. Gember kan helpen. Vermijd vette of sterk geurende gerechten."
2. **Given** a patient submits a log with "Misselijkheid" and a nausea tip was already shown within the past 7 days, **When** the confirmation screen appears, **Then** no nausea tip is shown.
3. **Given** a patient submits a log with both "Misselijkheid" and "Vermoeidheid", **When** the confirmation screen appears, **Then** only the nausea tip is shown (nausea takes priority).
4. **Given** a patient submits a log with "Diarree" only, **When** the confirmation screen appears, **Then** the diarrhea-specific tip is shown.
5. **Given** a patient submits a log with no symptoms selected, **When** the confirmation screen appears, **Then** no tip card is shown.
6. **Given** a patient logs a symptom for the first time ever, **When** the confirmation screen appears, **Then** both the tip card and the existing educational article trigger fire — neither replaces the other.

---

### User Story 2 — Proactive side effect guidance on injection day (Priority: P2)

As a patient injecting for the first time or at a new dose, I want to see a brief heads-up about possible side effects before they happen, so that I feel prepared rather than alarmed when symptoms arrive.

**Why this priority**: This complements US1 by shifting the moment of support from "after you feel bad" to "before anything happens." Research shows anticipatory guidance reduces anxiety and improves early retention (Journey Map Phase 2 gap). However, it only fires on specific injection days (first + dose increases), making it less frequently seen than US1.

**Independent Test**: Set up a patient whose injection day is today and who has never injected before (first dose). Open the dashboard — the injection-day card should include a brief anticipatory tip about nausea. Set up a patient on their 3rd injection at the same dose — no proactive tip should appear.

**Acceptance Scenarios**:

1. **Given** a patient on their very first injection day (first dose ever, no prior adherence records), **When** the injection-day card renders in the confirm step, **Then** a brief anticipatory side effect tip appears inside the card: "Dit is je eerste injectie. Misselijkheid is normaal de eerste dagen — eet licht en drink voldoende water."
2. **Given** a patient on injection day at a new (increased) dose and this is their first or second injection at this dose, **When** the injection-day card renders, **Then** a brief tip appears: "Nieuwe dosis — bijwerkingen zoals misselijkheid kunnen tijdelijk terugkomen. Dit is normaal en trekt meestal bij."
3. **Given** a patient on their 3rd+ injection at the same dose, **When** the injection-day card renders, **Then** no proactive tip appears.
4. **Given** a patient on a regular injection day (not first dose, not a dose increase), **When** the injection-day card renders, **Then** no proactive tip appears.
5. **Given** a patient skips or adjusts their injection (selects "Nee, overgeslagen" or "Andere dosis"), **When** the skip/adjust flow completes, **Then** no proactive tip is shown — tips only appear in the confirm step.

---

### Edge Cases

- What happens when a patient logs a symptom that has no mapped tip? — No tip is shown. Only the 6 mapped symptoms have tips.
- What happens when the patient wants to dismiss the tip? — When a tip is shown, auto-navigation is disabled. The patient taps "Terug naar dashboard" when ready. This ensures tips are never cut short.
- What happens when the patient is offline and submits a log with symptoms? — Tips are shown client-side based on the symptom selection, regardless of online status. The tip does not depend on server response.
- What happens when severity is not tracked (current prototype has symptoms as checkboxes without severity)? — The severity-based "contact your doctor" nudge is deferred to a future iteration when severity tracking is added to the log form. For now, tips are shown for any logged symptom regardless of severity.

## Requirements *(mandatory)*

### Functional Requirements

**Reactive tips (post-log):**

- **FR-001**: After submitting a log with one or more symptoms, a tip card MUST appear in the log confirmation screen alongside the existing success message
- **FR-002**: Tips MUST be mapped per symptom with the following content:
  - Misselijkheid: "Eet kleine, droge maaltijden. Gember kan helpen. Vermijd vette of sterk geurende gerechten."
  - Diarree: "Drink veel water. Beperk tijdelijk zuivel en vezelrijke voeding."
  - Constipatie: "Verhoog je vezelinname geleidelijk en drink meer water."
  - Vermoeidheid: "Zorg voor voldoende eiwitten. Lichte beweging kan helpen."
  - Haaruitval: "Tijdelijk en normaal bij gewichtsverlies. Voldoende eiwitten en zink kunnen helpen."
  - Injectieplaatsreactie: "Wissel bij elke injectie van plek."
- **FR-003**: When multiple symptoms are logged, the tip with the highest priority MUST be shown. Priority order: Misselijkheid > Vermoeidheid > Diarree > Constipatie > Haaruitval > Injectieplaatsreactie
- **FR-004**: The same tip MUST NOT be shown for the same symptom more than once within a 7-day window
- **FR-005**: Tip frequency tracking MUST persist across sessions (not lost on page refresh)
- **FR-006**: When a tip is shown, auto-navigation after log submission MUST be disabled entirely. Instead, the patient dismisses the confirmation screen manually via a "Terug naar dashboard" button. This ensures tips are never cut short by a timer.
- **FR-007**: The tip card MUST be visually distinct from the success message — warm, supportive tone, not a warning
- **FR-008**: The existing educational article trigger (first-time symptom) MUST continue to fire independently — tips do not replace articles

**Proactive guidance (injection-day):**

- **FR-009**: On the patient's very first injection day (no prior adherence records exist), the injection-day card MUST include a brief anticipatory tip about common first-week side effects
- **FR-010**: On injection day at a new dose level (first or second injection at that dose, same criteria as the existing "Nieuwe dosis" marker from Feature 007), the injection-day card MUST include a brief anticipatory tip about side effects returning temporarily
- **FR-011**: Proactive tips MUST only appear in the confirm step of the injection-day card — not during the log step or done step
- **FR-012**: On regular injection days (3rd+ injection at the same dose, not first dose), no proactive tip MUST appear
- **FR-013**: The proactive tip and the existing "Nieuwe dosis" marker (Feature 007) MUST coexist without visual conflict — they are separate pieces of information (dose context vs. side effect guidance)

### Key Entities

- **Symptom tip**: A static mapping from symptom name to tip text and priority rank. Not stored in a database — defined as application content.
- **Tip frequency record**: A client-side record tracking when each symptom tip was last shown to the patient, keyed by symptom name with a timestamp. Used to enforce the once-per-week-per-symptom rule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every log submission that includes a mapped symptom results in a visible tip within 1 second — zero symptom logs go without guidance (subject to the once-per-week rule)
- **SC-002**: Patients see proactive guidance on their first injection and each dose-increase injection — zero "first at new dose" events go without anticipatory support
- **SC-003**: No tip is shown more than once per symptom per 7-day window — patients are supported without being nagged
- **SC-004**: When a tip is shown, the patient controls when to leave — auto-navigation is disabled and a manual "back to dashboard" action is provided
- **SC-005**: Existing educational article triggers continue to fire unchanged — the tip system adds to, not replaces, the current symptom support

## Assumptions

- The current log form uses symptom checkboxes without severity ratings. The severity 4–5 "contact your doctor" nudge described in the original backlog is deferred until severity tracking is added. This spec covers tips triggered by symptom presence, not severity.
- Symptom names in the log form match the Dutch names used in the tip mapping (Misselijkheid, Diarree, Constipatie, Vermoeidheid, Haaruitval, Injectieplaatsreactie). If the log form uses different symptom names, the mapping must be adjusted during implementation.
- Tip frequency tracking uses client-side persistence (localStorage). Production would move to server-side, but this is acceptable for a prototype.
- The proactive injection-day tip reuses the `isNewDose` logic from Feature 007 (`useDoseChanges` hook). For the very first injection (no prior adherence records), a separate check is needed since `isNewDose` only fires for dose *increases*, not the initial dose.
- The editorial tone of the tips is warm and practical — like advice from a friend who has been through it, not a clinical leaflet. The exact wording may be refined after user testing.
