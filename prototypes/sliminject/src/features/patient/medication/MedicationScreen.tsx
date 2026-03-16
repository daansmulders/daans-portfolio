import { usePatientDosageSchedule } from './usePatientDosageSchedule'
import { MedicationTimeline } from './MedicationTimeline'
import { nl } from '../../../i18n/nl'

export function MedicationScreen() {
  const { entries, current, nextIncrease, daysUntilNext, loading } = usePatientDosageSchedule()

  if (loading) return <main className="max-w-lg mx-auto px-4 py-8"><p className="text-gray-500">{nl.laden}</p></main>

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{nl.medicatie_titel}</h1>

      {/* Huidige dosering hero */}
      {current ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <p className="text-sm text-blue-600 font-medium mb-1">{nl.medicatie_huidige_dosis}</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-blue-800">{current.dose_mg} mg</p>
            {current.drug_type_name && (
              <span className="text-sm font-medium text-blue-600">{current.drug_type_name}</span>
            )}
          </div>
          {nextIncrease && daysUntilNext !== null && (
            <p className={`text-sm mt-2 ${daysUntilNext <= 7 ? 'text-amber-700 font-medium' : 'text-blue-700'}`}>
              {nl.medicatie_volgende_verhoging}: {nextIncrease.dose_mg} mg — {nl.medicatie_over_dagen.replace('{dagen}', String(daysUntilNext))}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">{nl.medicatie_geen_dosis}</p>
      )}

      {/* Tijdlijn */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{nl.medicatie_tijdlijn}</h2>
        <MedicationTimeline entries={entries} />
      </section>
    </main>
  )
}
