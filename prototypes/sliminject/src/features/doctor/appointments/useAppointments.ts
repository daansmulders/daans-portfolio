import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  scheduled_at: string
  notes: string | null
}

export function useAppointments(patientId?: string) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = useCallback(async () => {
    if (!user) return
    let query = supabase
      .from('appointments')
      .select('*')
      .order('scheduled_at', { ascending: true })

    if (patientId) query = query.eq('patient_id', patientId)

    const { data, error } = await query
    if (error) console.error(error)
    setAppointments(data ?? [])
    setLoading(false)
  }, [user, patientId])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  async function createAppointment(patientId: string, scheduled_at: string, notes?: string) {
    if (!user) throw new Error('Niet ingelogd')
    const { error } = await supabase
      .from('appointments')
      .insert({ patient_id: patientId, doctor_id: user.id, scheduled_at, notes: notes ?? null })
    if (error) throw error
    await fetchAppointments()
  }

  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= new Date())
  const next = upcoming[0] ?? null
  const hoursUntilNext = next
    ? (new Date(next.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60)
    : null

  return { appointments, upcoming, next, hoursUntilNext, loading, createAppointment }
}
