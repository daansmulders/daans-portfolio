import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientDosageSchedule } from '../medication/usePatientDosageSchedule'
import { nl } from '../../../i18n/nl'

const ONBOARDING_KEY = 'sliminject_onboarding_done'

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, '1')
}

export function hasSeenOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

const STEPS = 3

export function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { current, nextIncrease, daysUntilNext } = usePatientDosageSchedule()

  function next() {
    if (step < STEPS - 1) {
      setStep(s => s + 1)
    } else {
      markOnboardingDone()
      navigate('/patient/log')
    }
  }

  function skip() {
    markOnboardingDone()
    navigate('/patient/dashboard')
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12 flex flex-col min-h-[80vh]">
      {/* Stap-indicator */}
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-4xl">💉</p>
            <h1 className="text-2xl font-bold text-gray-900">{nl.onboarding_welkom_titel}</h1>
            <p className="text-gray-600">{nl.onboarding_welkom_body}</p>
            <ul className="space-y-3 mt-6">
              {[
                nl.onboarding_feature_1,
                nl.onboarding_feature_2,
                nl.onboarding_feature_3,
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-4xl">💊</p>
            <h1 className="text-2xl font-bold text-gray-900">{nl.onboarding_medicatie_titel}</h1>
            <p className="text-gray-600">{nl.onboarding_medicatie_body}</p>

            {current ? (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 space-y-2">
                <p className="text-sm font-medium text-blue-600">{nl.medicatie_huidige_dosis}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-800">{current.dose_mg} mg</span>
                  {current.drug_type_name && (
                    <span className="text-sm font-medium text-blue-600">{current.drug_type_name}</span>
                  )}
                </div>
                {nextIncrease && daysUntilNext !== null && (
                  <p className="text-sm text-blue-700">
                    {nl.medicatie_volgende_verhoging}: {nextIncrease.dose_mg} mg —{' '}
                    {nl.medicatie_over_dagen.replace('{dagen}', String(daysUntilNext))}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm text-gray-500">{nl.onboarding_medicatie_leeg}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-4xl">📊</p>
            <h1 className="text-2xl font-bold text-gray-900">{nl.onboarding_meting_titel}</h1>
            <p className="text-gray-600">{nl.onboarding_meting_body}</p>
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 space-y-2 text-sm text-gray-600">
              <p>{nl.onboarding_meting_tip_1}</p>
              <p>{nl.onboarding_meting_tip_2}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 space-y-3">
        <button
          onClick={next}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {step < STEPS - 1 ? nl.onboarding_volgende : nl.onboarding_begin}
        </button>
        {step === STEPS - 1 && (
          <button
            onClick={skip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            {nl.onboarding_later}
          </button>
        )}
      </div>
    </main>
  )
}
