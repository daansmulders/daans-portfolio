---
layout: v2-project
title: "Improving conversion through better advice on sustainable measures"
year: 2023
company: "Powerly"
role: "UX / Product Designer"
summary: "The Woningcheck combines a few homeowner details with public housing data and a private possibilities-and-savings API to generate personalized sustainable measures, savings, and a next step: booking a call with a sustainability expert. I researched how different homeowners used it, then redesigned it for accuracy and trust."
hero_image: "/assets/images/powerly-woningcheck/form-step-energy-costs.png"
---

<div class="project-intro-grid">
  <div>
    <h4>Goal</h4>
    <p>Improve the Woningcheck so more homeowners feel confident to book a call with a sustainability expert — ultimately increasing sustainable installations through Powerly.</p>
  </div>
  <div>
    <h4>Outcome</h4>
    <p>Conversion moved in the right direction after launch. Powerly didn't stay operational long enough afterward for the data to become fully conclusive — but the signal was real.</p>
  </div>
  <div>
    <h4>My role</h4>
    <p>Research, UX design, concept development, implementation guidance.</p>
  </div>
  <div>
    <h4>Team</h4>
    <p>Product manager, developers, sustainability experts, marketing.</p>
  </div>
</div>

Powerly helped homeowners figure out what sustainable measures made sense for their home, and guided them through actually installing them. The Woningcheck was the front door to that: answer a few questions, get a personalized set of measures, expected savings, and — if it looked worth it — a next step of talking to a sustainability expert.

<figure>
  <img src="{{ '/assets/images/powerly-woningcheck/cover.png' | relative_url }}" loading="lazy" decoding="async" alt="Woningcheck entry screen asking for postcode and house number">
  <figcaption>The entry point: postcode and house number, then straight into personalized advice.</figcaption>
</figure>

## Context

The Woningcheck combined public housing data with a private API that calculated implementation possibilities and savings for a specific address. But part of what fed that calculation still had to come from the homeowner — and homeowners often don't know basic facts about their own house, like what kind of insulation is behind the walls. That's a hard trade-off by design: ask more, and fewer people finish; ask less, and the advice gets shakier.

Before this project, it leaned too far toward "less." Recommendations were sometimes generic, occasionally just wrong for the specific house, and that was enough to break trust. If the advice didn't feel like it was actually about *your* house, why would you book a call to talk about it?

## Understanding homeowners

Through interviews, usability testing, and analytics, two groups became clear, and they wanted different things from the same tool.

Homeowners new to sustainability didn't know their own home details — energy label, insulation, none of it — and didn't know the terminology either. They needed the tool to meet them where they were: "What's even possible for a house like mine?"

Homeowners who'd already started researching — usually because they had solar panels or a heat pump in mind — needed something sharper: was it technically possible, was it financially worth it, and what would it actually cost to get installed.

Both groups needed the same underlying thing: advice specific enough to trust, not a generic checklist.

## The real design problem

The interesting part of this project wasn't any single screen — it was a tension running underneath all of them. The Woningcheck's accuracy depended on pushing the private possibilities-and-savings API as hard as it could go: the more precisely we could feed it, the better the advice. But part of that input still had to come from a homeowner who didn't know their wall-insulation type off the top of their head, filling in a form on their phone.

There was a business stake in this too: Powerly needed more of these visits to end in a booked call. Pushing for more data up front might have made the advice sharper, but it would have cost us exactly the people we needed to convert.

Every design decision on this project came back to the same question: how do you get advice that's actually worth trusting out of input you know won't be perfect — without losing the person along the way?

## Meeting people where their knowledge actually was

<div class="case-section">
  <div class="case-text">
    <h3>Pre-filling what we could already infer</h3>
    <p>
      For homeowners who didn't know their own home's details, we pre-filled as much as the housing data would support — build year, floor area, existing insulation estimates — so someone who changed nothing still got a reasonably accurate result.
    </p>
    <p>
      Some fields couldn't be solved this way. Insulation thickness, for instance, is genuinely hard to answer even for homeowners who know their house well, and the input format for that field was dictated by the API we relied on for the calculation. That was a real constraint — I didn't have a clean answer for it, and neither did the team.
    </p>
  </div>
  <figure class="case-media">
    <img src="{{ '/assets/images/powerly-woningcheck/form-step-additional-details.png' | relative_url }}" loading="lazy" decoding="async" alt="Additional details form step with most fields pre-filled from housing data">
    <figcaption>Most of the technical detail pre-filled — the homeowner only had to correct what didn't match.</figcaption>
  </figure>
</div>

<div class="case-section">
  <div class="case-text">
    <h3>Letting people opt out of numbers they didn't have</h3>
    <p>
      Almost nobody knows their annual gas and electricity use off the top of their head — it's something you'd have to go look up. Requiring it outright would have meant losing people right at the step that mattered most for accuracy.
    </p>
    <p>
      So we added an estimate option, calculated from what the homeowner had already told us. It was less precise than a real meter reading, but it kept the flow moving for people who wanted to explore their options before doing any lookups — which, for the homeowners just starting out, was most of them.
    </p>
  </div>
  <figure class="case-media">
    <img src="{{ '/assets/images/powerly-woningcheck/form-step-energy-costs.png' | relative_url }}" loading="lazy" decoding="async" alt="Energy usage form step showing manual entry versus an estimate option">
    <figcaption>Enter your own numbers, or let the tool estimate them from what it already knows.</figcaption>
  </figure>
</div>

## Making the result worth acting on

Research showed the biggest driver for actually installing sustainable measures was money — what it would save, what it would cost, what it would do to the home's value. So that's what the results screen leads with: savings per year, total cost, CO₂ reduction, the effect on home value, all specific to that address.

<figure>
  <img src="{{ '/assets/images/powerly-woningcheck/results.png' | relative_url }}" loading="lazy" decoding="async" alt="Results screen showing savings, cost, CO2 reduction and per-measure breakdowns with video explainers">
  <figcaption>A real result: €3.000 saved per year, 75% CO₂ reduction, broken down by measure.</figcaption>
</figure>

Underneath the summary, I structured which measures to consider and in what order. Usability testing had shown homeowners getting stuck at this exact point — intimidated by a wall of possible measures with no sense of where to start — so the list is ordered by what actually makes sense to do first, not just listed alphabetically or by savings.

For anyone unfamiliar with a specific measure, there's a short video explaining it. And for anyone who already knew what they wanted, there's a direct path to request a quote from an installation partner — no need to go through a call first if you didn't need one.

## Getting to the call

<figure>
  <img src="{{ '/assets/images/powerly-woningcheck/create-appointment.png' | relative_url }}" loading="lazy" decoding="async" alt="Appointment booking flow: email lookup, scheduling form, and confirmation screen">
  <figcaption>Email lookup, a fast way to grab a slot, and a confirmation you could actually find again later.</figcaption>
</figure>

Once someone was ready to talk to an expert, I wanted that step to have as little friction as the rest of the flow. It starts with an email lookup — if someone had already been in touch with Powerly before, the form got shorter. Scheduling skips a traditional calendar in favor of the next available days, grouped into morning and afternoon slots, since most people wanted to talk while the topic was still fresh. And the confirmation screen doubles as a way back into their own results, with a link emailed to them so they could find it again.

## Outcome

Conversion moved in the direction we wanted after this shipped — homeowners were booking more calls, and the calls that happened were with people who'd already seen advice specific enough to be worth discussing. I don't have a clean before/after number to point to: Powerly didn't stay operational long enough after launch for the data to become fully conclusive. But the signal was real, not assumed.

## Closing thoughts

None of the decisions here stood alone. Pre-filling a field was a business call as much as a design one — every extra question lost people, but weak data lost trust just as fast. The estimate option only existed because the API needed numbers most homeowners didn't have. Every piece touched every other piece, and getting the Woningcheck right meant working all of them at once.
