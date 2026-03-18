# Data Model: Collapsed Entry Card Indicators

**Feature**: 011-collapsed-card-indicators
**Date**: 2026-03-18

## Entity Changes

None. This feature is display-only — no data model modifications.

## Data Used (read-only, from ProgressEntry)

| Field | Used for |
|-------|----------|
| symptoms | Side-effect dot: present if length > 0 |
| symptoms[].severity | Side-effect dot colour: amber if any ≥ 4, brand if all ≤ 3 |
| hunger_score | Score summary: shown as "H{n}" if non-null |
| food_noise_score | Score summary: shown as "V{n}" if non-null |

## Display Logic

- **Side-effect dot**: `symptoms.length > 0` → render dot. `symptoms.some(s => s.severity >= 4)` → amber, else brand green.
- **Score summary**: render if `hunger_score != null || food_noise_score != null`. Show each present score as abbreviated text.
