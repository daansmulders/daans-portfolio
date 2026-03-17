export interface SymptomTip {
  symptom: string
  tip: string
  priority: number
}

/**
 * Static symptom → tip mapping, ordered by clinical priority.
 * Symptom keys match the display names from the log form chips (nl.ts).
 */
export const SYMPTOM_TIPS: SymptomTip[] = [
  {
    symptom: 'Misselijkheid',
    tip: 'Eet kleine, droge maaltijden. Gember kan helpen. Vermijd vette of sterk geurende gerechten.',
    priority: 1,
  },
  {
    symptom: 'Vermoeidheid',
    tip: 'Zorg voor voldoende eiwitten. Lichte beweging kan helpen.',
    priority: 2,
  },
  {
    symptom: 'Diarree',
    tip: 'Drink veel water. Beperk tijdelijk zuivel en vezelrijke voeding.',
    priority: 3,
  },
  {
    symptom: 'Obstipatie',
    tip: 'Verhoog je vezelinname geleidelijk en drink meer water.',
    priority: 4,
  },
  {
    symptom: 'Haaruitval',
    tip: 'Tijdelijk en normaal bij gewichtsverlies. Voldoende eiwitten en zink kunnen helpen.',
    priority: 5,
  },
  {
    symptom: 'Injectieplaatsreactie',
    tip: 'Wissel bij elke injectie van plek.',
    priority: 6,
  },
]

/**
 * Returns the highest-priority tip for the given symptoms that hasn't
 * been shown recently, or null if none qualifies.
 */
export function selectTip(
  loggedSymptoms: string[],
  wasShownRecently: (symptom: string) => boolean,
): SymptomTip | null {
  for (const tip of SYMPTOM_TIPS) {
    if (loggedSymptoms.includes(tip.symptom) && !wasShownRecently(tip.symptom)) {
      return tip
    }
  }
  return null
}
