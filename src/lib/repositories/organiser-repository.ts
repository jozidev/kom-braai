import { createClient } from '@/lib/supabase/server'
import type { Organiser, OrganiserInsert, OrganiserUpdate } from '@/lib/types'

export async function getOrganiserById(
  id: string
): Promise<{ data: Organiser | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organisers')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found — not a real error here
    console.error('[organiser-repository] getOrganiserById:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data ?? null, error: null }
}

export async function createOrganiser(
  input: OrganiserInsert
): Promise<{ data: Organiser | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organisers')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('[organiser-repository] createOrganiser:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateOrganiser(
  id: string,
  input: OrganiserUpdate
): Promise<{ data: Organiser | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organisers')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[organiser-repository] updateOrganiser:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
