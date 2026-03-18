import { nl } from '../../../i18n/nl'
import type { ProgressEntry } from './useProgressEntries'
import type { SymptomEntry } from '../../../lib/supabase'

interface LogEntryCardProps {
  entry: ProgressEntry
  isInjectionDay: boolean
  isExpanded: boolean
  onToggle: () => void
}

const MAX_SYMPTOM_CHIPS = 3

function ScoreBadge({ label, score, max = 5 }: { label: string; score: number; max?: number }) {
  return (
    <span className="badge badge-brand">{label} {score}/{max}</span>
  )
}

function SymptomChips({ symptoms }: { symptoms: SymptomEntry[] }) {
  const visible = symptoms.slice(0, MAX_SYMPTOM_CHIPS)
  const overflow = symptoms.length - MAX_SYMPTOM_CHIPS

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(s => (
        <span
          key={s.name}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: '#F5F3F0', color: '#6B6660' }}
        >
          {s.name}
          {s.severity > 0 && (
            <span
              className="font-semibold"
              style={{ color: s.severity >= 4 ? '#A85C0A' : '#2E2B24' }}
            >
              {s.severity}/5
            </span>
          )}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-xs px-2 py-0.5" style={{ color: '#AAA49C' }}>
          {nl.card_meer_symptomen.replace('{n}', String(overflow))}
        </span>
      )}
    </div>
  )
}

function EntryDetails({ entry }: { entry: ProgressEntry }) {
  const hasScores = entry.hunger_score != null || entry.food_noise_score != null
  const hasSymptoms = entry.symptoms.length > 0
  const hasNotes = entry.notes != null && entry.notes.trim() !== ''

  if (!hasScores && !hasSymptoms && !hasNotes) return null

  return (
    <div className="space-y-1.5 pt-1">
      {hasScores && (
        <div className="flex flex-wrap gap-1.5">
          {entry.hunger_score != null && (
            <ScoreBadge label={nl.grafiek_honger} score={entry.hunger_score} />
          )}
          {entry.food_noise_score != null && (
            <ScoreBadge label={nl.card_voedselruis} score={entry.food_noise_score} />
          )}
        </div>
      )}
      {hasSymptoms && <SymptomChips symptoms={entry.symptoms} />}
      {hasNotes && (
        <p
          className="text-xs italic"
          style={{ color: '#6B6660', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {entry.notes}
        </p>
      )}
    </div>
  )
}

function SideEffectDot({ symptoms }: { symptoms: SymptomEntry[] }) {
  if (symptoms.length === 0) return null
  const isSevere = symptoms.some(s => s.severity >= 4)
  return (
    <span
      className="flex-shrink-0 rounded-full"
      style={{
        width: '7px',
        height: '7px',
        background: isSevere ? '#A85C0A' : '#2D7A5E',
      }}
      aria-label={isSevere ? 'Ernstige klachten' : 'Klachten gemeld'}
    />
  )
}

function ScoreSummary({ hungerScore, foodNoiseScore }: { hungerScore: number | null; foodNoiseScore: number | null }) {
  if (hungerScore == null && foodNoiseScore == null) return null
  return (
    <span className="flex items-center gap-1 text-xs tabular-nums flex-shrink-0" style={{ color: '#AAA49C' }}>
      {hungerScore != null && <span>{nl.card_honger_kort}{hungerScore}</span>}
      {hungerScore != null && foodNoiseScore != null && <span>·</span>}
      {foodNoiseScore != null && <span>{nl.card_voedselruis_kort}{foodNoiseScore}</span>}
    </span>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#AAA49C"
      strokeWidth="2"
      className="flex-shrink-0 transition-transform"
      style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function LogEntryCard({ entry, isInjectionDay, isExpanded, onToggle }: LogEntryCardProps) {
  return (
    <li
      className="card px-4 py-2.5 cursor-pointer"
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isInjectionDay && (
            <span className="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: '#EDF7F4', color: '#2D7A5E' }}>
              {nl.injectiedag_badge}
            </span>
          )}
          <time className="text-sm" style={{ color: '#6B6660' }}>
            {new Date(entry.logged_at).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
          </time>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SideEffectDot symptoms={entry.symptoms} />
          <ScoreSummary hungerScore={entry.hunger_score} foodNoiseScore={entry.food_noise_score} />
          {entry.weight_kg != null && (
            <span className="text-sm font-semibold tabular-nums" style={{ color: '#14130F' }}>
              {entry.weight_kg} <span className="text-xs font-normal" style={{ color: '#AAA49C' }}>kg</span>
            </span>
          )}
          <ChevronIcon expanded={isExpanded} />
        </div>
      </div>
      {isExpanded && <EntryDetails entry={entry} />}
    </li>
  )
}
