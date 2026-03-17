import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useUrgentConcerns } from '../hooks/useUrgentConcerns'
import { nl } from '../i18n/nl'

/* ── Icons ─────────────────────────────────────────────── */
function IconGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="12" y="2" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="2" y="12" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="12" y="12" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  )
}
function IconSyringe() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M7 15l-3.5 3.5M4.5 13.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 14l6-6m0 0l-2-2 4-4 4 4-4 4-2-2zm0 0l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2a6 6 0 0 0-6 6c0 3.5-1.5 5-1.5 5h15s-1.5-1.5-1.5-5a6 6 0 0 0-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12.8 18a1.8 1.8 0 0 1-3.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 4.5C9.5 3.5 7.5 3 5 3v14c2.5 0 4.5.5 6 1.5V4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M11 4.5C12.5 3.5 14.5 3 17 3v14c-2.5 0-4.5.5-6 1.5V4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M2 19c0-3.6 2.9-6.5 6.5-6.5S15 15.4 15 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14.5 4.5a3.5 3.5 0 0 1 0 7M19 19c0-2.8-1.8-5.2-4.5-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

export function Navigation() {
  const { role, signOut } = useAuth()
  const { urgentCount, clearUrgent } = useUrgentConcerns()
  const location = useLocation()

  // Clear badge when doctor navigates to the overview
  useEffect(() => {
    if (role === 'doctor' && location.pathname.startsWith('/dokter/overzicht')) {
      clearUrgent()
    }
  }, [location.pathname, role, clearUrgent])

  /* ── Patient: bottom tab bar ─────────────────────── */
  if (role === 'patient') {
    return (
      <nav className="bottom-nav" aria-label="Navigatie">
        <NavLink
          to="/patient/dashboard"
          className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
        >
          <IconGrid />
          <span>{nl.nav_dashboard}</span>
        </NavLink>
        <NavLink
          to="/patient/medicatie"
          className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
        >
          <IconSyringe />
          <span>{nl.nav_medicatie}</span>
        </NavLink>
        <NavLink
          to="/patient/meldingen"
          className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
        >
          <IconBell />
          <span>{nl.nav_melden}</span>
        </NavLink>
        <NavLink
          to="/patient/inhoud"
          className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
        >
          <IconBook />
          <span>{nl.nav_inhoud}</span>
        </NavLink>
      </nav>
    )
  }

  /* ── Doctor: top bar ─────────────────────────────── */
  if (role === 'doctor') {
    return (
      <header className="top-nav" aria-label="Navigatie">
        <span
          className="font-serif text-xl"
          style={{ color: '#2D7A5E' }}
        >
          {nl.app_name}
        </span>
        <div className="flex items-center gap-1">
          <NavLink
            to="/dokter/overzicht"
            className={({ isActive }) =>
              `btn btn-ghost btn-sm relative${isActive ? ' !text-brand-600 !bg-brand-50' : ''}`
            }
            style={({ isActive }) => isActive ? { color: '#2D7A5E', background: '#EDF7F4' } : {}}
          >
            <IconUsers />
            {nl.nav_patienten}
            {urgentCount > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                style={{ background: '#A52020', fontSize: '10px' }}
                aria-label={`${urgentCount} urgente melding${urgentCount > 1 ? 'en' : ''}`}
              >
                {urgentCount}
              </span>
            )}
          </NavLink>
          <button
            onClick={() => signOut()}
            className="btn btn-ghost btn-sm ml-2"
            style={{ fontSize: '.8125rem' }}
          >
            {nl.uitloggen}
          </button>
        </div>
      </header>
    )
  }

  return null
}
