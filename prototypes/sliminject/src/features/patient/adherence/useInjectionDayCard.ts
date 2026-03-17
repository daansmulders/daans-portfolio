import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'
import { useAdherenceCheckIn } from './useAdherenceCheckIn'
import type { NewProgressEntry } from '../dashboard/useProgressEntries'

export interface InjectionDayLogData {
  weight_kg: number | null
  hunger_score: number       // 1–5, required
  food_noise_score: number | null  // weekly framing
  energy_score: number | null
  note: string | null
}

export type InjectionDayStep = 'confirm' | 'log' | 'done'

export function useInjectionDayCard(
  addEntry: (entry: NewProgressEntry) => Promise<{ offline: boolean }>
) {
  const { user } = useAuth()
  const { isDue, submitting: adherenceSubmitting, submitAdherence } = useAdherenceCheckIn()
  const [step, setStep] = useState<InjectionDayStep>('confirm')
  const [submitting, setSubmitting] = useState(false)

  function confirmInjection() {
    setStep('log')
  }

  async function submitLog(data: InjectionDayLogData) {
    if (!user) return
    setSubmitting(true)
    try {
      // 1. Save adherence record (confirmed)
      await submitAdherence('confirmed')

      // 2. Save progress entry (via existing offline-capable addEntry)
      await addEntry({
        weight_kg: data.weight_kg,
        hunger_score: data.hunger_score,
        food_noise_score: data.food_noise_score,
        notes: data.note,
      })

      // 3. Save wellbeing check-in (energy + note) if energy was provided
      if (data.energy_score != null || data.note) {
        const { error } = await supabase
          .from('weekly_wellbeing_checkins')
          .insert({
            patient_id: user.id,
            energy_score: data.energy_score ?? null,
            mood_score: null,
            confidence_score: null,
            note: data.note ?? null,
          })
        if (error) {
          // Non-blocking: energy check-in failure doesn't break the injection day save
          console.error('Welzijn check-in opslaan mislukt:', error)
        }
      }

      setStep('done')
    } catch {
      toast.error('Opslaan mislukt. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  async function skipInjection(note?: string) {
    await submitAdherence('skipped', note)
  }

  async function adjustInjection(note?: string) {
    await submitAdherence('adjusted', note)
  }

  return {
    isDue,
    step,
    submitting: submitting || adherenceSubmitting,
    confirmInjection,
    submitLog,
    skipInjection,
    adjustInjection,
  }
}
