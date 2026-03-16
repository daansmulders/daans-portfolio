import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppointments } from './useAppointments'
import { nl } from '../../../i18n/nl'

export function AppointmentForm() {
  const { id: patientId } = useParams<{ id: string }>()
  const { appointments, createAppointment } = useAppointments(patientId)
  const navigate = useNavigate()
  const [datetime, setDatetime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= new Date())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!datetime || !patientId) return
    setSaving(true)
    setError(null)
    try {
      await createAppointment(patientId, new Date(datetime).toISOString(), notes || undefined)
      navigate(`/dokter/patient/${patientId}`)
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
      setSaving(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dokter/patient/${patientId}`} className="text-sm text-blue-600 hover:underline">← {nl.terug}</Link>
        <h1 className="text-xl font-semibold text-gray-900">{nl.afspraak_titel}</h1>
      </div>

      {/* Bestaande afspraken */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{nl.dokter_profiel_afspraken_gepland}</h2>
          <ul className="space-y-2">
            {upcoming.map(a => (
              <li key={a.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700">
                {new Date(a.scheduled_at).toLocaleDateString('nl-NL', {
                  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                })}
                {a.notes && <p className="text-gray-500 mt-0.5">{a.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Nieuw formulier */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.afspraak_datum_tijd} <span aria-hidden="true">*</span>
          </label>
          <input
            id="datetime"
            type="datetime-local"
            required
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="appt-notes" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.afspraak_notities}
          </label>
          <input
            id="appt-notes"
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving || !datetime}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {saving ? nl.laden : nl.afspraak_plannen}
        </button>
      </form>
    </main>
  )
}
