import Dexie, { type Table } from 'dexie'

export interface OfflineProgressEntry {
  id: string
  patient_id: string
  logged_at: string
  weight_kg: number | null
  wellbeing_score: number | null
  hunger_score: number | null
  food_noise_score: number | null
  symptoms: string[]
  notes: string | null
  synced: boolean
}

class SliminjectDB extends Dexie {
  offline_progress_entries!: Table<OfflineProgressEntry>

  constructor() {
    super('sliminject')
    this.version(1).stores({
      offline_progress_entries: 'id, patient_id, synced, logged_at',
    })
    this.version(2).stores({
      offline_progress_entries: 'id, patient_id, synced, logged_at',
    })
  }
}

export const db = new SliminjectDB()
