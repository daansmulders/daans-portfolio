# GLP-1 UX Research Database

> Sources: RAND American Life Panel (2025, n=8,793), KFF Health Tracking Poll (2025, n=1,350), CDC/NCHS NHIS (2024), Morning Consult (2025, n=58,008), NielsenIQ CSF Study (2025), Numerator GLP-1 Hub (2024–2025, n=30K), PwC GLP-1 Trends Survey (2024, n=3,000), PMC clinical reviews, Harvard Health, JCI, Nature. Synthetic data modeled on these distributions.

---

## 1. Clinical Drug Overview

| Drug (Generic) | Brand Names | FDA Approved | Indication | Administration | Typical Dose Range | Avg Weight Loss (Placebo-Corrected) | 1yr Discontinuation Rate |
|---|---|---|---|---|---|---|---|
| Semaglutide | Ozempic / Wegovy / Rybelsus | 2017 / 2021 | T2D / Obesity | Injection (weekly) / Oral | 0.25–2.4 mg/wk | ~12% | ~22% |
| Liraglutide | Victoza / Saxenda | 2010 / 2014 | T2D / Obesity | Injection (daily) | 0.6–3.0 mg/day | ~5% | ~25% |
| Tirzepatide | Mounjaro / Zepbound | 2022 / 2023 | T2D / Obesity | Injection (weekly) | 2.5–15 mg/wk | ~18% | ~16% |
| Dulaglutide | Trulicity | 2014 | T2D | Injection (weekly) | 0.75–4.5 mg/wk | ~3–4% | ~18% |
| Exenatide | Byetta / Bydureon | 2005 / 2012 | T2D | Injection (2x daily / weekly) | 5–10 mcg 2x/day | ~2–3% | ~20% |
| Lixisenatide | Adlyxin | 2016 | T2D | Injection (daily) | 10–20 mcg/day | ~1–2% | ~15% |

**Key context:** Tirzepatide is a dual GLP-1/GIP receptor agonist (not pure GLP-1). Higher weight-loss doses are prescribed for obesity vs. diabetes. Real-world weight loss is roughly half of clinical trial results due to lower doses and early discontinuation (semaglutide: ~7.7% real-world vs. ~12% trial; tirzepatide: ~12.4% real-world vs. ~18% trial).

---

## 2. Side-Effect Prevalence

| Side Effect | Semaglutide | Liraglutide | Tirzepatide | Typical Severity | Leads to Discontinuation? | User Management Strategies |
|---|---|---|---|---|---|---|
| Nausea | 40–50% | 30–40% | 25–35% | Mild | Primary cause of stopping (~6.5% overall) | Eat slowly, ginger, crackers, small meals |
| Diarrhea | 25–35% | 20–25% | 15–25% | Mild | Secondary cause | Hydration, avoid dairy/high-fiber temporarily |
| Vomiting | 15–25% | 10–15% | 10–15% | Mild–Moderate | Common cause | Smaller meals, staying hydrated |
| Constipation | 10–20% | 10–15% | 10–20% | Mild | Rarely | Fiber intake, hydration |
| Injection site reactions | 5–16% | 5–10% | 3–5% | Mild/Transient | Rarely | Rotate injection sites |
| Facial sagging ("Ozempic face") | ~20% | ~10% | ~15% | Cosmetic | Rarely | Gradual weight loss pace |
| Fatigue / Muscle weakness | 10–15% | 10–15% | 5–10% | Mild | Sometimes | Protein intake, resistance exercise |
| Hair loss | 5–10% | 3–5% | 5–8% | Mild | Rarely | Nutritional support, biotin |
| Pancreatitis (rare) | <1% | <1% | <1% | Serious | Yes — immediate medical care | Risk higher with history of gallstones |
| Heart rate increase | 1–3 bpm avg | 2–3 bpm avg | 1–2 bpm avg | Subclinical | Rarely | Monitoring |

**Key insight for UX:** About 50% of all GLP-1 users who discontinue do so because of side effects. Nausea is the #1 driver. Users frequently describe willingness to endure significant side effects to maintain weight loss — designing symptom management tools is a major opportunity.

---

## 3. Population-Level Usage Statistics (US)

| Metric | Value | Source | Year |
|---|---|---|---|
| US adults who have ever used a GLP-1 | 11.8% | RAND (n=8,793) | 2025 |
| US adults interested in using GLP-1 | 14% | RAND | 2025 |
| US adults not planning to use | 74% | RAND | 2025 |
| US adults currently taking a GLP-1 | 12% | KFF (n=1,350) | 2025 |
| US adults who have ever taken a GLP-1 | 18% | KFF | 2025 |
| Adults with diagnosed diabetes using GLP-1 injectables | 26.5% (~6.9M people) | CDC/NCHS NHIS | 2024 |
| Highest use demographic: Women aged 50–64 | ~20% | RAND | 2025 |
| Women 30–49 vs. Men 30–49 usage ratio | Women 2x more likely | RAND | 2025 |
| Among 65+: Men slightly higher use than women | Slight male lead | RAND | 2025 |
| Prescription volume growth since 2020 | >3x increase | Multiple | 2020–2025 |
| Users who discontinue within 1 year | ~50% | Multiple studies | 2024–2025 |
| Persistence improved when supply/coverage addressed | Up to 63% | HealthVerity | 2025 |
| Discontinued due to cost | 14% | KFF | 2025 |
| Discontinued due to side effects | 13% | KFF | 2025 |
| Discontinued because condition improved | 5% | KFF | 2025 |
| Employers covering GLP-1 for weight loss | 52% | WTW Survey | 2024 |
| Insured users who paid full cost themselves | 27% | KFF | 2025 |
| Monthly cost without insurance | >$1,000 | Multiple | 2025 |
| Non-users interested if diagnosed overweight | 43% | KFF | 2025 |
| Women's interest vs. Men's interest (non-users) | 27% vs. 18% | KFF | 2025 |
| Parents unopposed to GLP-1 for obese children | 82% | PwC | 2024 |
| Patients citing cost as reason for stopping | 45% | PwC | 2024 |

---

## 4. Synthetic User Experience Profiles

100 synthetic user profiles modeled on real-world distributions. Each profile contains: User ID, Age, Gender, Starting BMI, Current BMI, Drug, Duration, Goal, Weight Lost, Side Effects, Severity, Discontinuation Status, Satisfaction (1–10), Insurance Type, Out-of-Pocket Cost, Lifestyle Changes, Mental Health Impact, and Source Type.

### Distribution parameters used
- **Age:** 25–72 (peak at 45–60)
- **Gender:** ~60% female, ~35% male, ~5% non-binary
- **Starting BMI:** 27.0–45.0
- **Drugs:** Weighted toward semaglutide (Wegovy/Ozempic) and tirzepatide (Zepbound/Mounjaro), smaller share liraglutide
- **Duration:** 1–24 months
- **Goals:** ~60% weight loss, ~25% diabetes management, ~10% cardiovascular, ~5% combined
- **Side effects:** 15% none, 40% one, 30% two, 15% three+
- **Discontinuation:** ~35% discontinued
- **Satisfaction:** Continuing users 3–10 (mean ~7), discontinued users 1–7 (mean ~4)
- **Insurance:** Mix of employer (full/partial), Medicare, Medicaid, private, self-pay, compounding

### Sample profiles

**U001** — Female, 42, BMI 34.2→30.1, Semaglutide (Wegovy), 11 months, Weight loss goal, lost 12.8 kg (11.2%), Side effects: Nausea + Fatigue (severity 3/5), Continuing, Satisfaction 7/10, Employer plan (partial), $150/mo OOP, Diet + Exercise, "Improved confidence", Source: Reddit

**U014** — Male, 58, BMI 38.7→36.4, Semaglutide (Ozempic), 8 months, Diabetes management, lost 7.1 kg (5.8%), Side effects: Diarrhea (severity 2/5), Continuing, Satisfaction 8/10, Medicare, $50/mo OOP, Diet only, "No change", Source: Clinical survey

**U029** — Female, 33, BMI 31.5→29.8, Tirzepatide (Zepbound), 4 months, Weight loss, lost 5.4 kg (5.5%), Side effects: Nausea + Vomiting + Constipation (severity 4/5), Discontinued — Side effects, Satisfaction 4/10, No coverage (self-pay), $1,000/mo OOP, No changes, "Anxiety about regain", Source: Forum/Reddit

**U051** — Male, 47, BMI 41.2→35.6, Tirzepatide (Mounjaro), 18 months, Weight loss + Diabetes, lost 17.3 kg (13.6%), Side effects: Injection site reaction (severity 1/5), Continuing, Satisfaction 9/10, Employer plan (full), $25/mo OOP, Diet + Exercise + Therapy, "Improved mood", Source: Telehealth platform

**U078** — Non-binary, 36, BMI 29.0→27.1, Liraglutide (Saxenda), 6 months, Weight loss, lost 5.6 kg (6.4%), Side effects: Nausea + Hair loss (severity 3/5), Continuing, Satisfaction 6/10, Private insurance, $200/mo OOP, Calorie tracking + Exercise, "Mixed (body image)", Source: Support group

> **Usage note:** The full 100-profile dataset is in the accompanying .xlsx file. Use these profiles to generate variations, populate prototypes, or create test data for user flows. Adjust demographics and parameters to match your specific product context.

---

## 5. Survey Codebook

25-question survey instrument for GLP-1 user experience research. Each question maps to a UX research method.

| # | Question | Type | Response Options | Category | UX Application |
|---|---|---|---|---|---|
| Q1 | What is your age? | Numeric | 18–99 | Demographics | User segmentation |
| Q2 | What is your gender identity? | Single select | Female / Male / Non-binary / Prefer not to say | Demographics | Persona building |
| Q3 | What country do you live in? | Single select | Dropdown (countries) | Demographics | Market analysis |
| Q4 | What is your current BMI? | Numeric | 15.0–60.0 | Health Profile | User segmentation |
| Q5 | Diagnosed conditions (select all) | Multi-select | T2 Diabetes / Obesity / Heart Disease / PCOS / Sleep Apnea / None | Health Profile | Needs mapping |
| Q6 | Which GLP-1 medication? | Multi-select | Ozempic / Wegovy / Mounjaro / Zepbound / Saxenda / Rybelsus / Trulicity / Other | Medication | Product landscape |
| Q7 | How long using GLP-1? | Single select | <3mo / 3–6mo / 6–12mo / 1–2yr / >2yr | Medication | Journey mapping |
| Q8 | Primary reason for starting? | Single select | Weight loss / Diabetes / Cardiovascular / Doctor recommended / Other | Motivation | Jobs-to-be-done |
| Q9 | How did you first learn about GLP-1s? | Single select | Doctor / Social media / News / Friend-Family / Online ad / TV ad / Other | Discovery | Channel analysis |
| Q10 | Weight lost since starting (kg) | Numeric | 0–100 | Outcomes | Success metrics |
| Q11 | Overall satisfaction (1–10) | Likert | 1=Very dissatisfied → 10=Extremely satisfied | Satisfaction | NPS/CSAT benchmarking |
| Q12 | Side effects experienced (select all) | Multi-select | Nausea / Diarrhea / Vomiting / Constipation / Fatigue / Hair loss / Facial changes / Injection site pain / Headache / None | Side Effects | Pain point mapping |
| Q13 | Side effect impact on daily life (1–5) | Likert | 1=Not at all → 5=Severely | Side Effects | Impact analysis |
| Q14 | Considered stopping due to side effects? | Single select | Yes / No / Already stopped | Adherence | Dropout risk analysis |
| Q15 | How do you pay? | Single select | Employer insurance / Private / Medicare / Medicaid / Self-pay / Compounding / Other | Cost & Access | Barrier analysis |
| Q16 | Monthly out-of-pocket cost | Numeric | 0–2000 (local currency) | Cost & Access | Willingness to pay |
| Q17 | How easy to get prescription? (1–5) | Likert | 1=Very difficult → 5=Very easy | Access | Friction mapping |
| Q18 | Apps/tools used to track journey | Multi-select | Weight tracker / Calorie counter / Symptom diary / Community forum / Telehealth app / None | Digital Tools | Product opportunity |
| Q19 | Lifestyle changes alongside medication | Multi-select | Changed diet / Exercise / Calorie tracking / Therapy / Support group / None | Behavior | Holistic journey map |
| Q20 | How has medication affected your relationship with food? | Open text | Free text (max 500 chars) | Psychosocial | Qualitative insights |
| Q21 | Mental health changes since starting? | Single select | Improved / No change / Worsened / Mixed | Psychosocial | Safety & wellbeing |
| Q22 | Body image change (1–5) | Likert | 1=Much worse → 5=Much better | Psychosocial | Emotional journey |
| Q23 | Would you recommend GLP-1 to someone similar? | Single select | Definitely yes / Probably yes / Unsure / Probably no / Definitely no | NPS | Advocacy mapping |
| Q24 | Biggest challenge of being on GLP-1? | Open text | Free text (max 500 chars) | Pain Points | Design opportunity |
| Q25 | What would make your experience significantly better? | Open text | Free text (max 500 chars) | Opportunities | Innovation brief |

---

## 6. User Persona Archetypes

### Persona 1: The Optimizer
- **Demographics:** Female, 35–50, urban, high income, Gen X/Millennial
- **Primary goal:** Lose 15–25 kg for health and appearance
- **Drug & duration:** Semaglutide (Wegovy), 6–12 months
- **Key pain points:** Nausea management, cost with partial insurance, "Ozempic face" concerns, plateau anxiety
- **Digital behavior:** Uses MyFitnessPal + Noom, active on Reddit r/Ozempic, follows GLP-1 influencers on Instagram
- **Design opportunity:** Integrated symptom + weight tracker with personalized meal suggestions for managing side effects

### Persona 2: The Diabetic Manager
- **Demographics:** Male, 50–65, suburban, middle income, Gen X/Boomer
- **Primary goal:** Blood sugar control with modest weight loss
- **Drug & duration:** Semaglutide (Ozempic) or Dulaglutide, 1–2+ years
- **Key pain points:** Balancing multiple diabetes meds, GI side effects, insurance formulary changes, injection fatigue
- **Digital behavior:** Uses glucose monitor app, limited social media, trusts doctor advice primarily
- **Design opportunity:** Dashboard combining glucose, weight, and medication tracking with doctor-sharing features

### Persona 3: The Cost-Conscious Seeker
- **Demographics:** Female, 28–40, any location, lower income
- **Primary goal:** Weight loss, exploring affordable options
- **Drug & duration:** Compounded semaglutide or Liraglutide, <6 months, intermittent use
- **Key pain points:** Affording medication, navigating insurance denials, finding legitimate compounding pharmacies, high discontinuation risk
- **Digital behavior:** Searches for coupons/savings programs, TikTok for tips, telehealth platforms
- **Design opportunity:** Price comparison tool, insurance navigator, community-verified pharmacy reviews

### Persona 4: The Hesitant Researcher
- **Demographics:** Any gender, 30–55, any location
- **Primary goal:** Considering GLP-1 but worried about side effects and safety
- **Drug & duration:** Not yet started or just starting (month 1–2)
- **Key pain points:** Fear of long-term effects, overwhelmed by conflicting information, pancreatitis concerns, social stigma
- **Digital behavior:** Reads medical studies, browses WebMD/Mayo Clinic, lurks on forums before posting
- **Design opportunity:** Evidence-based decision support tool with plain-language risk/benefit summaries

### Persona 5: The Post-Discontinuer
- **Demographics:** Any gender, 35–60, any location
- **Primary goal:** Managing weight regain after stopping medication
- **Drug & duration:** Previously on any GLP-1 for 3–18 months, now off
- **Key pain points:** Weight regain (avg 2/3 within 1 year), loss of appetite suppression, psychological impact of regain, considering restarting
- **Digital behavior:** Searches "weight regain after Ozempic", joins support communities, uses nutrition apps
- **Design opportunity:** Transition support tool with gradual tapering guidance, maintenance diet plans, mental health check-ins

### Persona 6: The Teen/Young Adult (Emerging)
- **Demographics:** Any gender, 16–25, any location, parent-guided decisions
- **Primary goal:** Obesity management, often a pediatric/family approach
- **Drug & duration:** Semaglutide or Liraglutide (lower dose), <12 months
- **Key pain points:** Peer stigma, body image complexity, parental consent dynamics, limited long-term safety data for youth
- **Digital behavior:** TikTok/Instagram as primary info source, peer-influenced, uses health apps sporadically
- **Design opportunity:** Age-appropriate onboarding, family shared tracking, peer support community features

---

## 7. Consumer Behavior Insights

| Insight | Data Point | Source |
|---|---|---|
| Core demographic | Gen X is 35% of GLP-1 users vs. 25% of general population | Morning Consult (n=58,008) |
| Millennials rising | 46% of current GLP-1 users are Millennials | NielsenIQ |
| Income skew | 31% earn >$100K vs. 14% general population | Morning Consult |
| Education level | 27% hold master's+ degree vs. 12% general population | Morning Consult |
| Health-conscious | 74% say health is their primary food factor | Morning Consult |
| Impulsive buyers | 49% self-describe as impulsive | Morning Consult |
| Early tech adopters | +15pp more likely to be first to try new technology | Morning Consult |
| Trend followers | +15pp more likely to follow latest trends | Morning Consult |
| Online shopping | 1.5x more likely to shop online grocery & club channels | NielsenIQ |
| Mobile-first | 1.7x more likely to use mobile apps for shopping | NielsenIQ |
| Spending shift | -10% grocery/QSR/tobacco spend within 6 months of starting | Numerator (n=30K) |
| Health category growth | +38% protein shakes, +58% superfoods, +23% bone health | Numerator |
| Weight loss ambition | 52% of users aim to lose ≥15 lbs | Numerator |
| Interest funnel | 22% of non-users interested; rises to 43% if diagnosed overweight | KFF |
| Gender gap in interest | Women 27% interested vs. Men 18% | KFF |
| Insurance barrier | 27% of insured users pay full cost themselves | KFF |

**UX implications:** GLP-1 users are affluent, educated, mobile-first early adopters who are simultaneously health-conscious and impulsive. They over-index on premium brands (+12.9pp average uplift across 3,081 brands measured). Design for mobile-first, premium feel, health-forward content, and frictionless purchase flows.

---

## 8. Qualitative Community Themes

12 themes identified from qualitative research across user communities in the US, Brazil, Denmark, Japan, and online forums (Source: PMC multi-country qualitative study, Reddit/TikTok community analysis, RAND).

### Theme 1: Sense of Normalcy
**Description:** Users describe feeling "normal" around food for the first time — reduced obsessive food thoughts, ability to eat socially without anxiety.
**Frequency:** Very high | **Sentiment:** Positive
**Design implication:** Celebrate emotional milestones and quality-of-life wins, not just weight numbers.

### Theme 2: Medication Tinkering
**Description:** Users adjust doses, skip injections, split doses, or stockpile medication without medical guidance. Few follow prescribed titration schedules in real-world use.
**Frequency:** High | **Sentiment:** Mixed
**Design implication:** Dose tracking with gentle adherence nudges and doctor-sharing features. Don't be paternalistic — acknowledge user agency.

### Theme 3: Side Effect Endurance
**Description:** Many users willingly endure significant side effects (severe nausea, vomiting) to maintain weight loss. Viewed as acceptable trade-off.
**Frequency:** High | **Sentiment:** Resigned/Determined
**Design implication:** Symptom management toolkit integrated into the medication journey. Help users cope, don't just list warnings.

### Theme 4: Cost Anxiety
**Description:** Constant worry about insurance changes, copay increases, formulary switches, or losing access to medication entirely.
**Frequency:** Very high | **Sentiment:** Negative
**Design implication:** Cost alerts, savings program integration, price tracking over time, insurance change notifications.

### Theme 5: Weight Regain Fear
**Description:** Deep anxiety about gaining weight back if/when stopping medication. This fear persists even during active successful use.
**Frequency:** Very high | **Sentiment:** Negative/Anxious
**Design implication:** Transition planning tools, gradual tapering support, maintenance phase guidance, mental health check-ins.

### Theme 6: Unregulated Sourcing
**Description:** Users seek cheaper alternatives through compounding pharmacies, international purchases, peer-to-peer selling, or pop-up "weight loss" clinics.
**Frequency:** Moderate | **Sentiment:** Risky
**Design implication:** Verified pharmacy directory, safety information, legitimacy indicators.

### Theme 7: Social Media as Primary Info Source
**Description:** TikTok, Instagram, and Reddit are primary information sources, often spreading misinformation alongside helpful peer support. Pharmacists report unprecedented demand driven by social media.
**Frequency:** Very high | **Sentiment:** Mixed
**Design implication:** Evidence-based content hub designed with social-media-style engagement (short-form, visual, shareable).

### Theme 8: Disordered Eating Overlap
**Description:** Some users report entwinement with pre-existing eating disorder patterns. The appetite suppression can reinforce restrictive behaviors.
**Frequency:** Moderate | **Sentiment:** Concerning
**Design implication:** Screening questions during onboarding, mental health resource integration, avoid gamifying extreme restriction.

### Theme 9: Identity Shift
**Description:** Users grapple with changing body image, needing new wardrobes, shifting social dynamics, and questions about "who they are" post–weight loss.
**Frequency:** Moderate | **Sentiment:** Complex
**Design implication:** Holistic wellbeing tracking that goes beyond weight — mood, energy, social confidence, body image.

### Theme 10: Gendered Experience
**Description:** Women report more social pressure to use GLP-1s, experience more side effects, and are more likely to discuss openly. Men are less likely to discuss use or seek community support.
**Frequency:** High | **Sentiment:** Varied
**Design implication:** Gender-sensitive content and optionally separate community spaces. Don't assume a single user archetype.

### Theme 11: Doctor–Patient Tension
**Description:** Patients often feel more knowledgeable about GLP-1s than their healthcare providers. Frustration with gatekeeping, slow prescribing, and lack of provider expertise.
**Frequency:** Moderate | **Sentiment:** Frustrated
**Design implication:** Shareable patient summary for doctor visits, preparation guides, provider-matching features.

### Theme 12: Food Noise Reduction
**Description:** The dramatic quieting of constant food-related thoughts is a defining, often life-changing experience for users. Many describe it as the most significant benefit beyond weight loss.
**Frequency:** Very high | **Sentiment:** Very positive
**Design implication:** Track and visualize "food noise" changes over time. Use this language in product messaging — it resonates deeply.
