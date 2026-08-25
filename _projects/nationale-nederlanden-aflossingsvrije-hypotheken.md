---
layout: v2-project
title: "Preparing the company to responsibly support customers with interest-only mortgages"
year: 2025
company: "Nationale-Nederlanden"
role: "UX / Product Designer"
summary: "Nationale-Nederlanden needed a strategy for customers with interest-only mortgages who might be at risk at the end of their term. I ran a design sprint with a colleague to find the real problem, then iterated on the concept that came out of it — part of which was later built into mijnNN."
hero_image: "/assets/images/nationale-nederlanden-aflossingsvrije-hypotheken/aflossingsvrij-storyboard-end.png"
---

<div class="project-intro-grid">
  <div>
    <h4>Goal</h4>
    <p>Align teams around a shared understanding of the interest-only mortgage journey, and find a strategy that supports customers earlier — without making the process more expensive for the business.</p>
  </div>
  <div>
    <h4>Outcome</h4>
    <p>A direction and full end-to-end storyboard that aligned teams and clarified next steps, handed over for development. A small part of the resulting tooling was later implemented in mijnNN.</p>
  </div>
  <div>
    <h4>My role</h4>
    <p>Co-facilitated the design sprint. A colleague produced the first draft of the concept; I took over and iterated on it while he was away, then handed it back for him to bring to a handover-ready state.</p>
  </div>
  <div>
    <h4>Team</h4>
    <p>Product, content, UX, marketing, business stakeholders.</p>
  </div>
</div>

Interest-only mortgages don't get paid down monthly — the full amount is due at the end of the term, in one go, either by paying it off, selling the home, or taking out a new mortgage. Stricter European and Dutch regulation meant Nationale-Nederlanden now had to serve these customers more intensively than a letter and a phone call.

## Context

Before this project, customers with an interest-only mortgage — especially those flagged as higher-risk — were contacted by letter or phone, then pointed to an online tool where they filled in income and pension details so NN could assess their risk at term's end.

Internally, the process behind that tool was harder to untangle than it looked from the outside: years of documentation, regulatory requirements layered on top of each other, and no single shared picture of how the journey actually worked end to end. Before the sprint, I went through the available material and put together a briefing deck so the whole team could start from the same baseline.

The problem was big enough, and spread across enough departments, that we didn't think a few workshops on existing designs would get us anywhere. We ran a four-day design sprint instead, adapted from the classic format to fit — a fast way to get a cross-functional group to a shared direction rather than a UI patch.

## Finding the real problem

The sprint reframed the starting question into one sentence everyone could work from: how do we track, report, and improve reach and conversion of interest-only customer activation, cost-efficiently, for customers within any AFM risk category — so we avoid financial risk for both the customer and NN by getting vulnerable customers to take the right action at the right time.

<figure>
  <img src="{{ '/assets/images/nationale-nederlanden-aflossingsvrije-hypotheken/problem-areas.png' | relative_url }}" loading="lazy" decoding="async" alt="Workshop board showing voted problem statements and root-cause trees from the design sprint">
  <figcaption>The team's problem statements, voted and ranked, then dug into with a 5 Whys exercise.</figcaption>
</figure>

From that question, the team generated problem statements and voted on which ones actually mattered. "We are not reaching enough customers in one or multiple segments" won by a wide margin — 9 votes, more than double anything else on the board. Close behind: whether NN could even be confident an identified risk was a real risk, and whether the whole process was cost-efficient enough to sustain.

We took the top-voted problems and ran a 5 Whys on each, clustering what came out of it. The reach problem traced back to things like a lacking data strategy and no system in place to gather the details that would actually identify who needed help. The trust problem traced back to unclear business modeling and inefficient processes further upstream. None of these were UI problems — they were structural ones, which is exactly why a sprint made more sense than a redesign.

## From direction to concept

Coming out of the sprint, I developed the direction into detailed storyboards and concept mockups — a way for stakeholders to see the experience end-to-end and actually argue about trade-offs, rather than approve an abstract strategy.

<figure>
  <img src="{{ '/assets/images/nationale-nederlanden-aflossingsvrije-hypotheken/aflossingsvrij-storyboard-full.png' | relative_url }}" loading="lazy" decoding="async" alt="Full end-to-end storyboard of the interest-only mortgage journey">
  <figcaption>The full journey storyboard, used to walk stakeholders through the proposed experience and surface disagreements early.</figcaption>
</figure>

One concrete piece to come out of this was a short self-service scan: about five minutes, ending in a plain-language breakdown of a customer's actual mortgage — how much was annuity, how much was interest-only — and a direct question about how they expected to repay it at the end of the term.

<figure>
  <img src="{{ '/assets/images/nationale-nederlanden-aflossingsvrije-hypotheken/tool-concept.png' | relative_url }}" loading="lazy" decoding="async" alt="Concept screens for a short mortgage scan tool">
  <figcaption>The scan: a five-minute flow ending in a plain breakdown of the mortgage and a direct question about the customer's plan.</figcaption>
</figure>

## Picking up where a colleague left off

A colleague produced the first draft of this concept in Figma, then went on holiday. I took it over for that stretch and iterated on his designs — refining the flow, tightening specific screens, working through edge cases he hadn't gotten to yet.

<figure>
  <img src="{{ '/assets/images/nationale-nederlanden-aflossingsvrije-hypotheken/figma-overview.png' | relative_url }}" loading="lazy" decoding="async" alt="Figma overview of the full mortgage flow prototype with dated update annotations">
  <figcaption>The flow as it grew during that stretch — one of several dated updates from that period.</figcaption>
</figure>

When he came back, he picked the file back up and carried it to a handover-ready state for development. In parallel, our content and communication teams reworked the letters, emails, and call scripts customers actually received, so the whole journey got clearer — not just the tool sitting at the end of it.

## Outcome

The sprint and the direction that came out of it aligned teams that had been working from different pictures of the same journey, and the storyboard gave development a concrete starting point instead of a strategy document. A small part of the resulting tooling was later built and shipped into mijnNN, NN's customer portal.

## Closing thoughts

This project was less about any single screen and more about getting a room full of people from different departments to agree on what the actual problem was before anyone started designing a solution to it. The sprint did that. What we built afterward was smaller than the ambition of the sprint itself — which is honest, and also fairly normal for this kind of work.
