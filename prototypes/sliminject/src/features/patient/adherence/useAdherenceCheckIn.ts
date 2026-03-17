import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'
import { useAdherence } from '../../../hooks/useAdherence'

export interface CurrentScheduleEntry {
  id: string
  start_date: string
}

/** Parse a YYYY-MM-DD string as a local date (avoids UTC-offset issues). */
function localDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function useAdherenceCheckIn() {
  const { user } = useAuth()
  const [currentEntry, setCurrentEntry] = useState<CurrentScheduleEntry | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(true)

  const fetchCurrentEntry = useCallback(async () => {
    if (!user) return
    const today = new Date()
    const todayStr = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-')

    const { data, error } = await supabase
      .from('dosage_schedule_entries')
      .select('id, start_date')
      .eq('patient_id', user.id)
      .lte('start_date', todayStr)
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') console.error(error)
    setCurrentEntry(data ?? null)
    setScheduleLoading(false)
  }, [user])

  useEffect(() => { fetchCurrentEntry() }, [fetchCurrentEntry])

  const { records, loading: adherenceLoading, refresh } = useAdherence(user?.id)

  const [submitting, setSubmitting] = useState(false)

  // The check-in is due when there's a current schedule entry and no adherence
  // record for it yet.
  const alreadyAnswered = currentEntry
    ? records.some(r => r.schedule_entry_id === currentEntry.id)
    : false

  const isDue =
    !scheduleLoading &&
    !adherenceLoading &&
    currentEntry !== null &&
    localDate(currentEntry.start_date) <= new Date() &&
    !alreadyAnswered

  async function submitAdherence(
    response: 'confirmed' | 'skipped' | 'adjusted',
    note?: string
  ) {
    if (!user || !currentEntry) return
    setSubmitting(true)
    const { error } = await supabase.from('injection_adherence').insert({
      patient_id: user.id,
      schedule_entry_id: currentEntry.id,
      response,
      note: note ?? null,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Opslaan mislukt. Probeer het opnieuw.')
      return
    }
    await refresh()
  }

  return { isDue, submitting, submitAdherence }
}
