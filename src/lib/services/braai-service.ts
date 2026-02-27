import { createBraai as createBraaiRecord, cancelBraai as cancelBraaiRecord, slugExists } from '@/lib/repositories/braai-repository'
import { createSupplyItems } from '@/lib/repositories/supply-repository'
import { createPollOptions } from '@/lib/repositories/date-poll-repository'
import { confirmDate } from '@/lib/repositories/date-poll-repository'
import { generateSlug } from '@/lib/utils/slug'
import { getDefaultEventOptions } from '@/lib/config/event-options'
import type { Braai, CreateBraaiInput } from '@/lib/types'
import type { Json } from '@/lib/types/database.types'

const MAX_SLUG_ATTEMPTS = 5

async function generateUniqueSlug(): Promise<string> {
  for (let i = 0; i < MAX_SLUG_ATTEMPTS; i++) {
    const slug = generateSlug()
    const exists = await slugExists(slug)
    if (!exists) return slug
  }
  // Fallback: timestamp-based slug
  return `braai-${Date.now().toString(36)}`
}

export async function createBraai(
  organiserId: string,
  input: CreateBraaiInput
): Promise<{ data: Braai | null; error: string | null }> {
  const slug = await generateUniqueSlug()

  const { supply_items, poll_dates, ...braaiFields } = input

  const eventOptions = {
    ...getDefaultEventOptions(),
    ...(braaiFields.event_options as Record<string, unknown>),
  }

  const { data: braai, error: braaiError } = await createBraaiRecord({
    ...braaiFields,
    organiser_id: organiserId,
    slug,
    status: 'active',
    event_options: eventOptions as Json,
  })

  if (braaiError || !braai) {
    return { data: null, error: braaiError ?? 'Failed to create braai' }
  }

  // Create supply items if any
  if (supply_items && supply_items.length > 0) {
    const { error: supplyError } = await createSupplyItems(
      supply_items.map((item) => ({ ...item, braai_id: braai.id }))
    )
    if (supplyError) {
      console.error('[braai-service] Failed to create supply items:', supplyError)
      // Non-fatal — braai is still created
    }
  }

  // Create date poll options if poll mode
  if (braai.date_mode === 'poll' && poll_dates && poll_dates.length > 0) {
    const { error: pollError } = await createPollOptions(
      poll_dates.map((date) => ({ braai_id: braai.id, proposed_date: date }))
    )
    if (pollError) {
      console.error('[braai-service] Failed to create poll options:', pollError)
    }
  }

  return { data: braai, error: null }
}

export async function cancelBraai(
  braaiId: string
): Promise<{ error: string | null }> {
  return cancelBraaiRecord(braaiId)
}

export async function confirmPollDate(
  braaiId: string,
  confirmedDate: string
): Promise<{ error: string | null }> {
  return confirmDate(braaiId, confirmedDate)
}
