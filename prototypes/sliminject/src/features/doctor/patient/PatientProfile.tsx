import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { useProgressEntries } from '../../patient/dashboard/useProgressEntries'
import { ProgressChart } from '../../patient/dashboard/ProgressChart'
import { ConcernInbox } from './ConcernInbox'
import { AdviceEditor } from './AdviceEditor'
import { useDosageSchedule } from '../schedule/useDosageSchedule'
import { useConcerns } from '../../patient/concerns/useConcerns'
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
  const { concerns } = useConcerns(patientId)
  const openConcernsCount = concerns.filter(c => c.status === 'open').length

  return (
    <main className="page-doctor space-y-6">
      <Link to="/dokter/overzicht" className="text-sm hover:underline" style={{ color: '#2D7A5E' }}>
        ← {nl.nav_patienten}
      </Link>

      {/* Patiëntinformatie */}
      <div className="card px-5 py-4">
        <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>{profile?.full_name ?? nl.laden}</h1>
        <p className="text-sm mt-1" style={{ color: '#6B6660' }}>
          {nl.dokter_profiel_telefoon}: {profile?.phone ?? nl.dokter_profiel_geen_telefoon}
        </p>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overzicht">
        <Tabs.List
          className="flex border-b"
          style={{ borderColor: '#E0DBD4' }}
          aria-label="Patiëntprofiel secties"
        >
          {[
            { value: 'overzicht', label: nl.tabs_overzicht },
            { value: 'medicatie', label: nl.nav_medicatie },
            { value: 'meldingen', label: nl.tabs_meldingen, badge: openConcernsCount },
            { value: 'afspraken', label: nl.tabs_afspraken },
          ].map(tab => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors
                data-[state=active]:border-b-2 data-[state=active]:border-current"
              style={{ color: '#6B6660' }}
            >
              {tab.label}
              {tab.badge ? (
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                  style={{ background: '#A52020', fontSize: '10px' }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="overzicht" className="pt-6 space-y-6">
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#14130F' }}>{nl.dokter_profiel_voortgang}</h2>
            {entriesLoading ? (
              <p className="text-sm" style={{ color: '#6B6660' }}>{nl.laden}</p>
            ) : entries.length === 0 ? (
              <p className="text-sm" style={{ color: '#6B6660' }}>{nl.dokter_profiel_geen_metingen}</p>
            ) : (
              <ProgressChart entries={entries} />
            )}
          </section>
        </Tabs.Content>

        <Tabs.Content value="medicatie" className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: '#14130F' }}>{nl.dokter_profiel_schema}</h2>
            <Link
              to={`/dokter/patient/${patientId}/schema`}
              className="text-sm hover:underline"
              style={{ color: '#2D7A5E' }}
            >
              {nl.dokter_profiel_bewerken}
            </Link>
          </div>
          <MedicationTimeline entries={schedule} />
        </Tabs.Content>

        <Tabs.Content value="meldingen" className="pt-6 space-y-6">
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#14130F' }}>{nl.dokter_profiel_advies}</h2>
            <AdviceEditor patientId={patientId!} />
          </section>
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#14130F' }}>{nl.dokter_profiel_meldingen}</h2>
            <ConcernInbox patientId={patientId!} />
          </section>
        </Tabs.Content>

        <Tabs.Content value="afspraken" className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: '#14130F' }}>{nl.dokter_profiel_afspraken}</h2>
            <Link
              to={`/dokter/patient/${patientId}/afspraak`}
              className="btn btn-primary btn-sm"
            >
              + {nl.afspraak_plannen}
            </Link>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}
