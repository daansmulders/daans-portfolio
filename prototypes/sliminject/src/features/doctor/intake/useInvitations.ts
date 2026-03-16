import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface Invitation {
  id: string
  patient_name: string
  patient_email: string
  treatment_start_date: string | null
  initial_dose_mg: number | null
  drug_type_id: string | null
  drug_type_name: string | null
  status: 'pending' | 'accepted'
  created_at: string
}

export interface NewInvitation {
  patient_name: string
  patient_email: string
  treatment_start_date: string
  initial_dose_mg: number | null
  starting_weight_kg: number | null
  drug_type_id: string | null
}

export function useInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [drugTypes, setDrugTypes] = useState<{ id: string; name: string }[]>([])

  const fetchAll = useCallback(async () => {
    if (!user) return
    const [{ data: inv }, { data: drugs }] = await Promise.all([
      supabase
        .from('invitations')
        .select('id, patient_name, patient_email, treatment_start_date, initial_dose_mg, drug_type_id, drug_types(name), status, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('drug_types').select('id, name').order('sort_order'),
    ])
    setInvitations(
      (inv ?? []).map((i: any) => ({ ...i, drug_type_name: i.drug_types?.name ?? null }))
    )
    setDrugTypes(drugs ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function addInvitation(data: NewInvitation) {
    if (!user) return
    const { error } = await supabase.from('invitations').insert({
      doctor_id: user.id,
      ...data,
    })
    if (error) throw error
    await fetchAll()
  }

  return { invitations, loading, drugTypes, addInvitation }
}
