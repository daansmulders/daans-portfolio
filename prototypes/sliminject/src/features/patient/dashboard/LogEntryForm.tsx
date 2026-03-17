import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressEntries } from './useProgressEntries'
import { nl } from '../../../i18n/nl'
import { showSuccess } from '../../../lib/toast'

const PRIMARY_SYMPTOMS = [
  nl.symptoom_misselijkheid,
  nl.symptoom_maagklachten,
  nl.symptoom_vermoeidheid,
]

const SECONDARY_SYMPTOMS = [
  nl.symptoom_hoofdpijn,
  nl.symptoom_droge_mond,
  nl.symptoom_duizeligheid,
  nl.symptoom_constipatie,
]

export function LogEntryForm() {
  const { addEntry, entries } = useProgressEntries()
  const navigate = useNavigate()
  const [gewicht, setGewicht]     = useState('')
  const [honger, setHonger]       = useState<number>(3)
  const [symptomen, setSymptomen] = useState<string[]>([])
  const [notities, setNotities]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [succes, setSucces]       = useState<'online' | 'offline' | 'mijlpaal' | null>(null)
  const [mijlpaalWeek, setMijlpaalWeek] = useState<number | null>(null)
  const [showMoreSymptoms, setShowMoreSymptoms] = useState(false)

  function toggleSymptoom(s: string) {
    setSymptomen(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { offline } = await addEntry({
      weight_kg:    gewicht ? parseFloat(gewicht) : null,
      hunger_score: honger,
      symptoms:     symptomen,
      notes:        notities || null,
    })

    // Milestone: only fire for the FIRST log of a new treatment week
    if (entries.length > 0) {
      const firstDate = new Date(entries[entries.length - 1].logged_at)
      const msPerWeek = 1000 * 60 * 60 * 24 * 7
      const currentWeek = Math.floor((Date.now() - firstDate.getTime()) / msPerWeek)
      const alreadyLoggedThisWeek = entries.some(e =>
        Math.floor((new Date(e.logged_at).getTime() - firstDate.getTime()) / msPerWeek) === currentWeek
      )
      if (currentWeek > 0 && !alreadyLoggedThisWeek) {
        setMijlpaalWeek(currentWeek)
        setSucces('mijlpaal')
        setLoading(false)
        showSuccess(nl.log_mijlpaal.replace('{n}', String(currentWeek)))
        setTimeout(() => navigate('/patient/dashboard'), 3000)
        return
      }
    }

    showSuccess(offline ? nl.offline_opgeslagen : nl.log_succes)
    setSucces(offline ? 'offline' : 'online')
    setLoading(false)
    setTimeout(() => navigate('/patient/dashboard'), 1200)
  }

  const hongerLabels = [nl.log_honger_1, nl.log_honger_2, nl.log_honger_3, nl.log_honger_4, nl.log_honger_5]

  return (
    <main className="page">
      <h1 className="text-xl font-semibold mb-6" style={{ color: '#14130F' }}>
        {nl.log_titel}
      </h1>

      {!navigator.onLine && (
        <div className="alert-amber mb-5 text-sm font-medium">
          {nl.offline_indicator} — {nl.offline_opgeslagen}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gewicht */}
        <div>
          <label htmlFor="gewicht" className="block text-sm font-medium mb-1.5" style={{ color: '#2E2B24' }}>
            {nl.log_gewicht}
          </label>
          <div className="relative">
            <input
              id="gewicht"
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={gewicht}
              onChange={e => setGewicht(e.target.value)}
              className="input pr-10 text-lg font-semibold"
              placeholder="82.5"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
              style={{ color: '#AAA49C' }}
            >
              kg
            </span>
          </div>
        </div>

        {/* Hongergevoel */}
        <fieldset>
          <legend className="block text-sm font-medium mb-3" style={{ color: '#2E2B24' }}>
            {nl.log_honger} <span aria-hidden="true" style={{ color: '#2D7A5E' }}>*</span>
          </legend>
          <div className="flex gap-2" role="group" aria-label={nl.log_honger}>
            {[1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                type="button"
                aria-label={hongerLabels[score - 1]}
                aria-pressed={honger === score}
                onClick={() => setHonger(score)}
                className={`hunger-btn${honger === score ? ' selected' : ''}`}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1.5 px-0.5">
            <span className="text-xs" style={{ color: '#AAA49C' }}>{nl.honger_min}</span>
            <span className="text-xs" style={{ color: '#AAA49C' }}>{nl.honger_max}</span>
          </div>
          <p className="mt-1 text-sm text-center" style={{ color: '#6B6660' }}>
            {hongerLabels[honger - 1]}
          </p>
        </fieldset>

        {/* Symptomen */}
        <fieldset>
          <legend className="block text-sm font-medium mb-3" style={{ color: '#2E2B24' }}>
            {nl.log_symptomen}
          </legend>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_SYMPTOMS.map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={symptomen.includes(s)}
                onClick={() => toggleSymptoom(s)}
                className={`chip${symptomen.includes(s) ? ' selected' : ''}`}
              >
                {s}
              </button>
            ))}
            {showMoreSymptoms && SECONDARY_SYMPTOMS.map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={symptomen.includes(s)}
                onClick={() => toggleSymptoom(s)}
                className={`chip${symptomen.includes(s) ? ' selected' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMoreSymptoms(v => !v)}
            className="mt-2 text-xs font-medium"
            style={{ color: '#2D7A5E' }}
          >
            {showMoreSymptoms ? nl.symptomen_minder : nl.symptomen_meer}
          </button>
        </fieldset>

        {/* Notities */}
        <div>
          <label htmlFor="notities" className="block text-sm font-medium mb-1.5" style={{ color: '#2E2B24' }}>
            {nl.log_notities}
          </label>
          <textarea
            id="notities"
            rows={3}
            value={notities}
            onChange={e => setNotities(e.target.value)}
            className="input resize-none"
            style={{ minHeight: '80px' }}
          />
        </div>

        {succes === 'mijlpaal' && mijlpaalWeek && (
          <div role="status" className="milestone card p-6 text-center" style={{ background: '#EDF7F4' }}>
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-semibold text-lg mb-1" style={{ color: '#1A4A36' }}>
              {nl.log_mijlpaal.replace('{n}', String(mijlpaalWeek))}
            </p>
            <p className="text-sm" style={{ color: '#2D7A5E' }}>{nl.log_mijlpaal_subtitel}</p>
          </div>
        )}
        {(succes === 'online' || succes === 'offline') && (
          <div role="status" className="alert-brand text-sm font-medium">
            {succes === 'offline' ? nl.offline_opgeslagen : nl.log_succes}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
          style={{ padding: '.875rem', fontSize: '1rem', borderRadius: '12px' }}
        >
          {loading ? nl.laden : nl.log_opslaan}
        </button>
      </form>
    </main>
  )
}
