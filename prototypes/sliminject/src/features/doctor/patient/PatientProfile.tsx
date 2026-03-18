import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
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
import { useAdherence } from '../../../hooks/useAdherence'
import { useWellbeingHistory, type WellbeingCheckIn } from '../../patient/wellbeing/useWellbeingHistory'
import { LogEntryCard } from '../../patient/dashboard/LogEntryCard'

type AdherenceResponse = 'confirmed' | 'skipped' | 'adjusted' | null

function TrendArrow({ current, previous }: { current: number | null; previous: number | null }) {
  if (current == null || previous == null) return <span style={{ color: '#AAA49C' }}>—</span>
  const diff = current - previous
  if (diff > 0) return <span style={{ color: '#2D7A5E' }}>↑</span>
  if (diff < 0) return <span style={{ color: '#A85C0A' }}>↓</span>
  return <span style={{ color: '#AAA49C' }}>→</span>
}

function WellbeingDoctorSummary({ checkins }: { checkins: WellbeingCheckIn[] }) {
  if (checkins.length === 0) {
    return <p className="text-sm" style={{ color: '#AAA49C' }}>{nl.welzijn_geen_checkins}</p>
  }

  const recent   = checkins[0]
  const previous = checkins[1] ?? null

  const dimensions: { label: string; field: keyof WellbeingCheckIn }[] = [
    { label: nl.welzijn_checkin_energie,        field: 'energy_score' },
    { label: nl.welzijn_checkin_stemming,       field: 'mood_score' },
    { label: nl.welzijn_checkin_zelfvertrouwen, field: 'confidence_score' },
  ]

  return (
    <div className="card px-4 py-3 space-y-2">
      <p className="text-xs" style={{ color: '#6B6660' }}>
        {nl.welzijn_checkin_recentste}:{' '}
        <time>{new Date(recent.submitted_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}</time>
      </p>
      <ul className="space-y-2">
        {dimensions.map(({ label, field }) => {
          const score = recent[field] as number | null
          const prev  = previous ? (previous[field] as number | null) : null
          return (
            <li key={field} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#2E2B24' }}>{label}</span>
              <div className="flex items-center gap-2">
                {score != null ? (
                  <span className="text-sm font-semibold tabular-nums" style={{ color: '#14130F' }}>
                    {score}/5
                  </span>
                ) : (
                  <span className="text-sm" style={{ color: '#AAA49C' }}>—</span>
                )}
                <TrendArrow current={score} previous={prev} />
              </div>
            </li>
          )
        })}
      </ul>
      {recent.note && (
        <p className="text-xs italic pt-1" style={{ color: '#6B6660' }}>"{recent.note}"</p>
      )}
    </div>
  )
}

function AdherenceBadge({ response }: { response: AdherenceResponse }) {
  if (response === 'confirmed') return (
    <span className="badge" style={{ background: '#EDF7F4', color: '#1A4A36' }}>Genomen</span>
  )
  if (response === 'skipped') return (
    <span className="badge" style={{ background: '#FFF8EE', color: '#A85C0A' }}>Overgeslagen</span>
  )
  if (response === 'adjusted') return (
    <span className="badge" style={{ background: '#F5F3F0', color: '#6B6660' }}>Aangepaste dosis</span>
  )
  return (
    <span className="badge" style={{ background: '#F5F3F0', color: '#AAA49C' }}>Niet ingevuld</span>
  )
}

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
  const { checkins: wellbeingCheckins } = useWellbeingHistory(patientId)
  const { concerns, loading: concernsLoading, respondToConcern } = useConcerns(patientId)
  const openConcernsCount = concerns.filter(c => c.status === 'open').length
  const [showFoodNoise, setShowFoodNoise] = useState(false)
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)

  // Dosage schedule — always loaded for chart dose markers + Medicatie tab
  const { entries: schedule } = useDosageSchedule(patientId!)
  const doseSteps = useMemo(
    () => schedule.filter(e => e.status === 'approved').map(e => ({ date: e.start_date, dose_mg: e.dose_mg })),
    [schedule],
  )

  // Adherence data — only fetched once the Medicatie tab is first opened
  const [medicatieLoaded, setMedicatieLoaded] = useState(false)
  const { byEntryId: adherenceByEntryId } = useAdherence(medicatieLoaded ? patientId : undefined)

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
      <Tabs.Root
        defaultValue="overzicht"
        onValueChange={(tab) => { if (tab === 'medicatie') setMedicatieLoaded(true) }}
      >
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
              <ProgressChart
                entries={entries}
                showFoodNoise={showFoodNoise}
                onToggleFoodNoise={() => setShowFoodNoise(v => !v)}
                doseSteps={doseSteps}
              />
            )}
          </section>
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#14130F' }}>{nl.welzijn_checkin_titel}</h2>
            <WellbeingDoctorSummary checkins={wellbeingCheckins} />
          </section>
          {entries.length > 0 && (
            <section>
              <p className="section-label mb-2">{nl.dashboard_recente_metingen}</p>
              <ul className="space-y-2">
                {entries.slice(0, 5).map(entry => (
                  <LogEntryCard
                    key={entry.id}
                    entry={entry}
                    isInjectionDay={false}
                    isExpanded={expandedEntryId === entry.id}
                    onToggle={() => setExpandedEntryId(prev => prev === entry.id ? null : entry.id)}
                  />
                ))}
              </ul>
            </section>
          )}
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

          {schedule.length > 0 && (
            <section className="space-y-2">
              <p className="section-label">Injectietrouw per dosering</p>
              <ol className="space-y-2">
                {schedule.map(entry => {
                  const record = adherenceByEntryId.get(entry.id)
                  // Find the progress entry logged on this injection day
                  const injectionDayEntry = record?.response === 'confirmed'
                    ? entries.find(e => e.logged_at.slice(0, 10) === entry.start_date)
                    : undefined
                  return (
                    <li key={entry.id} className="card px-4 py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: '#14130F' }}>
                            {entry.dose_mg} mg
                          </span>
                          <span className="text-xs ml-2" style={{ color: '#AAA49C' }}>
                            {new Date(entry.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <AdherenceBadge response={record?.response ?? null} />
                      </div>
                      {injectionDayEntry && (
                        <p className="text-xs" style={{ color: '#6B6660' }}>
                          {injectionDayEntry.weight_kg != null && `${injectionDayEntry.weight_kg} kg`}
                          {injectionDayEntry.weight_kg != null && injectionDayEntry.hunger_score != null && ' · '}
                          {injectionDayEntry.hunger_score != null && `Honger ${injectionDayEntry.hunger_score}/5`}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )}
        </Tabs.Content>

        <Tabs.Content value="meldingen" className="pt-6 space-y-6">
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#14130F' }}>{nl.dokter_profiel_advies}</h2>
            <AdviceEditor patientId={patientId!} />
          </section>
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#14130F' }}>{nl.dokter_profiel_meldingen}</h2>
            <ConcernInbox concerns={concerns} loading={concernsLoading} respondToConcern={respondToConcern} />
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
