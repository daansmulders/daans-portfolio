import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Subscribes to Supabase Realtime on the `concerns` table.
 * Tracks the number of urgent concerns inserted since the hook mounted.
 * The doctor can call clearUrgent() after reviewing.
 */
export function useUrgentConcerns() {
  const [urgentCount, setUrgentCount] = useState(0)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('urgent-concerns')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'concerns',
          filter: 'severity=eq.urgent',
        },
        () => {
          setUrgentCount(n => n + 1)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function clearUrgent() {
    setUrgentCount(0)
  }

  return { urgentCount, clearUrgent }
}
