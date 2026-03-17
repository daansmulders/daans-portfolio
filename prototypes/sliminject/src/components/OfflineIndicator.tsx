import { useState, useEffect } from 'react'
import { nl } from '../i18n/nl'

function IconWifiOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 1l14 14M10.6 6.4A6 6 0 0 1 13.5 8L15 6.5A8 8 0 0 0 8 4c-.9 0-1.8.15-2.6.43M5.1 5.1A6 6 0 0 0 2.5 8L1 6.5a8 8 0 0 1 4.1-2.4M8 10a2 2 0 0 1 1.41.59L11 9A4 4 0 0 0 8 8c-.48 0-.94.085-1.37.24M5 9a4 4 0 0 0-.94.59L5.6 11.2A2 2 0 0 1 8 10M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div role="status" aria-live="polite" className="offline-bar">
      <IconWifiOff />
      {nl.offline_indicator}
    </div>
  )
}
