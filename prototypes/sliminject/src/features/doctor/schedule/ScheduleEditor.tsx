import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDosageSchedule } from './useDosageSchedule'
import { nl } from '../../../i18n/nl'
import { showSuccess, showError } from '../../../lib/toast'

const CHART_W = 300
const CHART_H = 80
const PAD_L = 32
const PAD_R = 8
const PAD_T = 8
const PAD_B = 20

function TitrationChart({ entries }: { entries: { start_date: string; dose_mg: number }[] }) {
  if (entries.length < 2) return null

  const sorted = [...entries].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const doses = sorted.map(e => e.dose_mg)
  const minDose = Math.min(...doses)
  const maxDose = Math.max(...doses)
  const dates = sorted.map(e => new Date(e.start_date).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)

  function toX(ts: number) {
    const span = maxDate - minDate || 1
    return PAD_L + ((ts - minDate) / span) * (CHART_W - PAD_L - PAD_R)
  }
  function toY(dose: number) {
    const range = maxDose - minDose || 1
    return CHART_H - PAD_B - ((dose - minDose) / range) * (CHART_H - PAD_T - PAD_B)
  }

  const pathD = sorted.map((e, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(new Date(e.start_date).getTime())} ${toY(e.dose_mg)}`
  ).join(' ')

  const yTicks = maxDose === minDose ? [minDose] : [minDose, maxDose]

  return (
    <div className="card p-4 space-y-2">
      <p className="text-xs font-medium" style={{ color: '#6B6660' }}>{nl.schema_titratie_curve}</p>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" aria-label={nl.schema_titratie_curve} role="img">
        {yTicks.map(v => {
          const y = toY(v)
          return (
            <g key={v}>
              <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#E0DBD4" strokeWidth="1" />
              <text x={PAD_L - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#AAA49C">{v}</text>
            </g>
          )
        })}
        <path d={pathD} fill="none" stroke="#2D7A5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {sorted.map(e => (
          <circle
            key={e.start_date}
            cx={toX(new Date(e.start_date).getTime())}
            cy={toY(e.dose_mg)}
            r={3}
            fill="#2D7A5E"
          />
        ))}
        {/* X-axis date labels for first and last */}
        <text x={toX(minDate)} y={CHART_H - 4} textAnchor="start" fontSize="7" fill="#AAA49C">
          {new Date(minDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
        </text>
        <text x={toX(maxDate)} y={CHART_H - 4} textAnchor="end" fontSize="7" fill="#AAA49C">
          {new Date(maxDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
        </text>
      </svg>
      <p className="text-xs" style={{ color: '#AAA49C' }}>mg per injectie</p>
    </div>
  )
}

export function ScheduleEditor() {
  const { id: patientId } = useParams<{ id: string }>()
  const { entries, drugTypes, loading, addEntry, removeEntry } = useDosageSchedule(patientId!)
  const [dose, setDose] = useState('')
  const [date, setDate] = useState('')
  const [drugTypeId, setDrugTypeId] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!dose || !date) return
    setSaving(true)
    try {
      await addEntry(parseFloat(dose), date, drugTypeId || undefined, notes || undefined)
      setDose(''); setDate(''); setDrugTypeId(''); setNotes('')
      showSuccess(nl.toast_schema_bijgewerkt)
    } catch {
      showError(nl.toast_fout)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-doctor space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dokter/patient/${patientId}`} className="text-sm hover:underline" style={{ color: '#2D7A5E' }}>← {nl.terug}</Link>
        <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>{nl.schema_titel}</h1>
      </div>

      {/* Titratieschema preview */}
      {!loading && <TitrationChart entries={entries} />}

      {/* Bestaande entries */}
      {!loading && entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map(e => (
            <li key={e.id} className="card flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium" style={{ color: '#14130F' }}>{e.dose_mg} mg</span>
                {e.drug_type_name && (
                  <span className="badge badge-brand ml-2">
                    {e.drug_type_name}
                  </span>
                )}
                <span className="text-sm ml-3" style={{ color: '#6B6660' }}>
                  {new Date(e.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {e.notes && <p className="text-xs mt-0.5" style={{ color: '#6B6660' }}>{e.notes}</p>}
              </div>
              <button
                onClick={() => removeEntry(e.id)}
                className="text-sm hover:underline"
                style={{ color: '#A52020' }}
                aria-label={`${nl.schema_verwijderen} ${e.dose_mg} mg`}
              >
                {nl.schema_verwijderen}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Nieuwe entry */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-medium" style={{ color: '#14130F' }}>{nl.schema_toevoegen}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dose" className="block text-xs mb-1" style={{ color: '#6B6660' }}>{nl.schema_dosis}</label>
            <input id="dose" type="number" step="0.25" min="0" value={dose}
              onChange={e => setDose(e.target.value)}
              className="input w-full"
              placeholder="0.5"
            />
          </div>
          <div>
            <label htmlFor="start-date" className="block text-xs mb-1" style={{ color: '#6B6660' }}>{nl.schema_startdatum}</label>
            <input id="start-date" type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>
        <div>
          <label htmlFor="drug-type" className="block text-xs mb-1" style={{ color: '#6B6660' }}>{nl.schema_medicijn}</label>
          <select
            id="drug-type"
            value={drugTypeId}
            onChange={e => setDrugTypeId(e.target.value)}
            className="input w-full bg-white"
          >
            <option value="">{nl.schema_medicijn_kies}</option>
            {drugTypes.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="schema-notes" className="block text-xs mb-1" style={{ color: '#6B6660' }}>{nl.schema_notitie}</label>
          <input id="schema-notes" type="text" value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input w-full"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={saving || !dose || !date}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {saving ? nl.laden : nl.schema_toevoegen}
        </button>
      </div>
    </main>
  )
}
