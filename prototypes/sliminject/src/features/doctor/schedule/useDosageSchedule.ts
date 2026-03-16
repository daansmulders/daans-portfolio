import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface DrugType {
  id: string
  name: string
  sort_order: number
}

export interface DosageEntry {
  id: string
  patient_id: string
  dose_mg: number
  start_date: string
  notes: string | null
  created_by_doctor_id: string
  drug_type_id: string | null
  drug_type_name: string | null
  status: 'draft' | 'approved'
}

export function useDosageSchedule(patientId: string) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DosageEntry[]>([])
  const [drugTypes, setDrugTypes] = useState<DrugType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    const [entriesRes, drugTypesRes] = await Promise.all([
      supabase
        .from('dosage_schedule_entries')
        .select('*, drug_types(name), status')
        .eq('patient_id', patientId)
        .order('start_date', { ascending: true }),
      supabase
        .from('drug_types')
        .select('id, name, sort_order')
        .order('sort_order'),
    ])
    if (entriesRes.error) console.error(entriesRes.error)
    const mapped = (entriesRes.data ?? []).map((e: any) => ({
      ...e,
      drug_type_name: e.drug_types?.name ?? null,
    }))
    setEntries(mapped)
    setDrugTypes(drugTypesRes.data ?? [])
    setLoading(false)
  }, [patientId])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function addEntry(dose_mg: number, start_date: string, drug_type_id?: string, notes?: string) {
    if (!user) throw new Error('Niet ingelogd')
    const { error } = await supabase
      .from('dosage_schedule_entries')
      .insert({
        patient_id: patientId,
        dose_mg,
        start_date,
        notes: notes ?? null,
        drug_type_id: drug_type_id ?? null,
        created_by_doctor_id: user.id,
        status: 'draft',
      })
    if (error) throw error
    await fetchEntries()
  }

  async function removeEntry(id: string) {
    const { error } = await supabase.from('dosage_schedule_entries').delete().eq('id', id)
    if (error) throw error
    await fetchEntries()
  }

  async function approveEntry(id: string) {
    const { error } = await supabase
      .from('dosage_schedule_entries')
      .update({ status: 'approved' })
      .eq('id', id)
    if (error) throw error
    await fetchEntries()
  }

  return { entries, drugTypes, loading, addEntry, removeEntry, approveEntry, refresh: fetchEntries }
}
