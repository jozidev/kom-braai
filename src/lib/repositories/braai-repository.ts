import { createClient } from '@/lib/supabase/server'
import type { Braai, BraaiInsert, BraaiUpdate, BraaiWithDetails } from '@/lib/types'

export async function createBraai(
  input: BraaiInsert
): Promise<{ data: Braai | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('braais')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('[braai-repository] createBraai:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getBraaiById(
  id: string
): Promise<{ data: BraaiWithDetails | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('braais')
    .select(
      `
      *,
      organiser:organisers(*),
      supply_items(*),
      rsvps(*),
      date_poll_options(*, date_poll_votes(*))
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('[braai-repository] getBraaiById:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data as BraaiWithDetails, error: null }
}

export async function getBraaiBySlug(
  slug: string
): Promise<{ data: BraaiWithDetails | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('braais')
    .select(
      `
      *,
      organiser:organisers(*),
      supply_items(*),
      rsvps(*),
      date_poll_options(*, date_poll_votes(*))
    `
    )
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[braai-repository] getBraaiBySlug:', error.message)
    return { data: null, error: error.message }
  }

  return { data: (data as BraaiWithDetails) ?? null, error: null }
}

export async function getBraaisByOrganiser(
  organiserId: string
): Promise<{ data: Braai[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('braais')
    .select('*')
    .eq('organiser_id', organiserId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[braai-repository] getBraaisByOrganiser:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function updateBraai(
  id: string,
  input: BraaiUpdate
): Promise<{ data: Braai | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('braais')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[braai-repository] updateBraai:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function cancelBraai(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('braais')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[braai-repository] cancelBraai:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

export async function slugExists(slug: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('braais')
    .select('id')
    .eq('slug', slug)
    .single()

  return !!data
}
