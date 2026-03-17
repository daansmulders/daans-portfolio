import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppointments } from './useAppointments'
import { nl } from '../../../i18n/nl'
import { showSuccess, showError } from '../../../lib/toast'

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
      showSuccess(nl.afspraak_succes)
      navigate(`/dokter/patient/${patientId}`)
    } catch {
      const msg = nl.toast_fout
      setError(msg)
      showError(msg)
      setSaving(false)
    }
  }

  return (
    <main className="page-doctor space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dokter/patient/${patientId}`} className="text-sm hover:underline" style={{ color: '#2D7A5E' }}>← {nl.terug}</Link>
        <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>{nl.afspraak_titel}</h1>
      </div>

      {/* Bestaande afspraken */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="section-label mb-3">{nl.dokter_profiel_afspraken_gepland}</h2>
          <ul className="space-y-2">
            {upcoming.map(a => (
              <li key={a.id} className="card px-4 py-3 text-sm" style={{ color: '#14130F' }}>
                {new Date(a.scheduled_at).toLocaleDateString('nl-NL', {
                  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                })}
                {a.notes && <p className="mt-0.5" style={{ color: '#6B6660' }}>{a.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Nieuw formulier */}
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label htmlFor="datetime" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.afspraak_datum_tijd} <span aria-hidden="true">*</span>
          </label>
          <input
            id="datetime"
            type="datetime-local"
            required
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="appt-notes" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.afspraak_notities}
          </label>
          <input
            id="appt-notes"
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input w-full"
          />
        </div>
        {error && <p role="alert" className="text-sm" style={{ color: '#A52020' }}>{error}</p>}
        <button
          type="submit"
          disabled={saving || !datetime}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {saving ? nl.laden : nl.afspraak_plannen}
        </button>
      </form>
    </main>
  )
}
