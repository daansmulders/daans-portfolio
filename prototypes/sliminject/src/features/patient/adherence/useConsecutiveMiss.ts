import { useAdherence } from '../../../hooks/useAdherence'
import { useAuth } from '../../../auth/AuthProvider'

const DISMISS_KEY = 'sliminject_consecutive_miss_dismissed'

export function useConsecutiveMiss() {
  const { user } = useAuth()
  const { records, loading } = useAdherence(user?.id)

  const lastTwo = records.slice(0, 2)
  const isConsecutiveMiss =
    !loading &&
    lastTwo.length === 2 &&
    lastTwo[0].response === 'skipped' &&
    lastTwo[1].response === 'skipped'

  // Dismissal is keyed to the most recent skipped record's id.
  // If a new miss occurs (different id), the nudge reappears.
  const dismissedId = localStorage.getItem(DISMISS_KEY)
  const latestId = lastTwo[0]?.id ?? null
  const isDismissed = isConsecutiveMiss && dismissedId === latestId

  function dismiss() {
    if (latestId) localStorage.setItem(DISMISS_KEY, latestId)
  }

  return {
    isConsecutiveMiss: isConsecutiveMiss && !isDismissed,
    dismiss,
  }
}
