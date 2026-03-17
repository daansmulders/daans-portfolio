import { Link } from 'react-router-dom'
import { usePatients } from './usePatients'
import { PatientListItem } from './PatientListItem'
import { useInvitations } from '../intake/useInvitations'
import { usePrescriptions } from '../prescriptions/usePrescriptions'
import { nl } from '../../../i18n/nl'
import { EmptyState } from '../../../components/EmptyState'

export function DoctorOverview() {
  const { patients, loading } = usePatients()
  const { invitations, loading: invLoading } = useInvitations()
  const { pending: pendingRecepten } = usePrescriptions()

  const pending = invitations.filter(i => i.status === 'pending')

  return (
    <main className="page-doctor space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>
          {nl.dokter_overzicht_titel}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/dokter/recepten"
            className="btn btn-secondary btn-sm relative"
          >
            {nl.prescriptie_titel}
            {pendingRecepten.length > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                style={{ background: '#E8821A', fontSize: '10px' }}
              >
                {pendingRecepten.length}
              </span>
            )}
          </Link>
          <Link to="/dokter/intake" className="btn btn-primary btn-sm">
            + {nl.intake_nieuw}
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#AAA49C' }}>{nl.laden}</p>
      ) : patients.length === 0 ? (
        <EmptyState
          heading={nl.empty_patienten_heading}
          body={nl.empty_patienten_body}
          cta={{ label: nl.empty_patienten_cta, href: '/dokter/intake' }}
        />
      ) : (() => {
        const aandacht = patients.filter(p => p.needs_attention)
        const opSchema  = patients.filter(p => !p.needs_attention)
        return (
          <div className="space-y-8">
            {aandacht.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <p className="section-label">{nl.dokter_bucket_aandacht}</p>
                  <span className="badge badge-amber">{aandacht.length}</span>
                </div>
                <ul className="space-y-2">
                  {aandacht.map(p => <PatientListItem key={p.id} patient={p} />)}
                </ul>
              </section>
            )}
            {opSchema.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <p className="section-label">{nl.dokter_bucket_op_schema}</p>
                  <span className="badge badge-brand">{opSchema.length}</span>
                </div>
                <ul className="space-y-2">
                  {opSchema.map(p => <PatientListItem key={p.id} patient={p} />)}
                </ul>
              </section>
            )}
          </div>
        )
      })()}

      {/* Pending invitations */}
      {!invLoading && pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <p className="section-label">{nl.intake_uitnodigingen_open}</p>
            <span className="badge badge-warm">{pending.length}</span>
          </div>
          <ul className="space-y-2">
            {pending.map(inv => (
              <li
                key={inv.id}
                className="card p-4 flex items-center justify-between"
                style={{ border: '1.5px dashed #E0DBD4' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#14130F' }}>{inv.patient_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6660' }}>{inv.patient_email}</p>
                </div>
                <div className="text-right">
                  {inv.initial_dose_mg && (
                    <p className="text-xs font-medium" style={{ color: '#2E2B24' }}>
                      {inv.initial_dose_mg} mg{inv.drug_type_name ? ` · ${inv.drug_type_name}` : ''}
                    </p>
                  )}
                  <p className="text-xs mt-0.5 font-medium" style={{ color: '#A85C0A' }}>
                    {nl.intake_status_wacht}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
