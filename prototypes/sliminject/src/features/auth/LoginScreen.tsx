import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { nl } from '../../i18n/nl'

export function LoginScreen() {
  const { signIn, role } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  if (role === 'patient') { navigate('/patient/dashboard'); return null }
  if (role === 'doctor')  { navigate('/dokter/overzicht'); return null }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError(nl.inloggen_mislukt)
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#F7F4F0' }}
    >
      {/* Brand mark */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#2D7A5E' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 18l-2.5 2.5M3.5 16.5l4 4M7 17l8-8M15 9l-2-2 5-5 4 4-5 5-2-2z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h1
          className="font-serif text-4xl"
          style={{ color: '#14130F', lineHeight: 1.1 }}
        >
          {nl.app_name}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#6B6660' }}>
          Volg je behandeling, stap voor stap
        </p>
      </div>

      {/* Form card */}
      <div className="card w-full max-w-sm p-7">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: '#2E2B24' }}
            >
              {nl.email}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: '#2E2B24' }}
            >
              {nl.wachtwoord}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <p role="alert" className="mb-4 text-sm" style={{ color: '#A52020' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{ borderRadius: '10px', padding: '.75rem 1.25rem', fontSize: '1rem' }}
          >
            {loading ? nl.laden : nl.inloggen}
          </button>
        </form>
      </div>
    </main>
  )
}
