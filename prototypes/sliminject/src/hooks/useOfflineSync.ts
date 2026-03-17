import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { db } from '../lib/db'
import { useAuth } from '../auth/AuthProvider'

export function useOfflineSync() {
  const { user } = useAuth()
  const syncRunning = useRef(false)

  // Stable reference — useCallback ensures add/removeEventListener use the same function object
  const syncPendingEntries = useCallback(async () => {
    if (!user || syncRunning.current) return
    syncRunning.current = true

    try {
      const unsyncedEntries = await db.offline_progress_entries
        .where('synced')
        .equals(0) // Dexie slaat booleans op als 0/1
        .sortBy('logged_at')

      for (const entry of unsyncedEntries) {
        const { error } = await supabase.from('progress_entries').insert({
          patient_id:       entry.patient_id,
          logged_at:        entry.logged_at,
          weight_kg:        entry.weight_kg,
          wellbeing_score:  entry.wellbeing_score,
          hunger_score:     entry.hunger_score,
          food_noise_score: entry.food_noise_score,
          symptoms:         entry.symptoms,
          notes:            entry.notes,
        })

        if (!error) {
          await db.offline_progress_entries.update(entry.id, { synced: true })
        }
      }
    } finally {
      syncRunning.current = false
    }
  }, [user])

  useEffect(() => {
    window.addEventListener('online', syncPendingEntries)
    if (navigator.onLine) syncPendingEntries()
    return () => window.removeEventListener('online', syncPendingEntries)
  }, [syncPendingEntries])
}
