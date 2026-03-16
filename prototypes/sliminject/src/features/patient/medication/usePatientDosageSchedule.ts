import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface DosageEntry {
  id: string
  dose_mg: number
  start_date: string
  notes: string | null
  drug_type_id: string | null
  drug_type_name: string | null
  status: 'draft' | 'approved'
}

export function usePatientDosageSchedule() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DosageEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('dosage_schedule_entries')
      .select('id, dose_mg, start_date, notes, status, drug_type_id, drug_types(name)')
      .eq('patient_id', user.id)
      .order('start_date', { ascending: true })
    if (error) console.error(error)
    const mapped = (data ?? []).map((e: any) => ({
      ...e,
      drug_type_name: e.drug_types?.name ?? null,
    }))
    setEntries(mapped)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Parse date-only strings as local dates to avoid UTC-offset issues
  function localDate(s: string) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const past = entries.filter(e => localDate(e.start_date) < today)
  const current = [...entries].reverse().find(e => localDate(e.start_date) <= today) ?? null
  const upcoming = entries.filter(e => localDate(e.start_date) > today)

  const nextIncrease = upcoming[0] ?? null
  const daysUntilNext = nextIncrease
    ? Math.ceil((localDate(nextIncrease.start_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return { entries, past, current, upcoming, nextIncrease, daysUntilNext, loading }
}
