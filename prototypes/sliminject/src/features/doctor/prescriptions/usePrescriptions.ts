import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'

export interface Pharmacy {
  name: string
  address: string
  city: string
}

export interface PrescriptionEntry {
  id: string
  patientId: string
  patientName: string
  drugTypeId: string | null
  drugTypeName: string | null
  dose_mg: number
  start_date: string
  notes: string | null
  status: 'draft' | 'approved'
  pharmacy: Pharmacy | null
}

function localDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function usePrescriptions() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<PrescriptionEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('dosage_schedule_entries')
      .select('id, patient_id, dose_mg, start_date, notes, status, drug_type_id, drug_types(name), patients(profiles(full_name), pharmacies(name, address, city))')
      .eq('created_by_doctor_id', user.id)
      .order('start_date', { ascending: true })

    if (error) { console.error(error); setLoading(false); return }

    const mapped: PrescriptionEntry[] = (data ?? []).map((e: any) => ({
      id: e.id,
      patientId: e.patient_id,
      patientName: e.patients?.profiles?.full_name ?? '—',
      drugTypeId: e.drug_type_id ?? null,
      drugTypeName: e.drug_types?.name ?? null,
      dose_mg: e.dose_mg,
      start_date: e.start_date,
      notes: e.notes,
      status: e.status,
      pharmacy: e.patients?.pharmacies ?? null,
    }))

    setEntries(mapped)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function approve(id: string) {
    const { error } = await supabase
      .from('dosage_schedule_entries')
      .update({ status: 'approved' })
      .eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pending = entries.filter(e => e.status === 'draft')

  // For the reporting view: one current entry per patient (latest approved start_date <= today)
  const patientIds = [...new Set(entries.map(e => e.patientId))]
  const currentByPatient = patientIds.map(pid => {
    const patientEntries = entries.filter(e => e.patientId === pid && e.status === 'approved')
    const past = patientEntries.filter(e => localDate(e.start_date) <= today)
    const upcoming = patientEntries.filter(e => localDate(e.start_date) > today)
    return { past: past[past.length - 1] ?? null, next: upcoming[0] ?? null }
  }).filter(r => r.past || r.next)

  return { entries, pending, currentByPatient, loading, approve }
}
