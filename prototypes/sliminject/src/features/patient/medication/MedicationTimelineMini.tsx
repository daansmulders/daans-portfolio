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
      className="block card px-4 pt-3 pb-4 transition-colors"
      style={{ borderColor: '#E0DBD4' }}
      aria-label={nl.medicatie_tijdlijn}
    >
      <p className="section-label mb-3">
        {nl.medicatie_tijdlijn}
      </p>

      {/* Horizontal track */}
      <div className="relative flex items-center">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px" style={{ backgroundColor: '#E0DBD4' }} />

        <div className="relative flex items-center justify-between w-full">
          {entries.map((entry, i) => {
            const d = localDate(entry.start_date)
            const isCurrent = entry.id === currentId
            const isPast = !isCurrent && d <= today
            const isUpcoming = d > today

            return (
              <div key={entry.id} className="flex flex-col items-center gap-1.5 z-10">
                {/* Label above */}
                <span className="text-xs font-semibold leading-none" style={{
                  color: isCurrent ? '#2D7A5E' : isUpcoming ? '#AAA49C' : '#E0DBD4'
                }}>
                  {entry.dose_mg} mg
                </span>

                {/* Node */}
                <div className={`rounded-full flex-shrink-0 ${
                  isCurrent
                    ? 'timeline-dot-current w-4 h-4'
                    : isPast
                    ? 'timeline-dot-past w-2.5 h-2.5'
                    : 'timeline-dot-future w-2.5 h-2.5'
                }`} />

                {/* Label below: drug type for current, date for upcoming */}
                {isCurrent && entry.drug_type_name && (
                  <span className="text-xs leading-none whitespace-nowrap" style={{ color: '#2D7A5E' }}>
                    {entry.drug_type_name}
                  </span>
                )}
                {isUpcoming && i === entries.findIndex(e => new Date(e.start_date) > today) && (
                  <span className="text-xs leading-none whitespace-nowrap" style={{ color: '#AAA49C' }}>
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
