import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface DosageEntry {
  id: string
  dose_mg: number
  start_date: string
  notes: string | null
}

export function usePatientDosageSchedule() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DosageEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('dosage_schedule_entries')
      .select('id, dose_mg, start_date, notes')
      .eq('patient_id', user.id)
      .order('start_date', { ascending: true })
    if (error) console.error(error)
    setEntries(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const past = entries.filter(e => new Date(e.start_date) < today)
  const current = [...entries].reverse().find(e => new Date(e.start_date) <= today) ?? null
  const upcoming = entries.filter(e => new Date(e.start_date) > today)

  const nextIncrease = upcoming[0] ?? null
  const daysUntilNext = nextIncrease
    ? Math.ceil((new Date(nextIncrease.start_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return { entries, past, current, upcoming, nextIncrease, daysUntilNext, loading }
}
