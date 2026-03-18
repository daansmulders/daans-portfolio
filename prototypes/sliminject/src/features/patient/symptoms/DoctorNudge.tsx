import { useNavigate } from 'react-router-dom'
import { nl } from '../../../i18n/nl'

interface DoctorNudgeProps {
  symptom: string
}

export function DoctorNudge({ symptom }: DoctorNudgeProps) {
  const navigate = useNavigate()

  return (
    <div
      className="card px-4 py-4 space-y-2"
      style={{ background: '#FFF8EE', borderLeft: '3px solid #A85C0A' }}
    >
      <div className="flex items-start gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A85C0A" strokeWidth="1.6" className="flex-shrink-0 mt-0.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: '#7A3D00' }}>
            {nl.dokter_nudge_titel}
          </p>
          <p className="text-sm" style={{ color: '#2E2B24' }}>
            {nl.dokter_nudge_body.replace('{symptoom}', symptom.toLowerCase())}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/patient/meldingen/nieuw')}
        className="btn btn-secondary w-full mt-2"
        style={{ borderColor: '#A85C0A', color: '#7A3D00' }}
      >
        {nl.dokter_nudge_cta}
      </button>
    </div>
  )
}
