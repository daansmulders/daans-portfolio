import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface DosageEntry {
  id: string
  patient_id: string
  dose_mg: number
  start_date: string
  notes: string | null
  created_by_doctor_id: string
}

export function useDosageSchedule(patientId: string) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DosageEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from('dosage_schedule_entries')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_date', { ascending: true })
    if (error) console.error(error)
    setEntries(data ?? [])
    setLoading(false)
  }, [patientId])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function addEntry(dose_mg: number, start_date: string, notes?: string) {
    if (!user) throw new Error('Niet ingelogd')
    const { error } = await supabase
      .from('dosage_schedule_entries')
      .insert({ patient_id: patientId, dose_mg, start_date, notes: notes ?? null, created_by_doctor_id: user.id })
    if (error) throw error
    await fetchEntries()
  }

  async function removeEntry(id: string) {
    const { error } = await supabase.from('dosage_schedule_entries').delete().eq('id', id)
    if (error) throw error
    await fetchEntries()
  }

  return { entries, loading, addEntry, removeEntry, refresh: fetchEntries }
}
