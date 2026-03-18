import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressEntries } from './useProgressEntries'
import { nl } from '../../../i18n/nl'
import { showSuccess } from '../../../lib/toast'
import { selectTip, type SelectedTip } from '../symptoms/symptomTips'
import { useSymptomTipThrottle } from '../symptoms/useSymptomTipThrottle'
import { SeveritySelector } from '../symptoms/SeveritySelector'
import { TipCard } from '../symptoms/TipCard'
import { DoctorNudge } from '../symptoms/DoctorNudge'
import type { SymptomEntry } from '../../../lib/supabase'

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
  nl.symptoom_haaruitval,
  nl.symptoom_injectieplaatsreactie,
]

export function LogEntryForm() {
  const { addEntry, entries } = useProgressEntries()
  const navigate = useNavigate()
  const { wasShownRecently, markShown, getNextVariantIndex } = useSymptomTipThrottle()
  const [gewicht, setGewicht]       = useState('')
  const [honger, setHonger]         = useState<number>(3)
  const [voedselruis, setVoedselruis] = useState<number | null>(null)
  const [symptomen, setSymptomen]   = useState<Map<string, number>>(new Map())
  const [notities, setNotities]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [succes, setSucces]       = useState<'online' | 'offline' | 'tip' | 'nudge' | null>(null)
  const [shownTip, setShownTip]     = useState<SelectedTip | null>(null)
  const [nudgeSymptom, setNudgeSymptom] = useState<string | null>(null)
  const [showMoreSymptoms, setShowMoreSymptoms] = useState(false)

  // Pre-fill weight with last recorded value once entries load
  useEffect(() => {
    if (gewicht === '' && entries.length > 0) {
      const last = entries.find(e => e.weight_kg != null)?.weight_kg
      if (last != null) setGewicht(String(last))
    }
  }, [entries]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSymptoom(s: string) {
    setSymptomen(prev => {
      const next = new Map(prev)
      if (next.has(s)) {
        next.delete(s)
      } else {
        next.set(s, 1)
      }
      return next
    })
  }

  function setSeverity(s: string, severity: number) {
    setSymptomen(prev => {
      const next = new Map(prev)
      next.set(s, severity)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const symptomEntries: SymptomEntry[] = Array.from(symptomen.entries()).map(
      ([name, severity]) => ({ name, severity })
    )
    const symptomNames = symptomEntries.map(s => s.name)

    const { offline } = await addEntry({
      weight_kg:        gewicht ? parseFloat(gewicht) : null,
      hunger_score:     honger,
      food_noise_score: voedselruis,
      symptoms:         symptomEntries,
      notes:            notities || null,
    })

    // Check for severe symptoms (4-5) → doctor nudge
    const severeSymptom = symptomEntries
      .filter(s => s.severity >= 4)
      .sort((a, b) => b.severity - a.severity)[0]

    if (severeSymptom) {
      setNudgeSymptom(severeSymptom.name)
      setSucces('nudge')
      setLoading(false)
      showSuccess(offline ? nl.offline_opgeslagen : nl.log_succes)
      return
    }

    // Check for symptom tip before auto-navigating
    const tip = symptomNames.length > 0 ? selectTip(symptomNames, symptomEntries, wasShownRecently, getNextVariantIndex) : null
    if (tip) {
      markShown(tip.symptom, tip.variantIndex)
      setShownTip(tip)
      setSucces('tip')
      setLoading(false)
      showSuccess(offline ? nl.offline_opgeslagen : nl.log_succes)
      return
    }

    showSuccess(offline ? nl.offline_opgeslagen : nl.log_succes)
    setSucces(offline ? 'offline' : 'online')
    setLoading(false)
    setTimeout(() => navigate('/patient/dashboard'), 1200)
  }

  const hongerLabels = [nl.log_honger_1, nl.log_honger_2, nl.log_honger_3, nl.log_honger_4, nl.log_honger_5]
  const voedselruisLabels = [nl.log_voedselruis_1, nl.log_voedselruis_2, nl.log_voedselruis_3, nl.log_voedselruis_4, nl.log_voedselruis_5]

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

        {/* Voedselruis */}
        <fieldset>
          <legend className="block text-sm font-medium mb-1" style={{ color: '#2E2B24' }}>
            {nl.log_voedselruis}
          </legend>
          <p className="text-xs mb-3" style={{ color: '#6B6660' }}>
            {nl.log_voedselruis_optioneel}
          </p>
          <div className="flex gap-2" role="group" aria-label={nl.log_voedselruis}>
            {[1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                type="button"
                aria-label={voedselruisLabels[score - 1]}
                aria-pressed={voedselruis === score}
                onClick={() => setVoedselruis(prev => prev === score ? null : score)}
                className={`hunger-btn${voedselruis === score ? ' selected' : ''}`}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1.5 px-0.5">
            <span className="text-xs" style={{ color: '#AAA49C' }}>{nl.log_voedselruis_min}</span>
            <span className="text-xs" style={{ color: '#AAA49C' }}>{nl.log_voedselruis_max}</span>
          </div>
          {voedselruis !== null && (
            <p className="mt-1 text-sm text-center" style={{ color: '#6B6660' }}>
              {voedselruisLabels[voedselruis - 1]}
            </p>
          )}
        </fieldset>

        {/* Symptomen */}
        <fieldset>
          <legend className="block text-sm font-medium mb-3" style={{ color: '#2E2B24' }}>
            {nl.log_symptomen}
          </legend>
          <div className="space-y-2.5">
            {PRIMARY_SYMPTOMS.map(s => (
              <div key={s} className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-pressed={symptomen.has(s)}
                  onClick={() => toggleSymptoom(s)}
                  className={`chip flex-shrink-0${symptomen.has(s) ? ' selected' : ''}`}
                >
                  {s}
                </button>
                {symptomen.has(s) && (
                  <SeveritySelector value={symptomen.get(s)!} onChange={(v) => setSeverity(s, v)} />
                )}
              </div>
            ))}
            {showMoreSymptoms && SECONDARY_SYMPTOMS.map(s => (
              <div key={s} className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-pressed={symptomen.has(s)}
                  onClick={() => toggleSymptoom(s)}
                  className={`chip flex-shrink-0${symptomen.has(s) ? ' selected' : ''}`}
                >
                  {s}
                </button>
                {symptomen.has(s) && (
                  <SeveritySelector value={symptomen.get(s)!} onChange={(v) => setSeverity(s, v)} />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowMoreSymptoms(v => !v)}
              className="chip"
              style={{ borderStyle: 'dashed', color: '#2D7A5E', borderColor: '#A8DDD0' }}
            >
              {showMoreSymptoms ? nl.symptomen_minder : nl.symptomen_meer}
            </button>
          </div>
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

        {(succes === 'online' || succes === 'offline') && (
          <div role="status" className="alert-brand text-sm font-medium">
            {succes === 'offline' ? nl.offline_opgeslagen : nl.log_succes}
          </div>
        )}

        {succes === 'tip' && shownTip && (
          <div className="space-y-3">
            <div role="status" className="alert-brand text-sm font-medium">
              {nl.log_succes}
            </div>
            <TipCard heading={shownTip.heading} body={shownTip.body} symptom={shownTip.symptom} />
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="btn btn-primary w-full"
              style={{ padding: '.875rem', fontSize: '1rem', borderRadius: '12px' }}
            >
              {nl.tip_terug_dashboard}
            </button>
          </div>
        )}

        {succes === 'nudge' && nudgeSymptom && (
          <div className="space-y-3">
            <div role="status" className="alert-brand text-sm font-medium">
              {nl.log_succes}
            </div>
            <DoctorNudge symptom={nudgeSymptom} />
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="btn btn-ghost w-full"
            >
              {nl.tip_terug_dashboard}
            </button>
          </div>
        )}

        {succes !== 'tip' && succes !== 'nudge' && (
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{ padding: '.875rem', fontSize: '1rem', borderRadius: '12px' }}
          >
            {loading ? nl.laden : nl.log_opslaan}
          </button>
        )}
      </form>
    </main>
  )
}
