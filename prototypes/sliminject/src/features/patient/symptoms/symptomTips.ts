import type { SymptomEntry } from '../../../lib/supabase'

export interface SymptomTipSet {
  symptom: string
  tips: { heading: string; body: string }[]
  priority: number
}

export interface SelectedTip {
  symptom: string
  heading: string
  body: string
  priority: number
  variantIndex: number
}

/**
 * Static symptom → tip mapping, ordered by clinical priority.
 * Each symptom has 2–3 tip variants for rotation.
 */
export const SYMPTOM_TIPS: SymptomTipSet[] = [
  {
    symptom: 'Misselijkheid',
    tips: [
      { heading: 'Tip bij misselijkheid', body: 'Eet kleine, droge maaltijden en vermijd vette of sterk geurende gerechten. Dit helpt je maag tot rust te komen.' },
      { heading: 'Tip bij misselijkheid', body: 'Gember kan helpen — probeer gemberthee of een stukje verse gember. Drink tussendoor kleine slokjes water.' },
      { heading: 'Tip bij misselijkheid', body: 'Eet langzaam en neem kleinere porties. Misselijkheid neemt bij de meeste mensen na een paar weken af.' },
    ],
    priority: 1,
  },
  {
    symptom: 'Maagklachten',
    tips: [
      { heading: 'Tip bij maagklachten', body: 'Eet rustig en kauw goed. Kleinere maaltijden verspreid over de dag zijn beter dan drie grote.' },
      { heading: 'Tip bij maagklachten', body: 'Vermijd koolzuurhoudende dranken en zeer pittig eten. Kruidenthee zoals kamille kan verzachtend werken.' },
      { heading: 'Tip bij maagklachten', body: 'Probeer na het eten even rechtop te blijven zitten. Dit helpt je spijsvertering op gang.' },
    ],
    priority: 2,
  },
  {
    symptom: 'Vermoeidheid',
    tips: [
      { heading: 'Tip bij vermoeidheid', body: 'Zorg voor voldoende eiwitten in je maaltijden. Lichte beweging zoals een korte wandeling kan je energie verbeteren.' },
      { heading: 'Tip bij vermoeidheid', body: 'Drink genoeg water en probeer een vast slaapritme aan te houden. Je lichaam past zich aan — geef het de tijd.' },
      { heading: 'Tip bij vermoeidheid', body: 'Verdeel je activiteiten over de dag en plan rustmomenten in. Dit is normaal in de eerste weken.' },
    ],
    priority: 3,
  },
  {
    symptom: 'Hoofdpijn',
    tips: [
      { heading: 'Tip bij hoofdpijn', body: 'Drink voldoende water — uitdroging is een veelvoorkomende oorzaak van hoofdpijn bij gewichtsverlies.' },
      { heading: 'Tip bij hoofdpijn', body: 'Sla geen maaltijden over en zorg dat je genoeg eet. Een stabiele bloedsuiker helpt hoofdpijn voorkomen.' },
    ],
    priority: 4,
  },
  {
    symptom: 'Droge mond',
    tips: [
      { heading: 'Tip bij droge mond', body: 'Neem regelmatig kleine slokjes water. Suikervrije kauwgom kan de speekselproductie stimuleren.' },
      { heading: 'Tip bij droge mond', body: 'Vermijd cafeïne en alcohol — deze drogen extra uit. Een luchtbevochtiger in de slaapkamer kan ook helpen.' },
    ],
    priority: 5,
  },
  {
    symptom: 'Duizeligheid',
    tips: [
      { heading: 'Tip bij duizeligheid', body: 'Sta langzaam op vanuit zittende of liggende positie. Drink voldoende en sla geen maaltijden over.' },
      { heading: 'Tip bij duizeligheid', body: 'Eet regelmatig en houd je bloedsuiker stabiel. Als duizeligheid aanhoudt, bespreek het met je arts.' },
    ],
    priority: 6,
  },
  {
    symptom: 'Obstipatie',
    tips: [
      { heading: 'Tip bij obstipatie', body: 'Verhoog je vezelinname geleidelijk met groenten, fruit en volkoren producten. Drink daarbij extra water.' },
      { heading: 'Tip bij obstipatie', body: 'Dagelijkse beweging helpt je darmen op gang. Probeer een vast ritme aan te houden voor toiletbezoek.' },
    ],
    priority: 7,
  },
  {
    symptom: 'Haaruitval',
    tips: [
      { heading: 'Tip bij haaruitval', body: 'Licht haarverlies is normaal bij gewichtsverlies en is bijna altijd tijdelijk. Voldoende eiwitten en zink ondersteunen haargroei.' },
      { heading: 'Tip bij haaruitval', body: 'Zorg voor een gevarieerd dieet met voldoende vitamines. Je haar herstelt zodra je lichaam zich heeft aangepast.' },
    ],
    priority: 8,
  },
  {
    symptom: 'Injectieplaatsreactie',
    tips: [
      { heading: 'Tip bij injectieplaatsreactie', body: 'Wissel bij elke injectie van plek — buik, bovenbeen of bovenarm. Dit vermindert irritatie op één plek.' },
      { heading: 'Tip bij injectieplaatsreactie', body: 'Laat de injectievloeistof op kamertemperatuur komen voor gebruik. Dit kan ongemak verminderen.' },
    ],
    priority: 9,
  },
]

/**
 * Returns the highest-priority tip for the given symptoms that hasn't
 * been shown recently, with variant rotation.
 */
export function selectTip(
  loggedSymptomNames: string[],
  symptomEntries: SymptomEntry[],
  wasShownRecently: (symptom: string) => boolean,
  getVariantIndex?: (symptom: string) => number,
): SelectedTip | null {
  for (const tipSet of SYMPTOM_TIPS) {
    if (loggedSymptomNames.includes(tipSet.symptom) && !wasShownRecently(tipSet.symptom)) {
      const variantIndex = getVariantIndex
        ? getVariantIndex(tipSet.symptom) % tipSet.tips.length
        : 0
      const variant = tipSet.tips[variantIndex]
      return {
        symptom: tipSet.symptom,
        heading: variant.heading,
        body: variant.body,
        priority: tipSet.priority,
        variantIndex,
      }
    }
  }
  return null
}
