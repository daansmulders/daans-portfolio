import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { useProgressEntries } from './useProgressEntries'
import { ProgressChart } from './ProgressChart'
import { useOfflineSync } from '../../../hooks/useOfflineSync'
import { usePatientDosageSchedule } from '../medication/usePatientDosageSchedule'
import { useEducationalContent } from '../content/useEducationalContent'
import { useAppointments } from '../../doctor/appointments/useAppointments'
import { useConcerns } from '../concerns/useConcerns'
import { getUnseenReviewedConcerns } from '../../../hooks/useSeenConcerns'
import { hasSeenOnboarding } from '../onboarding/OnboardingScreen'
import { injectionDates } from '../adherence/injectionDates'
import { nl } from '../../../i18n/nl'
import { useAuth } from '../../../auth/AuthProvider'
import { useConsecutiveMiss } from '../adherence/useConsecutiveMiss'
import { InjectionDayCard } from '../adherence/InjectionDayCard'
import { useInjectionDayCard } from '../adherence/useInjectionDayCard'
import { useFoodNoiseMilestone, useWellbeingDimensionMilestones } from '../wellbeing/useWellbeingMilestones'
import { useWellbeingCheckIn } from '../wellbeing/useWellbeingCheckIn'
import { useDoseChanges } from '../medication/useDoseChanges'
import { LogEntryCard } from './LogEntryCard'

export function PatientDashboard() {
  useOfflineSync()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { entries, loading, addEntry, hasLoggedToday, hasEnoughDataForChart } = useProgressEntries()

  useEffect(() => {
    if (!loading && entries.length === 0 && !hasSeenOnboarding()) {
      navigate('/patient/onboarding', { replace: true })
    }
  }, [loading, entries.length, navigate])

  const { entries: scheduleEntries } = usePatientDosageSchedule()
  const injectionDateSet = useMemo(() => injectionDates(scheduleEntries), [scheduleEntries])
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const isInjectionDay = injectionDateSet.has(todayStr)
  const { isConsecutiveMiss, dismiss: dismissMissNudge } = useConsecutiveMiss()
  const injectionCard = useInjectionDayCard(addEntry)
  const doseChanges = useDoseChanges()
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [showFoodNoise, setShowFoodNoise] = useState(false)
  const { isFoodNoiseMilestone, dismissFoodNoise } = useFoodNoiseMilestone(entries)
  // Single fetch for wellbeing data — checkins shared with WellbeingCheckIn via props
  const { checkins } = useWellbeingCheckIn()
  const { energy: energyMilestone, mood: moodMilestone, confidence: confidenceMilestone } = useWellbeingDimensionMilestones(checkins)
  const { items: contentItems } = useEducationalContent()
  const { next: nextAppointment, hoursUntilNext } = useAppointments()
  const { concerns } = useConcerns()
  const unseenReplies = getUnseenReviewedConcerns(concerns)
  const latestReply = unseenReplies[0] ?? null

  // First unread article as content teaser
  const contentTeaser = contentItems.find(i => !i.viewed) ?? null

  if (loading) {
    return (
      <main className="page">
        <p style={{ color: '#AAA49C' }}>{nl.laden}</p>
      </main>
    )
  }

  const appointmentIsSoon = nextAppointment && hoursUntilNext !== null && hoursUntilNext <= 48


  // ── Alerts: collect up to 2, priority ordered ──────────────────────────
  const alerts: { key: string; node: React.ReactNode }[] = []
  if (isConsecutiveMiss) {
    alerts.push({ key: 'miss', node: (
      <div className="alert-amber rounded-xl px-4 py-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: '#7A3D00' }}>
            Je hebt je injectie twee keer overgeslagen
          </p>
          <button className="text-xs underline" style={{ color: '#A85C0A' }} onClick={() => navigate('/patient/meldingen/nieuw')}>
            Stuur je arts een berichtje →
          </button>
        </div>
        <button onClick={dismissMissNudge} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm" style={{ color: '#A85C0A' }} aria-label="Melding sluiten">✕</button>
      </div>
    )})
  }
  if (latestReply && alerts.length < 2) {
    alerts.push({ key: 'reply', node: (
      <Link to="/patient/meldingen" className="block card p-3 space-y-0.5 no-underline" style={{ borderLeft: '3px solid #2D7A5E', textDecoration: 'none' }}>
        <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>{nl.dashboard_dokter_reactie}</p>
        <p className="text-sm line-clamp-2" style={{ color: '#14130F' }}>{latestReply.doctor_response}</p>
      </Link>
    )})
  }
  if (doseChanges.announcement && alerts.length < 2) {
    alerts.push({ key: 'dose', node: (
      <div className="alert-amber rounded-xl px-4 py-3 flex items-start justify-between gap-3">
        <Link to="/patient/medicatie" className="space-y-1 no-underline" style={{ textDecoration: 'none' }}>
          <p className="text-sm font-medium" style={{ color: '#7A3D00' }}>{nl.dosis_aankondiging_titel}</p>
          <p className="text-xs" style={{ color: '#A85C0A' }}>{nl.dosis_aankondiging_tekst.replace('{dosis}', String(doseChanges.announcement.dose_mg))}</p>
        </Link>
        <button onClick={() => doseChanges.dismissAnnouncement(doseChanges.announcement!.entryId)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm" style={{ color: '#A85C0A' }} aria-label="Melding sluiten">✕</button>
      </div>
    )})
  }

  // ── Celebration: highest priority milestone ───────────────────────────
  const celebration = [
    isFoodNoiseMilestone ? { titel: nl.mijlpaal_voedselruis_titel, body: nl.mijlpaal_voedselruis_body, dismiss: dismissFoodNoise } : null,
    energyMilestone.triggered ? { titel: nl.mijlpaal_energie_titel, body: nl.mijlpaal_energie_body, dismiss: energyMilestone.dismiss } : null,
    moodMilestone.triggered ? { titel: nl.mijlpaal_stemming_titel, body: nl.mijlpaal_stemming_body, dismiss: moodMilestone.dismiss } : null,
    confidenceMilestone.triggered ? { titel: nl.mijlpaal_zelfvertrouwen_titel, body: nl.mijlpaal_zelfvertrouwen_body, dismiss: confidenceMilestone.dismiss } : null,
  ].filter(Boolean)[0] ?? null

  return (
    <main className="page space-y-6">

      {/* ══ Header ══════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>
          {nl.dashboard_titel}
        </h1>
        <button
          onClick={() => signOut()}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '.8125rem', color: '#AAA49C' }}
        >
          {nl.uitloggen}
        </button>
      </div>

      {/* ══ ZONE 1: Primary Action ══════════════════════════ */}
      {!isInjectionDay && !injectionCard.isDue && (hasLoggedToday ? (
        <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: '#EDF7F4' }}>
          <span className="text-base" aria-hidden="true">✓</span>
          <span className="text-sm font-medium" style={{ color: '#1A4A36' }}>{nl.log_cta_gedaan}</span>
        </div>
      ) : (
        <Link
          to="/patient/log"
          className="btn btn-primary w-full"
          style={{ padding: '1rem', fontSize: '1rem', borderRadius: '14px', textAlign: 'center', display: 'block' }}
        >
          {nl.log_cta_vandaag}
        </Link>
      ))}

      <InjectionDayCard
        isDue={injectionCard.isDue}
        step={injectionCard.step}
        submitting={injectionCard.submitting}
        confirmInjection={injectionCard.confirmInjection}
        submitLog={injectionCard.submitLog}
        skipInjection={injectionCard.skipInjection}
        adjustInjection={injectionCard.adjustInjection}
        isNewDose={doseChanges.isNewDose}
        newDoseMg={doseChanges.newDoseMg}
        isFirstInjection={doseChanges.isFirstInjection}
        lastWeight={entries.find(e => e.weight_kg != null)?.weight_kg}
      />

      {/* ══ ZONE 2: Alerts (max 2, stacked) ═════════════════ */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(a => <div key={a.key}>{a.node}</div>)}
        </div>
      )}

      {/* ══ ZONE 3: Progress Chart (visual anchor) ══════════ */}
      {hasEnoughDataForChart && (
        <ProgressChart
          entries={entries}
          showFoodNoise={showFoodNoise}
          onToggleFoodNoise={() => setShowFoodNoise(v => !v)}
          doseSteps={doseChanges.doseSteps}
        />
      )}

      {/* ══ ZONE 4: Celebration (max 1, full-width band) ════ */}
      {celebration && (
        <div
          className="flex items-start justify-between gap-3 rounded-xl px-4 py-3"
          style={{ background: '#EDF7F4', borderLeft: '3px solid #2D7A5E' }}
        >
          <div className="space-y-0.5">
            <p className="text-sm font-semibold" style={{ color: '#1A4A36' }}>{celebration.titel}</p>
            <p className="text-sm" style={{ color: '#2D7A5E' }}>{celebration.body}</p>
          </div>
          <button
            onClick={celebration.dismiss}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm"
            style={{ color: '#2D7A5E' }}
            aria-label="Melding sluiten"
          >
            ✕
          </button>
        </div>
      )}

      {/* ══ ZONE 5: Recent Entries ═════════════════════════ */}
      {entries.length > 0 && (
        <section>
          <p className="section-label mb-2">{nl.dashboard_recente_metingen}</p>
          <ul className="space-y-2">
            {entries.slice(0, 3).map(entry => (
              <LogEntryCard
                key={entry.id}
                entry={entry}
                isInjectionDay={injectionDateSet.has(entry.logged_at.slice(0, 10))}
                isExpanded={expandedEntryId === entry.id}
                onToggle={() => setExpandedEntryId(prev => prev === entry.id ? null : entry.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* ══ Quiet day state ════════════════════════════════ */}
      {hasLoggedToday && alerts.length === 0 && !celebration && !isInjectionDay && !injectionCard.isDue && (
        <p className="text-center text-sm py-2" style={{ color: '#AAA49C' }}>
          {nl.dashboard_rustig}
        </p>
      )}

      {/* ══ ZONE 6: Secondary info ═════════════════════════ */}
      {nextAppointment && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: appointmentIsSoon ? '#FFF8EE' : '#F5F3F0' }}>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: appointmentIsSoon ? '#A85C0A' : '#6B6660' }}>
              {nl.dokter_profiel_afspraken}
            </p>
            <time className="text-sm font-semibold" style={{ color: '#14130F' }}>
              {new Date(nextAppointment.scheduled_at).toLocaleDateString('nl-NL', {
                weekday: 'short', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit',
              })}
            </time>
          </div>
          {appointmentIsSoon && (
            <span className="badge badge-amber flex-shrink-0">Binnenkort</span>
          )}
        </div>
      )}

      {contentTeaser && alerts.length === 0 && !celebration && (
        <Link to="/patient/inhoud" className="block rounded-xl px-4 py-3 no-underline" style={{ background: '#F5F3F0', textDecoration: 'none' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#2D7A5E' }}>{nl.inhoud_groep_start}</p>
          <p className="text-sm font-medium" style={{ color: '#14130F' }}>{contentTeaser.title}</p>
        </Link>
      )}

    </main>
  )
}
