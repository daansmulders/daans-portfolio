import { nl } from '../../../i18n/nl'
import type { MilestoneData } from './useTreatmentMilestone'

interface MilestoneSummaryCardProps {
  milestone: MilestoneData
  onDismiss?: () => void
}

const headings: Record<number, string> = {
  4: nl.milestone_heading_4,
  8: nl.milestone_heading_8,
  12: nl.milestone_heading_12,
  16: nl.milestone_heading_16,
}

function WeightLine({ change }: { change: number }) {
  if (change === 0) {
    return <p className="text-sm" style={{ color: '#2E2B24' }}>{nl.milestone_gewicht_gelijk}</p>
  }
  const abs = Math.abs(change).toFixed(1).replace('.', ',')
  const direction = change < 0 ? nl.milestone_gewicht_lichter : nl.milestone_gewicht_zwaarder
  return (
    <p className="text-sm" style={{ color: '#2E2B24' }}>
      {nl.milestone_gewicht.replace('{change}', abs).replace('{richting}', direction)}
    </p>
  )
}

export function MilestoneSummaryCard({ milestone, onDismiss }: MilestoneSummaryCardProps) {
  const heading = headings[milestone.week] ?? `Week ${milestone.week}`
  const hasContent = milestone.weightChange != null || milestone.logCount > 0 || milestone.trendObservation || milestone.adherenceConfirmed != null

  return (
    <div
      className="rounded-xl px-5 py-4 space-y-2"
      style={{ background: '#FAF8F5', borderLeft: '3px solid #2D7A5E' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold" style={{ color: '#1A4A36', fontFamily: "'Instrument Serif', Georgia, serif" }}>
          {heading}
        </h3>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm"
            style={{ color: '#2D7A5E' }}
            aria-label="Melding sluiten"
          >
            ✕
          </button>
        )}
      </div>

      {hasContent ? (
        <div className="space-y-1">
          {milestone.weightChange != null && <WeightLine change={milestone.weightChange} />}

          {milestone.logCount > 0 && (
            <p className="text-sm" style={{ color: '#6B6660' }}>
              {nl.milestone_logcount.replace('{n}', String(milestone.logCount))}
            </p>
          )}

          {milestone.adherenceConfirmed != null && milestone.adherenceTotal != null && (
            <p className="text-sm" style={{ color: '#6B6660' }}>
              {nl.milestone_adherence
                .replace('{n}', String(milestone.adherenceConfirmed))
                .replace('{total}', String(milestone.adherenceTotal))}
            </p>
          )}

          {milestone.trendObservation && (
            <p className="text-sm font-medium" style={{ color: '#2D7A5E' }}>
              {milestone.trendObservation}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm" style={{ color: '#6B6660' }}>
          {nl.milestone_geen_logs}
        </p>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-sm font-medium mt-1"
          style={{ color: '#2D7A5E' }}
        >
          {nl.milestone_sluiten}
        </button>
      )}
    </div>
  )
}
