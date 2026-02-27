'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type RealtimeRefresherProps = {
  braaiId: string
}

/**
 * Invisible component that subscribes to RSVP and supply item changes
 * for this braai and triggers a router.refresh() so the server component
 * re-fetches fresh data without a full page reload.
 */
export function RealtimeRefresher({ braaiId }: RealtimeRefresherProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`braai-live:${braaiId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
          filter: `braai_id=eq.${braaiId}`,
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'supply_items',
          filter: `braai_id=eq.${braaiId}`,
        },
        () => router.refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [braaiId, router])

  return null
}
