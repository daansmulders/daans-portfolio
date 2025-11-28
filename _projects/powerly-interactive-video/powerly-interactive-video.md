---
layout: projects
title: "Interactive video concept"
year: 2024
company: "Powerly"
role: "UX / Product Designer"
summary: "I designed and tested an interactive video prototype to help homeowners understand their sustainable options earlier in the journey. Reducing dependency on phone calls and making expert advice more scalable."
hero_image: "/assets/images/powerly-interactive-video/interactive-video-hero.png"
---

## Context

For many homeowners, the journey toward making their home more sustainable starts from a place of uncertainty. Powerly’s Woningcheck helps them understand their options, but usually only a call with a sustainability experts gives them enough confidence to continue the process.

This means that our sustainability experts spent a large part of their phone calls answering the same high-level questions again and again. These calls were helpful, but also expensive and difficult to scale.

We asked ourselves:
Can we answer users’ biggest questions earlier and at scale without losing trust or clarity?

## My role

UX / Product Designer
Concept creation, research setup, prototype design, script structure, stakeholder alignment.

## The challenge

We saw two patterns:

* Users arrive with big, foundational questions
    * “Waar moet ik beginnen?”
    * “Kan dit in mijn huis?”
    * “Welke warmtepomp past bij mijn situatie?”
    * “Kan ik helemaal van het gas af?”
    * “Hoe lang duurt de levering?”
    * “Krijg ik subsidie?”

Some start from zero, some have already researched a lot.
But almost everyone needed clarity from our experts before they felt ready to continue.

* Experts repeat the same information in every call. With The first half of the call more scripted:
    * Explanation of the Trias Energetica
    * What insulation levels matter
    * Which warmtepomp types exist
    * What’s realistic for their house
    * What Powerly does and doesn’t do

This meant:

* Long, repetitive calls
* Limited scale
* Users waiting days for clarity
* High operational cost

A new approach could help both sides.

## The hypothesis

If we inform users through personalized, interactive video, they will understand their possibilities earlier and feel more ready to take the next step with Powerly — even before a phone call.

We wanted to learn whether:

* Users value this way of getting information
* Video helps them feel more confident or prepared
* They would take a next step (complete advice or installation)
* This could replace part of the call or reduce call time


## What homeowners need
From previous research and internal expertise, I mapped the information a user needs to receive good advice.

### When they start from zero they need to know:

* How do I start making my home more sustainable?
* What steps make sense for a house like mine?
* What’s possible — and what isn’t?

This led us to structure the content around the Trias Energetica, a simple but powerful way to explain sustainable choices.


### When they already know what they want

If someone already wants:

* A heatpump
* To go gas-free
* Insulation
* or a mix of things

Then they need more specific information:

* Rc-waardes
* Space requirements
* Type of heating
* Isolatieniveau
* Realistic next steps

This helped us define which video paths needed deeper content.


!['High level journey of knowledge in sustainable measures']({{ site.baseurl }}/assets/images/powerly-interactive-video/journey-high-level.png)


## Concept development

!['High level video flow']({{ site.baseurl }}/assets/images/powerly-interactive-video/video-flow.png)


Based on these insights, I explored whether a short, interactive video format could guide users through the information they needed—at their own pace, and without waiting for a call.

To test the concept, I built an interactive prototype that combined short recorded videos with a lightweight question flow. After watching an introduction, users answered a few simple questions about their home. Based on their answers, they could choose which measures they wanted to explore—such as insulation or different types of heat pumps—and then dive deeper with follow-up questions that made the next video more relevant to their situation.

Each choice shaped what they saw next, creating a mix of branching video and conditional logic. Throughout the flow, users could continue exploring or move directly into the Woningcheck or complete advice. The prototype was simple, but realistic enough to understand whether this approach felt helpful, trustworthy, and easy to navigate.


<div class="video-grid">
    <div class="video-item">
        <div class="project-video" data-autoplay>
            <video
            class="project-video__media"
            src="/assets/images/powerly-interactive-video/prototype-2.mp4"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            ></video>
            <button class="project-video__pause">❚❚</button>
        </div>
        <p class="video-caption">First interactive video prototype.</p>
    </div>

<div class='video-item'>
        <div class="project-video" data-autoplay>
            <video
            class="project-video__media"
            src="/assets/images/powerly-interactive-video/prototype-1.mp4"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            ></video>
            <button class="project-video__pause">❚❚</button>
        </div>
        <p class="video-caption">Second version, used in concept test.</p>
    </div>
</div>


## Research

To understand whether this approach could help homeowners, I tested the prototype through moderated sessions with people who had just scheduled a free advice call. These users were ideal because they were actively thinking about sustainability, had real questions, and were about to experience the existing phone-first process.

I first asked participants about their home, their goals, and the questions they hoped to answer. Then I let them walk through the prototype in their own way. Their choices and reactions helped reveal whether the combination of lightweight inputs and tailored video actually gave them the clarity they needed.

After the walkthrough, I asked a series of focused questions:
* Did this way of learning work for them?
* Would they prefer it over waiting for a phone call?
* Did it increase their confidence?
* Would they take a next step, like speaking to an intallation partner, after this flow without a free advice call first?

## Findings and next steps

Overall, users responded positively to the interactive format. Many said that having short, tailored videos helped them understand their options more quickly than reading text or waiting for a call. The combination of a few simple questions followed by more relevant video content felt intuitive and gave them more confidence about what was possible in their home.

The prototype also revealed a pattern: people appreciated getting information “in their own time.” Several participants described the videos as “clear,” “digestible,” and “a good first step before talking to someone.” Most said they would continue exploring the flow if it were available on the live website.

However, while the user feedback encouraged us to keep exploring this idea, two practical challenges emerged.
From a technical standpoint, the APIs behind the Woningcheck weren’t yet flexible enough to power a fully personalized video flow. And from a business perspective, producing these videos in a professional way required time and resources that weren’t yet budgeted.

So while the concept showed promise with users, we learned that it wasn’t feasible to implement immediately.

## Closing thoughts

We didn’t launch this concept, but the exploration was valuable. It strengthened our understanding of homeowners, opened up new prototyping approaches, and highlighted a direction worth exploring further.

<script src="/assets/js/video-control.js"></script>
