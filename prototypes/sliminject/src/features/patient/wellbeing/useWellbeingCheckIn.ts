import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'
import { useWellbeingHistory } from './useWellbeingHistory'

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export interface CheckInData {
  energy_score?: number | null
  mood_score?: number | null
  confidence_score?: number | null
  note?: string | null
}

export function useWellbeingCheckIn() {
  const { user } = useAuth()
  const { checkins, loading, refresh } = useWellbeingHistory()
  const [submitting, setSubmitting] = useState(false)

  const mostRecent = checkins[0] ?? null
  const isDue =
    !loading &&
    (mostRecent === null ||
      Date.now() - new Date(mostRecent.submitted_at).getTime() >= MS_PER_WEEK)

  async function submitCheckIn(data: CheckInData) {
    if (!user) return
    // Client-side validation: at least one score must be non-null
    if (data.energy_score == null && data.mood_score == null && data.confidence_score == null) return

    setSubmitting(true)
    const { error } = await supabase
      .from('weekly_wellbeing_checkins')
      .insert({ patient_id: user.id, ...data })
    setSubmitting(false)

    if (error) {
      toast.error('Opslaan mislukt. Probeer het opnieuw.')
      return
    }
    await refresh()
  }

  return { isDue, submitting, submitCheckIn, checkins, loading }
}
