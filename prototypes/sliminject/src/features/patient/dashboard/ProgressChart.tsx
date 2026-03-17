import type { ProgressEntry } from './useProgressEntries'
import { nl } from '../../../i18n/nl'

interface ProgressChartProps {
  entries: ProgressEntry[]
}

const CHART_W  = 300
const CHART_H  = 100
const PAD_LEFT = 28
const PAD_RIGHT = 8
const PAD_TOP   = 8
const PAD_BOTTOM = 8

function toX(i: number, total: number) {
  return PAD_LEFT + (i / Math.max(total - 1, 1)) * (CHART_W - PAD_LEFT - PAD_RIGHT)
}
function toY(value: number, min: number, max: number) {
  const range = max - min || 1
  return CHART_H - PAD_BOTTOM - ((value - min) / range) * (CHART_H - PAD_TOP - PAD_BOTTOM)
}

export function ProgressChart({ entries }: ProgressChartProps) {
  if (entries.length === 0) return null

  const sorted = [...entries].reverse()

  const firstDate = new Date(sorted[0].logged_at)
  const lastDate  = new Date(sorted[sorted.length - 1].logged_at)
  const daySpan   = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daySpan < 7) {
    return <p className="text-sm text-center py-4" style={{ color: '#AAA49C' }}>{nl.log_grafiek_wacht}</p>
  }

  const weights       = sorted.filter(e => e.weight_kg != null)
  const hungerEntries = sorted.filter(e => e.hunger_score != null)

  function hungerPath() {
    if (hungerEntries.length < 2) return ''
    return hungerEntries.map((e, i) => {
      const x = toX(i, hungerEntries.length)
      const y = toY(e.hunger_score!, 1, 5)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  function gewichtPath() {
    if (weights.length < 2) return ''
    const vals = weights.map(e => e.weight_kg as number)
    const min  = Math.min(...vals)
    const max  = Math.max(...vals)
    return weights.map((e, i) => {
      const x = toX(i, weights.length)
      const y = toY(e.weight_kg!, min, max)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const weightVals = weights.map(e => e.weight_kg as number)
  const weightMin  = weights.length ? Math.min(...weightVals) : 0
  const weightMax  = weights.length ? Math.max(...weightVals) : 0

  return (
    <div className="card p-4">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        aria-label="Voortgangsgrafiek"
        role="img"
      >
        {[1, 3, 5].map(v => {
          const y = toY(v, 1, 5)
          return (
            <g key={v}>
              <line x1={PAD_LEFT} y1={y} x2={CHART_W - PAD_RIGHT} y2={y}
                stroke="#E0DBD4" strokeWidth="1" />
              <text x={PAD_LEFT - 4} y={y + 3.5} textAnchor="end"
                fontSize="8" fill="#AAA49C">{v}</text>
            </g>
          )
        })}

        {/* Hunger line — brand green */}
        {hungerEntries.length >= 2 && (
          <path d={hungerPath()} fill="none" stroke="#2D7A5E"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Weight line — amber */}
        {weights.length >= 2 && (
          <path d={gewichtPath()} fill="none" stroke="#E8821A"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="4 2" />
        )}

        {weights.length >= 2 && (
          <>
            <text x={CHART_W - PAD_RIGHT} y={toY(weightMax, weightMin, weightMax) + 3.5}
              textAnchor="end" fontSize="8" fill="#E8821A">{weightMax} kg</text>
            <text x={CHART_W - PAD_RIGHT} y={toY(weightMin, weightMin, weightMax) + 3.5}
              textAnchor="end" fontSize="8" fill="#E8821A">{weightMin} kg</text>
          </>
        )}
      </svg>

      <div className="mt-3 flex gap-4" style={{ fontSize: '.75rem', color: '#6B6660' }}>
        {hungerEntries.length >= 2 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#2D7A5E' }} />
            {nl.grafiek_honger}
          </span>
        )}
        {weights.length >= 2 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#E8821A' }} />
            {nl.grafiek_gewicht}
          </span>
        )}
      </div>
    </div>
  )
}
