# Customer Journey Map — Sliminject

> **Authors:** Designer + UX Researcher
> **Date:** March 2026
> **Version:** 1.0 — Current State & Future State
> **Scope:** Patient journey from intake through goal weight. GLP-1 titration protocol (semaglutide reference: 0.25 → 0.5 → 1.0 → 1.7 → 2.4 mg over first 16 weeks).

---

## How to read this map

Each phase covers a meaningful stretch of the treatment arc. For every phase you'll find:

- **Patient state** — what the patient is doing, thinking, and feeling in real life
- **Injection rhythm** — the clinical event driving the week's significance
- **Current state** — every app touchpoint that fires today, with honest notes on friction
- **Gaps** — where the current experience falls short or feels disconnected
- **Future state** — a more intentional version of the same phase

A summary comparison of Current vs. Future follows the phase-by-phase detail.

---

## Phase 1 — Intake & Onboarding (Week 0)

### Clinical moment
Doctor prescribes GLP-1. Patient receives first pen, gets injection instructions. Starting dose set (typically 0.25 mg). No injection yet.

### Patient state
**Mood:** Hopeful, anxious, slightly overwhelmed
**Thoughts:** "Will this finally work?" / "What should I expect?" / "I don't want to do anything wrong"
**Needs:** Reassurance, clarity on what comes next, a sense of structure

### Current touchpoints

| Screen | What it does | How well it works |
|---|---|---|
| **Login / Account** | Supabase auth; patient account created by doctor intake | Invisible to patient — good |
| **Doctor intake form** | Doctor records starting weight, drug, dose schedule | Doctor-side only; patient sees none of this context in their own onboarding |
| **Onboarding step 1** | Welcome screen, lists 3 app features | Warm, clear. Feature list is accurate. |
| **Onboarding step 2** | Shows current dose pulled from schedule | Good — immediate sense of personalisation |
| **Onboarding step 3** | Tips on logging (weigh in the morning, daily is better) | Practical. Slightly disconnected from "I haven't injected yet" reality |
| **Onboarding step 4** | First log: weight + hunger score | Anchors a starting point — clinically useful. Skip option exists. |

### Gaps
- Onboarding has no mention of the injection itself. The patient is holding a pen for the first time and the app talks about logging habits.
- No "what to expect in week 1" framing — the first week is when side effects hit hardest and dropout risk is highest.
- Doctor has set the titration schedule but the patient has no visibility into the plan ahead.
- The link between "doctor set your schedule" and "here's your plan" is implicit, not shown.

---

## Phase 2 — First Injection (Week 1)

### Clinical moment
Patient self-injects for the first time, typically at home, on an agreed day of the week. 0.25 mg dose. Side effects can begin within hours (nausea most common).

### Patient state
**Mood:** Nervous, then relieved, then queasy
**Thoughts:** "Did I do it right?" / "My stomach feels off" / "When will I see results?"
**Needs:** Injection confirmation, symptom guidance immediately, normalisation of side effects

### Current touchpoints

| Screen | What happens | How well it works |
|---|---|---|
| **Dashboard — adherence check-in card** | Appears on scheduled injection day: "Heb je je injectie gezet?" (Ja / Nee / Andere dosis) | Correctly timed. One-tap confirm. Works well. |
| **Dashboard — daily log form** | Separate card: weight, hunger, food noise, symptoms, notes | Sits alongside the adherence card — feels like two tasks on the same day |
| **Content screen** | Educational article triggered on first symptom log (e.g. "Misselijkheid bij GLP-1: wat is normaal?") | Fires correctly but only after the patient already logged. The anticipation moment is missed. |
| **Side effect tip (backlog item 2)** | Brief inline tip after logging symptoms | Not yet built |

### Gaps
- On injection day, the patient faces two separate cards (adherence + log) with no shared context. It feels like two apps.
- There is no "well done on your first injection" moment — the adherence confirmation disappears silently.
- Nausea tips are reactive (shown after logging) instead of proactive (shown on injection day, before symptoms start).
- The medication screen shows the titration plan but the patient has no prompt to look at it.

---

## Phase 3 — Building the Routine (Weeks 2–4)

### Clinical moment
Still on 0.25 mg. Weekly injections continue. Patient establishes injection day as a weekly anchor. Side effects often peak around week 2–3, then begin to ease. Weight loss may or may not be visible yet.

### Patient state
**Mood:** Determined but sometimes discouraged (scale not moving) or proud (side effects easing)
**Thoughts:** "The scale hasn't moved much yet" / "I can tell my appetite is different" / "I should log more consistently"
**Needs:** Momentum, small wins, understanding that this phase is normal

### Current touchpoints

| Screen | What happens | How well it works |
|---|---|---|
| **Dashboard — streak display** | Shows consecutive daily logging streak | Good motivational loop. Logged days form a visible habit. |
| **Dashboard — adherence check-in** | Fires each injection day | Consistent. No friction. |
| **Dashboard — log form** | Weight, hunger, food noise, symptoms | Daily — works well when habit is formed |
| **Progress chart** | Weight + hunger + food noise lines appear after 7+ days | Chart gated at 7 days is appropriate. But it's silent until then — no "keep going, chart coming soon" state. |
| **Medication timeline (Medicatie tab)** | Shows titration plan, upcoming dose increases | Available but patient needs to actively navigate there — no prompt or preview from dashboard |
| **Educational content** | Article cards on symptom-related content | Triggered correctly, but articles are long-form and require navigation away from dashboard |

### Gaps
- No "you're in the settling-in phase" narrative. Week 2–4 is the highest dropout risk. The app doesn't acknowledge this moment.
- Food noise is logged daily as part of the main log, but food noise changes slowly — daily logging of this metric may feel pointless early on.
- The wellbeing check-in is not yet contextualised to the injection week rhythm. It floats independently.
- Progress chart wait (7 days minimum) has no placeholder — the chart section is just absent, leaving the page feeling empty.

---

## Phase 4 — First Dose Increase (Week 5–6)

### Clinical moment
At week 5, dose increases from 0.25 mg to 0.5 mg. This is a significant psychological and physical event. Side effects may briefly resurge. Patients often feel a new wave of effects for 1–2 injections.

### Patient state
**Mood:** Cautious optimism mixed with apprehension
**Thoughts:** "Hopefully this is when it really starts working" / "Will the nausea come back?"
**Needs:** Anticipatory guidance, reassurance, acknowledgement of the milestone

### Current touchpoints

| Screen | What happens | How well it works |
|---|---|---|
| **Medication timeline** | Shows dose increase in the titration chart | Visible if patient navigates there — no proactive prompt |
| **Dashboard — adherence check-in** | Fires on injection day as usual. No dose-increase context. | Misses the moment entirely. The check-in looks identical to every other week. |
| **Dashboard — log form** | Unchanged | No framing for "first injection at new dose" |
| **Progress chart** | Weight/hunger trend visible by now | First meaningful chart moment, but no annotation marking the dose change |

### Gaps
- The dose increase is a clinically and emotionally significant event with zero dedicated UX. The patient experiences it; the app is silent.
- No proactive "your dose increases this week" notification or in-app card.
- Adherence check-in on dose-increase week looks identical to every other week — a missed moment to say "new dose, watch out for X."
- Progress chart has no dose annotations — a doctor-level feature that patients would also benefit from.
- If symptoms resurge at the new dose, the content trigger only fires after symptom logging. Anticipatory tips (before the injection) don't exist.

---

## Phase 5 — Progressive Titration (Weeks 7–16)

### Clinical moment
Dose increases every two weeks: 0.5 → 1.0 → 1.7 → 2.4 mg. Each increase follows the same pattern as week 5. Appetite suppression and food noise reduction become more pronounced. Weight loss typically accelerates.

### Patient state
**Mood:** Increasingly positive; may notice profound changes in relationship with food
**Thoughts:** "Food just doesn't control me the way it used to" / "I've lost X kg now" / "My energy is better some days"
**Needs:** Recognition of non-scale progress, continued adherence support, community/normalisation

### Current touchpoints

| Screen | What happens | How well it works |
|---|---|---|
| **Dashboard — food noise chart toggle** | Food noise line appears once ≥3 data points logged | Thoughtful — gated appropriately |
| **Dashboard — food noise milestone card** | Fires when mean ≤2 sustained 4 weeks after prior ≥4 | Well-designed but relies entirely on consistent daily logging to compute |
| **Dashboard — wellbeing check-in card** | Weekly prompt: energy, mood, confidence (1–5) + note | Appears on dashboard independently — timing not linked to injection day |
| **Dashboard — wellbeing milestone cards** | Per-dimension 2+ point improvement over 21–35 day window | Good. But fires into the same dashboard feed as everything else — can get lost |
| **Medication timeline** | All dose increases visible in the titration curve | Useful reference, but passive |
| **Concerns screen** | Patient can message the doctor | Exists but has no prompt or cue from the main journey |

### Gaps
- Wellbeing check-in is not anchored to injection day. The natural rhythm is: inject → check in on how you feel → log. Currently these are three separate, unrelated interactions.
- Food noise logging daily feels redundant when the meaningful signal is weekly. The user is asked to rate "how loud food thoughts were today" every day, but the milestone triggers on a 4-week average. The frequency of ask and the frequency of signal don't match.
- No narrative between phases. Going from week 6 to week 8 the app looks identical. There's no "you've now completed 8 weeks" or "you're halfway through your titration" acknowledgement.
- Doctor progress chart has no dose annotations. On the doctor side, interpreting weight change relative to dose changes requires manual cross-referencing.
- Milestone cards appear in the middle of the dashboard scroll — no dedicated celebration moment.

---

## Phase 6 — Maintenance & Goal Pursuit (Month 4+)

### Clinical moment
Patient reaches maintenance dose (typically 2.4 mg or highest tolerated). Weekly injections continue indefinitely. Weight loss stabilises or continues slowly. Psychological adjustment to new body begins.

### Patient state
**Mood:** Variable — proud, sometimes anxious about plateaus, sometimes existential ("what happens when I stop?")
**Thoughts:** "I'm almost at my goal weight" / "What if I have to stop?" / "The app feels repetitive now"
**Needs:** Long-term motivation, plateau guidance, goal recognition, eventual transition support

### Current touchpoints

| Screen | What happens | How well it works |
|---|---|---|
| **Dashboard — log form** | Unchanged from week 1 | Works but offers no sense of "you've come a long way" |
| **Progress chart** | Full history visible | Good historical view but no goal line or trajectory |
| **Adherence check-in** | Fires every injection day | Still reliable |
| **Wellbeing check-in** | Weekly, ongoing | No streak or history view from the patient side |
| **Concerns / messaging** | Available | No proactive "it's been 3 months — how are things?" prompt |
| **Appointments** | Doctor can schedule, patient can view | No pre-appointment summary prompt until Feature 005 (visit summary) is built |

### Gaps
- No goal weight visualisation — patients can log weight but can't set or track a target.
- No plateau acknowledgement. When weight stalls for 2–3 weeks, the app is silent. Research shows this is a critical dropout risk moment.
- The log form is identical to week 1 — no sense of progression or personalisation over time.
- Wellbeing check-in has no history view for the patient — they can't see their own trend.
- The biggest life change (food noise disappearing, energy returning, identity shift) is tracked but not celebrated or contextualised for the patient.
- No transition planning. The deep fear of stopping (Theme 5: Weight Regain Fear) has zero support in the current app.

---

## Phase 7 — Goal Reached

### Clinical moment
Patient reaches target weight. Doctor decides whether to taper, maintain, or discontinue. This phase is entirely absent from the current prototype.

### Patient state
**Mood:** Triumphant, but immediately anxious
**Thoughts:** "I did it — but now what?" / "I'm terrified to stop" / "Will I keep the weight off?"
**Needs:** Recognition of achievement, honest transition guidance, continued touchpoint

### Current touchpoints
None. The current app has no concept of goal completion or transition.

### Gaps
- No goal celebration moment.
- No offboarding or tapering flow.
- No maintenance-mode experience.
- See backlog: "Post-discontinuer flow" (deferred).

---

---

# Current State vs. Future State — Side by Side

## Current state: what the journey feels like today

The app has solid foundational coverage — logging, adherence, wellbeing — but the features exist as **independent modules** rather than a connected experience. The weekly injection cycle is the natural heartbeat of GLP-1 treatment, but the app doesn't reflect it.

The patient encounters:
- A daily log prompt (every day)
- A weekly injection check-in (on injection day)
- A weekly wellbeing check-in (floating, not anchored to injection day)
- Educational articles (triggered reactively after symptom logs)
- Milestone cards (when computed criteria are met, surfaced mid-dashboard)

These feel like **five separate apps** sharing a screen. On injection day in particular, the patient is presented with an adherence card and a log card side by side with no shared context or narrative thread.

The **titration milestone** (dose increase every 2 weeks in the first 16 weeks) is the most clinically significant recurring event in the journey — and it's completely invisible in the UX. The medication timeline shows it passively; nothing else acknowledges it.

**Biggest disconnects:**
1. Injection day has no unified "injection week" experience
2. Dose increases are silent in the patient-facing UI
3. Wellbeing check-in is untethered from the injection rhythm
4. Food noise daily logging frequency mismatches the weekly signal
5. No narrative arc across phases — every week looks the same

---

## Future state: a more connected journey

The core redesign principle: **the weekly injection is the anchor for all recurring interactions.**

### Proposed weekly rhythm

```
Injection day (e.g. Monday)
├── [Morning] "Je injectiedag" card
│   ├── If dose increase this week → proactive context card: "Nieuwe dosis: X mg — hier op letten"
│   ├── Adherence check-in (confirm/skip/adjust)
│   └── Side effect tip if dose just increased (before symptoms, not after)
│
├── [After confirming injection] Consolidated log prompt
│   ├── Weight (if tracked)
│   ├── Hunger score
│   └── "Hoe voel je je?" — combines food noise + brief wellbeing in one moment
│
└── [End of week 4, 8, 12, 16, etc.] Phase summary card
    ├── "X weken onderweg" summary
    ├── Weight change from start
    ├── Best wellbeing trend
    └── Food noise trend (if data exists)
```

### Future state touchpoints by phase

#### Phase 1 — Intake & Onboarding (Week 0)
| Future touchpoint | Change from current |
|---|---|
| **Onboarding step 2: "Jouw plan"** | Add titration preview — "In week 5 gaat je dosis omhoog naar 0.5 mg. Je arts heeft dit al ingepland." Reduces anxiety about the unknown. |
| **Onboarding step 3: "Eerste injectie"** | Reframe around injection day, not generic logging tips. "Je eerste injectiedag is [datum]. Hier is wat je kunt verwachten." |
| **Pre-injection content card** | Auto-trigger on first injection day: "Wat je deze week kunt verwachten" — normalises nausea, sets expectations *before* the patient logs symptoms. |

#### Phase 2 — First Injection (Week 1)
| Future touchpoint | Change from current |
|---|---|
| **Unified "injectiedag" card** | Replaces separate adherence + log cards. One experience: confirm injection → brief wellbeing check (energy, appetite) → optional symptom note. |
| **Post-confirm acknowledgement** | After "Ja, genomen": small celebratory moment — "Eerste injectie gezet. Goed gedaan." Not over-engineered, just present. |
| **Proactive nausea tip** | Shown on injection day regardless of symptom logging: "Kans op misselijkheid de eerste paar dagen — eet kleine maaltijden." |

#### Phases 3–5 — Titration (Weeks 2–16)
| Future touchpoint | Change from current |
|---|---|
| **Dose increase announcement card** | Fires the week before the increase: "Volgende week gaat je dosis omhoog naar X mg." and on the day: "Nieuwe dosis: X mg — je eerste injectie op de nieuwe dosis." |
| **Progress chart dose annotations** | Vertical markers on the weight/hunger chart at each dose step. Patient and doctor can immediately see correlation between dose and results. |
| **Consolidated injection-week check-in** | Merge adherence + wellbeing into one "injection week" moment. Confirm injection → "Hoe voel je je deze week?" (energy 1–5, appetite 1–5, optional note). Replaces floating wellbeing card. |
| **Food noise: weekly instead of daily** | Move food noise logging from the daily log to the injection-week check-in. Match the frequency of the question to the frequency of the meaningful signal. |
| **"X weken onderweg" phase cards** | At weeks 4, 8, 12, 16: auto-generated summary. Weight lost, injection adherence rate, top wellbeing improvement. Creates a sense of journey progression. |
| **Plateau acknowledgement** | If weight unchanged for 3+ weeks: "Je gewicht is de afgelopen weken stabiel — dit is heel normaal bij je behandeling. Wil je je arts een berichtje sturen?" |

#### Phase 6 — Maintenance (Month 4+)
| Future touchpoint | Change from current |
|---|---|
| **Goal weight input** | Patient can set a target weight in settings/onboarding. Progress chart shows goal line. |
| **Wellbeing history view** | Patient can see their own energy/mood/confidence trend over time — not just the latest check-in. |
| **Pre-appointment summary (Feature 005)** | One-tap visit summary from dashboard. Anchored to appointment date when available. |
| **Long-term streak recognition** | Milestone cards at 3 months, 6 months, 12 months of continuous treatment. Reframes "still going" as an achievement. |

#### Phase 7 — Goal Reached (Future backlog)
| Future touchpoint | Change from current |
|---|---|
| **Goal celebration screen** | Triggered when weight reaches/passes goal. Full-page moment. Not deferred to background. |
| **Transition guidance** | "Je arts bepaalt samen met jou wat de volgende stap is." Links to concerns/appointment flow. |
| **Maintenance mode** | Lighter weekly check-in, no daily log pressure. Reframed dashboard for "staying on track." |

---

## Key redesign decisions to evaluate

These are the most consequential choices that will need validation before building:

### 1. Merge adherence + wellbeing into one injection-week check-in
**Hypothesis:** Patients will complete the combined check-in more reliably than two separate prompts, because it has a single natural trigger (injection day) and lower perceived effort.
**Risk:** Some patients don't inject on the same day each week — the anchor could misfire.
**Test:** A/B: current two-card vs. unified injection-week card. Measure completion rate and session drop-off.

### 2. Move food noise from daily to weekly
**Hypothesis:** Daily food noise logging has high noise and low signal. Weekly logging (on injection day) will produce cleaner data and better milestone detection, with less logging fatigue.
**Risk:** Reduces data density; 4-week milestone calculation may need recalibration.
**Test:** Check how many users actually log food noise daily vs. sporadically in current seed data. If sparsity is already high, the switch is low-risk.

### 3. Proactive side effect tips on injection day (not after symptom log)
**Hypothesis:** Showing "here's what might happen today" before symptoms appear reduces alarm when they do arrive, and may improve early retention.
**Risk:** Could feel paternalistic or noisy if tips are shown every week indefinitely.
**Mitigation:** Show full anticipatory tips only for weeks 1, 5, 7, 9, 11 (first injection + each dose increase). Suppress after that.

### 4. Dose annotations on the progress chart
**Hypothesis:** Patients who can see their dose steps on the weight chart will better attribute results to treatment and stay more motivated through slow periods.
**Risk:** Chart complexity — adding a third visual layer on top of weight + hunger lines.
**Mitigation:** Dose markers as subtle vertical rules with a label on hover/tap, not persistent text labels.

---

## Appendix — Current touchpoints inventory

Complete list of patient-facing app interactions, mapped to journey phases.

| Touchpoint | Screen | Phase | Trigger | Frequency |
|---|---|---|---|---|
| Account login | Auth | 0 | Manual | Once |
| Welcome tour | Onboarding | 0 | First login | Once |
| Dose display | Onboarding step 2 | 0 | First login | Once |
| First log (weight + hunger) | Onboarding step 4 | 0 | First login | Once |
| Daily log form | Dashboard | 2–6 | Manual (any time) | Daily |
| Progress chart | Dashboard | 2–6 | Auto, after 7 days data | Persistent |
| Streak display | Dashboard | 2–6 | Auto | Persistent |
| Adherence check-in card | Dashboard | 2–6 | Injection day per schedule | Weekly |
| Consecutive miss nudge | Dashboard | 2–6 | 2 consecutive skipped doses | As needed |
| Wellbeing check-in card | Dashboard | 3–6 | 7+ days since last check-in | Weekly |
| Food noise milestone card | Dashboard | 5–6 | 4-week criteria met | Once per fingerprint |
| Wellbeing dimension milestone cards (×3) | Dashboard | 5–6 | Per-dimension improvement criteria | Once per fingerprint |
| Educational content card | Dashboard | 2–6 | First time symptom is logged | Once per symptom type |
| Doctor advice card | Dashboard | 2–6 | Doctor posts advice | As needed |
| Medication timeline | Medicatie tab | 1–6 | Manual navigation | On demand |
| Side effect tips | Dashboard | 2–6 | After symptom log | Not yet built (backlog item 2) |
| Visit summary | Dashboard | 6 | Manual | Not yet built (Feature 005) |
| Concerns / message to doctor | Concerns screen | 2–6 | Manual | As needed |
| Appointments view | Appointments screen | 2–6 | Manual navigation | On demand |
