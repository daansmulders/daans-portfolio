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

  const accentColor = patient.open_concerns > 0
    ? '#A52020'
    : patient.needs_attention
    ? '#E8821A'
    : 'transparent'

  return (
    <li>
      <Link
        to={`/dokter/patient/${patient.id}`}
        className="card-interactive flex items-center justify-between p-4"
        style={accentColor !== 'transparent' ? { borderLeft: `4px solid ${accentColor}` } : {}}
      >
        <div className="min-w-0">
          <p className="font-semibold truncate" style={{ color: '#14130F' }}>
            {patient.full_name}
          </p>
          <p className="text-sm mt-0.5" style={{ color: '#6B6660' }}>
            {lastEntry
              ? `${nl.dokter_laatste_check}: ${lastEntry}`
              : nl.dokter_nog_niet_ingecheckt}
          </p>
          <p className="text-sm" style={{ color: '#AAA49C' }}>
            {patient.current_dosage_mg} mg
          </p>
        </div>

        <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-1.5">
          {patient.open_concerns > 0 && (
            <span
              className="badge badge-danger"
              aria-label={`${patient.open_concerns} ${patient.open_concerns === 1 ? nl.dokter_open_melding : nl.dokter_open_meldingen}`}
            >
              {patient.open_concerns}
            </span>
          )}
          {patient.open_concerns === 0 && patient.days_since_entry !== null && patient.days_since_entry >= 14 && (
            <span className="badge badge-amber">
              {nl.dokter_inactief_dagen.replace('{dagen}', String(patient.days_since_entry))}
            </span>
          )}
          {patient.last_entry_at === null && (
            <span className="badge badge-warm">{nl.dokter_nog_niet_ingecheckt}</span>
          )}
        </div>
      </Link>
    </li>
  )
}
