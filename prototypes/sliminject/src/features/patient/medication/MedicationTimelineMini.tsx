import { Link } from 'react-router-dom'
import type { DosageEntry } from './usePatientDosageSchedule'
import { nl } from '../../../i18n/nl'

interface MedicationTimelineMiniProps {
  entries: DosageEntry[] // sorted ascending
  currentId: string | null
}

export function MedicationTimelineMini({ entries, currentId }: MedicationTimelineMiniProps) {
  if (entries.length === 0) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function localDate(s: string) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  return (
    <Link
      to="/patient/medicatie"
      className="block border border-gray-200 rounded-xl px-4 pt-3 pb-4 bg-white hover:border-blue-200 transition-colors"
      aria-label={nl.medicatie_tijdlijn}
    >
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        {nl.medicatie_tijdlijn}
      </p>

      {/* Horizontal track */}
      <div className="relative flex items-center">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />

        <div className="relative flex items-center justify-between w-full">
          {entries.map((entry, i) => {
            const d = localDate(entry.start_date)
            const isCurrent = entry.id === currentId
            const isPast = !isCurrent && d <= today
            const isUpcoming = d > today

            return (
              <div key={entry.id} className="flex flex-col items-center gap-1.5 z-10">
                {/* Label above */}
                <span className={`text-xs font-semibold leading-none ${
                  isCurrent ? 'text-blue-700' :
                  isUpcoming ? 'text-gray-400' :
                  'text-gray-300'
                }`}>
                  {entry.dose_mg} mg
                </span>

                {/* Node */}
                <div className={`rounded-full flex-shrink-0 ${
                  isCurrent
                    ? 'w-4 h-4 bg-blue-600 ring-4 ring-blue-100'
                    : isPast
                    ? 'w-2.5 h-2.5 bg-gray-300'
                    : 'w-2.5 h-2.5 bg-white border-2 border-dashed border-gray-300'
                }`} />

                {/* Label below: drug type for current, date for upcoming */}
                {isCurrent && entry.drug_type_name && (
                  <span className="text-xs text-blue-500 leading-none whitespace-nowrap">
                    {entry.drug_type_name}
                  </span>
                )}
                {isUpcoming && i === entries.findIndex(e => new Date(e.start_date) > today) && (
                  <span className="text-xs text-gray-400 leading-none whitespace-nowrap">
                    {new Date(entry.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {!isCurrent && !isUpcoming && (
                  <span className="text-xs leading-none opacity-0 select-none">·</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
