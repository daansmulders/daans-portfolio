import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useProgressEntries } from './useProgressEntries'
import { ProgressChart } from './ProgressChart'
import { useOfflineSync } from '../../../hooks/useOfflineSync'
import { usePatientDosageSchedule } from '../medication/usePatientDosageSchedule'
import { MedicationTimelineMini } from '../medication/MedicationTimelineMini'
import { useEducationalContent } from '../content/useEducationalContent'
import { useAppointments } from '../../doctor/appointments/useAppointments'
import { useConcerns } from '../concerns/useConcerns'
import { getUnseenReviewedConcerns } from '../../../hooks/useSeenConcerns'
import { hasSeenOnboarding } from '../onboarding/OnboardingScreen'
import { nl } from '../../../i18n/nl'

export function PatientDashboard() {
  useOfflineSync()
  const navigate = useNavigate()
  const { entries, loading } = useProgressEntries()

  useEffect(() => {
    if (!loading && entries.length === 0 && !hasSeenOnboarding()) {
      navigate('/patient/onboarding', { replace: true })
    }
  }, [loading, entries.length, navigate])
  const { entries: scheduleEntries, current: currentDose, nextIncrease, daysUntilNext } = usePatientDosageSchedule()
  const { newCount: newContentCount } = useEducationalContent()
  const { upcoming: upcomingAppointments, next: nextAppointment, hoursUntilNext } = useAppointments()
  const { concerns } = useConcerns()
  const unseenReplies = getUnseenReviewedConcerns(concerns)
  const latestReply = unseenReplies[0] ?? null

  const lastEntry = entries[0] ?? null
  const daysSinceLastEntry = lastEntry
    ? Math.floor((Date.now() - new Date(lastEntry.logged_at).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const showWeeklyCheckin = entries.length > 0 && daysSinceLastEntry !== null && daysSinceLastEntry >= 7

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
      {latestReply && (
        <Link
          to="/patient/meldingen"
          className="block bg-green-50 border border-green-200 rounded-xl px-4 py-4 hover:border-green-300 transition-colors"
        >
          <p className="text-sm font-medium text-green-800 mb-1">{nl.dashboard_dokter_reactie}</p>
          <p className="text-sm text-green-700 line-clamp-2">{latestReply.doctor_response}</p>
          <p className="text-xs text-green-600 mt-2">{nl.dashboard_dokter_reactie_bekijken}</p>
        </Link>
      )}

      {/* Wekelijkse check-in herinnering */}
      {showWeeklyCheckin && (
        <Link
          to="/patient/log"
          className="block bg-purple-50 border border-purple-200 rounded-xl px-4 py-4 hover:border-purple-300 transition-colors"
        >
          <p className="text-sm font-semibold text-purple-800 mb-0.5">{nl.dashboard_wekelijkse_checkin}</p>
          <p className="text-sm text-purple-700">{nl.dashboard_wekelijkse_checkin_body}</p>
          <p className="text-xs text-purple-600 mt-2">{nl.dashboard_wekelijkse_checkin_cta}</p>
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

      {/* Medicatie mini-tijdlijn */}
      {scheduleEntries.length > 0 && (
        <MedicationTimelineMini entries={scheduleEntries} currentId={currentDose?.id ?? null} />
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
              {entries.slice(0, 5).map((entry) => {
                // Mijlpaal: is deze meting ~7 dagen na de eerste?
                const firstDate = new Date(entries[entries.length - 1].logged_at)
                const entryDate = new Date(entry.logged_at)
                const daysSince = Math.floor((entryDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
                const isMijlpaal = daysSince > 0 && daysSince % 7 < 2

                return (
                  <li key={entry.id} className={`border rounded-xl px-4 py-3 ${
                    isMijlpaal
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}>
                    {isMijlpaal && (
                      <p className="text-xs font-medium text-green-700 mb-1">
                        🎉 {nl.log_mijlpaal.replace('{n}', String(Math.round(daysSince / 7)))}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <time className="text-sm text-gray-500">
                        {new Date(entry.logged_at).toLocaleDateString('nl-NL', {
                          day: 'numeric', month: 'long',
                        })}
                      </time>
                      {entry.hunger_score != null && (
                        <span className="text-sm font-medium text-blue-600">
                          {nl.grafiek_honger} {entry.hunger_score}/5
                        </span>
                      )}
                    </div>
                    {entry.weight_kg != null && (
                      <p className="text-sm text-gray-700 mt-1">{entry.weight_kg} kg</p>
                    )}
                    {entry.symptoms.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{entry.symptoms.join(', ')}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
