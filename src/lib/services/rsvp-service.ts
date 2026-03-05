import {
  createRsvp,
  updateRsvp,
  getRsvpByToken,
} from '@/lib/repositories/rsvp-repository'
import { claimItem, unclaimItem } from '@/lib/repositories/supply-repository'
import { getBraaiById } from '@/lib/repositories/braai-repository'
import type { Rsvp, CreateRsvpInput } from '@/lib/types'

export async function submitRsvp(
  input: CreateRsvpInput
): Promise<{ data: Rsvp | null; error: string | null }> {
  // Check max_attendees if set
  const { data: braai } = await getBraaiById(input.braai_id)
  if (braai?.max_attendees) {
    const currentTotal = braai.rsvps
      .filter((r) => r.status === 'attending')
      .reduce((sum, r) => sum + r.attendee_count, 0)
    if (currentTotal + input.attendee_count > braai.max_attendees) {
      return {
        data: null,
        error: `Sorry, this braai is full (max ${braai.max_attendees} people).`,
      }
    }
  }

  // If they previously declined or cancelled, update the existing record
  const { data: existing } = await getRsvpByToken(input.braai_id, input.browser_token)
  if (existing && (existing.status === 'declined' || existing.status === 'cancelled')) {
    const { data: rsvp, error } = await updateRsvp(existing.id, {
      status: 'attending',
      attendee_name: input.attendee_name,
      attendee_count: input.attendee_count,
    })
    if (error || !rsvp) return { data: null, error: error ?? 'Failed to submit RSVP' }
    if (input.claimed_item_ids && input.claimed_item_ids.length > 0) {
      await Promise.all(
        input.claimed_item_ids.map((itemId) => claimItem(itemId, input.attendee_name))
      )
    }
    return { data: rsvp, error: null }
  }

  const { data: rsvp, error } = await createRsvp({
    braai_id: input.braai_id,
    attendee_name: input.attendee_name,
    attendee_count: input.attendee_count,
    browser_token: input.browser_token,
    status: 'attending',
  })

  if (error || !rsvp) {
    return { data: null, error: error ?? 'Failed to submit RSVP' }
  }

  // Claim supply items if provided
  if (input.claimed_item_ids && input.claimed_item_ids.length > 0) {
    await Promise.all(
      input.claimed_item_ids.map((itemId) => claimItem(itemId, input.attendee_name))
    )
  }

  return { data: rsvp, error: null }
}

export async function updateRsvpDetails(
  rsvpId: string,
  attendeeCount: number,
  newClaimedIds: string[],
  oldClaimedIds: string[],
  attendeeName: string
): Promise<{ data: Rsvp | null; error: string | null }> {
  // Unclaim items no longer wanted
  const toUnclaim = oldClaimedIds.filter((id) => !newClaimedIds.includes(id))
  const toClaim = newClaimedIds.filter((id) => !oldClaimedIds.includes(id))

  await Promise.all(toUnclaim.map(unclaimItem))
  await Promise.all(toClaim.map((id) => claimItem(id, attendeeName)))

  return updateRsvp(rsvpId, { attendee_count: attendeeCount })
}

export async function cancelRsvp(
  braaiId: string,
  browserToken: string
): Promise<{ error: string | null }> {
  const { data: rsvp } = await getRsvpByToken(braaiId, browserToken)
  if (!rsvp) return { error: 'RSVP not found' }

  const { error } = await updateRsvp(rsvp.id, { status: 'cancelled' })
  return { error }
}

export async function declineRsvp(
  braaiId: string,
  browserToken: string,
  attendeeName: string
): Promise<{ error: string | null }> {
  const { data: existing } = await getRsvpByToken(braaiId, browserToken)

  if (existing) {
    const { error } = await updateRsvp(existing.id, {
      status: 'declined',
      attendee_name: attendeeName,
    })
    return { error }
  }

  const { error } = await createRsvp({
    braai_id: braaiId,
    attendee_name: attendeeName,
    attendee_count: 1,
    browser_token: browserToken,
    status: 'declined',
  })
  return { error }
}
