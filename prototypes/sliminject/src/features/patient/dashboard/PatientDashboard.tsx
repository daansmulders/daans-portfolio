import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useProgressEntries, type ProgressEntry } from './useProgressEntries'
import { ProgressChart } from './ProgressChart'
import { useOfflineSync } from '../../../hooks/useOfflineSync'
import { usePatientDosageSchedule } from '../medication/usePatientDosageSchedule'
import { useEducationalContent } from '../content/useEducationalContent'
import { useAppointments } from '../../doctor/appointments/useAppointments'
import { useConcerns } from '../concerns/useConcerns'
import { useAdvice } from '../../doctor/patient/useAdvice'
import { getUnseenReviewedConcerns } from '../../../hooks/useSeenConcerns'
import { hasSeenOnboarding } from '../onboarding/OnboardingScreen'
import { nl } from '../../../i18n/nl'
import { useAuth } from '../../../auth/AuthProvider'

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7

/** Returns the treatment week number (0-indexed) for an entry, relative to the first ever entry */
function treatmentWeek(entry: ProgressEntry, firstEntry: ProgressEntry): number {
  return Math.floor(
    (new Date(entry.logged_at).getTime() - new Date(firstEntry.logged_at).getTime()) / MS_PER_WEEK
  )
}

/** True if this is the earliest log within its treatment week (= the "weekly" log) */
function isWeeklyLog(entry: ProgressEntry, allEntries: ProgressEntry[]): boolean {
  const first = allEntries[allEntries.length - 1]
  const week = treatmentWeek(entry, first)
  if (week === 0) return false
  const idx = allEntries.indexOf(entry)
  return !allEntries.slice(idx + 1).some(e => treatmentWeek(e, first) === week)
}

const REMINDER_ENABLED_KEY = 'sliminject_reminder_enabled'
const REMINDER_TIME_KEY = 'sliminject_reminder_time'

export function PatientDashboard() {
  useOfflineSync()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { entries, loading, hasLoggedToday, hasEnoughDataForChart } = useProgressEntries()

  // Notification reminder state
  const [reminderEnabled, setReminderEnabled] = useState(
    () => localStorage.getItem(REMINDER_ENABLED_KEY) === '1'
  )
  const [reminderTime, setReminderTime] = useState(
    () => localStorage.getItem(REMINDER_TIME_KEY) ?? '20:00'
  )
  const firedTodayRef = useRef(false)

  useEffect(() => {
    if (!loading && entries.length === 0 && !hasSeenOnboarding()) {
      navigate('/patient/onboarding', { replace: true })
    }
  }, [loading, entries.length, navigate])

  useEffect(() => {
    if (!reminderEnabled) return
    firedTodayRef.current = false
    const interval = setInterval(() => {
      if (firedTodayRef.current || hasLoggedToday) return
      if (Notification.permission !== 'granted') return
      const now = new Date()
      const [h, m] = reminderTime.split(':').map(Number)
      if (now.getHours() === h && now.getMinutes() === m) {
        new Notification(nl.herinnering_notificatie)
        firedTodayRef.current = true
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [reminderEnabled, reminderTime, hasLoggedToday])

  const { nextIncrease, daysUntilNext } = usePatientDosageSchedule()
  const { items: contentItems } = useEducationalContent()
  const { next: nextAppointment, hoursUntilNext } = useAppointments()
  const { concerns } = useConcerns()
  const unseenReplies = getUnseenReviewedConcerns(concerns)
  const latestReply = unseenReplies[0] ?? null
  const { advice } = useAdvice(user!.id)

  // First unread article as content teaser
  const contentTeaser = contentItems.find(i => !i.viewed) ?? null

  async function handleReminderToggle() {
    if (!reminderEnabled && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    const next = !reminderEnabled
    setReminderEnabled(next)
    localStorage.setItem(REMINDER_ENABLED_KEY, next ? '1' : '0')
  }

  function handleReminderTimeChange(t: string) {
    setReminderTime(t)
    localStorage.setItem(REMINDER_TIME_KEY, t)
  }

  if (loading) {
    return (
      <main className="page">
        <p style={{ color: '#AAA49C' }}>{nl.laden}</p>
      </main>
    )
  }

  const appointmentIsSoon = nextAppointment && hoursUntilNext !== null && hoursUntilNext <= 48
  const dosageChangeSoon = nextIncrease && daysUntilNext !== null && daysUntilNext <= 7

  return (
    <main className="page space-y-5">

      {/* ── Header ───────────────────────────────────────── */}
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

      {/* ── 1. Log CTA ───────────────────────────────────── */}
      {hasLoggedToday ? (
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 py-3"
          style={{ background: '#EDF7F4' }}
        >
          <span className="text-base" aria-hidden="true">✓</span>
          <span className="text-sm font-medium" style={{ color: '#1A4A36' }}>
            {nl.log_cta_gedaan}
          </span>
        </div>
      ) : (
        <Link
          to="/patient/log"
          className="btn btn-primary w-full"
          style={{ padding: '1rem', fontSize: '1rem', borderRadius: '14px', textAlign: 'center', display: 'block' }}
        >
          {nl.log_cta_vandaag}
        </Link>
      )}

      {/* ── 2. Doctor messages ───────────────────────────── */}
      {latestReply && (
        <Link
          to="/patient/meldingen"
          className="block card p-4 space-y-1"
          style={{ borderLeft: '3px solid #2D7A5E', textDecoration: 'none' }}
        >
          <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>
            {nl.dashboard_dokter_reactie}
          </p>
          <p className="text-sm line-clamp-2" style={{ color: '#14130F' }}>
            {latestReply.doctor_response}
          </p>
          <p className="text-xs" style={{ color: '#AAA49C' }}>
            {nl.dashboard_dokter_reactie_bekijken}
          </p>
        </Link>
      )}

      {!latestReply && advice && (
        <div className="card p-4 space-y-1">
          <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>
            {nl.advies_van_arts}
          </p>
          <p className="text-sm" style={{ color: '#14130F' }}>{advice.body}</p>
        </div>
      )}

      {/* ── 3. Treatment updates ─────────────────────────── */}
      {(nextAppointment || dosageChangeSoon) && (
        <div className="space-y-2">
          {nextAppointment && (
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: appointmentIsSoon ? '#FFF8EE' : '#F5F3F0' }}
            >
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

          {dosageChangeSoon && (
            <Link
              to="/patient/medicatie"
              className="flex items-center justify-between rounded-xl px-4 py-3 no-underline"
              style={{ background: '#FFF8EE', textDecoration: 'none' }}
            >
              <p className="text-sm font-medium" style={{ color: '#A85C0A' }}>
                {nl.dashboard_dosering_toename.replace('{dagen}', String(daysUntilNext))}
              </p>
              <span style={{ color: '#A85C0A' }}>→</span>
            </Link>
          )}
        </div>
      )}

      {/* ── 4. Progress chart ────────────────────────────── */}
      {hasEnoughDataForChart && <ProgressChart entries={entries} />}

      {/* ── 5. Recent entries ────────────────────────────── */}
      {entries.length > 0 && (
        <section>
          <p className="section-label mb-3">{nl.dashboard_recente_metingen}</p>
          <ul className="space-y-2">
            {entries.slice(0, 5).map(entry => {
              const weekly = entries.length > 1 && isWeeklyLog(entry, entries)
              const week = weekly ? treatmentWeek(entry, entries[entries.length - 1]) : null
              return (
                <li key={entry.id} className="card px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {weekly && week !== null && (
                        <span
                          className="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: '#EDF7F4', color: '#2D7A5E' }}
                        >
                          Week {week}
                        </span>
                      )}
                      <time className="text-sm" style={{ color: '#6B6660' }}>
                        {new Date(entry.logged_at).toLocaleDateString('nl-NL', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry.weight_kg != null && (
                        <span className="text-sm font-semibold tabular-nums" style={{ color: '#14130F' }}>
                          {entry.weight_kg} <span className="text-xs font-normal" style={{ color: '#AAA49C' }}>kg</span>
                        </span>
                      )}
                      {entry.hunger_score != null && (
                        <span className="badge badge-brand">
                          {nl.grafiek_honger} {entry.hunger_score}/5
                        </span>
                      )}
                    </div>
                  </div>
                  {entry.symptoms.length > 0 && (
                    <p className="text-xs mt-1.5" style={{ color: '#AAA49C' }}>
                      {entry.symptoms.join(', ')}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ── 7. Content teaser ────────────────────────────── */}
      {contentTeaser && (
        <Link
          to="/patient/inhoud"
          className="block card p-4 space-y-1 no-underline"
          style={{ textDecoration: 'none' }}
        >
          <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>
            {nl.inhoud_groep_start}
          </p>
          <p className="text-sm font-medium" style={{ color: '#14130F' }}>{contentTeaser.title}</p>
          <p className="text-xs" style={{ color: '#AAA49C' }}>
            {contentTeaser.content_type === 'video' ? nl.inhoud_video : nl.inhoud_artikel} · {nl.inhoud_leeg.split('.')[0]}
          </p>
        </Link>
      )}

      {/* ── 8. Reminder (de-emphasised) ──────────────────── */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #E0DBD4' }}>
        <div>
          <p className="text-sm" style={{ color: '#6B6660' }}>{nl.herinnering_titel}</p>
          {reminderEnabled && (
            <p className="text-xs mt-0.5" style={{ color: '#AAA49C' }}>{reminderTime}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {reminderEnabled && (
            <input
              type="time"
              value={reminderTime}
              onChange={e => handleReminderTimeChange(e.target.value)}
              className="input text-sm"
              style={{ width: 'auto', padding: '4px 8px' }}
              aria-label={nl.herinnering_tijd}
            />
          )}
          <button
            onClick={handleReminderToggle}
            role="switch"
            aria-checked={reminderEnabled}
            aria-label={nl.herinnering_titel}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${reminderEnabled ? 'bg-[#2D7A5E]' : 'bg-[#E0DBD4]'}`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${reminderEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

    </main>
  )
}
