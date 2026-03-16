import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { nl } from '../i18n/nl'

export function Navigation() {
  const { role, signOut } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`

  return (
    <nav
      className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"
      aria-label="Hoofdnavigatie"
    >
      <span className="font-semibold text-gray-900">{nl.app_name}</span>

      <div className="flex items-center gap-1">
        {role === 'patient' && (
          <>
            <NavLink to="/patient/dashboard" className={linkClass}>{nl.nav_dashboard}</NavLink>
            <NavLink to="/patient/medicatie" className={linkClass}>{nl.nav_medicatie}</NavLink>
            <NavLink to="/patient/meldingen" className={linkClass}>{nl.nav_melden}</NavLink>
            <NavLink to="/patient/inhoud" className={linkClass}>{nl.nav_inhoud}</NavLink>
          </>
        )}
        {role === 'doctor' && (
          <NavLink to="/dokter/overzicht" className={linkClass}>{nl.nav_patienten}</NavLink>
        )}
        <button
          onClick={() => signOut()}
          className="ml-4 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {nl.uitloggen}
        </button>
      </div>
    </nav>
  )
}
