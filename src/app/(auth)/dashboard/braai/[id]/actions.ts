'use server'

import { createClient } from '@/lib/supabase/server'
import { cancelBraai, confirmPollDate } from '@/lib/services/braai-service'
import { updateBraai } from '@/lib/repositories/braai-repository'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Json } from '@/lib/types/database.types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Cancel braai ─────────────────────────────────────────────────────────────

export type ActionState = { error?: string; success?: boolean }

export async function cancelBraaiAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const braaiId = formData.get('braai_id') as string
  const { error } = await cancelBraai(braaiId)
  if (error) return { error }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ── Confirm poll date ─────────────────────────────────────────────────────────

export async function confirmPollDateAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const braaiId = formData.get('braai_id') as string
  const confirmedDate = formData.get('confirmed_date') as string

  if (!confirmedDate) return { error: 'No date selected' }

  const { error } = await confirmPollDate(braaiId, confirmedDate)
  if (error) return { error }

  revalidatePath(`/dashboard/braai/${braaiId}`)
  return { success: true }
}

// ── Update braai ──────────────────────────────────────────────────────────────

const updateBraaiSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  venue_name: z.string().min(1).max(120),
  venue_address: z.string().min(1),
  venue_lat: z.number().optional(),
  venue_lng: z.number().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  max_attendees: z.number().int().positive().optional(),
  event_options: z.record(z.string(), z.unknown()).optional(),
})

export async function updateBraaiAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const braaiId = formData.get('braai_id') as string

  let eventOptions: Record<string, unknown> = {}
  const rawOptions = formData.get('event_options')
  if (rawOptions) { try { eventOptions = JSON.parse(rawOptions as string) } catch { /**/ } }

  const raw = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    venue_name: formData.get('venue_name'),
    venue_address: formData.get('venue_address'),
    venue_lat: formData.get('venue_lat') ? Number(formData.get('venue_lat')) : undefined,
    venue_lng: formData.get('venue_lng') ? Number(formData.get('venue_lng')) : undefined,
    event_date: formData.get('event_date') || undefined,
    event_time: formData.get('event_time') || undefined,
    max_attendees: formData.get('max_attendees') ? Number(formData.get('max_attendees')) : undefined,
    event_options: eventOptions,
  }

  const parsed = updateBraaiSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Invalid form data' }

  const { error } = await updateBraai(braaiId, {
    ...parsed.data,
    event_options: (parsed.data.event_options ?? {}) as Json,
  })
  if (error) return { error }

  revalidatePath(`/dashboard/braai/${braaiId}`)
  redirect(`/dashboard/braai/${braaiId}`)
}
