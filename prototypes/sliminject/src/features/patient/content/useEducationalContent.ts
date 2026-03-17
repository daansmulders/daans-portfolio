import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'
import { CONTENT_GROUPS, getGroupForContent } from './contentGroups'

export interface ContentItem {
  id: string
  title: string
  body_markdown: string | null
  video_url: string | null
  content_type: 'article' | 'video'
  viewed: boolean
  groupId: string | null
  groupOrder: number
}

export function useEducationalContent() {
  const { user } = useAuth()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContent = useCallback(async () => {
    if (!user) return

    // Haal getriggerde content op voor deze patiënt via progress entries en schema
    const [entriesRes, scheduleRes, viewedRes, triggersRes, contentRes] = await Promise.all([
      supabase.from('progress_entries').select('symptoms, logged_at').eq('patient_id', user.id),
      supabase.from('dosage_schedule_entries').select('start_date').eq('patient_id', user.id),
      supabase.from('patient_content_view').select('content_id').eq('patient_id', user.id),
      supabase.from('content_triggers').select('*'),
      supabase.from('educational_content').select('*'),
    ])

    const entries = entriesRes.data ?? []
    const schedule = scheduleRes.data ?? []
    const viewedIds = new Set((viewedRes.data ?? []).map((v: any) => v.content_id))
    const triggers = triggersRes.data ?? []
    const content = contentRes.data ?? []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Bereken welke events getriggerd zijn
    const triggeredContentIds = new Set<string>()

    for (const trigger of triggers) {
      switch (trigger.event_type) {
        case 'SYMPTOM_FIRST_LOG': {
          const symptom = trigger.event_parameter
          const hasSymptom = entries.some((e: any) => e.symptoms?.includes(symptom))
          if (hasSymptom) triggeredContentIds.add(trigger.content_id)
          break
        }
        case 'DOSAGE_INCREASE': {
          // Trigger als er een dosisverhoging in het verleden zit (niet de eerste)
          const past = schedule.filter((e: any) => new Date(e.start_date) <= today)
          if (past.length > 1) triggeredContentIds.add(trigger.content_id)
          break
        }
        case 'TREATMENT_WEEK': {
          const weeks = parseInt(trigger.event_parameter ?? '0')
          if (entries.length > 0) {
            const firstEntry = entries.reduce((a: any, b: any) =>
              a.logged_at < b.logged_at ? a : b
            )
            const weeksSinceStart = Math.floor(
              (today.getTime() - new Date(firstEntry.logged_at).getTime()) / (1000 * 60 * 60 * 24 * 7)
            )
            if (weeksSinceStart >= weeks) triggeredContentIds.add(trigger.content_id)
          }
          break
        }
        case 'WEIGHT_MILESTONE':
        case 'WEIGHT_PLATEAU':
          // Vereenvoudigd voor prototype: trigger als er 5+ metingen zijn
          if (entries.length >= 5) triggeredContentIds.add(trigger.content_id)
          break
      }
    }

    // Sort by group order: "Start hier" first, then by position within group, ungrouped last
    const triggered: ContentItem[] = content
      .filter((c: any) => triggeredContentIds.has(c.id))
      .map((c: any) => {
        const group = getGroupForContent(c.id)
        const groupIndex = group ? CONTENT_GROUPS.findIndex(g => g.id === group.id) : 999
        const posInGroup = group ? group.contentIds.indexOf(c.id) : 999
        return {
          ...c,
          viewed: viewedIds.has(c.id),
          groupId: group?.id ?? null,
          groupOrder: groupIndex * 100 + posInGroup,
        }
      })
      .sort((a: ContentItem, b: ContentItem) => a.groupOrder - b.groupOrder)

    setItems(triggered)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchContent() }, [fetchContent])

  async function markViewed(contentId: string) {
    if (!user) return
    await supabase
      .from('patient_content_view')
      .upsert({ patient_id: user.id, content_id: contentId })
    setItems(prev => prev.map(i => i.id === contentId ? { ...i, viewed: true } : i))
  }

  const newCount = items.filter(i => !i.viewed).length

  return { items, loading, markViewed, newCount }
}
