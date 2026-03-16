import { Link } from 'react-router-dom'
import { useProgressEntries } from './useProgressEntries'
import { ProgressChart } from './ProgressChart'
import { useOfflineSync } from '../../../hooks/useOfflineSync'
import { usePatientDosageSchedule } from '../medication/usePatientDosageSchedule'
import { useEducationalContent } from '../content/useEducationalContent'
import { useAppointments } from '../../doctor/appointments/useAppointments'
import { useConcerns } from '../concerns/useConcerns'
import { nl } from '../../../i18n/nl'

export function PatientDashboard() {
  useOfflineSync()
  const { entries, loading } = useProgressEntries()
  const { nextIncrease, daysUntilNext } = usePatientDosageSchedule()
  const { newCount: newContentCount } = useEducationalContent()
  const { upcoming: upcomingAppointments, next: nextAppointment, hoursUntilNext } = useAppointments()
  const { concerns } = useConcerns()
  const doctorRepliedCount = concerns.filter(c => c.status === 'reviewed').length

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <p className="text-gray-500">{nl.laden}</p>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Nieuwe educatieve inhoud */}
      {newContentCount > 0 && (
        <Link
          to="/patient/inhoud"
          className="block bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 hover:border-blue-300 transition-colors"
        >
          {nl.dashboard_nieuwe_inhoud} ({newContentCount}) →
        </Link>
      )}

      {/* Dokter heeft gereageerd op een melding */}
      {doctorRepliedCount > 0 && (
        <Link
          to="/patient/meldingen"
          className="block bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 hover:border-green-300 transition-colors"
        >
          {nl.dashboard_dokter_reactie} ({doctorRepliedCount}) →
        </Link>
      )}

      {/* Afspraken */}
      {upcomingAppointments.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{nl.dokter_profiel_afspraken}</h2>
          <ul className="space-y-2">
            {upcomingAppointments.map(a => (
              <li
                key={a.id}
                className={`border rounded-xl px-4 py-3 text-sm ${
                  nextAppointment?.id === a.id && hoursUntilNext !== null && hoursUntilNext <= 48
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {new Date(a.scheduled_at).toLocaleDateString('nl-NL', {
                  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                })}
                {a.notes && <p className="text-gray-500 text-xs mt-0.5">{a.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7-daagse doseringswaarschuwing */}
      {nextIncrease && daysUntilNext !== null && daysUntilNext <= 7 && (
        <Link
          to="/patient/medicatie"
          className="block bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800 hover:border-amber-400 transition-colors"
        >
          {nl.dashboard_dosering_toename.replace('{dagen}', String(daysUntilNext))} →
        </Link>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{nl.dashboard_titel}</h1>
        <Link
          to="/patient/log"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {nl.dashboard_voeg_toe}
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">{nl.dashboard_geen_gegevens}</p>
          <Link
            to="/patient/log"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            {nl.dashboard_voeg_toe}
          </Link>
        </div>
      ) : (
        <>
          <ProgressChart entries={entries} />

          <section aria-label={nl.dashboard_recente_metingen}>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{nl.dashboard_recente_metingen}</h2>
            <ul className="space-y-2">
              {entries.slice(0, 5).map(entry => (
                <li key={entry.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {new Date(entry.logged_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </time>
                    <span className="text-sm font-medium text-blue-600">
                      Welzijn {entry.wellbeing_score}/5
                    </span>
                  </div>
                  {entry.weight_kg != null && (
                    <p className="text-sm text-gray-700 mt-1">{entry.weight_kg} kg</p>
                  )}
                  {entry.symptoms.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{entry.symptoms.join(', ')}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
