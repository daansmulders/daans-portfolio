# Research: Side Effect Support

## Decision 1: Tip content storage — static map vs. database

**Decision**: Store tip content as a static TypeScript map in `symptomTips.ts`, not in a database table.

**Rationale**: There are only 6 symptom-tip pairs. The content changes rarely (editorial updates, not user-driven). A static map means zero network requests, instant rendering, and works offline. The tip content is part of the application, not user data.

**Alternatives considered**:
- **Supabase table**: Would allow doctor-customisable tips, but adds unnecessary complexity for a prototype with fixed content. Rejected.
- **i18n keys only**: Would spread the tip logic across nl.ts and the component. Keeping the full map (symptom → tip text + priority) in one file is cleaner for editorial review.

## Decision 2: Tip frequency throttle — localStorage with timestamps

**Decision**: Store `sliminject_tip_last_{symptomKey}` in localStorage with a UTC timestamp. Before showing a tip, check if `Date.now() - stored > 7 * 86400 * 1000`.

**Rationale**: Simple, matches existing localStorage patterns in the codebase (reminder preferences, dose announcement dismissals). Survives page refresh and re-login. Acceptable for prototype scope.

**Alternatives considered**:
- **Supabase table**: Robust but requires schema change. Rejected for this scope.
- **React state only**: Lost on refresh. Rejected.
- **Session storage**: Lost on new session. Would allow the same tip to fire every day if the patient opens a new tab. Rejected.

## Decision 3: First-injection detection — separate from `isNewDose`

**Decision**: Add an `isFirstInjection` boolean to `useDoseChanges` return value. True when no adherence records exist at all for the patient (not just for the current dose level).

**Rationale**: The existing `isNewDose` only fires for dose *increases* (compares current dose to previous). The very first injection has no previous dose to compare against, so `isNewDose` is false. A separate check on `adherenceRecords.length === 0` cleanly captures "never injected before."

**Alternatives considered**:
- **Check in InjectionDayCard component directly**: Would couple detection logic to the UI component. Better to keep it in the hook alongside `isNewDose`.
- **Modify `isNewDose` to include first dose**: Would change the semantics of an existing flag used by Feature 007. Rejected to avoid side effects.

## Decision 4: Proactive tip coexistence with "Nieuwe dosis" marker

**Decision**: The proactive side effect tip renders as a separate block below the existing "Nieuwe dosis" marker (from Feature 007). They are visually distinct: the dose marker uses `.alert-amber` (dose context), while the proactive tip uses a softer `.card` style with brand-green accent (supportive guidance).

**Rationale**: On a dose-increase injection day, the patient sees both "Nieuwe dosis: 0.5 mg" (what changed) and "Bijwerkingen kunnen tijdelijk terugkomen — eet licht" (what to do about it). These are separate pieces of information that serve different purposes.

**Alternatives considered**:
- **Merge into one block**: Would conflate dose information with side-effect guidance. Rejected — better to keep them modular.
- **Show only the proactive tip, hide the dose marker**: Would lose the dose context. Rejected.

## Decision 5: Auto-navigate behaviour when tip is shown

**Decision**: When a reactive tip is shown in the log confirmation screen, disable the `setTimeout(() => navigate(...), 1200)` auto-redirect. Instead, show a "Terug naar dashboard" button. The patient controls when to leave.

**Rationale**: Tips contain actionable advice (e.g., "eat small dry meals, ginger can help"). A 1.2-second timer is far too short to read and process this. Even 4 seconds feels rushed. Letting the patient dismiss manually respects their reading pace and makes the tip feel like support rather than a flash notification.

**Alternatives considered**:
- **Extend timer to 4–6 seconds**: Still arbitrary. Some patients read faster, some slower. Rejected.
- **Keep timer but add "tap to keep"**: More complex interaction. Rejected in favour of simply removing the timer.
