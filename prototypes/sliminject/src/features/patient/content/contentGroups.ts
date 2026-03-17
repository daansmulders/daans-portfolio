export interface ContentGroup {
  id: string
  label: string
  isRecommendedStart: boolean
  /** Ordered list of content IDs — items not in any group appear ungrouped */
  contentIds: string[]
}

/**
 * Static curriculum configuration.
 * Content IDs map to rows in the `educational_content` Supabase table.
 * This avoids a DB migration for the prototype while still enabling ordered display.
 */
export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: 'start',
    label: 'Start hier',
    isRecommendedStart: true,
    contentIds: [
      'intro-glp1',
      'hoe-werkt-ozempic',
      'eerste-injectie',
    ],
  },
  {
    id: 'bijwerkingen',
    label: 'Bijwerkingen',
    isRecommendedStart: false,
    contentIds: [
      'misselijkheid-tips',
      'maagklachten',
      'vermoeidheid',
    ],
  },
  {
    id: 'leefstijl',
    label: 'Voeding & leefstijl',
    isRecommendedStart: false,
    contentIds: [
      'eetpatroon-glp1',
      'beweging-tips',
      'alcohol-glp1',
    ],
  },
]

/** Returns the group for a given content ID, or null if ungrouped */
export function getGroupForContent(contentId: string): ContentGroup | null {
  return CONTENT_GROUPS.find(g => g.contentIds.includes(contentId)) ?? null
}
