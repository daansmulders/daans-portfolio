const PREFIX = 'sliminject_tip_last_'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function useSymptomTipThrottle() {
  function wasShownRecently(symptom: string): boolean {
    const stored = localStorage.getItem(`${PREFIX}${symptom}`)
    if (!stored) return false
    return Date.now() - Number(stored) < SEVEN_DAYS_MS
  }

  function markShown(symptom: string): void {
    localStorage.setItem(`${PREFIX}${symptom}`, String(Date.now()))
  }

  return { wasShownRecently, markShown }
}
