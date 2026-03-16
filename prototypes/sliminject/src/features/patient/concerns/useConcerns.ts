import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface Concern {
  id: string
  patient_id: string
  submitted_at: string
  severity: 'routine' | 'urgent'
  description: string
  status: 'open' | 'reviewed'
  doctor_response: string | null
  responded_at: string | null
}

export function useConcerns(patientId?: string) {
  const { user } = useAuth()
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [loading, setLoading] = useState(true)

  const id = patientId ?? user?.id

  const fetchConcerns = useCallback(async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('concerns')
      .select('*')
      .eq('patient_id', id)
      .order('submitted_at', { ascending: false })

    if (error) console.error('Fout bij ophalen meldingen:', error)
    setConcerns(data ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchConcerns()
  }, [fetchConcerns])

  async function submitConcern(severity: 'routine' | 'urgent', description: string) {
    if (!user) throw new Error('Niet ingelogd')
    const { error } = await supabase
      .from('concerns')
      .insert({ patient_id: user.id, severity, description })
    if (error) throw error
    await fetchConcerns()
  }

  async function respondToConcern(concernId: string, response: string) {
    const { error } = await supabase
      .from('concerns')
      .update({ status: 'reviewed', doctor_response: response, responded_at: new Date().toISOString() })
      .eq('id', concernId)
    if (error) throw error
    await fetchConcerns()
  }

  return { concerns, loading, submitConcern, respondToConcern, refresh: fetchConcerns }
}
