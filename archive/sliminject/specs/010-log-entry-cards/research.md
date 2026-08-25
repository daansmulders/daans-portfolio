# Research: Log Entry Card Redesign

**Feature**: 010-log-entry-cards
**Date**: 2026-03-18

## Decision 1: Component architecture

**Decision**: Create a single shared `LogEntryCard` component used by both patient dashboard and doctor patient view, with a `variant` prop to switch between expandable and full-detail layouts.

**Rationale**: Both views render the same data shape (`ProgressEntry`) and have identical display requirements. A shared component avoids duplication and ensures visual consistency. The `variant` prop keeps the two layouts in one file since they share most rendering logic (symptom chips, score badges, note truncation).

**Alternatives considered**:
- Separate components per variant (unnecessary code duplication for two layouts of the same data)
- Separate components per view — patient vs doctor (same data shape, same display rules)

## Decision 2: Variant toggle mechanism

**Decision**: Use a URL search parameter (`?card=a` or `?card=b`) to toggle between variants. Default to Variant B (full detail).

**Rationale**: A URL parameter is the simplest developer-only toggle — no UI, no state management, no localStorage. It can be shared as a link for review. Defaulting to B (full detail) means the most informative variant is what users see by default, while A (expandable) can be evaluated by appending `?card=a`.

**Alternatives considered**:
- localStorage flag (persists across sessions, harder to share for review)
- Environment variable (requires rebuild to switch)
- Feature flag service (overkill for a design evaluation toggle)

## Decision 3: Accordion state management

**Decision**: Manage `expandedId` state in the parent component (PatientDashboard / PatientProfile) and pass it down. Only relevant when variant is `'expandable'`.

**Rationale**: Accordion behavior (only one card open at a time) requires the parent to know which card is expanded. Lifting state to the parent is the standard React pattern for this. The `LogEntryCard` component receives `isExpanded` and `onToggle` props.

**Alternatives considered**:
- Internal state per card (can't enforce accordion — multiple would open)
- Context provider (overkill for 3–5 cards)

## Decision 4: Default variant choice

**Decision**: Default to Variant B (full detail inline) when no URL parameter is present.

**Rationale**: Variant B shows more information by default, which better serves both user stories (patients reviewing logs, doctors scanning history). If Variant A proves superior during evaluation, the default can be changed with a one-line edit.
