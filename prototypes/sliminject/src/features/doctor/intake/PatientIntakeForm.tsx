import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useInvitations } from './useInvitations'
import { nl } from '../../../i18n/nl'
import { showSuccess, showError } from '../../../lib/toast'

export function PatientIntakeForm() {
  const { drugTypes, addInvitation } = useInvitations()
  const navigate = useNavigate()

  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [startdatum, setStartdatum] = useState('')
  const [startgewicht, setStartgewicht] = useState('')
  const [dosis, setDosis] = useState('')
  const [medicijn, setMedicijn] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await addInvitation({
        patient_name: naam.trim(),
        patient_email: email.trim().toLowerCase(),
        treatment_start_date: startdatum,
        initial_dose_mg: dosis ? parseFloat(dosis) : null,
        starting_weight_kg: startgewicht ? parseFloat(startgewicht) : null,
        drug_type_id: medicijn || null,
      })
      showSuccess(nl.toast_intake_succes)
      navigate('/dokter/overzicht')
    } catch (err: any) {
      const msg = err.message ?? nl.intake_fout
      setError(msg)
      showError(msg)
      setLoading(false)
    }
  }

  return (
    <main className="page-doctor space-y-6">
      <Link to="/dokter/overzicht" className="text-sm hover:underline" style={{ color: '#2D7A5E' }}>
        ← {nl.nav_patienten}
      </Link>

      <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>{nl.intake_titel}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Naam */}
        <div>
          <label htmlFor="naam" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.intake_naam} <span aria-hidden="true">*</span>
          </label>
          <input
            id="naam"
            required
            type="text"
            value={naam}
            onChange={e => setNaam(e.target.value)}
            className="input w-full"
            placeholder="bijv. Anna Jansen"
          />
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.intake_email} <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input w-full"
            placeholder="patient@email.nl"
          />
          <p className="mt-1 text-xs" style={{ color: '#6B6660' }}>{nl.intake_email_uitleg}</p>
        </div>

        {/* Startdatum */}
        <div>
          <label htmlFor="startdatum" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.intake_startdatum} <span aria-hidden="true">*</span>
          </label>
          <input
            id="startdatum"
            required
            type="date"
            value={startdatum}
            onChange={e => setStartdatum(e.target.value)}
            className="input w-full"
          />
        </div>

        {/* Startgewicht */}
        <div>
          <label htmlFor="startgewicht" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
            {nl.intake_startgewicht}
          </label>
          <input
            id="startgewicht"
            type="number"
            step="0.1"
            min="30"
            max="300"
            value={startgewicht}
            onChange={e => setStartgewicht(e.target.value)}
            className="input w-full"
            placeholder="bijv. 95.0"
          />
        </div>

        {/* Startdosering */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dosis" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
              {nl.schema_dosis}
            </label>
            <input
              id="dosis"
              type="number"
              step="0.05"
              min="0.05"
              max="10"
              value={dosis}
              onChange={e => setDosis(e.target.value)}
              className="input w-full"
              placeholder="0.25"
            />
          </div>
          <div>
            <label htmlFor="medicijn" className="block text-sm font-medium mb-1" style={{ color: '#14130F' }}>
              {nl.schema_medicijn}
            </label>
            <select
              id="medicijn"
              value={medicijn}
              onChange={e => setMedicijn(e.target.value)}
              className="input w-full bg-white"
            >
              <option value="">{nl.schema_medicijn_kies}</option>
              {drugTypes.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm alert-danger rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {loading ? nl.laden : nl.intake_versturen}
        </button>
      </form>
    </main>
  )
}
