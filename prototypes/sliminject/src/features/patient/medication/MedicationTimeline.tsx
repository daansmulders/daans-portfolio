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
    return <p className="text-sm text-gray-500">{nl.medicatie_geen_schema}</p>
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

        const nodeBg =
          status === 'current' ? 'bg-blue-600 ring-4 ring-blue-100' :
          status === 'upcoming' ? 'bg-white border-2 border-dashed border-gray-300' :
          'bg-gray-300'

        const cardBorder =
          status === 'current' ? 'border-blue-200 bg-blue-50' :
          status === 'upcoming' ? 'border-gray-200 bg-white' :
          'border-gray-100 bg-gray-50'

        const dosageColor =
          status === 'current' ? 'text-blue-800' :
          status === 'upcoming' ? 'text-gray-700' :
          'text-gray-400'

        return (
          <li key={entry.id} className="flex gap-4">
            {/* Line + node */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-3.5 flex-shrink-0 z-10 ${nodeBg}`} />
              {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
            </div>

            {/* Content */}
            <div className={`mb-3 flex-1`}>
              <button
                onClick={() => hasNotes && setExpandedId(isExpanded ? null : entry.id)}
                className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${cardBorder} ${
                  hasNotes ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                }`}
                aria-expanded={hasNotes ? isExpanded : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-lg font-bold ${dosageColor}`}>{entry.dose_mg} mg</span>
                    {entry.drug_type_name && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        status === 'current' ? 'bg-blue-100 text-blue-700' :
                        status === 'past' ? 'bg-gray-100 text-gray-500' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.drug_type_name}
                      </span>
                    )}
                    {status === 'current' && (
                      <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        {nl.medicatie_huidig}
                      </span>
                    )}
                    {status === 'upcoming' && entry.status !== 'draft' && (
                      <span className="text-xs font-medium text-gray-400 px-2 py-0.5 rounded-full border border-dashed border-gray-300">
                        {nl.medicatie_gepland_label}
                      </span>
                    )}
                    {entry.status === 'draft' && (
                      <span className="text-xs font-medium text-amber-600 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50">
                        {nl.medicatie_in_behandeling}
                      </span>
                    )}
                  </div>
                  {hasNotes && (
                    <span className="text-gray-400 text-xs flex-shrink-0" aria-hidden="true">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${status === 'past' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatDate(entry.start_date)}
                </p>
                {isExpanded && entry.notes && (
                  <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-blue-100">
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
