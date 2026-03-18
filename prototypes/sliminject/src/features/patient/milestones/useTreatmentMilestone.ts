import { useState, useEffect, useMemo } from 'react'
import { supabase, normalizeSymptoms } from '../../../lib/supabase'
import { useAuth } from '../../../auth/AuthProvider'
import { nl } from '../../../i18n/nl'

const MILESTONE_WEEKS = [4, 8, 12, 16] as const
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
const DISMISS_PREFIX = 'sliminject_milestone_dismissed_week_'

export interface MilestoneData {
  week: number
  weightChange: number | null
  logCount: number
  adherenceConfirmed: number | null
  adherenceTotal: number | null
  trendObservation: string | null
}

function weeksSince(startDate: string): number {
  const start = new Date(startDate).getTime()
  return Math.floor((Date.now() - start) / MS_PER_WEEK)
}

function isDismissed(week: number): boolean {
  return localStorage.getItem(`${DISMISS_PREFIX}${week}`) === 'true'
}

function dismissMilestone(week: number): void {
  localStorage.setItem(`${DISMISS_PREFIX}${week}`, 'true')
}

interface TrendCandidate {
  key: string
  improvement: number // higher = more improved
}

function computeTrend(
  entries: { hunger_score: number | null; food_noise_score: number | null; symptoms: unknown[]; logged_at: string }[],
  checkins: { energy_score: number | null; mood_score: number | null; confidence_score: number | null; submitted_at: string }[],
): string | null {
  const candidates: TrendCandidate[] = []

  if (entries.length >= 4) {
    const mid = Math.floor(entries.length / 2)
    // entries are newest-first, so first half = recent, second half = older
    const recent = entries.slice(0, mid)
    const older = entries.slice(mid)

    const avg = (arr: (number | null)[], extract: (e: typeof entries[0]) => number | null) => {
      const vals = arr.map(extract as (e: unknown) => number | null).filter((v): v is number => v != null)
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    }

    // Hunger: lower is better
    const recentHunger = avg(recent, (e: typeof entries[0]) => e.hunger_score)
    const olderHunger = avg(older, (e: typeof entries[0]) => e.hunger_score)
    if (recentHunger != null && olderHunger != null && olderHunger - recentHunger > 0.3) {
      candidates.push({ key: nl.milestone_trend_honger, improvement: olderHunger - recentHunger })
    }

    // Food noise: lower is better
    const recentFN = avg(recent, (e: typeof entries[0]) => e.food_noise_score)
    const olderFN = avg(older, (e: typeof entries[0]) => e.food_noise_score)
    if (recentFN != null && olderFN != null && olderFN - recentFN > 0.3) {
      candidates.push({ key: nl.milestone_trend_voedselruis, improvement: olderFN - recentFN })
    }

    // Symptoms: fewer is better
    const recentSymptoms = recent.reduce((sum, e) => sum + (e.symptoms?.length ?? 0), 0) / recent.length
    const olderSymptoms = older.reduce((sum, e) => sum + (e.symptoms?.length ?? 0), 0) / older.length
    if (olderSymptoms - recentSymptoms > 0.2) {
      candidates.push({ key: nl.milestone_trend_symptomen, improvement: olderSymptoms - recentSymptoms })
    }
  }

  // Wellbeing checkins: higher is better
  if (checkins.length >= 2) {
    const earliest = checkins[checkins.length - 1]
    const latest = checkins[0]

    const dims: { field: 'energy_score' | 'mood_score' | 'confidence_score'; key: string }[] = [
      { field: 'energy_score', key: nl.milestone_trend_energie },
      { field: 'mood_score', key: nl.milestone_trend_stemming },
      { field: 'confidence_score', key: nl.milestone_trend_zelfvertrouwen },
    ]

    for (const { field, key } of dims) {
      const e = earliest[field]
      const l = latest[field]
      if (e != null && l != null && l - e > 0.3) {
        candidates.push({ key, improvement: l - e })
      }
    }
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.improvement - a.improvement)
  return candidates[0].key
}

export function useTreatmentMilestone(patientId?: string) {
  const { user } = useAuth()
  const id = patientId ?? user?.id
  const isDoctor = !!patientId

  const [treatmentStart, setTreatmentStart] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<MilestoneData[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedWeeks, setDismissedWeeks] = useState<Set<number>>(new Set())

  // Fetch treatment_start_date
  useEffect(() => {
    if (!id) return
    supabase
      .from('patients')
      .select('treatment_start_date')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setTreatmentStart(data?.treatment_start_date ?? null)
      })
  }, [id])

  // Compute milestones when treatment start is known
  useEffect(() => {
    if (!treatmentStart || !id) { setLoading(false); return }

    const weeks = weeksSince(treatmentStart)
    const reached = MILESTONE_WEEKS.filter(w => weeks >= w)

    if (reached.length === 0) { setLoading(false); return }

    async function computeMilestones() {
      // Fetch progress entries
      const { data: entries } = await supabase
        .from('progress_entries')
        .select('weight_kg, hunger_score, food_noise_score, symptoms, logged_at')
        .eq('patient_id', id!)
        .order('logged_at', { ascending: false })

      // Fetch wellbeing checkins
      const { data: checkins } = await supabase
        .from('weekly_wellbeing_checkins')
        .select('energy_score, mood_score, confidence_score, submitted_at')
        .eq('patient_id', id!)
        .order('submitted_at', { ascending: false })

      // Fetch adherence
      const { data: adherence } = await supabase
        .from('injection_adherence')
        .select('response, recorded_at')
        .eq('patient_id', id!)

      const allEntries = (entries ?? []).map(e => ({
        ...e,
        symptoms: normalizeSymptoms(e.symptoms ?? []),
      }))
      const allCheckins = checkins ?? []
      const allAdherence = adherence ?? []

      const results: MilestoneData[] = reached.map(week => {
        // Weight change: first ever vs most recent
        const withWeight = allEntries.filter(e => e.weight_kg != null)
        let weightChange: number | null = null
        if (withWeight.length >= 2) {
          const first = withWeight[withWeight.length - 1].weight_kg!
          const latest = withWeight[0].weight_kg!
          weightChange = Math.round((latest - first) * 10) / 10
        }

        // Log count
        const logCount = allEntries.length

        // Adherence
        let adherenceConfirmed: number | null = null
        let adherenceTotal: number | null = null
        if (allAdherence.length > 0) {
          adherenceTotal = allAdherence.length
          adherenceConfirmed = allAdherence.filter(a => a.response === 'confirmed').length
        }

        // Wellbeing trend
        const trendObservation = computeTrend(allEntries, allCheckins)

        return { week, weightChange, logCount, adherenceConfirmed, adherenceTotal, trendObservation }
      })

      setMilestones(results)
      setDismissedWeeks(new Set(MILESTONE_WEEKS.filter(isDismissed)))
      setLoading(false)
    }

    computeMilestones()
  }, [treatmentStart, id])

  // Patient view: most recent unacknowledged milestone
  const activeMilestone = useMemo(() => {
    if (isDoctor || milestones.length === 0) return null
    // Find the most recent milestone that hasn't been dismissed
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (!dismissedWeeks.has(milestones[i].week)) {
        return milestones[i]
      }
    }
    return null
  }, [milestones, dismissedWeeks, isDoctor])

  function dismiss(week: number) {
    dismissMilestone(week)
    setDismissedWeeks(prev => new Set(prev).add(week))
  }

  return {
    activeMilestone,
    allMilestones: milestones,
    loading,
    dismiss,
  }
}
