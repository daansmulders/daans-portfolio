import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface WellbeingCheckIn {
  id: string
  patient_id: string
  submitted_at: string
  energy_score: number | null
  mood_score: number | null
  confidence_score: number | null
  note: string | null
}

export function useWellbeingHistory(patientId?: string) {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState<WellbeingCheckIn[]>([])
  const [loading, setLoading] = useState(true)

  const id = patientId ?? user?.id

  const fetchCheckins = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('weekly_wellbeing_checkins')
      .select('*')
      .eq('patient_id', id)
      .order('submitted_at', { ascending: false })
    setCheckins(data ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchCheckins() }, [fetchCheckins])

  return { checkins, loading, refresh: fetchCheckins }
}
