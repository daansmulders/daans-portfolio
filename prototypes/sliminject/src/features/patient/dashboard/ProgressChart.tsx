import type { ProgressEntry } from './useProgressEntries'
import { nl } from '../../../i18n/nl'

interface ProgressChartProps {
  entries: ProgressEntry[]
}

export function ProgressChart({ entries }: ProgressChartProps) {
  if (entries.length === 0) return null

  const sorted = [...entries].reverse() // oudste eerst
  const weights = sorted.filter(e => e.weight_kg != null)
  const wellbeingValues = sorted.map(e => e.wellbeing_score)

  // Eenvoudige SVG-grafiek voor gewicht en welzijn
  const chartWidth = 300
  const chartHeight = 80
  const padding = 8

  function toX(i: number, total: number) {
    return padding + (i / Math.max(total - 1, 1)) * (chartWidth - padding * 2)
  }

  function welzijnPath() {
    if (wellbeingValues.length < 2) return ''
    return wellbeingValues
      .map((v, i) => {
        const x = toX(i, wellbeingValues.length)
        const y = chartHeight - padding - ((v - 1) / 4) * (chartHeight - padding * 2)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  function gewichtPath() {
    if (weights.length < 2) return ''
    const values = weights.map(e => e.weight_kg as number)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    return values
      .map((v, i) => {
        const x = toX(i, values.length)
        const y = chartHeight - padding - ((v - min) / range) * (chartHeight - padding * 2)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        aria-label="Voortgangsgrafiek"
        role="img"
      >
        {/* Welzijn lijn (blauw) */}
        {wellbeingValues.length >= 2 && (
          <path
            d={welzijnPath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Gewicht lijn (groen) */}
        {weights.length >= 2 && (
          <path
            d={gewichtPath()}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
          />
        )}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" />
          {nl.grafiek_welzijn}
        </span>
        {weights.length >= 2 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded border-dashed" />
            {nl.grafiek_gewicht}
          </span>
        )}
      </div>
    </div>
  )
}
