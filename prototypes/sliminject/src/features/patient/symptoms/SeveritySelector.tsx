import { nl } from '../../../i18n/nl'

const severityLabels = [nl.severity_1, nl.severity_2, nl.severity_3, nl.severity_4, nl.severity_5]

interface SeveritySelectorProps {
  value: number
  onChange: (severity: number) => void
}

export function SeveritySelector({ value, onChange }: SeveritySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(score => (
        <button
          key={score}
          type="button"
          aria-label={severityLabels[score - 1]}
          aria-pressed={value === score}
          onClick={(e) => { e.stopPropagation(); onChange(score) }}
          className="flex items-center justify-center rounded-full text-xs font-semibold transition-colors"
          style={{
            width: '26px',
            height: '26px',
            background: value === score
              ? score >= 4 ? '#FFF0E0' : '#EDF7F4'
              : 'transparent',
            color: value === score
              ? score >= 4 ? '#A85C0A' : '#1A4A36'
              : '#C8C2BA',
            border: value === score
              ? score >= 4 ? '1.5px solid #A85C0A' : '1.5px solid #2D7A5E'
              : '1.5px solid #E0DBD4',
          }}
        >
          {score}
        </button>
      ))}
      <span className="text-xs ml-0.5" style={{ color: value >= 4 ? '#A85C0A' : '#AAA49C' }}>
        {severityLabels[value - 1]}
      </span>
    </div>
  )
}
