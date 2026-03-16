import { useState, type FormEvent } from 'react'
import { useConcerns } from './useConcerns'
import { nl } from '../../../i18n/nl'

export function ConcernScreen() {
  const { concerns, loading, submitConcern } = useConcerns()
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
      setTimeout(() => setSucces(false), 3000)
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">{nl.melding_titel}</h1>

      {/* Formulier */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-5">
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Ernst</legend>
          <div className="flex gap-3">
            {(['routine', 'urgent'] as const).map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={severity === s}
                onClick={() => setSeverity(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  severity === s
                    ? s === 'urgent'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {s === 'routine' ? nl.melding_ernst_routine : nl.melding_ernst_urgent}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.melding_omschrijving} <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={nl.melding_omschrijving_placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {succes && <p role="status" className="text-sm text-green-700">{nl.melding_succes}</p>}

        <button
          type="submit"
          disabled={submitting || !description.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitting ? nl.laden : nl.melding_versturen}
        </button>
      </form>

      {/* Geschiedenis */}
      <section aria-label={nl.melding_geschiedenis}>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{nl.melding_geschiedenis}</h2>

        {loading ? (
          <p className="text-gray-500 text-sm">{nl.laden}</p>
        ) : concerns.length === 0 ? (
          <p className="text-gray-500 text-sm">{nl.melding_geen}</p>
        ) : (
          <ul className="space-y-3">
            {concerns.map(c => (
              <li key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    c.severity === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.severity === 'urgent' ? nl.melding_ernst_urgent : nl.melding_ernst_routine}
                  </span>
                  <span className={`text-xs font-medium ${
                    c.status === 'reviewed' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {c.status === 'reviewed' ? nl.melding_status_beantwoord : nl.melding_status_open}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{c.description}</p>
                {c.doctor_response && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">{nl.melding_reactie_dokter}</p>
                    <p className="text-sm text-gray-700">{c.doctor_response}</p>
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
