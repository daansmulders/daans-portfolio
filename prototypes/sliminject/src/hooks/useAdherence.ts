import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export interface AdherenceRecord {
  id: string
  patient_id: string
  schedule_entry_id: string
  response: 'confirmed' | 'skipped' | 'adjusted'
  note: string | null
  recorded_at: string
}

export function useAdherence(patientId: string | undefined) {
  const [records, setRecords] = useState<AdherenceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!patientId) { setLoading(false); return }
    const { data, error } = await supabase
      .from('injection_adherence')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
    if (error) console.error(error)
    setRecords(data ?? [])
    setLoading(false)
  }, [patientId])

  useEffect(() => { fetch() }, [fetch])

  /** Map from schedule_entry_id → AdherenceRecord for O(1) lookup */
  const byEntryId = useMemo(
    () => new Map(records.map(r => [r.schedule_entry_id, r])),
    [records],
  )

  return { records, byEntryId, loading, refresh: fetch }
}
