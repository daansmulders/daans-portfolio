# Data Model: Side Effect Support

## No schema changes

This feature is entirely client-side. No new tables, columns, or migrations.

## Static data

### Symptom tip map

A static mapping defined in application code. Not stored in a database.

| Symptom key | Display name | Tip text | Priority |
|-------------|-------------|----------|----------|
| `Misselijkheid` | Misselijkheid | Eet kleine, droge maaltijden. Gember kan helpen. Vermijd vette of sterk geurende gerechten. | 1 (highest) |
| `Vermoeidheid` | Vermoeidheid | Zorg voor voldoende eiwitten. Lichte beweging kan helpen. | 2 |
| `Diarree` | Diarree | Drink veel water. Beperk tijdelijk zuivel en vezelrijke voeding. | 3 |
| `Obstipatie` | Obstipatie | Verhoog je vezelinname geleidelijk en drink meer water. | 4 |
| `Haaruitval` | Haaruitval | Tijdelijk en normaal bij gewichtsverlies. Voldoende eiwitten en zink kunnen helpen. | 5 |
| `Injectieplaatsreactie` | Injectieplaatsreactie | Wissel bij elke injectie van plek. | 6 |

**Note**: Symptom keys must match the display names used in the log form's symptom chips. The existing log form uses `nl.symptoom_misselijkheid` etc. Two new symptoms (Haaruitval, Injectieplaatsreactie) need to be added to the form and i18n file.

### Proactive tip content

| Context | Tip text |
|---------|----------|
| First injection ever | Dit is je eerste injectie. Misselijkheid is normaal de eerste dagen — eet licht en drink voldoende water. |
| Dose increase (first/second injection at new dose) | Nieuwe dosis — bijwerkingen zoals misselijkheid kunnen tijdelijk terugkomen. Dit is normaal en trekt meestal bij. |

## Client-side persistence

### localStorage keys

| Key pattern | Value | Purpose |
|-------------|-------|---------|
| `sliminject_tip_last_{symptomKey}` | UTC timestamp (ms) | Tracks when a tip was last shown for this symptom. Used to enforce 7-day throttle. |

Example: `sliminject_tip_last_Misselijkheid` = `1742310000000`
