---
layout: default
title: "Portfolio"
---
Based in The Hague, The Netherlands. For the past 10+ years I’ve designed digital experiences for platforms in finance, sustainability, marketplaces and retail. I turn complex journeys into clear, human-friendly products.  

Previously at funda, Ace & Tate, Werkspot, Powerly — now at Nationale-Nederlanden.

<!-- <span class="start-date">2023</span>       
<span class="start-date">2021</span>**Powerly**   
<span class="start-date">2018</span>**Werkspot**  
<span class="start-date">2017</span>**Ace & Tate**  
<span class="start-date">2014</span>**funda**   -->

A few things I've worked on ↓

<div class="case-grid">
  {% assign sorted_projects = site.projects | sort: 'year' | reverse %}
  {% for project in sorted_projects %}
    <a href="{{ project.url | relative_url }}" class="case-card">
      <div class="case-card__meta">
        {{ project.company }} · {{ project.role }} · {{ project.year }}
      </div>
      <h2 class="case-card__title">{{ project.title }}</h2>
      <p class="case-card__summary">{{ project.summary }}</p>
    </a>
  {% endfor %}
</div>

