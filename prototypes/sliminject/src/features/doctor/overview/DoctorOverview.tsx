import { Link } from 'react-router-dom'
import { usePatients } from './usePatients'
import { PatientListItem } from './PatientListItem'
import { useInvitations } from '../intake/useInvitations'
import { usePrescriptions } from '../prescriptions/usePrescriptions'
import { nl } from '../../../i18n/nl'

export function DoctorOverview() {
  const { patients, loading } = usePatients()
  const { invitations, loading: invLoading } = useInvitations()
  const { pending: pendingRecepten } = usePrescriptions()

  const pending = invitations.filter(i => i.status === 'pending')

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{nl.dokter_overzicht_titel}</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/dokter/recepten"
            className="relative border border-gray-200 hover:border-blue-300 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {nl.prescriptie_titel}
            {pendingRecepten.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingRecepten.length}
              </span>
            )}
          </Link>
          <Link
            to="/dokter/intake"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + {nl.intake_nieuw}
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">{nl.laden}</p>
      ) : patients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{nl.dokter_overzicht_leeg}</p>
        </div>
      ) : (() => {
        const aandacht = patients.filter(p => p.needs_attention)
        const opSchema = patients.filter(p => !p.needs_attention)
        return (
          <div className="space-y-6">
            {aandacht.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  {nl.dokter_bucket_aandacht} ({aandacht.length})
                </h2>
                <ul className="space-y-3">
                  {aandacht.map(p => <PatientListItem key={p.id} patient={p} />)}
                </ul>
              </section>
            )}
            {opSchema.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  {nl.dokter_bucket_op_schema} ({opSchema.length})
                </h2>
                <ul className="space-y-3">
                  {opSchema.map(p => <PatientListItem key={p.id} patient={p} />)}
                </ul>
              </section>
            )}
          </div>
        )
      })()}

      {/* Openstaande uitnodigingen */}
      {!invLoading && pending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {nl.intake_uitnodigingen_open} ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map(inv => (
              <li key={inv.id} className="flex items-center justify-between border border-dashed border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-700">{inv.patient_name}</p>
                  <p className="text-xs text-gray-500">{inv.patient_email}</p>
                </div>
                <div className="text-right">
                  {inv.initial_dose_mg && (
                    <p className="text-xs font-medium text-gray-600">
                      {inv.initial_dose_mg} mg{inv.drug_type_name ? ` · ${inv.drug_type_name}` : ''}
                    </p>
                  )}
                  <p className="text-xs text-amber-600 mt-0.5">{nl.intake_status_wacht}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
