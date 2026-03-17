import { useState } from 'react'
import type { CheckInData } from './useWellbeingCheckIn'
import { nl } from '../../../i18n/nl'

interface WellbeingCheckInProps {
  isDue: boolean
  submitting: boolean
  submitCheckIn: (data: CheckInData) => Promise<void>
}

function ScorePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (v: number) => void
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
            onClick={() => onChange(v)}
            className={`hunger-btn${value === v ? ' selected' : ''}`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1 px-0.5">
        <span className="text-xs" style={{ color: '#AAA49C' }}>Laag</span>
        <span className="text-xs" style={{ color: '#AAA49C' }}>Hoog</span>
      </div>
    </div>
  )
}

export function WellbeingCheckIn({ isDue, submitting, submitCheckIn }: WellbeingCheckInProps) {
  const [energie, setEnergie]               = useState<number | null>(null)
  const [stemming, setStemming]             = useState<number | null>(null)
  const [zelfvertrouwen, setZelfvertrouwen] = useState<number | null>(null)
  const [notitie, setNotitie]               = useState('')

  if (!isDue) return null

  const canSubmit = energie != null || stemming != null || zelfvertrouwen != null

  async function handleSubmit() {
    if (!canSubmit) return
    await submitCheckIn({
      energy_score:     energie,
      mood_score:       stemming,
      confidence_score: zelfvertrouwen,
      note:             notitie || null,
    })
  }

  return (
    <div className="card p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: '#14130F' }}>
          {nl.welzijn_checkin_titel}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#6B6660' }}>
          {nl.welzijn_checkin_subtitel} Elk onderdeel is optioneel.
        </p>
      </div>

      <ScorePicker label={nl.welzijn_checkin_energie}       value={energie}       onChange={setEnergie} />
      <ScorePicker label={nl.welzijn_checkin_stemming}      value={stemming}      onChange={setStemming} />
      <ScorePicker label={nl.welzijn_checkin_zelfvertrouwen} value={zelfvertrouwen} onChange={setZelfvertrouwen} />

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2E2B24' }}>
          {nl.welzijn_checkin_notitie}
        </label>
        <textarea
          rows={2}
          value={notitie}
          onChange={e => setNotitie(e.target.value.slice(0, 200))}
          className="input resize-none"
          placeholder="Hoe gaat het met je behandeling?"
          style={{ minHeight: '64px' }}
        />
      </div>

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className="btn btn-primary w-full"
      >
        {submitting ? nl.laden : nl.welzijn_checkin_opslaan}
      </button>
    </div>
  )
}
