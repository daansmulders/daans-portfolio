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
      <main className="page-doctor">
        <p style={{ color: '#6B6660' }}>{nl.laden}</p>
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
    <main className="page-doctor space-y-10">
      <div>
        <Link to="/dokter/overzicht" className="text-sm hover:underline" style={{ color: '#2D7A5E' }}>
          ← {nl.nav_patienten}
        </Link>
        <h1 className="text-xl font-semibold mt-2" style={{ color: '#14130F' }}>{nl.prescriptie_titel}</h1>
      </div>

      {/* ── Wacht op goedkeuring ─────────────────────────────────────────── */}
      <section>
        <h2 className="section-label mb-3">
          {nl.prescriptie_wacht} {pending.length > 0 && `(${pending.length})`}
        </h2>

        {pending.length === 0 ? (
          <p className="text-sm py-6 text-center border border-dashed rounded-xl" style={{ color: '#AAA49C', borderColor: '#E0DBD4' }}>
            {nl.prescriptie_geen_wacht}
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map(e => {
              const isConfirming = confirmingId === e.id
              const isApproving = approvingId === e.id

              return (
                <li key={e.id} className={`border rounded-xl overflow-hidden transition-all ${
                  isConfirming ? '' : ''
                }`} style={{ borderColor: isConfirming ? '#14130F' : '#F0C97A' }}>
                  {/* Prescriptie-header — altijd zichtbaar */}
                  <div className={`px-5 py-4`} style={{ backgroundColor: isConfirming ? '#F7F4F0' : '#FFF8F0' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            to={`/dokter/patient/${e.patientId}`}
                            className="font-semibold hover:underline"
                            style={{ color: '#14130F' }}
                          >
                            {e.patientName}
                          </Link>
                          {e.drugTypeName && (
                            <span className={`badge ${isConfirming ? 'badge-warm' : 'badge-amber'}`}>
                              {e.drugTypeName}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#14130F' }}>{e.dose_mg} mg</p>
                        <p className="text-sm mt-1" style={{ color: '#6B6660' }}>
                          {nl.prescriptie_ingangsdatum}:{' '}
                          <span className="font-medium">{formatDate(e.start_date)}</span>
                        </p>
                        {e.notes && (
                          <p className="text-sm mt-1 italic" style={{ color: '#6B6660' }}>{e.notes}</p>
                        )}
                      </div>

                      {!isConfirming && (
                        <button
                          onClick={() => setConfirmingId(e.id)}
                          className="btn btn-secondary flex-shrink-0"
                        >
                          {nl.prescriptie_goedkeuren}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bevestigingspaneel */}
                  {isConfirming && (
                    <div className="px-5 py-4 space-y-4" style={{ borderTop: '1px solid #E0DBD4', backgroundColor: '#fff' }}>
                      <p className="text-sm font-semibold" style={{ color: '#14130F' }}>{nl.prescriptie_bevestig_titel}</p>

                      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <dt style={{ color: '#AAA49C' }}>{nl.prescriptie_bevestig_patient}</dt>
                          <dd className="font-medium" style={{ color: '#14130F' }}>{e.patientName}</dd>
                        </div>
                        <div>
                          <dt style={{ color: '#AAA49C' }}>{nl.prescriptie_bevestig_medicijn}</dt>
                          <dd className="font-medium" style={{ color: '#14130F' }}>{e.drugTypeName ?? '—'}</dd>
                        </div>
                        <div>
                          <dt style={{ color: '#AAA49C' }}>{nl.prescriptie_bevestig_dosis}</dt>
                          <dd className="font-medium" style={{ color: '#14130F' }}>{e.dose_mg} mg</dd>
                        </div>
                        <div>
                          <dt style={{ color: '#AAA49C' }}>{nl.prescriptie_bevestig_apotheek}</dt>
                          <dd className="font-medium" style={{ color: '#14130F' }}>
                            {e.pharmacy
                              ? <>{e.pharmacy.name}<br /><span className="font-normal" style={{ color: '#6B6660' }}>{e.pharmacy.address}, {e.pharmacy.city}</span></>
                              : <span style={{ color: '#AAA49C' }}>{nl.prescriptie_geen_apotheek}</span>
                            }
                          </dd>
                        </div>
                      </dl>

                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleConfirm(e)}
                          disabled={isApproving}
                          className="btn btn-primary flex-1 disabled:opacity-50"
                        >
                          {isApproving ? nl.laden : nl.prescriptie_bevestig_versturen}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={isApproving}
                          className="btn btn-ghost px-4"
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
          <h2 className="section-label mb-3">
            {nl.prescriptie_actief} ({currentByPatient.length})
          </h2>
          <ul className="space-y-2">
            {currentByPatient.map(({ past, next }) => {
              const entry = past ?? next!
              return (
                <li key={entry.id}>
                  <Link
                    to={`/dokter/patient/${entry.patientId}`}
                    className="card card-interactive flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="font-medium" style={{ color: '#14130F' }}>{entry.patientName}</p>
                      <p className="text-xs" style={{ color: '#AAA49C' }}>
                        {entry.drugTypeName ?? '—'}
                        {entry.pharmacy && ` · ${entry.pharmacy.name}`}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold" style={{ color: '#14130F' }}>
                        {past ? `${past.dose_mg} mg` : '—'}
                      </p>
                      {next && (
                        <p className="text-xs" style={{ color: '#E8821A' }}>
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
