import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrescriptions, type PrescriptionEntry } from './usePrescriptions'
import { nl } from '../../../i18n/nl'

export function PrescriptionOverview() {
  const { pending, currentByPatient, loading, approve } = usePrescriptions()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500">{nl.laden}</p>
      </main>
    )
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  async function handleConfirm(e: PrescriptionEntry) {
    setApprovingId(e.id)
    try {
      await approve(e.id)
      setConfirmingId(null)
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <div>
        <Link to="/dokter/overzicht" className="text-sm text-blue-600 hover:underline">
          ← {nl.nav_patienten}
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-2">{nl.prescriptie_titel}</h1>
      </div>

      {/* ── Wacht op goedkeuring ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          {nl.prescriptie_wacht} {pending.length > 0 && `(${pending.length})`}
        </h2>

        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            {nl.prescriptie_geen_wacht}
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map(e => {
              const isConfirming = confirmingId === e.id
              const isApproving = approvingId === e.id

              return (
                <li key={e.id} className={`border rounded-xl overflow-hidden transition-all ${
                  isConfirming ? 'border-gray-900' : 'border-amber-200'
                }`}>
                  {/* Prescriptie-header — altijd zichtbaar */}
                  <div className={`px-5 py-4 ${isConfirming ? 'bg-gray-50' : 'bg-amber-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            to={`/dokter/patient/${e.patientId}`}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {e.patientName}
                          </Link>
                          {e.drugTypeName && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isConfirming
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {e.drugTypeName}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{e.dose_mg} mg</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {nl.prescriptie_ingangsdatum}:{' '}
                          <span className="font-medium">{formatDate(e.start_date)}</span>
                        </p>
                        {e.notes && (
                          <p className="text-sm text-gray-500 mt-1 italic">{e.notes}</p>
                        )}
                      </div>

                      {!isConfirming && (
                        <button
                          onClick={() => setConfirmingId(e.id)}
                          className="flex-shrink-0 bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          {nl.prescriptie_goedkeuren}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bevestigingspaneel */}
                  {isConfirming && (
                    <div className="px-5 py-4 border-t border-gray-200 bg-white space-y-4">
                      <p className="text-sm font-semibold text-gray-700">{nl.prescriptie_bevestig_titel}</p>

                      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <dt className="text-gray-400">{nl.prescriptie_bevestig_patient}</dt>
                          <dd className="font-medium text-gray-900">{e.patientName}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400">{nl.prescriptie_bevestig_medicijn}</dt>
                          <dd className="font-medium text-gray-900">{e.drugTypeName ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400">{nl.prescriptie_bevestig_dosis}</dt>
                          <dd className="font-medium text-gray-900">{e.dose_mg} mg</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400">{nl.prescriptie_bevestig_apotheek}</dt>
                          <dd className="font-medium text-gray-900">
                            {e.pharmacy
                              ? <>{e.pharmacy.name}<br /><span className="font-normal text-gray-500">{e.pharmacy.address}, {e.pharmacy.city}</span></>
                              : <span className="text-gray-400">{nl.prescriptie_geen_apotheek}</span>
                            }
                          </dd>
                        </div>
                      </dl>

                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleConfirm(e)}
                          disabled={isApproving}
                          className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          {isApproving ? nl.laden : nl.prescriptie_bevestig_versturen}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={isApproving}
                          className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {nl.annuleren}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── Actieve prescripties ─────────────────────────────────────────── */}
      {currentByPatient.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {nl.prescriptie_actief} ({currentByPatient.length})
          </h2>
          <ul className="space-y-2">
            {currentByPatient.map(({ past, next }) => {
              const entry = past ?? next!
              return (
                <li key={entry.id}>
                  <Link
                    to={`/dokter/patient/${entry.patientId}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{entry.patientName}</p>
                      <p className="text-xs text-gray-400">
                        {entry.drugTypeName ?? '—'}
                        {entry.pharmacy && ` · ${entry.pharmacy.name}`}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-gray-900">
                        {past ? `${past.dose_mg} mg` : '—'}
                      </p>
                      {next && (
                        <p className="text-xs text-amber-600">
                          → {next.dose_mg} mg {new Date(next.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
