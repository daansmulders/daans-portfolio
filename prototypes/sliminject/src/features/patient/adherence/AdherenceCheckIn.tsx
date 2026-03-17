import { useState } from 'react'
import { useAdherenceCheckIn } from './useAdherenceCheckIn'

export function AdherenceCheckIn() {
  const { isDue, submitting, submitAdherence } = useAdherenceCheckIn()
  const [showNoteField, setShowNoteField] = useState(false)
  const [note, setNote] = useState('')

  if (!isDue) return null

  async function handleResponse(response: 'confirmed' | 'skipped' | 'adjusted') {
    if (response === 'adjusted' && !showNoteField) {
      setShowNoteField(true)
      return
    }
    await submitAdherence(response, response === 'adjusted' ? note : undefined)
    setShowNoteField(false)
    setNote('')
  }

  return (
    <div className="card p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>
          Injectie deze week
        </p>
        <p className="text-sm mt-0.5" style={{ color: '#14130F' }}>
          Heb je je injectie gezet?
        </p>
      </div>

      {showNoteField ? (
        <div className="space-y-2">
          <textarea
            className="input w-full resize-none"
            rows={2}
            placeholder="Optionele toelichting (bijv. halve dosis, dag uitgesteld)"
            value={note}
            onChange={e => setNote(e.target.value)}
            autoFocus
            style={{ fontSize: '0.875rem' }}
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={() => handleResponse('adjusted')}
              disabled={submitting}
            >
              {submitting ? 'Opslaan…' : 'Opslaan'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setShowNoteField(false); setNote('') }}
              disabled={submitting}
            >
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleResponse('confirmed')}
            disabled={submitting}
          >
            ✓ Ja, genomen
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleResponse('skipped')}
            disabled={submitting}
          >
            Nee, overgeslagen
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleResponse('adjusted')}
            disabled={submitting}
          >
            Andere dosis
          </button>
        </div>
      )}
    </div>
  )
}
