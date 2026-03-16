import { Link } from 'react-router-dom'
import type { PatientSummary } from './usePatients'
import { nl } from '../../../i18n/nl'

interface PatientListItemProps {
  patient: PatientSummary
}

export function PatientListItem({ patient }: PatientListItemProps) {
  const lastEntry = patient.last_entry_at
    ? new Date(patient.last_entry_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
    : nl.dokter_nog_niet_ingecheckt

  return (
    <li>
      <Link
        to={`/dokter/patient/${patient.id}`}
        className="flex items-center justify-between px-4 py-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {nl.dokter_laatste_check}: {lastEntry}
          </p>
          <p className="text-sm text-gray-500">
            {patient.current_dosage_mg} mg
          </p>
        </div>

        {patient.open_concerns > 0 && (
          <span
            className="ml-4 flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold"
            aria-label={`${patient.open_concerns} ${patient.open_concerns === 1 ? nl.dokter_open_melding : nl.dokter_open_meldingen}`}
          >
            {patient.open_concerns}
          </span>
        )}
      </Link>
    </li>
  )
}
