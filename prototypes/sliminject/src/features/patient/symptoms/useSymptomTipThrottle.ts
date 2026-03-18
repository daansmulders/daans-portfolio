const PREFIX = 'sliminject_tip_last_'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface ThrottleRecord {
  timestamp: number
  variantIndex: number
}

function parseRecord(stored: string | null): ThrottleRecord | null {
  if (!stored) return null
  // Backward compat: old format was just a timestamp number string
  try {
    const parsed = JSON.parse(stored)
    if (typeof parsed === 'object' && parsed.timestamp != null) {
      return parsed as ThrottleRecord
    }
  } catch {
    // Not JSON — old plain number format
  }
  const ts = Number(stored)
  if (!isNaN(ts)) return { timestamp: ts, variantIndex: 0 }
  return null
}

export function useSymptomTipThrottle() {
  function wasShownRecently(symptom: string): boolean {
    const record = parseRecord(localStorage.getItem(`${PREFIX}${symptom}`))
    if (!record) return false
    return Date.now() - record.timestamp < SEVEN_DAYS_MS
  }

  function getNextVariantIndex(symptom: string): number {
    const record = parseRecord(localStorage.getItem(`${PREFIX}${symptom}`))
    if (!record) return 0
    return record.variantIndex + 1
  }

  function markShown(symptom: string, variantIndex: number): void {
    const record: ThrottleRecord = { timestamp: Date.now(), variantIndex }
    localStorage.setItem(`${PREFIX}${symptom}`, JSON.stringify(record))
  }

  return { wasShownRecently, markShown, getNextVariantIndex }
}
