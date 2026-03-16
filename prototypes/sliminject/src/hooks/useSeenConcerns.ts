const STORAGE_KEY = 'sliminject_seen_concerns'

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function markConcernsAsSeen(ids: string[]) {
  const seen = getSeenIds()
  ids.forEach(id => seen.add(id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
}

export function getUnseenReviewedConcerns<T extends { id: string; status: string; doctor_response: string | null }>(
  concerns: T[]
): T[] {
  const seen = getSeenIds()
  return concerns.filter(c => c.status === 'reviewed' && c.doctor_response && !seen.has(c.id))
}
