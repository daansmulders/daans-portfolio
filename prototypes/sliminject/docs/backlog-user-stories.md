# Backlog — User Stories & Requirements

> Status: **Draft — awaiting product owner review**
> Authors: Designer + Product Owner
> Sources: GLP-1 UX Research Database (`glp1-data.md`), Customer Journey Map (`customer-journey-map.md`)

---

## 1. Dose adherence tracking

**Background:** Real-world research shows most GLP-1 users self-adjust doses without informing their doctor (Theme 2: Medication Tinkering). The prototype currently logs symptoms and weight but never records whether the patient actually administered their scheduled injection — a clinically significant blind spot.

### Patient story
> As a patient, I want to confirm whether I took my injection this week, so that my doctor has an accurate picture of my adherence and can interpret my progress data correctly.

**Acceptance criteria:**
- [ ] On injection day (per dosage schedule), a weekly injection check-in prompt appears on the patient dashboard
- [ ] Patient can respond: "Ja, genomen" / "Nee, overgeslagen" / "Andere dosis" (with optional free-text note)
- [ ] Skipped or adjusted doses are stored and visible in the patient's log history
- [ ] After two consecutive missed injections, a gentle nudge appears: "Je hebt je injectie twee keer overgeslagen — wil je je arts een berichtje sturen?"
- [ ] Adherence data is stored per scheduled dose entry

### Doctor story
> As a doctor, I want to see whether my patient took their medication as scheduled, so that I can distinguish between poor drug response and poor adherence.

**Acceptance criteria:**
- [ ] The Medicatie tab on the patient profile shows a per-week adherence indicator alongside the titration timeline
- [ ] Skipped or adjusted doses are flagged visually (informative, not alarmist)

---

## 2. Side effect management tips

**Background:** Nausea is the #1 reason patients discontinue GLP-1 treatment (~50% of dropouts cite side effects). When a patient logs a symptom, the prototype currently records it and — on first occurrence — queues a full educational article. But for repeat logs, patients get no in-the-moment guidance. An inline tip shown immediately after logging fills that gap without replacing the deeper content.

**Design note:** Editorial design will play an important role in whether the tips actually resonate. The layout, typography, and tone need to feel warm and human — not a warning label. Multiple layout variants should be explored and tested before settling on a final approach.

**Relationship to existing educational content:**
- The existing trigger system delivers full articles (e.g. "Misselijkheid bij GLP-1: wat is normaal?") the **first time** a patient logs a symptom — this continues unchanged
- Inline tips are **brief and immediate** — shown in the log confirmation screen every time a symptom is logged (max once per week per symptom to avoid repetition)
- Together: tip handles the immediate moment → article handles deeper understanding

### Patient story
> As a patient who just logged a side effect, I want to see a brief practical tip right away, so that I know what I can do now — not just when I get around to reading an article.

**Acceptance criteria:**
- [ ] After submitting a log with one or more side effects, a tip card appears in the log confirmation screen
- [ ] Tips are mapped per symptom:
  - Misselijkheid → "Eet kleine, droge maaltijden. Gember kan helpen. Vermijd vette of sterk geurende gerechten."
  - Diarree → "Drink veel water. Beperk tijdelijk zuivel en vezelrijke voeding."
  - Constipatie → "Verhoog je vezelinname geleidelijk en drink meer water."
  - Vermoeidheid → "Zorg voor voldoende eiwitten. Lichte beweging kan helpen."
  - Haaruitval → "Tijdelijk en normaal bij gewichtsverlies. Voldoende eiwitten en zink kunnen helpen."
  - Injectieplaatsreactie → "Wissel bij elke injectie van plek."
- [ ] If multiple symptoms are logged, the tip for the most common/severe one is shown (nausea takes priority)
- [ ] If severity is 4–5, an extra nudge appears: "Dit klinkt zwaar — overweeg je arts een bericht te sturen"
- [ ] Tips are dismissible and non-blocking
- [ ] The same tip does not appear for the same symptom more than once per week
- [ ] The first time a symptom is logged, the existing educational article trigger fires as usual (no change to current behaviour)

### Doctor story
> No new doctor UI required. Severe symptom flags (4–5) are already visible in the patient's log history.

---

## 3. Food noise tracking

**Background:** Reduction of "food noise" (constant preoccupation with food) is the most emotionally resonant benefit of GLP-1 treatment (Theme 12, "Very high" frequency). It is entirely absent from the prototype. Adding it as a trackable metric makes Sliminject feel distinctly GLP-1 — not a generic weight tracker.

### Patient story
> As a patient, I want to log how loud my food thoughts were today, so that I can see over time how the medication is reducing my mental preoccupation with food — not just my weight.

**Acceptance criteria:**
- [ ] The daily log form gains a new optional field: "Eetgedachten vandaag" with a 1–5 scale
  - 1 = Nauwelijks aanwezig
  - 3 = Af en toe
  - 5 = Constant aanwezig
- [ ] The scale uses plain, recognisable language — no clinical framing
- [ ] Food noise trend is plotted on the progress chart as a secondary line (toggleable, off by default)
- [ ] If food noise drops from ≥4 to ≤2 sustained over 4+ weeks, a milestone card appears: "Je eetgedachten zijn de afgelopen weken flink afgenomen — een van de grootste voordelen van je behandeling"
- [ ] Food noise data is visible to the doctor on the patient's Overzicht tab as part of the progress chart

---

## 4. Non-scale victories — weekly wellbeing check-in

**Background:** Patients value mood, energy, and social confidence as much as weight (Theme 1: Sense of Normalcy, Theme 9: Identity Shift). A weekly check-in on these dimensions helps patients recognise progress that the scale alone doesn't show, and gives doctors a more complete picture.

### Patient story
> As a patient, I want to record how I'm feeling beyond my weight each week, so that I can recognise and celebrate improvements in my energy, mood, and daily life.

**Acceptance criteria:**
- [ ] Once per week, a "Hoe voel je je deze week?" prompt appears on the patient dashboard
- [ ] Three dimensions, each rated 1–5:
  - Energie — "Hoe energiek voelde je je?"
  - Stemming — "Hoe was je stemming in het algemeen?"
  - Zelfvertrouwen — "Hoe zeker voelde je je in je lijf?"
- [ ] Optional free-text field: "Iets bijzonders deze week?" (max 200 chars)
- [ ] After completing, the patient sees their scores vs. the previous week
- [ ] Consecutive weekly check-in streak is tracked and shown (e.g. "4 weken op rij ingevuld")
- [ ] Wellbeing scores are plotted in the progress view (toggleable, separate from weight)
- [ ] If any dimension improves by 2+ points sustained over 4 weeks, a milestone card appears using the established lighthearted tone (e.g. "Je energie is de afgelopen weken flink toegenomen")
- [ ] Doctor can see the wellbeing trend on the patient's Overzicht tab

---

## 5. Shareable visit summary

**Background:** Patients often feel more informed about GLP-1s than their healthcare providers (Theme 11: Doctor–Patient Tension). A one-tap summary designed for the consultation room reduces friction at appointments and reinforces the collaborative nature of the product.

### Patient story
> As a patient preparing for a doctor's appointment, I want to generate a compact summary of my recent progress, so that I can quickly show my doctor the most relevant data without navigating the full app together.

**Acceptance criteria:**
- [ ] A "Samenvatting voor afspraak" button appears on the patient dashboard (secondary, low prominence)
- [ ] Tapping it opens a full-screen, share-optimised view containing:
  - Patient name + treatment duration
  - Current dose + next scheduled dose
  - Weight: start → current → change (kg and %)
  - Last 4 weeks of log entries (weight, hunger, food noise if tracked)
  - Active or recent side effects (past 4 weeks)
  - Open concerns or recent doctor responses
  - Wellbeing trend (if weekly check-in data exists)
- [ ] The summary is readable on a phone screen — designed to be shown, not printed
- [ ] A "Deel" action allows sharing as PDF or via the native share sheet
- [ ] The summary reflects the last 4 weeks by default

### Doctor story
> As a doctor, I want to pull up a patient's visit summary quickly during a consultation, so that I have the full picture without switching between tabs.

**Acceptance criteria:**
- [ ] A "Bekijk samenvatting" shortcut appears on the patient's Overzicht tab
- [ ] The doctor view is identical to what the patient shared
- [ ] Doctor can expand to full history from the summary view

---

---

## 6. Unified injection-day experience

**Background:** The weekly injection is the natural heartbeat of GLP-1 treatment, but the app presents injection day as two unrelated tasks: an adherence check-in card and a daily log form. On the most significant day of the week, the patient faces two separate prompts with no shared context. The customer journey map identified this as the primary reason the experience feels scattered (Journey Map: Phase 2–5 gap analysis).

**Design note:** This is a UX consolidation, not a new feature. The underlying data (adherence response, weight, hunger, wellbeing) stays identical — the change is in how and when it's asked.

### Patient story
> As a patient on my weekly injection day, I want a single guided check-in moment that combines confirming my injection with logging how I feel, so that the app reflects the natural rhythm of my treatment instead of feeling like separate chores.

**Acceptance criteria:**
- [ ] On scheduled injection days, the adherence check-in card and log prompt are replaced by a single "Injectiedag" card
- [ ] The card flows in one motion: confirm injection → weight (optional) → hunger score → brief wellbeing (energy 1–5, appetite 1–5, optional note)
- [ ] After confirming "Ja, genomen", a brief acknowledgement moment appears (e.g. "Injectie genoteerd. Zo houd je je behandeling op koers.")
- [ ] On non-injection days, the daily log form remains unchanged
- [ ] Skip option remains available for patients who didn't inject yet that day
- [ ] Adherence response and log entry are saved as separate records — no change to the data model

### Doctor story
No change to doctor UI. Adherence and progress data continue to appear separately on the patient profile.

---

## 7. Dose increase announcement

**Background:** Dose increases occur every two weeks for the first 16 weeks of treatment and are the most clinically significant recurring event in the GLP-1 journey. They are entirely invisible in the current patient-facing UI — the medication timeline shows them passively, but nothing acknowledges them proactively. Patients experience potential symptom resurgence without any anticipatory guidance (Journey Map: Phase 4 gap; Theme 3: Side Effect Endurance).

### Patient story
> As a patient whose dose is about to increase, I want the app to tell me in advance and prepare me for what to expect, so that I'm not caught off guard by renewed side effects and understand that this is a normal, positive step in my treatment.

**Acceptance criteria:**
- [ ] The week before a scheduled dose increase, a contextual card appears on the dashboard: "Volgende week gaat je dosis omhoog naar [X] mg"
- [ ] On the injection day of the new dose, the injection-day card (or adherence check-in) includes a "Nieuwe dosis" marker: "Je eerste injectie op [X] mg — let op: bijwerkingen kunnen tijdelijk terugkomen"
- [ ] The card links to the relevant educational content for the new dose tier (or to the side effect management tips)
- [ ] After 2 injections at the new dose, the announcement card stops appearing — it is not a persistent banner
- [ ] Cards only appear for future dose increases in the patient's actual schedule, not retroactively
- [ ] Announcement cards are dismissible

### Doctor story
No new doctor UI required. Dose schedule is already visible on the Medicatie tab.

---

## 8. Dose annotations on the progress chart

**Background:** The progress chart shows weight and hunger trends over time, but gives no indication of when the dose changed. A patient who sees a weight plateau or a hunger spike has no way to connect it to their titration step. Adding dose markers makes the chart clinically legible for both patients and doctors (Journey Map: Phase 4–5 gap; Theme 11: Doctor–Patient Tension).

### Patient story
> As a patient reviewing my progress chart, I want to see where my dose increased over time, so that I can understand how each titration step affected my weight and hunger — and feel more confident that the treatment is working.

**Acceptance criteria:**
- [ ] The progress chart displays a subtle vertical marker at each dose step, positioned at the date the new dose started
- [ ] Tapping or hovering a dose marker shows a tooltip: "[X] mg — gestart op [datum]"
- [ ] Dose markers are visually distinct from data lines (e.g. a thin dashed vertical rule, not a data point)
- [ ] Dose markers appear on both the patient dashboard chart and the doctor's patient profile chart
- [ ] If there is only one dose in the schedule (no increases yet), no markers are shown

### Doctor story
> As a doctor reviewing a patient's progress chart, I want to see dose change markers so that I can immediately correlate weight changes with titration steps, without manually cross-referencing the medication timeline.

**Acceptance criteria:**
- [ ] Dose markers are visible in the ProgressChart component used on the PatientProfile overzicht tab
- [ ] No additional navigation is required — markers are inline

---

## 9. Weekly food noise check-in (injection-day rhythm)

**Background:** Food noise is currently logged as part of the daily log form, but it is a slowly-changing signal — the milestone triggers on a sustained 4-week average. Asking patients to rate their food noise every day creates logging fatigue without producing better data. The natural cadence is weekly, anchored to injection day when patients are already reflecting on their treatment (Journey Map: Phase 3–5 gap; Theme 12: Food Noise Reduction).

**Design note:** This is a rhythm change, not a feature addition. The food noise field moves from the daily log to the injection-day check-in. Daily logs retain weight, hunger, symptoms, and notes.

### Patient story
> As a patient tracking my food noise, I want to reflect on it once a week rather than every day, so that the question feels meaningful instead of repetitive — and so my trend data actually shows the gradual change I'm experiencing.

**Acceptance criteria:**
- [ ] The food noise score field is removed from the daily log form
- [ ] A food noise question is added to the injection-day check-in (or wellbeing check-in on non-injection days if no unified card yet): "Hoe aanwezig waren je eetgedachten deze week?" (1–5)
- [ ] Historical daily food noise entries remain visible in the chart — no data migration needed
- [ ] The 4-week milestone calculation is recalibrated for weekly data points (requires ≥4 weekly entries rather than 28 daily entries)
- [ ] The progress chart food noise toggle continues to function with weekly data points
- [ ] Food noise remains optional — the weekly check-in can be submitted without it

### Doctor story
No change to doctor UI. Food noise data continues to appear on the patient's Overzicht chart.

---

## 10. Treatment phase summary cards

**Background:** Every week of the app looks identical. There is no narrative arc or sense of progression across the treatment timeline. At clinically meaningful milestones — completing 4 weeks, completing the first titration phase, reaching 3 months — patients have no app moment that acknowledges how far they've come. This contributes to the "logging fatigue" that drives dropout (Journey Map: Phase 5–6; Theme 5: Weight Regain Fear).

### Patient story
> As a patient who has been on treatment for several weeks, I want the app to occasionally acknowledge my progress with a brief summary, so that I feel the journey is moving forward and my effort is being tracked — not just recorded.

**Acceptance criteria:**
- [ ] At weeks 4, 8, 12, and 16, an auto-generated summary card appears on the dashboard
- [ ] Each card contains:
  - Total weeks on treatment
  - Weight change since start (kg and %)
  - Injection adherence rate over the period (e.g. "7 van de 8 injecties gezet")
  - Most improved wellbeing dimension (if check-in data exists)
  - Largest food noise improvement (if data exists)
- [ ] Summary cards are dismissible and do not reappear after dismissal
- [ ] Cards use the established milestone tone — warm and informative, not gamified
- [ ] If data is insufficient for a section (e.g. no wellbeing check-ins), that section is omitted gracefully

### Doctor story
No new doctor UI required. Milestone timing is derivable from the dosage schedule start date.

---

## 11. Plateau acknowledgement

**Background:** Weight plateaus are physiologically normal during GLP-1 treatment but are a leading cause of patient anxiety and dropout — especially when the app is silent and the scale hasn't moved for weeks. Research shows that realistic expectations and normalisation significantly improve retention (Journey Map: Phase 6; Theme 5: Weight Regain Fear).

### Patient story
> As a patient whose weight has been stable for several weeks, I want the app to acknowledge the plateau and reassure me that it's normal, so that I don't interpret the stall as treatment failure and consider stopping.

**Acceptance criteria:**
- [ ] If no meaningful weight change (< 0.5 kg net) is recorded across 3 or more consecutive weekly weight logs, a plateau card appears on the dashboard
- [ ] The card text normalises the plateau: "Je gewicht is de afgelopen weken stabiel — plateaus zijn normaal en horen bij het behandelproces"
- [ ] The card includes a secondary action: "Stuur je arts een berichtje" — links to the concerns screen
- [ ] The card is dismissible with a "Begrepen" action
- [ ] The card does not reappear for the same plateau window after dismissal
- [ ] The card does not appear in the first 4 weeks of treatment (too early to call a plateau)

### Doctor story
No new doctor UI required. Plateau detection is client-side based on the patient's own weight log.

---

## Out of scope (deferred)

- **Post-discontinuer flow** (Persona 5 / Theme 5: Weight Regain Fear) — relevant for a future maintenance/offboarding phase
- **Goal weight tracking** — patient sets a target; progress chart shows a goal line. Deferred pending goal-setting UX design.
- **Wellbeing history view** — patient can see their own energy/mood/confidence trend over time. Currently only visible to the doctor.
