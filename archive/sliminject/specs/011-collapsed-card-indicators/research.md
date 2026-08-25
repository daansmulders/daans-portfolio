# Research: Collapsed Entry Card Indicators

**Feature**: 011-collapsed-card-indicators
**Date**: 2026-03-18

## Decision 1: Indicator placement in the row

**Decision**: Place indicators between the date (left) and weight+chevron (right). Side-effect dot first, then score summary.

**Rationale**: The date anchors the left side and weight+chevron anchor the right. Indicators in the middle area fill the visual gap without disrupting the existing layout. The dot is smallest so it goes first; the score summary is slightly wider so it goes second, closer to the weight value it contextually relates to.

**Alternatives considered**:
- Indicators after the date (would push date too far left on narrow screens)
- Indicators before the chevron (would crowd the right side with weight + scores + chevron)

## Decision 2: Score summary format

**Decision**: Use abbreviated text format: "H3" for hunger 3/5, "V2" for food noise 2/5. Muted colour, small font size.

**Rationale**: Single-letter abbreviations are the most compact. "H" for Honger and "V" for Voedselruis are immediately recognisable in Dutch context. The "/5" suffix is omitted since patients already know the 1–5 scale from the log form. Muted colour ensures scores don't compete with weight for visual prominence.

**Alternatives considered**:
- Full label badges (too wide for collapsed row — "Honger 3/5" takes ~80px)
- Numeric dots/circles (harder to distinguish what each number means)
- Mini bar charts (over-engineered for a collapsed indicator)
