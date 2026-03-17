import { useState } from 'react'
import { useConcerns } from '../../patient/concerns/useConcerns'
import { nl } from '../../../i18n/nl'
import { showSuccess, showError } from '../../../lib/toast'

interface ConcernInboxProps {
  patientId: string
}

export function ConcernInbox({ patientId }: ConcernInboxProps) {
  const { concerns, loading, respondToConcern } = useConcerns(patientId)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  async function handleRespond(concernId: string) {
    const text = responses[concernId]?.trim()
    if (!text) return
    setSubmitting(concernId)
    try {
      await respondToConcern(concernId, text)
      setResponses(prev => ({ ...prev, [concernId]: '' }))
      showSuccess(nl.toast_reactie_verstuurd)
    } catch {
      showError(nl.toast_fout)
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">{nl.laden}</p>
  if (concerns.length === 0) return <p className="text-sm text-gray-500">{nl.melding_geen}</p>

  return (
    <ul className="space-y-4">
      {concerns.map(c => (
        <li key={c.id} className={`border rounded-xl p-4 ${
          c.status === 'open' && c.severity === 'urgent'
            ? 'border-red-300 bg-red-50'
            : c.status === 'open'
            ? 'border-amber-200 bg-amber-50'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              c.severity === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {c.severity === 'urgent' ? nl.melding_ernst_urgent : nl.melding_ernst_routine}
            </span>
            <time className="text-xs text-gray-400">
              {new Date(c.submitted_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
            </time>
          </div>

          <p className="text-sm text-gray-800 mb-3">{c.description}</p>

          {c.doctor_response ? (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{nl.melding_reactie_dokter}</p>
              <p className="text-sm text-gray-700">{c.doctor_response}</p>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <label htmlFor={`response-${c.id}`} className="block text-xs font-medium text-gray-600">
                {nl.dokter_reageer}
              </label>
              <textarea
                id={`response-${c.id}`}
                rows={2}
                value={responses[c.id] ?? ''}
                onChange={e => setResponses(prev => ({ ...prev, [c.id]: e.target.value }))}
                placeholder={nl.dokter_reactie_placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={() => handleRespond(c.id)}
                disabled={submitting === c.id || !responses[c.id]?.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {submitting === c.id ? nl.laden : nl.dokter_reactie_versturen}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
