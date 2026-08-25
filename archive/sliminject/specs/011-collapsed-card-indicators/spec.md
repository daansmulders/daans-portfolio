# Specification: Collapsed Entry Card Indicators

**Status**: Draft
**Date**: 2026-03-18
**Author**: Product Owner + Designer

## Problem Statement

The expandable log entry cards (feature 010) show only date, weight, and a chevron in their collapsed state. Patients must tap to expand each card to see whether they logged hunger scores, food noise, or symptoms that day. For a quick daily review or pattern spotting, this creates unnecessary friction — the collapsed row gives no signal about what was logged beyond weight.

Adding subtle visual indicators to the collapsed row would let patients scan their recent entries and immediately see which days had side effects or notable scores, without expanding every card.

## User Stories

### US-1: Patient spots side-effect days at a glance (P1)

**As a** patient reviewing my recent entries
**I want to** see a visual signal on each collapsed card when symptoms were logged that day
**So that** I can quickly identify which days had side effects without expanding every card

**Acceptance criteria**:
- A compact side-effect indicator (e.g., a small dot or icon) appears on collapsed cards that have one or more symptoms logged
- The indicator distinguishes between mild symptoms (all severity ≤ 3) and severe symptoms (any severity ≥ 4) through colour or styling
- No indicator is shown when no symptoms were logged
- The indicator does not make the collapsed row feel cluttered or take significant horizontal space

### US-2: Patient sees a quick score summary on collapsed cards (P2)

**As a** patient scanning my log history
**I want to** see a compact summary of my hunger and food noise scores on each collapsed card
**So that** I can spot trends without expanding cards one by one

**Acceptance criteria**:
- When hunger score and/or food noise score are present, a compact score indicator appears on the collapsed row
- The indicator uses a minimal format (e.g., small numbered dots, a tiny bar, or abbreviated text like "H3 V2")
- The indicator fits alongside date, weight, side-effect dot, and chevron without horizontal overflow on mobile
- Entries with no scores show no score indicator

## User Scenarios & Testing

### Scenario 1: Entry with symptoms and scores

**Given** a patient has logged hunger 4/5, food noise 2/5, and one symptom (Misselijkheid, severity 2)
**When** the card is collapsed
**Then** the collapsed row shows date, weight, a mild side-effect indicator, a compact score summary, and the chevron

### Scenario 2: Entry with severe symptom

**Given** a patient has logged one symptom (Vermoeidheid, severity 5)
**When** the card is collapsed
**Then** the side-effect indicator uses the severe styling (e.g., amber colour) instead of the mild styling

### Scenario 3: Entry with no symptoms and no food noise

**Given** a patient has logged only weight and hunger 3/5
**When** the card is collapsed
**Then** no side-effect indicator is shown; only a compact hunger score indicator appears

### Scenario 4: Entry with no optional data at all

**Given** a patient has logged only hunger 3/5 (no weight, no symptoms, no food noise, no notes)
**When** the card is collapsed
**Then** the collapsed row shows date, compact hunger score, and chevron — no side-effect indicator, no weight

### Scenario 5: Doctor view

**Given** a doctor views a patient's log history in the Overzicht tab
**When** entries are collapsed
**Then** the same indicators appear as on the patient dashboard

## Functional Requirements

### Side-Effect Indicator

- **FR-001**: A compact visual indicator is shown on the collapsed row when the entry has one or more symptoms
- **FR-002**: The indicator uses two visual states:
  - **Mild**: All symptom severities are ≤ 3 (or legacy entries with severity 0) — shown in a neutral/brand colour
  - **Severe**: At least one symptom has severity ≥ 4 — shown in an amber/warning colour
- **FR-003**: The indicator is a small coloured dot (6–8px circle) that occupies minimal horizontal space. Brand colour for mild, amber for severe
- **FR-004**: When no symptoms are logged, no indicator is rendered

### Score Summary

- **FR-005**: A compact score summary is shown on the collapsed row when hunger score and/or food noise score are present
- **FR-006**: The format is abbreviated and compact — e.g., two small labelled numbers, a pair of dots, or a mini badge row — and must not exceed ~60px total width
- **FR-007**: When neither hunger nor food noise score is present, no score summary is rendered

### Layout

- **FR-008**: All indicators fit on a single row alongside date, weight, and chevron without wrapping or horizontal overflow on mobile (≤ 700px)
- **FR-009**: The visual hierarchy remains: date (left) → indicators (middle or right) → weight + chevron (right). Indicators should not compete with date or weight for attention
- **FR-010**: Indicators use existing design tokens — no new colours or typography

### Consistency

- **FR-011**: The same collapsed indicators appear on both patient dashboard and doctor patient profile views

## Scope

### In Scope

- Adding side-effect indicator to collapsed entry card row
- Adding compact score summary to collapsed entry card row
- Both patient dashboard and doctor Overzicht tab

### Out of Scope

- Changing the expanded card content (already complete from feature 010)
- Adding new data fields or modifying data storage
- Trend indicators across multiple entries (e.g., "hunger trending down")
- Tooltip or popover on indicator hover/tap

## Dependencies

- Feature 010 (log entry card redesign): The `LogEntryCard` component with expandable accordion is the target for this change

## Assumptions

- The `LogEntryCard` component already receives a full `ProgressEntry` with symptoms, hunger_score, and food_noise_score — no new data fetching needed
- The indicator design will be iterated based on how it looks with real data — the spec defines constraints, not pixel-exact designs

## Clarifications

### Session 2026-03-18

- Q: Side-effect indicator format — dot, pill, or icon? → A: Small coloured dot (6–8px circle). Brand colour for mild, amber for severe.

## Success Criteria

- **SC-001**: A patient can identify which of their 3 recent entries had side effects within 2 seconds of viewing the dashboard, without expanding any cards
- **SC-002**: The collapsed row remains a single line on mobile (no wrapping) with all indicators present
- **SC-003**: Severe symptoms (≥ 4) are visually distinguishable from mild symptoms on the collapsed indicator
- **SC-004**: No regression — expanding a card still reveals full details as before
