import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { db } from '../lib/db'
import { useAuth } from '../auth/AuthProvider'

export function useOfflineSync() {
  const { user } = useAuth()
  const syncRunning = useRef(false)

  async function syncPendingEntries() {
    if (!user || syncRunning.current) return
    syncRunning.current = true

    try {
      const unsyncedEntries = await db.offline_progress_entries
        .where('synced')
        .equals(0) // Dexie slaat booleans op als 0/1
        .sortBy('logged_at')

      for (const entry of unsyncedEntries) {
        const { error } = await supabase.from('progress_entries').insert({
          patient_id: entry.patient_id,
          logged_at: entry.logged_at,
          weight_kg: entry.weight_kg,
          wellbeing_score: entry.wellbeing_score,
          symptoms: entry.symptoms,
          notes: entry.notes,
        })

        if (!error) {
          await db.offline_progress_entries.update(entry.id, { synced: true })
        }
      }
    } finally {
      syncRunning.current = false
    }
  }

  useEffect(() => {
    // Sync zodra de browser online komt
    window.addEventListener('online', syncPendingEntries)

    // Probeer ook direct bij mount (voor het geval we al online zijn)
    if (navigator.onLine) syncPendingEntries()

    return () => window.removeEventListener('online', syncPendingEntries)
  }, [user])
}
