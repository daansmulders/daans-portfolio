import { usePatients } from './usePatients'
import { PatientListItem } from './PatientListItem'
import { nl } from '../../../i18n/nl'

export function DoctorOverview() {
  const { patients, loading } = usePatients()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{nl.dokter_overzicht_titel}</h1>

      {loading ? (
        <p className="text-gray-500">{nl.laden}</p>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{nl.dokter_overzicht_leeg}</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label={nl.dokter_overzicht_titel}>
          {patients.map(p => (
            <PatientListItem key={p.id} patient={p} />
          ))}
        </ul>
      )}
    </main>
  )
}
