import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useProgressEntries } from '../../patient/dashboard/useProgressEntries'
import { ProgressChart } from '../../patient/dashboard/ProgressChart'
import { ConcernInbox } from './ConcernInbox'
import { AdviceEditor } from './AdviceEditor'
import { useDosageSchedule } from '../schedule/useDosageSchedule'
import { MedicationTimeline } from '../../patient/medication/MedicationTimeline'
import { supabase } from '../../../lib/supabase'
import { nl } from '../../../i18n/nl'

export function PatientProfile() {
  const { id: patientId } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<{ full_name: string; phone: string | null } | null>(null)

  useEffect(() => {
    if (!patientId) return
    supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', patientId)
      .single()
      .then(({ data }) => setProfile(data))
  }, [patientId])
  const { entries, loading: entriesLoading } = useProgressEntries(patientId)
  const { entries: schedule } = useDosageSchedule(patientId!)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <Link to="/dokter/overzicht" className="text-sm text-blue-600 hover:underline">← {nl.nav_patienten}</Link>

      {/* Patiëntinformatie */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{profile?.full_name ?? nl.laden}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {nl.dokter_profiel_telefoon}: {profile?.phone ?? nl.dokter_profiel_geen_telefoon}
        </p>
      </div>

      {/* Voortgang */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">{nl.dokter_profiel_voortgang}</h2>
        {entriesLoading ? (
          <p className="text-sm text-gray-500">{nl.laden}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-500">{nl.dokter_profiel_geen_metingen}</p>
        ) : (
          <ProgressChart entries={entries} />
        )}
      </section>

      {/* Medicatieschema */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{nl.dokter_profiel_schema}</h2>
          <Link
            to={`/dokter/patient/${patientId}/schema`}
            className="text-sm text-blue-600 hover:underline"
          >
            {nl.dokter_profiel_bewerken}
          </Link>
        </div>
        <MedicationTimeline entries={schedule} />
      </section>

      {/* Advies */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">{nl.dokter_profiel_advies}</h2>
        <AdviceEditor patientId={patientId!} />
      </section>

      {/* Meldingen */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{nl.dokter_profiel_meldingen}</h2>
        </div>
        <ConcernInbox patientId={patientId!} />
      </section>

      {/* Afspraak */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{nl.dokter_profiel_afspraken}</h2>
          <Link
            to={`/dokter/patient/${patientId}/afspraak`}
            className="text-sm text-blue-600 hover:underline"
          >
            {nl.afspraak_plannen}
          </Link>
        </div>
      </section>
    </main>
  )
}
