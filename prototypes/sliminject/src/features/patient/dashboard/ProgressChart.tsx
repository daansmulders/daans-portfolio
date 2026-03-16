import type { ProgressEntry } from './useProgressEntries'
import { nl } from '../../../i18n/nl'

interface ProgressChartProps {
  entries: ProgressEntry[]
}

const CHART_W = 300
const CHART_H = 100
const PAD_LEFT = 28  // ruimte voor Y-as labels
const PAD_RIGHT = 8
const PAD_TOP = 8
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

  const sorted = [...entries].reverse() // oudste eerst

  // Toon grafiek pas na 7 dagen
  const firstDate = new Date(sorted[0].logged_at)
  const lastDate = new Date(sorted[sorted.length - 1].logged_at)
  const daySpan = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daySpan < 7) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">{nl.log_grafiek_wacht}</p>
    )
  }

  const weights = sorted.filter(e => e.weight_kg != null)
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
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return weights.map((e, i) => {
      const x = toX(i, weights.length)
      const y = toY(e.weight_kg!, min, max)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const weightVals = weights.map(e => e.weight_kg as number)
  const weightMin = weights.length ? Math.min(...weightVals) : 0
  const weightMax = weights.length ? Math.max(...weightVals) : 0

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        aria-label="Voortgangsgrafiek"
        role="img"
      >
        {/* Gridlijnen en Y-as labels (honger 1–5) */}
        {[1, 3, 5].map(v => {
          const y = toY(v, 1, 5)
          return (
            <g key={v}>
              <line x1={PAD_LEFT} y1={y} x2={CHART_W - PAD_RIGHT} y2={y}
                stroke="#f3f4f6" strokeWidth="1" />
              <text x={PAD_LEFT - 4} y={y + 3.5} textAnchor="end"
                fontSize="8" fill="#9ca3af">{v}</text>
            </g>
          )
        })}

        {/* Honger lijn (blauw) */}
        {hungerEntries.length >= 2 && (
          <path d={hungerPath()} fill="none" stroke="#3b82f6"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Gewicht lijn (groen) */}
        {weights.length >= 2 && (
          <path d={gewichtPath()} fill="none" stroke="#10b981"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="4 2" />
        )}

        {/* Gewicht min/max labels */}
        {weights.length >= 2 && (
          <>
            <text x={CHART_W - PAD_RIGHT} y={toY(weightMax, weightMin, weightMax) + 3.5}
              textAnchor="end" fontSize="8" fill="#10b981">{weightMax} kg</text>
            <text x={CHART_W - PAD_RIGHT} y={toY(weightMin, weightMin, weightMax) + 3.5}
              textAnchor="end" fontSize="8" fill="#10b981">{weightMin} kg</text>
          </>
        )}
      </svg>

      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        {hungerEntries.length >= 2 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" />
            {nl.grafiek_honger}
          </span>
        )}
        {weights.length >= 2 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" />
            {nl.grafiek_gewicht}
          </span>
        )}
      </div>
    </div>
  )
}
