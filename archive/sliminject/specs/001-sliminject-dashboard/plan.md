# Implementation Plan: Sliminject Dashboard

**Branch**: `001-sliminject-dashboard` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sliminject-dashboard/spec.md`

## Summary

A mobile-first web app for GLP-1 medication patients and their doctors, built as a sandboxed prototype under `prototypes/sliminject/`. Patients log progress, receive contextually triggered educational content, view their dosage schedule, and flag concerns. Doctors manage patient schedules, write advice, respond to concerns, and schedule appointments. Built with React + Vite + TypeScript on a Supabase backend (PostgreSQL + Row Level Security), with Dexie.js for offline logging and Radix UI + Tailwind CSS for accessible interfaces. Dutch-only.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 20+
**Primary Dependencies**: React 18, Vite 5, Tailwind CSS 3, Radix UI, Dexie.js, Supabase JS client
**Storage**: Supabase (PostgreSQL with Row Level Security) + IndexedDB (Dexie.js, offline queue)
**Testing**: Vitest + React Testing Library
**Target Platform**: Mobile-first web (modern browsers); desktop supported for doctor view
**Project Type**: Web application (React SPA)
**Performance Goals**: Patient entry logging completes in under 60 seconds (SC-001); content surfaced within 1 interaction from home
**Constraints**: WCAG 2.1 AA; offline progress logging; Dutch only; no real patient data (demo/fictional); sandboxed from main Jekyll site
**Scale/Scope**: Prototype — demo scale, no production load requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ Pass | Tool is sandboxed; main Jekyll site is untouched |
| II. Content-Driven Architecture | ✅ Pass | Not applicable to this tool |
| III. Design Integrity | ✅ Pass | WCAG AA required; mobile-first; dark/light not specified — defer to prototype defaults |
| IV. No Regression on v1 | ✅ Pass | Tool lives entirely under `prototypes/sliminject/` |
| V. Performance by Default | ✅ Pass | React SPA + Vite; no unnecessary third-party scripts |
| VI. Tools are Sandboxed | ✅ Pass | `prototypes/sliminject/` is fully self-contained with its own package.json |
| VII. Security First for Personal Data | ✅ Pass | Supabase RLS enforces data isolation at DB level; auth required for all routes; no health data in URLs |

No violations. No complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/001-sliminject-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── database.md      # Supabase schema + RLS policies
│   └── ui-contracts.md  # Screen-level UI contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
prototypes/sliminject/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── index.html
├── supabase/
│   └── migrations/         # Database schema + RLS policies
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── i18n/
│   │   └── nl.ts           # All Dutch UI strings
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   └── db.ts           # Dexie (offline IndexedDB) setup
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── ProtectedRoute.tsx
│   ├── features/
│   │   ├── patient/
│   │   │   ├── dashboard/   # Progress chart, entry logging
│   │   │   ├── concerns/    # Concern submission + responses
│   │   │   ├── medication/  # Dosage schedule view
│   │   │   └── content/     # Triggered educational content
│   │   └── doctor/
│   │       ├── overview/    # Patient list with status
│   │       ├── patient/     # Individual patient profile
│   │       ├── schedule/    # Dosage schedule editor
│   │       └── appointments/
│   ├── components/          # Shared accessible UI components
│   └── hooks/               # Shared hooks (useOfflineSync, useAuth, etc.)
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Single web application (React SPA). Patient and doctor views are separated by role-based routing within the same app. No monorepo required for prototype scale.

## Implementation Phases

### Phase 1: Foundation (MVP — P1 stories)

Deliverables: Auth, role-based routing, patient progress logging with offline support, doctor patient overview.

1. Project scaffold — Vite + React + TypeScript + Tailwind + Radix UI
2. Supabase project setup — auth, schema migrations, RLS policies for Patient + Doctor roles
3. Auth flow — login/logout, session expiry, protected routes
4. Patient dashboard — progress entry form (offline-capable via Dexie), progress chart
5. Doctor overview — patient list with last activity, open concern badges

### Phase 2: Safety & Communication (P2 stories)

Deliverables: Concern signalling, doctor responses, dosage schedule personalisation, advice notes.

1. Concern submission (patient) + concern inbox with response (doctor)
2. Dosage schedule editor (doctor) + medication timeline view (patient)
3. Doctor advice notes — create/edit (doctor), display (patient)

### Phase 3: Enrichment (P3 stories)

Deliverables: Triggered educational content, appointment scheduling.

1. Progress event evaluation engine + content trigger table
2. Educational content display — articles + videos surfaced at the right moment
3. Appointment scheduling (doctor) + reminders (patient)

## Complexity Tracking

No constitution violations. Not applicable.
