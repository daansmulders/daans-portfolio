# Dashboard Audit — Patient Experience

> **Authors**: Product Owner + UX Designer + UX Researcher
> **Date**: 2026-03-17
> **Context**: After shipping features 006–008 (injection-day card, dose change visibility, side effect tips), the patient dashboard has accumulated 13 potential card slots. For a patient like Lars (8 weeks into treatment), the dashboard can show 8+ cards simultaneously with no clear hierarchy.

---

## Research support for proposed changes

Each proposed change is cross-referenced against the GLP-1 UX Research Database (`glp1-data.md`) and the customer journey map.

| Proposed change | Supporting evidence |
|----------------|---------------------|
| **Single primary action** ("what should I do today?") | Theme 2 (Medication Tinkering): patients don't follow prescribed schedules in real-world use. A clear single CTA reduces cognitive load and improves adherence. 1yr discontinuation rate is ~22% for semaglutide — every friction point on the daily screen contributes to dropout. |
| **Cap alerts at 2** | Clinical side-effect data: nausea alone causes ~6.5% discontinuation. Alert fatigue (multiple amber cards) risks the patient ignoring the one that matters. Research on notification fatigue in health apps shows >3 alerts per session reduces engagement by 40%+. |
| **One celebration at a time** | Theme 1 (Sense of Normalcy) + Theme 12 (Food Noise Reduction): these are the most emotionally resonant moments in treatment. Stacking 4 milestones dilutes each one. The research says to "celebrate emotional milestones and quality-of-life wins, not just weight numbers" — this means each celebration deserves its own moment, not a wall of green. |
| **Remove doctor advice card** | Theme 11 (Doctor–Patient Tension): patients feel more knowledgeable than their doctors. A static advice card from the doctor feels paternalistic. The concerns/reply system is bidirectional and contextual — the patient initiates, the doctor responds. This matches the research: "shareable patient summary for doctor visits, preparation guides" > one-way broadcast. |
| **Chart as visual anchor** | Consumer behaviour data: GLP-1 users are mobile-first early adopters (1.7x more likely to use mobile apps). The progress chart is the most data-rich, most-visited element. Making it the visual centre of the dashboard aligns with how mobile-first users scan screens — they look for the data, not the cards around it. |
| **Compact entries grid** | 50% of users who discontinue cite side effects — they need to see their symptom pattern quickly. A compact 3-entry grid surfaces the trend without requiring scroll. The current 5-entry list with inline symptoms pushes the chart (the most valuable element) below the fold. |
| **Remove reminder from dashboard** | Consumer insight: 74% say health is their primary food factor, and they're early tech adopters. These patients don't need a daily reminder toggle — they need a calm dashboard that rewards them for showing up. The reminder is a settings-screen interaction, not a daily-view one. |
| **Zoned layout (not single column)** | Consumer data: GLP-1 users over-index on premium brands (+12.9pp uplift). "Design for mobile-first, premium feel." A single-column card stack feels generic. A zoned layout with clear visual regions (action → data → context) feels intentional and designed — matching the premium expectation of this demographic. |

### Dropout risk relevance

The dashboard is the screen patients see every day. Research shows:
- **~50% of all GLP-1 users discontinue within 1 year** (multiple sources)
- **~22% discontinuation for semaglutide specifically** (clinical data)
- **13% discontinue due to side effects** (KFF), **14% due to cost** (KFF)
- **Persistence improves to 63% when support is addressed** (HealthVerity)

A cluttered, noisy dashboard doesn't cause discontinuation directly — but it fails to provide the daily reassurance and clarity that keeps patients engaged during the hardest weeks (2–6, when side effects peak and weight loss hasn't started yet). The journey map Phase 3 gap analysis identified this directly: *"No 'you're in the settling-in phase' narrative. Week 2–4 is the highest dropout risk."*

A dashboard that answers "what should I do today?" in one glance, shows progress clearly, and celebrates wins without noise is a retention tool.

---

## Current element inventory

Every element that can appear on the dashboard, in current render order:

| # | Element | Condition | For Lars today? | Category |
|---|---------|-----------|-----------------|----------|
| 1 | **Header** (title + logout) | Always | Yes | Chrome |
| 2 | **"Log vandaag" CTA** or **"✓ Gedaan"** | Non-injection day, not yet logged / already logged | Yes (not injection day) | Action |
| 3 | **InjectionDayCard** | Injection day + not yet confirmed | No (not injection day) | Action |
| 4 | **AdherenceCheckIn** | Not injection day + current dose not yet confirmed | No (past doses confirmed in seed) | Action |
| 5 | **Consecutive miss nudge** | 2 consecutive skipped doses | No | Alert |
| 6 | **Dose increase announcement** | Approved dose increase within 7 days, not dismissed | Yes (1.0 mg in 5 days) | Alert |
| 7 | **Doctor reply** | Unseen reviewed concern | No (Lars's concern was reviewed 9 days ago — may be seen) | Communication |
| 8 | **Doctor advice** | Advice exists + no unseen reply | Yes (advice exists) | Communication |
| 9 | **Appointment card** | Next appointment exists | Yes (12 days) | Info |
| 10 | **Progress chart** | 7+ days of data | Yes (8 weeks) | Data |
| 11 | **Food noise milestone** | 4-week sustained drop from ≥4 to ≤2 | Possibly (seed has the data) | Celebration |
| 12 | **Wellbeing milestones** (×3) | 2+ point improvement per dimension | Possibly (seed has the data) | Celebration |
| 13 | **Recent entries** (up to 5) | Any entries exist | Yes | Data |
| 14 | **Content teaser** | Unread educational article | Possibly | Education |
| 15 | **Reminder toggle** | Always | Yes | Settings |

### Worst case for Lars

On a single visit, Lars could see: Log CTA + dose announcement + advice card + appointment + chart + food noise milestone + 3 wellbeing milestones + 5 recent entries + content teaser + reminder = **13 elements scrolling**. That's not a dashboard — it's a feed.

---

## Problems identified

### P1. No priority hierarchy
All cards render in a fixed order regardless of importance. A dose increase announcement (clinically important, time-sensitive) sits at the same visual weight as a content teaser (nice-to-have, evergreen). There's no distinction between "you need to act" and "here's something interesting."

### P2. Celebration cards are noisy
Food noise milestone + up to 3 wellbeing milestones can fire simultaneously. That's 4 green cards in a row. Each says "you improved!" in a slightly different way. The patient scrolls past a wall of green before reaching their actual data.

### P3. AdherenceCheckIn is orphaned
The standalone `<AdherenceCheckIn />` still renders on non-injection days when `isDue` is true. But `isDue` from `useAdherenceCheckIn` is true whenever the *most recent* schedule entry hasn't been confirmed — even if it's weeks old. With proper seed data this is fixed, but the component itself is a relic of the pre-injection-day-card era. On non-injection days, there's nothing for the patient to confirm.

### P4. Doctor advice is static
The advice card shows the same message every visit with no dismiss or "seen" mechanism. After reading it once, it becomes wallpaper.

### P5. Reminder toggle is always visible
The reminder settings (time picker + toggle) take up permanent space at the bottom. This is a set-once-forget interaction that doesn't belong on the daily view.

### P6. No "quiet day" state
When the patient has logged, has no alerts, and has no milestones, the dashboard should feel calm. Currently it still shows: ✓ Gedaan + advice + appointment + chart + entries + content + reminder = 7 elements. There's no breathing room.

### P7. Content teaser competes with clinical content
Educational content is valuable but sits between clinical data (entries list) and settings (reminder). It has no contextual trigger — it just shows the next unread article regardless of what the patient is doing.

---

## Proposal: Streamlined dashboard

### Design principle
**The dashboard answers one question: "What should I do today?"**

Everything else is secondary. The dashboard should have at most 3 levels of content:
1. **Primary action** — the one thing the patient should do right now
2. **Context** — information that supports the action or celebrates progress
3. **Background** — data the patient can browse at their own pace

### Proposed structure

The dashboard moves from a single-column card stack to a **zoned layout** with clear visual hierarchy. Each zone has a distinct visual treatment so the patient can orient instantly.

```
┌─────────────────────────────────────────┐
│ Header (title + logout)                 │
│                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ PRIMARY ACTION (exactly one)        ┃ │
│ ┃ Full-width, prominent               ┃ │
│ ┃ - Injection day → InjectionDayCard  ┃ │
│ ┃ - Not logged → "Log vandaag"        ┃ │
│ ┃ - Done → "✓ Gedaan" (subtle)        ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                         │
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │ ALERT       │ │ ALERT               │ │
│ │ (if any)    │ │ (if second)         │ │
│ └─────────────┘ └─────────────────────┘ │
│ ↑ 2-column grid for alerts, max 2      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ PROGRESS CHART                      │ │
│ │ (full-width, the visual anchor)     │ │
│ │ + dose markers + chart legend       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ entry 1  │ │ entry 2  │ │ entry 3  │ │
│ │ compact  │ │ compact  │ │ compact  │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│ ↑ 3-column compact grid for entries    │
│   (date, weight, hunger — no symptoms) │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CELEBRATION (max 1, if triggered)   │ │
│ │ Distinct visual moment — not a card │ │
│ │ in the feed, but a highlighted band │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Appointment │ │ Content teaser      │ │
│ │ (if any)    │ │ (if relevant)       │ │
│ └─────────────┘ └─────────────────────┘ │
│ ↑ 2-column grid for secondary info     │
│                                         │
└─────────────────────────────────────────┘
```

### Visual hierarchy techniques

| Technique | Where applied | Effect |
|-----------|--------------|--------|
| **Size + prominence** | Primary action is the largest element, full-width, bold styling | Instant "what do I do today?" answer |
| **2-column grid for alerts** | Alert cards sit side-by-side instead of stacked | Takes half the vertical space; alerts feel compact and scannable, not alarming |
| **Chart as visual anchor** | Progress chart gets full width, generous padding | The one element patients look at every visit anchors the middle of the page |
| **3-column compact entries** | Recent entries as a tight horizontal grid (date + weight + hunger only) | History is glanceable, not a scrolling list; symptoms hidden (visible on tap or in log history) |
| **Celebration as a band** | Milestone renders as a subtle full-width highlight band, not a card-in-a-stack | Feels like a moment, not another notification to dismiss |
| **2-column secondary** | Appointment + content teaser sit side-by-side at the bottom | Low-priority items earn less vertical space |
| **Whitespace between zones** | Clear spacing gaps between action → alerts → chart → entries → celebration → secondary | Patient can visually parse zones without reading every card |

### Key changes

| Change | What | Why |
|--------|------|-----|
| **Remove AdherenceCheckIn** | Drop the standalone `<AdherenceCheckIn />` entirely | Replaced by InjectionDayCard on injection days; on non-injection days there's nothing to confirm |
| **Remove doctor advice** | Drop the static advice card | Redundant now that concerns/reply system exists. Doctor communicates through concern responses, not a static text block. If the doctor needs to say something, they respond to a concern or schedule an appointment. |
| **Cap alerts at 2** | Show max 2 alert cards in a 2-column grid, prioritised | Prevents alert fatigue; most patients will have 0–1 |
| **One celebration at a time** | Show only the highest-priority milestone; queue others | 4 green cards in a row is overwhelming; one at a time feels earned |
| **Grid layout for entries** | 3-column compact grid instead of 5-row list | Glanceable history; less scroll; symptoms visible on tap, not inline |
| **Move reminder to settings** | Remove reminder toggle from dashboard | Set-once interactions don't belong on the daily view |
| **Content teaser to secondary zone** | Moves to bottom 2-column grid alongside appointment | Stops competing with clinical content |

### Alert priority order (for 2-slot grid)

1. Consecutive miss nudge (urgent — clinical)
2. Doctor reply (actionable — communication)
3. Dose increase announcement (timely — informational)

### Milestone priority order (for celebration band)

1. Food noise milestone (most emotionally resonant)
2. Energy improvement
3. Mood improvement
4. Confidence improvement

---

## Implementation scope

### Phase 1 — Quick structural wins
- Remove `<AdherenceCheckIn />` from non-injection days
- Remove doctor advice card
- Cap milestones at 1 (show highest priority only)
- Reduce entries from 5 to 3
- Remove reminder toggle from dashboard

### Phase 2 — Layout upgrade
- 2-column grid for alerts
- 3-column compact grid for recent entries (date + weight + hunger, no symptoms inline)
- Celebration band styling (distinct from card-in-a-stack)
- 2-column secondary zone (appointment + content teaser)
- Whitespace between zones

### Phase 3 — Polish
- Alert priority system (compute which 2 to show)
- Content teaser hidden when celebration or alerts are visible
- "Quiet day" state: when all actions complete, chart + entries only — no noise

---

## Next step

Agree on the approach, then implement Phase 1 (quick structural wins) first.
