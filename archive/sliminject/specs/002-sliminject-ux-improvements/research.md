# Research: Sliminject UX Improvements

**Feature**: 002-sliminject-ux-improvements
**Date**: 2026-03-16

---

## 1. Toast / Form Feedback

**Decision**: Add **Sonner** (`sonner`) for all toast notifications.

**Rationale**: Sonner has a simpler API than `@radix-ui/react-toast` — no provider hook boilerplate, fires directly from any module. React 18 native, TypeScript-first, ~4-5 KB gzipped. Pairs cleanly with Tailwind for custom styling. The shadcn/ui project deprecated its Radix-based toast in favour of Sonner, reflecting clear market direction. Adds one small dependency; avoids the verbose Radix reducer pattern.

**Alternatives considered**:
- `@radix-ui/react-toast` (v1.2.15) — consistent with existing Radix stack but requires a provider, dispatch pattern, and more boilerplate for a simple success/error toast.
- Custom toast — avoidable; Sonner is minimal enough that custom implementation adds maintenance without benefit.

---

## 2. Patient Profile Tabs

**Decision**: Add **`@radix-ui/react-tabs`** (v1.1.13).

**Rationale**: Directly consistent with the existing Radix UI ecosystem already in package.json. Built-in WAI-ARIA keyboard navigation. Minimal composable API: `Root`, `List`, `Trigger`, `Content`. No bundle bloat concern — similar size to other Radix primitives already installed. Vertical or horizontal orientation supported.

**Alternatives considered**:
- Custom tab implementation — unnecessary when a well-tested Radix primitive exists.
- React Router–based route tabs — overly complex for a sub-section of one page.

---

## 3. Supabase Realtime for Urgent Concerns

**Decision**: Use Supabase `postgres_changes` subscription filtered by `severity=eq.urgent` on the `concerns` table.

**Pattern**:
```ts
supabase
  .channel('urgent-concerns')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'concerns',
    filter: 'severity=eq.urgent'
  }, (payload) => { /* update badge state */ })
  .subscribe()
```
Subscription cleaned up in `useEffect` return. RLS on the `concerns` table already scopes data to the authenticated doctor's patients — no additional access control needed.

**Alternatives considered**:
- Polling on a short interval — simpler but latency unacceptable for "urgent" concerns in a medical context.
- Supabase Broadcast channel — better for presence/ephemeral events, not durable DB inserts.

---

## 4. Streak Calculation

**Decision**: Compute streak client-side from existing `progress_entries` data using **`Intl.DateTimeFormat`** (built-in, no new dependency).

**Algorithm**:
1. Sort entries by `logged_at` descending.
2. Convert each timestamp to the user's local calendar date via `Intl.DateTimeFormat` (handles DST automatically).
3. Walk backward from today: for each consecutive day with an entry, increment the streak counter.
4. If the most recent entry is more than 1 day ago, streak = 0.

**No new dependency required** — `Intl` is available in all modern browsers and in Node 20+ (test environment).

**Alternatives considered**:
- `date-fns-tz` — correct but adds ~15 KB for a problem solvable with `Intl`.
- Storing streak on the server — unnecessary complexity for a prototype; the data to compute it already exists.

---

## 5. Daily Logging Reminders

**Decision**: **In-app `setInterval` + Web Notifications API**. No service worker for prototype scope.

**Rationale**: A `setInterval` checking the current time every 60 seconds is sufficient when the app tab is open. `new Notification(title, options)` fires the OS notification. Permission is requested once on opt-in. This approach is simpler, requires no server infrastructure, and is appropriate for a portfolio prototype. Limitation: reminders only fire when the browser tab is open.

**Implementation note**: Store the user's reminder preference (enabled + time) in `localStorage` only — no Supabase table needed for prototype scope.

**Alternatives considered**:
- Service Worker + Push API — production-grade but requires a push notification server endpoint, VAPID keys, and backend infrastructure. Out of scope for this prototype.
- Notification Triggers API (experimental) — elegant but insufficient cross-browser support as of 2026.

---

## 6. Educational Content Topic Groups

**Decision**: Add `topic_group` and `sort_order` fields to the educational content data. For prototype scope, use a **static mapping config file** (`src/features/patient/content/contentGroups.ts`) that maps content IDs or topics to groups, rather than a new DB migration.

**Rationale**: The educational content table is not in the current TypeScript `Database` type definition, meaning it's either dynamically typed or not yet fully wired. A static config avoids a migration and keeps the feature deliverable without DB changes.

**Alternatives considered**:
- DB columns `topic_group` + `sort_order` on the content table — correct long-term approach but requires a migration. Can be done in a follow-up.

---

## 7. Field Name Mapping Note

The spec refers to a "hunger scale" but the Supabase schema stores this as **`wellbeing_score`** (integer 1–5) in `progress_entries`. The labelled anchors ("Geen honger" / "Heel veel honger") are a UI-only change to `LogEntryForm.tsx`. No schema change required.

---

## New Dependencies Required

| Package | Version | Purpose |
|---------|---------|---------|
| `sonner` | `^2.0.7` | Toast notifications (all forms) |
| `@radix-ui/react-tabs` | `^1.1.13` | Patient profile tab layout |

No new Supabase tables required for P1–P3 items. P4 (educational content groups) uses a static config file.
