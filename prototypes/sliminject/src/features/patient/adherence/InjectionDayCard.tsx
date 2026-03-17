import { useState } from 'react'
import { nl } from '../../../i18n/nl'
import type { InjectionDayLogData, InjectionDayStep } from './useInjectionDayCard'

interface InjectionDayCardProps {
  isDue: boolean
  step: InjectionDayStep
  submitting: boolean
  confirmInjection: () => void
  submitLog: (data: InjectionDayLogData) => Promise<void>
  skipInjection: (note?: string) => Promise<void>
  adjustInjection: (note?: string) => Promise<void>
  isNewDose?: boolean
  newDoseMg?: number | null
}

function ScorePicker({
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  minLabel?: string
  maxLabel?: string
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-2" style={{ color: '#2E2B24' }}>{label}</p>
      <div className="flex gap-2" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            type="button"
            aria-label={String(v)}
            aria-pressed={value === v}
            onClick={() => onChange(value === v ? null : v)}
            className={`hunger-btn${value === v ? ' selected' : ''}`}
          >
            {v}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-xs" style={{ color: '#AAA49C' }}>{minLabel}</span>
          <span className="text-xs" style={{ color: '#AAA49C' }}>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}

export function InjectionDayCard({
  isDue,
  step,
  submitting,
  confirmInjection,
  submitLog,
  skipInjection,
  adjustInjection,
  isNewDose = false,
  newDoseMg,
}: InjectionDayCardProps) {
  const [showAdjustNote, setShowAdjustNote] = useState(false)
  const [adjustNote, setAdjustNote] = useState('')

  // Log form state
  const [gewicht, setGewicht] = useState('')
  const [honger, setHonger] = useState<number>(3)
  const [voedselruis, setVoedselruis] = useState<number | null>(null)
  const [energie, setEnergie] = useState<number | null>(null)
  const [notitie, setNotitie] = useState('')

  if (!isDue) return null

  // ── step: done ───────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="alert-brand rounded-xl px-4 py-3">
        <p className="text-sm font-medium" style={{ color: '#1A4A36' }}>
          {nl.injectiedag_bevestiging}
        </p>
      </div>
    )
  }

  // ── step: log (after confirming injection) ───────────────────────────────────
  if (step === 'log') {
    async function handleSubmitLog() {
      await submitLog({
        weight_kg: gewicht ? parseFloat(gewicht) : null,
        hunger_score: honger,
        food_noise_score: voedselruis,
        energy_score: energie,
        note: notitie || null,
      })
    }

    async function handleSkipLog() {
      // Save adherence (confirmed) without a log entry
      // Parent already called confirmInjection; we call submitLog with minimal data
      await submitLog({
        weight_kg: null,
        hunger_score: honger,
        food_noise_score: null,
        energy_score: null,
        note: null,
      })
    }

    return (
      <div className="card p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>
            {nl.injectiedag_bevestigd_label}
          </p>
          <p className="text-sm mt-0.5" style={{ color: '#14130F' }}>
            {nl.injectiedag_log_subtitel}
          </p>
        </div>

        {/* Gewicht */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2E2B24' }}>
            {nl.log_gewicht}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={gewicht}
              onChange={e => setGewicht(e.target.value)}
              className="input pr-10 text-lg font-semibold w-full"
              placeholder="82.5"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
              style={{ color: '#AAA49C' }}
            >
              kg
            </span>
          </div>
        </div>

        {/* Honger */}
        <ScorePicker
          label={nl.log_honger}
          value={honger}
          onChange={v => setHonger(v ?? 3)}
          minLabel={nl.honger_min}
          maxLabel={nl.honger_max}
        />

        {/* Voedselruis — weekly framing */}
        <ScorePicker
          label={nl.log_voedselruis_week}
          value={voedselruis}
          onChange={setVoedselruis}
          minLabel={nl.log_voedselruis_min}
          maxLabel={nl.log_voedselruis_max}
        />

        {/* Energie */}
        <ScorePicker
          label={nl.log_energie}
          value={energie}
          onChange={setEnergie}
          minLabel="Laag"
          maxLabel="Hoog"
        />

        {/* Notitie */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2E2B24' }}>
            {nl.log_notities}
          </label>
          <textarea
            rows={2}
            value={notitie}
            onChange={e => setNotitie(e.target.value.slice(0, 200))}
            className="input resize-none w-full"
            placeholder="Hoe gaat het met je behandeling?"
            style={{ minHeight: '60px' }}
          />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmitLog}
            className="btn btn-primary w-full"
          >
            {submitting ? nl.laden : nl.log_opslaan}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSkipLog}
            className="btn btn-ghost w-full text-sm"
          >
            {nl.injectiedag_sla_log_over}
          </button>
        </div>
      </div>
    )
  }

  // ── step: confirm ─────────────────────────────────────────────────────────────
  return (
    <div className="card p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold" style={{ color: '#2D7A5E' }}>
          {nl.injectiedag_titel}
        </p>
        <p className="text-sm mt-0.5" style={{ color: '#14130F' }}>
          {nl.injectiedag_vraag}
        </p>
      </div>

      {isNewDose && newDoseMg != null && (
        <div className="alert-amber rounded-lg px-3 py-2 space-y-0.5">
          <p className="text-sm font-medium" style={{ color: '#7A3D00' }}>
            {nl.dosis_nieuw_label.replace('{dosis}', String(newDoseMg))}
          </p>
          <p className="text-xs" style={{ color: '#A85C0A' }}>
            {nl.dosis_nieuw_bijwerking}
          </p>
        </div>
      )}

      {showAdjustNote ? (
        <div className="space-y-2">
          <textarea
            className="input w-full resize-none"
            rows={2}
            placeholder="Optionele toelichting (bijv. halve dosis, dag uitgesteld)"
            value={adjustNote}
            onChange={e => setAdjustNote(e.target.value)}
            autoFocus
            style={{ fontSize: '0.875rem' }}
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={() => adjustInjection(adjustNote || undefined)}
              disabled={submitting}
            >
              {submitting ? nl.laden : nl.opslaan}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setShowAdjustNote(false); setAdjustNote('') }}
              disabled={submitting}
            >
              {nl.annuleren}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-primary btn-sm"
            onClick={confirmInjection}
            disabled={submitting}
          >
            ✓ Ja, genomen
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => skipInjection()}
            disabled={submitting}
          >
            Nee, overgeslagen
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowAdjustNote(true)}
            disabled={submitting}
          >
            Andere dosis
          </button>
        </div>
      )}
    </div>
  )
}
