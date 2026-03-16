import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressEntries } from './useProgressEntries'
import { nl } from '../../../i18n/nl'

const SYMPTOMEN = [
  nl.symptoom_misselijkheid,
  nl.symptoom_vermoeidheid,
  nl.symptoom_hoofdpijn,
  nl.symptoom_maagklachten,
  nl.symptoom_droge_mond,
  nl.symptoom_duizeligheid,
  nl.symptoom_constipatie,
]

export function LogEntryForm() {
  const { addEntry } = useProgressEntries()
  const navigate = useNavigate()
  const [gewicht, setGewicht] = useState('')
  const [welzijn, setWelzijn] = useState<number>(3)
  const [symptomen, setSymptomen] = useState<string[]>([])
  const [notities, setNotities] = useState('')
  const [loading, setLoading] = useState(false)
  const [succes, setSucces] = useState<'online' | 'offline' | null>(null)

  function toggleSymptoom(s: string) {
    setSymptomen(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { offline } = await addEntry({
      weight_kg: gewicht ? parseFloat(gewicht) : null,
      wellbeing_score: welzijn,
      symptoms: symptomen,
      notes: notities || null,
    })
    setSucces(offline ? 'offline' : 'online')
    setLoading(false)
    setTimeout(() => navigate('/patient/dashboard'), 1200)
  }

  const welzijnLabels = [nl.log_welzijn_1, nl.log_welzijn_2, nl.log_welzijn_3, nl.log_welzijn_4, nl.log_welzijn_5]

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{nl.log_titel}</h1>

      {!navigator.onLine && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {nl.offline_indicator} — {nl.offline_opgeslagen}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gewicht */}
        <div>
          <label htmlFor="gewicht" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.log_gewicht}
          </label>
          <input
            id="gewicht"
            type="number"
            step="0.1"
            min="30"
            max="300"
            value={gewicht}
            onChange={e => setGewicht(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="bijv. 82.5"
          />
        </div>

        {/* Welzijn */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            {nl.log_welzijn} <span aria-hidden="true">*</span>
          </legend>
          <div className="flex gap-2" role="group" aria-label={nl.log_welzijn}>
            {[1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                type="button"
                aria-label={welzijnLabels[score - 1]}
                aria-pressed={welzijn === score}
                onClick={() => setWelzijn(score)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  welzijn === score
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">{welzijnLabels[welzijn - 1]}</p>
        </fieldset>

        {/* Symptomen */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">{nl.log_symptomen}</legend>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMEN.map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={symptomen.includes(s)}
                onClick={() => toggleSymptoom(s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  symptomen.includes(s)
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Notities */}
        <div>
          <label htmlFor="notities" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.log_notities}
          </label>
          <textarea
            id="notities"
            rows={3}
            value={notities}
            onChange={e => setNotities(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {succes && (
          <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {succes === 'offline' ? nl.offline_opgeslagen : nl.log_succes}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? nl.laden : nl.log_opslaan}
        </button>
      </form>
    </main>
  )
}
