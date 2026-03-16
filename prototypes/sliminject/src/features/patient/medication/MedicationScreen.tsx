import { usePatientDosageSchedule } from './usePatientDosageSchedule'
import { nl } from '../../../i18n/nl'

export function MedicationScreen() {
  const { current, past, upcoming, daysUntilNext, nextIncrease, loading } = usePatientDosageSchedule()

  if (loading) return <main className="max-w-lg mx-auto px-4 py-8"><p className="text-gray-500">{nl.laden}</p></main>

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">{nl.medicatie_titel}</h1>

      {/* Huidige dosering */}
      {current ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <p className="text-sm text-blue-600 font-medium mb-1">{nl.medicatie_huidige_dosis}</p>
          <p className="text-3xl font-bold text-blue-800">{current.dose_mg} mg</p>
          {current.notes && <p className="text-sm text-blue-700 mt-2">{current.notes}</p>}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">{nl.medicatie_geen_dosis}</p>
      )}

      {/* Volgende verhoging */}
      {nextIncrease && (
        <div className={`border rounded-xl px-5 py-4 ${
          daysUntilNext !== null && daysUntilNext <= 7
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-gray-200'
        }`}>
          <p className="text-sm font-medium text-gray-600 mb-1">{nl.medicatie_volgende_verhoging}</p>
          <p className="text-xl font-bold text-gray-900">{nextIncrease.dose_mg} mg</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(nextIncrease.start_date)}
            {daysUntilNext !== null && (
              <span className={`ml-2 font-medium ${daysUntilNext <= 7 ? 'text-amber-700' : 'text-gray-500'}`}>
                — {nl.medicatie_over_dagen.replace('{dagen}', String(daysUntilNext))}
              </span>
            )}
          </p>
          {nextIncrease.notes && <p className="text-sm text-gray-500 mt-2">{nextIncrease.notes}</p>}
        </div>
      )}

      {/* Geplande verhogingen */}
      {upcoming.length > 1 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{nl.medicatie_gepland}</h2>
          <ul className="space-y-2">
            {upcoming.slice(1).map(e => (
              <li key={e.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                <span className="font-medium text-gray-900">{e.dose_mg} mg</span>
                <span className="text-sm text-gray-500">{formatDate(e.start_date)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Verleden */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{nl.medicatie_verleden}</h2>
          <ul className="space-y-2">
            {[...past].reverse().map(e => (
              <li key={e.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 opacity-60">
                <span className="font-medium text-gray-700">{e.dose_mg} mg</span>
                <span className="text-sm text-gray-500">{formatDate(e.start_date)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!current && !nextIncrease && past.length === 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">{nl.medicatie_geen_schema}</p>
      )}
    </main>
  )
}
