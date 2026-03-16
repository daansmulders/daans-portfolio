import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useInvitations } from './useInvitations'
import { nl } from '../../../i18n/nl'

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
      navigate('/dokter/overzicht')
    } catch (err: any) {
      setError(err.message ?? nl.intake_fout)
      setLoading(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <Link to="/dokter/overzicht" className="text-sm text-blue-600 hover:underline">
        ← {nl.nav_patienten}
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">{nl.intake_titel}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Naam */}
        <div>
          <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.intake_naam} <span aria-hidden="true">*</span>
          </label>
          <input
            id="naam"
            required
            type="text"
            value={naam}
            onChange={e => setNaam(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="bijv. Anna Jansen"
          />
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.intake_email} <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="patient@email.nl"
          />
          <p className="mt-1 text-xs text-gray-500">{nl.intake_email_uitleg}</p>
        </div>

        {/* Startdatum */}
        <div>
          <label htmlFor="startdatum" className="block text-sm font-medium text-gray-700 mb-1">
            {nl.intake_startdatum} <span aria-hidden="true">*</span>
          </label>
          <input
            id="startdatum"
            required
            type="date"
            value={startdatum}
            onChange={e => setStartdatum(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Startgewicht */}
        <div>
          <label htmlFor="startgewicht" className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="bijv. 95.0"
          />
        </div>

        {/* Startdosering */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dosis" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.25"
            />
          </div>
          <div>
            <label htmlFor="medicijn" className="block text-sm font-medium text-gray-700 mb-1">
              {nl.schema_medicijn}
            </label>
            <select
              id="medicijn"
              value={medicijn}
              onChange={e => setMedicijn(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{nl.schema_medicijn_kies}</option>
              {drugTypes.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? nl.laden : nl.intake_versturen}
        </button>
      </form>
    </main>
  )
}
