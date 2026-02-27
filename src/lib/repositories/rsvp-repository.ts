import { createClient } from '@/lib/supabase/server'
import type { Rsvp, RsvpInsert, RsvpUpdate } from '@/lib/types'

export async function createRsvp(
  input: RsvpInsert
): Promise<{ data: Rsvp | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('[rsvp-repository] createRsvp:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateRsvp(
  id: string,
  input: RsvpUpdate
): Promise<{ data: Rsvp | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[rsvp-repository] updateRsvp:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getRsvpsByBraai(
  braaiId: string
): Promise<{ data: Rsvp[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('braai_id', braaiId)
    .eq('status', 'attending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[rsvp-repository] getRsvpsByBraai:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function getRsvpByToken(
  braaiId: string,
  browserToken: string
): Promise<{ data: Rsvp | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('braai_id', braaiId)
    .eq('browser_token', browserToken)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[rsvp-repository] getRsvpByToken:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data ?? null, error: null }
}
