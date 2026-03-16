import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface Advice {
  id: string
  body: string
  updated_at: string
}

export function useAdvice(patientId: string) {
  const { user } = useAuth()
  const [advice, setAdvice] = useState<Advice | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAdvice = useCallback(async () => {
    const { data } = await supabase
      .from('advice')
      .select('id, body, updated_at')
      .eq('patient_id', patientId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setAdvice(data)
    setLoading(false)
  }, [patientId])

  useEffect(() => { fetchAdvice() }, [fetchAdvice])

  async function saveAdvice(body: string) {
    if (!user) throw new Error('Niet ingelogd')
    if (advice) {
      const { error } = await supabase
        .from('advice')
        .update({ body, updated_at: new Date().toISOString() })
        .eq('id', advice.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('advice')
        .insert({ patient_id: patientId, doctor_id: user.id, body })
      if (error) throw error
    }
    await fetchAdvice()
  }

  return { advice, loading, saveAdvice }
}
