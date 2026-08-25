# Quickstart: Sliminject UX Improvements

**Branch**: `002-sliminject-ux-improvements`

## Prerequisites

- Node 20+
- Supabase project running (see `prototypes/sliminject/.env.example`)

## Setup

```bash
cd prototypes/sliminject

# Install new dependencies
npm install sonner @radix-ui/react-tabs

# Start dev server
npm run dev
```

## Implementation Order

Work through phases in order — each phase has no dependency on the next:

1. **Phase 0** — Install deps, create `EmptyState`, add Sonner `<Toaster>`, extend `nl.ts`
2. **Phase 1** — P1 stories: form toasts, log CTA, hunger scale labels
3. **Phase 2** — P2 stories: empty states, streak display, tabbed patient profile
4. **Phase 3** — P3 stories: onboarding 4th step, advice label, concern response time, symptom groups
5. **Phase 4** — P4 stories: content groups, titration chart, realtime badges, notifications

## Testing

```bash
cd prototypes/sliminject
npm test
```

Key flows to verify manually after each phase:
- **Phase 1**: Submit log entry → toast appears; log CTA visible on fresh dashboard; hunger scale shows labels
- **Phase 2**: New patient account → empty states on all screens; 1–6 entries → streak shown; doctor opens patient profile → tabs visible
- **Phase 3**: Complete onboarding → 4th step prompts log; submit concern → response time message shown
- **Phase 4**: Add dosage schedule entries → titration chart updates; submit urgent concern as patient → badge in doctor nav within 30s

## Key Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `<Toaster>` from sonner |
| `src/i18n/nl.ts` | ~25 new strings |
| `src/components/EmptyState.tsx` | New shared component |
| `src/hooks/useUrgentConcerns.ts` | New realtime hook |
| `src/features/patient/dashboard/PatientDashboard.tsx` | Log CTA + streak vs chart |
| `src/features/patient/dashboard/LogEntryForm.tsx` | Labelled scale + symptom groups |
| `src/features/doctor/patient/PatientProfile.tsx` | Tabs layout |
| `src/features/patient/content/contentGroups.ts` | New static config |
