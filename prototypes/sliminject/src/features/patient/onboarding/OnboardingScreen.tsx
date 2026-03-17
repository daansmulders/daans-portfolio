import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientDosageSchedule } from '../medication/usePatientDosageSchedule'
import { useProgressEntries } from '../dashboard/useProgressEntries'
import { nl } from '../../../i18n/nl'

const ONBOARDING_KEY = 'sliminject_onboarding_done'

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, '1')
}

export function hasSeenOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

const STEPS = 4

export function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { current, nextIncrease, daysUntilNext } = usePatientDosageSchedule()
  const { addEntry } = useProgressEntries()

  // Step 4 form state
  const [gewicht, setGewicht] = useState('')
  const [honger, setHonger] = useState<number>(3)
  const [saving, setSaving] = useState(false)

  function next() {
    if (step < STEPS - 1) {
      setStep(s => s + 1)
    }
  }

  function skip() {
    markOnboardingDone()
    navigate('/patient/dashboard')
  }

  async function handleFirstLog() {
    setSaving(true)
    try {
      await addEntry({
        weight_kg: gewicht ? parseFloat(gewicht) : null,
        hunger_score: honger,
        symptoms: [],
        notes: null,
      })
    } catch {
      // non-blocking; proceed regardless
    } finally {
      setSaving(false)
      markOnboardingDone()
      navigate('/patient/dashboard')
    }
  }

  return (
    <main className="page flex flex-col min-h-[80vh]">
      {/* Stap-indicator */}
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= step ? '#2D7A5E' : '#E0DBD4' }}
          />
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-4xl">💉</p>
            <h1 className="text-2xl font-bold" style={{ color: '#14130F' }}>{nl.onboarding_welkom_titel}</h1>
            <p style={{ color: '#6B6660' }}>{nl.onboarding_welkom_body}</p>
            <ul className="space-y-3 mt-6">
              {[
                nl.onboarding_feature_1,
                nl.onboarding_feature_2,
                nl.onboarding_feature_3,
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#EDF7F4', color: '#2D7A5E' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm" style={{ color: '#14130F' }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-4xl">💊</p>
            <h1 className="text-2xl font-bold" style={{ color: '#14130F' }}>{nl.onboarding_medicatie_titel}</h1>
            <p style={{ color: '#6B6660' }}>{nl.onboarding_medicatie_body}</p>

            {current ? (
              <div className="mt-6 alert-brand rounded-xl px-5 py-4 space-y-2">
                <p className="text-sm font-medium" style={{ color: '#2D7A5E' }}>{nl.medicatie_huidige_dosis}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: '#1A4A36' }}>{current.dose_mg} mg</span>
                  {current.drug_type_name && (
                    <span className="text-sm font-medium" style={{ color: '#2D7A5E' }}>{current.drug_type_name}</span>
                  )}
                </div>
                {nextIncrease && daysUntilNext !== null && (
                  <p className="text-sm" style={{ color: '#1A4A36' }}>
                    {nl.medicatie_volgende_verhoging}: {nextIncrease.dose_mg} mg —{' '}
                    {nl.medicatie_over_dagen.replace('{dagen}', String(daysUntilNext))}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm" style={{ color: '#6B6660' }}>{nl.onboarding_medicatie_leeg}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-4xl">📊</p>
            <h1 className="text-2xl font-bold" style={{ color: '#14130F' }}>{nl.onboarding_meting_titel}</h1>
            <p style={{ color: '#6B6660' }}>{nl.onboarding_meting_body}</p>
            <div className="mt-6 alert-neutral rounded-xl px-5 py-4 space-y-2 text-sm" style={{ color: '#6B6660' }}>
              <p>{nl.onboarding_meting_tip_1}</p>
              <p>{nl.onboarding_meting_tip_2}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <p className="text-4xl">✏️</p>
            <h1 className="text-2xl font-bold" style={{ color: '#14130F' }}>{nl.onboarding_eerste_titel}</h1>

            {/* Gewicht */}
            <div>
              <label htmlFor="ob-gewicht" className="block text-sm font-medium mb-1.5" style={{ color: '#2E2B24' }}>
                {nl.log_gewicht}
              </label>
              <div className="relative">
                <input
                  id="ob-gewicht"
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={gewicht}
                  onChange={e => setGewicht(e.target.value)}
                  className="input pr-10 text-lg font-semibold w-full"
                  placeholder="82.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none" style={{ color: '#AAA49C' }}>
                  kg
                </span>
              </div>
            </div>

            {/* Honger */}
            <fieldset>
              <legend className="block text-sm font-medium mb-3" style={{ color: '#2E2B24' }}>
                {nl.log_honger}
              </legend>
              <div className="flex gap-2" role="group">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    type="button"
                    aria-pressed={honger === score}
                    onClick={() => setHonger(score)}
                    className={`hunger-btn${honger === score ? ' selected' : ''}`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <div className="mt-10 space-y-3">
        {step < 3 && (
          <button onClick={next} className="btn btn-primary w-full py-3">
            {nl.onboarding_volgende}
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleFirstLog}
            disabled={saving}
            className="btn btn-primary w-full py-3 disabled:opacity-50"
          >
            {saving ? nl.laden : nl.onboarding_begin}
          </button>
        )}

        {step === STEPS - 1 && (
          <button onClick={skip} className="btn btn-ghost w-full text-sm py-2">
            {nl.onboarding_sla_over}
          </button>
        )}
      </div>
    </main>
  )
}
