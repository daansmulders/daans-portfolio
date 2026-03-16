import { useParams, Link } from 'react-router-dom'
import { useProgressEntries } from '../../patient/dashboard/useProgressEntries'
import { ProgressChart } from '../../patient/dashboard/ProgressChart'
import { ConcernInbox } from './ConcernInbox'
import { AdviceEditor } from './AdviceEditor'
import { useDosageSchedule } from '../schedule/useDosageSchedule'
import { nl } from '../../../i18n/nl'

export function PatientProfile() {
  const { id: patientId } = useParams<{ id: string }>()
  const { entries, loading: entriesLoading } = useProgressEntries(patientId)
  const { entries: schedule } = useDosageSchedule(patientId!)

  const currentDose = schedule
    .filter(e => new Date(e.start_date) <= new Date())
    .sort((a, b) => b.start_date.localeCompare(a.start_date))[0]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <Link to="/dokter/overzicht" className="text-sm text-blue-600 hover:underline">← {nl.nav_patienten}</Link>

      {/* Voortgang */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">{nl.dokter_profiel_voortgang}</h2>
        {entriesLoading ? (
          <p className="text-sm text-gray-500">{nl.laden}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-500">{nl.dokter_profiel_geen_metingen}</p>
        ) : (
          <ProgressChart entries={entries} />
        )}
      </section>

      {/* Medicatieschema */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{nl.dokter_profiel_schema}</h2>
          <Link
            to={`/dokter/patient/${patientId}/schema`}
            className="text-sm text-blue-600 hover:underline"
          >
            {nl.dokter_profiel_bewerken}
          </Link>
        </div>
        {schedule.length === 0 ? (
          <p className="text-sm text-gray-500">{nl.dokter_profiel_geen_schema}</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            {currentDose && (
              <p className="text-sm text-gray-700">
                Huidige dosering: <strong>{currentDose.dose_mg} mg</strong>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">{schedule.length} stappen in schema</p>
          </div>
        )}
      </section>

      {/* Advies */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">{nl.dokter_profiel_advies}</h2>
        <AdviceEditor patientId={patientId!} />
      </section>

      {/* Meldingen */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{nl.dokter_profiel_meldingen}</h2>
        </div>
        <ConcernInbox patientId={patientId!} />
      </section>

      {/* Afspraak */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{nl.dokter_profiel_afspraken}</h2>
          <Link
            to={`/dokter/patient/${patientId}/afspraak`}
            className="text-sm text-blue-600 hover:underline"
          >
            {nl.afspraak_plannen}
          </Link>
        </div>
      </section>
    </main>
  )
}
