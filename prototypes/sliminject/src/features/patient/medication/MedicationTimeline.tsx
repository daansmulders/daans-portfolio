import { useState } from 'react'
import { nl } from '../../../i18n/nl'

export interface TimelineEntry {
  id: string
  dose_mg: number
  start_date: string
  notes: string | null
  drug_type_name: string | null
  status?: 'draft' | 'approved'
}

interface MedicationTimelineProps {
  entries: TimelineEntry[] // sorted ascending by start_date
}

type EntryStatus = 'past' | 'current' | 'upcoming'

function localDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getStatus(entry: TimelineEntry, currentId: string | null): EntryStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (localDate(entry.start_date) > today) return 'upcoming'
  if (entry.id === currentId) return 'current'
  return 'past'
}

export function MedicationTimeline({ entries }: MedicationTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (entries.length === 0) {
    return <p className="text-sm" style={{ color: '#6B6660' }}>{nl.medicatie_geen_schema}</p>
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentEntry = [...entries].reverse().find(e => localDate(e.start_date) <= today) ?? null

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <ol className="relative">
      {entries.map((entry, i) => {
        const status = getStatus(entry, currentEntry?.id ?? null)
        const isLast = i === entries.length - 1
        const isExpanded = expandedId === entry.id
        const hasNotes = !!entry.notes

        const nodeCls =
          status === 'current' ? 'timeline-dot-current' :
          status === 'upcoming' ? 'timeline-dot-future' :
          'timeline-dot-past'

        const cardStyle: React.CSSProperties =
          status === 'current'
            ? { borderColor: '#D4EDE6', backgroundColor: '#EDF7F4' }
            : status === 'upcoming'
            ? { borderColor: '#E0DBD4', backgroundColor: '#fff' }
            : { borderColor: '#E0DBD4', backgroundColor: '#F7F4F0' }

        const dosageStyle: React.CSSProperties =
          status === 'current'
            ? { color: '#1A4A36' }
            : status === 'upcoming'
            ? { color: '#14130F' }
            : { color: '#AAA49C' }

        return (
          <li key={entry.id} className="flex gap-4">
            {/* Line + node */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-3.5 flex-shrink-0 z-10 ${nodeCls}`} />
              {!isLast && <div className="w-px flex-1 mt-1" style={{ backgroundColor: '#E0DBD4' }} />}
            </div>

            {/* Content */}
            <div className="mb-3 flex-1">
              <button
                onClick={() => hasNotes && setExpandedId(isExpanded ? null : entry.id)}
                className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
                  hasNotes ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={cardStyle}
                aria-expanded={hasNotes ? isExpanded : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold" style={dosageStyle}>{entry.dose_mg} mg</span>
                    {entry.drug_type_name && (
                      <span className={`badge ${
                        status === 'current' ? 'badge-brand' :
                        status === 'past' ? 'badge-warm' :
                        'badge-warm'
                      }`}>
                        {entry.drug_type_name}
                      </span>
                    )}
                    {status === 'current' && (
                      <span className="badge badge-brand" style={{ backgroundColor: '#2D7A5E', color: '#fff' }}>
                        {nl.medicatie_huidig}
                      </span>
                    )}
                    {status === 'upcoming' && entry.status !== 'draft' && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-dashed" style={{ color: '#AAA49C', borderColor: '#E0DBD4' }}>
                        {nl.medicatie_gepland_label}
                      </span>
                    )}
                    {entry.status === 'draft' && (
                      <span className="badge badge-amber">
                        {nl.medicatie_in_behandeling}
                      </span>
                    )}
                  </div>
                  {hasNotes && (
                    <span className="text-xs flex-shrink-0" style={{ color: '#AAA49C' }} aria-hidden="true">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1`} style={{ color: status === 'past' ? '#AAA49C' : '#6B6660' }}>
                  {formatDate(entry.start_date)}
                </p>
                {isExpanded && entry.notes && (
                  <p className="text-sm mt-2 pt-2" style={{ color: '#6B6660', borderTop: '1px solid #D4EDE6' }}>
                    {entry.notes}
                  </p>
                )}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
