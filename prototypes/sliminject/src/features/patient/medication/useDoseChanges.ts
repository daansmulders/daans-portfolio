import { useMemo, useState, useCallback } from 'react'
import { usePatientDosageSchedule, type DosageEntry } from './usePatientDosageSchedule'
import { useAdherence } from '../../../hooks/useAdherence'
import { useAuth } from '../../../auth/AuthProvider'

export interface DoseStep {
  date: string
  dose_mg: number
}

function localDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DISMISS_PREFIX = 'sliminject_dose_dismissed_'

export function useDoseChanges() {
  const { user } = useAuth()
  const { entries, current } = usePatientDosageSchedule()
  const { records: adherenceRecords } = useAdherence(user?.id)

  // Incremented on dismiss to invalidate the announcement memo
  const [dismissCount, setDismissCount] = useState(0)

  // All approved entries for chart markers
  const doseSteps: DoseStep[] = useMemo(
    () => entries
      .filter(e => e.status === 'approved')
      .map(e => ({ date: e.start_date, dose_mg: e.dose_mg })),
    [entries],
  )

  // Pre-increase announcement: next approved entry where dose > current, within 7 days, not dismissed
  const announcement = useMemo(() => {
    if (!current) return null
    const todayStr = localToday()
    const todayMs = localDate(todayStr).getTime()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

    const approved = entries.filter(e => e.status === 'approved')
    for (const entry of approved) {
      const entryMs = localDate(entry.start_date).getTime()
      const daysUntil = Math.ceil((entryMs - todayMs) / (24 * 60 * 60 * 1000))
      if (
        daysUntil > 0 &&
        daysUntil <= 7 &&
        entry.dose_mg > current.dose_mg &&
        !localStorage.getItem(`${DISMISS_PREFIX}${entry.id}`)
      ) {
        return { entryId: entry.id, dose_mg: entry.dose_mg, daysUntil }
      }
    }
    return null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, current, dismissCount])

  const dismissAnnouncement = useCallback((entryId: string) => {
    localStorage.setItem(`${DISMISS_PREFIX}${entryId}`, '1')
    setDismissCount(c => c + 1)
  }, [])

  // Injection-day "Nieuwe dosis" marker
  const { isNewDose, newDoseMg, confirmedAtCurrentDose } = useMemo(() => {
    if (!current) return { isNewDose: false, newDoseMg: null, confirmedAtCurrentDose: 0 }

    const approved = entries.filter(e => e.status === 'approved')
    const currentIndex = approved.findIndex(e => e.id === current.id)

    // No previous dose → not an increase (first dose ever)
    if (currentIndex <= 0) return { isNewDose: false, newDoseMg: null, confirmedAtCurrentDose: 0 }

    const previousDose = approved[currentIndex - 1]
    const doseChanged = current.dose_mg !== previousDose.dose_mg

    // Count confirmed adherence records for entries at the current dose level
    const entriesAtCurrentDose = approved.filter(e => e.dose_mg === current.dose_mg)
    const entryIds = new Set(entriesAtCurrentDose.map(e => e.id))
    const confirmed = adherenceRecords.filter(
      r => r.response === 'confirmed' && entryIds.has(r.schedule_entry_id)
    ).length

    return {
      isNewDose: doseChanged && confirmed < 2,
      newDoseMg: doseChanged ? current.dose_mg : null,
      confirmedAtCurrentDose: confirmed,
    }
  }, [entries, current, adherenceRecords])

  // First injection ever — first approved dose started within the last 2 days
  // (can't rely on adherenceRecords.length === 0 because seed/reset clears records)
  const isFirstInjection = useMemo(() => {
    if (!current) return false
    const approved = entries.filter(e => e.status === 'approved')
    if (approved.length === 0) return false
    const firstStart = localDate(approved[0].start_date).getTime()
    const twoDays = 2 * 24 * 60 * 60 * 1000
    return approved[0].id === current.id && (Date.now() - firstStart) < twoDays
  }, [entries, current])

  return {
    doseSteps,
    announcement,
    dismissAnnouncement,
    isNewDose,
    newDoseMg,
    confirmedAtCurrentDose,
    isFirstInjection,
  }
}
