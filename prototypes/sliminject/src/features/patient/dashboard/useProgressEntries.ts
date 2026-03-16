import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../../../lib/supabase'
import { db, type OfflineProgressEntry } from '../../../lib/db'
import { useAuth } from '../../../auth/AuthProvider'

export interface ProgressEntry {
  id: string
  patient_id: string
  logged_at: string
  weight_kg: number | null
  wellbeing_score: number | null
  hunger_score: number | null
  symptoms: string[]
  notes: string | null
}

export interface NewProgressEntry {
  weight_kg?: number | null
  hunger_score: number | null
  symptoms?: string[]
  notes?: string | null
}

export function useProgressEntries(patientId?: string) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)

  const id = patientId ?? user?.id

  const fetchEntries = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('patient_id', id)
      .order('logged_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  async function addEntry(entry: NewProgressEntry): Promise<{ offline: boolean }> {
    if (!user) throw new Error('Niet ingelogd')

    const id = uuidv4()
    const logged_at = new Date().toISOString()
    const fullEntry: OfflineProgressEntry = {
      id,
      patient_id: user.id,
      logged_at,
      weight_kg: entry.weight_kg ?? null,
      wellbeing_score: null,
      hunger_score: entry.hunger_score,
      symptoms: entry.symptoms ?? [],
      notes: entry.notes ?? null,
      synced: false,
    }

    if (!navigator.onLine) {
      // Sla offline op in Dexie
      await db.offline_progress_entries.add(fullEntry)
      setEntries(prev => [{ ...fullEntry }, ...prev])
      return { offline: true }
    }

    // Online: direct naar Supabase
    const { data, error } = await supabase
      .from('progress_entries')
      .insert({ patient_id: user.id, logged_at, ...entry })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert mislukt:', error)
      // Fallback naar Dexie als insert mislukt
      await db.offline_progress_entries.add(fullEntry)
      setEntries(prev => [{ ...fullEntry }, ...prev])
      return { offline: true }
    }

    setEntries(prev => [data, ...prev])
    return { offline: false }
  }

  return { entries, loading, addEntry, refresh: fetchEntries }
}
