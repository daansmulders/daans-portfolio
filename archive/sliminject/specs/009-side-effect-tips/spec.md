# Feature Specification: Side Effect Management Tips

**Feature Branch**: `009-side-effect-tips`
**Created**: 2026-03-17
**Status**: Draft
**Input**: Inline tips shown immediately after logging symptoms. Brief, per-symptom guidance. Max once per week per symptom. Severity 4–5 triggers a nudge to contact the doctor. Editorial design and tone are critical — multiple layout variants should be explored.

**Context**: A basic tip system already exists (single-line tips for 6 of 9 symptoms, 7-day throttle per symptom, shown post-log). This feature upgrades it with symptom severity, richer tip content, a doctor-contact nudge for severe symptoms, and editorial design refinement.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Severity-aware symptom logging (Priority: P1)

A patient logs their daily progress. When selecting symptoms, they can now indicate how severe each symptom is on a 1–5 scale (1 = mild, 5 = very severe). This replaces the current binary toggle. Tapping a chip activates it at severity 1 by default — the patient can optionally adjust severity but doesn't have to. The interaction should feel lightweight — adding severity should not slow down the logging flow or feel clinical.

**Why this priority**: Severity data is the foundation for everything else in this feature. Without it, tip relevance and doctor-nudge thresholds cannot work.

**Independent Test**: Log an entry with two symptoms at different severities. Verify the severity values are stored and visible in log history.

**Acceptance Scenarios**:

1. **Given** a patient is on the log form, **When** they tap a symptom chip, **Then** the chip activates and a severity selector appears for that symptom (defaulting to severity 1).
2. **Given** a symptom chip is active with severity selector visible, **When** the patient adjusts severity to 3, **Then** the selected severity is stored with the log entry.
3. **Given** a patient has selected symptoms with severities, **When** they submit the log, **Then** each symptom is saved with its individual severity score.
4. **Given** a patient is reviewing past log entries, **When** they view an entry with symptoms, **Then** severity levels are visible alongside symptom names.

---

### User Story 2 — Contextual tip after logging (Priority: P1)

After submitting a log with symptoms, the patient sees a brief, actionable tip related to their most relevant symptom. The tip is editorially crafted — warm in tone, specific to the symptom, and avoids medical jargon. Tips are throttled to once per 7 days per symptom to prevent fatigue.

**Why this priority**: This is the core value of the feature — turning symptom data into immediately useful guidance. The existing basic tip system proves the concept; this story enriches the content and presentation.

**Independent Test**: Log nausea, see the nausea tip. Log nausea again the next day — no tip appears. Wait 7 days, log nausea — tip appears again.

**Acceptance Scenarios**:

1. **Given** a patient submits a log with nausea (any severity), **When** no nausea tip was shown in the past 7 days, **Then** a contextual tip card appears with nausea-specific guidance.
2. **Given** a patient submits a log with nausea and fatigue, **When** nausea was tipped 3 days ago but fatigue was not, **Then** the fatigue tip is shown (highest-priority untipped symptom).
3. **Given** a patient submits a log with headache, **When** headache was tipped 2 days ago, **Then** no tip card appears; the patient is navigated to the dashboard as usual.
4. **Given** a patient sees a tip card, **When** they read and dismiss it, **Then** they return to the dashboard.

---

### User Story 3 — Doctor-contact nudge for severe symptoms (Priority: P2)

When a patient logs a symptom at severity 4 or 5, the post-log screen shows a doctor-contact nudge instead of the regular tip. The nudge replaces the tip — showing both would create clutter and dilute the important message. The nudge should feel caring, not alarming.

**Why this priority**: High-severity symptoms may require medical attention. The app should guide the patient toward their care team without causing panic. This builds on the severity system (P1) and the tip flow (P1).

**Independent Test**: Log nausea at severity 5. Verify the doctor-contact nudge appears alongside or instead of the regular tip.

**Acceptance Scenarios**:

1. **Given** a patient submits a log with nausea at severity 4, **When** the post-log screen appears, **Then** a doctor-contact nudge is shown: warm in tone, suggests reaching out to their doctor, includes a way to navigate to the messaging/contact flow.
2. **Given** a patient submits a log with nausea at severity 2, **When** the post-log screen appears, **Then** no doctor-contact nudge is shown; a regular tip may appear per throttle rules.
3. **Given** a patient submits a log with two symptoms — one at severity 5 and one at severity 2, **When** the post-log screen appears, **Then** the doctor-contact nudge is triggered by the severity-5 symptom.
4. **Given** the doctor-contact nudge is shown, **When** the patient dismisses it without acting, **Then** they return to the dashboard normally — no further pressure.

---

### User Story 4 — Tip content for all symptoms (Priority: P2)

Every trackable symptom has a crafted tip. Currently 3 of 9 symptoms (maagklachten, hoofdpijn, droge mond, duizeligheid) lack tips. All tips should follow the same editorial voice: brief (1–2 sentences), actionable, warm.

**Why this priority**: Incomplete coverage undermines trust. A patient logging headache and seeing no guidance while nausea always gets tips feels inconsistent.

**Independent Test**: Log each of the 9 symptoms individually. Verify each one produces a tip (respecting the 7-day throttle).

**Acceptance Scenarios**:

1. **Given** a patient logs any of the 9 trackable symptoms, **When** no tip was shown for that symptom in the past 7 days, **Then** a tip card appears with guidance specific to that symptom.

---

### User Story 5 — Editorial tip card design (Priority: P3)

The tip card presentation is refined for editorial quality. The current implementation is a simple bordered card with text. This story explores richer layouts: consider illustration/icon per symptom category, typography hierarchy, and visual warmth. The goal is that tips feel like caring advice from a knowledgeable friend, not a clinical warning.

**Why this priority**: Design quality drives trust and engagement. A well-designed tip is more likely to be read and followed. However, the feature works without this — it's a polish layer.

**Independent Test**: Visual review of tip cards across all symptom types. Verify consistent layout, readable typography, and warm visual tone.

**Acceptance Scenarios**:

1. **Given** a tip card is displayed, **Then** it includes: a symptom-specific heading, the tip body text, and a visual element (icon or illustration) that reinforces the symptom category.
2. **Given** a doctor-contact nudge is displayed, **Then** it is visually distinct from regular tips — more prominent but not alarming.

---

### Edge Cases

- **Multiple severe symptoms in one log**: If a patient logs 3 symptoms all at severity 5, show one doctor-contact nudge (not three). The nudge references the most clinically relevant symptom (by priority order).
- **Severity without tip**: If a patient logs a symptom at severity 3 but the tip was shown 2 days ago, show nothing — severity alone does not override the 7-day throttle for tips (but severity 4–5 always triggers the doctor nudge regardless of tip throttle).
- **All tips recently shown**: If every logged symptom was tipped within 7 days, no tip card appears. The patient sees the standard success state and navigates to the dashboard.
- **Offline logging**: Tips and doctor-nudges work identically offline — tip throttle uses local storage, not server state.
- **First-time logger**: A patient's very first log with symptoms should always show a tip (no prior throttle history).
- **Historical entries without severity**: Log entries created before this feature have symptoms stored without severity scores. These display the symptom name only (no severity badge or number) — visually distinct from new entries. No data backfill is performed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each symptom selection MUST include a severity score from 1 (mild) to 5 (very severe).
- **FR-002**: Severity scores MUST be stored per symptom per log entry (not a single score for all symptoms).
- **FR-003**: After submitting a log with symptoms, the system MUST check for an eligible tip using priority order: highest clinical priority symptom that hasn't been tipped in 7 days.
- **FR-004**: Tips MUST be available for all 9 trackable symptoms (misselijkheid, maagklachten, vermoeidheid, hoofdpijn, droge mond, duizeligheid, constipatie, haaruitval, injectieplaatsreactie), with 2–3 tip variants per symptom that rotate on repeat views.
- **FR-005**: Tip throttle MUST be per-symptom, per-patient, with a 7-day cooldown period.
- **FR-006**: When any logged symptom has severity 4 or 5, the post-log screen MUST include a doctor-contact nudge.
- **FR-007**: The doctor-contact nudge MUST appear regardless of tip throttle state — it is independent of the tip system.
- **FR-008**: The doctor-contact nudge MUST NOT appear for symptoms at severity 1–3.
- **FR-009**: Tip cards MUST be dismissible — the patient controls when to return to the dashboard.
- **FR-010**: The existing educational article system MUST remain unchanged — tips complement articles, they don't replace them.
- **FR-011**: Severity data MUST be visible to the doctor in the patient's log history view.

### Key Entities

- **Symptom Log**: A symptom name paired with a severity score (1–5), associated with a progress entry. Replaces the current string-only symptom array. Historical entries without severity remain valid — severity is optional at the data level for backward compatibility.
- **Symptom Tip**: Editorial content (heading + body) mapped to a specific symptom. Each symptom has 2–3 tips that rotate on repeat views. Includes a clinical priority ranking that determines display order when multiple symptoms are logged.
- **Tip Throttle Record**: Tracks when each symptom's tip was last shown to a specific patient, and which tip variant was displayed (to enable rotation). Local-only storage. 7-day expiry.

## Assumptions

- The severity scale (1–5) matches the existing hunger and food-noise scales, which patients are already familiar with.
- "Contact your doctor" nudge links to the existing messaging or contact flow — no new communication channel is needed.
- Tip content will be written in Dutch, consistent with the rest of the app.
- The 7-day throttle period is fixed and not configurable by the patient or doctor.
- Doctor-contact nudge has no throttle — it appears every time severity 4–5 is logged, because medical urgency shouldn't be rate-limited.

## Clarifications

### Session 2026-03-17

- Q: When severity is 4–5, does the doctor-contact nudge appear alongside the regular tip or replace it? → A: Nudge replaces the tip — only the doctor-contact nudge is shown for severity 4–5.
- Q: When a patient taps a symptom chip, should severity default to 1 or require explicit selection? → A: Default to 1 (mild) — tap activates chip, severity adjustable but not required.
- Q: Should each symptom have one fixed tip or multiple rotating tips? → A: 2–3 tips per symptom, rotating on repeat views to keep guidance fresh over a 16-week titration.
- Q: How should historical log entries (pre-feature, no severity data) display? → A: Show symptom name only, no severity indicator — visually distinct from scored entries, no backfill.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every symptom log entry includes a severity score — no symptom is saved without one.
- **SC-002**: All 9 symptoms produce a relevant tip when logged (and not throttled).
- **SC-003**: 100% of severity 4–5 logs trigger the doctor-contact nudge.
- **SC-004**: Tips never appear more than once per 7 days per symptom per patient.
- **SC-005**: The logging flow (form open to submission) takes no more than 30 seconds longer than the current flow, despite the added severity step.
- **SC-006**: Tip cards are rated as "warm and helpful" (not "clinical" or "alarming") in design review.
