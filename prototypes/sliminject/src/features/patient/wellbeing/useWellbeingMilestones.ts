import { useMemo, useState, useCallback } from 'react'
import type { ProgressEntry } from '../dashboard/useProgressEntries'
import type { WellbeingCheckIn } from './useWellbeingHistory'

// ── Food noise milestone ──────────────────────────────────────────────────────

const FOOD_NOISE_DISMISS_KEY = 'sliminject_food_noise_milestone_dismissed'

/** Returns the Monday of the week containing `date` as a YYYY-MM-DD string. */
function calWeekStart(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

/**
 * Triggered when:
 * - Mean food_noise_score in each of the last 4 calendar weeks is ≤ 2
 * - At least one entry in the 4 weeks prior to that window had a score ≥ 4
 */
export function useFoodNoiseMilestone(entries: ProgressEntry[]) {
  const [dismissedLocal, setDismissedLocal] = useState(false)

  const result = useMemo(() => {
    const noiseEntries = entries.filter(e => e.food_noise_score != null)
    if (noiseEntries.length === 0) return null

    // Group scores by calendar week
    const byWeek = new Map<string, number[]>()
    for (const e of noiseEntries) {
      const wk = calWeekStart(new Date(e.logged_at))
      const scores = byWeek.get(wk) ?? []
      scores.push(e.food_noise_score!)
      byWeek.set(wk, scores)
    }

    const today = new Date()

    const last4Weeks: string[] = []
    for (let i = 0; i < 4; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i * 7)
      last4Weeks.push(calWeekStart(d))
    }

    if (!last4Weeks.every(wk => byWeek.has(wk))) return null

    const allLow = last4Weeks.every(wk => {
      const scores = byWeek.get(wk)!
      return scores.reduce((a, b) => a + b, 0) / scores.length <= 2
    })
    if (!allLow) return null

    const prior4Weeks: string[] = []
    for (let i = 4; i < 8; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i * 7)
      prior4Weeks.push(calWeekStart(d))
    }

    if (!prior4Weeks.some(wk => (byWeek.get(wk) ?? []).some(s => s >= 4))) return null

    const fingerprint = [...last4Weeks].sort().join(',')
    const isDismissed = localStorage.getItem(FOOD_NOISE_DISMISS_KEY) === fingerprint
    return { fingerprint, isDismissed }
  }, [entries])

  const dismissFoodNoise = useCallback(() => {
    if (result) localStorage.setItem(FOOD_NOISE_DISMISS_KEY, result.fingerprint)
    setDismissedLocal(true)
  }, [result])

  return {
    isFoodNoiseMilestone: result !== null && !result.isDismissed && !dismissedLocal,
    dismissFoodNoise,
  }
}

// ── Wellbeing dimension milestones ────────────────────────────────────────────

const DIMENSION_DISMISS_KEYS = {
  energy:     'sliminject_energy_milestone_dismissed',
  mood:       'sliminject_mood_milestone_dismissed',
  confidence: 'sliminject_confidence_milestone_dismissed',
}

interface DimensionMilestone {
  triggered: boolean
  dismiss: () => void
}

/**
 * Per dimension: triggered when the most recent check-in score is 2+ points
 * higher than the nearest check-in from 21–35 days ago.
 * Each dimension is tracked independently with its own localStorage key.
 */
export function useWellbeingDimensionMilestones(checkins: WellbeingCheckIn[]) {
  const [dismissedDims, setDismissedDims] = useState<Set<string>>(new Set())

  const computed = useMemo(() => {
    if (checkins.length < 2) return null

    const mostRecent = checkins[0]
    const now = Date.now()
    const MIN_AGE = 21 * 24 * 60 * 60 * 1000
    const MAX_AGE = 35 * 24 * 60 * 60 * 1000

    function checkDimension(
      field: 'energy_score' | 'mood_score' | 'confidence_score',
      dismissKey: string,
    ): { triggered: boolean; fingerprint: string; dismissKey: string } | null {
      const currentScore = mostRecent[field]
      if (currentScore == null) return null

      const priorCheckin = checkins.find(c => {
        const age = now - new Date(c.submitted_at).getTime()
        return age >= MIN_AGE && age <= MAX_AGE && c[field] != null
      })

      if (!priorCheckin) return null

      const improvement = currentScore - priorCheckin[field]!
      if (improvement < 2) return null

      const fingerprint = `${mostRecent.id}:${priorCheckin.id}`
      const isDismissed = localStorage.getItem(dismissKey) === fingerprint
      return { triggered: !isDismissed, fingerprint, dismissKey }
    }

    return {
      energy:     checkDimension('energy_score',     DIMENSION_DISMISS_KEYS.energy),
      mood:       checkDimension('mood_score',        DIMENSION_DISMISS_KEYS.mood),
      confidence: checkDimension('confidence_score',  DIMENSION_DISMISS_KEYS.confidence),
    }
  }, [checkins])

  function makeDismiss(dim: string, data: { triggered: boolean; fingerprint: string; dismissKey: string } | null): DimensionMilestone {
    if (!data || !data.triggered || dismissedDims.has(dim)) {
      return { triggered: false, dismiss: () => {} }
    }
    return {
      triggered: true,
      dismiss: () => {
        localStorage.setItem(data.dismissKey, data.fingerprint)
        setDismissedDims(prev => new Set(prev).add(dim))
      },
    }
  }

  return {
    energy:     makeDismiss('energy', computed?.energy ?? null),
    mood:       makeDismiss('mood', computed?.mood ?? null),
    confidence: makeDismiss('confidence', computed?.confidence ?? null),
  }
}
