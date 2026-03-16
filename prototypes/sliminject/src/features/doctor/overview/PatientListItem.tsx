import { Link } from 'react-router-dom'
import type { PatientSummary } from './usePatients'
import { nl } from '../../../i18n/nl'

interface PatientListItemProps {
  patient: PatientSummary
}

export function PatientListItem({ patient }: PatientListItemProps) {
  const lastEntry = patient.last_entry_at
    ? new Date(patient.last_entry_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
    : null

  const borderColor = patient.open_concerns > 0
    ? 'border-red-200 hover:border-red-300'
    : patient.needs_attention
    ? 'border-amber-200 hover:border-amber-300'
    : 'border-gray-200 hover:border-blue-300'

  return (
    <li>
      <Link
        to={`/dokter/patient/${patient.id}`}
        className={`flex items-center justify-between px-4 py-4 bg-white border rounded-xl hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderColor}`}
      >
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastEntry
              ? `${nl.dokter_laatste_check}: ${lastEntry}`
              : nl.dokter_nog_niet_ingecheckt}
          </p>
          <p className="text-sm text-gray-500">{patient.current_dosage_mg} mg</p>
        </div>

        <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-1.5">
          {patient.open_concerns > 0 && (
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold"
              aria-label={`${patient.open_concerns} ${patient.open_concerns === 1 ? nl.dokter_open_melding : nl.dokter_open_meldingen}`}
            >
              {patient.open_concerns}
            </span>
          )}
          {patient.open_concerns === 0 && patient.days_since_entry !== null && patient.days_since_entry >= 14 && (
            <span className="text-xs text-amber-600 font-medium">
              {nl.dokter_inactief_dagen.replace('{dagen}', String(patient.days_since_entry))}
            </span>
          )}
          {patient.last_entry_at === null && (
            <span className="text-xs text-gray-400">{nl.dokter_nog_niet_ingecheckt}</span>
          )}
        </div>
      </Link>
    </li>
  )
}
