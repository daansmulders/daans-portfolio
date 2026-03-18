import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase, normalizeSymptoms, type SymptomEntry } from '../../../lib/supabase'
import { db, type OfflineProgressEntry } from '../../../lib/db'
import { useAuth } from '../../../auth/AuthProvider'

export interface ProgressEntry {
  id: string
  patient_id: string
  logged_at: string
  weight_kg: number | null
  wellbeing_score: number | null
  hunger_score: number | null
  food_noise_score: number | null
  symptoms: SymptomEntry[]
  notes: string | null
}

export interface NewProgressEntry {
  weight_kg?: number | null
  hunger_score: number | null
  food_noise_score?: number | null
  symptoms?: SymptomEntry[]
  notes?: string | null
}

function toLocalDateKey(isoStr: string): string {
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function calculateStreak(entries: ProgressEntry[]): number {
  if (entries.length === 0) return 0

  const uniqueDays = [...new Set(entries.map(e => toLocalDateKey(e.logged_at)))]
  const todayKey = toLocalDateKey(new Date().toISOString())
  const yesterdayKey = toLocalDateKey(new Date(Date.now() - 86400000).toISOString())

  if (!uniqueDays.includes(todayKey) && !uniqueDays.includes(yesterdayKey)) return 0

  const startDate = new Date()
  if (!uniqueDays.includes(todayKey)) startDate.setDate(startDate.getDate() - 1)

  let streak = 0
  for (let i = 0; i < 365; i++) {
    const check = new Date(startDate)
    check.setDate(check.getDate() - i)
    if (uniqueDays.includes(toLocalDateKey(check.toISOString()))) {
      streak++
    } else {
      break
    }
  }
  return streak
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
    setEntries((data ?? []).map(e => ({ ...e, symptoms: normalizeSymptoms(e.symptoms ?? []) })))
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
      food_noise_score: entry.food_noise_score ?? null,
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

  const { hasLoggedToday, streakDays, hasEnoughDataForChart } = useMemo(() => {
    const todayKey = toLocalDateKey(new Date().toISOString())
    return {
      hasLoggedToday: entries.some(e => toLocalDateKey(e.logged_at) === todayKey),
      streakDays: calculateStreak(entries),
      hasEnoughDataForChart: entries.length >= 7,
    }
  }, [entries])

  return { entries, loading, addEntry, refresh: fetchEntries, hasLoggedToday, streakDays, hasEnoughDataForChart }
}
