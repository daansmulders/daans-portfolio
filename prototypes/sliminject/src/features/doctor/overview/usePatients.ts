import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface PatientSummary {
  id: string
  full_name: string
  treatment_start_date: string
  current_dosage_mg: number
  last_entry_at: string | null
  open_concerns: number
}

export function usePatients() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPatients = useCallback(async () => {
    if (!user) return

    // Haal patiënten op met naam, laatste meting en open meldingen
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        treatment_start_date,
        current_dosage_mg,
        profiles!inner(full_name),
        progress_entries(logged_at),
        concerns(id, status)
      `)
      .eq('doctor_id', user.id)

    if (error) {
      console.error('Fout bij ophalen patiënten:', error)
      setLoading(false)
      return
    }

    const summaries: PatientSummary[] = (data ?? []).map((p: any) => {
      const entries = p.progress_entries ?? []
      const lastEntry = entries.length > 0
        ? entries.sort((a: any, b: any) => b.logged_at.localeCompare(a.logged_at))[0].logged_at
        : null
      const openConcerns = (p.concerns ?? []).filter((c: any) => c.status === 'open').length

      return {
        id: p.id,
        full_name: p.profiles.full_name,
        treatment_start_date: p.treatment_start_date,
        current_dosage_mg: p.current_dosage_mg,
        last_entry_at: lastEntry,
        open_concerns: openConcerns,
      }
    })

    // Patiënten met open meldingen eerst
    summaries.sort((a, b) => b.open_concerns - a.open_concerns)
    setPatients(summaries)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return { patients, loading, refresh: fetchPatients }
}
