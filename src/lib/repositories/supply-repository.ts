import { createClient } from '@/lib/supabase/server'
import type { SupplyItem, SupplyItemInsert } from '@/lib/types'

export async function createSupplyItems(
  items: SupplyItemInsert[]
): Promise<{ data: SupplyItem[]; error: string | null }> {
  if (items.length === 0) return { data: [], error: null }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('supply_items')
    .insert(items)
    .select()

  if (error) {
    console.error('[supply-repository] createSupplyItems:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function getSupplyItemsByBraai(
  braaiId: string
): Promise<{ data: SupplyItem[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('supply_items')
    .select('*')
    .eq('braai_id', braaiId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[supply-repository] getSupplyItemsByBraai:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function claimItem(
  itemId: string,
  claimedByName: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('supply_items')
    .update({ provided_by: 'claimed', claimed_by_name: claimedByName })
    .eq('id', itemId)
    .eq('provided_by', 'needed') // only claim if still available

  if (error) {
    console.error('[supply-repository] claimItem:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

export async function unclaimItem(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('supply_items')
    .update({ provided_by: 'needed', claimed_by_name: null })
    .eq('id', itemId)
    .eq('provided_by', 'claimed')

  if (error) {
    console.error('[supply-repository] unclaimItem:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

export async function addSupplyItem(
  item: SupplyItemInsert
): Promise<{ data: SupplyItem | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('supply_items')
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('[supply-repository] addSupplyItem:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function deleteSupplyItem(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Only allow deleting organiser-provided or still-needed items (not claimed by a guest)
  const { error } = await supabase
    .from('supply_items')
    .delete()
    .eq('id', itemId)
    .in('provided_by', ['organiser', 'needed'])

  if (error) {
    console.error('[supply-repository] deleteSupplyItem:', error.message)
    return { error: error.message }
  }

  return { error: null }
}
