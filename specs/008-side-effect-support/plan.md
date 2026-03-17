# Implementation Plan: Side Effect Support

**Branch**: `008-side-effect-support` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-side-effect-support/spec.md`

## Summary

Two complementary side-effect support features: (1) reactive tips shown in the log confirmation screen after submitting symptoms — per-symptom guidance with once-per-week throttle and priority ordering; (2) proactive tips on the injection-day card for first-ever injection and dose-increase injection days. No schema changes — tips are static content, frequency tracking via localStorage.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: React 19, React Router 7, Tailwind CSS 4, Sonner
**Storage**: No server storage needed; localStorage for tip frequency tracking
**Testing**: Manual testing via seed data
**Target Platform**: Mobile-first web app (patient)
**Project Type**: Web application (single SPA)
**Performance Goals**: Tips render instantly — no network requests, pure client-side logic
**Constraints**: No schema changes; tip content is static; reuse existing `useDoseChanges` for proactive tip logic
**Scale/Scope**: 6 mapped symptoms, 1 proactive tip variant for first injection, 1 for dose increase

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | N/A | Applies to Jekyll site |
| II. Content-Driven Architecture | N/A | Applies to Jekyll site |
| III. Design Integrity | PASS | Tips use existing `.card`, `.alert-brand` patterns; warm editorial tone |
| IV. No Regression on v1 | N/A | Changes inside `prototypes/sliminject/` |
| V. Performance by Default | PASS | No new assets; tips are inline static text |
| VI. Tools are Sandboxed | PASS | All changes inside `prototypes/sliminject/` |
| VII. Security First | PASS | No sensitive data; localStorage stores only symptom names + timestamps |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/008-side-effect-support/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── SideEffectSupport.md
└── tasks.md
```

### Source Code

```text
prototypes/sliminject/src/
├── features/
│   ├── patient/
│   │   ├── dashboard/
│   │   │   └── LogEntryForm.tsx          # MODIFIED — show tip card in confirmation, disable auto-nav when tip shown
│   │   ├── adherence/
│   │   │   └── InjectionDayCard.tsx       # MODIFIED — add proactive tip for first injection + dose increase
│   │   └── symptoms/
│   │       ├── symptomTips.ts             # NEW — tip content map, priority ordering, tip selection logic
│   │       └── useSymptomTipThrottle.ts   # NEW — localStorage-based once-per-week throttle
├── i18n/
│   └── nl.ts                              # MODIFIED — new i18n keys for tips + 2 new symptom names
└── (no new directories beyond symptoms/)
```

**Structure Decision**: Tip content and throttle logic go in a new `symptoms/` feature directory. The tip map is a pure data file; the throttle hook manages localStorage. Both `LogEntryForm` and `InjectionDayCard` consume these independently.
