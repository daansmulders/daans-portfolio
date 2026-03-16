import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { nl } from '../i18n/nl'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'patient' | 'doctor'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{nl.laden}</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  if (requiredRole && role !== requiredRole) {
    // Verkeerde rol: stuur terug naar de juiste startpagina
    return <Navigate to={role === 'doctor' ? '/dokter/overzicht' : '/patient/dashboard'} replace />
  }

  return <>{children}</>
}
