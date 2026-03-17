/**
 * Returns a Set of YYYY-MM-DD date strings for all injection days
 * derived from the dosage schedule. Each schedule entry's start_date
 * is the day that dose period begins (and the first injection day for it).
 */
export function injectionDates(entries: { start_date: string }[]): Set<string> {
  return new Set(entries.map(e => e.start_date))
}
