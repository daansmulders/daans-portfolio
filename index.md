---
layout: default
title: "Portfolio"
---

I’m based The Hague, The Netherlands. I have 10 years of experience designing digital experiences from idea to optimisation in different contexts. Currently at Nationale-Nederlanden. 

<!-- <span class="start-date">2023</span>       
<span class="start-date">2021</span>**Powerly**   
<span class="start-date">2018</span>**Werkspot**  
<span class="start-date">2017</span>**Ace & Tate**  
<span class="start-date">2014</span>**funda**   -->


## A few things I’ve worked on

<ul class="project-list">
  {% assign sorted_projects = site.projects | sort: 'year' | reverse %}
  {% for project in sorted_projects %}
    <li class="project-list-item">
      <a href="{{ project.url | relative_url }}">
        <h2>{{ project.title }}</h2>
      </a>
      <p class="project-list-meta">
        {{ project.company }} · {{ project.role }} · {{ project.year }}
      </p>
      <p class="project-list-summary">
        {{ project.summary }}
      </p>
    </li>
  {% endfor %}
</ul>
