import { usePatientDosageSchedule } from './usePatientDosageSchedule'
import { MedicationTimeline } from './MedicationTimeline'
import { nl } from '../../../i18n/nl'

export function MedicationScreen() {
  const { entries, current, nextIncrease, daysUntilNext, loading } = usePatientDosageSchedule()

  if (loading) return (
    <main className="page">
      <p style={{ color: '#AAA49C' }}>{nl.laden}</p>
    </main>
  )

  return (
    <main className="page space-y-6">
      <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>
        {nl.medicatie_titel}
      </h1>

      {/* Hero dosage card */}
      {current ? (
        <div className="card p-6" style={{ background: '#EDF7F4' }}>
          <p className="section-label mb-3">{nl.medicatie_huidige_dosis}</p>
          <div className="flex items-end gap-3 mb-1">
            <span className="data-num data-num-xl">{current.dose_mg}</span>
            <span className="text-lg font-medium pb-1" style={{ color: '#2D7A5E' }}>mg</span>
            {current.drug_type_name && (
              <span className="badge badge-brand pb-1">{current.drug_type_name}</span>
            )}
          </div>
          {nextIncrease && daysUntilNext !== null && (
            <p className={`text-sm mt-3 font-medium ${daysUntilNext <= 7 ? '' : ''}`}
               style={{ color: daysUntilNext <= 7 ? '#A85C0A' : '#2D7A5E' }}>
              {nl.medicatie_volgende_verhoging}: {nextIncrease.dose_mg} mg
              {' '}— {nl.medicatie_over_dagen.replace('{dagen}', String(daysUntilNext))}
              {daysUntilNext <= 7 && <span className="ml-2 badge badge-amber">{daysUntilNext}d</span>}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm" style={{ color: '#AAA49C' }}>{nl.medicatie_geen_dosis}</p>
      )}

      {/* Timeline */}
      <section>
        <p className="section-label mb-4">{nl.medicatie_tijdlijn}</p>
        <MedicationTimeline entries={entries} />
      </section>
    </main>
  )
}
