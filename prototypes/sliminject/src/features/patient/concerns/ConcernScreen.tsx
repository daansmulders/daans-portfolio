import { useState, useEffect, type FormEvent } from 'react'
import { useConcerns } from './useConcerns'
import { markConcernsAsSeen } from '../../../hooks/useSeenConcerns'
import { nl } from '../../../i18n/nl'
import { showSuccess, showError } from '../../../lib/toast'
import { EmptyState } from '../../../components/EmptyState'

export function ConcernScreen() {
  const { concerns, loading, submitConcern } = useConcerns()

  useEffect(() => {
    if (concerns.length > 0) {
      const reviewedIds = concerns
        .filter(c => c.status === 'reviewed' && c.doctor_response)
        .map(c => c.id)
      if (reviewedIds.length > 0) markConcernsAsSeen(reviewedIds)
    }
  }, [concerns])
  const [severity, setSeverity] = useState<'routine' | 'urgent'>('routine')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [succes, setSucces] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await submitConcern(severity, description)
      setDescription('')
      setSeverity('routine')
      setSucces(true)
      showSuccess(nl.melding_succes)
      setTimeout(() => setSucces(false), 3000)
    } catch {
      setError(nl.toast_fout)
      showError(nl.toast_fout)
    } finally {
      setSubmitting(false)
    }
  }

  const responseTimeMessage = severity === 'urgent'
    ? nl.melding_verwacht_urgent
    : nl.melding_verwacht_routine

  return (
    <main className="page space-y-8">
      <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>{nl.melding_titel}</h1>

      {/* Formulier */}
      <form onSubmit={handleSubmit} className="space-y-4 card p-5">
        <fieldset>
          <legend className="text-sm font-medium mb-2" style={{ color: '#14130F' }}>Ernst</legend>
          <div className="flex gap-3">
            {(['routine', 'urgent'] as const).map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={severity === s}
                onClick={() => setSeverity(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  severity === s
                    ? s === 'urgent'
                      ? 'alert-danger'
                      : 'alert-brand'
                    : 'bg-white border'
                }`}
                style={severity !== s ? { color: '#6B6660', borderColor: '#E0DBD4' } : undefined}
              >
                {s === 'routine' ? nl.melding_ernst_routine : nl.melding_ernst_urgent}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.melding_omschrijving} <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={nl.melding_omschrijving_placeholder}
            className="input w-full resize-none"
          />
        </div>

        {error && <p role="alert" className="text-sm" style={{ color: '#A52020' }}>{error}</p>}
        {succes && (
          <div role="status" className="alert-brand rounded-xl px-4 py-3 space-y-1">
            <p className="text-sm font-medium" style={{ color: '#1A4A36' }}>{nl.melding_succes}</p>
            <p className="text-sm" style={{ color: '#2D7A5E' }}>{responseTimeMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !description.trim()}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {submitting ? nl.laden : nl.melding_versturen}
        </button>
      </form>

      {/* Geschiedenis */}
      <section aria-label={nl.melding_geschiedenis}>
        <h2 className="section-label mb-3">{nl.melding_geschiedenis}</h2>

        {loading ? (
          <p className="text-sm" style={{ color: '#6B6660' }}>{nl.laden}</p>
        ) : concerns.length === 0 ? (
          <EmptyState
            heading={nl.empty_meldingen_heading}
            body={nl.empty_meldingen_body}
          />
        ) : (
          <ul className="space-y-3">
            {concerns.map(c => (
              <li key={c.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${c.severity === 'urgent' ? 'badge-danger' : 'badge-warm'}`}>
                    {c.severity === 'urgent' ? nl.melding_ernst_urgent : nl.melding_ernst_routine}
                  </span>
                  <span className="text-xs font-medium" style={{
                    color: c.status === 'reviewed' ? '#2D7A5E' : '#E8821A'
                  }}>
                    {c.status === 'reviewed' ? nl.melding_status_beantwoord : nl.melding_status_open}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#14130F' }}>{c.description}</p>
                {c.status === 'open' && (
                  <p className="text-xs mt-1.5" style={{ color: '#6B6660' }}>
                    {c.severity === 'urgent' ? nl.melding_verwacht_urgent : nl.melding_verwacht_routine}
                  </p>
                )}
                {c.doctor_response && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #E0DBD4' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B6660' }}>{nl.melding_reactie_dokter}</p>
                    <p className="text-sm" style={{ color: '#14130F' }}>{c.doctor_response}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
