'use server'

import { createClient } from '@/lib/supabase/server'
import { createBraai } from '@/lib/services/braai-service'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Json } from '@/lib/types/database.types'

const supplyItemSchema = z.object({
  item_name: z.string().min(1),
  category: z.string().min(1),
  provided_by: z.enum(['organiser', 'needed']),
})

const createBraaiSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(500).optional(),
  date_mode: z.enum(['fixed', 'poll']),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  poll_dates: z.array(z.string()).min(2).max(5).optional(),
  venue_name: z.string().min(1, 'Venue name is required').max(120),
  venue_address: z.string().min(1, 'Address is required'),
  venue_lat: z.number().optional(),
  venue_lng: z.number().optional(),
  supply_mode: z.enum(['byo', 'shared']),
  max_attendees: z.number().int().positive().optional(),
  event_options: z.record(z.string(), z.unknown()).optional(),
  supply_items: z.array(supplyItemSchema).optional(),
})

export type CreateBraaiFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function createBraaiAction(
  _prevState: CreateBraaiFormState,
  formData: FormData
): Promise<CreateBraaiFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Parse event_options from JSON string
  let eventOptions: Record<string, unknown> = {}
  const eventOptionsRaw = formData.get('event_options')
  if (eventOptionsRaw && typeof eventOptionsRaw === 'string') {
    try {
      eventOptions = JSON.parse(eventOptionsRaw)
    } catch {
      // ignore malformed — use defaults
    }
  }

  // Parse supply items from JSON string
  let supplyItems: z.infer<typeof supplyItemSchema>[] = []
  const supplyItemsRaw = formData.get('supply_items')
  if (supplyItemsRaw && typeof supplyItemsRaw === 'string') {
    try {
      supplyItems = JSON.parse(supplyItemsRaw)
    } catch {
      // ignore malformed
    }
  }

  // Parse poll dates from JSON string
  let pollDates: string[] = []
  const pollDatesRaw = formData.get('poll_dates')
  if (pollDatesRaw && typeof pollDatesRaw === 'string') {
    try {
      pollDates = JSON.parse(pollDatesRaw)
    } catch {
      // ignore malformed
    }
  }

  const raw = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    date_mode: formData.get('date_mode'),
    event_date: formData.get('event_date') || undefined,
    event_time: formData.get('event_time') || undefined,
    poll_dates: pollDates.length > 0 ? pollDates : undefined,
    venue_name: formData.get('venue_name'),
    venue_address: formData.get('venue_address'),
    venue_lat: formData.get('venue_lat')
      ? Number(formData.get('venue_lat'))
      : undefined,
    venue_lng: formData.get('venue_lng')
      ? Number(formData.get('venue_lng'))
      : undefined,
    supply_mode: formData.get('supply_mode'),
    max_attendees: formData.get('max_attendees')
      ? Number(formData.get('max_attendees'))
      : undefined,
    event_options: eventOptions,
    supply_items: supplyItems,
  }

  const parsed = createBraaiSchema.safeParse(raw)

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  // Extra validation: fixed date mode needs event_date
  if (parsed.data.date_mode === 'fixed' && !parsed.data.event_date) {
    return {
      fieldErrors: { event_date: ['Date is required for a fixed date braai'] },
    }
  }

  const { data: braai, error } = await createBraai(user.id, {
    ...parsed.data,
    event_options: (parsed.data.event_options ?? {}) as Json,
  })

  if (error || !braai) {
    return { error: error ?? 'Failed to create braai. Please try again.' }
  }

  redirect(`/dashboard/braai/${braai.id}`)
}
