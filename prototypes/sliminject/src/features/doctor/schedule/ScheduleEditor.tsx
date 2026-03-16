import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDosageSchedule } from './useDosageSchedule'
import { nl } from '../../../i18n/nl'

export function ScheduleEditor() {
  const { id: patientId } = useParams<{ id: string }>()
  const { entries, loading, addEntry, removeEntry } = useDosageSchedule(patientId!)
  const [dose, setDose] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!dose || !date) return
    setSaving(true)
    try {
      await addEntry(parseFloat(dose), date, notes || undefined)
      setDose(''); setDate(''); setNotes('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dokter/patient/${patientId}`} className="text-sm text-blue-600 hover:underline">← {nl.terug}</Link>
        <h1 className="text-xl font-semibold text-gray-900">{nl.schema_titel}</h1>
      </div>

      {/* Bestaande entries */}
      {!loading && entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map(e => (
            <li key={e.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div>
                <span className="font-medium text-gray-900">{e.dose_mg} mg</span>
                <span className="text-sm text-gray-500 ml-3">
                  {new Date(e.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {e.notes && <p className="text-xs text-gray-500 mt-0.5">{e.notes}</p>}
              </div>
              <button
                onClick={() => removeEntry(e.id)}
                className="text-sm text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                aria-label={`${nl.schema_verwijderen} ${e.dose_mg} mg`}
              >
                {nl.schema_verwijderen}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Nieuwe entry */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">{nl.schema_toevoegen}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dose" className="block text-xs text-gray-500 mb-1">{nl.schema_dosis}</label>
            <input id="dose" type="number" step="0.25" min="0" value={dose}
              onChange={e => setDose(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.5"
            />
          </div>
          <div>
            <label htmlFor="start-date" className="block text-xs text-gray-500 mb-1">{nl.schema_startdatum}</label>
            <input id="start-date" type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="schema-notes" className="block text-xs text-gray-500 mb-1">{nl.schema_notitie}</label>
          <input id="schema-notes" type="text" value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={saving || !dose || !date}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {saving ? nl.laden : nl.schema_toevoegen}
        </button>
      </div>
    </main>
  )
}
